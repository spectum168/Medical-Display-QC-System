import React, { useState, useEffect } from 'react';
import { Database, Link2, Copy, Check, Info, FileSpreadsheet, Play, HelpCircle, X } from 'lucide-react';

interface GoogleSheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetSettingsModal: React.FC<GoogleSheetSettingsModalProps> = ({ isOpen, onClose }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [gasUrl, setGasUrl] = useState('');
  const [copiedGas, setCopiedGas] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Extract sheet ID from URL
  const extractSheetId = (input: string): string => {
    if (!input) return '';
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input.trim();
  };

  // Load from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedSheetUrl = localStorage.getItem('tg18_sheet_url') || '';
      const savedSheetId = localStorage.getItem('tg18_sheet_id') || '';
      const savedGasUrl = localStorage.getItem('tg18_gas_url') || '';
      
      setSheetUrl(savedSheetUrl);
      setSheetId(savedSheetId);
      setGasUrl(savedGasUrl);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  const handleSheetUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSheetUrl(val);
    const id = extractSheetId(val);
    setSheetId(id);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('tg18_sheet_url', sheetUrl);
    localStorage.setItem('tg18_sheet_id', sheetId);
    localStorage.setItem('tg18_gas_url', gasUrl);
    alert('บันทึกการตั้งค่า Google Sheet เรียบร้อยแล้ว!');
  };

  const handleClearSettings = () => {
    if (window.confirm('คุณต้องการล้างการเชื่อมต่อ Google Sheet และสคริปต์ทั้งหมดใช่หรือไม่?')) {
      setSheetUrl('');
      setSheetId('');
      setGasUrl('');
      localStorage.removeItem('tg18_sheet_url');
      localStorage.removeItem('tg18_sheet_id');
      localStorage.removeItem('tg18_gas_url');
      setTestStatus('idle');
      setTestMessage('');
      alert('ล้างข้อมูลการเชื่อมต่อและสคริปต์เรียบร้อยแล้ว!');
    }
  };

  // Generate dynamic GAS script
  const getGasScriptCode = () => {
    const targetId = sheetId || 'คัดลอก_ID_จากลิงก์ชีทมาวางที่นี่';
    return `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetId = "${targetId}"; 
    var sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];
    
    // ตรวจสอบแถวหัวตาราง (สร้างให้อัตโนมัติหากเป็นสเปรดชีตว่าง)
    if (sheet.getLastRow() < 1 || sheet.getRange(1, 1).getValue() === "") {
      var headers = [
        "วันเวลาที่บันทึก (Timestamp)",
        "เลขที่รายงาน (Report ID)",
        "โรงพยาบาล (Hospital)",
        "หมายเลขจอภาพ (Monitor No.)",
        "ชื่อผู้ตรวจ (Inspector)",
        "วันที่ทดสอบ (Test Date)",
        "ข้อ 1: Luminance (การส่องสว่าง)",
        "ข้อ 2: Dark Contrast (ความต่างระดับมืด)",
        "ข้อ 3: Light Contrast (ความต่างระดับสว่าง)",
        "ข้อ 4: Text (ความชัดเจนตัวอักษร)",
        "ข้อ 5: Linepair (ความคมชัดของเส้น)",
        "ข้อ 6: Artifacts (สิ่งแปลกปน)",
        "ข้อ 7: Bit Depth (ความลึกบิต)",
        "ข้อ 8: Cross Talk (สัญญาณรบกวน)",
        "สรุปผลรวม (Conclusion)",
        "ข้อคิดเห็นเพิ่มเติม (Comments)"
      ];
      // บันทึกหัวข้อที่แถวที่ 1 โดยตรงเพื่อความถูกต้อง 100%
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // ตกแต่งหัวตารางให้สวยงามโดยอัตโนมัติ
      sheet.getRange(1, 1, 1, headers.length)
           .setFontWeight("bold")
           .setBackgroundColor("#1e293b")
           .setFontColor("#ffffff")
           .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
    
    // แถวข้อมูลผลการทดสอบ
    var rowData = [
      new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }),
      data.id || "",
      data.hospitalName || "",
      data.monitorNo || "",
      data.inspectorName || "",
      data.testDate || "",
      data.answers[0] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[1] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[2] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[3] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[4] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[5] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[6] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.answers[7] === true ? "ผ่าน" : "ไม่ผ่าน",
      data.conclusion === "pass" ? "ผ่านเกณฑ์ทั้งหมด" : "ไม่ผ่านเกณฑ์ (ควรปรับปรุง)",
      data.comments || ""
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "บันทึกเรียบร้อยแล้ว" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  };

  const copyToClipboard = (text: string, type: 'gas' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'gas') {
      setCopiedGas(true);
      setTimeout(() => setCopiedGas(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Generate shareable link
  const getShareableLink = () => {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const sId = encodeURIComponent(sheetId || '');
    const gUrl = encodeURIComponent(gasUrl || '');
    return `${origin}${path}?sheetId=${sId}&gasUrl=${gUrl}`;
  };

  // Test send mockup connection
  const handleTestConnection = async () => {
    if (!gasUrl) {
      setTestStatus('error');
      setTestMessage('กรุณาระบุ URL ของ Google Apps Script Web App ก่อนทำการทดสอบ');
      return;
    }

    setIsTesting(true);
    setTestStatus('idle');
    setTestMessage('');

    // Save settings before testing
    localStorage.setItem('tg18_sheet_url', sheetUrl);
    localStorage.setItem('tg18_sheet_id', sheetId);
    localStorage.setItem('tg18_gas_url', gasUrl);

    const mockupPayload = {
      id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      hospitalName: 'โรงพยาบาลทดสอบระบบเชื่อมโยงข้อมูล',
      monitorNo: 'TEST-MONITOR-99',
      inspectorName: 'ระบบทดสอบการส่งข้อมูลอัตโนมัติ',
      testDate: new Date().toISOString().split('T')[0],
      answers: [true, true, true, true, true, true, true, true],
      conclusion: 'pass',
      comments: 'ทดสอบส่งข้อความประสานงานข้อมูล Google Sheet ระบบเชื่อมโยงแบบไร้รอยต่อ'
    };

    try {
      // Use no-cors to prevent local browser blocking redirects
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockupPayload)
      });

      setTestStatus('success');
      setTestMessage('ส่งข้อมูลทดสอบเสร็จสิ้น! กรุณาเปิดดูใน Google Sheet ของคุณว่าแถวทดสอบได้รับการบันทึกแล้วและหัวข้อถูกสร้างขึ้นมาให้เรียบร้อยแล้ว');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`เกิดข้อผิดพลาดในการส่งข้อมูล: ${err.message || err.toString()}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Block */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded shadow-sm">
              <Database className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base">
                ตั้งค่าเชื่อมโยง Google Sheet อัตโนมัติ (Dynamic Cloud Integration)
              </h3>
              <p className="text-[10px] text-slate-400">
                ส่งรายงาน QC ตรงเข้าชีทของคุณทันที ไม่ต้องกรอกซ้ำ ไม่ต้องจัดหน้าตารางเอง
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          
          {/* Instructions Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <h4 className="font-bold text-slate-800 text-[11.5px] flex items-center gap-1.5 text-sky-700">
              <HelpCircle className="h-4 w-4" />
              ขั้นตอนการติดตั้งระบบเชื่อมต่อข้อมูล (ง่ายและรวดเร็ว)
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 text-[11px]">
              <li>สร้าง Google Sheet เปล่าขึ้นมา 1 ใบ และ <strong>คัดลอกลิงก์ (URL) ของชีทนั้น</strong> มาวางในช่องด้านล่าง</li>
              <li>เปิดสเปรดชีตนั้น กดที่เมนู <strong>"ส่วนขยาย (Extensions)" &gt; "Apps Script"</strong></li>
              <li>ลบโค้ดเดิมในนั้นออกให้หมด แล้วกดปุ่ม <strong>"คัดลอกโค้ด Apps Script"</strong> จากด้านล่างนี้ไปวางแทน</li>
              <li>กดปุ่มบันทึก (Save รูปแผ่นดิสก์) แล้วกดปุ่ม <strong>"การทำให้ใช้งานได้ (Deploy)" &gt; "การทำให้ใช้งานได้ใหม่ (New deployment)"</strong></li>
              <li>เลือกประเภทเป็น <strong>"เว็บแอป (Web app)"</strong>, ตั้งค่าสิทธิ์ผู้เข้าใช้งานเป็น <strong>"ทุกคน (Anyone)"</strong> จากนั้นกด Deploy และอนุญาตสิทธิ์การเข้าถึงสเปรดชีต</li>
              <li>คัดลอกลิงก์ <strong>Web App URL</strong> ที่ได้มาวางในช่อง <strong>"Google Apps Script Web App URL"</strong> ด้านล่าง แล้วทดลองกดทดสอบได้ทันที!</li>
            </ol>
            <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded border border-emerald-200 text-[10px] font-bold">
              💡 ระบบฉลาดล้ำเลิศ: ตัวสคริปต์จะทำการสร้างคอลัมน์แถวหัวข้อ (Table Headers) ทั้ง 16 รายการลงในชีทให้เลยอัตโนมัติเมื่อมีการบันทึกรายงานครั้งแรก คุณไม่ต้องตั้งค่าเองแม้แต่คำเดียว!
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sheet Link Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                ลิงก์ Google Sheet หรือรหัส ID สเปรดชีต
              </label>
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs.../edit"
                value={sheetUrl}
                onChange={handleSheetUrlChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
              {sheetId && (
                <div className="text-[10px] text-slate-500 font-mono bg-slate-100 p-1 rounded border border-slate-200">
                  ID ที่ดึงได้: <span className="text-emerald-700 font-bold">{sheetId}</span>
                </div>
              )}
            </div>

            {/* GAS URL Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 flex items-center gap-1">
                <Link2 className="h-4 w-4 text-sky-600" />
                Google Apps Script Web App URL
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

          </div>

          {/* Shareable Link Box */}
          {sheetId && gasUrl && (
            <div className="bg-sky-50/50 border border-sky-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <h5 className="font-bold text-sky-900 text-[11px] flex items-center gap-1">
                  <Link2 className="h-3.5 w-3.5 text-sky-600" />
                  ลิงก์ส่งต่อสำหรับคนงาน / หน่วยงานอื่น (Shareable Pre-configured Link)
                </h5>
                <button
                  onClick={() => copyToClipboard(getShareableLink(), 'link')}
                  className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์นำไปแชร์'}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 leading-normal">
                ส่งลิงก์นี้ให้หน่วยงานหรือแพทย์ท่านอื่นๆ เมื่อเปิดใช้งานจะถูกตั้งค่า Sheet ID และสคริปต์รับข้อมูลตัวนี้ให้อัตโนมัติทันทีโดยแพทย์ไม่ต้องกรอกค่าเอง เมื่อทำการทดสอบ QC เสร็จสิ้น ผลการประเมินก็จะเข้าสเปรดชีตของคุณโดยตรง!
              </p>
              <div className="bg-white p-1.5 rounded border border-sky-100 text-[10px] text-slate-500 font-mono truncate select-all">
                {getShareableLink()}
              </div>
            </div>
          )}

          {/* Apps Script Code Copy Block */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Copy className="h-4 w-4 text-indigo-600" />
                รหัสโค้ดสำหรับนำไปวางใน Google Apps Script (Auto-Generated GAS Code)
              </span>
              <button
                onClick={() => copyToClipboard(getGasScriptCode(), 'gas')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition"
              >
                {copiedGas ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                {copiedGas ? 'คัดลอกเรียบร้อย!' : 'คัดลอกโค้ด Apps Script'}
              </button>
            </div>
            
            <div className="relative">
              <pre className="bg-slate-950 text-slate-200 p-3 rounded-lg text-[10px] font-mono overflow-x-auto max-h-[160px] leading-relaxed border border-slate-800">
                {getGasScriptCode()}
              </pre>
            </div>
          </div>

          {/* Testing Status Display */}
          {testStatus !== 'idle' && (
            <div className={`p-3 rounded-lg border flex gap-2.5 items-start ${
              testStatus === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">สถานะการทดสอบระบบส่งสัญญาณ:</span>
                {testMessage}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
          <div className="text-[10px] text-slate-500 font-medium">
            * สคริปต์นี้ปลอดภัย เป็นการส่งข้อมูลเข้า Google Sheets ส่วนตัวของท่านโดยตรง ไม่ผ่านเซิร์ฟเวอร์บุคคลที่สาม
          </div>
          
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handleClearSettings}
              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold rounded text-xs cursor-pointer transition active:scale-95"
            >
              ล้างการเชื่อมต่อ
            </button>

            <button
              onClick={handleSaveSettings}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded text-xs cursor-pointer transition active:scale-95"
            >
              บันทึกการตั้งค่า
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-xs cursor-pointer flex items-center gap-1.5 transition active:scale-95 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              <Play className="h-3 w-3 fill-white" />
              {isTesting ? 'กำลังทดสอบเชื่อมต่อ...' : 'บันทึกและส่งข้อมูลทดสอบ'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
