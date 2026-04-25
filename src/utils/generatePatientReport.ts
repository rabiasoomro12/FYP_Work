import jsPDF from 'jspdf';

export interface PatientReportData {
  patientEmail: string;
  patientName?: string;
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

// Helper function to check if we need a new page
function checkPageBreak(doc: jsPDF, currentY: number, neededSpace: number, pageHeight: number): number {
  if (currentY + neededSpace > pageHeight - 20) {
    doc.addPage();
    return 20; // Reset Y to top margin
  }
  return currentY;
}

export async function generatePatientReport(data: PatientReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;
  let y = 20;

  const riskRgb = RISK_COLORS[data.risk] ?? RISK_COLORS.Low;
  const sorted = Object.entries(data.probabilities)
    .map(([cls, val]) => ({ cls, name: CLASS_NAMES[cls] ?? cls, value: val }))
    .sort((a, b) => b.value - a.value);

  const conditionInfo = CONDITION_EXPLANATIONS[data.predictedClass] ?? {
    explanation: 'Please consult a dermatologist for detailed information about this condition.',
    precautions: ['Consult a healthcare professional for personalized advice.'],
  };

  const fullName = data.patientName || data.patientEmail.split('@')[0];

  // ═══════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 35, 'F');
  doc.setFillColor(13, 148, 136);
  doc.roundedRect(M, 8, 8, 8, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('DermAI', M + 11, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('AI-Powered Skin Disease Classification • Sukkur IBA University', M + 11, 19);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('PATIENT REPORT', W - M, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 19, { align: 'right' });
  y = 42;

  // ═══════════════════════════════════════════════════════════
  // PATIENT INFORMATION CARD
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 22, 3, 3, 'FD');

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT NAME', M + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(fullName, M + 6, y + 15);

  // Email
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EMAIL', M + 90, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(data.patientEmail, M + 90, y + 15);

  y += 28;

  // ═══════════════════════════════════════════════════════════
  // DIAGNOSIS SUMMARY CARD
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(M, y, CW, 32, 3, 3, 'F');

  // Risk badge
  doc.setFillColor(...riskRgb);
  doc.roundedRect(M + 6, y + 4, 55, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`${data.predictedClass.toUpperCase()} - ${data.predictedLabel}`, M + 33.5, y + 11, { align: 'center' });

  // Confidence
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Confidence', M + 66, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`${(data.confidence * 100).toFixed(1)}%`, M + 66, y + 22);

  // Risk level
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...riskRgb);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(W - M - 45, y + 4, 39, 11, 2, 2, 'F');
  doc.text(`RISK: ${data.risk.toUpperCase()}`, W - M - 25.5, y + 11, { align: 'center' });

  y += 38;

  // ═══════════════════════════════════════════════════════════
  // CONDITION EXPLANATION
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 40, H);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CONDITION EXPLANATION', M, y);
  y += 4;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.4);
  doc.line(M, y, M + CW, y);
  y += 6;

  const explanationLines = doc.splitTextToSize(conditionInfo.explanation, CW - 8);
  const expBoxHeight = explanationLines.length * 5 + 12;
  
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(13, 148, 136, 0.2);
  doc.roundedRect(M, y - 2, CW, expBoxHeight, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(explanationLines, M + 4, y + 6);
  
  y += expBoxHeight + 8;

  // ═══════════════════════════════════════════════════════════
  // PRECAUTIONS & GUIDELINES
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 30, H);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('RECOMMENDED GUIDELINES', M, y);
  y += 4;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 7;

  const allPrecautions = [...conditionInfo.precautions, ...GENERAL_PRECAUTIONS];
  
  for (const precaution of allPrecautions) {
    y = checkPageBreak(doc, y, 10, H);
    
    const bulletLines = doc.splitTextToSize(precaution, CW - 10);
    
    // Bullet point
    doc.setFillColor(13, 148, 136);
    doc.circle(M + 3, y + 2, 1.2, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(bulletLines, M + 7, y + 5);
    
    y += bulletLines.length * 5 + 5;
  }

  y += 5;

  // ═══════════════════════════════════════════════════════════
  // PROBABILITY DISTRIBUTION
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 80, H);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('PROBABILITY DISTRIBUTION', M, y);
  y += 4;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 7;

  const barAreaX = M + 55;
  const barAreaW = CW - 72;

  for (const { cls, name: clsName, value } of sorted) {
    y = checkPageBreak(doc, y, 10, H);
    
    const isTop = cls === data.predictedClass;
    const pct = value * 100;
    const barW = Math.max((pct / 100) * barAreaW, 0.5);

    // Class label
    doc.setFont('helvetica', isTop ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(isTop ? 15 : 100, isTop ? 23 : 116, isTop ? 42 : 139);
    doc.text(cls.toUpperCase(), M, y + 3);
    doc.text(clsName, M + 14, y + 3);

    // Background bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(barAreaX, y, barAreaW, 5, 1, 1, 'F');

    // Filled bar
    if (barW > 0) {
      const barColor = isTop ? riskRgb : ([148, 163, 184] as [number, number, number]);
      doc.setFillColor(...barColor);
      doc.roundedRect(barAreaX, y, barW, 5, 1, 1, 'F');
    }

    // Percentage
    doc.setFont('helvetica', isTop ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.text(`${pct.toFixed(1)}%`, W - M, y + 3, { align: 'right' });

    y += 9;
  }

  y += 8;

  // ═══════════════════════════════════════════════════════════
  // IMAGES
  // ═══════════════════════════════════════════════════════════
  if (data.previewUrl || data.gradcamUrl) {
    y = checkPageBreak(doc, y, 70, H);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('IMAGE ANALYSIS', M, y);
    y += 4;
    doc.setDrawColor(13, 148, 136);
    doc.line(M, y, M + CW, y);
    y += 7;

    const imgH = 55;
    const imgW = (CW - 6) / 2;

    const [origData, gcData] = await Promise.all([
      data.previewUrl ? urlToDataUrl(data.previewUrl) : Promise.resolve(null),
      data.gradcamUrl ? urlToDataUrl(data.gradcamUrl) : Promise.resolve(null),
    ]);

    // Left image (Original)
    if (origData) {
      doc.addImage(origData, 'JPEG', M, y, imgW, imgH, undefined, 'FAST');
      // Image border
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(M, y, imgW, imgH);
      // Label badge
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(M + 2, y + 2, 16, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('ORIGINAL', M + 10, y + 5.5, { align: 'center' });
    } else {
      // Placeholder
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(M, y, imgW, imgH, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('No image', M + imgW / 2, y + imgH / 2, { align: 'center' });
    }

    // Right image (Grad-CAM)
    if (gcData) {
      doc.addImage(gcData, 'JPEG', M + imgW + 6, y, imgW, imgH, undefined, 'FAST');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(M + imgW + 6, y, imgW, imgH);
      // Label badge
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(M + imgW + 8, y + 2, 16, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(255, 255, 255);
      doc.text('GRAD-CAM', M + imgW + 16, y + 5.5, { align: 'center' });
    } else {
      // Placeholder
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(M + imgW + 6, y, imgW, imgH, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Not available', M + imgW + 6 + imgW / 2, y + imgH / 2, { align: 'center' });
    }

    y += imgH + 10;
  }

  // ═══════════════════════════════════════════════════════════
  // MODEL INFO (compact)
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 20, H);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Analysis by ensemble of 4 AI models trained on HAM10000 dataset', M, y);
  doc.text('Sukkur IBA University • For research purposes only', M, y + 4);
  y += 10;

  // ═══════════════════════════════════════════════════════════
  // DISCLAIMER
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 35, H);

  const disclaimerText = 'MEDICAL DISCLAIMER: This AI-generated report is for research and educational purposes ONLY. It does NOT constitute medical advice, diagnosis, or treatment recommendation. Always consult a licensed dermatologist or healthcare professional for proper evaluation. Do not delay seeking professional medical advice based on this report.';
  
  const discLines = doc.splitTextToSize(disclaimerText, CW - 10);
  const discBoxHeight = discLines.length * 4 + 14;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, CW, discBoxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text(discLines, M + 5, y + 7);

  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  const footerY = H - 12;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(M, footerY, W - M, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('DermAI • Sukkur IBA University', M, footerY + 5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, W - M, footerY + 5, { align: 'right' });

  // Save
  const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `DermAI_Report_${safeName}_${data.predictedClass}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}