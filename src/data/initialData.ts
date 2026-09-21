import { RecordItem, InventoryItem, Workspace } from '../types';
import { formatMalaysianDateTime } from '../utils/dateUtils';

export const DEFAULT_WORKSPACE: Workspace = {
  id: 'ws-skam-default',
  namaSekolah: 'SK Air Merah',
  kodSekolah: 'SKAM',
  namaStor: 'Stor PJ',
  sheetInfo: null,
  createdAt: 1710000000000,
};

export const getTodayDateString = (offsetDays = 0, hours = 8, minutes = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  date.setHours(hours, minutes, 0, 0);
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hh}:${mm}`;
};

export const INITIAL_RECORDS: RecordItem[] = [
  {
    id: 'rec-seed-001',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaGuru: 'Cikgu Ahmad Faizul bin Rosli',
    tarikhMasa: getTodayDateString(0, 8, 15),
    kelas: '4 Cekal',
    aktivitiSebab: 'Pendidikan Jasmani — Bola Tampar',
    catatan: 'Ambil 6 biji bola tampar Mikasa dan 1 jaring. Pemulangan tamat waktu rehat (10:15 pagi).',
    createdAt: Date.now() - 3600000 * 2,
    createdTarikhMasa: formatMalaysianDateTime(Date.now() - 3600000 * 2).full,
  },
  {
    id: 'rec-seed-002',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaGuru: 'Ustazah Siti Noraisyah binti Hamzah',
    tarikhMasa: getTodayDateString(0, 9, 45),
    kelas: '2 Amanah',
    aktivitiSebab: 'Sukaneka & Koordinasi Motor Kasar',
    catatan: '12 kon skital oren, 4 pundi kacang hijau pelbagai warna, 6 gelung hula hoop.',
    createdAt: Date.now() - 3600000,
    createdTarikhMasa: formatMalaysianDateTime(Date.now() - 3600000).full,
  },
  {
    id: 'rec-seed-003',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaGuru: 'Cikgu Tan Wei Ming',
    tarikhMasa: getTodayDateString(1, 10, 30),
    kelas: '5 Bestari',
    aktivitiSebab: 'Ujian Kecergasan Fizikal (SEGAK)',
    catatan: '1 bangku jangkauan melunjur (sit & reach box), 2 pita pengukur keluli, 1 metronom bateri.',
    createdAt: Date.now() - 86400000,
    createdTarikhMasa: formatMalaysianDateTime(Date.now() - 86400000).full,
  },
  {
    id: 'rec-seed-004',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaGuru: 'Cikgu Saravanan a/l Ramasamy',
    tarikhMasa: getTodayDateString(2, 16, 0),
    kelas: 'Rumah Sukan Temenggong (Merah)',
    aktivitiSebab: 'Latihan Olahraga & Lari Berganti-ganti',
    catatan: '4 baton aluminium 4 warna, 2 wisel Fox40, 1 peti pertolongan cemas stor.',
    // Backdated: Entered just 1 hour ago into system, but taken 2 days ago!
    createdAt: Date.now() - 3600000,
    createdTarikhMasa: formatMalaysianDateTime(Date.now() - 3600000).full,
  },
  {
    id: 'rec-seed-005',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaGuru: 'Cikgu Nurul Huda binti Othman',
    tarikhMasa: getTodayDateString(3, 8, 0),
    kelas: '6 Gemilang',
    aktivitiSebab: 'Pendidikan Jasmani — Gimnastik Asas',
    catatan: '2 unit tilam mendarat tebal (landing mat), 4 gelung irama gimnastik.',
    // Backdated: Entered 10 minutes ago, but taken 3 days ago!
    createdAt: Date.now() - 600000,
    createdTarikhMasa: formatMalaysianDateTime(Date.now() - 600000).full,
  },
  {
    id: 'rec-seed-006',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaGuru: 'Cikgu Mohd Khairul bin Anuar',
    tarikhMasa: getTodayDateString(1, 8, 0),
    kelas: '3 Dinamik',
    aktivitiSebab: 'Permainan Tradisional & Ketangkasan',
    catatan: '8 biji bola getah kecil, 10 kon penanda.',
    // Backdated entry: Recorded just now, but taken yesterday morning at 8:00 AM!
    createdAt: Date.now() - 120000,
    createdTarikhMasa: formatMalaysianDateTime(Date.now() - 120000).full,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-seed-001',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Bola Sepak Saiz 5 (Molten/Nike)',
    kuantiti: '24 biji',
    catatan: 'Rak Besi 1 tingkat tengah. 4 biji perlu dipam angin semula.',
    kategori: 'Bola & Jaring',
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'inv-seed-002',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Bola Tampar Mikasa MVA200',
    kuantiti: '18 biji',
    catatan: 'Peti Biru A. Semua dalam keadaan baik dan bertekanan piawai.',
    kategori: 'Bola & Jaring',
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'inv-seed-003',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Kon Latihan Skital Oren (12 inci)',
    kuantiti: '45 unit',
    catatan: 'Rak Bawah. 5 unit retak pada tapak tetapi masih boleh diguna.',
    kategori: 'Peralatan Padang',
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'inv-seed-004',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Gelung Hula Hoop Pelbagai Saiz',
    kuantiti: '30 gelung',
    catatan: 'Tergantung pada cangkuk dinding stor sebelah kiri.',
    kategori: 'Kecergasan & Sukaneka',
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'inv-seed-005',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Bangku Ujian SEGAK Melunjur',
    kuantiti: '3 set lengkap',
    catatan: 'Atas meja guru stor. Skala pengukur jelas terbaca.',
    kategori: 'Ujian SEGAK',
    updatedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'inv-seed-006',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Baton Olahraga Aluminium',
    kuantiti: '16 batang (4 set)',
    catatan: 'Dalam beg berzip hitam. Warna merah, biru, kuning, hijau.',
    kategori: 'Olahraga',
    updatedAt: Date.now() - 86400000 * 8,
  },
  {
    id: 'inv-seed-007',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Raket Badminton Yonex Sekolah',
    kuantiti: '32 bilah',
    catatan: 'Kabinet Kayu 2. Ada 3 bilah tali putus, perlu pasang tali baharu.',
    kategori: 'Raket',
    updatedAt: Date.now() - 86400000 * 12,
  },
  {
    id: 'inv-seed-008',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Tilam Gimnastik Lipat Tebal',
    kuantiti: '8 keping',
    catatan: 'Tersusun rapat di tepi dinding stor kanan. Lap habuk berkala.',
    kategori: 'Kecergasan & Sukaneka',
    updatedAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'inv-seed-009',
    workspaceId: DEFAULT_WORKSPACE.id,
    isSeed: true,
    namaBarang: 'Peti Pertolongan Cemas Stor PJ',
    kuantiti: '2 set',
    catatan: '1 set untuk padang, 1 set kekal di stor. Disemak setiap bulan.',
    kategori: 'Keselamatan',
    updatedAt: Date.now() - 86400000 * 1,
  },
];

export const QUICK_TEACHER_SUGGESTIONS = [
  'Cikgu Ahmad Faizul',
  'Ustazah Siti Noraisyah',
  'Cikgu Tan Wei Ming',
  'Cikgu Saravanan',
  'Cikgu Nurul Huda',
  'Cikgu Khairul Anuar',
  'Cikgu Wong Siew Ling',
  'Ustaz Mohd Farhan',
];

export const QUICK_CLASS_SUGGESTIONS = [
  '1 Amanah',
  '1 Bestari',
  '2 Cekal',
  '3 Dinamik',
  '4 Arif',
  '4 Bestari',
  '5 Gemilang',
  '6 Cemerlang',
  'Rumah Sukan',
  'Pasukan Sekolah',
];

export const QUICK_ACTIVITY_SUGGESTIONS = [
  'PJ — Kemahiran Bola Sepak',
  'PJ — Bola Tampar',
  'PJ — Asas Olahraga',
  'PJ — Gimnastik Asas',
  'Ujian SEGAK',
  'Sukaneka Tahap 1',
  'Kokurikulum 1M1S',
  'Latihan Rumah Sukan',
];
