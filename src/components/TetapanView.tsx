import React, { useState, useEffect, useRef } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  HardDrive,
  FileCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Workspace } from '../types';
import { SheetFileMetadata } from '../services/googleWorkspace';
import { GoogleWorkspaceCard } from './GoogleWorkspaceCard';
import { WorkspaceCard } from './WorkspaceCard';

interface TetapanViewProps {
  totalRecords: number;
  totalInventory: number;
  onExport: () => void;
  onImport: (content: string) => boolean;
  onResetSample: () => void;
  onDeleteSeedData?: () => void;
  seedCounts?: { records: number; inventory: number; total: number };

  // Workspace Props
  activeWorkspace: Workspace;
  allWorkspaces: Workspace[];
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (workspace: { namaSekolah: string; kodSekolah: string; namaStor: string }) => void;

  // Google Workspace Props
  googleUser: User | null;
  accessToken: string | null;
  isConnecting: boolean;
  isSyncing: boolean;
  sheetInfo: SheetFileMetadata | null;
  lastSyncedAt: string | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
  onSyncToDrive: () => Promise<void>;
  onPullFromDrive: () => Promise<void>;
  onConnectSharedSheet?: (sheetInput: string) => Promise<void>;
}

export const TetapanView: React.FC<TetapanViewProps> = ({
  totalRecords,
  totalInventory,
  onExport,
  onImport,
  onResetSample,
  onDeleteSeedData,
  seedCounts = { records: 0, inventory: 0, total: 0 },
  activeWorkspace,
  allWorkspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  googleUser,
  accessToken,
  isConnecting,
  isSyncing,
  sheetInfo,
  lastSyncedAt,
  onGoogleSignIn,
  onGoogleSignOut,
  onCreateNewSheet,
  onSyncToDrive,
  onPullFromDrive,
  onConnectSharedSheet,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteSeedConfirm, setShowDeleteSeedConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImport(content);
        if (success) {
          setImportStatus('Fail sandaran berjaya dimuat naik dan data telah dikemaskini!');
        } else {
          setImportStatus('Gagal membaca fail JSON. Sila pastikan format sah.');
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-3xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Tetapan Sistem AMiR
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Pengurusan Workspace sekolah, Google Sheets & Drive, sandaran data, dan penyelenggaraan.
        </p>
      </div>

      {/* 1. Workspace Aktif Section (At the top of Tetapan) */}
      <WorkspaceCard
        activeWorkspace={activeWorkspace}
        allWorkspaces={allWorkspaces}
        onSwitchWorkspace={onSwitchWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        isSyncing={isSyncing}
      />

      {/* 2. Google Drive & Sheets Panitia PJ Section */}
      <GoogleWorkspaceCard
        user={googleUser}
        accessToken={accessToken}
        isConnecting={isConnecting}
        sheetInfo={sheetInfo}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onSignIn={onGoogleSignIn}
        onSignOut={onGoogleSignOut}
        onCreateNewSheet={onCreateNewSheet}
        onSyncToDrive={onSyncToDrive}
        onPullFromDrive={onPullFromDrive}
        onConnectSharedSheet={onConnectSharedSheet}
      />

      {/* 3. Data / Connection Status */}
      <section
        id="section-connection-status"
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 font-display">
              Status Data & Sambungan Peranti
            </h2>
            <p className="text-xs text-slate-500">
              Kesihatan sistem bagi {activeWorkspace.namaSekolah} ({activeWorkspace.kodSekolah})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Online / Offline status */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 block">Sambungan Internet</span>
              <span className="text-[11px] text-slate-500">
                {isOnline ? 'Dalam Talian (Online)' : 'Luar Talian (Offline)'}
              </span>
            </div>
          </div>

          {/* Local storage status */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-700 block">Storan Workspace Ini</span>
              <span className="text-[11px] text-slate-500">
                {totalRecords} rekod • {totalInventory} barangan stor
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Data & Penyelenggaraan */}
      <section
        id="section-maintenance"
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 font-display">
              Data & Penyelenggaraan
            </h2>
            <p className="text-xs text-slate-500">Sandaran luar talian dan pembersihan data ujian</p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-semibold flex items-center justify-between">
            <span>{importStatus}</span>
            <button onClick={() => setImportStatus(null)} className="text-xs text-teal-700 underline cursor-pointer">
              Tutup
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Backup Button */}
          <button
            id="btn-backup-export"
            onClick={onExport}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-teal-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-700" />
            <span>Muat Turun Sandaran (JSON)</span>
          </button>

          {/* Import Button */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="file-import-input"
            />
            <button
              id="btn-import-data"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Pulih dari Fail JSON (Import)</span>
            </button>
          </div>
        </div>

        {/* Padam Data Ujian Section (Requested) */}
        {onDeleteSeedData && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-amber-700" />
                <span className="text-xs sm:text-sm font-bold text-amber-900">
                  Padam Data Ujian
                </span>
                {seedCounts.total > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-bold">
                    {seedCounts.total} item ujian dikesan
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Hanya memadam data contoh/ujian ({seedCounts.records} rekod & {seedCounts.inventory} alatan). Rekod guru sebenar TIDAK akan dipadam.
              </p>
            </div>

            {showDeleteSeedConfirm ? (
              <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                <span className="text-xs text-rose-700 font-bold">Padam data ujian?</span>
                <button
                  id="btn-confirm-delete-seed"
                  onClick={() => {
                    onDeleteSeedData();
                    setShowDeleteSeedConfirm(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Ya, Padam
                </button>
                <button
                  onClick={() => setShowDeleteSeedConfirm(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                id="btn-delete-seed-data"
                onClick={() => setShowDeleteSeedConfirm(true)}
                disabled={seedCounts.total === 0}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all self-start sm:self-auto ${
                  seedCounts.total > 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer'
                    : 'bg-amber-200/50 text-amber-800/60 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam Data Ujian</span>
              </button>
            )}
          </div>
        )}

        {/* Reset / Muat Semula Data Contoh */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Perlukan data contoh awal semula?</span>
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-700 font-semibold">Ganti dengan data contoh?</span>
              <button
                onClick={() => {
                  onResetSample();
                  setShowResetConfirm(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Ya, Muat Semula
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              id="btn-reset-sample-data"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Semula Data Contoh</span>
            </button>
          )}
        </div>
      </section>

      {/* 5. About AMiR */}
      <section
        id="section-about-amir"
        className="bg-linear-to-br from-teal-900 via-teal-800 to-cyan-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-teal-400 to-cyan-500 text-teal-950 flex items-center justify-center font-black text-xl shadow-md font-display flex-shrink-0">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-lg sm:text-xl font-display leading-tight">
              AMiR — Ambil Isi Rekod
            </h2>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Sistem Buku Rekod & Inventori Stor Pendidikan Jasmani Sekolah Rendah
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-teal-700/50 text-xs text-teal-100/80 space-y-2 leading-relaxed">
          <p>
            <strong className="text-white">Prinsip AMiR:</strong> AMiR tidak menentukan apa yang betul. AMiR merekod apa yang cikgu kata.
          </p>
          <p>
            Penyegerakan Google Drive menggunakan akaun Google individu setiap guru panitia. Fail Google Sheet kekal sebagai sumber kebenaran data tunggal.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-teal-300">
          <span className="px-2.5 py-1 rounded-lg bg-teal-800/80 border border-teal-700/60 font-medium">
            Versi 2.1 (Multi-Workspace)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-800/80 border border-teal-700/60 font-medium">
            Zon Masa: Asia/Kuala_Lumpur (MYT)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-teal-800/80 border border-teal-700/60 font-medium">
            Penyegerakan Dua Hala
          </span>
        </div>
      </section>
    </div>
  );
};
