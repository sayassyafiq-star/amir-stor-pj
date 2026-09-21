import { RecordItem, InventoryItem } from '../types';
import { formatMalaysianDateTime } from '../utils/dateUtils';

export interface SheetFileMetadata {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
  ownerEmail?: string;
}

const FOLDER_NAME = 'AMiR Stor PJ Data';
const DEFAULT_SHEET_NAME = 'AMiR - Stor PJ (Buku Rekod & Inventori)';
const STORED_SPREADSHEET_ID_KEY = 'amir_shared_spreadsheet_id_v1';

// In-flight mutex lock to prevent accidental concurrent syncs/race conditions
let isPerformingSync = false;

// Helper to make authorized Google API calls
async function googleFetch(url: string, token: string, options: RequestInit = {}) {
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`Google API (${response.status}): ${errorDetail}`);
  }
  return response.json();
}

/**
 * Get or set manually linked shared spreadsheet ID (for colleagues who have access to shared sheet)
 */
export function getSavedSharedSpreadsheetId(): string | null {
  try {
    return localStorage.getItem(STORED_SPREADSHEET_ID_KEY);
  } catch {
    return null;
  }
}

export function saveSharedSpreadsheetId(sheetId: string) {
  try {
    localStorage.setItem(STORED_SPREADSHEET_ID_KEY, sheetId.trim());
  } catch {
    // ignore
  }
}

/**
 * Extract Spreadsheet ID from either raw ID or Google Sheets URL
 */
export function parseSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * 1. Find or create the Google Drive folder dedicated to AMiR app
 */
export async function getOrCreateAmirFolder(token: string): Promise<string> {
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`
  );
  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
    token
  );

  if (searchRes.files && searchRes.files.length > 0) {
    return searchRes.files[0].id;
  }

  // Create folder
  const createRes = await googleFetch('https://www.googleapis.com/drive/v3/files', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder rasmi AMiR Stor PJ untuk hamparan buku rekod sekolah.',
    }),
  });

  return createRes.id;
}

/**
 * 2. Find existing AMiR spreadsheet (either created by user or shared with user)
 */
export async function findAmirSpreadsheet(token: string): Promise<SheetFileMetadata | null> {
  // Check if user previously connected to a specific shared sheet ID
  const savedId = getSavedSharedSpreadsheetId();
  if (savedId) {
    try {
      const directRes = await googleFetch(
        `https://www.googleapis.com/drive/v3/files/${savedId}?fields=id,name,webViewLink,modifiedTime,owners`,
        token
      );
      if (directRes && directRes.id) {
        return {
          id: directRes.id,
          name: directRes.name,
          webViewLink: directRes.webViewLink,
          modifiedTime: directRes.modifiedTime,
          ownerEmail: directRes.owners?.[0]?.emailAddress,
        };
      }
    } catch (e) {
      console.warn('Could not load saved sheet ID, falling back to search query:', e);
    }
  }

  // Query files user has access to (owned or sharedWithMe)
  const query = encodeURIComponent(
    `mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false and (name contains 'AMiR' or name contains 'Stor PJ')`
  );
  const searchRes = await googleFetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,modifiedTime,owners)&spaces=drive&orderBy=modifiedTime desc`,
    token
  );

  if (searchRes.files && searchRes.files.length > 0) {
    const file = searchRes.files[0];
    saveSharedSpreadsheetId(file.id);
    return {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink,
      modifiedTime: file.modifiedTime,
      ownerEmail: file.owners?.[0]?.emailAddress,
    };
  }

  return null;
}

/**
 * Connect explicitly to a shared spreadsheet by ID or URL (Colleague mode)
 */
export async function connectToSpreadsheetById(
  token: string,
  rawInput: string
): Promise<SheetFileMetadata> {
  const spreadsheetId = parseSpreadsheetId(rawInput);
  if (!spreadsheetId) {
    throw new Error('ID atau pautan Google Sheets tidak sah.');
  }

  const file = await googleFetch(
    `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=id,name,webViewLink,modifiedTime,owners`,
    token
  );

  saveSharedSpreadsheetId(file.id);
  // Ensure required headers exist
  await initializeSheetHeaders(token, file.id);

  return {
    id: file.id,
    name: file.name,
    webViewLink: file.webViewLink,
    modifiedTime: file.modifiedTime,
    ownerEmail: file.owners?.[0]?.emailAddress,
  };
}

/**
 * 3. Create a structured Google Spreadsheet with two tabs: 'Rekod Aktiviti' and 'Inventori Stor'
 */
export async function createAmirSpreadsheet(
  token: string,
  folderId?: string,
  customTitle?: string
): Promise<SheetFileMetadata> {
  const finalTitle = customTitle || DEFAULT_SHEET_NAME;
  const spreadsheetBody = {
    properties: {
      title: finalTitle,
    },
    sheets: [
      {
        properties: {
          title: 'Rekod Aktiviti',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Inventori Stor',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const createRes = await googleFetch(
    'https://sheets.googleapis.com/v4/spreadsheets',
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spreadsheetBody),
    }
  );

  const spreadsheetId = createRes.spreadsheetId;
  const webViewLink = createRes.spreadsheetUrl;

  // Move into AMiR folder if folderId provided
  if (folderId && spreadsheetId) {
    try {
      await googleFetch(
        `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
        token,
        { method: 'PATCH' }
      );
    } catch (e) {
      console.warn('Could not move spreadsheet to folder:', e);
    }
  }

  // Populate Headers
  await initializeSheetHeaders(token, spreadsheetId);
  saveSharedSpreadsheetId(spreadsheetId);

  return {
    id: spreadsheetId,
    name: finalTitle,
    webViewLink,
  };
}

