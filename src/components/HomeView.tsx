import React, { useMemo } from 'react';
import { RecordItem, NavTab, Workspace } from '../types';
import { 
  Plus, 
  Package, 
  ClipboardList, 
  Clock, 
  User, 
  BookOpen, 
  Tag, 
  FileText, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  School
} from 'lucide-react';
import { formatMalaysianDate, formatMalaysianDateTime } from '../utils/dateUtils';

interface HomeViewProps {
  records: RecordItem[];
  recordsTodayCount: number;
  setActiveTab: (tab: NavTab) => void;
  activeWorkspace?: Workspace;
  onOpenRecordDetail?: (rec: RecordItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  records,
  recordsTodayCount,
  setActiveTab,
  activeWorkspace,
}) => {
  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.tarikhMasa.localeCompare(a.tarikhMasa))
      .slice(0, 5);
  }, [records]);

  const formatDisplayTime = (isoString: string) => {
    return formatMalaysianDateTime(isoString).timePart;
  };

  const formatDisplayDate = (isoString: string) => {
    return formatMalaysianDate(isoString);
  };

  // Accent color cycle for visual delight
  const getCardAccent = (index: number) => {
    const accents = [
      {
        badge: 'bg-teal-50 text-teal-700 border-teal-200/80',
        tagBg: 'bg-cyan-50 text-cyan-700',
        borderLeft: 'border-l-4 border-l-teal-500',
        avatarBg: 'bg-teal-100 text-teal-800',
      },
      {
        badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
        tagBg: 'bg-blue-50 text-blue-700',
        borderLeft: 'border-l-4 border-l-blue-500',
        avatarBg: 'bg-blue-100 text-blue-800',
      },
      {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        tagBg: 'bg-emerald-50 text-emerald-700',
        borderLeft: 'border-l-4 border-l-emerald-500',
        avatarBg: 'bg-emerald-100 text-emerald-800',
      },
      {
        badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
        tagBg: 'bg-amber-50 text-amber-800',
        borderLeft: 'border-l-4 border-l-amber-500',
        avatarBg: 'bg-amber-100 text-amber-800',
      },
      {
        badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
        tagBg: 'bg-rose-50 text-rose-700',
        borderLeft: 'border-l-4 border-l-rose-500',
        avatarBg: 'bg-rose-100 text-rose-800',
      },
    ];
    return accents[index % accents.length];
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <section
        id="home-welcome-section"
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl shadow-teal-900/10"
      >
        {/* Soft decorative background circles */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/50 border border-teal-400/30 text-xs font-semibold text-teal-100 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{activeWorkspace ? `${activeWorkspace.namaSekolah} • ${activeWorkspace.namaStor}` : 'Stor Pendidikan Jasmani & Sukan'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display text-white">
              AMiR — Ambil Isi Rekod
            </h1>
            <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed">
              Buku log digital pantas untuk guru mencatat pengambilan peralatan sukan tanpa borang yang rumit.
            </p>
          </div>

          {/* Today Count Card */}
          <div
            id="today-records-counter"
            className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-inner"
          >
            <div className="w-13 h-13 rounded-2xl bg-white text-teal-800 flex items-center justify-center font-extrabold text-2xl shadow-md font-display">
              {recordsTodayCount}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-teal-200">
                Aktiviti Log
              </p>
              <p className="text-base sm:text-lg font-bold text-white font-display">
                Hari ini — {recordsTodayCount} rekod
              </p>
              <p className="text-xs text-teal-200/80">
                {recordsTodayCount === 0 ? 'Belum ada rekod baru hari ini' : 'Pengambilan direkodkan'}
              </p>
            </div>
          </div>
        </div>

        {/* Principle Pill */}
        <div className="relative z-10 mt-6 pt-4 border-t border-teal-600/50 flex items-center gap-2 text-xs sm:text-sm text-teal-100/90">
          <ShieldCheck className="w-4 h-4 text-cyan-300 flex-shrink-0" />
          <span className="italic">
            “AMiR tidak menentukan apa yang betul. AMiR merekodkan apa yang guru maklumkan.”
          </span>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section id="home-quick-actions" className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 font-display">
          Tindakan Pantas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Quick Action: ＋ Rekod Baru */}
          <button
            id="quick-action-rekod"
            onClick={() => setActiveTab('rekod')}
            className="group relative flex items-center p-4 sm:p-5 rounded-2xl bg-linear-to-br from-teal-600 to-cyan-700 text-white shadow-md shadow-teal-700/15 hover:shadow-lg hover:shadow-teal-700/25 transition-all text-left overflow-hidden hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-teal-100 block">Catat Pengambilan</span>
              <span className="text-base font-bold text-white font-display block">＋ Rekod Baru</span>
            </div>
            <ArrowRight className="w-5 h-5 text-teal-200 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Quick Action: Inventori */}
          <button
            id="quick-action-inventori"
            onClick={() => setActiveTab('inventori')}
            className="group relative flex items-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-200 hover:shadow-md transition-all text-left hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-amber-600 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-slate-400 block">Semak Peralatan</span>
              <span className="text-base font-bold text-slate-800 font-display block">Inventori Stor</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-teal-600 transition-all" />
          </button>

          {/* Quick Action: Laporan */}
          <button
            id="quick-action-laporan"
            onClick={() => setActiveTab('laporan')}
            className="group relative flex items-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-200 hover:shadow-md transition-all text-left hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-6 h-6 text-blue-600 stroke-[2.2]" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-slate-400 block">Analisis & Cetak</span>
              <span className="text-base font-bold text-slate-800 font-display block">Laporan & Arkib</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-teal-600 transition-all" />
          </button>
        </div>
      </section>

      {/* Rekod Terkini as Attractive Cards */}
      <section id="home-recent-records" className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-display">
              Rekod Terkini
            </h2>
            <p className="text-xs text-slate-500">
              Pengambilan peralatan stor terkini oleh guru
            </p>
          </div>
          <button
            id="btn-view-all-records"
            onClick={() => setActiveTab('laporan')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentRecords.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700">Tiada rekod lagi</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tekan butang ＋ Rekod untuk mencatat pengambilan alatan pertama hari ini.
            </p>
            <button
              onClick={() => setActiveTab('rekod')}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekod Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {recentRecords.map((rec, index) => {
              const accent = getCardAccent(index);
              return (
                <div
                  key={rec.id}
                  id={`recent-record-card-${rec.id}`}
                  className={`group relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all ${accent.borderLeft}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Teacher & Class Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${accent.avatarBg}`}
                      >
                        <User className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                            {rec.namaGuru}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${accent.badge} border`}
                          >
                            <BookOpen className="w-3 h-3" />
                            {rec.kelas}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-teal-600" />
                            {rec.aktivitiSebab}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start sm:self-auto font-medium">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{formatDisplayDate(rec.tarikhMasa)}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="font-semibold text-slate-700">
                        {formatDisplayTime(rec.tarikhMasa)}
                      </span>
                    </div>
                  </div>

                  {/* Free-text Catatan Box */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-start gap-2 bg-slate-50/80 rounded-xl p-3 text-xs sm:text-sm text-slate-700 border border-slate-100/80">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900 block text-[11px] uppercase tracking-wider mb-0.5">
                          Catatan Guru:
                        </span>
                        <p className="whitespace-pre-line leading-relaxed text-slate-700">
                          {rec.catatan || 'Tiada catatan tambahan.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
