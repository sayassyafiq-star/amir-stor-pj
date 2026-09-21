import React, { useState, useMemo } from 'react';
import { RecordItem, LaporanFilterType, Workspace } from '../types';
import { DEFAULT_WORKSPACE } from '../data/initialData';
import { 
  Printer, 
  Search, 
  Calendar, 
  User, 
  BookOpen, 
  Tag, 
  FileText, 
  Trash2, 
  Download,
  Filter,
  X,
  Clock,
  RotateCcw,
  ArrowUpDown,
  School,
  FileDown
} from 'lucide-react';
import { 
  formatMalaysianDate, 
  formatMalaysianDateTime, 
  getSundayToSaturdayWeekRange, 
  getMonthRange, 
  getYearRange, 
  getTodayYMD 
} from '../utils/dateUtils';
import { downloadAmirPdfReport, printAmirPdfReport } from '../services/pdfReportGenerator';

interface LaporanViewProps {
  records: RecordItem[];
  activeWorkspace?: Workspace;
  onDeleteRecord: (id: string) => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({ 
  records, 
  activeWorkspace,
  onDeleteRecord 
}) => {
  const [filterType, setFilterType] = useState<LaporanFilterType>('hari');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Sort order: default to 'asc' (Awal -> Lewat, as required by institutional report spec)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const currentWorkspace = activeWorkspace || DEFAULT_WORKSPACE;

  // Computed date range based on selected filter
  const activeDateRange = useMemo(() => {
    const todayStr = getTodayYMD();

    if (filterType === 'hari') {
      return {
        label: `Hari Ini (${formatMalaysianDate(todayStr)})`,
        startDateStr: todayStr,
        endDateStr: todayStr,
        displayRange: `${formatMalaysianDate(todayStr)}`,
      };
    }

    if (filterType === 'minggu') {
      const week = getSundayToSaturdayWeekRange(new Date());
      return {
        label: `Minggu Ini (Ahad – Sabtu)`,
        startDateStr: week.startDateStr,
        endDateStr: week.endDateStr,
        displayRange: `${formatMalaysianDate(week.startDateStr)} – ${formatMalaysianDate(week.endDateStr)}`,
      };
    }

    if (filterType === 'bulan') {
      const month = getMonthRange(new Date());
      return {
        label: `Bulan Ini`,
        startDateStr: month.startDateStr,
        endDateStr: month.endDateStr,
        displayRange: `${formatMalaysianDate(month.startDateStr)} – ${formatMalaysianDate(month.endDateStr)}`,
      };
    }

    if (filterType === 'tahun') {
      const year = getYearRange(new Date());
      return {
        label: `Tahun Ini`,
        startDateStr: year.startDateStr,
        endDateStr: year.endDateStr,
        displayRange: `${formatMalaysianDate(year.startDateStr)} – ${formatMalaysianDate(year.endDateStr)}`,
      };
    }

    // Custom
    const s = startDate || 'Awal';
    const e = endDate || 'Kini';
    const sFormatted = startDate ? formatMalaysianDate(startDate) : 'Awal';
    const eFormatted = endDate ? formatMalaysianDate(endDate) : 'Kini';

    return {
      label: `Julat Tarikh (${sFormatted} → ${eFormatted})`,
      startDateStr: startDate,
      endDateStr: endDate,
      displayRange: `${sFormatted} – ${eFormatted}`,
    };
  }, [filterType, startDate, endDate]);

  // Filter & Sort Logic:
  // MUST filter and sort strictly using "Tarikh & Masa Ambil" (item.tarikhMasa), NOT record creation timestamp
  // Order: 1. Tarikh paling awal -> paling lewat; 2. Dalam tarikh yang sama, masa paling awal -> paling lewat
  const filteredAndSortedRecords = useMemo(() => {
    return records
      .filter((item) => {
        // Extract YYYY-MM-DD from "Tarikh & Masa Ambil"
        const ambilDateStr = item.tarikhMasa.slice(0, 10);

        if (filterType === 'hari') {
          if (ambilDateStr !== activeDateRange.startDateStr) return false;
        } else if (filterType === 'minggu') {
          if (ambilDateStr < activeDateRange.startDateStr || ambilDateStr > activeDateRange.endDateStr) {
            return false;
          }
        } else if (filterType === 'bulan') {
          if (ambilDateStr < activeDateRange.startDateStr || ambilDateStr > activeDateRange.endDateStr) {
            return false;
          }
        } else if (filterType === 'tahun') {
          if (ambilDateStr < activeDateRange.startDateStr || ambilDateStr > activeDateRange.endDateStr) {
            return false;
          }
        } else if (filterType === 'custom') {
          if (startDate && ambilDateStr < startDate) return false;
          if (endDate && ambilDateStr > endDate) return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const match =
            item.namaGuru.toLowerCase().includes(q) ||
            item.kelas.toLowerCase().includes(q) ||
            item.aktivitiSebab.toLowerCase().includes(q) ||
            item.catatan.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Strict sort by "Tarikh & Masa Ambil"
        if (sortOrder === 'asc') {
          return a.tarikhMasa.localeCompare(b.tarikhMasa);
        } else {
          return b.tarikhMasa.localeCompare(a.tarikhMasa);
        }
      });
  }, [records, filterType, activeDateRange, startDate, endDate, searchQuery, sortOrder]);

  // Clear filters
  const handleClearFilter = () => {
    setFilterType('hari');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setSortOrder('asc');
  };

  // Download PDF Handler (institutional/bank-grade A4 PDF)
  const handleDownloadPDF = () => {
    downloadAmirPdfReport({
      records: filteredAndSortedRecords,
      workspace: currentWorkspace,
      filterLabel: activeDateRange.label,
      startDateStr: activeDateRange.startDateStr,
      endDateStr: activeDateRange.endDateStr,
    });
  };

  // Print Report Handler (triggers high-fidelity PDF print preview or window.print)
  const handlePrint = () => {
    try {
      printAmirPdfReport({
        records: filteredAndSortedRecords,
        workspace: currentWorkspace,
        filterLabel: activeDateRange.label,
        startDateStr: activeDateRange.startDateStr,
        endDateStr: activeDateRange.endDateStr,
      });
    } catch {
      window.print();
    }
  };

  const handleExportCSV = () => {
    if (filteredAndSortedRecords.length === 0) return;

    const headers = [
      'Tarikh & Masa Ambil',
      'Nama Guru',
      'Kelas',
      'Aktiviti / Sebab',
      'Catatan',
      'Tarikh & Masa Rekod (Sistem)',
    ];

    const rows = filteredAndSortedRecords.map((r) => {
      const ambilFormatted = formatMalaysianDateTime(r.tarikhMasa).full;
      const sistemFormatted = r.createdTarikhMasa || formatMalaysianDateTime(r.createdAt).full;
      return [
        `"${ambilFormatted}"`,
        `"${r.namaGuru.replace(/"/g, '""')}"`,
        `"${r.kelas.replace(/"/g, '""')}"`,
        `"${r.aktivitiSebab.replace(/"/g, '""')}"`,
        `"${r.catatan.replace(/"/g, '""')}"`,
        `"${sistemFormatted}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AMiR_Laporan_${filterType}_${getTodayYMD()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. PRINT-ONLY HEADER (Official Bank / Institutional Grade) */}
      {/* ========================================================================= */}
      <div className="hidden print:block mb-6 text-left">
        <div className="border-b-2 border-teal-800 pb-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            AMiR — AMBIL ISI REKOD
          </h1>
          <h2 className="text-base font-bold text-teal-800 mt-0.5">
            LAPORAN REKOD PENGAMBILAN STOR PJ
          </h2>
        </div>

        {/* Metadata info block */}
        <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs grid grid-cols-2 gap-y-2 gap-x-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Sekolah</span>
            <span className="font-bold text-slate-900 text-sm">{currentWorkspace.namaSekolah}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tempoh Laporan</span>
            <span className="font-bold text-slate-900 text-sm">{activeDateRange.displayRange}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kod Sekolah & Nama Stor</span>
            <span className="font-bold text-slate-900 text-sm">{currentWorkspace.kodSekolah} • {currentWorkspace.namaStor}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jumlah Rekod</span>
            <span className="font-bold text-slate-900 text-sm">{filteredAndSortedRecords.length} Rekod Pengambilan</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ON-SCREEN HEADER & CONTROLS (Hidden during Print) */}
      {/* ========================================================================= */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                Laporan & Log Ambil
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                {filteredAndSortedRecords.length} rekod
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-teal-700 font-semibold">
                <School className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentWorkspace.namaSekolah} ({currentWorkspace.kodSekolah})</span>
              </span>
              <span>•</span>
              <span>Disusun mengikut <strong className="text-slate-700">Tarikh & Masa Ambil</strong></span>
            </div>
          </div>

          {/* Action Buttons: Download PDF (Primary), Cetak Laporan & CSV */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-pdf"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-900/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
              title="Muat turun fail PDF rasmi A4 standard institusi"
            >
              <FileDown className="w-4 h-4 text-teal-200" />
              <span>Download PDF</span>
            </button>

            <button
              id="btn-print-laporan"
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer hover:border-slate-400"
              title="Cetak format laporan"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              disabled={filteredAndSortedRecords.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Eksport spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          {/* Main Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Tempoh:</span>
              </span>

              {/* Hari Ini */}
              <button
                id="filter-btn-hari"
                onClick={() => setFilterType('hari')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'hari'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hari Ini
              </button>

              {/* Minggu Ini (Ahad - Sabtu) */}
              <button
                id="filter-btn-minggu"
                onClick={() => setFilterType('minggu')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'minggu'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Minggu Ini (Ahad–Sabtu)
              </button>

              {/* Bulan Ini */}
              <button
                id="filter-btn-bulan"
                onClick={() => setFilterType('bulan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'bulan'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Bulan Ini
              </button>

              {/* Tahun Ini */}
              <button
                id="filter-btn-tahun"
                onClick={() => setFilterType('tahun')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'tahun'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tahun Ini
              </button>

              {/* Tarikh Mula -> Tarikh Akhir */}
              <button
                id="filter-btn-custom"
                onClick={() => setFilterType('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'custom'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tarikh Mula → Tarikh Akhir
              </button>
            </div>

            {/* Clear Filter Button */}
            {(filterType !== 'hari' || searchQuery || startDate || endDate || sortOrder !== 'asc') && (
              <button
                id="btn-clear-filter"
                onClick={handleClearFilter}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Tapisan</span>
              </button>
            )}
          </div>

          {/* Custom Date Range Row (If Custom selected) */}
          {filterType === 'custom' && (
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Tarikh Mula:</span>
                <input
                  type="date"
                  id="filter-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Tarikh Akhir:</span>
                <input
                  type="date"
                  id="filter-end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
              <span className="text-xs text-teal-700 font-medium italic">
                (Memadankan mengikut Tarikh & Masa Ambil)
              </span>
            </div>
          )}

          {/* Search bar, Sort Order & Active Range Indicator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-laporan-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari guru, kelas, aktiviti atau alatan..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Sort Order Selector */}
              <button
                id="btn-toggle-sort-order"
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Susun ikut Tarikh & Masa Ambil"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-teal-700" />
                <span>{sortOrder === 'asc' ? 'Awal → Lewat (Laporan Rasmi)' : 'Terkini Dahulu'}</span>
              </button>

              <div className="text-xs font-semibold text-slate-500 text-right">
                <span>{activeDateRange.displayRange}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRINTABLE / DESKTOP TABLE VIEW */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider print:bg-slate-100 print:text-teal-900">
                <th className="py-3.5 px-4 w-44">Tarikh & Masa Ambil</th>
                <th className="py-3.5 px-4 w-48">Nama Guru</th>
                <th className="py-3.5 px-3 w-28">Kelas</th>
                <th className="py-3.5 px-4 w-48">Aktiviti / Sebab</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="no-print py-3.5 px-3 text-right w-16">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {filteredAndSortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-sm text-slate-600">Tiada rekod ditemui</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cuba ubah tapisan tarikh atau carian perkataan di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRecords.map((item) => {
                  const ambilDateTime = formatMalaysianDateTime(item.tarikhMasa);
                  const systemTarikhMasa = item.createdTarikhMasa || formatMalaysianDateTime(item.createdAt).full;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-teal-50/30 transition-colors group print:hover:bg-transparent"
                    >
                      {/* 1. Tarikh & Masa Ambil (Primary Sort & Event Date) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm font-display">
                          {ambilDateTime.datePart}
                        </div>
                        <div className="text-xs text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-teal-600 no-print" />
                          <span>{ambilDateTime.timePart}</span>
                        </div>
                        <div className="no-print text-[10px] text-slate-400 mt-1">
                          Direkod: {systemTarikhMasa}
                        </div>
                      </td>

                      {/* 2. Nama Guru */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.namaGuru}
                        </div>
                      </td>

                      {/* 3. Kelas */}
                      <td className="py-3.5 px-3 align-top">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200/60 print:border-none print:p-0">
                          {item.kelas || '—'}
                        </span>
                      </td>

                      {/* 4. Aktiviti / Sebab */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {item.aktivitiSebab || '—'}
                        </div>
                      </td>

                      {/* 5. Catatan (Wraps cleanly without truncation) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                          {item.catatan || '—'}
                        </div>
                      </td>

                      {/* 6. On-screen Action (Hidden in print) */}
                      <td className="no-print py-3.5 px-3 align-top text-right">
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                onDeleteRecord(item.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                            >
                              Padam
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            title="Padam rekod"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Footer strictly per requirement 7 */}
      <div className="hidden print:flex justify-between items-center text-xs text-slate-500 pt-4 mt-6 border-t border-slate-200">
        <span className="font-bold text-slate-600">AMiR — Ambil Isi Rekod | Rekod Stor PJ</span>
        <span>Halaman 1 daripada 1</span>
      </div>
    </div>
  );
};
