import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ScanRecord {
  id: string;
  user_id: string;
  predicted_class: string;
  predicted_label: string;
  confidence: number;
  probabilities: Record<string, number>;
  created_at: string;
  patient_email?: string;
  patient_name?: string;
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

const RISK: Record<string, string> = {
  mel: 'Critical', bcc: 'High', akiec: 'Moderate',
  bkl: 'Low', df: 'Low', nv: 'Low', vasc: 'Low',
};

const RISK_COLORS: Record<string, [number, number, number]> = {
  Critical: [239, 68, 68], High: [245, 158, 11],
  Moderate: [234, 179, 8], Low: [16, 185, 129],
};

export function generateDoctorReport(scans: ScanRecord[], doctorEmail: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;
  let y = 0;

  const totalScans = scans.length;
  const uniquePatients = new Set(scans.map((s) => s.user_id)).size;
  const classCounts: Record<string, number> = {};
  for (const s of scans) {
    classCounts[s.predicted_class] = (classCounts[s.predicted_class] ?? 0) + 1;
  }
  const sortedClasses = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);
  const topCondition = sortedClasses[0] ? CLASS_NAMES[sortedClasses[0][0]] ?? sortedClasses[0][0] : '—';

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFillColor(99, 102, 241);
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
  doc.text('DOCTOR / ADMINISTRATOR REPORT', W - M, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W - M, 22, { align: 'right' });
  y = 48;

  // ── Doctor Info ───────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('ADMINISTRATOR INFORMATION', M, y);
  y += 3;
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.4);
  doc.line(M, y, M + CW, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Doctor / Admin:', M, y);
  doc.setFont('helvetica', 'bold');
  doc.text(doctorEmail, M + 35, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Report Date:', M + 100, y);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date().toLocaleDateString(), M + 122, y);
  y += 14;

  // ── Summary Cards ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('SUMMARY', M, y);
  y += 3;
  doc.setDrawColor(99, 102, 241);
  doc.line(M, y, M + CW, y);
  y += 7;

  const cardW = (CW - 8) / 3;
  const cards = [
    { label: 'Total Scans', value: String(totalScans), color: [13, 148, 136] as [number, number, number] },
    { label: 'Unique Patients', value: String(uniquePatients), color: [99, 102, 241] as [number, number, number] },
    { label: 'Top Condition', value: topCondition, color: [245, 158, 11] as [number, number, number] },
  ];
  for (let i = 0; i < cards.length; i++) {
    const cx = M + i * (cardW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cardW, 20, 2, 2, 'FD');
    doc.setFillColor(...cards[i].color);
    doc.roundedRect(cx, y, 3, 20, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...cards[i].color);
    const valX = cx + cardW / 2 + 2;
    if (cards[i].value.length > 10) {
      doc.setFontSize(8);
      doc.text(cards[i].value, valX, y + 10, { align: 'center' });
    } else {
      doc.text(cards[i].value, valX, y + 12, { align: 'center' });
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(cards[i].label, valX, y + 18, { align: 'center' });
  }
  y += 28;

  // ── Condition Distribution ────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CONDITION DISTRIBUTION', M, y);
  y += 3;
  doc.setDrawColor(99, 102, 241);
  doc.line(M, y, M + CW, y);
  y += 7;

  const barAreaW = CW - 70;
  for (const [cls, count] of sortedClasses) {
    const pct = totalScans > 0 ? (count / totalScans) * 100 : 0;
    const barW = (pct / 100) * barAreaW;
    const risk = RISK[cls] ?? 'Low';
    const rColor = RISK_COLORS[risk] ?? RISK_COLORS.Low;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${cls}`, M, y + 3.5);
    doc.text(CLASS_NAMES[cls] ?? cls, M + 14, y + 3.5);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(M + 58, y, barAreaW, 5, 1, 1, 'F');
    if (barW > 0.5) {
      doc.setFillColor(...rColor);
      doc.roundedRect(M + 58, y, barW, 5, 1, 1, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${count} (${pct.toFixed(1)}%)`, W - M, y + 3.5, { align: 'right' });
    y += 9;
  }
  y += 6;

  // ── Scan History Table ────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('DETAILED SCAN HISTORY', M, y);
  y += 3;
  doc.setDrawColor(99, 102, 241);
  doc.line(M, y, M + CW, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['#', 'Patient', 'Date', 'Condition', 'Label', 'Confidence', 'Risk']],
    body: scans.map((s, i) => [
      String(i + 1),
      s.patient_email ?? s.user_id.slice(0, 8) + '...',
      new Date(s.created_at).toLocaleDateString(),
      s.predicted_class.toUpperCase(),
      s.predicted_label,
      `${(s.confidence * 100).toFixed(1)}%`,
      RISK[s.predicted_class] ?? 'Low',
    ]),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 38 },
      2: { cellWidth: 22 },
      3: { cellWidth: 18 },
      4: { cellWidth: 38 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18 },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const risk = data.cell.raw as string;
        const c = RISK_COLORS[risk] ?? RISK_COLORS.Low;
        data.cell.styles.textColor = c;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // ── Footer on all pages ───────────────────────────────────
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(M, H - 12, W - M, H - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('DermAI · Sukkur IBA University · Confidential Administrator Report', M, H - 7);
    doc.text(`Page ${p} of ${pageCount}`, W - M, H - 7, { align: 'right' });
  }

  const filename = `DermAI_Doctor_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
