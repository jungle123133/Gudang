import React, { useState, useEffect } from 'react';
import { Product, Transaction } from '../types';
import { ArrowUpRight, ArrowDownRight, Plus, Search, Calendar, User, FileText, Sparkles, Filter, ShieldAlert, ArrowLeftRight } from 'lucide-react';

interface TransactionHistoryProps {
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  preselectedSku?: string;
  onClearPreselectedSku?: () => void;
}

export function TransactionHistory({ 
  products, 
  transactions, 
  onAddTransaction,
  preselectedSku,
  onClearPreselectedSku
}: TransactionHistoryProps) {
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL'); // ALL, IN, OUT
  
  // Transaction entry form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [txType, setTxType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState('');
  const [operator, setOperator] = useState('Budi Hartono');
  const [txDate, setTxDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // Prepopulate with current local date YYYY-MM-DD
  });

  // Local helper state for interactive warning
  const [validationError, setValidationError] = useState('');

  // Auto handle preselected SKU from dashboard
  useEffect(() => {
    if (preselectedSku) {
      const match = products.find(p => p.sku === preselectedSku);
      if (match) {
        setSelectedProductId(match.id);
        setTxType('IN');
        setNote(`Restock darurat barang ber-SKU ${preselectedSku}`);
        setIsFormOpen(true);
      }
      if (onClearPreselectedSku) {
        onClearPreselectedSku();
      }
    }
  }, [preselectedSku, products, onClearPreselectedSku]);

  // Find currently selected product details for live stats
  const activeProduct = products.find(p => p.id === selectedProductId);

  // Live validation whenever outputs change
  useEffect(() => {
    if (!activeProduct) {
      setValidationError('');
      return;
    }

    if (txType === 'OUT' && quantity > activeProduct.stock) {
      setValidationError(`Stok tidak mencukupi! Stok saat ini: ${activeProduct.stock} ${activeProduct.unit}. Anda memasukkan: ${quantity} ${activeProduct.unit}.`);
    } else {
      setValidationError('');
    }
  }, [selectedProductId, txType, quantity, activeProduct]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      setValidationError('Pilih salah satu produk terlebih dahulu.');
      return;
    }

    if (!activeProduct) return;

    if (quantity <= 0) {
      setValidationError('Jumlah mutasi barang harus lebih besar dari 0.');
      return;
    }

    // Safety check final block
    if (txType === 'OUT' && quantity > activeProduct.stock) {
      setValidationError(`Gagal merekam: Stok saat ini hanya ${activeProduct.stock} ${activeProduct.unit}.`);
      return;
    }

    onAddTransaction({
      date: txDate,
      type: txType,
      productId: activeProduct.id,
      productSku: activeProduct.sku,
      productName: activeProduct.name,
      quantity: Number(quantity),
      price: activeProduct.price, // Uses current standard valuation
      note: note.trim() || (txType === 'IN' ? 'Koreksi Stok Masuk' : 'Koreksi Stok Keluar'),
      operator: operator.trim() || 'Sistem Gudang'
    });

    // Reset Form
    setIsFormOpen(false);
    setSelectedProductId('');
    setQuantity(1);
    setNote('');
    setValidationError('');
  };

  // Filter Transactions Logic
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.operator.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;

    return matchesSearch && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first

  // Format Helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-3.5">
      
      {/* Title & Add Action Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <ArrowLeftRight size={14} className="text-indigo-600" />
            <h1 className="text-base font-black text-slate-950 uppercase tracking-tight">
              Log Mutasi & Arus Barang
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Pantau pergerakan masuk (IN) dan keluar (OUT) logis, tertata secara real-time berdasarkan kronologi.
          </p>
        </div>
        <button
          onClick={() => {
            setValidationError('');
            setIsFormOpen(true);
          }}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Plus size={14} /> Catat Mutasi Baru
        </button>
      </div>

      {/* Row: Search bar & Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs flex flex-col md:flex-row gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama barang, SKU, keterangan, atau nama petugas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded placeholder-slate-400 font-medium"
          />
        </div>

        {/* Filters Group */}
        <div className="flex gap-1.5 shrink-0">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
            <Filter size={11} className="text-slate-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 focus:outline-hidden font-bold cursor-pointer"
            >
              <option value="ALL">Semua Mutasi</option>
              <option value="IN">Hanya Barang Masuk (IN)</option>
              <option value="OUT">Hanya Barang Keluar (OUT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-250 text-slate-550 font-black uppercase text-[10px] tracking-wider">
                <th className="p-2.5 pl-4">ID Transaksi</th>
                <th className="p-2.5">Tanggal Log</th>
                <th className="p-2.5">Tipe Mutasi</th>
                <th className="p-2.5">SKU / Nama Produk</th>
                <th className="p-2.5 text-right">Jumlah (Unit)</th>
                <th className="p-2.5 text-right">Estimasi Nilai</th>
                <th className="p-2.5">Keterangan</th>
                <th className="p-2.5 pr-4">Petugas Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 font-medium">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 italic">
                    Belum ada rekaman log transaksi produk yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 pl-4 font-mono text-slate-400 text-[10px]">{tx.id}</td>
                    <td className="p-2.5 text-slate-500">
                      {new Date(tx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-2.5">
                      {tx.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-black px-1.5 py-0.2 rounded border border-emerald-100 text-[9px] uppercase">
                          <ArrowUpRight size={10} /> MASUK (IN)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 font-black px-1.5 py-0.2 rounded border border-rose-100 text-[9px] uppercase">
                          <ArrowDownRight size={10} /> KELUAR (OUT)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center">
                        <span className="font-mono text-[9px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 mr-2 font-bold">
                          {tx.productSku}
                        </span>
                        <strong className="text-slate-900 font-extrabold">{tx.productName}</strong>
                      </div>
                    </td>
                    <td className={`p-2.5 text-right font-black ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td className="p-2.5 text-right text-slate-700 font-bold font-mono">
                      {formatRupiah(tx.price * tx.quantity)}
                    </td>
                    <td className="p-2.5 text-slate-500 max-w-[200px] truncate font-medium" title={tx.note}>
                      {tx.note}
                    </td>
                    <td className="p-2.5 text-slate-600 pr-4 font-semibold">{tx.operator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Entry SlideOver/Modal Backdrop */}
      {isFormOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-2xs">
          {/* Modal Content container */}
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-[#0F172A] text-white">
              <div>
                <h3 className="text-xs font-black font-sans uppercase tracking-wider text-slate-100">
                  Registrasi Log Mutasi Stok
                </h3>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Pastikan perpindahan barang tercatat secara nominal logis
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] border border-slate-700 rounded cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              
              {/* Product Select Box */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  KOMODITAS BARANG DEPOSIT *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-slate-250 text-xs rounded p-1.5 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white font-semibold"
                >
                  <option value="">-- PILIH BARANG RAK --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] - {p.name} (Tersedia: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Info card for selected product */}
              {activeProduct && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center text-[10px]">
                  <div>
                    <span className="text-slate-400 font-medium">Blok Penyimpanan:</span>
                    <p className="text-slate-850 font-bold">{activeProduct.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-medium">Buku Nilai Dasar:</span>
                    <p className="text-slate-850 font-bold">{formatRupiah(activeProduct.price)}</p>
                  </div>
                </div>
              )}

              {/* Transaction Type Radio Buttons */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  ARUS SINYAL BARANG *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer font-bold transition-all ${
                    txType === 'IN' 
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="txType"
                      checked={txType === 'IN'}
                      onChange={() => setTxType('IN')}
                      className="accent-emerald-600 cursor-pointer"
                    />
                    <ArrowUpRight size={13} className="text-emerald-600" /> MASUK (IN)
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer font-bold transition-all ${
                    txType === 'OUT' 
                      ? 'border-rose-500 bg-rose-50/50 text-rose-900' 
                      : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                  }`}>
                    <input
                      type="radio"
                      name="txType"
                      checked={txType === 'OUT'}
                      onChange={() => setTxType('OUT')}
                      className="accent-rose-600 cursor-pointer"
                    />
                    <ArrowDownRight size={13} className="text-rose-600" /> KELUAR (OUT)
                  </label>
                </div>
              </div>

              {/* Quantity and Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    VOLUME UNIT MUTASI *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full border border-slate-250 text-xs rounded p-1.5 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-black text-rose-700"
                    />
                    {activeProduct && (
                      <span className="text-[10px] text-slate-500 font-extrabold shrink-0 bg-slate-100 border border-slate-200 px-1.5 py-1 rounded">
                        {activeProduct.unit}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    TANGGAL AUDIT MUKIM *
                  </label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full border border-slate-250 text-xs rounded p-1.5 focus:outline-hidden focus:border-indigo-500 cursor-pointer font-bold"
                  />
                </div>
              </div>

              {/* Interactive warning and help message block */}
              {validationError ? (
                <div className="p-2 border border-rose-200 bg-rose-50 rounded flex gap-1.5 text-rose-800 text-[10px] font-bold">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{validationError}</span>
                </div>
              ) : activeProduct && txType === 'OUT' && (
                <div className="text-[10px] font-bold text-slate-500">
                  Prediksi Sisa Stok Akhir:{' '}
                  <span className="font-extrabold text-indigo-700">
                    {activeProduct.stock - quantity} {activeProduct.unit}
                  </span>
                </div>
              )}

              {/* Operator and note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    PETUGAS OPERATOR *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Hartono"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    className="w-full border border-slate-255 text-xs rounded p-1.5 focus:outline-hidden focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    NILAI DOKUMEN / NOTA
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pengadaan PT Sentosa"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-slate-255 text-xs rounded p-1.5 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={validationError !== ''}
                  className={`px-3 py-1.5 text-white font-bold rounded shadow-xs transition-colors flex items-center gap-1 cursor-pointer ${
                    validationError 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Sparkles size={11} /> Bukukan Transaksi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
