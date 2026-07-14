import React, { useState, useEffect } from 'react';
import { QC_QUESTIONS } from '../data';
import { TG18Pattern } from './TG18Pattern';
import { QCReport } from '../types';
import { Play, RotateCcw, Check, Calendar, Monitor, Landmark, User, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface UserQCFormProps {
  onSubmitReport: (report: QCReport) => void;
  onCancel: () => void;
}

export const UserQCForm: React.FC<UserQCFormProps> = ({ onSubmitReport, onCancel }) => {
  const [isRegistered, setIsRegistered] = useState(false);
  
  // Registration States
  const [inspectorName, setInspectorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [monitorNo, setMonitorNo] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // QC Checklist States
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(8).fill(null));

  // Full Screen States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideControlsInFull, setHideControlsInFull] = useState(false);

  // Helper to dynamically position the floating evaluation card based on the active step
  const getOverlayPositionClass = (stepIndex: number): string => {
    switch (stepIndex) {
      case 0: // Step 1: Luminance (highlighted: outer ring)
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case 1: // Step 2: Dark Contrast (highlighted: bottom-left)
        return "top-[12%] right-[10%] md:right-[15%]";
      case 2: // Step 3: Light Contrast (highlighted: bottom-right)
        return "top-[12%] left-[10%] md:left-[15%]";
      case 3: // Step 4: Text (highlighted: bottom row)
        return "top-[12%] left-1/2 -translate-x-1/2";
      case 4: // Step 5: Linepair Resolution (highlighted: 4 corners + center)
        return "top-1/2 right-[8%] md:right-[12%] -translate-y-1/2";
      case 5: // Step 6: Video Artifacts (highlighted: near top row)
        return "bottom-[12%] left-1/2 -translate-x-1/2";
      case 6: // Step 7: Bit Depth (highlighted: vertical edges left & right)
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case 7: // Step 8: Cross Talk (highlighted: top-center)
        return "bottom-[12%] left-1/2 -translate-x-1/2";
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  // Sync fullscreen state with HTML5 escape / browser actions
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard Shortcuts for professional medical QA workflow
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key.toLowerCase() === 'y' || e.key === ' ') {
        e.preventDefault(); // Prevent page scroll on spacebar
        handleSelectAnswer(true);
      } else if (e.key.toLowerCase() === 'n') {
        handleSelectAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, currentStepIndex, answers]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!inspectorName.trim()) newErrors.inspectorName = 'กรุณากรอกชื่อ-นามสกุลผู้ตรวจสอบ';
    if (!hospitalName.trim()) newErrors.hospitalName = 'กรุณากรอกชื่อโรงพยาบาล/ชื่อแผนก/ชื่อห้อง';
    if (!monitorNo.trim()) newErrors.monitorNo = 'กรุณากรอกหมายเลขจอภาพ';
    if (!testDate) newErrors.testDate = 'กรุณาเลือกวันที่ตรวจสอบ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsRegistered(true);
  };

  const handleSelectAnswer = (isYes: boolean) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentStepIndex] = isYes;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (answers[currentStepIndex] === null) {
      alert('กรุณาเลือกคำตอบ "ใช่" หรือ "ไม่ใช่" ก่อนไปขั้นตอนถัดไป');
      return;
    }

    if (currentStepIndex < 7) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Step 8 completed, finish report
      const allAnswersValid = answers.every((ans) => ans !== null) as boolean;
      if (!allAnswersValid) return;

      const finalAnswers = answers as boolean[];
      const isAllPassed = finalAnswers.every((ans) => ans === true);

      const report: QCReport = {
        id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
        inspectorName,
        hospitalName,
        monitorNo,
        testDate,
        answers: finalAnswers,
        conclusion: isAllPassed ? 'pass' : 'fail',
        createdAt: new Date().toISOString(),
      };

      onSubmitReport(report);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    if (confirm('คุณต้องการยกเลิกการทดสอบครั้งนี้ใช่หรือไม่? ข้อมูลที่กำลังทำรายการจะถูกลบออกทั้งหมด')) {
      setIsRegistered(false);
      setInspectorName('');
      setHospitalName('');
      setMonitorNo('');
      setCurrentStepIndex(0);
      setAnswers(Array(8).fill(null));
    }
  };

  const activeQuestion = QC_QUESTIONS[currentStepIndex];

  return (
    <div className="w-full flex flex-col items-center justify-center p-2.5 min-h-[calc(100vh-56px)] bg-slate-950/20">
      {!isRegistered ? (
        /* Login / Register Dialog Box matching screenshots */
        <div className="w-full max-w-md bg-slate-50 rounded-lg border border-slate-300 shadow-md overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between text-white border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="font-bold text-sm font-sans">ลงทะเบียนผู้ตรวจ / ข้อมูลจอภาพ</span>
            </div>
            <span className="text-[9px] text-slate-300 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded font-mono">Login</span>
          </div>

          <form onSubmit={handleRegisterSubmit} className="p-5 space-y-4">
            <p className="text-[11px] text-slate-500 border-b border-slate-200 pb-1.5">
              กรุณากรอกข้อมูลเพื่อระบุสถานศึกษา/โรงพยาบาล และผู้ทดสอบสำหรับการสอบเทียบมาตรฐาน AAPM TG18-QC
            </p>

            <div className="space-y-3.5">
              {/* Inspector Name */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/3 text-slate-600 font-semibold text-xs flex items-center gap-1">
                  <span className="text-red-500 font-bold">*</span>ชื่อ-นามสกุล :
                </label>
                <div className="md:w-2/3">
                  <div className="relative">
                    <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      placeholder="เช่น นายแพทย์สมชาย หรือ ผู้ตรวจเครื่องมือแพทย์"
                      className={`w-full pl-8 pr-2.5 py-1 bg-white border rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 transition ${
                        errors.inspectorName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.inspectorName && (
                    <span className="text-[10px] text-red-500 mt-0.5 block">{errors.inspectorName}</span>
                  )}
                </div>
              </div>

              {/* Monitor ID */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/3 text-slate-600 font-semibold text-xs flex items-center gap-1">
                  <span className="text-red-500 font-bold">*</span>หมายเลขจอภาพ :
                </label>
                <div className="md:w-2/3">
                  <div className="relative">
                    <Monitor className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={monitorNo}
                      onChange={(e) => setMonitorNo(e.target.value)}
                      placeholder="เช่น MON-01, XRAY-DISPLAY-03"
                      className={`w-full pl-8 pr-2.5 py-1 bg-white border rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 transition ${
                        errors.monitorNo ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.monitorNo && (
                    <span className="text-[10px] text-red-500 mt-0.5 block">{errors.monitorNo}</span>
                  )}
                </div>
              </div>

              {/* Hospital Name */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/3 text-slate-600 font-semibold text-xs flex items-center gap-1">
                  <span className="text-red-500 font-bold">*</span>ชื่อโรงพยาบาล/ชื่อแผนก/ชื่อห้อง :
                </label>
                <div className="md:w-2/3">
                  <div className="relative">
                    <Landmark className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="เช่น รพ.แม่ทา/แผนกรังสี/ห้องตรวจ1"
                      className={`w-full pl-8 pr-2.5 py-1 bg-white border rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 transition ${
                        errors.hospitalName ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.hospitalName && (
                    <span className="text-[10px] text-red-500 mt-0.5 block">{errors.hospitalName}</span>
                  )}
                </div>
              </div>

              {/* Datepicker */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/3 text-slate-600 font-semibold text-xs flex items-center gap-1">
                  <span className="text-red-500 font-bold">*</span>วันที่ตรวจสอบ :
                </label>
                <div className="md:w-2/3">
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded text-xs transition flex items-center gap-1 cursor-pointer shadow-none"
              >
                ย้อนกลับหน้าหลัก
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-xs transition flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                ตกลง
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Step-by-Step QC Evaluation Layout with Floating Dialog on top of Pattern */
        <div className="w-full max-w-5xl flex flex-col items-center space-y-3">
          
          {/* Header Banner */}
          <div className="w-full bg-slate-800 text-white py-1.5 px-4 rounded border border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-center md:text-left">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold block">โหมดทดสอบ / Active Calibration</span>
              <h2 className="text-xs md:text-sm font-bold text-slate-100">ระบบตรวจคุณภาพจอภาพแพทย์ AAPM TG18-QC</h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                <strong>โรงพยาบาล:</strong> {hospitalName}
              </span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                <strong>จอภาพ:</strong> {monitorNo}
              </span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                <strong>ผู้ตรวจ:</strong> {inspectorName}
              </span>
            </div>
          </div>

          {/* Interactive Work Area - Side-by-Side Flex Layout to prevent overlapping */}
          <div className="w-full flex flex-col lg:flex-row gap-4 items-stretch justify-center bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-sm">
            
            {/* The Scalable TG18-QC SVG Pattern Container with Full Screen Trigger */}
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 rounded border border-slate-850 p-4 min-h-0 relative">
              <div className="w-full max-w-2xl aspect-square mb-4">
                <TG18Pattern highlightedQuestion={activeQuestion} className="w-full h-full" />
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setIsFullscreen(true);
                  const container = document.getElementById('root');
                  if (container) {
                    container.requestFullscreen().catch(() => {});
                  }
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md border border-sky-500 hover:scale-[1.02] transform active:scale-95 duration-150"
                title="ขยายรูปภาพ TG18-QC เต็มจอเพื่อการประเมินคุณภาพสายตาอย่างถูกต้องแม่นยำ"
              >
                <Maximize2 className="h-4 w-4" />
                ขยายภาพเต็มจอภาพ (True Fullscreen Mode)
              </button>
            </div>

            {/* Checklist Box - Now positioned nicely next to the pattern on desktop, or stacked on mobile */}
            <div className="w-full lg:w-80 xl:w-96 bg-slate-950/95 border border-slate-800 rounded shadow-lg p-4 text-white space-y-3.5 animate-fade-in flex flex-col justify-between max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="border-b border-slate-850 pb-1.5">
                <span className="text-[10px] text-emerald-400 font-bold tracking-widest block uppercase">คำถามสำหรับตรวจสอบ</span>
                <h3 className="text-xs md:text-sm font-bold text-sky-400 mt-0.5">
                  คำถาม {activeQuestion.step} / 8 : {activeQuestion.title.split(': ')[1]}
                </h3>
              </div>

              {/* Thai Criterion & Description */}
              <div className="space-y-1.5 text-slate-200">
                <div className="bg-slate-900 p-2 rounded text-[11px] border-l-2 border-sky-500 leading-relaxed font-semibold text-sky-200">
                  {activeQuestion.criteria}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  {activeQuestion.description}
                </p>
              </div>

              {/* Pass / Fail Selection Radio buttons (ใช่ / ไม่ใช่) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 block">ผลการประเมินจากสายตา:</span>
                <div className="flex items-center gap-4">
                  {/* Yes Option */}
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none group">
                    <input
                      type="radio"
                      name="qc-answer"
                      checked={answers[currentStepIndex] === true}
                      onChange={() => handleSelectAnswer(true)}
                      className="w-3.5 h-3.5 text-sky-500 border-slate-700 focus:ring-sky-400 bg-slate-900"
                    />
                    <span className={`font-semibold transition ${answers[currentStepIndex] === true ? 'text-green-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                      ใช่ (ผ่าน)
                    </span>
                  </label>

                  {/* No Option */}
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none group">
                    <input
                      type="radio"
                      name="qc-answer"
                      checked={answers[currentStepIndex] === false}
                      onChange={() => handleSelectAnswer(false)}
                      className="w-3.5 h-3.5 text-red-500 border-slate-700 focus:ring-red-400 bg-slate-900"
                    />
                    <span className={`font-semibold transition ${answers[currentStepIndex] === false ? 'text-red-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
                      ไม่ใช่ (ไม่ผ่าน)
                    </span>
                  </label>
                </div>
              </div>

              {/* Progress Bar inside the Dialog */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>ความคืบหน้า</span>
                  <span>{Math.round((currentStepIndex / 8) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-1 transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / 8) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Navigation controls matching screenshots */}
              <div className="flex items-center justify-between pt-1 gap-1.5">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStepIndex === 0}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-sm transition cursor-pointer flex items-center gap-1 border border-slate-850 ${
                    currentStepIndex === 0
                      ? 'bg-slate-900 text-slate-600 border-slate-950 cursor-not-allowed shadow-none'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  ย้อนหลัง
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3.5 py-1 text-[11px] font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-sm transition flex items-center gap-1 border border-sky-700 cursor-pointer shadow-sm"
                >
                  {currentStepIndex === 7 ? (
                    <>
                      <Check className="h-3 w-3" /> เสร็จสิ้นการตรวจ
                    </>
                  ) : (
                    'ถัดไป'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-red-950/40 hover:bg-red-900/60 text-red-200 rounded-sm transition flex items-center gap-1 border border-red-950/80 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> ยกเลิก
                </button>
              </div>

            </div>
          </div>

          {/* Quick Step Indicators underneath for rapid navigation / checklist auditing */}
          <div className="w-full flex justify-between gap-0.5 max-w-xs">
            {answers.map((ans, idx) => (
              <button
                key={`indicator-step-${idx}`}
                onClick={() => {
                  if (isRegistered) {
                    setCurrentStepIndex(idx);
                  }
                }}
                className={`flex-1 h-1.5 rounded-sm transition cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-sky-400'
                    : ans === true
                    ? 'bg-green-500'
                    : ans === false
                    ? 'bg-red-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`คำถามข้อที่ ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      )}

      {/* True Full Screen Evaluation Overlay */}
      {isFullscreen && (
        <div 
          id="fullscreen-qc-container"
          className="fixed inset-0 bg-[#808080] z-50 overflow-hidden font-sans select-none flex items-center justify-center w-full h-full"
        >
          {/* SVG Pattern Area (occupies 100% of the screen, stretched) */}
          <div className="absolute inset-0 w-full h-full z-0">
            <TG18Pattern highlightedQuestion={activeQuestion} isFullscreenMode={true} className="w-full h-full rounded-none border-0" />
          </div>

          {/* Floating badge when panel is hidden */}
          {hideControlsInFull && (
            <div className="absolute top-6 left-6 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold py-2.5 px-4 rounded-lg border border-slate-700 flex flex-col gap-0.5 shadow-2xl max-w-[80vw] z-20">
              <span className="text-[9px] uppercase text-emerald-400 tracking-wider font-mono">กำลังตรวจสอบ (Full Screen)</span>
              <span className="text-xs font-bold text-sky-400">คำถาม {activeQuestion.step} / 8 : {activeQuestion.title.split(': ')[1] || activeQuestion.title}</span>
              <span className="text-sky-300 font-mono text-[10px] mt-0.5">ความคืบหน้า: {Math.round((currentStepIndex / 8) * 100)}%</span>
            </div>
          )}

          {/* Floating Hint to Restore Panel if hidden */}
          {hideControlsInFull && (
            <button
              onClick={() => setHideControlsInFull(false)}
              className="absolute bottom-6 right-6 bg-[#2d3748] hover:bg-[#4a5568] text-white text-xs font-bold py-2.5 px-5 rounded border border-[#718096] shadow-[3px_3px_10px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 active:scale-95 z-20 transition-all duration-150 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              แสดงแผงประเมินคำตอบ (Show Panel)
            </button>
          )}

          {/* Controls Panel (Classic Windows-style gray Fieldset box, matching the sample program) */}
          {!hideControlsInFull && (
            <fieldset 
              className={`absolute z-10 w-[420px] max-w-[92vw] bg-[#2d3748]/95 backdrop-blur-sm p-5 text-white rounded border-2 border-[#718096] shadow-[5px_5px_15px_rgba(0,0,0,0.6)] transition-all duration-500 ease-in-out max-h-[90vh] overflow-y-auto flex flex-col justify-between ${getOverlayPositionClass(currentStepIndex)}`}
            >
              <legend className="px-2 text-xs font-bold text-[#e2e8f0] tracking-wide select-none">
                คำถามสำหรับตรวจสอบ :
              </legend>

              <div className="flex flex-col h-full space-y-4">
                {/* Small toggle to hide/minimize the panel */}
                <div className="absolute top-2.5 right-2.5">
                  <button
                    onClick={() => setHideControlsInFull(true)}
                    className="p-1 hover:bg-[#4a5568] rounded text-slate-300 hover:text-white transition cursor-pointer"
                    title="ซ่อนแผงคำตอบ เพื่อดูภาพแบบ 100% ไม่มีอะไรรบกวน"
                  >
                    <EyeOff className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Question Title */}
                <div className="text-center font-bold text-[#63b3ed] text-[13px] sm:text-[14px] leading-snug pt-1 px-4">
                  คำถาม {activeQuestion.step} / 8 : {activeQuestion.title.split(': ')[1] || activeQuestion.title}
                </div>

                {/* Criteria indicator */}
                <div className="text-center text-xs text-emerald-300 font-semibold px-2 bg-slate-900/40 py-1 rounded border border-slate-800/50">
                  เกณฑ์: {activeQuestion.criteria}
                </div>

                {/* Description Text */}
                <div className="text-center text-xs text-slate-100 leading-relaxed max-h-[140px] overflow-y-auto px-1">
                  {activeQuestion.description}
                </div>

                {/* Centered Radio Buttons */}
                <div className="flex justify-center items-center gap-10 py-3 border-t border-b border-[#4a5568]/50 my-2">
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none font-bold text-white hover:text-green-300 transition-colors">
                    <input
                      type="radio"
                      name="qc-answer-fullscreen"
                      checked={answers[currentStepIndex] === true}
                      onChange={() => handleSelectAnswer(true)}
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                    <span>ใช่</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs sm:text-sm cursor-pointer select-none font-bold text-white hover:text-red-300 transition-colors">
                    <input
                      type="radio"
                      name="qc-answer-fullscreen"
                      checked={answers[currentStepIndex] === false}
                      onChange={() => handleSelectAnswer(false)}
                      className="w-4 h-4 accent-sky-400 cursor-pointer"
                    />
                    <span>ไม่ใช่</span>
                  </label>
                </div>

                {/* Footer Buttons (Horizontal layout) */}
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStepIndex === 0}
                    className={`px-5 py-1.5 text-xs font-bold rounded border transition-all duration-150 shadow-md ${
                      currentStepIndex === 0
                        ? 'bg-[#4a5568]/40 text-slate-500 border-[#4a5568]/50 cursor-not-allowed'
                        : 'bg-[#4a5568] hover:bg-[#5a67d8] text-white border-[#718096] active:scale-95 cursor-pointer'
                    }`}
                  >
                    ย้อนกลับ
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-1.5 text-xs font-bold rounded border bg-[#4a5568] hover:bg-[#3182ce] text-white border-[#718096] shadow-md active:scale-95 cursor-pointer transition-all duration-150"
                  >
                    {currentStepIndex === 7 ? 'เสร็จสิ้น' : 'ถัดไป'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreen(false);
                      if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {});
                      }
                    }}
                    className="px-5 py-1.5 text-xs font-bold rounded border bg-[#4a5568] hover:bg-[#e53e3e] text-white border-[#718096] shadow-md active:scale-95 cursor-pointer transition-all duration-150"
                  >
                    ยกเลิก
                  </button>
                </div>

                {/* Minimalist keyboard shortcut helper */}
                <div className="text-[10px] text-slate-300/80 text-center select-none pt-1">
                  คีย์ลัด: <kbd className="bg-slate-800/60 px-1 py-0.5 rounded text-[9px] border border-slate-700">Space</kbd> / <kbd className="bg-slate-800/60 px-1 py-0.5 rounded text-[9px] border border-slate-700">Y</kbd> (ใช่), <kbd className="bg-slate-800/60 px-1 py-0.5 rounded text-[9px] border border-slate-700">N</kbd> (ไม่ใช่), <kbd className="bg-slate-800/60 px-1 py-0.5 rounded text-[9px] border border-slate-700">←</kbd> <kbd className="bg-slate-800/60 px-1 py-0.5 rounded text-[9px] border border-slate-700">→</kbd> (สลับหน้า)
                </div>
              </div>
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
};
