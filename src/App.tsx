import React from 'react';
import { useAmirStore } from './context/useAmirStore';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { InventoriView } from './components/InventoriView';
import { RekodView } from './components/RekodView';
import { LaporanView } from './components/LaporanView';
import { TetapanView } from './components/TetapanView';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    records,
    inventory,
    recordsTodayCount,
    toastMessage,
    addRecord,
    deleteRecord,
    addInventory,
    updateInventory,
    deleteInventory,
    resetToSampleData,
    deleteSeedData,
    activeWorkspaceSeedCount,
    exportDataJson,
    importDataJson,

    // Workspaces
    activeWorkspace,
    workspaces,
    handleSwitchWorkspace,
    handleCreateWorkspace,

    // Google Workspace
    googleUser,
    accessToken,
    isConnecting,
    isSyncing,
    sheetInfo,
    lastSyncedAt,
    handleGoogleSignIn,
    handleGoogleSignOut,
    handleConnectSharedSheet,
    handleCreateNewSheet,
    handleSyncToDrive,
    handlePullFromDrive,
  } = useAmirStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-200 selection:text-teal-900">
      {/* Top / Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordsTodayCount={recordsTodayCount}
        isCloudConnected={Boolean(googleUser && accessToken)}
        activeWorkspace={activeWorkspace}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">
        {activeTab === 'home' && (
          <HomeView
            records={records}
            recordsTodayCount={recordsTodayCount}
            setActiveTab={setActiveTab}
            activeWorkspace={activeWorkspace}
          />
        )}

        {activeTab === 'inventori' && (
          <InventoriView
            inventory={inventory}
            onAddInventory={addInventory}
            onUpdateInventory={updateInventory}
            onDeleteInventory={deleteInventory}
          />
        )}

        {activeTab === 'rekod' && (
          <RekodView
            onAddRecord={addRecord}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanView
            records={records}
            activeWorkspace={activeWorkspace}
            onDeleteRecord={deleteRecord}
          />
        )}

        {activeTab === 'tetapan' && (
          <TetapanView
            totalRecords={records.length}
            totalInventory={inventory.length}
            onExport={exportDataJson}
            onImport={importDataJson}
            onResetSample={resetToSampleData}
            onDeleteSeedData={deleteSeedData}
            seedCounts={activeWorkspaceSeedCount}
            activeWorkspace={activeWorkspace}
            allWorkspaces={workspaces}
            onSwitchWorkspace={handleSwitchWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
            googleUser={googleUser}
            accessToken={accessToken}
            isConnecting={isConnecting}
            isSyncing={isSyncing}
            sheetInfo={sheetInfo}
            lastSyncedAt={lastSyncedAt}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onCreateNewSheet={handleCreateNewSheet}
            onSyncToDrive={handleSyncToDrive}
            onPullFromDrive={handlePullFromDrive}
            onConnectSharedSheet={handleConnectSharedSheet}
          />
        )}
      </main>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          id="app-toast-message"
          className="no-print fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 text-white shadow-xl backdrop-blur-xs border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200 text-xs sm:text-sm font-medium"
        >
          {toastMessage.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          {toastMessage.type === 'info' && (
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          )}
          {toastMessage.type === 'error' && (
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
