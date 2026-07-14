import React, { useState, useEffect } from 'react';
import { QCReport } from '../types';
import { QC_QUESTIONS } from '../data';
import { CheckCircle, XCircle, Printer, FileText, Check, Save } from 'lucide-react';

interface ReportSummaryProps {
  report: QCReport;
  onSaveReport: (updatedReport: QCReport) => void;
  onClose: () => void;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({
  report,
  onSaveReport,
  onClose,
}) => {
  const [hospitalName, setHospitalName] = useState(report.hospitalName);
  const [monitorNo, setMonitorNo] = useState(report.monitorNo);
  const [notes, setNotes] = useState(report.notes || '');
  const [isSaved, setIsSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [hasGasUrl, setHasGasUrl] = useState(false);

  // Check if Google Sheet Web App URL exists
  useEffect(() => {
    const gasUrl = localStorage.getItem('tg18_gas_url');
    if (gasUrl) {
      setHasGasUrl(true);
    }
  }, []);

  // Set default notes/summary if empty
  useEffect(() => {
    if (!report.notes) {
      const failedSteps = report.answers
        .map((ans, idx) => (ans ? null : idx + 1))
        .filter((val) => val !== null);

      if (failedSteps.length === 0) {
        setNotes('ผ่านเกณฑ์มาตรฐานการตรวจสอบคุณภาพหน้าจอแสดงผลทางการแพทย์ (AAPM TG18-QC) ทุกข้อ ภาพแสดงผลคมชัด รายละเอียดเฉดสว่างและมืดถูกต้อง ครบถ้วน');
      } else {
        setNotes(
          `ไม่ผ่านเกณฑ์การตรวจสอบในข้อที่ ${failedSteps.join(', ')} แนะนำให้ทำการส่งซ่อมบำรุง ตรวจสภาพการสะท้อนหน้าจอ หรือทำสีการปรับเทียบคุณภาพใหม่`
        );
      }
    }
  }, [report.answers, report.notes]);

  const handleSave = async () => {
    const updatedReport = {
      ...report,
      hospitalName,
      monitorNo,
      notes,
    };

    onSaveReport(updatedReport);
    setIsSaved(true);

    const gasUrl = localStorage.getItem('tg18_gas_url');
    if (gasUrl) {
      setSyncStatus('syncing');
      try {
        const payload = {
          id: updatedReport.id,
          hospitalName: updatedReport.hospitalName,
          monitorNo: updatedReport.monitorNo,
          inspectorName: updatedReport.inspectorName,
          testDate: updatedReport.testDate,
          answers: updatedReport.answers,
          conclusion: updatedReport.conclusion,
          comments: updatedReport.notes || ""
        };

        await fetch(gasUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        setSyncStatus('success');
      } catch (err) {
        console.error('Error syncing with Google Sheets:', err);
        setSyncStatus('error');
      }
    }

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 md:p-4 animate-fade-in print:p-0 print:bg-white print:text-black">
      {/* Printable Area Wrapper */}
      <div className="bg-slate-50 rounded-lg border border-slate-200/80 shadow-none overflow-hidden print:border-none print:shadow-none print:bg-white">
        
        {/* Title Bar matching screenshots */}
        <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between border-b border-slate-700 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" />
            <h1 className="font-bold text-xs md:text-sm">การตรวจสอบคุณภาพหน้าจอแสดงผลทางการแพทย์</h1>
          </div>
          <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded font-mono tracking-wider font-extrabold border border-slate-700 text-slate-300">AAPM TG18-QC REPORT</span>
        </div>

        {/* Outer Grid */}
        <div className="p-3 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5 print:p-0 print:gap-4 print:block">
          
          {/* LEFT COLUMN: Evaluation & Analysis List (7 cols) */}
          <div className="lg:col-span-7 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-none print:border-none print:shadow-none print:p-0 print:mb-4">
            
            <div className="border-b border-slate-100 pb-2.5 mb-2.5 flex items-center justify-between">
              <h2 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5 print:text-black print:text-lg">
                การวิเคราะห์ (Analysis)
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-slate-400 print:hidden">ผลการตรวจสอบ :</span>
                {report.answers.every((ans) => ans) ? (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-green-200/60">
                    <CheckCircle className="h-3 w-3 fill-green-100" />
                    เสร็จสมบูรณ์ (ผ่านเกณฑ์)
                  </span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-red-200/60">
                    <XCircle className="h-3 w-3 fill-red-100" />
                    ควรปรับปรุงหน้าจอ
                  </span>
                )}
              </div>
            </div>

            {/* Steps Checklist Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200/60 print:bg-slate-200 print:text-black">
                    <th className="py-1.5 px-2 text-center font-bold w-10 text-[11px]">คำถาม</th>
                    <th className="py-1.5 px-3 text-center font-bold w-20 text-[11px]">คำตอบ</th>
                    <th className="py-1.5 px-3 font-bold text-slate-700 text-[11px]">หัวข้อที่ตรวจสอบ (Criteria Evaluated)</th>
                  </tr>
                </thead>
                <tbody>
                  {QC_QUESTIONS.map((q, idx) => {
                    const ans = report.answers[idx];
                    return (
                      <tr
                        key={`report-step-${idx}`}
                        className={`border-b border-slate-100/60 hover:bg-slate-50/50 transition duration-150 ${
                          ans ? '' : 'bg-red-50/30 print:bg-red-50/10'
                        }`}
                      >
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-500 text-[11px]">{q.step}</td>
                        <td className="py-1.5 px-3 text-center">
                          {ans ? (
                            <span className="text-green-700 bg-green-50 border border-green-200/60 font-bold px-1.5 py-0.2 rounded text-[10px]">
                              ผ่าน
                            </span>
                          ) : (
                            <span className="text-red-700 bg-red-50 border border-red-200/60 font-bold px-1.5 py-0.2 rounded text-[10px]">
                              ไม่ผ่าน
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-slate-700">
                          <div className="font-bold text-slate-800 text-[11px]">{q.criteria}</div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight print:text-slate-600 mt-0.5">
                            {q.title.split(': ')[1]}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* RIGHT COLUMN: Metadata details & Summary Input (5 cols) */}
          <div className="lg:col-span-5 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-none print:border-none print:shadow-none print:p-0 flex flex-col justify-between">
            
            <div className="space-y-3.5">
              <h2 className="text-xs md:text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 print:text-black print:text-lg">
                ข้อมูลสถานพยาบาล / ผู้ใช้งาน
              </h2>

              <div className="space-y-2.5">
                {/* Hospital Name (Editable) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ชื่อโรงพยาบาล :</label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-250 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 print:border-none print:p-0 print:font-semibold print:text-sm"
                  />
                </div>

                {/* Monitor ID (Editable) */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">หมายเลขจอภาพ :</label>
                  <input
                    type="text"
                    value={monitorNo}
                    onChange={(e) => setMonitorNo(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-250 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 print:border-none print:p-0 print:font-semibold print:text-sm"
                  />
                </div>

                {/* Inspector (Read Only) */}
                <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded border border-slate-150 text-xs print:bg-transparent print:border-none print:p-0">
                  <span className="font-semibold text-slate-500">ผู้ตรวจสอบ :</span>
                  <span className="font-bold text-slate-700 print:text-black">{report.inspectorName}</span>
                </div>

                {/* Inspection Date */}
                <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded border border-slate-150 text-xs print:bg-transparent print:border-none print:p-0">
                  <span className="font-semibold text-slate-500">วันที่ทำการตรวจสอบ :</span>
                  <span className="font-bold text-slate-700">{report.testDate}</span>
                </div>

                {/* Notes/Conclusion Text Area (Editable) */}
                <div className="flex flex-col gap-1 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">สรุปผลการตรวจสอบ / คำแนะนำ :</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="เขียนบันทึกเพิ่มเติมหรือคำแนะจากการตรวจคุณภาพจอภาพ..."
                    className="w-full px-2 py-1.5 bg-white border border-slate-250 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed print:border-none print:p-0 print:text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Google Sheets Sync Status Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 print:hidden text-[11px]">
              {hasGasUrl ? (
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    syncStatus === 'syncing' ? 'bg-sky-500 animate-pulse' :
                    syncStatus === 'success' ? 'bg-green-500' :
                    syncStatus === 'error' ? 'bg-red-500' :
                    'bg-indigo-400'
                  }`} />
                  <span className="font-semibold text-slate-600">สถานะคลาวด์:</span>
                  <span className={`font-bold ${
                    syncStatus === 'syncing' ? 'text-sky-600' :
                    syncStatus === 'success' ? 'text-green-600' :
                    syncStatus === 'error' ? 'text-red-600' :
                    'text-indigo-600'
                  }`}>
                    {syncStatus === 'syncing' && 'กำลังซิงค์และบันทึกข้อมูลเข้า Google Sheet...'}
                    {syncStatus === 'success' && 'บันทึกลง Google Sheet เรียบร้อยแล้ว!'}
                    {syncStatus === 'error' && 'ซิงค์กับ Google Sheet ล้มเหลว โปรดตรวจสอบ URL ของสคริปต์'}
                    {syncStatus === 'idle' && 'เชื่อมโยง Google Sheet แล้ว (ระบบจะส่งผลรายงานไปสเปรดชีตอัตโนมัติเมื่อท่านบันทึก)'}
                  </span>
                </div>
              ) : (
                <div className="text-slate-400 text-[10.5px] italic">
                  💡 คำแนะนำ: ท่านสามารถกด "ตั้งค่า Google Sheet" ที่เมนูด้านบน เพื่อบันทึกผลการประเมินลง Google Sheet แบบออนไลน์ได้โดยอัตโนมัติ
                </div>
              )}
            </div>

            {/* Action Buttons underneath the Right Column */}
            <div className="pt-3.5 border-t border-slate-100 mt-4 flex flex-wrap gap-2 justify-end print:hidden">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-250 rounded text-[11px] font-bold cursor-pointer transition shadow-none"
              >
                ปิดหน้าต่าง
              </button>

              {/* Save Report */}
              <button
                type="button"
                onClick={handleSave}
                className={`px-3 py-1.5 text-white rounded text-[11px] font-bold cursor-pointer transition flex items-center gap-1 border ${
                  isSaved
                    ? 'bg-green-600 hover:bg-green-700 border-green-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-700'
                }`}
              >
                {isSaved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                {isSaved ? 'บันทึกเรียบร้อย' : 'บันทึกรายงาน'}
              </button>

              {/* Print Preview Mode / Mockup Trigger */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white border border-sky-700 rounded-sm text-[11px] font-bold cursor-pointer transition shadow-sm flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                พิมพ์รายงาน (PDF)
              </button>
            </div>

          </div>

        </div>

        {/* Footer info showing standard certification lines inside printable document */}
        <div className="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-1.5 print:border-t print:bg-white print:text-black">
          <p>© ระบบมาตรฐานสมาคมนักฟิสิกส์การแพทย์อเมริกัน AAPM TG18-QC | ระบบจัดเก็บข้อมูลกลางอัตโนมัติ</p>
          <div className="flex gap-1.5 print:hidden">
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono border border-slate-250">MD-QC Ver 1.0.0</span>
          </div>
        </div>

      </div>

      {/* Printing layout help */}
      <div className="text-center text-[10px] text-slate-400 mt-2 print:hidden">
        คำแนะนำ: หากต้องการพิมพ์เป็นไฟล์ PDF กรุณาเลือกตัวเลือก "บันทึกเป็น PDF (Save as PDF)" ในหน้าต่างเบราว์เซอร์
      </div>
    </div>
  );
};
