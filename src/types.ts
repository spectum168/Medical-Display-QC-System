export interface QCReport {
  id: string;
  inspectorName: string;
  hospitalName: string;
  monitorNo: string;
  testDate: string;
  answers: boolean[]; // 8 items, true = ผ่าน (Pass), false = ไม่ผ่าน (Fail)
  conclusion: 'pass' | 'fail';
  notes?: string;
  createdAt: string;
}

export interface QCQuestion {
  step: number;
  title: string;
  criteria: string;
  description: string;
  highlightArea: {
    x: number;
    y: number;
    width: number;
    height: number;
    // For complex highlights (like Step 5 with 5 points), we can provide multiple boxes or a special type
    points?: Array<{ x: number; y: number; width: number; height: number }>;
  };
}
