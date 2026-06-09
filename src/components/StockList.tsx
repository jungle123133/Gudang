import React, { useState } from 'react';
import { Product, Category } from '../types';
import { INITIAL_CATEGORIES } from '../data';
import { Plus, Search, Filter, Pencil, Trash2, X, MapPin, Tag, ShieldCheck, AlertCircle, QrCode, Download, Printer, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface StockListProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, updated: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export function StockList({ products, onAddProduct, onEditProduct, onDeleteProduct }: StockListProps) {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // ALL, NORMAL, LOW, OUT

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Makanan & Minuman');
  const [stock, setStock] = useState<number>(0);
  const [unit, setUnit] = useState('Pcs');
  const [minStock, setMinStock] = useState<number>(10);
  const [price, setPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Local validation error state
  const [validationError, setValidationError] = useState('');

  // QR Code labelling state
  const [selectedQrProduct, setSelectedQrProduct] = useState<Product | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);

  const openQrModal = async (p: Product) => {
    setSelectedQrProduct(p);
    try {
      const url = await QRCode.toDataURL(p.sku, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      setQrDataUrl(url);
      setIsQrModalOpen(true);
    } catch (err) {
      console.error('Gagal membuat QR Code', err);
    }
  };

  const downloadQrPng = () => {
    if (!qrDataUrl || !selectedQrProduct) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_LABEL_${selectedQrProduct.sku}_${selectedQrProduct.location.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySkuToClipboard = (skuCode: string) => {
    navigator.clipboard.writeText(skuCode);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  // Handle opening modal for Add
  const openAddModal = () => {
    setEditingProduct(null);
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setCategory('Makanan & Minuman');
    setStock(0);
    setUnit('Pcs');
    setMinStock(10);
    setPrice(0);
    setSellingPrice(0);
    setLocation('Rak A-');
    setDescription('');
    setValidationError('');
    setIsModalOpen(true);
  };

  // Handle opening modal for Edit
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setSku(p.sku);
    setName(p.name);
    setCategory(p.category);
    setStock(p.stock);
    setUnit(p.unit);
    setMinStock(p.minStock);
    setPrice(p.price);
    setSellingPrice(p.sellingPrice || Math.round(p.price * 1.25));
    setLocation(p.location);
    setDescription(p.description || '');
    setValidationError('');
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sku.trim() || !name.trim() || !unit.trim() || !location.trim()) {
      setValidationError('Semua kolom penting bertanda bintang (*) harus diisi.');
      return;
    }

    // Check Duplicate SKU for generic additions
    if (!editingProduct) {
      const duplicate = products.some(p => p.sku.toLowerCase() === sku.trim().toLowerCase());
      if (duplicate) {
        setValidationError(`Kode SKU "${sku.trim()}" sudah digunakan oleh produk lain.`);
        return;
      }
    } else {
      const duplicate = products.some(p => p.sku.toLowerCase() === sku.trim().toLowerCase() && p.id !== editingProduct.id);
      if (duplicate) {
        setValidationError(`Kode SKU "${sku.trim()}" sudah digunakan oleh produk lain.`);
        return;
      }
    }

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      stock: Number(stock),
      unit: unit.trim(),
      minStock: Number(minStock),
      price: Number(price),
      sellingPrice: Number(sellingPrice) || Math.round(Number(price) * 1.25),
      location: location.trim(),
      description: description.trim()
    };

    if (editingProduct) {
      onEditProduct(editingProduct.id, payload);
    } else {
      onAddProduct(payload);
    }

    setIsModalOpen(false);
  };

  // Delete product with confirmation
  const handleDelete = (p: Product) => {
    const confirmation = window.confirm(`Apakah Anda yakin ingin menghapus produk "${p.name}" (${p.sku}) dari sistem?\nTindakan ini menghapus riwayat persediaan produk ini.`);
    if (confirmation) {
      onDeleteProduct(p.id);
    }
  };

  // Helper formatting for rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus === 'NORMAL') {
      matchesStatus = p.stock > p.minStock;
    } else if (selectedStatus === 'LOW') {
      matchesStatus = p.stock <= p.minStock && p.stock > 0;
    } else if (selectedStatus === 'OUT') {
      matchesStatus = p.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-3.5">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <Tag size={14} className="text-indigo-600" />
            <h1 className="text-base font-black text-slate-950 uppercase tracking-tight">
              Master Katalog & Stok Rak
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Kelola master data barang, alokasi penyimpanan rak, serta pengaturan stok pengaman (safety limits).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={14} /> Registrasi Barang Baru
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs flex flex-col md:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama produk, SKU, atau rak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
            <Tag size={11} className="text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 focus:outline-hidden font-bold cursor-pointer"
            >
              <option value="ALL">Semua Sektor</option>
              {INITIAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
            <Filter size={11} className="text-slate-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 focus:outline-hidden font-bold cursor-pointer"
            >
              <option value="ALL">Semua Status Stok</option>
              <option value="NORMAL">Normal / Aman</option>
              <option value="LOW">Kritis / Menipis</option>
              <option value="OUT">Habis / Kosong</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table Desktop / Cards Mobile */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-250 text-slate-550 font-black uppercase text-[10px] tracking-wider">
                <th className="p-2.5 pl-4">Kode SKU</th>
                <th className="p-2.5">Nama Barang Komoditas</th>
                <th className="p-2.5">Kategori Sektor</th>
                <th className="p-2.5 text-center">Stok Sisa</th>
                <th className="p-2.5">Lokasi Rak</th>
                <th className="p-2.5 text-right">Harga Beli</th>
                <th className="p-2.5 text-right">Harga Jual</th>
                <th className="p-2.5 text-center">Indikator</th>
                <th className="p-2.5 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400 italic font-medium">
                    Tidak ditemukan katalog produk yang cocok dengan parameter kueri Anda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  const isOut = p.stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 text-slate-700 transition-colors">
                      <td className="p-2 pl-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold text-[9.5px]">
                            {p.sku}
                          </span>
                          <button
                            onClick={() => openQrModal(p)}
                            className="p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="Tampilkan QR Code"
                          >
                            <QrCode size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-[280px] truncate">
                          <p className="font-extrabold text-slate-950 truncate" title={p.name}>
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate-2xs font-medium" title={p.description}>
                            {p.description || 'Tanpa deskripsi tambahan.'}
                          </p>
                        </div>
                      </td>
                      <td className="p-2 text-slate-550 font-semibold">{p.category}</td>
                      <td className="p-2 text-center">
                        <span className={`font-black text-xs ${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'}`}>{p.stock}</span>{' '}
                        <span className="text-slate-400 font-bold text-[9px]">{p.unit}</span>
                      </td>
                      <td className="p-2">
                        <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.2 text-[10px] font-bold">
                          <MapPin size={10} className="text-slate-400" /> {p.location}
                        </span>
                      </td>
                      <td className="p-2 text-right font-bold text-slate-700">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="p-2 text-right font-bold text-slate-700">
                        {formatRupiah(p.sellingPrice || Math.round(p.price * 1.25))}
                      </td>
                      <td className="p-2 text-center">
                        {isOut ? (
                          <span className="inline-flex bg-rose-50 text-rose-800 border border-rose-200 font-black px-1.5 py-0.2 rounded text-[8px] uppercase">
                            HABIS (NOL)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex bg-amber-50 text-amber-800 border border-amber-200 font-black px-1.5 py-0.2 rounded text-[8px] uppercase">
                            MENIPIS
                          </span>
                        ) : (
                          <span className="inline-flex bg-emerald-50 text-emerald-800 border border-emerald-200 font-black px-1.5 py-0.2 rounded text-[8px] uppercase">
                            AMAN
                          </span>
                        )}
                      </td>
                      <td className="p-2 pr-4 text-right">
                        <div className="inline-flex gap-1 justify-end">
                          <button
                            onClick={() => openQrModal(p)}
                            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Cetak & Label QR Code"
                          >
                            <QrCode size={11} />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Edit data barang"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded transition-colors cursor-pointer"
                            title="Hapus barang"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden divide-y divide-slate-150">
          {filteredProducts.length === 0 ? (
            <div className="p-6 text-center text-slate-400 italic text-xs font-medium">
              Tidak ditemukan produk cocok.
            </div>
          ) : (
            filteredProducts.map(p => {
              const isLow = p.stock <= p.minStock && p.stock > 0;
              const isOut = p.stock === 0;

              return (
                <div key={p.id} className="p-3 space-y-2 text-[11px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-bold text-[9px]">
                          {p.sku}
                        </span>
                        <button
                          onClick={() => openQrModal(p)}
                          className="p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title="Lihat QR Code"
                        >
                          <QrCode size={10} />
                        </button>
                      </div>
                      <h4 className="font-extrabold text-slate-900 mt-1 truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{p.category} &bull; {p.location}</p>
                    </div>
                    {isOut ? (
                      <span className="bg-rose-50 text-rose-800 font-bold px-1 py-0.2 rounded text-[8px] border border-rose-200 shrink-0 uppercase">
                        Habis
                      </span>
                    ) : isLow ? (
                      <span className="bg-amber-50 text-amber-800 font-bold px-1 py-0.2 rounded text-[8px] border border-amber-200 shrink-0 uppercase">
                        Kritis
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-800 font-bold px-1 py-0.2 rounded text-[8px] border border-emerald-200 shrink-0 uppercase">
                        Aman
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 text-[10px] gap-1.5 p-1.5 bg-slate-50 rounded">
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-[8px]">Stok</p>
                      <p className="text-slate-900 font-black">{p.stock} {p.unit}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-[8px]">Harga Beli</p>
                      <p className="text-slate-900 font-bold">{formatRupiah(p.price)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-[8px]">Harga Jual</p>
                      <p className="text-slate-900 font-bold text-indigo-700">
                        {formatRupiah(p.sellingPrice || Math.round(p.price * 1.25))}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold h-5">
                    <span>Safety Limit: {p.minStock} {p.unit}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openQrModal(p)}
                        className="px-1.5 py-0.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded border border-slate-200 font-extrabold cursor-pointer text-[10px] flex items-center gap-0.5"
                      >
                        <QrCode size={9} /> QR
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-100 font-extrabold cursor-pointer text-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="px-1.5 py-0.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-100 font-extrabold cursor-pointer text-[10px]"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add / Edit Dialog Modal Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto">
          {/* Modal Container */}
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                  {editingProduct ? 'Perbarui Data Produk' : 'Tambah Produk Inventaris Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingProduct ? 'Modifikasi detail dari barang ber-SKU bersangkutan' : 'Daftarkan nama komoditi baru ke database gudang'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-md transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Validation alert banner */}
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2 text-rose-700 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal menyimpan:</span> {validationError}
                  </div>
                </div>
              )}

              {/* Grid Inputs SKU & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Kode SKU Barang *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RAW-KOP-RBS"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase font-mono"
                    disabled={editingProduct !== null} // Keep SKU immutable to prevent breaking transaction SKU links
                  />
                  {editingProduct && (
                    <p className="text-[9px] text-slate-400">Kode SKU produk yang sudah ada tidak dapat diganti.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Nama Barang Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Susu UHT Blueberries 1L"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category, Unit  */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Kategori Barang *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    {INITIAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Satuan Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="pcs, box, Kg, Roll, ltr"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Batas Minim Pengaman (Low Stock Alert) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Stock initial, prices, and Storage location */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    {editingProduct ? 'Jumlah Stok Saat Ini' : 'Stok Pembuka Awal *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Harga Beli Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => {
                      const pVal = Number(e.target.value);
                      setPrice(pVal);
                      // Auto calculate suggestions for selling price
                      if (sellingPrice === 0 || sellingPrice <= pVal) {
                        setSellingPrice(Math.round(pVal * 1.25));
                      }
                    }}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Harga Jual Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-500 font-semibold">
                    Lokasi Rak Penyimpanan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rak A-05"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-200 text-xs rounded-lg p-2 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-500 font-semibold">
                  Keterangan Singkat / Deskripsi Barang
                </label>
                <textarea
                  placeholder="Isikan rincian merek, tipe, kondisi suhu penyimpanan, nama produsen dll..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 text-xs rounded-lg p-2 h-16 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50/20"
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Daftarkan Barang baru'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR Code Viewer & Label Printer Modal */}
      {isQrModalOpen && selectedQrProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
          {/* Inject dynamic print stylesheet to print ONLY the ticket */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-qr-tag, #printable-qr-tag * {
                visibility: visible !important;
              }
              #printable-qr-tag {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                margin: auto;
                width: 100% !important;
                max-width: 420px !important;
                height: max-content;
                border: 2px dashed #000000 !important;
                padding: 1.5rem !important;
                background-color: #ffffff !important;
                color: #000000 !important;
                display: block !important;
                box-shadow: none !important;
              }
            }
          `}} />

          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-1.5">
                <QrCode size={15} className="text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-tight text-slate-800">
                  Label Identifikasi QR SKU
                </h3>
              </div>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded cursor-pointer transition-colors"
                title="Tutup dialog"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col items-center space-y-4">
              
              {/* Sticker Tag Preview */}
              <div 
                id="printable-qr-tag" 
                className="w-full bg-white border-2 border-dashed border-slate-350 p-4 rounded-lg text-slate-900 flex flex-col items-center shadow-xs"
              >
                {/* Header Sticker */}
                <div className="w-full text-center border-b border-slate-200 pb-1.5 mb-2.5">
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">IDENTIFIKASI STOK GUDANG</p>
                  <p className="text-[10px] font-bold text-slate-700">TERKAIT MASTER DATA KOMODITAS</p>
                </div>

                {/* QR Canvas / Image */}
                {qrDataUrl ? (
                  <div className="bg-white p-2.5 border border-slate-200 rounded-md shadow-2xs mb-2 flex items-center justify-center">
                    <img 
                      src={qrDataUrl} 
                      alt={`QR Code ${selectedQrProduct.sku}`} 
                      className="w-44 h-44 object-contain select-none shadow-3xs"
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 mb-2">
                    <span className="text-[10px] text-slate-400 italic">Membuat QR...</span>
                  </div>
                )}

                {/* SKU Code (Large Monospace Tag) */}
                <div className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white py-1 px-3 rounded mb-2 select-all font-mono text-center">
                  <span className="font-extrabold text-sm tracking-wider select-all uppercase">
                    {selectedQrProduct.sku}
                  </span>
                </div>

                {/* Product details */}
                <div className="w-full text-center space-y-0.5">
                  <h4 className="font-black text-xs text-slate-950 uppercase tracking-tight line-clamp-1">
                    {selectedQrProduct.name}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Sektor: {selectedQrProduct.category}
                  </p>
                </div>

                {/* Location Shelf Tag */}
                <div className="w-full mt-3 flex justify-between items-center pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">ALOKASI LOKASI</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded uppercase">
                      <MapPin size={9} /> {selectedQrProduct.location}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">STOK GLOBAL</span>
                    <span className="text-[10px] font-black text-slate-800">
                      {selectedQrProduct.stock} {selectedQrProduct.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clipboard Copy SKU Feedback Group */}
              <div className="w-full flex justify-between items-center bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">SALIN DATA SKU</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">{selectedQrProduct.sku}</span>
                </div>
                <button
                  onClick={() => copySkuToClipboard(selectedQrProduct.sku)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedSku ? (
                    <>
                      <Check size={11} className="text-emerald-500" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      Salin
                    </>
                  )}
                </button>
              </div>

              {/* Informative text */}
              <p className="text-[10px] text-slate-500 text-center leading-normal">
                Staf gudang dapat memindai kode QR di atas secara langsung dari monitor atau mencetaknya untuk ditempatkan pada rak penyimpanan produk.
              </p>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="flex-1 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded cursor-pointer text-center text-[11px] transition-colors"
                title="Tutup dialog QR"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={downloadQrPng}
                className="flex-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold rounded cursor-pointer text-center text-[11px] transition-colors flex items-center justify-center gap-1"
                title="Unduh format PNG"
              >
                <Download size={11} /> Unduh
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded cursor-pointer text-center text-[11px] transition-colors flex items-center justify-center gap-1 shadow-xs"
                title="Cetak label lewat print browser"
              >
                <Printer size={11} /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