/**
 * Setup header rows for Rekod Aktiviti and Inventori Stor
 */
export async function initializeSheetHeaders(token: string, spreadsheetId: string) {
  // First ensure both sheets exist
  try {
    const meta = await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(title))`,
      token
    );
    const existingTitles = (meta.sheets || []).map((s: any) => s.properties.title);

    const requests: any[] = [];
    if (!existingTitles.includes('Rekod Aktiviti')) {
      requests.push({
        addSheet: {
          properties: { title: 'Rekod Aktiviti', gridProperties: { frozenRowCount: 1 } },
        },
      });
    }
    if (!existingTitles.includes('Inventori Stor')) {
      requests.push({
        addSheet: {
          properties: { title: 'Inventori Stor', gridProperties: { frozenRowCount: 1 } },
        },
      });
    }

    if (requests.length > 0) {
      await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      });
    }
  } catch (e) {
    console.warn('Check sheets batchUpdate info:', e);
  }

  const recordHeaders = [
    'ID Rekod',
    'Tarikh & Masa Ambil',
    'Nama Guru',
    'Kelas / Tingkatan',
    'Aktiviti / Sebab',
    'Catatan / Alatan PJ',
    'Tarikh & Masa Rekod (Sistem)',
  ];

  const inventoryHeaders = [
    'ID Barang',
    'Nama Alatan / Barang',
    'Kuantiti',
    'Kategori',
    'Catatan / Lokasi',
    'Kemaskini Terakhir',
  ];

  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekod Aktiviti!A1:G1?valueInputOption=USER_ENTERED`,
    token,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        range: 'Rekod Aktiviti!A1:G1',
        majorDimension: 'ROWS',
        values: [recordHeaders],
      }),
    }
  );

  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A1:F1?valueInputOption=USER_ENTERED`,
    token,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        range: 'Inventori Stor!A1:F1',
        majorDimension: 'ROWS',
        values: [inventoryHeaders],
      }),
    }
  );
}

/**
 * 4. Append a single new Record to Google Sheet in real-time (Concurrency safe)
 */
export async function appendRecordToGoogleSheet(
  token: string,
  spreadsheetId: string,
  record: RecordItem
): Promise<void> {
  const systemSavedFormatted = formatMalaysianDateTime(record.createdAt || Date.now()).full;

  const row = [
    record.id,
    record.tarikhMasa ? record.tarikhMasa.replace('T', ' ') : '',
    record.namaGuru,
    record.kelas,
    record.aktivitiSebab,
    record.catatan,
    systemSavedFormatted,
  ];

  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekod Aktiviti!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );
}

/**
 * 5. Update or add an inventory row in Google Sheets
 */
export async function updateInventoryRowInGoogleSheet(
  token: string,
  spreadsheetId: string,
  item: InventoryItem
): Promise<void> {
  // Fetch existing inventory IDs
  const invRes = await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A2:F500`,
    token
  );

  const rows: any[][] = invRes.values || [];
  let foundRowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === item.id) {
      foundRowIndex = i + 2; // 1-based index including header
      break;
    }
  }

  const updatedRow = [
    item.id,
    item.namaBarang,
    item.kuantiti,
    item.kategori || 'Peralatan Asas',
    item.catatan,
    formatMalaysianDateTime(item.updatedAt || Date.now()).full,
  ];

  if (foundRowIndex > 0) {
    // Update existing row
    await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A${foundRowIndex}:F${foundRowIndex}?valueInputOption=USER_ENTERED`,
      token,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          range: `Inventori Stor!A${foundRowIndex}:F${foundRowIndex}`,
          majorDimension: 'ROWS',
          values: [updatedRow],
        }),
      }
    );
  } else {
    // Append as new inventory row
    await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: [updatedRow],
        }),
      }
    );
  }
}

/**
 * 6. Delete inventory row in Google Sheets
 */
export async function deleteInventoryRowInGoogleSheet(
  token: string,
  spreadsheetId: string,
  itemId: string
): Promise<void> {
  // Get all inventory rows, filter out the deleted ID, and write back
  const invRes = await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A2:F500`,
    token
  );

  const rows: any[][] = invRes.values || [];
  const remainingRows = rows.filter((r) => r[0] !== itemId);

  // Clear existing data rows
  await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A2:F500:clear`,
    token,
    { method: 'POST' }
  );

  if (remainingRows.length > 0) {
    await googleFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A2:F${1 + remainingRows.length}?valueInputOption=USER_ENTERED`,
      token,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          range: `Inventori Stor!A2:F${1 + remainingRows.length}`,
          majorDimension: 'ROWS',
          values: remainingRows,
        }),
      }
    );
  }
}

