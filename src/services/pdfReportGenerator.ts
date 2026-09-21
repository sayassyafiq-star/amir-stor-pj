import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RecordItem, Workspace } from '../types';
import { formatMalaysianDateTime, formatMalaysianDate } from '../utils/dateUtils';

interface GeneratePdfOptions {
  records: RecordItem[];
  workspace: Workspace;
  filterLabel: string;
  startDateStr?: string;
  endDateStr?: string;
}

/**
 * Format a YYYY-MM-DD or date string to DD-MM-YYYY for filenames
 */
function toFilenameDate(ymd?: string): string {
  if (!ymd) return 'Semua';
  const clean = ymd.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return clean;
}

/**
 * Generates an official, bank/institution-grade A4 PDF report for AMiR records.
 * Follows strict specifications:
 * - A4 Portrait
 * - Deep Teal minimal accents, clean white layout, sharp typography
 * - Sorted strictly by "Tarikh & Masa Ambil" ascending (earliest -> latest)
 * - Repeating table header, text wrapping on Catatan
 * - Header with School, Code, Store, Period, Total Records
 * - Footer with "AMiR — Ambil Isi Rekod | Rekod Stor PJ" and "Halaman X daripada Y"
 */
export function createAmirPdfDocument({
  records,
  workspace,
  filterLabel,
  startDateStr,
  endDateStr,
}: GeneratePdfOptions): jsPDF {
  // Sort strictly by Tarikh & Masa Ambil: earliest -> latest (ascending)
  const sortedRecords = [...records].sort((a, b) => a.tarikhMasa.localeCompare(b.tarikhMasa));

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // Determine period text
  let periodText = filterLabel;
  if (startDateStr && endDateStr) {
    periodText = `${formatMalaysianDate(startDateStr)} – ${formatMalaysianDate(endDateStr)}`;
  } else if (startDateStr) {
    periodText = `Mulai ${formatMalaysianDate(startDateStr)}`;
  } else if (sortedRecords.length > 0) {
    const firstDate = sortedRecords[0].tarikhMasa.slice(0, 10);
    const lastDate = sortedRecords[sortedRecords.length - 1].tarikhMasa.slice(0, 10);
    periodText = `${formatMalaysianDate(firstDate)} – ${formatMalaysianDate(lastDate)}`;
  }

  // Draw First Page Header
  const drawFirstPageHeader = () => {
    let y = 16;

    // Top Accent line (deep teal)
    doc.setFillColor(15, 118, 110); // #0f766e
    doc.rect(marginX, y, contentWidth, 1.8, 'F');
    y += 6;

    // Title: AMiR — AMBIL ISI REKOD
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('AMiR — AMBIL ISI REKOD', marginX, y);

    // Subtitle: LAPORAN REKOD PENGAMBILAN STOR PJ
    y += 5.5;
    doc.setFontSize(10.5);
    doc.setTextColor(15, 118, 110); // deep teal
    doc.text('LAPORAN REKOD PENGAMBILAN STOR PJ', marginX, y);

    y += 5;
    // Thin separator line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(marginX, y, marginX + contentWidth, y);
    y += 4.5;

    // Metadata Info Box (Institutional / Bank style 2-column layout)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(marginX, y, contentWidth, 24, 2, 2, 'FD');

    // Column 1 (Left): Nama Sekolah, Kod Sekolah, Nama Stor
    const col1X = marginX + 4;
    let metaY = y + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('NAMA SEKOLAH', col1X, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(workspace.namaSekolah || 'SK Air Merah', col1X + 28, metaY);

    metaY += 5.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('KOD SEKOLAH', col1X, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(workspace.kodSekolah || 'SKAM', col1X + 28, metaY);

    metaY += 5.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('NAMA STOR', col1X, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 118, 110);
    doc.text(workspace.namaStor || 'Stor PJ', col1X + 28, metaY);

    // Column 2 (Right): Tempoh Laporan, Jumlah Rekod, Tarikh Cetakan
    const col2X = marginX + 98;
    metaY = y + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TEMPOH LAPORAN', col2X, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(periodText, col2X + 32, metaY);

    metaY += 5.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('JUMLAH REKOD', col2X, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sortedRecords.length} Rekod Pengambilan`, col2X + 32, metaY);

    metaY += 5.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('TARIKH CETAKAN', col2X, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(formatMalaysianDateTime(Date.now()).full, col2X + 32, metaY);

    return y + 27; // bottom of header
  };

  const startY = drawFirstPageHeader();

  // Prepare table data
  // Headers strictly as specified:
  // | Tarikh & Masa Ambil | Nama Guru | Kelas | Aktiviti / Sebab | Catatan |
  const tableHeaders = [
    ['Tarikh & Masa Ambil', 'Nama Guru', 'Kelas', 'Aktiviti / Sebab', 'Catatan'],
  ];

  const tableBody = sortedRecords.map((rec) => {
    const ambil = formatMalaysianDateTime(rec.tarikhMasa);
    const dateFormatted = `${ambil.datePart}\n${ambil.timePart}`;

    return [
      dateFormatted,
      rec.namaGuru || '—',
      rec.kelas || '—',
      rec.aktivitiSebab || '—',
      rec.catatan || '—',
    ];
  });

  // If no records, show 1 empty row
  if (tableBody.length === 0) {
    tableBody.push(['—', 'Tiada rekod pengambilan bagi tempoh yang dipilih.', '—', '—', '—']);
  }

  // Draw autoTable with elegant styling
  autoTable(doc, {
    startY: startY,
    head: tableHeaders,
    body: tableBody,
    margin: { left: marginX, right: marginX, top: 22, bottom: 18 },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: [15, 23, 42], // slate-900
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2,
      cellPadding: { top: 3, right: 2.5, bottom: 3, left: 2.5 },
      overflow: 'linebreak',
      valign: 'top',
    },
    headStyles: {
      fillColor: [241, 245, 249], // slate-100 clean subtle header
      textColor: [15, 118, 110], // deep teal #0f766e
      fontStyle: 'bold',
      fontSize: 8.5,
      lineWidth: 0.3,
      lineColor: [203, 213, 225], // slate-300
    },
    alternateRowStyles: {
      fillColor: [250, 252, 253], // subtle off-white/slate tint
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' }, // Tarikh & Masa Ambil
      1: { cellWidth: 36, fontStyle: 'bold' }, // Nama Guru
      2: { cellWidth: 20 },                   // Kelas
      3: { cellWidth: 42 },                   // Aktiviti / Sebab
      4: { cellWidth: 52 },                   // Catatan (wraps cleanly)
    },
    didDrawPage: (data) => {
      // For subsequent pages (page 2+), add a slim running header
      if (data.pageNumber > 1) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 118, 110);
        doc.text('AMiR — LAPORAN REKOD PENGAMBILAN STOR PJ', marginX, 12);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`${workspace.namaSekolah} (${workspace.kodSekolah})`, marginX + contentWidth, 12, {
          align: 'right',
        });

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(marginX, 14, marginX + contentWidth, 14);
      }
    },
  });

  // Two-pass footer: Apply standard footer to ALL pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    const footerY = pageHeight - 12;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 2.5, marginX + contentWidth, footerY - 2.5);

    // Left footer text strictly as requested:
    // "AMiR — Ambil Isi Rekod | Rekod Stor PJ"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('AMiR — Ambil Isi Rekod | Rekod Stor PJ', marginX, footerY + 1.5);

    // Right footer text strictly as requested:
    // "Halaman X daripada Y"
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Halaman ${i} daripada ${totalPages}`, marginX + contentWidth, footerY + 1.5, {
      align: 'right',
    });
  }

  return doc;
}

/**
 * Downloads the generated PDF with automatic filename format:
 * AMiR_Laporan_Stor_PJ_DD-MM-YYYY_DD-MM-YYYY.pdf
 */
export function downloadAmirPdfReport(options: GeneratePdfOptions) {
  const doc = createAmirPdfDocument(options);

  // Compute dates for filename
  let fromDate = options.startDateStr;
  let toDate = options.endDateStr;

  if (!fromDate || !toDate) {
    const sorted = [...options.records].sort((a, b) => a.tarikhMasa.localeCompare(b.tarikhMasa));
    if (sorted.length > 0) {
      fromDate = fromDate || sorted[0].tarikhMasa.slice(0, 10);
      toDate = toDate || sorted[sorted.length - 1].tarikhMasa.slice(0, 10);
    } else {
      fromDate = fromDate || new Date().toISOString().slice(0, 10);
      toDate = toDate || fromDate;
    }
  }

  const fromStr = toFilenameDate(fromDate);
  const toStr = toFilenameDate(toDate);

  // Requirement 8: "AMiR_Laporan_Stor_PJ_18-09-2026_20-09-2026.pdf"
  const fileName = `AMiR_Laporan_Stor_PJ_${fromStr}_${toStr}.pdf`;
  doc.save(fileName);
}

/**
 * Opens the generated PDF in print preview / new window
 */
export function printAmirPdfReport(options: GeneratePdfOptions) {
  const doc = createAmirPdfDocument(options);
  // Using blob URL for printing
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl);
  if (printWindow) {
    printWindow.focus();
  } else {
    // Fallback if popup blocked: print current window or save
    doc.autoPrint();
    const fallbackBlobUrl = URL.createObjectURL(doc.output('blob'));
    window.open(fallbackBlobUrl, '_blank');
  }
}
