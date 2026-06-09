import React, { useState, useMemo } from 'react';
import { Product, Transaction, MonthlyReportData } from '../types';
import { Calendar, FileBarChart, Download, Printer, TrendingUp, TrendingDown, Landmark, Package, Layers, Info } from 'lucide-react';

interface MonthlyReportProps {
  products: Product[];
  transactions: Transaction[];
}

export function MonthlyReport({ products, transactions }: MonthlyReportProps) {
  // Current month preset based on 2026-06 system time
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('06'); // June

  const monthsList = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  const yearsList = ['2025', '2026', '2027'];

  // Dynamic Ledger Algorithm
  const reportData = useMemo(() => {
    const targetMonthPrefix = `${selectedYear}-${selectedMonth}`; // e.g., "2026-06"
    
    // Parse target date limits
    const startOfTargetMonth = new Date(`${targetMonthPrefix}-01T00:00:00`);
    const endOfTargetMonth = new Date(Number(selectedYear), Number(selectedMonth), 0, 23, 59, 59); // Last day of month

    const records = products.map(p => {
      // 1. Calculate transactions succeeding the target month
      const transactionsSucceedingTarget = transactions.filter(tx => {
        if (tx.productId !== p.id) return false;
        const txDate = new Date(tx.date);
        return txDate > endOfTargetMonth;
      });

      // Sum successors to rewind current stock to end of target month
      const inSucceeding = transactionsSucceedingTarget
        .filter(t => t.type === 'IN')
        .reduce((sum, t) => sum + t.quantity, 0);
      const outSucceeding = transactionsSucceedingTarget
        .filter(t => t.type === 'OUT')
        .reduce((sum, t) => sum + t.quantity, 0);

      const targetMonthEndingStock = p.stock - inSucceeding + outSucceeding;

      // 2. Calculate transactions inside the target month
      const transactionsInTarget = transactions.filter(tx => {
        if (tx.productId !== p.id) return false;
        return tx.date.startsWith(targetMonthPrefix);
      });

      const incomingInTarget = transactionsInTarget
        .filter(t => t.type === 'IN')
        .reduce((sum, t) => sum + t.quantity, 0);
        
      const outgoingInTarget = transactionsInTarget
        .filter(t => t.type === 'OUT')
        .reduce((sum, t) => sum + t.quantity, 0);

      // 3. Reconstruct initial stock at start of target month
      const targetMonthInitialStock = targetMonthEndingStock - incomingInTarget + outgoingInTarget;

      return {
        productName: p.name,
        sku: p.sku,
        unit: p.unit,
        price: p.price,
        initialStock: targetMonthInitialStock,
        incoming: incomingInTarget,
        outgoing: outgoingInTarget,
        finalStock: targetMonthEndingStock,
        difference: incomingInTarget - outgoingInTarget,
        valuation: targetMonthEndingStock * p.price
      };
    });

    // Totals calculations
    const totalIncomingValue = records.reduce((sum, r) => sum + (r.incoming * r.price), 0);
    const totalOutgoingValue = records.reduce((sum, r) => sum + (r.outgoing * r.price), 0);
    const totalAsetValuation = records.reduce((sum, r) => sum + r.valuation, 0);

    return {
      month: targetMonthPrefix,
      records,
      totalIncomingValue,
      totalOutgoingValue,
      totalAsetValuation
    };

  }, [products, transactions, selectedYear, selectedMonth]);

  // Top moving products (most outgoing)
  const topOutgoingItem = useMemo(() => {
    const list = [...reportData.records].sort((a, b) => b.outgoing - a.outgoing);
    return list[0]?.outgoing > 0 ? list[0] : null;
  }, [reportData]);

  // Top restocked item (most incoming)
  const topIncomingItem = useMemo(() => {
    const list = [...reportData.records].sort((a, b) => b.incoming - a.incoming);
    return list[0]?.incoming > 0 ? list[0] : null;
  }, [reportData]);

  // Formatting Helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const activeMonthLabel = monthsList.find(m => m.value === selectedMonth)?.label || 'Bulan';

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    const headers = ['Kode SKU', 'Nama Produk', 'Stok Awal', 'Barang Masuk', 'Barang Keluar', 'Stok Akhir Selisih', 'Nilai Aset Akhir (IDR)'];
    const rows = reportData.records.map(r => [
      r.sku,
      r.productName,
      r.initialStock,
      r.incoming,
      r.outgoing,
      r.finalStock,
      r.valuation
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Gudang_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON Data
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Laporan_Gudang_${selectedYear}_${selectedMonth}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe Window Print Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3.5">
      
      {/* Selector and Title */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-600 mb-0.5">
            <FileBarChart size={14} />
            <span className="font-extrabold text-[10px] uppercase tracking-wider">Laporan Bulanan Terotomatisasi</span>
          </div>
          <h1 className="text-base font-black text-slate-950 uppercase tracking-tight">
            Penyusunan Laporan Mutasi: {activeMonthLabel} {selectedYear}
          </h1>
          <p className="text-[11px] text-slate-500">
            Kalkulasi mutasi persediaan dikombinasikan secara runtut mundur berdasarkan histori transaksi mutasi.
          </p>
        </div>

        {/* Picker Dropdowns */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded">
            <Calendar size={12} className="text-indigo-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 focus:outline-hidden font-bold cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1.5 rounded">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 focus:outline-hidden font-bold cursor-pointer"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-1">
            <button
              onClick={handleExportCSV}
              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded transition-colors cursor-pointer"
              title="Ekspor CSV"
            >
              <Download size={12} />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded transition-colors cursor-pointer"
              title="Cetak Laporan"
            >
              <Printer size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Incoming Asset Value */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL MASUK BARANG</p>
            <h3 className="text-base font-black font-mono text-emerald-600">
              {formatRupiah(reportData.totalIncomingValue)}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Dari pengadaan & retur internal.
            </p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
            <TrendingUp size={16} />
          </div>
        </div>

        {/* Total Outgoing Asset Value */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL BARANG KELUAR</p>
            <h3 className="text-base font-black font-mono text-rose-600">
              {formatRupiah(reportData.totalOutgoingValue)}
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Dari pemakaian & distribusi rak.
            </p>
          </div>
          <div className="p-2 bg-rose-50 text-rose-600 rounded">
            <TrendingDown size={16} />
          </div>
        </div>

        {/* Ending Inventory Asset Value */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">BUKU VALUASI PERSADAAN</p>
            <h3 className="text-base font-black font-mono text-slate-900">
              {formatRupiah(reportData.totalAsetValuation)}
            </h3>
            <p className="text-[10px] text-indigo-700 font-semibold bg-indigo-50 px-1 py-0.2 rounded inline-block">
              Valuasi aset sisa per {activeMonthLabel}.
            </p>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Landmark size={16} />
          </div>
        </div>
      </div>

      {/* Two column analytical boxes: Highlights & Mutasi */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* Highlight Insights Left Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-3.5 shadow-sm space-y-3">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rotasi Fast Moving</h3>
            <div className="space-y-3">
              
              {/* Top Selling */}
              <div className="space-y-1 pb-3 border-b border-slate-800">
                <div className="flex gap-1 text-slate-400 text-[9px] font-bold uppercase">
                  <span>MUTASI OUT TERTINGGI</span>
                </div>
                {topOutgoingItem ? (
                  <div>
                    <h4 className="text-xs font-extrabold text-white mt-1">{topOutgoingItem.productName}</h4>
                    <p className="font-mono text-xs text-rose-400 mt-0.5">
                      -{topOutgoingItem.outgoing} {topOutgoingItem.unit}{' '}
                      <span className="text-[10px] text-slate-500">({formatRupiah(topOutgoingItem.outgoing * topOutgoingItem.price)})</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Tidak ada keluar di bulan ini.</p>
                )}
              </div>

              {/* Top Restocked */}
              <div className="space-y-1">
                <div className="flex gap-1 text-slate-400 text-[9px] font-bold uppercase">
                  <span>MUTASI IN TERTINGGI</span>
                </div>
                {topIncomingItem ? (
                  <div>
                    <h4 className="text-xs font-extrabold text-white mt-1">{topIncomingItem.productName}</h4>
                    <p className="font-mono text-xs text-emerald-400 mt-0.5">
                      +{topIncomingItem.incoming} {topIncomingItem.unit}{' '}
                      <span className="text-[10px] text-slate-500">({formatRupiah(topIncomingItem.incoming * topIncomingItem.price)})</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Tidak ada masuk di bulan ini.</p>
                )}
              </div>

            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200 text-amber-900 rounded-lg p-3.5 space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1 text-amber-9Lord font-sans">
              <Info size={11} className="text-amber-700" /> Aturan Hitung Audit
            </h4>
            <p className="text-[11px] text-amber-800 leading-normal font-medium">
              Sistem menghitung status mundur. Nilai awal dihitung dari sisa stok real-time dikurangi seluruh logs sesudah periode bulan ini.
            </p>
            <div className="pt-2 text-[9px] font-bold text-amber-700 border-t border-amber-200 uppercase tracking-wider">
              DATA DILINDUNGI &bull; CO-SIGNED
            </div>
          </div>
        </div>

        {/* Ledger Table Right Column */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-1 text-slate-800">
                <Layers size={13} className="text-slate-500" />
                <h3 className="text-xs font-black uppercase tracking-tight text-slate-950">
                  Buku Rincian Ledger Mutasi Sektor
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluasi komparatif unit produk pada {activeMonthLabel} {selectedYear}
              </p>
            </div>
            <button 
              onClick={handleExportJSON}
              className="text-[10px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded flex items-center gap-1 font-bold text-slate-600 transition-colors cursor-pointer"
            >
              <Download size={11} /> Format JSON
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-250 text-slate-550 font-black uppercase text-[10px] tracking-wider">
                  <th className="p-2 pl-2">Katalog Nama/SKU</th>
                  <th className="p-2 text-right">Stok Awal</th>
                  <th className="p-2 text-right text-emerald-600">Masuk (+)</th>
                  <th className="p-2 text-right text-rose-600">Keluar (-)</th>
                  <th className="p-2 text-right font-bold text-slate-850">Stok Akhir</th>
                  <th className="p-2 text-right pr-2">Valuasi Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                {reportData.records.map(r => (
                  <tr key={r.sku} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2 pl-2">
                      <div className="font-extrabold text-slate-950 max-w-[140px] truncate" title={r.productName}>
                        {r.productName}
                      </div>
                      <div className="font-mono text-[9px] text-slate-400 font-bold">{r.sku}</div>
                    </td>
                    <td className="p-2 text-right font-semibold text-slate-600">
                      {r.initialStock} <span className="text-[9px] text-slate-400">{r.unit}</span>
                    </td>
                    <td className="p-2 text-right font-black text-emerald-600">
                      {r.incoming > 0 ? `+${r.incoming}` : '0'}
                    </td>
                    <td className="p-2 text-right font-black text-rose-600">
                      {r.outgoing > 0 ? `-${r.outgoing}` : '0'}
                    </td>
                    <td className="p-2 text-right font-black text-slate-900">
                      {r.finalStock} <span className="text-[10px] text-slate-450 font-semibold">{r.unit}</span>
                    </td>
                    <td className="p-2 text-right text-slate-950 font-bold font-mono pr-2">
                      {formatRupiah(r.valuation)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Styled Printable Frame Hidden in main window, visible in page media print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Hidden container exclusively compiled for high resolution Printing view with real elements */}
      <div id="print-area" className="hidden">
        <div style={{ fontFamily: 'sans-serif' }} className="space-y-6">
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>LAPORAN MUTASI & PERSEDIAAN GUDANG</h1>
              <p style={{ fontSize: '14px', color: '#4B5563' }}>Periode Bulan: {activeMonthLabel} {selectedYear}</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>GUDANG DISTRIBUSI PUSAT</h2>
              <p style={{ fontSize: '12px', color: '#4B5563' }}>Sistem Manajemen Gudang Digital</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }} className="mt-4">
            <div style={{ border: '1px solid #E5E7EB', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Total Belanja Barang Masuk</p>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#059669' }}>{formatRupiah(reportData.totalIncomingValue)}</h3>
            </div>
            <div style={{ border: '1px solid #E5E7EB', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Total Estimasi Barang Keluar</p>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#DC2626' }}>{formatRupiah(reportData.totalOutgoingValue)}</h3>
            </div>
            <div style={{ border: '1px solid #E5E7EB', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Valuasi Buku Akhir Persediaan</p>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1E1B4B' }}>{formatRupiah(reportData.totalAsetValuation)}</h3>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F3F4F6', borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Kode SKU</th>
                <th style={{ padding: '8px' }}>Nama Produk</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Stok Awal</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Masuk (+)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Keluar (-)</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Stok Akhir</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Valuasi (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.records.map(r => (
                <tr key={r.sku} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace' }}>{r.sku}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{r.productName}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{r.initialStock} {r.unit}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>+{r.incoming}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: '#DC2626', fontWeight: 'bold' }}>-{r.outgoing}</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{r.finalStock} {r.unit}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>{formatRupiah(r.valuation)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px' }}>Petugas Penyusun,</p>
              <div style={{ height: '60px' }}></div>
              <p style={{ fontSize: '11px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px' }}>Budi Hartono</p>
              <p style={{ fontSize: '10px', color: '#6B7280' }}>Kepala Gudang Distribusi</p>
            </div>
            <div style={{ width: '200px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px' }}>Mengetahui, Direktur Operasional,</p>
              <div style={{ height: '60px' }}></div>
              <p style={{ fontSize: '11px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px' }}>Rahmat Wijaya, M.B.A.</p>
              <p style={{ fontSize: '10px', color: '#6B7280' }}>Manajer Umum & Logistik</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
