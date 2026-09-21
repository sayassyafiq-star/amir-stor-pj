import { useState, useEffect, useMemo, useCallback } from 'react';
import { RecordItem, InventoryItem, NavTab, Workspace } from '../types';
import { INITIAL_RECORDS, INITIAL_INVENTORY, DEFAULT_WORKSPACE } from '../data/initialData';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
} from '../services/googleAuth';
import {
  SheetFileMetadata,
  findAmirSpreadsheet,
  createAmirSpreadsheet,
  getOrCreateAmirFolder,
  appendRecordToGoogleSheet,
  updateInventoryRowInGoogleSheet,
  deleteInventoryRowInGoogleSheet,
  pullDataFromGoogleSheet,
  performSafeTwoWaySync,
  connectToSpreadsheetById,
  saveSharedSpreadsheetId,
} from '../services/googleWorkspace';
import { formatMalaysianDateTime, formatMalaysianDate, getTodayYMD } from '../utils/dateUtils';
import { User } from 'firebase/auth';

const WORKSPACES_KEY = 'amir_workspaces_v1';
const ACTIVE_WORKSPACE_ID_KEY = 'amir_active_workspace_id_v1';
const ALL_RECORDS_KEY = 'amir_pj_records_v1';
const ALL_INVENTORY_KEY = 'amir_pj_inventory_v1';

