import React, { useState, useMemo } from 'react';
import { QCReport } from '../types';
import { QC_QUESTIONS } from '../data';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  BarChart3, PieChart as PieIcon, ShieldCheck, Activity, 
  ShieldAlert, Hospital, Search, RefreshCw, Eye, Trash2, Calendar, FileText
} from 'lucide-react';
import { ReportSummary } from './ReportSummary';

interface AdminDashboardProps {
  reports: QCReport[];
  onDeleteReport: (id: string) => void;
  onUpdateReport: (updatedReport: QCReport) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onDeleteReport,
  onUpdateReport,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all');
  const [selectedReportForView, setSelectedReportForView] = useState<QCReport | null>(null);

  // Calculation of KPIs
  const totalTests = reports.length;
  const passTests = useMemo(() => reports.filter(r => r.conclusion === 'pass').length, [reports]);
  const failTests = totalTests - passTests;
  const passRate = totalTests > 0 ? Math.round((passTests / totalTests) * 100) : 0;

  const uniqueMonitors = useMemo(() => {
    const set = new Set(reports.map(r => `${r.hospitalName}-${r.monitorNo}`));
    return set.size;
  }, [reports]);

  const uniqueHospitals = useMemo(() => {
    const set = new Set(reports.map(r => r.hospitalName));
    return set.size;
  }, [reports]);

  // Data for Pass vs Fail Pie Chart
  const pieData = useMemo(() => [
    { name: 'ผ่านเกณฑ์ (Pass)', value: passTests, color: '#10b981' },
    { name: 'ไม่ผ่านเกณฑ์ (Fail)', value: failTests, color: '#ef4444' }
  ], [passTests, failTests]);

  // Data for Failures Per Question (Bar Chart)
  // We want to count how many times each question (1 to 8) was failed (answer === false)
  const failureChartData = useMemo(() => {
    const counts = Array(8).fill(0);
    reports.forEach(r => {
      r.answers.forEach((ans, idx) => {
        if (ans === false) {
          counts[idx] += 1;
        }
      });
    });

    return QC_QUESTIONS.map((q, idx) => ({
      questionShort: `Q${q.step}`,
      questionName: q.criteria,
      failures: counts[idx]
    }));
  }, [reports]);

