import React from 'react';
import { Product, Transaction } from '../types';
import { Package, AlertTriangle, Layers, DollarSign, ArrowDownRight, ArrowUpRight, Plus, Eye, ArrowLeftRight } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onQuickRestock: (sku: string) => void;
}

export function Dashboard({ products, transactions, onNavigate, onQuickRestock }: DashboardProps) {
  // Calculations
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  
  const totalAssetValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const activeCategories = Array.from(new Set(products.map(p => p.category)));

  // Calculate stock value per category for custom visual bar chart
  const categoryStats = activeCategories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const count = catProducts.length;
    const units = catProducts.reduce((sum, p) => sum + p.stock, 0);
    const value = catProducts.reduce((sum, p) => sum + (p.stock * p.price), 0);
    return { name: cat, count, units, value };
  }).sort((a, b) => b.value - a.value);

  // Helper formatting for rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Welcome banner */}
      <div className="bg-[#0F172A] border border-slate-800 text-slate-100 rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none md:block hidden">
          <Package size={160} className="transform translate-y-4 translate-x-4" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
              WH-Principal Live
            </span>
            <span className="text-[10px] text-slate-400">&bull;</span>
            <span className="text-[10px] text-slate-400">Database Berfungsi (100% Berjalan)</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold font-sans tracking-tight mt-2 text-white">
            Selamat datang di Konsol Manajemen Gudang
          </h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-xl">
            Sistem pengawasan stok multi-rak dirancang untuk efisiensi eksekusi optimal. Catat log keluar-masuk, audit valuasi modal, dan ekspor berkas audit bulanan dengan instan.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button 
              onClick={() => onNavigate('stok')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Package size={12} /> Kelola Katalog Stok
            </button>
            <button 
              onClick={() => onNavigate('laporan')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Eye size={12} /> Susun Laporan Bulanan
            </button>
          </div>
        </div>
      </div>

      {/* Grid Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Aset */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NILAI INVESTASI GUDANG</p>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">{formatRupiah(totalAssetValue)}</h3>
            <p className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-1 py-0.5 rounded inline-block">
              {activeCategories.length} kelompok kategori barang aktif
            </p>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Total Stok Unit */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL VOLUME STOK</p>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">
              {totalStockUnits.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">unit</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Dari {products.length} macam jenis barang rak
            </p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
            <Package size={18} />
          </div>
        </div>

        {/* Total Kategori */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">KLASIFIKASI SEKTOR</p>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">
              {activeCategories.length} <span className="text-xs font-semibold text-slate-400">Sektor</span>
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Rata: {products.length > 0 ? (totalStockUnits / products.length).toFixed(1) : 0} unit per item
            </p>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded">
            <Layers size={18} />
          </div>
        </div>

        {/* Kondisi Kritis / Low Stock */}
        <div className={`border rounded-lg p-3.5 shadow-xs flex items-center justify-between transition-all ${
          lowStockProducts.length > 0 
            ? 'bg-amber-50/80 border-amber-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">STOK KRITIS & HABIS</p>
            <h3 className={`text-lg font-black tracking-tight ${
              lowStockProducts.length > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}>
              {lowStockProducts.length} <span className="text-xs font-semibold text-slate-400">Barang</span>
            </h3>
            <p className={`text-[10px] font-bold ${
              outOfStockCount > 0 ? 'text-rose-600 bg-rose-50 px-1 py-0.2 rounded inline-block' : 'text-amber-700 bg-amber-100/50 px-1 py-0.2 rounded inline-block'
            }`}>
              {outOfStockCount} produk kosong (nol)
            </p>
          </div>
          <div className={`p-2 rounded ${
            lowStockProducts.length > 0 ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-500'
          }`}>
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* Main Grid: Visuals and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Side: Category Distribution SVG Bar Chart & Navigation */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Layers size={14} className="text-slate-500" />
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-tight">
                Penyebaran Nilai Investasi per Kategori
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Persentase dan total valuasi nilai buku yang tersimpan di loket gudang
            </p>
          </div>

          <div className="space-y-3.5">
            {categoryStats.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-6">Belum ada barang terdaftar di sistem.</p>
            ) : (
              categoryStats.map((item, index) => {
                const totalVal = categoryStats.reduce((sum, x) => sum + x.value, 0);
                const percent = totalVal > 0 ? (item.value / totalVal) * 100 : 0;
                
                const barColors = [
                  'bg-indigo-600',
                  'bg-emerald-600',
                  'bg-purple-600',
                  'bg-amber-600',
                  'bg-sky-600',
                  'bg-rose-600'
                ];
                const colorClass = barColors[index % barColors.length];

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <div className="space-x-1.5 text-slate-500">
                        <span>{item.units} unit</span>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-950">{formatRupiah(item.value)}</span>
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded text-[9px]">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar with compact high density style */}
                    <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                      <div 
                        className={`h-full rounded ${colorClass} transition-all duration-300`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Low Stock Warnings */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" />
                <h2 className="text-xs font-black text-slate-950 uppercase tracking-tight">
                  Peringatan Stok Kritis ({lowStockProducts.length})
                </h2>
              </div>
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-black rounded">
                RESTOCK REKOMENDASI
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
                    <Package size={16} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">Semua Stok Aman!</p>
                  <p className="text-[10px] text-slate-400">Tidak ada produk yang berada di bawah pengaman minimum.</p>
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div 
                    key={p.id} 
                    className={`flex items-center justify-between p-2 rounded border text-xs gap-2 ${
                      p.stock === 0 
                        ? 'bg-rose-50/60 border-rose-100' 
                        : 'bg-amber-50/60 border-amber-100'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-700 font-bold">
                          {p.sku}
                        </span>
                        {p.stock === 0 && (
                          <span className="bg-rose-100 text-rose-800 font-black px-1 py-0.2 text-[8px] rounded">
                            KOSONG
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 truncate">Sektor: {p.category}</span>
                      </div>
                      <p className="font-bold text-slate-950 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500">
                        Sisa: <strong className={p.stock === 0 ? 'text-rose-600' : 'text-amber-700'}>{p.stock}</strong> / Batas Min: {p.minStock} {p.unit} &bull; <span className="font-bold text-slate-600">{p.location}</span>
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onQuickRestock(p.sku)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1 font-extrabold text-[10px] cursor-pointer shrink-0 shadow-2xs"
                      title="Tambah Stok Masuk"
                    >
                      <Plus size={10} className="text-emerald-600" /> Restock
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <button 
              onClick={() => onNavigate('mutasi')}
              className="w-full text-center py-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 rounded transition-all cursor-pointer block"
            >
              Lihat Seluruh Riwayat Log Mutasi Terdaftar &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Transactions Grid */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <ArrowLeftRight size={14} className="text-slate-500" />
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-tight">
              Aktivitas Log Mutasi Terkini
            </h2>
          </div>
          <button 
            onClick={() => onNavigate('mutasi')}
            className="text-[11px] font-extrabold text-[#2563EB] hover:underline cursor-pointer"
          >
            Buka Mutasi Lengkap &rarr;
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                <th className="p-2 pl-3">Waktu Log</th>
                <th className="p-2">Tipe Mutasi</th>
                <th className="p-2">Kode / Nama Komoditas</th>
                <th className="p-2 text-right">Jumlah Volume</th>
                <th className="p-2">Keterangan Audit</th>
                <th className="p-2 pr-3">Petugas Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                    Belum ada transaksi keluar-masuk yang dicetak atau tercatat.
                  </td>
                </tr>
              ) : (
                recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 text-slate-700 transition-colors">
                    <td className="p-2 pl-3 text-slate-500 font-medium">
                      {new Date(tx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-2">
                      {tx.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-100 text-[9px]">
                          <ArrowUpRight size={10} /> MASUK (IN)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 font-bold px-1.5 py-0.5 rounded border border-rose-100 text-[9px]">
                          <ArrowDownRight size={10} /> KELUAR (OUT)
                        </span>
                      )}
                    </td>
                    <td className="p-2 max-w-[200px] truncate">
                      <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-700 font-bold mr-1.5">
                        {tx.productSku}
                      </span>
                      <strong className="text-slate-900 font-semibold">{tx.productName}</strong>
                    </td>
                    <td className={`p-2 text-right font-bold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                    </td>
                    <td className="p-2 text-slate-500 max-w-[200px] truncate" title={tx.note}>
                      {tx.note}
                    </td>
                    <td className="p-2 text-slate-600 font-medium pr-3">{tx.operator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
