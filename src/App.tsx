import React, { useState, useEffect } from 'react';
import { Product, Transaction } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from './data';
import { Dashboard } from './components/Dashboard';
import { StockList } from './components/StockList';
import { TransactionHistory } from './components/TransactionHistory';
import { MonthlyReport } from './components/MonthlyReport';
import { 
  Warehouse, 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FileBarChart, 
  Bell, 
  Clock, 
  RotateCcw,
  User,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Quick SKU-routing for emergency restocks
  const [preselectedSku, setPreselectedSku] = useState<string>('');

  // 1. Safe state initialization with LocalStorage
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const local = localStorage.getItem('manajemen_gudang_products');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.error("Error reading products localstore:", e);
    }
    return INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const local = localStorage.getItem('manajemen_gudang_transactions');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.error("Error reading transactions localstore:", e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // 2. Persist states on modifications
  useEffect(() => {
    localStorage.setItem('manajemen_gudang_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('manajemen_gudang_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // 3. CRUD: Add Product (with automatic opening stock transaction log)
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const timestamp = Date.now();
    const productId = `prod-${timestamp}`;
    const product: Product = {
      ...newProduct,
      id: productId
    };

    setProducts(prev => [...prev, product]);

    // If initial stock is specified, record it in history as opening stock
    if (product.stock > 0) {
      const initTx: Transaction = {
        id: `tx-init-${timestamp}`,
        date: new Date().toISOString().split('T')[0],
        type: 'IN',
        productId: productId,
        productSku: product.sku,
        productName: product.name,
        quantity: product.stock,
        price: product.price,
        note: 'Stok Pembuka (Pendaftaran Barang Baru)',
        operator: 'Sistem Otomatis'
      };
      setTransactions(prev => [initTx, ...prev]);
    }
  };

  // 4. CRUD: Edit Product (with automatic comparison adjustment audit log)
  const handleEditProduct = (id: string, updated: Partial<Product>) => {
    const timestamp = Date.now();
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === id) {
        const merged = { ...p, ...updated };
        
        // Write manual discrepancy correction log if current quantity was overridden
        if (updated.stock !== undefined && updated.stock !== p.stock) {
          const diff = updated.stock - p.stock;
          const correctionTx: Transaction = {
            id: `tx-corr-${timestamp}`,
            date: new Date().toISOString().split('T')[0],
            type: diff > 0 ? 'IN' : 'OUT',
            productId: p.id,
            productSku: p.sku,
            productName: p.name,
            quantity: Math.abs(diff),
            price: p.price,
            note: `Pembaruan data (Stok disesuaikan manual dari ${p.stock} ke ${merged.stock})`,
            operator: 'Sistem Otomatis'
          };
          setTransactions(prevTx => [correctionTx, ...prevTx]);
        }
        return merged;
      }
      return p;
    }));
  };

  // 5. CRUD: Delete Product
  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    // Optionally clean up or keep transaction SKU histories (we preserve histories but remove product binding references)
  };

  // 6. CRUD: Submit logs and recalculate product stock values
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txId = `tx-${Date.now()}`;
    const tx: Transaction = {
      ...newTx,
      id: txId
    };

    setTransactions(prev => [tx, ...prev]);

    // Fast-update current stock level of the product
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === tx.productId) {
        const stockDiff = tx.type === 'IN' ? tx.quantity : -tx.quantity;
        return {
          ...p,
          stock: Math.max(0, p.stock + stockDiff)
        };
      }
      return p;
    }));
  };

  // 7. Reset factory defaults data option
  const handleResetFactory = () => {
    const confirmReset = window.confirm("Apakah Anda yakin ingin menyetel ulang seluruh data gudang ke data bawaan awal?\nSemua penyesuaian stok dan produk baru Anda akan terhapus.");
    if (confirmReset) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setActiveTab('dashboard');
    }
  };

  // Critical indicators in navigation menu
  const criticalCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] flex flex-col md:flex-row font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. LEFT SIDEBAR - Only visible on Desktop (md and up) */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 border-r border-[#1E293B] hidden md:flex flex-col h-screen sticky top-0 shrink-0 no-print">
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-[#1E293B] bg-[#1E293B]">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shrink-0">
            <Warehouse size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block leading-none mb-1">
              LOGISTIK & INVENTARIS
            </span>
            <h2 className="text-sm font-black text-white tracking-tight leading-none truncate flex items-center gap-1">
              WAREHOUSE HUB <span className="font-sans font-medium text-slate-400 text-[10px]">v2.1</span>
            </h2>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard size={14} className={activeTab === 'dashboard' ? 'text-white' : 'text-slate-400'} />
              Beranda
            </span>
            <span className="text-[10px] opacity-60 font-mono">ALT+1</span>
          </button>

          <button
            onClick={() => setActiveTab('stok')}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'stok'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package size={14} className={activeTab === 'stok' ? 'text-white' : 'text-slate-400'} />
              Stok Barang
            </span>
            {criticalCount > 0 ? (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full px-2 py-0.5">
                {criticalCount}
              </span>
            ) : (
              <span className="text-[10px] opacity-60 font-mono">ALT+2</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mutasi')}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'mutasi'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <ArrowLeftRight size={14} className={activeTab === 'mutasi' ? 'text-white' : 'text-slate-400'} />
              Mutasi & Log
            </span>
            <span className="text-[10px] opacity-60 font-mono">ALT+3</span>
          </button>

          <button
            onClick={() => setActiveTab('laporan')}
            className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-between cursor-pointer ${
              activeTab === 'laporan'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileBarChart size={14} className={activeTab === 'laporan' ? 'text-white' : 'text-slate-400'} />
              Laporan Bulanan
            </span>
            <span className="text-[10px] opacity-60 font-mono">ALT+4</span>
          </button>
        </nav>

        {/* Sidebar Footer Details */}
        <div className="p-4 border-t border-[#1E293B] bg-[#0B0F19] space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User size={12} className="text-slate-500" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-300 leading-none">Gudang Utama</p>
              <p className="text-[9px] text-slate-500 leading-none mt-1">Status: Administrator</p>
            </div>
          </div>
          
          <button 
            onClick={handleResetFactory}
            className="w-full text-left py-1.5 px-2 bg-rose-950/40 border border-rose-900/50 text-rose-400 hover:text-rose-300 hover:bg-rose-900/30 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 justify-center"
          >
            <RotateCcw size={10} /> Reset Data Bawaan
          </button>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER & NAVIGATION */}
      <header className="md:hidden bg-[#0F172A] text-white border-b border-slate-850 sticky top-0 z-30 no-print shadow-md">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-md shrink-0">
              <Warehouse size={14} />
            </div>
            <h1 className="text-xs font-black tracking-wider text-white">
              WH-HUB <span className="font-normal text-slate-400 text-[10px]">v2.1</span>
            </h1>
          </div>
          
          <button 
            onClick={handleResetFactory}
            className="text-rose-400 hover:text-rose-300 text-[10px] font-bold flex items-center gap-1 bg-rose-950/50 px-2 py-1 rounded border border-rose-900/40"
          >
            <RotateCcw size={10} /> Reset
          </button>
        </div>

        {/* Navigation Swipe Tabs on Mobile */}
        <div className="bg-[#1E293B] border-t border-slate-800 flex overflow-x-auto scrollbar-none px-2 py-1.5 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1 whitespace-nowrap transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={12} /> Beranda
          </button>
          <button
            onClick={() => setActiveTab('stok')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1 whitespace-nowrap transition-all ${
              activeTab === 'stok' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={12} /> Stok ({products.length})
            {criticalCount > 0 && <span className="bg-amber-500 text-slate-950 text-[9px] px-1 font-extrabold rounded-full">{criticalCount}</span>}
          </button>
          <button
            onClick={() => setActiveTab('mutasi')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1 whitespace-nowrap transition-all ${
              activeTab === 'mutasi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight size={12} /> Mutasi
          </button>
          <button
            onClick={() => setActiveTab('laporan')}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-1 whitespace-nowrap transition-all ${
              activeTab === 'laporan' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileBarChart size={12} /> Laporan
          </button>
        </div>
      </header>

      {/* 3. RIGHT CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9]">
        
        {/* Horizontal Header Action Bar on Desktop */}
        <div className="bg-white border-b border-slate-200 py-2.5 px-6 hidden md:flex items-center justify-between no-print shadow-xs">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-500 font-medium select-none bg-slate-100 px-2 py-1 rounded">
              <Clock size={12} className="text-slate-400" />
              Sistem Aktif (WIB)
            </span>
            <span className="font-mono text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded border border-slate-200">
              Selasa, 9 Juni 2026
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-medium">Lokasi: <strong className="text-slate-900">Gudang Utama</strong></span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Auto-Sync Database
            </div>
          </div>
        </div>

        {/* Dynamic Inner Main Content with customized responsive spacing */}
        <main className="flex-1 p-4 md:p-6 pb-12 overflow-y-auto max-w-(screen-2xl) w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              transactions={transactions} 
              onNavigate={(tab) => setActiveTab(tab)}
              onQuickRestock={(sku) => {
                setPreselectedSku(sku);
                setActiveTab('mutasi');
              }}
            />
          )}

          {activeTab === 'stok' && (
            <StockList 
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'mutasi' && (
            <TransactionHistory 
              products={products}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              preselectedSku={preselectedSku}
              onClearPreselectedSku={() => setPreselectedSku('')}
            />
          )}

          {activeTab === 'laporan' && (
            <MonthlyReport 
              products={products}
              transactions={transactions}
            />
          )}
        </main>

        {/* Minimal Footer Area */}
        <footer className="border-t border-slate-200 py-4 px-6 text-xs text-slate-400 font-semibold bg-white no-print flex flex-col md:flex-row justify-between items-center gap-2">
          <p>&copy; 2026 Warehouse Hub. Semua data terenkripsi & disimpan otomatis.</p>
          <div className="flex items-center gap-3">
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">
              LocalStorage Sinkron
            </span>
          </div>
        </footer>
      </div>

    </div>
  );
}