  // Filtered reports for the history list
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = 
        r.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.monitorNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'pass' && r.conclusion === 'pass') ||
        (statusFilter === 'fail' && r.conclusion === 'fail');

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchTerm, statusFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
      
      {/* Upper header action area */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-600 font-bold">สรุปสถิติผู้ใช้งานส่วนกลาง</span>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-[#4a729e]" />
            แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded shadow-sm text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            ดึงข้อมูลใหม่
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">รายงานตรวจสอบรวม</span>
            <span className="text-2xl font-black text-slate-800">{totalTests}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">ฉบับบันทึกประวัติ</span>
          </div>
        </div>

        {/* Card 2: Pass Rate Percentage */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3.5 rounded-xl ${passRate >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">อัตราการผ่านเกณฑ์</span>
            <span className="text-2xl font-black text-slate-800">{passRate}%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">เฉลี่ยเครื่องที่ผ่านมาตรฐาน</span>
          </div>
        </div>

        {/* Card 3: Monitored Screens */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">จำนวนจอภาพที่ตรวจ</span>
            <span className="text-2xl font-black text-slate-800">{uniqueMonitors}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">จอภาพที่ไม่ซ้ำกัน</span>
          </div>
        </div>

        {/* Card 4: Active Hospitals */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
            <Hospital className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase block">โรงพยาบาลที่เชื่อมต่อ</span>
            <span className="text-2xl font-black text-slate-800">{uniqueHospitals}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">แห่งที่บันทึกข้อมูลสำเร็จ</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout (2 columns) */}
      {totalTests > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Left: Pie Status */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <PieIcon className="h-4 w-4 text-emerald-500" />
                สัดส่วนผลการทดสอบสะสม
              </h3>
            </div>
            
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif', fontSize: '12px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconSize={10} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 text-center">
              ผ่านการตรวจสอบ <strong className="text-emerald-600">{passTests} เครื่อง</strong> และ ไม่ผ่านการตรวจสอบ <strong className="text-red-500">{failTests} เครื่อง</strong> จากทั้งหมด
            </div>
          </div>

          {/* Chart Right: Failures breakdown by question parameter */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-2">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-red-500" />
                จำนวนการตรวจไม่ผ่านมาตรฐาน แยกรายข้อ (Failure Parameters Breakdown)
              </h3>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="questionShort" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif', fontSize: '11px' }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} เครื่อง (ไม่ผ่าน)`, 
                      `หัวข้อ: ${props.payload.questionName}`
                    ]}
                  />
                  <Bar dataKey="failures" fill="#f87171" radius={[4, 4, 0, 0]}>
                    {failureChartData.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.failures > 0 ? '#ef4444' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] text-slate-400 text-right mt-1">
              * Q1: ส่องสว่าง, Q2: คอนทราสต์มืด, Q3: คอนทราสต์สว่าง, Q4: ตัวอักษร, Q5: Resolution, Q6: Video, Q7: เฉดสี, Q8: Cross talk
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
          ไม่มีข้อมูลการวิจัยในขณะนี้ กรุณาทำการตรวจคุณภาพหน้าจอและกดบันทึกผลการทดสอบเสียก่อน
        </div>
      )}

      {/* History Log Table & Filter Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Search & Filter Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 text-base">
            ประวัติการทดสอบคุณภาพหน้าจอเรียลไทม์ (Inspection History Logs)
          </h3>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาตาม รพ./หมายเลขจอ/ผู้ตรวจ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded transition ${statusFilter === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setStatusFilter('pass')}
                className={`px-3 py-1.5 rounded transition ${statusFilter === 'pass' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:text-emerald-600'}`}
              >
                ผ่าน
              </button>
              <button
                onClick={() => setStatusFilter('fail')}
                className={`px-3 py-1.5 rounded transition ${statusFilter === 'fail' ? 'bg-red-500 text-white shadow' : 'text-slate-500 hover:text-red-500'}`}
              >
                ไม่ผ่าน
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase">
                <th className="py-3 px-4">วันที่ตรวจสอบ</th>
                <th className="py-3 px-4">รหัสรายงาน</th>
                <th className="py-3 px-4">ชื่อโรงพยาบาล</th>
                <th className="py-3 px-4">หมายเลขจอภาพ</th>
                <th className="py-3 px-4">ผู้ตรวจ</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4">บันทึกย่อ</th>
                <th className="py-3 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50 transition duration-150">
                    <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {report.testDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-500">{report.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{report.hospitalName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">{report.monitorNo}</td>
                    <td className="py-3 px-4 text-slate-600">{report.inspectorName}</td>
                    <td className="py-3 px-4 text-center">
                      {report.conclusion === 'pass' ? (
                        <span className="text-green-800 bg-green-100 border border-green-200 font-bold px-2 py-0.5 rounded text-[11px]">
                          ผ่านเกณฑ์
                        </span>
                      ) : (
                        <span className="text-red-800 bg-red-100 border border-red-200 font-bold px-1.5 py-0.5 rounded text-[11px]">
                          ไม่ผ่านเกณฑ์
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate" title={report.notes}>
                      {report.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReportForView(report)}
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition cursor-pointer"
                          title="ดูและพิมพ์ผลการรายงาน"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`คุณต้องการลบข้อมูลรายงานตรวจสอบรหัส ${report.id} ใช่หรือไม่? การลบข้อมูลไม่สามารถกู้กลับคืนได้`)) {
                              onDeleteReport(report.id);
                            }
                          }}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition cursor-pointer"
                          title="ลบข้อมูลประวัติ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-sm font-medium">
                    ไม่พบบันทึกการตรวจสอบเครื่องมือในระบบที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal view for showing past reports detail */}
      {selectedReportForView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden my-8">
            <button
              onClick={() => setSelectedReportForView(null)}
              className="absolute right-4 top-4 z-10 text-white hover:text-slate-200 font-bold bg-slate-800/40 hover:bg-slate-800/60 p-2 rounded-full h-8 w-8 flex items-center justify-center cursor-pointer text-sm"
              title="ปิดหน้าต่างรายงาน"
            >
              ✕
            </button>
            <ReportSummary
              report={selectedReportForView}
              onSaveReport={(updated) => {
                onUpdateReport(updated);
                setSelectedReportForView(updated);
              }}
              onClose={() => setSelectedReportForView(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
