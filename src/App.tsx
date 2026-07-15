import { useState, useEffect } from 'react';
import { UserQCForm } from './components/UserQCForm';
import { ReportSummary } from './components/ReportSummary';
import { GoogleSheetSettingsModal } from './components/GoogleSheetSettingsModal';
import { QCReport } from './types';
import { MOCK_HISTORY } from './data';
import { 
  Monitor, Landmark, Play, 
  Settings, Layers, BookOpen, AlertCircle, Database
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<'home' | 'checklist'>('home');
  const [reports, setReports] = useState<QCReport[]>(MOCK_HISTORY);
  const [currentActiveReport, setCurrentActiveReport] = useState<QCReport | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync URL params for automatic Google Sheet configuration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlSheetId = params.get('sheetId');
    const urlGasUrl = params.get('gasUrl');

    if (urlSheetId || urlGasUrl) {
      if (urlSheetId) {
        localStorage.setItem('tg18_sheet_id', urlSheetId);
        // generate a mockup sheetUrl for the user
        localStorage.setItem('tg18_sheet_url', `https://docs.google.com/spreadsheets/d/${urlSheetId}/edit`);
      }
      if (urlGasUrl) {
        localStorage.setItem('tg18_gas_url', decodeURIComponent(urlGasUrl));
      }
      
      // Clean up the URL to keep it pristine
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      alert('📊 ระบบตรวจจับการตั้งค่าแชร์ลิงก์สำเร็จ!\nระบบได้ตั้งค่า Google Sheet และสคริปต์ส่งข้อมูลของคุณเรียบร้อยแล้ว ทุกรายงาน QC จากอุปกรณ์นี้จะถูกส่งไปยังชีทนั้นโดยอัตโนมัติ!');
    }
  }, []);

  // Handle saving new report from form
  const handleNewReportSubmit = (report: QCReport) => {
    setCurrentActiveReport(report);
  };

  // Handle final save/update from summary page
  const handleSaveReportSummary = (updatedReport: QCReport) => {
    // Check if report already exists in logs (to avoid duplicates or update existing)
    setReports((prev) => {
      const exists = prev.some((r) => r.id === updatedReport.id);
      if (exists) {
        return prev.map((r) => (r.id === updatedReport.id ? updatedReport : r));
      } else {
        return [updatedReport, ...prev];
      }
    });
  };

  const handleCloseSummary = () => {
    setCurrentActiveReport(null);
    setActivePage('home'); // Go directly to home page
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased flex flex-col justify-between">
      
      {/* 1. TOP RESPONSIVE HEADER & NAVIGATION */}
      <header className="bg-slate-900 text-white shadow-sm sticky top-0 z-40 print:hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-5 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo / Title Block */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded shadow-sm">
              <Monitor className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] bg-sky-500/10 text-sky-400 font-extrabold px-1 py-0.2 rounded border border-sky-400/20">AAPM TG18-QC</span>
              </div>
              <h1 className="text-xs md:text-sm font-bold tracking-tight mt-0.5">
                ระบบตรวจคุณภาพจอภาพทางการแพทย์แบบรวมศูนย์
              </h1>
            </div>
          </div>

          {/* Nav Controls */}
          <nav className="flex flex-wrap items-center gap-0.5 bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px] font-medium">
            <button
              onClick={() => {
                setActivePage('home');
                setCurrentActiveReport(null);
              }}
              className={`px-2.5 py-1 rounded-sm transition cursor-pointer flex items-center gap-1 ${
                activePage === 'home' && !currentActiveReport
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              การตรวจหน้าจอ (QC Mode)
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 rounded-sm text-amber-400 hover:text-amber-300 hover:bg-slate-900 transition cursor-pointer flex items-center gap-1"
            >
              <Database className="h-3.5 w-3.5 text-amber-400" />
              ตั้งค่า Google Sheet
            </button>
          </nav>

        </div>
      </header>

      {/* 2. CORE VIEW CONTENT ROUTING */}
      <main className="flex-grow">
        {currentActiveReport ? (
          /* Show final calibration report overview upon completing test */
          <ReportSummary
            report={currentActiveReport}
            onSaveReport={handleSaveReportSummary}
            onClose={handleCloseSummary}
          />
        ) : activePage === 'home' ? (
          /* Introduction Home Screen & QC entry point */
          <div className="max-w-4xl mx-auto p-3 md:p-4 space-y-4 animate-fade-in print:hidden">
            
            {/* Elegant Hero Banner */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-6 rounded-lg shadow-sm space-y-3 relative overflow-hidden border border-slate-800">
              <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4 select-none pointer-events-none">
                <Monitor className="w-80 h-80" />
              </div>

              <div className="space-y-1.5 relative z-10">
                <span className="text-[10px] uppercase tracking-wider text-sky-400 font-bold block">เครื่องมือแพทย์ระบบดิจิทัล (Digital Medical Physicist)</span>
                <h2 className="text-lg md:text-xl font-bold leading-snug">
                  เครื่องมือประเมินผลหน้าจอวินิจฉัยโรคตามมาตรฐาน AAPM TG18-QC
                </h2>
                <p className="text-slate-300 text-[11px] md:text-xs max-w-2xl leading-relaxed">
                  ยินดีต้อนรับสู่ระบบตรวจคุณภาพหน้าจอแสดงผลทางการแพทย์แบบ All-in-One เว็บแอปพลิเคชันนี้ออกแบบมาสำหรับการประเมินระดับสายตา (Visual Assessment) 8 ขั้นตอนหลักอย่างถูกต้องแม่นยำ
                </p>
              </div>

              <div className="pt-1.5 flex flex-wrap gap-2 relative z-10">
                <button
                  onClick={() => setActivePage('checklist')}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-md transition shadow-sm flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  เริ่มต้นการตรวจสอบหน้าจอเดี๋ยวนี้
                </button>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-none space-y-1.5">
                <div className="p-2 bg-sky-50 text-sky-600 w-fit rounded-md">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs">การไฮไลต์กรอบความผิดปกติ</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  ระหว่างการตรวจ 8 ขั้นตอน ระบบจะสร้างกรอบไฮไลต์สี่เหลี่ยมสีแดง (Red Coordinates Overlay) เพื่อระบุตำแหน่งที่คุณต้องเพ่งเล็งตรวจสอบบนรูปภาพโดยอัตโนมัติ
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-none space-y-1.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 w-fit rounded-md">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs">เชื่อมโยง Google Sheet ทันที</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  ข้อมูลการตรวจสอบทั้งหมดสามารถส่งตรงไปยัง Google Sheet ของคุณแบบไร้รอยต่อโดยระบุลิงก์เพียงครั้งเดียว ไม่เสียข้อมูลประวัติการตรวจ
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-none space-y-1.5">
                <div className="p-2 bg-purple-50 text-purple-600 w-fit rounded-md">
                  <Landmark className="h-4.5 w-4.5" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs">รายงานผลตามมาตรฐาน</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  พิมพ์รายงานผลตรวจคุณภาพจอภาพ (PDF Report) ในรูปแบบมาตรฐานสากล เพื่อเป็นเอกสารบันทึกร่องรอยการตรวจสอบประเมินคุณภาพในหน่วยงานทางการแพทย์
                </p>
              </div>

            </div>

            {/* Standard Notice block */}
            <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg p-3.5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <h4 className="font-bold text-amber-900 text-xs">ข้อสำคัญเกี่ยวกับการวินิจฉัยรังสี (Diagnostic Notice)</h4>
                <p className="text-amber-800 text-[10.5px] leading-relaxed">
                  การทดสอบตามคู่มือ TG18-QC นี้เป็นการตรวจสอบคุณภาพเบื้องต้นเท่านั้น ห้ามนำภาพหน้าจอนี้ไปใช้ในการวินิจฉัยภาพทางการแพทย์ของคนไข้จริงโดยตรง (Not For Diagnostic Use) โปรดตรวจสอบระดับสเปกตรัมและความส่องสว่างด้วยอุปกรณ์วัดแสง (Photometer) ตามขั้นตอนอย่างสม่ำเสมอ
                </p>
              </div>
            </div>

          </div>
        ) : activePage === 'checklist' ? (
          /* Render Active Calibration Test Session */
          <UserQCForm
            onSubmitReport={handleNewReportSubmit}
            onCancel={() => {
              setActivePage('home');
              setCurrentActiveReport(null);
            }}
          />
        ) : null}
      </main>

      {/* 3. PRINTABLE / NON-PRINTABLE RESPONSIVE FOOTER */}
      <footer className="bg-slate-950 text-slate-400 pt-6 pb-5 px-4 border-t border-slate-900 print:hidden text-xs">
        <div className="max-w-7xl mx-auto space-y-5">
          {/* Credit Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-900 pb-5 text-slate-400">
            {/* First Version Credits */}
            <div className="space-y-2">
              <h4 className="text-amber-400/90 font-semibold text-xs tracking-wider uppercase border-l-2 border-amber-500 pl-2">
                เครดิตผู้ทำเวอร์ชั่นแรก (First Version Credits)
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>
                  <span className="font-bold text-slate-100">ผศ.ดร. บรรจง เขื่อนแก้ว</span> - ภาควิชารังสีวิทยา มหาวิทยาลัยขอนแก่น
                </li>
                <li>
                  <span className="font-bold text-slate-100">นายนาราวินทร์ กูลนรา</span> - กลุ่มงานรังสีวิทยา โรงพยาบาลมะขาม
                </li>
                <li>
                  <span className="font-bold text-slate-100">นายธานินทร์ อิสลามนกูล</span> - ผู้เชี่ยวชาญการเขียนโปรแกรม
                </li>
              </ul>
            </div>

            {/* Current Developer */}
            <div className="space-y-2">
              <h4 className="text-sky-400/90 font-semibold text-xs tracking-wider uppercase border-l-2 border-sky-500 pl-2">
                ผู้พัฒนาโปรแกรม Medical Display QC System 2026
              </h4>
              <div className="text-[11px] text-slate-300 space-y-1">
                <p className="font-bold text-slate-100 text-xs">xraymaetha@gmail.com</p>
                <p>Radiologic Technology Department, MaeTha Hospital</p>
              </div>
            </div>
          </div>

          {/* Copyright and Tech Badge Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px]">
            <p className="text-slate-500">
              © 2026 ระบบตรวจสอบคุณภาพหน้าจอแสดงผลการแพทย์ตามมาตรฐานสมาคม AAPM TG18-QC
            </p>
            <div className="flex gap-1.5">
              <span className="bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-800">React v19</span>
              <span className="bg-slate-900/50 text-slate-500 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-800">Tailwind v4</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Google Sheet Integration Modal */}
      <GoogleSheetSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

    </div>
  );
}
