import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';
import { formatMalaysianDate } from '../utils/dateUtils';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Info, 
  Tag, 
  FileText, 
  Check,
  AlertTriangle
} from 'lucide-react';

interface InventoriViewProps {
  inventory: InventoryItem[];
  onAddInventory: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  onUpdateInventory: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteInventory: (id: string) => void;
}

export const InventoriView: React.FC<InventoriViewProps> = ({
  inventory,
  onAddInventory,
  onUpdateInventory,
  onDeleteInventory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    namaBarang: '',
    kuantiti: '',
    catatan: '',
    kategori: 'Peralatan Asas',
  });

  // Filter inventory
  const filteredInventory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return inventory;
    return inventory.filter(
      (item) =>
        item.namaBarang.toLowerCase().includes(q) ||
        item.catatan.toLowerCase().includes(q) ||
        (item.kategori && item.kategori.toLowerCase().includes(q))
    );
  }, [inventory, searchQuery]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      namaBarang: '',
      kuantiti: '',
      catatan: '',
      kategori: 'Peralatan Asas',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      namaBarang: item.namaBarang,
      kuantiti: String(item.kuantiti),
      catatan: item.catatan,
      kategori: item.kategori || 'Peralatan Asas',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang.trim()) return;

    if (editingItem) {
      onUpdateInventory(editingItem.id, {
        namaBarang: formData.namaBarang.trim(),
        kuantiti: formData.kuantiti.trim() || '—',
        catatan: formData.catatan.trim(),
        kategori: formData.kategori.trim(),
      });
    } else {
      onAddInventory({
        namaBarang: formData.namaBarang.trim(),
        kuantiti: formData.kuantiti.trim() || '—',
        catatan: formData.catatan.trim(),
        kategori: formData.kategori.trim(),
      });
    }
    closeModal();
  };

  // Pastel accent badge generator for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-teal-50 text-teal-700 border-teal-200',
      'bg-amber-50 text-amber-800 border-amber-200',
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-rose-50 text-rose-700 border-rose-200',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Top Header & Tambah Barang Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 font-display">
              Inventori Stor PJ
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              {inventory.length} alatan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Senarai rujukan inventori peralatan sukan yang diselenggara secara manual.
          </p>
        </div>

        <button
          id="btn-tambah-barang"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-teal-600 via-teal-700 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Tambah Barang</span>
        </button>
      </div>

      {/* Manual Notice Pill */}
      <div
        id="inventory-manual-notice"
        className="flex items-start sm:items-center gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs sm:text-sm"
      >
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <span className="font-bold">Prinsip AMiR: </span>
          <span>
            Inventori ini disimpan dan dikemaskini secara manual oleh pengurus stor. Tiada penolakan stok automatik apabila guru mengisi rekod pinjaman.
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          id="input-search-inventory"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari alatan sukan, rak, atau catatan (cth: Bola, Skital, SEGAK)..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inventory Cards Grid */}
      {filteredInventory.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white border border-dashed border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700">Tiada barang dijumpai</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? `Tiada peralatan sepadan dengan "${searchQuery}".`
              : 'Belum ada barang dalam inventori. Tekan "Tambah Barang" di atas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInventory.map((item, idx) => (
            <div
              key={item.id}
              id={`inventory-card-${item.id}`}
              className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300/80 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Nama Barang & Kuantiti Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    {item.kategori && (
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCategoryColor(
                          idx
                        )}`}
                      >
                        {item.kategori}
                      </span>
                    )}
                    <h3 className="font-bold text-base text-slate-900 font-display leading-snug group-hover:text-teal-800 transition-colors">
                      {item.namaBarang}
                    </h3>
                  </div>

                  {/* Kuantiti Badge */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                      Kuantiti
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-sm font-display shadow-2xs">
                      {item.kuantiti}
                    </span>
                  </div>
                </div>

                {/* Catatan Area */}
                <div className="mt-3.5 bg-slate-50/90 rounded-xl p-3 border border-slate-100/90 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
                        Catatan Stor
                      </span>
                      <p className="leading-relaxed">
                        {item.catatan || 'Tiada catatan khusus.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit / Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {item.updatedAt ? `Kemaskini: ${formatMalaysianDate(item.updatedAt)}` : ''}
                </span>
                <div className="flex items-center gap-1.5">
                {deleteConfirmId === item.id ? (
                  <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    <span className="text-xs text-rose-800 font-semibold">Pasti padam?</span>
                    <button
                      id={`btn-confirm-delete-${item.id}`}
                      onClick={() => {
                        onDeleteInventory(item.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                    >
                      Ya
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      id={`btn-edit-inventory-${item.id}`}
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      id={`btn-delete-inventory-${item.id}`}
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam</span>
                    </button>
                  </>
                )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tambah / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 font-display">
                    {editingItem ? 'Edit Maklumat Barang' : 'Tambah Barang Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Katalog peralatan stor Pendidikan Jasmani
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Nama Barang */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  id="modal-input-nama-barang"
                  type="text"
                  required
                  value={formData.namaBarang}
                  onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                  placeholder="Contoh: Bola Sepak Saiz 5 / Kon Oren"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              {/* Kuantiti & Kategori Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kuantiti <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="modal-input-kuantiti"
                    type="text"
                    required
                    value={formData.kuantiti}
                    onChange={(e) => setFormData({ ...formData, kuantiti: e.target.value })}
                    placeholder="Contoh: 20 biji / 5 set"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori
                  </label>
                  <input
                    id="modal-input-kategori"
                    type="text"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    placeholder="Contoh: Bola / Olahraga / SEGAK"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Catatan
                </label>
                <textarea
                  id="modal-input-catatan"
                  rows={3}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  placeholder="Lokasi rak, keadaan peralatan, rosak/baik..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  id="modal-btn-submit"
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold shadow-md shadow-teal-800/20 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
