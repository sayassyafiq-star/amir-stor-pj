export interface Workspace {
  id: string; // e.g. 'ws-skam-default'
  namaSekolah: string; // e.g. 'SK Air Merah'
  kodSekolah: string; // e.g. 'SKAM'
  namaStor: string; // e.g. 'Stor PJ'
  sheetInfo?: {
    id: string;
    name: string;
    webViewLink?: string;
    modifiedTime?: string;
    ownerEmail?: string;
  } | null;
  createdAt: number;
}

export interface RecordItem {
  id: string;
  workspaceId?: string; // Links record to specific workspace
  namaGuru: string;
  tarikhMasa: string; // YYYY-MM-DDTHH:mm — "Tarikh & Masa Ambil" (entered by teacher, can be backdated)
  kelas: string;
  aktivitiSebab: string;
  catatan: string; // Completely free text as per AMiR principle
  createdAt: number; // Immutable system timestamp when record was saved
  createdTarikhMasa?: string; // Formatted "Tarikh & Masa Rekod" (immutable DD/MM/YYYY hh:mm)
  isSeed?: boolean; // Explicit flag: true for test/demo data, false for real teacher records
}

export interface InventoryItem {
  id: string;
  workspaceId?: string; // Links item to specific workspace
  namaBarang: string;
  kuantiti: string | number;
  catatan: string;
  kategori?: string;
  updatedAt: number;
  isSeed?: boolean; // Explicit flag: true for test/demo data, false for real teacher records
}

export type NavTab = 'home' | 'inventori' | 'rekod' | 'laporan' | 'tetapan';

export type LaporanFilterType = 'hari' | 'minggu' | 'bulan' | 'tahun' | 'custom';