/**
 * 7. Pull / Import data from Google Sheet into AMiR (Non-destructive merge to protect both users)
 */
export async function pullDataFromGoogleSheet(
  token: string,
  spreadsheetId: string,
  localRecords: RecordItem[] = []
): Promise<{ records: RecordItem[]; inventory: InventoryItem[] }> {
  // Read Rekod Aktiviti
  const recRes = await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekod Aktiviti!A2:G1000`,
    token
  );

  const sheetRecords: RecordItem[] = [];
  const sheetRecordIdMap = new Set<string>();

  if (recRes.values && Array.isArray(recRes.values)) {
    for (const row of recRes.values) {
      if (row[2] || row[4]) {
        const id = row[0] || 'rec-' + Math.random().toString(36).substring(2, 8);
        sheetRecordIdMap.add(id);

        sheetRecords.push({
          id,
          tarikhMasa: row[1] ? row[1].replace(' ', 'T') : new Date().toISOString().slice(0, 16),
          namaGuru: row[2] || 'Guru',
          kelas: row[3] || '',
          aktivitiSebab: row[4] || '',
          catatan: row[5] || '',
          createdAt: Date.now(),
          createdTarikhMasa: row[6] || undefined,
        });
      }
    }
  }

  // Find any local records that haven't been synced to sheet yet to avoid losing them
  const unmergedLocal = localRecords.filter((lr) => !sheetRecordIdMap.has(lr.id));
  const mergedRecords = [...unmergedLocal, ...sheetRecords];

  // Sort by Tarikh & Masa Ambil descending (latest activity first)
  mergedRecords.sort((a, b) => (b.tarikhMasa > a.tarikhMasa ? 1 : -1));

  // Read Inventori Stor
  const invRes = await googleFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A2:F500`,
    token
  );

  const importedInventory: InventoryItem[] = [];
  if (invRes.values && Array.isArray(invRes.values)) {
    for (const row of invRes.values) {
      if (row[1]) {
        importedInventory.push({
          id: row[0] || 'inv-' + Math.random().toString(36).substring(2, 8),
          namaBarang: row[1] || 'Alatan',
          kuantiti: row[2] || '0',
          kategori: row[3] || 'Peralatan Asas',
          catatan: row[4] || '',
          updatedAt: Date.now(),
        });
      }
    }
  }

  return {
    records: mergedRecords,
    inventory: importedInventory,
  };
}

/**
 * 8. Two-Way Sync (Push + Merge with Google Sheets)
 * Guarantees no user overwrites another user's newly added records
 */
export async function performSafeTwoWaySync(
  token: string,
  spreadsheetId: string,
  localRecords: RecordItem[],
  localInventory: InventoryItem[]
): Promise<{ records: RecordItem[]; inventory: InventoryItem[] }> {
  if (isPerformingSync) {
    throw new Error('Penyegerakan sedang berlangsung. Sila tunggu sebentar.');
  }

  isPerformingSync = true;
  try {
    await initializeSheetHeaders(token, spreadsheetId);

    // 1. Pull sheet records first
    const sheetData = await pullDataFromGoogleSheet(token, spreadsheetId, localRecords);

    // 2. Identify local records that are not in the sheet
    const sheetIds = new Set(sheetData.records.map((r) => r.id));
    const recordsToAppend = localRecords.filter((r) => !sheetIds.has(r.id));

    // 3. Append missing local records
    for (const rec of recordsToAppend) {
      await appendRecordToGoogleSheet(token, spreadsheetId, rec);
    }

    // 4. Update inventory sheet: if sheet inventory is empty, push local inventory
    if (sheetData.inventory.length === 0 && localInventory.length > 0) {
      const invRows = localInventory.map((inv) => [
        inv.id,
        inv.namaBarang,
        inv.kuantiti,
        inv.kategori || 'Peralatan Asas',
        inv.catatan,
        formatMalaysianDateTime(inv.updatedAt || Date.now()).full,
      ]);

      await googleFetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inventori Stor!A2:F${1 + invRows.length}?valueInputOption=USER_ENTERED`,
        token,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            range: `Inventori Stor!A2:F${1 + invRows.length}`,
            majorDimension: 'ROWS',
            values: invRows,
          }),
        }
      );
    }

    // 5. Re-pull final reconciled data
    const finalData = await pullDataFromGoogleSheet(token, spreadsheetId, []);
    return finalData;
  } finally {
    isPerformingSync = false;
  }
}
