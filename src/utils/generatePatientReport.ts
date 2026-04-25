import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PatientReportData {
  patientEmail: string;
  patientName?: string; // Now expects full name
  patientAge?: string;
  patientGender?: string;
  predictedClass: string;
  predictedLabel: string;
  confidence: number;
  risk: string;
  riskColor: string;
  probabilities: Record<string, number>;
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

// Detailed explanations for each condition
const CONDITION_EXPLANATIONS: Record<string, { explanation: string; precautions: string[] }> = {
  mel: {
    explanation: 'Melanoma is the most dangerous form of skin cancer that develops in melanocytes (pigment-producing cells). It can spread rapidly to other organs if not detected early. This condition requires immediate medical attention and professional evaluation.',
    precautions: [
      'Schedule an immediate appointment with a dermatologist',
      'Avoid sun exposure and always use SPF 50+ sunscreen',
      'Monitor the lesion for changes in size, shape, or color (ABCDE rule)',
      'Do not attempt to remove or treat the lesion yourself',
      'Keep the area clean and protected from irritation',
      'Document changes with photographs for your doctor',
    ],
  },
  bcc: {
    explanation: 'Basal Cell Carcinoma is the most common type of skin cancer. While it rarely spreads to other organs, it can cause significant local tissue damage if left untreated. Early treatment is highly effective and usually involves surgical removal.',
    precautions: [
      'Consult a dermatologist for proper treatment options',
      'Protect the area from sun exposure with clothing and sunscreen',
      'Avoid picking or scratching the lesion',
      'Regular skin checks every 6-12 months',
      'Inform your doctor of any bleeding or changes',
      'Consider Mohs surgery for facial lesions',
    ],
  },
  akiec: {
    explanation: 'Actinic Keratosis is a pre-cancerous skin condition caused by cumulative sun damage. While not cancer itself, it can progress to squamous cell carcinoma if left untreated. Treatment is important to prevent malignant transformation.',
    precautions: [
      'Seek dermatological treatment (cryotherapy, topical creams, or PDT)',
      'Apply broad-spectrum SPF 50+ sunscreen daily',
      'Wear protective clothing and wide-brimmed hats',
      'Avoid tanning beds and prolonged sun exposure',
      'Schedule regular skin examinations',
      'Treat all affected areas, not just visible ones',
    ],
  },
  bkl: {
    explanation: 'Benign Keratosis (including seborrheic keratosis) is a harmless skin growth that commonly appears with age. These growths are non-cancerous and typically do not require treatment unless they cause discomfort or cosmetic concerns.',
    precautions: [
      'No treatment necessary unless bothersome',
      'Monitor for any changes in appearance or texture',
      'Can be removed by a dermatologist if desired',
      'Maintain good skincare routine',
      'Annual skin check-ups recommended',
      'Avoid scratching or picking at the growth',
    ],
  },
  df: {
    explanation: 'Dermatofibroma is a benign skin growth that appears as a small, firm bump, commonly on the legs. It is completely harmless and usually results from minor injury or insect bites. No treatment is typically needed.',
    precautions: [
      'No treatment required in most cases',
      'Avoid scratching or irritating the area',
      'Monitor for changes, though these are rare',
      'Can be surgically removed if painful or growing',
      'Apply moisturizer to keep skin healthy',
      'Consult dermatologist if it changes color or size',
    ],
  },
  nv: {
    explanation: 'Melanocytic Nevus (common mole) is a benign cluster of pigment-producing cells. Most people have 10-40 moles. While typically harmless, some moles can develop into melanoma, especially if they change over time.',
    precautions: [
      'Monitor moles monthly using the ABCDE rule',
      'Take photos to track changes over time',
      'Use SPF 50+ sunscreen on all exposed skin',
      'Avoid tanning beds completely',
      'Schedule annual dermatologist skin checks',
      'Report any new or changing moles promptly',
    ],
  },
  vasc: {
    explanation: 'Vascular Lesions are benign abnormalities of blood vessels, including hemangiomas and angiomas. Most are present at birth or develop with age. They are generally harmless and rarely require treatment.',
    precautions: [
      'Most vascular lesions need no treatment',
      'Monitor for any bleeding or rapid growth',
      'Protect from trauma or injury',
      'Treatment available for cosmetic concerns',
      'Consult dermatologist if lesion changes',
      'Laser therapy option for visible lesions',
    ],
  },
};

// General prevention tips for all conditions
const GENERAL_PRECAUTIONS = [
  'Apply broad-spectrum SPF 50+ sunscreen daily, even on cloudy days',
  'Avoid direct sun exposure between 10 AM and 4 PM',
  'Wear protective clothing, wide-brimmed hats, and UV-blocking sunglasses',
  'Never use tanning beds or sunlamps',
  'Perform monthly self-skin examinations',
  'Stay hydrated and maintain a healthy diet rich in antioxidants',
];

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

  const conditionInfo = CONDITION_EXPLANATIONS[data.predictedClass] ?? {
    explanation: 'Please consult a dermatologist for detailed information about this condition.',
    precautions: ['Consult a healthcare professional for personalized advice.'],
  };

  // ═══════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════
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
  doc.text('AI-Powered Skin Disease Classification • Sukkur IBA University', M + 12, 22);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('PATIENT DIAGNOSTIC REPORT', W - M, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 22, { align: 'right' });
  y = 48;

  // ═══════════════════════════════════════════════════════════
  // PATIENT INFORMATION
  // ═══════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT INFORMATION', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.4);
  doc.line(M, y, M + CW, y);
  y += 7;

  // Patient full name
  const fullName = data.patientName || data.patientEmail.split('@')[0];
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, CW, 16, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('FULL NAME', M + 5, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(fullName, M + 5, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('EMAIL', M + 100, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(data.patientEmail, M + 100, y + 12);

  // Optional: Age and Gender
  if (data.patientAge || data.patientGender) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('AGE', M + 5, y + 6);
    doc.setFontSize(9);
    doc.text(data.patientAge || '—', M + 5 + (data.patientGender ? 0 : 0), y + 12);
    
    if (data.patientGender) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('GENDER', M + 50, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(data.patientGender, M + 50, y + 12);
    }
    y += 7;
  }

  y += 12;

  // ═══════════════════════════════════════════════════════════
  // DIAGNOSIS CARD
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(M, y, CW, 30, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 30, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DETECTED CONDITION', M + 6, y + 7);
  doc.text('ENSEMBLE CONFIDENCE', M + 80, y + 7);
  doc.text('RISK LEVEL', W - M - 6, y + 7, { align: 'right' });

  doc.setFillColor(...riskRgb);
  doc.roundedRect(M + 6, y + 10, 68, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(`${data.predictedClass.toUpperCase()} — ${data.predictedLabel}`, M + 40, y + 17, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(data.confidence * 100).toFixed(1)}%`, M + 97, y + 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...riskRgb);
  doc.text(data.risk, W - M - 6, y + 19, { align: 'right' });

  y += 37;

  // ═══════════════════════════════════════════════════════════
  // CONDITION EXPLANATION
  // ═══════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CONDITION EXPLANATION', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 6;

  const explanationLines = doc.splitTextToSize(conditionInfo.explanation, CW - 10);
  doc.setFillColor(240, 253, 250);
  doc.roundedRect(M, y - 2, CW, explanationLines.length * 5 + 10, 3, 3, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(explanationLines, M + 5, y + 4);
  
  y += explanationLines.length * 5 + 14;

  // ═══════════════════════════════════════════════════════════
  // RECOMMENDED PRECAUTIONS & GUIDELINES
  // ═══════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('RECOMMENDED PRECAUTIONS & GUIDELINES', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 7;

  // Specific precautions
  const allPrecautions = [...conditionInfo.precautions, ...GENERAL_PRECAUTIONS];
  
  allPrecautions.forEach((precaution, index) => {
    const bulletLines = doc.splitTextToSize(precaution, CW - 12);
    
    // Bullet point
    doc.setFillColor(13, 148, 136);
    doc.circle(M + 3, y + 1.5, 1, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(bulletLines, M + 6, y + 4);
    
    y += bulletLines.length * 5 + 5;
  });

  y += 5;

  // ═══════════════════════════════════════════════════════════
  // PROBABILITY DISTRIBUTION
  // ═══════════════════════════════════════════════════════════
  
  // Check if we need a new page
  if (y > H - 120) {
    doc.addPage();
    y = 20;
  }

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

  // ═══════════════════════════════════════════════════════════
  // IMAGES
  // ═══════════════════════════════════════════════════════════
  if (data.previewUrl || data.gradcamUrl) {
    // Check if we need a new page for images
    if (y > H - 80) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('IMAGE ANALYSIS', M, y);
    y += 3;
    doc.setDrawColor(13, 148, 136);
    doc.line(M, y, M + CW, y);
    y += 7;

    const imgH = 50;
    const imgW = (CW - 6) / 2;

    const [origData, gcData] = await Promise.all([
      data.previewUrl ? urlToDataUrl(data.previewUrl) : Promise.resolve(null),
      data.gradcamUrl ? urlToDataUrl(data.gradcamUrl) : Promise.resolve(null),
    ]);

    if (origData) {
      doc.addImage(origData, 'JPEG', M, y, imgW, imgH, undefined, 'FAST');
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
      doc.text('Grad-CAM\nunavailable', M + imgW + 6 + imgW / 2, y + imgH / 2 - 3, { align: 'center' });
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    if (origData) doc.text('Original Dermoscopic Image', M + imgW / 2, y + imgH + 5, { align: 'center' });
    if (gcData) doc.text(`Grad-CAM • ${data.predictedLabel}`, M + imgW + 6 + imgW / 2, y + imgH + 5, { align: 'center' });

    y += imgH + 12;
  }

  // ═══════════════════════════════════════════════════════════
  // MODEL INFO
  // ═══════════════════════════════════════════════════════════
  if (y > H - 60) {
    doc.addPage();
    y = 20;
  }
  
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Analysis performed using ensemble of ${data.modelCount} deep learning models: EfficientNet-B0, EfficientNet-B3, MobileNetV3, ResNet-50`, M, y);
  doc.text('Trained on HAM10000 dermatoscopy dataset • Sukkur IBA University', M, y + 5);
  y += 12;

  // ═══════════════════════════════════════════════════════════
  // DISCLAIMER (Fixed alignment and formatting)
  // ═══════════════════════════════════════════════════════════
  if (y > H - 45) {
    doc.addPage();
    y = 20;
  }

  const disclaimerTitle = '⚠ MEDICAL DISCLAIMER';
  const disclaimerText = 'This AI-generated report is for research and educational purposes ONLY. It does NOT constitute medical advice, diagnosis, or treatment recommendation. The results should be reviewed by a qualified healthcare professional. Always consult a licensed dermatologist or medical practitioner for proper evaluation, diagnosis, and treatment of any skin condition. Do not delay seeking professional medical advice based on information in this report.';
  
  // Calculate disclaimer box height
  const titleLines = doc.splitTextToSize(disclaimerTitle, CW - 16);
  const textLines = doc.splitTextToSize(disclaimerText, CW - 16);
  const boxHeight = titleLines.length * 5 + textLines.length * 4 + 18;

  // Draw disclaimer background
  doc.setFillColor(254, 243, 199);  // Warm yellow background
  doc.setDrawColor(245, 158, 11);    // Amber border
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, CW, boxHeight, 3, 3, 'FD');

  // Title with icon
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(146, 64, 14);  // Dark amber text
  doc.text(titleLines, M + 8, y + 8);

  // Horizontal separator line in disclaimer
  doc.setDrawColor(245, 158, 11, 0.5);
  doc.setLineWidth(0.2);
  doc.line(M + 8, y + titleLines.length * 4 + 11, W - M - 8, y + titleLines.length * 4 + 11);

  // Disclaimer text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  doc.text(textLines, M + 8, y + titleLines.length * 4 + 17);

  y += boxHeight + 8;

  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  const footerY = H - 15;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(M, footerY, W - M, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('DermAI • Sukkur IBA University • AI-Powered Skin Disease Classification System', M, footerY + 5);
  doc.text(`Report generated: ${new Date().toLocaleString()}`, M, footerY + 10);
  doc.text('Page 1 of 1', W - M, footerY + 5, { align: 'right' });

  // Save the PDF
  const filename = `DermAI_Report_${fullName}_${data.predictedClass}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}