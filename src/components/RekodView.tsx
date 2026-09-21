import React, { useState } from 'react';
import { RecordItem, NavTab } from '../types';
import { 
  getTodayDateString, 
  QUICK_TEACHER_SUGGESTIONS, 
  QUICK_CLASS_SUGGESTIONS, 
  QUICK_ACTIVITY_SUGGESTIONS 
} from '../data/initialData';
import { 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  Tag, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

interface RekodViewProps {
  onAddRecord: (item: Omit<RecordItem, 'id' | 'createdAt'>) => RecordItem;
  setActiveTab: (tab: NavTab) => void;
}

export const RekodView: React.FC<RekodViewProps> = ({ onAddRecord, setActiveTab }) => {
  const [namaGuru, setNamaGuru] = useState('');
  const [tarikhMasa, setTarikhMasa] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  });
  const [kelas, setKelas] = useState('');
  const [aktivitiSebab, setAktivitiSebab] = useState('');
  const [catatan, setCatatan] = useState('');
  const [lastSubmittedRecord, setLastSubmittedRecord] = useState<RecordItem | null>(null);

  const resetForm = () => {
    setNamaGuru('');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setTarikhMasa(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`
    );
    setKelas('');
    setAktivitiSebab('');
    setCatatan('');
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setTarikhMasa(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaGuru.trim() || !tarikhMasa || !kelas.trim() || !aktivitiSebab.trim()) {
      return;
    }

    const newRec = onAddRecord({
      namaGuru: namaGuru.trim(),
      tarikhMasa,
      kelas: kelas.trim(),
      aktivitiSebab: aktivitiSebab.trim(),
      catatan: catatan.trim(),
    });

    setLastSubmittedRecord(newRec);
    resetForm();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-3xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Borang Log Pengambilan Alatan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          ＋ Rekod Pengambilan Alatan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Catat maklumat pengambilan alatan stor dengan pantas. Hanya 5 medan ringkas mengikut makluman guru.
        </p>
      </div>

      {/* AMiR Principle Note */}
      <div
        id="rekod-principle-banner"
        className="flex items-start gap-3 p-4 rounded-2xl bg-linear-to-r from-teal-50 via-cyan-50 to-emerald-50 border border-teal-200/80 text-teal-900 text-xs sm:text-sm shadow-xs"
      >
        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold block text-teal-950">Prinsip Teras AMiR:</span>
          <p className="italic text-teal-800 leading-relaxed mt-0.5">
            “AMiR does not decide what is correct. It records what the teacher says.”
            (AMiR tidak menentukan apa yang betul. AMiR merekodkan apa yang guru maklumkan.)
          </p>
        </div>
      </div>

      {/* Success Notification Alert if just submitted */}
      {lastSubmittedRecord && (
        <div
          id="rekod-success-alert"
          className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-base font-display">
                  Rekod Berjaya Disimpan!
                </h3>
                <p className="text-xs text-emerald-800">
                  Pengambilan oleh <span className="font-bold">{lastSubmittedRecord.namaGuru}</span> ({lastSubmittedRecord.kelas}) telah dimasukkan ke dalam buku rekod digital.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastSubmittedRecord(null)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="bg-white/90 rounded-xl p-3 text-xs text-slate-700 border border-emerald-200">
            <span className="font-bold text-slate-800 block mb-1">Catatan Direkodkan:</span>
            <p className="italic text-slate-600">
              "{lastSubmittedRecord.catatan || 'Tiada catatan tambahan'}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab('laporan')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>Semak di Senarai Laporan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLastSubmittedRecord(null)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-100/60 transition-colors cursor-pointer"
            >
              Isi Rekod Seterusnya
            </button>
          </div>
        </div>
      )}

      {/* Main Record Form Container */}
      <form
        id="form-ambil-rekod"
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6"
      >
        {/* 1. Nama Guru */}
        <div className="space-y-2">
          <label
            htmlFor="input-nama-guru"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              1. Nama Guru <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">Guru mengambil alatan</span>
          </label>
          <input
            id="input-nama-guru"
            type="text"
            required
            value={namaGuru}
            onChange={(e) => setNamaGuru(e.target.value)}
            placeholder="Taip nama penuh guru (cth: Cikgu Faizul / Ustazah Noraisyah)"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 shadow-2xs font-medium"
          />

          {/* Quick Teacher Tag Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Cadangan:</span>
            {QUICK_TEACHER_SUGGESTIONS.slice(0, 5).map((teacher) => (
              <button
                key={teacher}
                type="button"
                onClick={() => setNamaGuru(teacher)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-[11px] font-semibold text-slate-600 hover:text-teal-800 transition-colors cursor-pointer"
              >
                + {teacher}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Tarikh & Masa Ambil */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="input-tarikh-masa"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              <Calendar className="w-4 h-4 text-teal-600" />
              2. Tarikh & Masa Ambil <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-slate-400 font-normal">
                (Boleh pilih tarikh lepas)
              </span>
              <button
                type="button"
                id="btn-set-current-time"
                onClick={handleSetCurrentTime}
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Waktu Sekarang</span>
              </button>
            </div>
          </div>
          <input
            id="input-tarikh-masa"
            type="datetime-local"
            required
            value={tarikhMasa}
            onChange={(e) => setTarikhMasa(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 shadow-2xs font-medium"
          />
        </div>

        {/* 3. Kelas */}
        <div className="space-y-2">
          <label
            htmlFor="input-kelas"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-600" />
              3. Kelas <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">Kelas / Kumpulan sasaran</span>
          </label>
          <input
            id="input-kelas"
            type="text"
            required
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            placeholder="Contoh: 4 Cekal, 5 Bestari, 1 Amanah, Rumah Merah"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 shadow-2xs font-medium"
          />

          {/* Quick Class Tag Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Pilih cepat:</span>
            {QUICK_CLASS_SUGGESTIONS.slice(0, 6).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setKelas(c)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-[11px] font-semibold text-slate-600 hover:text-cyan-800 transition-colors cursor-pointer"
              >
                + {c}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Aktiviti / Sebab */}
        <div className="space-y-2">
          <label
            htmlFor="input-aktiviti-sebab"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-teal-600" />
              4. Aktiviti / Sebab <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">Tujuan penggunaan</span>
          </label>
          <input
            id="input-aktiviti-sebab"
            type="text"
            required
            value={aktivitiSebab}
            onChange={(e) => setAktivitiSebab(e.target.value)}
            placeholder="Contoh: PJ - Bola Sepak, Ujian SEGAK, Kokurikulum, Sukaneka"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 shadow-2xs font-medium"
          />

          {/* Quick Activity Tag Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Aktiviti lazim:</span>
            {QUICK_ACTIVITY_SUGGESTIONS.slice(0, 4).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setAktivitiSebab(act)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-semibold text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                + {act}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Catatan (Completely Free Text) */}
        <div className="space-y-2">
          <label
            htmlFor="input-catatan"
            className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              5. Catatan
            </span>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
              Teks Bebas Guru
            </span>
          </label>
          <textarea
            id="input-catatan"
            rows={4}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tulis apa sahaja peralatan atau makluman yang guru sebutkan secara bebas.&#10;Contoh: 6 biji bola tampar, 1 jaring, 10 kon skital oren. Pemulangan jam 10.15 pagi."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 shadow-2xs leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            * Tiada sekatan jenis atau kiraan alatan. Tulis persis seperti yang dinyatakan guru.
          </p>
        </div>

        {/* Submit & Reset Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Kosongkan Borang</span>
          </button>

          <button
            id="btn-submit-rekod"
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-linear-to-r from-teal-600 via-teal-700 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-extrabold text-base shadow-lg shadow-teal-800/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer font-display"
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Simpan Rekod</span>
          </button>
        </div>
      </form>
    </div>
  );
};
