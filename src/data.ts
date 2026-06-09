import { Product, Transaction, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  'Bahan Baku',
  'Makanan & Minuman',
  'Peralatan',
  'Elektronik',
  'Pakaian',
  'Lainnya'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'RAW-KOP-RBS',
    name: 'Biji Kopi Robusta Premium (1kg)',
    category: 'Bahan Baku',
    stock: 45,
    unit: 'Kg',
    minStock: 20,
    price: 85000,
    sellingPrice: 110000,
    location: 'Rak A-01 (Suhu Kamar)',
    description: 'Biji kopi robusta asal Temanggung, grade 1, kelembapan 12%'
  },
  {
    id: 'prod-2',
    sku: 'ENV-CUP-SLR',
    name: 'Cup Sealer Ring Plastik 12 & 16oz',
    category: 'Peralatan',
    stock: 12,
    unit: 'Roll',
    minStock: 15, // Trigger low stock
    price: 120000,
    sellingPrice: 150000,
    location: 'Rak B-04',
    description: 'Plastik lid cup sealing kualitas tinggi anti bocor, 1200 cup/roll'
  },
  {
    id: 'prod-3',
    sku: 'FNB-MIL-UHT',
    name: 'Susu UHT Full Cream Greenfields 1L',
    category: 'Makanan & Minuman',
    stock: 120,
    unit: 'Karton',
    minStock: 30,
    price: 185000,
    sellingPrice: 210000,
    location: 'Gudang Dingin C-02',
    description: 'Susu cair segar UHT full cream isi 12 pcs x 1 Liter per karton'
  },
  {
    id: 'prod-4',
    sku: 'FNB-SRP-VNL',
    name: 'Sirup Vanilla Toffin Premium 750ml',
    category: 'Makanan & Minuman',
    stock: 28,
    unit: 'Botol',
    minStock: 10,
    price: 135000,
    sellingPrice: 165000,
    location: 'Rak A-05',
    description: 'Sirup perisa gourmet vanilla ideal untuk sirup es kopi susu'
  },
  {
    id: 'prod-5',
    sku: 'APP-TEE-BLK',
    name: 'Kaos Polos Cotton Combed 30s Hitam L',
    category: 'Pakaian',
    stock: 250,
    unit: 'Pcs',
    minStock: 50,
    price: 32000,
    sellingPrice: 48000,
    location: 'Lantai 2 Rak F-01',
    description: 'Bahan katun reaktif combed, gramasi 140-150 gsm'
  },
  {
    id: 'prod-6',
    sku: 'ELC-SPK-JBL',
    name: 'Speaker Bluetooth JBL Go 3 Black',
    category: 'Elektronik',
    stock: 0, // Out of stock to demonstrate "Habis" state
    unit: 'Unit',
    minStock: 5,
    price: 495000,
    sellingPrice: 599000,
    location: 'Rak Brankas E-02',
    description: 'Portable waterproof bluetooth speaker, original bergaransi'
  },
  {
    id: 'prod-7',
    sku: 'ELC-CAB-TYC',
    name: 'Kabel Charger Anker USB-C to USB-C 1.8m',
    category: 'Elektronik',
    stock: 75,
    unit: 'Pcs',
    minStock: 25,
    price: 75000,
    sellingPrice: 99000,
    location: 'Rak D-01',
    description: 'Kabel durabilitas tinggi, mendukung Power Delivery 60W'
  },
  {
    id: 'prod-8',
    sku: 'ENV-BLN-PHL',
    name: 'Blender Juicer Philips HR-2115 2L',
    category: 'Peralatan',
    stock: 8,
    unit: 'Unit',
    minStock: 5,
    price: 680000,
    sellingPrice: 799000,
    location: 'Rak B-02',
    description: 'Gelas plastik tebal, pisau gerigi tajam, 5 tombol kecepatan'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // MEI 2026 (Previous Month)
  {
    id: 'tx-101',
    date: '2026-05-02',
    type: 'IN',
    productId: 'prod-1',
    productSku: 'RAW-KOP-RBS',
    productName: 'Biji Kopi Robusta Premium (1kg)',
    quantity: 50,
    price: 85000,
    note: 'Restock supplier Kopi Temanggung',
    operator: 'Budi Hartono'
  },
  {
    id: 'tx-102',
    date: '2026-05-04',
    type: 'IN',
    productId: 'prod-3',
    productSku: 'FNB-MIL-UHT',
    productName: 'Susu UHT Full Cream Greenfields 1L',
    quantity: 100,
    price: 185000,
    note: 'Pengadaan bulanan Greenfields Corp',
    operator: 'Budi Hartono'
  },
  {
    id: 'tx-103',
    date: '2026-05-10',
    type: 'OUT',
    productId: 'prod-1',
    productSku: 'RAW-KOP-RBS',
    productName: 'Biji Kopi Robusta Premium (1kg)',
    quantity: 15,
    price: 85000,
    note: 'Distribusi bahan ke Coffee Shop Cabang 1',
    operator: 'Siti Rahma'
  },
  {
    id: 'tx-104',
    date: '2026-05-12',
    type: 'OUT',
    productId: 'prod-3',
    productSku: 'FNB-MIL-UHT',
    productName: 'Susu UHT Full Cream Greenfields 1L',
    quantity: 40,
    price: 185000,
    note: 'Distribusi bahan ke Coffee Shop Cabang 1 & 2',
    operator: 'Siti Rahma'
  },
  {
    id: 'tx-105',
    date: '2026-05-15',
    type: 'IN',
    productId: 'prod-5',
    productSku: 'APP-TEE-BLK',
    productName: 'Kaos Polos Cotton Combed 30s Hitam L',
    quantity: 300,
    price: 32000,
    note: 'Penerimaan kargo konveksi Bandung',
    operator: 'Budi Hartono'
  },
  {
    id: 'tx-106',
    date: '2026-05-18',
    type: 'OUT',
    productId: 'prod-5',
    productSku: 'APP-TEE-BLK',
    productName: 'Kaos Polos Cotton Combed 30s Hitam L',
    quantity: 50,
    price: 32000,
    note: 'Penjualan grosir Toko Sablon Utama',
    operator: 'Siti Rahma'
  },
  {
    id: 'tx-107',
    date: '2026-05-20',
    type: 'IN',
    productId: 'prod-6',
    productSku: 'ELC-SPK-JBL',
    productName: 'Speaker Bluetooth JBL Go 3 Black',
    quantity: 15,
    price: 495000,
    note: 'Impor barang masuk Bea Cukai',
    operator: 'Andi Wijaya'
  },
  {
    id: 'tx-108',
    date: '2026-05-25',
    type: 'OUT',
    productId: 'prod-6',
    productSku: 'ELC-SPK-JBL',
    productName: 'Speaker Bluetooth JBL Go 3 Black',
    quantity: 15,
    price: 495000,
    note: 'Habis didistribusikan ke dealer resmi',
    operator: 'Andi Wijaya'
  },

  // JUNI 2026 (Current Month, up to 2026-06-09)
  {
    id: 'tx-201',
    date: '2026-06-01',
    type: 'IN',
    productId: 'prod-3',
    productSku: 'FNB-MIL-UHT',
    productName: 'Susu UHT Full Cream Greenfields 1L',
    quantity: 80,
    price: 185000,
    note: 'Restock rutin awal bulan',
    operator: 'Budi Hartono'
  },
  {
    id: 'tx-202',
    date: '2026-06-03',
    type: 'OUT',
    productId: 'prod-3',
    productSku: 'FNB-MIL-UHT',
    productName: 'Susu UHT Full Cream Greenfields 1L',
    quantity: 20,
    price: 185000,
    note: 'Order outlet pusat',
    operator: 'Siti Rahma'
  },
  {
    id: 'tx-203',
    date: '2026-06-04',
    type: 'IN',
    productId: 'prod-4',
    productSku: 'FNB-SRP-VNL',
    productName: 'Sirup Vanilla Toffin Premium 750ml',
    quantity: 15,
    price: 135000,
    note: 'Pembelian Toffin Indonesia',
    operator: 'Budi Hartono'
  },
  {
    id: 'tx-204',
    date: '2026-06-05',
    type: 'OUT',
    productId: 'prod-1',
    productSku: 'RAW-KOP-RBS',
    productName: 'Biji Kopi Robusta Premium (1kg)',
    quantity: 10,
    price: 85000,
    note: 'Pemakaian produksi roastery internal',
    operator: 'Andi Wijaya'
  },
  {
    id: 'tx-205',
    date: '2026-06-06',
    type: 'IN',
    productId: 'prod-7',
    productSku: 'ELC-CAB-TYC',
    productName: 'Kabel Charger Anker USB-C to USB-C 1.8m',
    quantity: 50,
    price: 75000,
    note: 'Masuk kiriman gudang Anker Jakarta',
    operator: 'Budi Hartono'
  },
  {
    id: 'tx-206',
    date: '2026-06-08',
    type: 'OUT',
    productId: 'prod-2',
    productSku: 'ENV-CUP-SLR',
    productName: 'Cup Sealer Ring Plastik 12 & 16oz',
    quantity: 5,
    price: 120000,
    note: 'Penyusutan dan retur barang cacat roll',
    operator: 'Siti Rahma'
  }
];
