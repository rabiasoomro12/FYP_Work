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
    explanation: 'Melanoma is the most serious type of skin cancer that begins in melanocytes — the cells that produce skin pigment (melanin). Unlike other skin cancers, melanoma can spread quickly through the lymph nodes and blood to vital organs including the lungs, liver, brain, and bones if not caught early. It accounts for only 1% of skin cancers but causes the majority of skin cancer deaths.\n\nEarly warning signs follow the ABCDE rule: Asymmetry (one half unlike the other), Border (irregular or blurred edges), Color (varied shades of brown, black, red, white or blue), Diameter (larger than 6mm), and Evolving (changing in size, shape or color over weeks or months).\n\nWhile melanoma is dangerous, it is highly treatable when detected early — the 5-year survival rate for early-stage melanoma is over 98%. Treatment options include surgical excision, immunotherapy, targeted therapy, radiation, and in advanced cases, chemotherapy. This result indicates a high-probability AI detection — it is essential to seek immediate evaluation by a board-certified dermatologist for proper diagnosis and treatment planning.',
    precautions: [
      'Schedule an urgent appointment with a dermatologist (ideally within 1-2 weeks)',
      'Avoid all sun exposure and tanning beds — use SPF 50+ broad-spectrum sunscreen daily',
      'Perform full-body skin checks monthly and document any changes with photographs',
      'Do NOT attempt to remove, freeze, or apply any creams to the lesion yourself',
      'Keep the affected area clean, dry, and protected from irritation or friction',
      'Inform your doctor of any personal or family history of skin cancer',
    ],
  },
  bcc: {
    explanation: 'Basal Cell Carcinoma (BCC) is the most common form of skin cancer, accounting for about 80% of all skin cancer cases. It develops in the basal cells found in the deepest layer of the epidermis. BCC grows slowly and rarely spreads (metastasizes) to other parts of the body, but it can cause significant local damage by invading surrounding tissues including bone and cartilage if left untreated for months or years.\n\nBCC typically appears as a pearly or waxy bump, a flat flesh-colored or brown scar-like lesion, a bleeding or scabbing sore that heals and returns, or a pink growth with raised rolled edges. It is most commonly found on sun-exposed areas like the face, ears, neck, scalp, shoulders, and back.\n\nTreatment is highly effective — options include surgical excision, Mohs micrographic surgery (for facial lesions), electrodesiccation and curettage, cryotherapy, topical medications, and in rare advanced cases, radiation or targeted therapy. The cure rate for properly treated BCC exceeds 95%.',
    precautions: [
      'Consult a dermatologist within 2-4 weeks for proper evaluation and treatment',
      'Protect all sun-exposed skin with SPF 50+ sunscreen, clothing, and wide-brimmed hats',
      'Avoid picking, scratching, or attempting to remove the lesion',
      'Schedule regular full-body skin examinations every 6-12 months',
      'Report any bleeding, oozing, crusting, or sudden changes to your doctor',
      'Consider Mohs surgery if the lesion is on the face for best cosmetic outcome',
    ],
  },
  akiec: {
    explanation: 'Actinic Keratosis (AK), also called solar keratosis, is a rough, scaly patch of skin caused by years of cumulative sun exposure or tanning bed use. It is considered pre-cancerous — meaning it is not yet cancer but can progress to squamous cell carcinoma if left untreated. Studies show that approximately 5-10% of actinic keratoses may transform into skin cancer over time.\n\nAKs typically appear as small, rough, sandpaper-like spots that may be red, pink, brown, or flesh-colored. They are commonly found on sun-damaged areas such as the face, ears, bald scalp, forearms, and backs of hands. Some may itch, burn, or feel tender.\n\nTreatment is important and effective — options include cryotherapy (freezing with liquid nitrogen), topical creams (5-fluorouracil, imiquimod, diclofenac), photodynamic therapy (PDT), chemical peels, and laser resurfacing. Treatment prevents progression to skin cancer and improves skin health.',
    precautions: [
      'Seek treatment from a dermatologist within 4-6 weeks',
      'Apply broad-spectrum SPF 50+ sunscreen to all exposed skin every day',
      'Wear UV-protective clothing, wide-brimmed hats, and sunglasses outdoors',
      'Completely avoid tanning beds and minimize direct sun exposure (10 AM - 4 PM)',
      'Schedule annual full-body skin examinations with a dermatologist',
      'Treat all affected areas — AKs often indicate widespread sun damage',
    ],
  },
  bkl: {
    explanation: 'Benign Keratosis, commonly known as seborrheic keratosis, is a harmless, non-cancerous skin growth that typically appears with aging. These growths are extremely common — most people develop at least one by age 50. They are not contagious and do not turn into cancer.\n\nSeborrheic keratoses appear as waxy, wart-like, or stuck-on growths ranging in color from light tan to dark brown or black. They can be flat or raised and often have a rough, scaly, or velvety surface. Common locations include the face, chest, back, and abdomen, though they can appear anywhere except the palms and soles.\n\nNo treatment is medically necessary unless the growth becomes irritated by clothing, bleeds, itches, or is cosmetically bothersome. Removal options include cryotherapy (freezing), curettage (scraping), electrocautery, or laser removal — all performed by a dermatologist. It is important not to pick at or scratch the growth, as this can cause infection or scarring.',
    precautions: [
      'No treatment is medically required — these are harmless growths',
      'Monitor periodically for any changes in size, shape, texture, or color',
      'Can be safely removed by a dermatologist if irritated or for cosmetic reasons',
      'Maintain a gentle skincare routine with moisturizer to prevent dryness and itching',
      'Schedule annual skin check-ups to monitor all skin lesions',
      'Do NOT scratch, pick, or attempt to remove the growth at home',
    ],
  },
  df: {
    explanation: 'Dermatofibroma is a common, completely benign (non-cancerous) skin nodule that forms as a reactive overgrowth of fibrous tissue in the dermis. It often develops after minor skin trauma such as an insect bite, a thorn prick, or an ingrown hair. These are harmless and have no potential to become cancerous.\n\nDermatofibromas typically appear as small (3-10mm), firm, dome-shaped bumps that may be pink, red, gray, or brown. When pinched, they often dimple inward — a characteristic sign called the "dimple sign". They are most commonly found on the legs of women, but can occur on the arms, trunk, and other areas.\n\nNo treatment is necessary unless the lesion becomes painful, itchy, grows rapidly, or is cosmetically undesirable. If removal is desired, surgical excision by a dermatologist is the preferred method. It is important to note that complete removal may leave a scar that is larger than the original lesion.',
    precautions: [
      'No treatment required — dermatofibromas are completely harmless',
      'Avoid scratching, picking, or irritating the area with tight clothing',
      'Monitor the lesion very rarely — changes are extremely uncommon',
      'Surgical removal is an option if the lesion causes pain, itching, or cosmetic concern',
      'Keep the skin moisturized to prevent irritation from dryness',
      'Consult a dermatologist if you notice rapid growth, bleeding, or color change',
    ],
  },
  nv: {
    explanation: 'Melanocytic Nevus, commonly known as a mole, is a benign cluster of melanocytes (pigment-producing cells) that appears as a small, pigmented spot on the skin. Most people have between 10 and 40 moles that develop during childhood and adolescence. The vast majority of moles remain completely harmless throughout life.\n\nMoles can be flat or raised, round or oval, and range in color from pink to flesh-toned to dark brown. They may darken during pregnancy or with sun exposure. While most moles are benign, having many moles or atypical (dysplastic) moles increases the risk of developing melanoma.\n\nRegular monitoring using the ABCDE rule is essential: Asymmetry, Border irregularity, Color variation, Diameter over 6mm, and Evolution or change over time. Any mole that changes in size, shape, color, or begins to itch, bleed, or crust should be evaluated by a dermatologist. Prophylactic removal is generally not recommended unless a mole shows suspicious features or is repeatedly irritated.',
    precautions: [
      'Perform monthly self-skin examinations using the ABCDE rule',
      'Take clear photographs of all moles to track changes over months and years',
      'Apply SPF 50+ broad-spectrum sunscreen daily to all exposed skin',
      'Completely avoid tanning beds — they significantly increase melanoma risk',
      'Schedule annual professional skin examinations with a dermatologist',
      'Report any mole that changes, itches, bleeds, or develops irregular borders',
    ],
  },
  vasc: {
    explanation: 'Vascular Lesions are benign abnormalities of blood vessels in the skin. They include hemangiomas (strawberry marks), cherry angiomas (small red dots), port-wine stains, and spider angiomas. These are very common — over 75% of adults develop cherry angiomas by age 75. They are harmless and have no cancer potential.\n\nVascular lesions appear as red, purple, or bluish spots or bumps caused by dilated or malformed blood vessels close to the skin surface. Cherry angiomas are small, bright red, dome-shaped papules. Hemangiomas may be present at birth or appear in early infancy. Most infantile hemangiomas shrink and fade on their own by age 5-10.\n\nTreatment is rarely necessary for medical reasons. Options for cosmetic improvement include laser therapy (pulsed dye laser), intense pulsed light (IPL), or surgical removal if the lesion bleeds easily or causes discomfort. Any vascular lesion that bleeds spontaneously, grows rapidly, or changes appearance should be evaluated.',
    precautions: [
      'Most vascular lesions require no treatment and are completely harmless',
      'Monitor for any spontaneous bleeding, rapid growth, or sudden color change',
      'Protect the area from trauma, scratching, or irritation',
      'Cosmetic treatment is available — laser therapy offers excellent results for visible lesions',
      'Consult a dermatologist if the lesion bleeds frequently or changes significantly',
      'Infant hemangiomas near the eyes, nose, or mouth require prompt medical evaluation',
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

function checkPageBreak(doc: jsPDF, currentY: number, neededSpace: number, pageHeight: number): number {
  if (currentY + neededSpace > pageHeight - 25) {
    doc.addPage();
    return 25;
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

  const fullName = data.patientName ?? data.patientEmail.split('@')[0];

  // ═══════════════════════════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 32, 'F');
  
  // Logo circle
  doc.setFillColor(13, 148, 136);
  doc.circle(M + 5, 16, 5, 'F');
  
  // Brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('DermAI', M + 13, 14);
  
  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(200, 200, 200);
  doc.text('AI-Powered Skin Disease Classification', M + 13, 19);
  doc.setTextColor(180, 180, 180);
  doc.text('Sukkur IBA University', M + 13, 23);
  
  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('PATIENT REPORT', W - M, 14, { align: 'right' });
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 19, { align: 'right' });
  
  y = 40;

  // ═══════════════════════════════════════════════════════════
  // PATIENT INFORMATION
  // ═══════════════════════════════════════════════════════════
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 20, 3, 3, 'FD');

  // Patient Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PATIENT NAME', M + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(fullName, M + 6, y + 14);

  // Email
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('EMAIL', M + 90, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(data.patientEmail, M + 90, y + 14);

  y += 26;

  // ═══════════════════════════════════════════════════════════
// DIAGNOSIS CARD - Fixed Alignment
// ═══════════════════════════════════════════════════════════
doc.setFillColor(15, 23, 42);
doc.roundedRect(M, y, CW, 30, 3, 3, 'F');

// Column widths
const col1W = 75;   // Condition badge
const col2W = 50;   // Confidence
const col3W = 42;   // Risk

// Column headers
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
doc.setTextColor(148, 163, 184);
doc.text('CONDITION', M + 8, y + 7);
doc.text('CONFIDENCE', M + col1W + 8, y + 7);
doc.text('RISK', W - M - col3W + 8, y + 7);

// Condition badge - Left
doc.setFillColor(...riskRgb);
doc.roundedRect(M + 6, y + 10, col1W - 6, 11, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(255, 255, 255);
doc.text(`${data.predictedClass.toUpperCase()} - ${data.predictedLabel}`, M + col1W / 2, y + 17, { align: 'center' });

// Confidence - Center
doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text(`${(data.confidence * 100).toFixed(1)}%`, M + col1W + col2W / 2, y + 17, { align: 'center' });

// Risk badge - Right
doc.setFillColor(255, 255, 255);
doc.roundedRect(W - M - col3W, y + 10, col3W - 6, 11, 2, 2, 'F');
doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(...riskRgb);
doc.text(data.risk.toUpperCase(), W - M - col3W / 2, y + 17, { align: 'center' });

y += 36;

  // ═══════════════════════════════════════════════════════════
// CONDITION EXPLANATION
// ═══════════════════════════════════════════════════════════
y = checkPageBreak(doc, y, 60, H);

doc.setFont('helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(0, 0, 0);
doc.text('CONDITION EXPLANATION', M, y);
y += 3;
doc.setDrawColor(13, 148, 136);
doc.setLineWidth(0.4);
doc.line(M, y, M + CW, y);
y += 7;

const explanationLines = doc.splitTextToSize(conditionInfo.explanation, CW - 16); // More padding
const lineHeight = 5.5;  // Better line spacing
const expBoxHeight = explanationLines.length * lineHeight + 14;

doc.setFillColor(240, 253, 250);
doc.setDrawColor(13, 148, 136, 0.3);
doc.setLineWidth(0.5);
doc.roundedRect(M, y - 2, CW, expBoxHeight, 3, 3, 'FD');

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(30, 41, 59);  // Darker text for readability
doc.text(explanationLines, M + 8, y + 6);  // More left padding

y += expBoxHeight + 10;
  // ═══════════════════════════════════════════════════════════
  // RECOMMENDED GUIDELINES
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 30, H);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('RECOMMENDED GUIDELINES', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 7;

  const allPrecautions = [...conditionInfo.precautions, ...GENERAL_PRECAUTIONS];
  
  allPrecautions.forEach((precaution, index) => {
    y = checkPageBreak(doc, y, 8, H);

    const bulletLines = doc.splitTextToSize(precaution, CW - 10);

    // Bullet point
    doc.setFillColor(13, 148, 136);
    doc.circle(M + 3, y + 2.5, 1.8, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(bulletLines, M + 8, y + 5);

    y += bulletLines.length * 4.5 + 4;

    // After condition-specific precautions, add a sub-header for general tips
    if (index === conditionInfo.precautions.length - 1) {
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('GENERAL SKIN HEALTH TIPS', M + 8, y);
      y += 5;
    }
  });

  y += 5;

  // ═══════════════════════════════════════════════════════════
  // PROBABILITY DISTRIBUTION
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 100, H);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('PROBABILITY DISTRIBUTION', M, y);
  y += 3;
  doc.setDrawColor(13, 148, 136);
  doc.line(M, y, M + CW, y);
  y += 7;

  const barAreaX = M + 55;
  const barAreaW = CW - 72;

  for (const { cls, name: clsName, value } of sorted) {
    y = checkPageBreak(doc, y, 8, H);
    
    const isTop = cls === data.predictedClass;
    const pct = value * 100;
    const barW = Math.max((pct / 100) * barAreaW, 0.5);

    // Class code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(isTop ? riskRgb[0] : 0, isTop ? riskRgb[1] : 0, isTop ? riskRgb[2] : 0);
    doc.text(cls.toUpperCase(), M, y + 3);
    
    // Class name
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${pct.toFixed(1)}%`, W - M, y + 3, { align: 'right' });

    y += 8;
  }

  y += 6;

// ═══════════════════════════════════════════════════════════
// IMAGES
// ═══════════════════════════════════════════════════════════
if (data.previewUrl || data.gradcamUrl) {
    y = checkPageBreak(doc, y, 75, H);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
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

    // Both images present - side by side
    if (origData && gcData) {
      // Left image
      doc.addImage(origData, 'JPEG', M, y, imgW, imgH, undefined, 'FAST');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(M, y, imgW, imgH);
      
      // Badge
      doc.setFillColor(0, 0, 0, 0.7);
      doc.roundedRect(M + 2, y + 2, 16, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text('ORIGINAL', M + 10, y + 5.5, { align: 'center' });

      // Right image
      doc.addImage(gcData, 'JPEG', M + imgW + 6, y, imgW, imgH, undefined, 'FAST');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(M + imgW + 6, y, imgW, imgH);
      
      // Badge
      doc.setFillColor(0, 0, 0, 0.7);
      doc.roundedRect(M + imgW + 8, y + 2, 16, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text('GRAD-CAM', M + imgW + 16, y + 5.5, { align: 'center' });

      // Captions centered under each image
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text('Original Image', M + imgW / 2, y + imgH + 5, { align: 'center' });
      doc.text('Grad-CAM Heatmap', M + imgW + 6 + imgW / 2, y + imgH + 5, { align: 'center' });
    }
    // Only one image - center it
    else if (origData || gcData) {
      const singleImg = origData || gcData!;
      const label = origData ? 'ORIGINAL' : 'GRAD-CAM';
      const caption = origData ? 'Original Image' : 'Grad-CAM Heatmap';
      const centerX = M + CW / 2 - imgW / 2; // Center the image
      
      doc.addImage(singleImg, 'JPEG', centerX, y, imgW, imgH, undefined, 'FAST');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(centerX, y, imgW, imgH);
      
      // Badge
      doc.setFillColor(0, 0, 0, 0.7);
      doc.roundedRect(centerX + 2, y + 2, 16, 5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text(label, centerX + 10, y + 5.5, { align: 'center' });
      
      // Centered caption
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(caption, W / 2, y + imgH + 5, { align: 'center' });
    }

    y += imgH + 10;
  }

  // ═══════════════════════════════════════════════════════════
  // MODEL INFO
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 15, H);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('Analysis performed by ensemble of 4 AI models trained on HAM10000 dataset', M, y);
  doc.text('Sukkur IBA University — For research purposes only', M, y + 4);
  y += 10;

  // ═══════════════════════════════════════════════════════════
  // DISCLAIMER
  // ═══════════════════════════════════════════════════════════
  y = checkPageBreak(doc, y, 25, H);

  const disclaimerText = 'MEDICAL DISCLAIMER: This AI-generated report is for research and educational purposes only. It does not constitute medical advice or diagnosis. Always consult a licensed dermatologist for proper evaluation and treatment.';
  
  const discLines = doc.splitTextToSize(disclaimerText, CW - 14);
  const boxHeight = discLines.length * 5 + 14;

  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, y, CW, boxHeight, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  doc.text('MEDICAL DISCLAIMER', M + 7, y + 6);

  doc.setDrawColor(245, 158, 11, 0.3);
  doc.setLineWidth(0.2);
  doc.line(M + 7, y + 9, W - M - 7, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  doc.text(discLines, M + 7, y + 15);

  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  const footerY = H - 12;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(M, footerY, W - M, footerY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text('DermAI • Sukkur IBA University', M, footerY + 5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, W - M, footerY + 5, { align: 'right' });

  // Save
  const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `DermAI_Report_${safeName}_${data.predictedClass}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}