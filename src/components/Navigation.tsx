import React from 'react';
import { NavTab, Workspace } from '../types';
import { Home, Package, Plus, ClipboardList, Settings, Sparkles, Cloud, School } from 'lucide-react';

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  recordsTodayCount: number;
  isCloudConnected?: boolean;
  activeWorkspace?: Workspace;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  recordsTodayCount,
  isCloudConnected = false,
  activeWorkspace,
}) => {
  return (
    <>
      {/* Desktop Top Navigation Bar */}
      <header className="no-print hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo & Branding */}
          <div
            id="desktop-brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-lg tracking-tight font-display">A</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-800 font-display">
                  AMiR
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                  {activeWorkspace?.namaStor || 'Stor PJ'}
                </span>
                {activeWorkspace && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('tetapan');
                    }}
                    title={`Workspace: ${activeWorkspace.namaSekolah}`}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold hover:bg-slate-200 transition-colors"
                  >
                    <School className="w-3 h-3 text-slate-500" />
                    <span>{activeWorkspace.kodSekolah}</span>
                  </span>
                )}
                {isCloudConnected && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab('tetapan');
                    }}
                    title="Google Drive & Sheets Tersambung"
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    <span>Drive Aktif</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {activeWorkspace?.namaSekolah || 'Ambil Isi Rekod'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="desktop-nav-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100/70'
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Home</span>
            </button>

            <button
              id="desktop-nav-inventori"
              onClick={() => setActiveTab('inventori')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'inventori'
                  ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100/70'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'inventori' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Inventori</span>
            </button>

            <button
              id="desktop-nav-rekod"
              onClick={() => setActiveTab('rekod')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer ${
                activeTab === 'rekod'
                  ? 'bg-teal-800 text-white shadow-teal-800/20'
                  : 'bg-teal-700 text-white hover:bg-teal-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>＋ Rekod Ambil</span>
            </button>

            <button
              id="desktop-nav-laporan"
              onClick={() => setActiveTab('laporan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'laporan'
                  ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100/70'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${activeTab === 'laporan' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Laporan</span>
              {recordsTodayCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {recordsTodayCount}
                </span>
              )}
            </button>

            <button
              id="desktop-nav-tetapan"
              onClick={() => setActiveTab('tetapan')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'tetapan'
                  ? 'bg-teal-50 text-teal-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-100/70'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'tetapan' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Tetapan</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Top App Bar */}
      <header className="no-print md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-teal-100/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white shadow-sm">
            <span className="font-extrabold text-sm font-display">A</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base leading-none font-display">AMiR</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200/50">
                {activeWorkspace?.kodSekolah || 'Stor PJ'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight truncate max-w-[130px]">
              {activeWorkspace?.namaSekolah || 'Ambil Isi Rekod'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCloudConnected && (
            <div
              onClick={() => setActiveTab('tetapan')}
              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold cursor-pointer"
            >
              <Cloud className="w-3 h-3 text-emerald-600" />
              <span>Drive</span>
            </div>
          )}
          {recordsTodayCount > 0 && (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>{recordsTodayCount} hari ini</span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar with Prominent Elevated "＋ Rekod" */}
      <nav
        id="mobile-bottom-navbar"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg"
      >
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Home</span>
        </button>

        <button
          id="mobile-nav-inventori"
          onClick={() => setActiveTab('inventori')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'inventori' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Inventori</span>
        </button>

        {/* Center Elevated Action Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            id="mobile-nav-rekod-fab"
            onClick={() => setActiveTab('rekod')}
            className="w-13 h-13 rounded-full bg-linear-to-tr from-teal-700 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-700/30 active:scale-95 transition-transform border-4 border-white cursor-pointer"
            aria-label="Ambil & Isi Rekod"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-teal-800 -mt-0.5">Rekod</span>
        </div>

        <button
          id="mobile-nav-laporan"
          onClick={() => setActiveTab('laporan')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl relative transition-all cursor-pointer ${
            activeTab === 'laporan' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            {recordsTodayCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                {recordsTodayCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">Laporan</span>
        </button>

        <button
          id="mobile-nav-tetapan"
          onClick={() => setActiveTab('tetapan')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tetapan' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] leading-tight">Tetapan</span>
        </button>
      </nav>
    </>
  );
};
