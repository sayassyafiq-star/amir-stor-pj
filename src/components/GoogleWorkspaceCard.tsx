import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Cloud, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  FolderCheck,
  Sparkles,
  Link2,
  Users,
  ShieldCheck
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SheetFileMetadata } from '../services/googleWorkspace';

interface GoogleWorkspaceCardProps {
  user: User | null;
  accessToken: string | null;
  isConnecting: boolean;
  sheetInfo: SheetFileMetadata | null;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncToDrive: () => Promise<void>;
  onPullFromDrive: () => Promise<void>;
  onCreateNewSheet: () => Promise<void>;
  onConnectSharedSheet?: (sheetInput: string) => Promise<void>;
}

export const GoogleWorkspaceCard: React.FC<GoogleWorkspaceCardProps> = ({
  user,
  accessToken,
  isConnecting,
  sheetInfo,
  isSyncing,
  lastSyncedAt,
  onSignIn,
  onSignOut,
  onSyncToDrive,
  onPullFromDrive,
  onCreateNewSheet,
  onConnectSharedSheet,
}) => {
  const [confirmSyncOpen, setConfirmSyncOpen] = useState(false);
  const [confirmPullOpen, setConfirmPullOpen] = useState(false);
  const [sharedSheetInput, setSharedSheetInput] = useState('');
  const [isLinkingShared, setIsLinkingShared] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);

  const handleLinkSharedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharedSheetInput.trim() || !onConnectSharedSheet) return;
    setIsLinkingShared(true);
    try {
      await onConnectSharedSheet(sharedSheetInput.trim());
      setShowLinkInput(false);
      setSharedSheetInput('');
    } finally {
      setIsLinkingShared(false);
    }
  };

  return (
    <section
      id="section-google-drive"
      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 flex-shrink-0 shadow-xs">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-slate-900 font-display">
                Google Sheets & Drive Panitia PJ
              </h2>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                {user && accessToken ? 'Aktif' : 'Bersedia'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Penyegerakan selamat dua hala menggunakan akaun Google individu setiap guru.
            </p>
          </div>
        </div>

        {/* User Account / Sign In Status */}
        <div>
          {user && accessToken ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-2xl">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full border border-slate-300"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                  {(user.displayName || user.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div className="text-left pr-1">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[140px] leading-tight">
                  {user.displayName || user.email}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">Akaun Google Aktif</span>
              </div>
              <button
                onClick={onSignOut}
                title="Log keluar Google"
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              disabled={isConnecting}
              className="gsi-material-button cursor-pointer transition-all hover:shadow-sm"
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                appearance: 'none',
                backgroundColor: 'white',
                backgroundImage: 'none',
                border: '1px solid #747775',
                borderRadius: '16px',
                boxSizing: 'border-box',
                color: '#1f1f1f',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
                fontWeight: '600',
                height: '40px',
                letterSpacing: '0.2px',
                lineHeight: 'normal',
                outline: 'none',
                overflow: 'hidden',
                padding: '0 14px',
                position: 'relative',
                textAlign: 'center',
                verticalAlign: 'middle',
                whiteSpace: 'nowrap',
                width: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper flex items-center gap-2">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block', width: '18px', height: '18px' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {isConnecting ? 'Menyambung...' : 'Log Masuk dengan Google'}
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Spreadsheet Status Box */}
      {user && accessToken ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-sm">
                  {sheetInfo ? sheetInfo.name : 'Folder "AMiR Stor PJ Data"'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {sheetInfo ? (
                  <>
                    Hamparan Google Sheets tersambung.{' '}
                    {lastSyncedAt && <span className="font-semibold text-teal-800">Segerak: {lastSyncedAt}</span>}
                    {sheetInfo.ownerEmail && (
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Pemilik Dokumen: {sheetInfo.ownerEmail}
                      </span>
                    )}
                  </>
                ) : (
                  'Belum ada fail Google Sheet dicipta. Pilih sama ada mencipta fail baru atau menyambung ke fail yang dikongsi oleh rakan.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sheetInfo?.webViewLink && (
                <a
                  href={sheetInfo.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-teal-800 border border-teal-300 text-xs font-bold transition-all shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                  <span>Buka di Google Sheets</span>
                </a>
              )}

              {!sheetInfo && (
                <button
                  onClick={onCreateNewSheet}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cipta Hamparan Induk</span>
                </button>
              )}

              <button
                onClick={() => setShowLinkInput((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{showLinkInput ? 'Tutup Pautan' : 'Sambung Fail Rakan'}</span>
              </button>
            </div>
          </div>

          {/* Form to connect to shared spreadsheet (for Colleague) */}
          {showLinkInput && (
            <form
              onSubmit={handleLinkSharedSubmit}
              className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 animate-in fade-in duration-200"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Users className="w-4 h-4 text-amber-700" />
                <span>Sambungkan ke Hamparan Dikongsi (Untuk Rakan Panitia)</span>
              </div>
              <p className="text-xs text-amber-800">
                Jika rakan anda telah berkongsi Google Sheet AMiR dengan akaun Google anda, tampalkan ID fail atau pautan Google Sheets di bawah:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={sharedSheetInput}
                  onChange={(e) => setSharedSheetInput(e.target.value)}
                  placeholder="Pautan Google Sheets (cth: https://docs.google.com/spreadsheets/d/...)"
                  className="flex-1 px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={isLinkingShared || !sharedSheetInput.trim()}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isLinkingShared ? 'Menyambung...' : 'Sambung Fail Ini'}
                </button>
              </div>
            </form>
          )}

          {/* Two-Way Sync Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sync to Drive Button */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-teal-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Segerak Selamat ke Sheets
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Menggabungkan rekod baharu peranti anda ke Google Sheet tanpa memadam rekod rakan setugas.
              </p>
              <button
                onClick={() => setConfirmSyncOpen(true)}
                disabled={isSyncing}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sedang Menyegerak...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Segerak Selamat Dua Hala</span>
                  </>
                )}
              </button>
            </div>

            {/* Pull from Drive Button */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-4 h-4 text-cyan-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Tarik Data dari Sheets
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Muat turun rekod & alatan terkini yang baru ditambah atau diedit oleh rakan guru lain.
              </p>
              <button
                onClick={() => setConfirmPullOpen(true)}
                disabled={isSyncing || !sheetInfo}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    <span>Sedang Membaca...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4 text-slate-600" />
                    <span>Tarik Data Terkini dari Sheets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Not logged in guide */
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Cloud className="w-4 h-4 text-teal-600" />
            <span>Akses Google Drive & Sheets Panitia PJ</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AMiR menggunakan akaun Google individu setiap guru:
          </p>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Akaun Sendiri:</strong> Anda dan rakan guru log masuk menggunakan akaun Google masing-masing tanpa berkongsi kata laluan.
            </li>
            <li>
              <strong>Penyegerakan Selamat:</strong> Setiap rekod baharu terus ditokok ke Google Sheets panitia PJ secara automatik.
            </li>
            <li>
              <strong>Buku Rekod Bersama:</strong> Hamparan Google Sheets bertindak sebagai <em>single source of truth</em> yang sentiasa terkini.
            </li>
          </ul>
          <div className="pt-2">
            <button
              onClick={onSignIn}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log Masuk dengan Akaun Google Saya</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Safe Sync */}
      {confirmSyncOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-teal-800">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Penyegerakan Selamat Dua Hala
                </h3>
                <p className="text-xs text-slate-500">Perlindungan data bersama</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Adakah anda ingin menyegerak rekod dan inventori pada peranti ini dengan Google Sheets? Sistem akan menggabungkan semua rekod baharu tanpa memadamkan input rakan anda.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmSyncOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSyncOpen(false);
                  onSyncToDrive();
                }}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Sahkan & Segerak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Pull from Drive */}
      {confirmPullOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-cyan-700">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <DownloadCloud className="w-5 h-5 text-cyan-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Tarik Data dari Google Sheets
                </h3>
                <p className="text-xs text-slate-500">Muat turun kemaskini terkini rakan guru</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Adakah anda ingin memuat turun rekod dan perubahan alatan terkini daripada Google Sheets ke dalam peranti ini?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPullOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmPullOpen(false);
                  onPullFromDrive();
                }}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Tarik Data Terkini
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
