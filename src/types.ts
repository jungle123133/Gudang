export type Category = 'Elektronik' | 'Pakaian' | 'Makanan & Minuman' | 'Peralatan' | 'Bahan Baku' | 'Lainnya';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  stock: number;
  unit: string; // e.g. Pcs, Box, Kg, Liter
  minStock: number; // Minimum stock before low stock warning
  price: number; // Purchase price or valuation price per unit (Rupiah)
  sellingPrice: number; // Selling price (Rupiah)
  location: string; // Storage rak (e.g., Rak A-12, Cold Room 3)
  description?: string;
}

export interface Transaction {
  id: string;
  date: string; // Format: YYYY-MM-DD (e.g., 2026-06-05)
  type: 'IN' | 'OUT'; // IN: Barang Masuk, OUT: Barang Keluar
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  price: number; // Price per unit during transaction
  note: string; // e.g., "Pembelian dari PT Jaya", "Penjualan Toko Baru"
  operator: string; // Employee name
}

export interface MonthlyReportData {
  month: string; // YYYY-MM prefix
  records: {
    productName: string;
    sku: string;
    initialStock: number;
    incoming: number;
    outgoing: number;
    finalStock: number;
    difference: number;
    valuation: number;
  }[];
  totalIncomingValue: number;
  totalOutgoingValue: number;
  totalAsetValuation: number;
}
