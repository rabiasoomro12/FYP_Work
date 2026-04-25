import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PatientReportData {
  patientEmail: string;
  patientName?: string;
  predictedClass: string;
  predictedLabel: string;
  confidence: number; // fraction 0-1
  risk: string;
  riskColor: string;
  probabilities: Record<string, number>; // fractions 0-1
  previewUrl?: string | null;
  gradcamUrl?: string | null;
  modelCount: number;
}

const CLASS_NAMES: Record<string, string> = {
  akiec: 'Actinic Keratosis',
  bcc: 'Basal Cell Carcinoma',
  bkl: 'Benign Keratosis',
  df: 'Dermatofibroma',
  mel: 'Melanoma',
  nv: 'Melanocytic Nevus',
  vasc: 'Vascular Lesion',
};

const RISK_COLORS: Record<string, [number, number, number]> = {
  Critical: [239, 68, 68],
  High: [245, 158, 11],
  Moderate: [234, 179, 8],
  Low: [16, 185, 129],
};

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generatePatientReport(data: PatientReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;
  let y = 0;

  const riskRgb = RISK_COLORS[data.risk] ?? RISK_COLORS.Low;
  const sorted = Object.entries(data.probabilities)
    .map(([cls, val]) => ({ cls, name: CLASS_NAMES[cls] ?? cls, value: val }))
    .sort((a, b) => b.value - a.value);

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFillColor(13, 148, 136);
  doc.roundedRect(M, 9, 9, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DermAI', M + 12, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Powered Skin Disease Classification · Sukkur IBA University', M + 12, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('PATIENT DIAGNOSTIC REPORT', W - M, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 22, { align: 'right' });
  y = 48;

  // ── Patient Info ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT INFORMATION', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.4);
  doc.line(M, y, M + CW, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  const name = data.patientName || data.patientEmail.split('@')[0];
  doc.text(`Patient:`, M, y);
  doc.setFont('helvetica', 'bold');
  doc.text(name, M + 22, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email:`, M + 90, y);
  doc.setFont('helvetica', 'bold');
  doc.text(data.patientEmail, M + 106, y);
  y += 14;

  // ── Diagnosis Card ────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, CW, 28, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 28, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DETECTED CONDITION', M + 6, y + 7);
  doc.text('ENSEMBLE CONFIDENCE', M + 80, y + 7);
  doc.text('RISK LEVEL', W - M - 6, y + 7, { align: 'right' });

  doc.setFillColor(...riskRgb);
  doc.roundedRect(M + 6, y + 10, 65, 9, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`${data.predictedClass.toUpperCase()} — ${data.predictedLabel}`, M + 38.5, y + 16, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(data.confidence * 100).toFixed(1)}%`, M + 97, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...riskRgb);
  doc.text(data.risk, W - M - 6, y + 18, { align: 'right' });

  y += 35;

  // ── Probability Distribution ─────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('PROBABILITY DISTRIBUTION', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 7;

  const barAreaX = M + 58;
  const barAreaW = CW - 75;

  for (const { cls, name: clsName, value } of sorted) {
    const isTop = cls === data.predictedClass;
    const pct = value * 100;
    const barW = (pct / 100) * barAreaW;

    doc.setFont('helvetica', isTop ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(isTop ? 15 : 100, isTop ? 23 : 116, isTop ? 42 : 139);
    doc.text(`${cls}`, M, y + 3.5);
    doc.text(clsName, M + 14, y + 3.5);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barAreaX, y, barAreaW, 5, 1, 1, 'F');

    if (barW > 0.5) {
      const c = isTop ? riskRgb : ([148, 163, 184] as [number, number, number]);
      doc.setFillColor(...c);
      doc.roundedRect(barAreaX, y, barW, 5, 1, 1, 'F');
    }

    doc.setFont('helvetica', isTop ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(isTop ? 15 : 100, isTop ? 23 : 116, isTop ? 42 : 139);
    doc.text(`${pct.toFixed(2)}%`, W - M, y + 3.5, { align: 'right' });

    y += 9;
  }

  y += 6;

  // ── Images ───────────────────────────────────────────────
  if (data.previewUrl || data.gradcamUrl) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('IMAGE ANALYSIS', M, y);
    y += 3;
    doc.setDrawColor(13, 148, 136);
    doc.line(M, y, M + CW, y);
    y += 7;

    const imgH = 55;
    const imgW = (CW - 6) / 2;

    const [origData, gcData] = await Promise.all([
      data.previewUrl ? urlToDataUrl(data.previewUrl) : Promise.resolve(null),
      data.gradcamUrl ? urlToDataUrl(data.gradcamUrl) : Promise.resolve(null),
    ]);

    if (origData) {
      doc.addImage(origData, 'JPEG', M, y, imgW, imgH, undefined, 'FAST');
      doc.setFillColor(0, 0, 0, 0.5);
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(M + 2, y + 2, 18, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text('ORIGINAL', M + 11, y + 5.5, { align: 'center' });
    }

    if (gcData) {
      doc.addImage(gcData, 'JPEG', M + imgW + 6, y, imgW, imgH, undefined, 'FAST');
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(M + imgW + 8, y + 2, 20, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text('GRAD-CAM', M + imgW + 18, y + 5.5, { align: 'center' });
    } else if (origData) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(M + imgW + 6, y, imgW, imgH, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('Grad-CAM unavailable', M + imgW + 6 + imgW / 2, y + imgH / 2, { align: 'center' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    if (origData) doc.text('Original Dermoscopic Image', M + imgW / 2, y + imgH + 5, { align: 'center' });
    if (gcData) doc.text(`Grad-CAM · EfficientNet-B0 · ${data.predictedLabel}`, M + imgW + 6 + imgW / 2, y + imgH + 5, { align: 'center' });

    y += imgH + 12;
  }

  // ── Model Info ────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ensemble of ${data.modelCount} models: EfficientNet-B0, EfficientNet-B3, MobileNetV3, ResNet-50 (HAM10000 dataset)`, M, y);
  y += 10;

  // ── Disclaimer ────────────────────────────────────────────
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(253, 211, 77);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 24, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(146, 64, 14);
  doc.text('MEDICAL DISCLAIMER', M + 5, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  const disclaimer = 'This report is generated by an AI system for research and educational purposes only. It does NOT constitute medical advice, diagnosis, or treatment. Always consult a qualified dermatologist or healthcare professional for proper evaluation and treatment.';
  doc.text(doc.splitTextToSize(disclaimer, CW - 10), M + 5, y + 13);
  y += 30;

  // ── Footer ────────────────────────────────────────────────
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(M, H - 12, W - M, H - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DermAI · Sukkur IBA University · AI-Powered Skin Disease Classification System', M, H - 7);
  doc.text('Page 1 of 1', W - M, H - 7, { align: 'right' });

  const filename = `DermAI_Patient_Report_${data.predictedClass}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
