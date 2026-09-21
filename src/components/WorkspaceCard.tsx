import React, { useState } from 'react';
import { Workspace } from '../types';
import { 
  Building2, 
  Plus, 
  Check, 
  ExternalLink, 
  FileSpreadsheet, 
  Layers, 
  ArrowRight,
  School,
  Boxes,
  X,
  Sparkles
} from 'lucide-react';

interface WorkspaceCardProps {
  activeWorkspace: Workspace;
  allWorkspaces: Workspace[];
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (workspace: { namaSekolah: string; kodSekolah: string; namaStor: string }) => void;
  isSyncing?: boolean;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  activeWorkspace,
  allWorkspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  isSyncing = false,
}) => {
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating new workspace
  const [namaSekolah, setNamaSekolah] = useState('');
  const [kodSekolah, setKodSekolah] = useState('');
  const [namaStor, setNamaStor] = useState('Stor PJ');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSekolah.trim()) {
      setErrorMsg('Sila masukkan Nama Sekolah.');
      return;
    }
    if (!kodSekolah.trim()) {
      setErrorMsg('Sila masukkan Kod Sekolah.');
      return;
    }

    onCreateWorkspace({
      namaSekolah: namaSekolah.trim(),
      kodSekolah: kodSekolah.trim().toUpperCase(),
      namaStor: namaStor.trim() || 'Stor PJ',
    });

    setNamaSekolah('');
    setKodSekolah('');
    setNamaStor('Stor PJ');
    setErrorMsg('');
    setShowCreateModal(false);
  };

  return (
    <section
      id="section-workspace-aktif"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0 shadow-xs">
            <School className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-slate-900 font-display">
                Workspace Aktif
              </h2>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-bold">
                {activeWorkspace.kodSekolah}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Setiap sekolah mempunyai data rekod, inventori, dan Google Sheet yang terasing.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-switch-workspace"
            type="button"
            onClick={() => setShowSwitchModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Tukar Workspace</span>
          </button>

          <button
            id="btn-create-workspace"
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>＋ Cipta Workspace Baharu</span>
          </button>
        </div>
      </div>

      {/* Active Workspace Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Nama Sekolah */}
        <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100/70">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
            Nama Sekolah
          </span>
          <span className="text-base font-extrabold text-slate-900 font-display mt-0.5 block">
            {activeWorkspace.namaSekolah}
          </span>
        </div>

        {/* Kod Sekolah */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Kod Sekolah
          </span>
          <span className="text-base font-extrabold text-slate-800 font-display mt-0.5 block">
            {activeWorkspace.kodSekolah}
          </span>
        </div>

        {/* Nama Stor */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Nama Stor
          </span>
          <span className="text-base font-extrabold text-slate-800 font-display mt-0.5 block">
            {activeWorkspace.namaStor}
          </span>
        </div>
      </div>

      {/* Google Sheet Linked to This Workspace */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Google Sheet Workspace Ini
            </span>
            {activeWorkspace.sheetInfo ? (
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                  {activeWorkspace.sheetInfo.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Tersambung
                </span>
              </div>
            ) : (
              <span className="text-xs text-amber-700 font-medium">
                Belum dihubungkan ke Google Sheet khusus. Anda boleh cipta atau sambung di bawah.
              </span>
            )}
          </div>
        </div>

        {activeWorkspace.sheetInfo?.webViewLink && (
          <a
            href={activeWorkspace.sheetInfo.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <span>Buka Hamparan</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        )}
      </div>

      {/* Switch Workspace Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Pilih Workspace Sekolah
                </h3>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Menukar workspace hanya akan menukar paparan data dan Google Sheet aktif. Data sekolah terdahulu kekal selamat.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {allWorkspaces.map((ws) => {
                const isActive = ws.id === activeWorkspace.id;
                return (
                  <div
                    key={ws.id}
                    onClick={() => {
                      onSwitchWorkspace(ws.id);
                      setShowSwitchModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-200'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-display">
                          {ws.namaSekolah}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-bold">
                          {ws.kodSekolah}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        {ws.namaStor}
                        {ws.sheetInfo ? ` • ${ws.sheetInfo.name}` : ' • Tiada Sheet'}
                      </span>
                    </div>

                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowSwitchModal(false);
                  setShowCreateModal(true);
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>＋ Cipta Sekolah Baharu</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <School className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-display">
                  Cipta Workspace Baharu
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Sekolah baharu akan mempunyai ruang storan dan Google Sheet terasing sendiri. Data sekolah terdahulu tidak akan terjejas.
            </p>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaSekolah}
                  onChange={(e) => setNamaSekolah(e.target.value)}
                  placeholder="Contoh: SK Taman Pelangi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Kod Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={kodSekolah}
                  onChange={(e) => setKodSekolah(e.target.value)}
                  placeholder="Contoh: JBA1234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Stor
                </label>
                <input
                  type="text"
                  value={namaStor}
                  onChange={(e) => setNamaStor(e.target.value)}
                  placeholder="Stor PJ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Cipta & Tukar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