export function useAmirStore() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 1. Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(WORKSPACES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [DEFAULT_WORKSPACE];
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(ACTIVE_WORKSPACE_ID_KEY);
      if (savedId) return savedId;
    } catch {
      // ignore
    }
    return DEFAULT_WORKSPACE.id;
  });

  // Active workspace object derived safely
  const activeWorkspace = useMemo(() => {
    const found = workspaces.find((w) => w.id === activeWorkspaceId);
    return found || workspaces[0] || DEFAULT_WORKSPACE;
  }, [workspaces, activeWorkspaceId]);

  // SheetInfo specific to active workspace
  const sheetInfo = activeWorkspace.sheetInfo || null;

  // Persist workspaces
  useEffect(() => {
    try {
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
    } catch {
      // ignore
    }
  }, [workspaces]);

  // Persist active workspace ID
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_WORKSPACE_ID_KEY, activeWorkspaceId);
    } catch {
      // ignore
    }
  }, [activeWorkspaceId]);

  // 2. All Records & Inventory Storage (Global pools with workspaceId tag)
  const [allRecords, setAllRecords] = useState<RecordItem[]>(() => {
    try {
      const saved = localStorage.getItem(ALL_RECORDS_KEY);
      if (saved) {
        const parsed: RecordItem[] = JSON.parse(saved);
        // Ensure legacy items without workspaceId are assigned to default workspace
        return parsed.map((item) => ({
          ...item,
          workspaceId: item.workspaceId || DEFAULT_WORKSPACE.id,
          isSeed: item.isSeed ?? item.id.includes('seed'),
        }));
      }
    } catch {
      // ignore
    }
    return INITIAL_RECORDS;
  });

  const [allInventory, setAllInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(ALL_INVENTORY_KEY);
      if (saved) {
        const parsed: InventoryItem[] = JSON.parse(saved);
        return parsed.map((item) => ({
          ...item,
          workspaceId: item.workspaceId || DEFAULT_WORKSPACE.id,
          isSeed: item.isSeed ?? item.id.includes('seed'),
        }));
      }
    } catch {
      // ignore
    }
    return INITIAL_INVENTORY;
  });

  // Save all records & inventory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ALL_RECORDS_KEY, JSON.stringify(allRecords));
    } catch {
      // ignore
    }
  }, [allRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(ALL_INVENTORY_KEY, JSON.stringify(allInventory));
    } catch {
      // ignore
    }
  }, [allInventory]);

  // 3. Isolated View of Records & Inventory for the Active Workspace
  const records = useMemo(() => {
    return allRecords.filter((rec) => (rec.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspace.id);
  }, [allRecords, activeWorkspace.id]);

  const inventory = useMemo(() => {
    return allInventory.filter((inv) => (inv.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspace.id);
  }, [allInventory, activeWorkspace.id]);

  // Google Workspace state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Helper to update active workspace's sheet metadata
  const setSheetInfoForActiveWorkspace = useCallback((newSheetInfo: SheetFileMetadata | null) => {
    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === activeWorkspace.id ? { ...ws, sheetInfo: newSheetInfo } : ws))
    );
    if (newSheetInfo?.id) {
      saveSharedSpreadsheetId(newSheetInfo.id);
    }
  }, [activeWorkspace.id]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  // Switch Workspace Handler
  const handleSwitchWorkspace = (workspaceId: string) => {
    const targetWs = workspaces.find((w) => w.id === workspaceId);
    if (!targetWs) return;

    setActiveWorkspaceId(workspaceId);
    if (targetWs.sheetInfo?.id) {
      saveSharedSpreadsheetId(targetWs.sheetInfo.id);
    }
    showToast(`Beralih ke workspace: ${targetWs.namaSekolah} (${targetWs.namaStor})`, 'success');
  };

  // Create New Workspace Handler
  const handleCreateWorkspace = (data: { namaSekolah: string; kodSekolah: string; namaStor: string }) => {
    const newId = 'ws-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newWs: Workspace = {
      id: newId,
      namaSekolah: data.namaSekolah,
      kodSekolah: data.kodSekolah,
      namaStor: data.namaStor || 'Stor PJ',
      sheetInfo: null,
      createdAt: Date.now(),
    };

    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newId);
    showToast(`Workspace baharu "${data.namaSekolah}" berjaya dicipta!`, 'success');
  };

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setIsConnecting(true);
    try {
      const res = await googleSignIn();
      setGoogleUser(res.user);
      setAccessToken(res.accessToken);
      showToast(`Log masuk berjaya: ${res.user.displayName || res.user.email}`, 'success');

      // If active workspace already has sheetInfo, verify or pull
      if (sheetInfo?.id) {
        try {
          const freshData = await pullDataFromGoogleSheet(res.accessToken, sheetInfo.id, records);
          if (freshData.records.length > 0) {
            // Merge pulled records into allRecords for active workspace
            setAllRecords((prev) => {
              const otherWsRecords = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
              const taggedPulled = freshData.records.map((r) => ({
                ...r,
                workspaceId: activeWorkspace.id,
                isSeed: r.isSeed ?? false,
              }));
              return [...taggedPulled, ...otherWsRecords];
            });
          }
          if (freshData.inventory.length > 0) {
            setAllInventory((prev) => {
              const otherWsInv = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
              const taggedPulled = freshData.inventory.map((inv) => ({
                ...inv,
                workspaceId: activeWorkspace.id,
                isSeed: inv.isSeed ?? false,
              }));
              return [...taggedPulled, ...otherWsInv];
            });
          }
          setLastSyncedAt(formatMalaysianDateTime(Date.now()).timePart);
        } catch (pullErr) {
          console.warn('Initial data pull failed:', pullErr);
        }
      } else {
        // Look for existing AMiR spreadsheet in Drive
        try {
          const found = await findAmirSpreadsheet(res.accessToken);
          if (found) {
            setSheetInfoForActiveWorkspace(found);
            showToast(`Hamparan AMiR ditemui untuk ${activeWorkspace.kodSekolah}: "${found.name}"`, 'info');
          }
        } catch (err) {
          console.warn('Could not auto-detect sheet:', err);
        }
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      showToast(`Gagal menyambung akaun Google: ${err.message || 'Sila cuba lagi'}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Google Sign Out handler
  const handleGoogleSignOut = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setAccessToken(null);
      showToast('Akaun Google telah dilog keluar.', 'info');
    } catch (err: any) {
      console.error('Google Sign Out error:', err);
    }
  };

  // Connect explicitly to a shared spreadsheet for the current workspace
  const handleConnectSharedSheet = async (sheetInput: string) => {
    if (!accessToken) {
      showToast('Sila log masuk akaun Google dahulu.', 'error');
      return;
    }
    setIsSyncing(true);
    try {
      const connected = await connectToSpreadsheetById(accessToken, sheetInput);
      setSheetInfoForActiveWorkspace(connected);

      // Immediately pull shared data into active workspace
      const data = await pullDataFromGoogleSheet(accessToken, connected.id, records);
      setAllRecords((prev) => {
        const otherWsRecords = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
        const taggedPulled = data.records.map((r) => ({
          ...r,
          workspaceId: activeWorkspace.id,
          isSeed: r.isSeed ?? false,
        }));
        return [...taggedPulled, ...otherWsRecords];
      });

      if (data.inventory.length > 0) {
        setAllInventory((prev) => {
          const otherWsInv = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
          const taggedPulled = data.inventory.map((inv) => ({
            ...inv,
            workspaceId: activeWorkspace.id,
            isSeed: inv.isSeed ?? false,
          }));
          return [...taggedPulled, ...otherWsInv];
        });
      }

      setLastSyncedAt(formatMalaysianDateTime(Date.now()).timePart);
      showToast(`Berjaya disambung ke fail: "${connected.name}" bagi ${activeWorkspace.kodSekolah}!`, 'success');
    } catch (err: any) {
      console.error('Connect shared sheet failed:', err);
      showToast(`Gagal sambung ke fail kongsi: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Create new Sheet dedicated for the active workspace
  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      showToast('Sila log masuk Google terlebih dahulu.', 'error');
      return;
    }
    setIsSyncing(true);
    try {
      const folderId = await getOrCreateAmirFolder(accessToken);
      const customTitle = `AMiR - ${activeWorkspace.namaSekolah} (${activeWorkspace.namaStor})`;
      const newSheet = await createAmirSpreadsheet(accessToken, folderId, customTitle);
      setSheetInfoForActiveWorkspace(newSheet);

      // Sync initial data with non-destructive merge
      const synced = await performSafeTwoWaySync(accessToken, newSheet.id, records, inventory);
      setAllRecords((prev) => {
        const otherWsRecords = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
        const taggedRecords = synced.records.map((r) => ({
          ...r,
          workspaceId: activeWorkspace.id,
          isSeed: r.isSeed ?? false,
        }));
        return [...taggedRecords, ...otherWsRecords];
      });

      setAllInventory((prev) => {
        const otherWsInv = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
        const taggedInv = synced.inventory.map((inv) => ({
          ...inv,
          workspaceId: activeWorkspace.id,
          isSeed: inv.isSeed ?? false,
        }));
        return [...taggedInv, ...otherWsInv];
      });

      setLastSyncedAt(formatMalaysianDateTime(Date.now()).timePart);
      showToast(`Google Sheet untuk ${activeWorkspace.namaSekolah} berjaya dicipta!`, 'success');
    } catch (err: any) {
      console.error('Create sheet failed:', err);
      showToast(`Gagal mencipta Google Sheet: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Safe Two-Way Sync for active workspace
  const handleSyncToDrive = async () => {
    if (!accessToken) {
      showToast('Sila log masuk Google untuk menyegerak data.', 'error');
      return;
    }
    setIsSyncing(true);
    try {
      let targetSheetId = sheetInfo?.id;
      if (!targetSheetId) {
        const folderId = await getOrCreateAmirFolder(accessToken);
        const customTitle = `AMiR - ${activeWorkspace.namaSekolah} (${activeWorkspace.namaStor})`;
        const created = await createAmirSpreadsheet(accessToken, folderId, customTitle);
        setSheetInfoForActiveWorkspace(created);
        targetSheetId = created.id;
      }

      const reconciled = await performSafeTwoWaySync(accessToken, targetSheetId, records, inventory);
      setAllRecords((prev) => {
        const otherWsRecords = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
        const taggedRecords = reconciled.records.map((r) => ({
          ...r,
          workspaceId: activeWorkspace.id,
          isSeed: r.isSeed ?? false,
        }));
        return [...taggedRecords, ...otherWsRecords];
      });

      setAllInventory((prev) => {
        const otherWsInv = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
        const taggedInv = reconciled.inventory.map((inv) => ({
          ...inv,
          workspaceId: activeWorkspace.id,
          isSeed: inv.isSeed ?? false,
        }));
        return [...taggedInv, ...otherWsInv];
      });

      const nowTimeStr = formatMalaysianDateTime(Date.now()).timePart;
      setLastSyncedAt(nowTimeStr);
      showToast(`Penyegerakan selamat bagi ${activeWorkspace.kodSekolah} berjaya!`, 'success');
    } catch (err: any) {
      console.error('Sync failed:', err);
      showToast(`Gagal menyegerak: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull from Google Sheets for active workspace
  const handlePullFromDrive = async () => {
    if (!accessToken) {
      showToast('Sila log masuk Google untuk memuat turun data.', 'error');
      return;
    }
    const targetSheetId = sheetInfo?.id;
    if (!targetSheetId) {
      showToast('Tiada fail Google Sheet untuk workspace ini. Sila cipta atau sambung hamparan dahulu.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const data = await pullDataFromGoogleSheet(accessToken, targetSheetId, records);
      setAllRecords((prev) => {
        const otherWsRecords = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
        const taggedPulled = data.records.map((r) => ({
          ...r,
          workspaceId: activeWorkspace.id,
          isSeed: r.isSeed ?? false,
        }));
        return [...taggedPulled, ...otherWsRecords];
      });

      if (data.inventory.length > 0) {
        setAllInventory((prev) => {
          const otherWsInv = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
          const taggedPulled = data.inventory.map((inv) => ({
            ...inv,
            workspaceId: activeWorkspace.id,
            isSeed: inv.isSeed ?? false,
          }));
          return [...taggedPulled, ...otherWsInv];
        });
      }
      setLastSyncedAt(formatMalaysianDateTime(Date.now()).timePart);
      showToast(`Berjaya menarik ${data.records.length} rekod ${activeWorkspace.kodSekolah} dari Google Sheets!`, 'success');
    } catch (err: any) {
      console.error('Pull failed:', err);
      showToast(`Gagal membaca daripada Google Sheets: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add Record (Tagged with active workspaceId and isSeed: false)
  const addRecord = (item: Omit<RecordItem, 'id' | 'createdAt'>) => {
    const nowTimestamp = Date.now();
    const systemTarikhMasa = formatMalaysianDateTime(nowTimestamp).full;

    const newRecord: RecordItem = {
      ...item,
      id: 'rec-' + nowTimestamp + '-' + Math.random().toString(36).substring(2, 6),
      workspaceId: activeWorkspace.id,
      isSeed: false, // Genuine teacher-created record
      createdAt: nowTimestamp,
      createdTarikhMasa: systemTarikhMasa,
    };

    setAllRecords((prev) => {
      const updated = [newRecord, ...prev];
      return updated.sort((a, b) => b.tarikhMasa.localeCompare(a.tarikhMasa));
    });
    showToast(`Rekod untuk ${item.namaGuru} berjaya disimpan!`, 'success');

    // Asynchronously append to Google Sheet if connected to this workspace
    const targetSheetId = sheetInfo?.id;
    if (accessToken && targetSheetId) {
      appendRecordToGoogleSheet(accessToken, targetSheetId, newRecord).catch((err) => {
        console.warn('Real-time append to Google Sheet failed:', err);
        showToast(`Catatan disimpan secara tempatan (Luar talian Google Sheets: ${err.message})`, 'info');
      });
    }

    return newRecord;
  };

  // Delete Record
  const deleteRecord = (id: string) => {
    setAllRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Rekod telah dipadam daripada peranti.', 'info');
  };

  // Add Inventory item (Tagged with active workspaceId and isSeed: false)
  const addInventory = (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      workspaceId: activeWorkspace.id,
      isSeed: false, // Genuine item created by user
      updatedAt: Date.now(),
    };
    setAllInventory((prev) => [newItem, ...prev]);
    showToast(`Barang "${item.namaBarang}" berjaya ditambah!`, 'success');

    const targetSheetId = sheetInfo?.id;
    if (accessToken && targetSheetId) {
      updateInventoryRowInGoogleSheet(accessToken, targetSheetId, newItem).catch((err) => {
        console.warn('Real-time inventory sync to Google Sheet failed:', err);
      });
    }

    return newItem;
  };

  // Update Inventory item
  const updateInventory = (id: string, updates: Partial<InventoryItem>) => {
    let updatedItem: InventoryItem | null = null;
    setAllInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = { ...item, ...updates, updatedAt: Date.now() };
          return updatedItem;
        }
        return item;
      })
    );
    showToast('Maklumat barang berjaya dikemaskini.', 'success');

    const targetSheetId = sheetInfo?.id;
    if (accessToken && targetSheetId && updatedItem) {
      updateInventoryRowInGoogleSheet(accessToken, targetSheetId, updatedItem).catch((err) => {
        console.warn('Real-time inventory update to Google Sheet failed:', err);
      });
    }
  };

  // Delete Inventory item
  const deleteInventory = (id: string) => {
    setAllInventory((prev) => prev.filter((item) => item.id !== id));
    showToast('Barang telah dipadam daripada inventori.', 'info');

    const targetSheetId = sheetInfo?.id;
    if (accessToken && targetSheetId) {
      deleteInventoryRowInGoogleSheet(accessToken, targetSheetId, id).catch((err) => {
        console.warn('Real-time inventory delete to Google Sheet failed:', err);
      });
    }
  };

  // Padam Data Ujian (Delete Seed Data from Active Workspace only)
  const deleteSeedData = () => {
    // Count how many seed items exist before deletion in active workspace
    const seedRecordsCount = allRecords.filter(
      (r) => (r.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspace.id && r.isSeed === true
    ).length;

    const seedInventoryCount = allInventory.filter(
      (i) => (i.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspace.id && i.isSeed === true
    ).length;

    // Filter OUT seed data for active workspace only, leaving genuine records and other workspaces intact
    setAllRecords((prev) =>
      prev.filter((r) => {
        const isCurrentWs = (r.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspace.id;
        if (isCurrentWs && r.isSeed === true) {
          return false; // delete this seed item
        }
        return true;
      })
    );

    setAllInventory((prev) =>
      prev.filter((i) => {
        const isCurrentWs = (i.workspaceId || DEFAULT_WORKSPACE.id) === activeWorkspace.id;
        if (isCurrentWs && i.isSeed === true) {
          return false; // delete this seed item
        }
        return true;
      })
    );

    showToast(
      `Berjaya memadam ${seedRecordsCount} rekod ujian dan ${seedInventoryCount} alatan ujian dari ${activeWorkspace.namaSekolah}. Rekod guru kekal selamat!`,
      'success'
    );
  };

  // Reset sample data for active workspace
  const resetToSampleData = () => {
    // Replace active workspace records with initial seed records
    setAllRecords((prev) => {
      const otherWs = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
      const seeded = INITIAL_RECORDS.map((r) => ({
        ...r,
        workspaceId: activeWorkspace.id,
        isSeed: true,
      }));
      return [...seeded, ...otherWs];
    });

    setAllInventory((prev) => {
      const otherWs = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
      const seeded = INITIAL_INVENTORY.map((i) => ({
        ...i,
        workspaceId: activeWorkspace.id,
        isSeed: true,
      }));
      return [...seeded, ...otherWs];
    });

    showToast(`Data contoh bagi ${activeWorkspace.namaSekolah} telah dimuat semula.`, 'info');
  };

  // Export JSON (for active workspace)
  const exportDataJson = () => {
    const exportObject = {
      app: 'AMiR — Ambil Isi Rekod',
      workspace: activeWorkspace,
      exportedAt: new Date().toISOString(),
      records,
      inventory,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMiR_${activeWorkspace.kodSekolah}_Backup_${getTodayYMD()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Fail sandaran JSON berjaya dimuat turun.', 'success');
  };

  // Import JSON (into active workspace)
  const importDataJson = (fileContent: string): boolean => {
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed.records) && Array.isArray(parsed.inventory)) {
        const importedRecords: RecordItem[] = parsed.records.map((r: any) => ({
          ...r,
          workspaceId: activeWorkspace.id,
          isSeed: r.isSeed ?? false,
        }));
        const importedInventory: InventoryItem[] = parsed.inventory.map((inv: any) => ({
          ...inv,
          workspaceId: activeWorkspace.id,
          isSeed: inv.isSeed ?? false,
        }));

        setAllRecords((prev) => {
          const otherWs = prev.filter((r) => (r.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
          return [...importedRecords, ...otherWs];
        });

        setAllInventory((prev) => {
          const otherWs = prev.filter((i) => (i.workspaceId || DEFAULT_WORKSPACE.id) !== activeWorkspace.id);
          return [...importedInventory, ...otherWs];
        });

        showToast(`Data sandaran berjaya diimport ke dalam ${activeWorkspace.namaSekolah}!`, 'success');
        return true;
      } else {
        showToast('Format fail sandaran tidak sah. Pastikan fail mengandungi rekod & inventori.', 'error');
        return false;
      }
    } catch {
      showToast('Gagal membaca fail JSON.', 'error');
      return false;
    }
  };

  // Count seed data in active workspace
  const activeWorkspaceSeedCount = useMemo(() => {
    const recSeeds = records.filter((r) => r.isSeed === true).length;
    const invSeeds = inventory.filter((i) => i.isSeed === true).length;
    return { records: recSeeds, inventory: invSeeds, total: recSeeds + invSeeds };
  }, [records, inventory]);

  // Today's records count (using Tarikh & Masa Ambil) for active workspace
  const todayDateStr = useMemo(() => {
    return getTodayYMD();
  }, []);

  const recordsTodayCount = useMemo(() => {
    return records.filter((rec) => rec.tarikhMasa.startsWith(todayDateStr)).length;
  }, [records, todayDateStr]);

  return {
    activeTab,
    setActiveTab,
    records,
    inventory,
    recordsTodayCount,
    todayDateStr,
    toastMessage,
    showToast,
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

    // Google Workspace Integration
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
  };
}
