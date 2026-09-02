import { 
  UserAccount, 
  ProductSKU, 
  MarketplaceOrder, 
  MaterialStock, 
  InventoryTransaction, 
  StockOpnameRecord, 
  ProductionPlan, 
  FinancialAccount, 
  CashTransaction, 
  DebtPayable, 
  SuratJalan
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Hj. Sabhira Azzahra',
    email: 'owner@sabhirafashion.id',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '0812-8899-0001',
    permissions: {
      dashboard: true,
      marketplace: true,
      products: true,
      inventory: true,
      production: true,
      finance: true,
      suratJalan: true,
      reports: true,
      users: true,
    },
    settings: {
      defaultWarehouse: 'Semua Gudang (Konsolidasi)',
      defaultView: 'dashboard',
      notifications: {
        lowStockAlert: true,
        criticalStockAlert: true,
        approachingMinStockAlert: true,
        spkDeadlineAlert: true,
        escrowSettlementAlert: true,
        returAlert: true,
        newOrderAlert: true,
        debtDueAlert: true,
      },
      minStockBufferPercent: 20, // Peringatan otomatis ketika stok <= Min Stock + 20%
      soundAlert: true,
      emailSummary: true,
      compactTableMode: false,
    }
  },
  {
    id: 'user-2',
    name: 'Rian Syahputra, S.Ak.',
    email: 'finance@sabhirafashion.id',
    role: 'finance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '0813-2211-9988',
    permissions: {
      dashboard: true,
      marketplace: true,
      products: true,
      inventory: false,
      production: false,
      finance: true,
      suratJalan: false,
      reports: true,
      users: false,
    },
    settings: {
      defaultWarehouse: 'Gudang Utama Pusat',
      defaultView: 'finance',
      notifications: {
        lowStockAlert: false,
        criticalStockAlert: true,
        approachingMinStockAlert: false,
        spkDeadlineAlert: false,
        escrowSettlementAlert: true,
        returAlert: true,
        newOrderAlert: false,
        debtDueAlert: true,
      },
      minStockBufferPercent: 15,
      soundAlert: true,
      emailSummary: true,
      compactTableMode: true,
    }
  },
  {
    id: 'user-3',
    name: 'Nabila Putri (Admin Marketplace)',
    email: 'admin@sabhirafashion.id',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '0857-4433-2211',
    permissions: {
      dashboard: false,
      marketplace: true,
      products: true,
      inventory: true,
      production: false,
      finance: false,
      suratJalan: true,
      reports: false,
      users: false,
    },
    settings: {
      defaultWarehouse: 'Alokasi Stok Marketplace & Live Stream',
      defaultView: 'marketplace',
      notifications: {
        lowStockAlert: true,
        criticalStockAlert: true,
        approachingMinStockAlert: true,
        spkDeadlineAlert: false,
        escrowSettlementAlert: false,
        returAlert: true,
        newOrderAlert: true,
        debtDueAlert: false,
      },
      minStockBufferPercent: 25,
      soundAlert: true,
      emailSummary: false,
      compactTableMode: false,
    }
  },
  {
    id: 'user-4',
    name: 'Pak Budi Santoso (Kepala Gudang)',
    email: 'gudang@sabhirafashion.id',
    role: 'gudang',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '0819-7788-6655',
    permissions: {
      dashboard: false,
      marketplace: false,
      products: true,
      inventory: true,
      production: true,
      finance: false,
      suratJalan: true,
      reports: false,
      users: false,
    },
    settings: {
      defaultWarehouse: 'Gudang Utama Produk Jadi (Bandung)',
      defaultView: 'inventory',
      notifications: {
        lowStockAlert: true,
        criticalStockAlert: true,
        approachingMinStockAlert: true,
        spkDeadlineAlert: true,
        escrowSettlementAlert: false,
        returAlert: true,
        newOrderAlert: false,
        debtDueAlert: false,
      },
      minStockBufferPercent: 25,
      soundAlert: true,
      emailSummary: false,
      compactTableMode: false,
    }
  },
  {
    id: 'user-5',
    name: 'Kang Asep (Kepala Produksi & Cutting)',
    email: 'produksi@sabhirafashion.id',
    role: 'produksi',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '0878-1122-3344',
    permissions: {
      dashboard: false,
      marketplace: false,
      products: true,
      inventory: true,
      production: true,
      finance: false,
      suratJalan: false,
      reports: false,
      users: false,
    },
    settings: {
      defaultWarehouse: 'Gudang Bahan Baku & Workshop Cutting',
      defaultView: 'production',
      notifications: {
        lowStockAlert: true,
        criticalStockAlert: true,
        approachingMinStockAlert: true,
        spkDeadlineAlert: true,
        escrowSettlementAlert: false,
        returAlert: false,
        newOrderAlert: false,
        debtDueAlert: false,
      },
      minStockBufferPercent: 20,
      soundAlert: true,
      emailSummary: false,
      compactTableMode: true,
    }
  },
  {
    id: 'user-6',
    name: 'Dinda Lestari (Digital Marketing & Live)',
    email: 'marketing@sabhirafashion.id',
    role: 'marketing',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '0821-6677-8899',
    permissions: {
      dashboard: true,
      marketplace: true,
      products: true,
      inventory: false,
      production: false,
      finance: false,
      suratJalan: false,
      reports: true,
      users: false,
    },
    settings: {
      defaultWarehouse: 'Alokasi Stok Live Streaming TikTok & Shopee',
      defaultView: 'dashboard',
      notifications: {
        lowStockAlert: true,
        criticalStockAlert: true,
        approachingMinStockAlert: true,
        spkDeadlineAlert: false,
        escrowSettlementAlert: false,
        returAlert: false,
        newOrderAlert: true,
        debtDueAlert: false,
      },
      minStockBufferPercent: 30,
      soundAlert: true,
      emailSummary: false,
      compactTableMode: false,
    }
  }
];

export const INITIAL_PRODUCTS: ProductSKU[] = [
  {
    id: 'prod-1',
    sku: 'SBH-GMS-SLK-SGE-M',
    name: 'Gamis Silk Luxury Sage Green',
    category: 'Gamis',
    color: 'Sage Green',
    size: 'M',
    sellingPrice: 245000,
    materialName: 'Armani Silk Premium',
    materialUsagePerPcs: 2.7,
    hppBreakdown: {
      bahanKain: 67500, // 2.7 m @ 25k
      cutting: 3500,
      jahit: 28000,
      obras: 4000,
      sablonPrinting: 0,
      label: 1500,
      hangtag: 1200,
      packaging: 4500,
      overhead: 4800,
    },
    hppFinal: 115000,
    marginRp: 130000,
    marginPercent: 53.06,
    stockGudang: 145,
    stockMarketplace: 85,
    minStockAlert: 30,
    imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-01'
  },
  {
    id: 'prod-2',
    sku: 'SBH-GMS-SLK-SGE-L',
    name: 'Gamis Silk Luxury Sage Green',
    category: 'Gamis',
    color: 'Sage Green',
    size: 'L',
    sellingPrice: 245000,
    materialName: 'Armani Silk Premium',
    materialUsagePerPcs: 2.9,
    hppBreakdown: {
      bahanKain: 72500,
      cutting: 3500,
      jahit: 28000,
      obras: 4000,
      sablonPrinting: 0,
      label: 1500,
      hangtag: 1200,
      packaging: 4500,
      overhead: 4800,
    },
    hppFinal: 120000,
    marginRp: 125000,
    marginPercent: 51.02,
    stockGudang: 98,
    stockMarketplace: 62,
    minStockAlert: 25,
    imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-01'
  },
  {
    id: 'prod-3',
    sku: 'SBH-ABY-JET-BLK-XL',
    name: 'Abaya Arabian Jetblack Bordir Emas',
    category: 'Dress',
    color: 'Jetblack Hitam Pekat',
    size: 'XL',
    sellingPrice: 289000,
    materialName: 'Kain Jetblack Saudi Import',
    materialUsagePerPcs: 3.2,
    hppBreakdown: {
      bahanKain: 86400,
      cutting: 4000,
      jahit: 32000,
      obras: 4500,
      sablonPrinting: 12000, // Bordir komputer gold
      label: 1500,
      hangtag: 1200,
      packaging: 5500,
      overhead: 5400,
    },
    hppFinal: 147000,
    marginRp: 142000,
    marginPercent: 49.13,
    stockGudang: 42,
    stockMarketplace: 18,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-05'
  },
  {
    id: 'prod-4',
    sku: 'SBH-TNK-RYN-MOCH-M',
    name: 'Tunik Rayon Twill Oversize Mocha',
    category: 'Tunik',
    color: 'Mocha Nude',
    size: 'M',
    sellingPrice: 159000,
    materialName: 'Rayon Twill Uniqlo Grade A',
    materialUsagePerPcs: 2.1,
    hppBreakdown: {
      bahanKain: 42000,
      cutting: 2500,
      jahit: 20000,
      obras: 3000,
      sablonPrinting: 0,
      label: 1500,
      hangtag: 1200,
      packaging: 3500,
      overhead: 3300,
    },
    hppFinal: 77000,
    marginRp: 82000,
    marginPercent: 51.57,
    stockGudang: 210,
    stockMarketplace: 140,
    minStockAlert: 40,
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-10'
  },
  {
    id: 'prod-5',
    sku: 'SBH-HJB-PSH-PLK-DUST',
    name: 'Pashmina Plisket Ceruty Dusty Pink',
    category: 'Hijab',
    color: 'Dusty Pink',
    size: 'All Size',
    sellingPrice: 59000,
    materialName: 'Ceruty Babydoll Premium',
    materialUsagePerPcs: 1.8,
    hppBreakdown: {
      bahanKain: 16200,
      cutting: 1000,
      jahit: 5000,
      obras: 2000,
      sablonPrinting: 4500, // Mesin plisket lipit
      label: 1200,
      hangtag: 1000,
      packaging: 2000,
      overhead: 1600,
    },
    hppFinal: 34500,
    marginRp: 24500,
    marginPercent: 41.53,
    stockGudang: 18, // LOW STOCK ALERT
    stockMarketplace: 12,
    minStockAlert: 50,
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-12'
  },
  {
    id: 'prod-6',
    sku: 'SBH-KMJ-LNN-WHT-L',
    name: 'Kemeja Linen Busui Friendly Broken White',
    category: 'Kemeja',
    color: 'Broken White',
    size: 'L',
    sellingPrice: 179000,
    materialName: 'Linen Rami Softened',
    materialUsagePerPcs: 2.3,
    hppBreakdown: {
      bahanKain: 50600,
      cutting: 3000,
      jahit: 22000,
      obras: 3500,
      sablonPrinting: 0,
      label: 1500,
      hangtag: 1200,
      packaging: 3800,
      overhead: 3900,
    },
    hppFinal: 89500,
    marginRp: 89500,
    marginPercent: 50.00,
    stockGudang: 120,
    stockMarketplace: 75,
    minStockAlert: 30,
    imageUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-15'
  },
  {
    id: 'prod-7',
    sku: 'SBH-MKN-SLK-MAUVE-AS',
    name: 'Mukena Silk 2in1 Lasercut Mauve Rose',
    category: 'Mukena',
    color: 'Mauve Rose',
    size: 'All Size',
    sellingPrice: 320000,
    materialName: 'Dior Silk High Grade',
    materialUsagePerPcs: 4.2,
    hppBreakdown: {
      bahanKain: 96600,
      cutting: 5000,
      jahit: 38000,
      obras: 5000,
      sablonPrinting: 15000, // Ongkos Lasercut tepian
      label: 1800,
      hangtag: 1500,
      packaging: 8500, // Tas pouch mukena eksklusif + Box
      overhead: 6600,
    },
    hppFinal: 178000,
    marginRp: 142000,
    marginPercent: 44.38,
    stockGudang: 65,
    stockMarketplace: 40,
    minStockAlert: 20,
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-18'
  }
];

export const INITIAL_ORDERS: MarketplaceOrder[] = [
  {
    id: 'ord-101',
    orderNumber: '260901SHOPEE8912A',
    channel: 'Shopee',
    date: '2026-09-01T08:30:00',
    customerName: 'Siti Rahmawati (Surabaya)',
    destinationCity: 'Surabaya, Jawa Timur',
    items: [
      {
        skuId: 'prod-1',
        sku: 'SBH-GMS-SLK-SGE-M',
        productName: 'Gamis Silk Luxury Sage Green',
        size: 'M',
        color: 'Sage Green',
        quantity: 2,
        unitPrice: 245000,
        unitHpp: 115000,
        subtotal: 490000
      }
    ],
    grossAmount: 490000,
    adminFee: 41650, // 8.5%
    voucherAmount: 15000,
    discountAmount: 0,
    shippingSubsidy: 10000,
    netPayout: 423350,
    payoutStatus: 'settled',
    payoutDate: '2026-09-01',
    orderStatus: 'completed',
    ekspedisi: 'Shopee Xpress (SPX)',
    resiNumber: 'SPXID0299881122',
    resiStatus: 'delivered',
    resiLastUpdate: '2026-09-02 11:45',
    suratJalanNomor: 'SJP/SPX/20260901/001',
    notes: 'Order live streaming pagi flash sale - Sukses diterima pembeli'
  },
  {
    id: 'ord-102',
    orderNumber: '260901TIKTOK7721X',
    channel: 'TikTok Shop',
    date: '2026-09-01T09:15:00',
    customerName: 'Dewi Lestari (Bandung)',
    destinationCity: 'Bandung, Jawa Barat',
    items: [
      {
        skuId: 'prod-4',
        sku: 'SBH-TNK-RYN-MOCH-M',
        productName: 'Tunik Rayon Twill Oversize Mocha',
        size: 'M',
        color: 'Mocha Nude',
        quantity: 3,
        unitPrice: 159000,
        unitHpp: 77000,
        subtotal: 477000
      },
      {
        skuId: 'prod-5',
        sku: 'SBH-HJB-PSH-PLK-DUST',
        productName: 'Pashmina Plisket Ceruty Dusty Pink',
        size: 'All Size',
        color: 'Dusty Pink',
        quantity: 2,
        unitPrice: 59000,
        unitHpp: 34500,
        subtotal: 118000
      }
    ],
    grossAmount: 595000,
    adminFee: 47600, // 8%
    voucherAmount: 20000,
    discountAmount: 15000,
    shippingSubsidy: 0,
    netPayout: 512400,
    payoutStatus: 'settled',
    payoutDate: '2026-09-01',
    orderStatus: 'completed',
    ekspedisi: 'J&T Express',
    resiNumber: 'JX9922110044',
    resiStatus: 'delivered',
    resiLastUpdate: '2026-09-01 17:30',
    suratJalanNomor: 'SJP/JNT/20260901/002',
    notes: 'Pembelian paket bundling live TikTok - Paket telah sampai'
  },
  {
    id: 'ord-103',
    orderNumber: '260901TOKOPED4412B',
    channel: 'Tokopedia',
    date: '2026-09-01T10:05:00',
    customerName: 'Anisa Kusuma (Jakarta Selatan)',
    destinationCity: 'Jakarta Selatan, DKI Jakarta',
    items: [
      {
        skuId: 'prod-3',
        sku: 'SBH-ABY-JET-BLK-XL',
        productName: 'Abaya Arabian Jetblack Bordir Emas',
        size: 'XL',
        color: 'Jetblack Hitam Pekat',
        quantity: 1,
        unitPrice: 289000,
        unitHpp: 147000,
        subtotal: 289000
      }
    ],
    grossAmount: 289000,
    adminFee: 18785, // 6.5%
    voucherAmount: 10000,
    discountAmount: 0,
    shippingSubsidy: 5000,
    netPayout: 255215,
    payoutStatus: 'escrow',
    orderStatus: 'shipped',
    ekspedisi: 'SiCepat REG',
    resiNumber: 'TKP9988112233',
    resiStatus: 'in_transit',
    resiLastUpdate: '2026-09-02 04:15',
    suratJalanNomor: 'SJP/SCP/20260901/003',
    notes: 'Sedang transit di Hub Gateway Jakarta Selatan'
  },
  {
    id: 'ord-106',
    orderNumber: '260901SHOPEE3321D',
    channel: 'Shopee',
    date: '2026-09-01T10:45:00',
    customerName: 'Fatimah Az-Zahra (Semarang)',
    destinationCity: 'Semarang, Jawa Tengah',
    items: [
      {
        skuId: 'prod-1',
        sku: 'SBH-GMS-SLK-SGE-M',
        productName: 'Gamis Silk Luxury Sage Green',
        size: 'M',
        color: 'Sage Green',
        quantity: 1,
        unitPrice: 245000,
        unitHpp: 115000,
        subtotal: 245000
      }
    ],
    grossAmount: 245000,
    adminFee: 20825,
    voucherAmount: 0,
    discountAmount: 0,
    shippingSubsidy: 0,
    netPayout: 224175,
    payoutStatus: 'escrow',
    orderStatus: 'shipped',
    ekspedisi: 'Shopee Xpress (SPX)',
    resiNumber: 'SPXID0992381200',
    resiStatus: 'out_for_delivery',
    resiLastUpdate: '2026-09-02 08:30',
    suratJalanNomor: 'SJP/SPX/20260901/001',
    notes: 'Sedang dibawa kurir pengantar di Semarang Barat'
  },
  {
    id: 'ord-107',
    orderNumber: '260901TIKTOK8811Q',
    channel: 'TikTok Shop',
    date: '2026-09-01T11:00:00',
    customerName: 'Rina Kartika (Yogyakarta)',
    destinationCity: 'Sleman, DI Yogyakarta',
    items: [
      {
        skuId: 'prod-7',
        sku: 'SBH-MKN-SLK-MAUVE-AS',
        productName: 'Mukena Silk 2in1 Lasercut Mauve Rose',
        size: 'All Size',
        color: 'Mauve Rose',
        quantity: 1,
        unitPrice: 290000,
        unitHpp: 178000,
        subtotal: 290000
      }
    ],
    grossAmount: 290000,
    adminFee: 23200,
    voucherAmount: 10000,
    discountAmount: 0,
    shippingSubsidy: 0,
    netPayout: 256800,
    payoutStatus: 'escrow',
    orderStatus: 'shipped',
    ekspedisi: 'J&T Express',
    resiNumber: 'JX8899001122',
    resiStatus: 'lost_or_unscanned',
    resiLastUpdate: '2026-09-01 14:15',
    suratJalanNomor: 'SJP/JNT/20260901/002',
    notes: 'PERINGATAN: Paket sudah diserahkan di Surat Jalan SJP/JNT/20260901/002 tapi belum tercatat scan ekspedisi > 24 jam! Siapkan klaim ganti rugi.'
  },
  {
    id: 'ord-108',
    orderNumber: '260901SHOPEE5544K',
    channel: 'Shopee',
    date: '2026-09-01T11:15:00',
    customerName: 'Lina Marlina (Bogor)',
    destinationCity: 'Bogor, Jawa Barat',
    items: [
      {
        skuId: 'prod-2',
        sku: 'SBH-TNK-RYN-BGE-L',
        productName: 'Tunik Rayon Bordir Senja Beige',
        size: 'L',
        color: 'Warm Beige',
        quantity: 2,
        unitPrice: 195000,
        unitHpp: 85000,
        subtotal: 390000
      }
    ],
    grossAmount: 390000,
    adminFee: 33150,
    voucherAmount: 15000,
    discountAmount: 0,
    shippingSubsidy: 5000,
    netPayout: 336850,
    payoutStatus: 'escrow',
    orderStatus: 'processing',
    ekspedisi: 'Shopee Xpress (SPX)',
    resiNumber: 'SPXID0771122334',
    resiStatus: 'pending_pickup',
    resiLastUpdate: '2026-09-01 11:30',
    notes: 'Paket telah selesai dipacking di gudang, menunggu pick-up kurir sore'
  },
  {
    id: 'ord-104',
    orderNumber: '260901OFFLINE991C',
    channel: 'Offline/WhatsApp',
    date: '2026-09-01T11:20:00',
    customerName: 'Butik Sabrina Fashion (Reseller Pekalongan)',
    destinationCity: 'Pekalongan, Jawa Tengah',
    items: [
      {
        skuId: 'prod-1',
        sku: 'SBH-GMS-SLK-SGE-M',
        productName: 'Gamis Silk Luxury Sage Green',
        size: 'M',
        color: 'Sage Green',
        quantity: 10,
        unitPrice: 220000, // Harga grosir reseller
        unitHpp: 115000,
        subtotal: 2200000
      },
      {
        skuId: 'prod-7',
        sku: 'SBH-MKN-SLK-MAUVE-AS',
        productName: 'Mukena Silk 2in1 Lasercut Mauve Rose',
        size: 'All Size',
        color: 'Mauve Rose',
        quantity: 5,
        unitPrice: 290000,
        unitHpp: 178000,
        subtotal: 1450000
      }
    ],
    grossAmount: 3650000,
    adminFee: 0, // Tanpa potongan marketplace
    voucherAmount: 0,
    discountAmount: 100000, // Diskon khusus reseller 15 pcs
    shippingSubsidy: 0,
    netPayout: 3550000,
    payoutStatus: 'settled',
    payoutDate: '2026-09-01',
    orderStatus: 'completed',
    ekspedisi: 'J&T Cargo Express',
    resiNumber: 'JTC9922001188',
    resiStatus: 'delivered',
    resiLastUpdate: '2026-09-01 16:00',
    suratJalanNomor: 'SJ/SBH/202609/001',
    notes: 'Transfer Bank BCA Direct - No Resi Cargo Indah Logistik'
  },
  {
    id: 'ord-105',
    orderNumber: '260831LAZADA112Z',
    channel: 'Lazada',
    date: '2026-08-31T14:40:00',
    customerName: 'Nurul Hidayah (Medan)',
    destinationCity: 'Medan, Sumatera Utara',
    items: [
      {
        skuId: 'prod-6',
        sku: 'SBH-KMJ-LNN-WHT-L',
        productName: 'Kemeja Linen Busui Friendly Broken White',
        size: 'L',
        color: 'Broken White',
        quantity: 1,
        unitPrice: 179000,
        unitHpp: 89500,
        subtotal: 179000
      }
    ],
    grossAmount: 179000,
    adminFee: 14320,
    voucherAmount: 5000,
    discountAmount: 0,
    shippingSubsidy: 0,
    netPayout: 159680,
    payoutStatus: 'escrow',
    orderStatus: 'returned',
    ekspedisi: 'Ninja Xpress',
    resiNumber: 'LZD88776655',
    resiStatus: 'pending_pickup',
    resiLastUpdate: '2026-08-31 16:00',
    returnReason: 'Customer minta tukar size karena kekecilan (Retur Masuk)',
    returnProcessed: true,
    notes: 'Barang kembali ke gudang dalam kondisi mulus, stok disesuaikan'
  }
];

export const INITIAL_MATERIALS: MaterialStock[] = [
  {
    id: 'mat-1',
    code: 'RAW-KLN-ARM-SGE',
    name: 'Kain Armani Silk Grade A (Sage Green)',
    type: 'Kain',
    unit: 'meter',
    currentStock: 480,
    minStock: 100,
    avgCostPerUnit: 25000,
    supplier: 'PT Textile Mega Prima Bandung',
    lastUpdated: '2026-08-28'
  },
  {
    id: 'mat-2',
    code: 'RAW-KLN-JET-BLK',
    name: 'Kain Jetblack Saudi Import High Quality',
    type: 'Kain',
    unit: 'meter',
    currentStock: 250,
    minStock: 80,
    avgCostPerUnit: 27000,
    supplier: 'CV Mitra Tekstil Solo',
    lastUpdated: '2026-08-25'
  },
  {
    id: 'mat-3',
    code: 'RAW-KLN-RYN-TWL',
    name: 'Kain Rayon Twill Uniqlo 40s (Mocha)',
    type: 'Kain',
    unit: 'meter',
    currentStock: 620,
    minStock: 150,
    avgCostPerUnit: 20000,
    supplier: 'PT Textile Mega Prima Bandung',
    lastUpdated: '2026-08-29'
  },
  {
    id: 'mat-4',
    code: 'ACC-LBL-WVN-SBH',
    name: 'Woven Label Sabhira Signature Rose Gold',
    type: 'Label',
    unit: 'pcs',
    currentStock: 4500,
    minStock: 1000,
    avgCostPerUnit: 1500,
    supplier: 'Percetakan Label Prima Jakarta',
    lastUpdated: '2026-08-15'
  },
  {
    id: 'mat-5',
    code: 'ACC-PKG-ZIP-MATTE',
    name: 'Zipper Pouch Frosted Sabhira Custom 30x40cm',
    type: 'Packaging',
    unit: 'pcs',
    currentStock: 1800,
    minStock: 500,
    avgCostPerUnit: 3500,
    supplier: 'CV Plastindo Makmur',
    lastUpdated: '2026-08-20'
  }
];

export const INITIAL_INVENTORY_TX: InventoryTransaction[] = [
  {
    id: 'tx-001',
    transactionNumber: 'IN-260828-001',
    date: '2026-08-28',
    type: 'PEMBELIAN_BAHAN',
    referenceNo: 'PO/SBH/202608/091',
    materialId: 'mat-1',
    materialName: 'Kain Armani Silk Grade A (Sage Green)',
    qtyChange: 500,
    unit: 'meter',
    fromLocation: 'PT Textile Mega Prima Bandung',
    toLocation: 'Gudang Bahan Baku Sabhira',
    pic: 'Pak Budi (Gudang)',
    notes: 'Penerimaan kain 5 roll @ 100 meter, kondisi kain lolos QC grade A'
  },
  {
    id: 'tx-002',
    transactionNumber: 'PROD-260830-002',
    date: '2026-08-30',
    type: 'BARANG_MASUK_PRODUKSI',
    referenceNo: 'SPK-2608-014',
    skuId: 'prod-1',
    skuCode: 'SBH-GMS-SLK-SGE-M',
    productName: 'Gamis Silk Luxury Sage Green (M)',
    qtyChange: 150,
    unit: 'pcs',
    fromLocation: 'Konveksi Berkah Jahit',
    toLocation: 'Gudang Utama Produk Jadi',
    pic: 'Kang Asep (QC & Produksi)',
    notes: 'Selesai QC lolos 150 pcs, 3 reject disisihkan ke karantina'
  },
  {
    id: 'tx-003',
    transactionNumber: 'MUT-260831-001',
    date: '2026-08-31',
    type: 'MUTASI_GUDANG',
    referenceNo: 'MUT/GUD/202608/04',
    skuId: 'prod-1',
    skuCode: 'SBH-GMS-SLK-SGE-M',
    productName: 'Gamis Silk Luxury Sage Green (M)',
    qtyChange: 50,
    unit: 'pcs',
    fromLocation: 'Gudang Utama Pusat',
    toLocation: 'Alokasi Stok Live Shopee & TikTok',
    pic: 'Nabila Putri (Admin)',
    notes: 'Alokasi stok live streaming 9.9 Super Shopping Day'
  },
  {
    id: 'tx-004',
    transactionNumber: 'OUT-260901-081',
    date: '2026-09-01',
    type: 'BARANG_KELUAR_PENJUALAN',
    referenceNo: '260901SHOPEE881A',
    skuId: 'prod-1',
    skuCode: 'SBH-GMS-SLK-SGE-M',
    productName: 'Gamis Silk Luxury Sage Green (M)',
    qtyChange: -2,
    unit: 'pcs',
    fromLocation: 'Gudang Utama Pusat',
    toLocation: 'Pelanggan Shopee (Siti Aminah, Surabaya)',
    pic: 'Pak Budi (Gudang)',
    notes: 'Packing & Scan Barcode SPX Express'
  },
  {
    id: 'tx-005',
    transactionNumber: 'OUT-260901-082',
    date: '2026-09-01',
    type: 'BARANG_KELUAR_PENJUALAN',
    referenceNo: '260901TIKTOK992B',
    skuId: 'prod-2',
    skuCode: 'SBH-ABY-JTB-BLK-L',
    productName: 'Abaya Jetblack Bordir Emas (L)',
    qtyChange: -1,
    unit: 'pcs',
    fromLocation: 'Gudang Utama Pusat',
    toLocation: 'Pelanggan TikTok Shop (Dewi Lestari, Jakarta)',
    pic: 'Pak Budi (Gudang)',
    notes: 'Packing Pesanan J&T Express TikTok Flash Sale'
  },
  {
    id: 'tx-006',
    transactionNumber: 'RET-260831-019',
    date: '2026-08-31',
    type: 'RETUR_MASUK',
    referenceNo: '260831LAZADA112Z',
    skuId: 'prod-6',
    skuCode: 'SBH-KMJ-LNN-WHT-L',
    productName: 'Kemeja Linen Busui Friendly Broken White (L)',
    qtyChange: 1,
    unit: 'pcs',
    fromLocation: 'Customer Retur (Lazada)',
    toLocation: 'Gudang Utama (Restock)',
    pic: 'Pak Budi (Gudang)',
    notes: 'Retur tukar size dari pembeli Medan, kondisi bersih dan hangtag utuh'
  },
  {
    id: 'tx-007',
    transactionNumber: 'ADJ-260831-001',
    date: '2026-08-31',
    type: 'STOCK_OPNAME_ADJUSTMENT',
    referenceNo: 'SO/202608/001',
    skuId: 'prod-1',
    skuCode: 'SBH-GMS-SLK-SGE-M',
    productName: 'Gamis Silk Luxury Sage Green (M)',
    qtyChange: -2,
    unit: 'pcs',
    fromLocation: 'Stock Opname Audit',
    toLocation: 'Penyesuaian Sistem Gudang',
    pic: 'Hj. Sabhira (Owner) & Pak Budi',
    notes: 'Penyesuaian stok opname fisik: 2 pcs dialokasikan untuk sample photoshoot konten live'
  }
];

export const INITIAL_STOCK_OPNAME: StockOpnameRecord[] = [
  {
    id: 'so-1',
    opnameNumber: 'SO/202608/001',
    date: '2026-08-31',
    skuId: 'prod-1',
    skuCode: 'SBH-GMS-SLK-SGE-M',
    productName: 'Gamis Silk Luxury Sage Green (M)',
    systemStock: 147,
    physicalStock: 145,
    discrepancy: -2,
    discrepancyValue: -230000,
    reason: '2 pcs sample display photoshoot konten TikTok',
    status: 'approved',
    auditorName: 'Pak Budi Santoso'
  },
  {
    id: 'so-2',
    opnameNumber: 'SO/202608/002',
    date: '2026-08-31',
    skuId: 'prod-4',
    skuCode: 'SBH-TNK-RYN-MOCH-M',
    productName: 'Tunik Rayon Twill Oversize Mocha (M)',
    systemStock: 210,
    physicalStock: 210,
    discrepancy: 0,
    discrepancyValue: 0,
    reason: 'Stok fisik sesuai 100% akurat',
    status: 'approved',
    auditorName: 'Pak Budi Santoso'
  }
];

export const INITIAL_PRODUCTION_PLANS: ProductionPlan[] = [
  {
    id: 'spk-01',
    spkNumber: 'SPK/SBH/202609/001',
    title: 'Batch Produksi Gamis Silk Sage Green 200 Pcs',
    skuId: 'prod-1',
    skuCode: 'SBH-GMS-SLK-SGE-M',
    productName: 'Gamis Silk Luxury Sage Green',
    targetQty: 200,
    startDate: '2026-09-01',
    deadlineDate: '2026-09-08',
    tailorVendorName: 'Konveksi Barokah Taylor (Kudus)',
    materialUsed: [
      {
        materialId: 'mat-1',
        materialName: 'Kain Armani Silk Grade A (Sage Green)',
        qtyPlan: 540, // 200 * 2.7
        qtyActual: 535, // Hemat 5 meter
        unit: 'meter'
      },
      {
        materialId: 'mat-4',
        materialName: 'Woven Label Sabhira Signature',
        qtyPlan: 200,
        qtyActual: 200,
        unit: 'pcs'
      }
    ],
    standardHpp: 115000,
    actualHpp: 113750, // Lebih murah berkat efisiensi pola potong
    finishedGoodQty: 196,
    rejectQty: 2,
    reworkQty: 2,
    status: 'sewing',
    notes: 'Pola cutting sudah optimal, target siap packing tgl 7 Sept',
    createdAt: '2026-09-01'
  },
  {
    id: 'spk-02',
    spkNumber: 'SPK/SBH/202608/014',
    title: 'Batch Produksi Tunik Rayon Mocha 300 Pcs',
    skuId: 'prod-4',
    skuCode: 'SBH-TNK-RYN-MOCH-M',
    productName: 'Tunik Rayon Twill Oversize Mocha',
    targetQty: 300,
    startDate: '2026-08-20',
    deadlineDate: '2026-08-28',
    tailorVendorName: 'Workshop Internal Sabhira',
    materialUsed: [
      {
        materialId: 'mat-3',
        materialName: 'Kain Rayon Twill Uniqlo 40s (Mocha)',
        qtyPlan: 630,
        qtyActual: 630,
        unit: 'meter'
      }
    ],
    standardHpp: 77000,
    actualHpp: 77000,
    finishedGoodQty: 295,
    rejectQty: 3,
    reworkQty: 2,
    status: 'completed',
    notes: 'Selesai 100% tepat waktu dan telah masuk ke stok gudang utama',
    createdAt: '2026-08-20'
  }
];

export const INITIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc-1',
    name: 'BCA Operasional Utama',
    type: 'bank_bca',
    accountNumber: '8830-192-881',
    holderName: 'PT Sabhira Fashion Indonesia',
    balance: 84500000
  },
  {
    id: 'acc-2',
    name: 'Mandiri Bisnis & Payroll',
    type: 'bank_mandiri',
    accountNumber: '137-00-1928374-1',
    holderName: 'Sabhira Azzahra',
    balance: 42300000
  },
  {
    id: 'acc-3',
    name: 'Kas Tunai / Kas Kecil Kantor',
    type: 'kas_tunai',
    accountNumber: '-',
    holderName: 'Admin Keuangan',
    balance: 8750000
  },
  {
    id: 'acc-4',
    name: 'Saldo Shopee Seller Saldo',
    type: 'escrow_shopee',
    accountNumber: 'ShopeePay/Escrow',
    holderName: 'Sabhira Official Shop',
    balance: 24800000
  },
  {
    id: 'acc-5',
    name: 'Saldo TikTok Shop Settlement',
    type: 'escrow_tiktok',
    accountNumber: 'TikTok Merchant Center',
    holderName: 'Sabhira Hijab ID',
    balance: 31200000
  }
];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [
  {
    id: 'ctx-01',
    transactionNumber: 'KM-260901-001',
    date: '2026-09-01',
    type: 'in',
    category: 'PENJUALAN_MARKETPLACE_CAIR',
    amount: 14500000,
    accountId: 'acc-1',
    accountName: 'BCA Operasional Utama',
    recipientOrSender: 'Shopee Indonesia (Pencairan Saldo)',
    description: 'Pencairan dana penjualan Shopee tgl 29-31 Agustus'
  },
  {
    id: 'ctx-02',
    transactionNumber: 'KK-260901-002',
    date: '2026-09-01',
    type: 'out',
    category: 'MARKETING_ADS',
    amount: 3500000,
    accountId: 'acc-1',
    accountName: 'BCA Operasional Utama',
    recipientOrSender: 'TikTok Ads Manager / ByteDance',
    description: 'Top up saldo iklan TikTok Ads kampanye live stream 9.9'
  },
  {
    id: 'ctx-03',
    transactionNumber: 'KK-260901-003',
    date: '2026-09-01',
    type: 'out',
    category: 'BIAYA_JAHIT_PRODUKSI',
    amount: 5600000,
    accountId: 'acc-2',
    accountName: 'Mandiri Bisnis & Payroll',
    recipientOrSender: 'Konveksi Barokah Taylor (DP SPK 001)',
    description: 'DP 50% ongkos jahit 200 pcs Gamis Silk Sage Green'
  },
  {
    id: 'ctx-04',
    transactionNumber: 'KM-260901-004',
    date: '2026-09-01',
    type: 'in',
    category: 'PENJUALAN_OFFLINE',
    amount: 3550000,
    accountId: 'acc-1',
    accountName: 'BCA Operasional Utama',
    recipientOrSender: 'Butik Sabrina Fashion Pekalongan',
    description: 'Pembayaran order grosir reseller 15 pcs'
  },
  {
    id: 'ctx-05',
    transactionNumber: 'KK-260831-005',
    date: '2026-08-31',
    type: 'out',
    category: 'GAJI_KARYAWAN',
    amount: 18500000,
    accountId: 'acc-2',
    accountName: 'Mandiri Bisnis & Payroll',
    recipientOrSender: 'Payroll 6 Karyawan Sabhira',
    description: 'Gaji pokok + insentif omzet bulan Agustus'
  }
];

export const INITIAL_DEBTS: DebtPayable[] = [
  {
    id: 'debt-01',
    type: 'hutang',
    referenceNo: 'INV/TX/BANDUNG/889',
    entityName: 'PT Textile Mega Prima Bandung (Supplier Kain)',
    totalAmount: 18500000,
    paidAmount: 8500000,
    remainingAmount: 10000000,
    dueDate: '2026-09-15',
    status: 'belum_lunas',
    notes: 'Termin pembayaran kain Armani Silk & Rayon Twill 30 hari'
  },
  {
    id: 'debt-02',
    type: 'piutang',
    referenceNo: 'RESELLER/PKL/2026/02',
    entityName: 'Butik Aulia Hijab Malang (Reseller Diamond)',
    totalAmount: 6400000,
    paidAmount: 2000000,
    remainingAmount: 4400000,
    dueDate: '2026-09-10',
    status: 'belum_lunas',
    notes: 'Konsinyasi 30 pcs Gamis & Mukena Sabhira'
  }
];

export const INITIAL_SURAT_JALAN: SuratJalan[] = [
  {
    id: 'sjp-001',
    nomorSuratJalan: 'SJP/SPX/20260901/001',
    tipeSuratJalan: 'pengantaran_paket_marketplace',
    date: '2026-09-01',
    time: '14:30 WIB',
    ekspedisi: 'Shopee Xpress (SPX)',
    pengirim: {
      nama: 'Kang Ujang (Admin Gudang)',
      gudang: 'Gudang Pusat Sabhira Fashion Bandung',
      telepon: '0812-8899-0001',
      alamat: 'Jl. R.E. Martadinata No. 128, Bandung, Jawa Barat',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70"><path d="M15 50 Q 35 15 65 45 T 115 25 T 145 50" stroke="%231e3a8a" stroke-width="2.5" fill="none"/></svg>',
      signatureDate: '2026-09-01 14:28 WIB'
    },
    penerima: {
      nama: 'Pak Dani (Driver Kurir SPX)',
      tujuan: 'Sorting Hub Shopee Xpress Gedebage Bandung',
      telepon: '0857-1122-3344',
      alamat: 'Hub SPX Logistic Park Gedebage, Kota Bandung',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70"><path d="M20 45 C 40 20, 60 60, 90 25 S 135 60, 150 35" stroke="%231e3a8a" stroke-width="2.5" fill="none"/></svg>',
      signatureDate: '2026-09-01 14:30 WIB'
    },
    kendaraanDriver: {
      namaSupir: 'Pak Dani Kurniawan',
      platNomor: 'D 3341 SPX',
      kurirPhone: '0857-1122-3344'
    },
    items: [],
    packages: [
      {
        orderId: 'ord-101',
        orderNumber: '260901SHOPEE8912A',
        channel: 'Shopee',
        resiNumber: 'SPXID0299881122',
        ekspedisi: 'Shopee Xpress (SPX)',
        customerName: 'Siti Rahmawati (Surabaya)',
        destinationCity: 'Surabaya, Jawa Timur',
        totalQty: 2,
        itemsSummary: 'Gamis Silk Luxury Sage Green (2 pcs)',
        packageWeightKg: 0.8,
        scanStatus: 'scanned',
        scannedAt: '2026-09-01 15:10 WIB'
      },
      {
        orderId: 'ord-106',
        orderNumber: '260901SHOPEE3321D',
        channel: 'Shopee',
        resiNumber: 'SPXID0992381200',
        ekspedisi: 'Shopee Xpress (SPX)',
        customerName: 'Fatimah Az-Zahra (Semarang)',
        destinationCity: 'Semarang, Jawa Tengah',
        totalQty: 1,
        itemsSummary: 'Gamis Silk Luxury Sage Green (1 pcs)',
        packageWeightKg: 0.5,
        scanStatus: 'scanned',
        scannedAt: '2026-09-01 15:10 WIB'
      },
      {
        orderId: 'ord-108',
        orderNumber: '260901SHOPEE5544K',
        channel: 'Shopee',
        resiNumber: 'SPXID0771122334',
        ekspedisi: 'Shopee Xpress (SPX)',
        customerName: 'Lina Marlina (Bogor)',
        destinationCity: 'Bogor, Jawa Barat',
        totalQty: 2,
        itemsSummary: 'Tunik Rayon Bordir Senja Beige (2 pcs)',
        packageWeightKg: 0.7,
        scanStatus: 'pending_scan'
      }
    ],
    totalPcs: 5,
    totalKoli: 3,
    catatan: 'Serah terima paket pick-up sore Shopee Xpress. Total 3 paket dalam kantong karung tersegel.',
    status: 'dikirim'
  },
  {
    id: 'sjp-002',
    nomorSuratJalan: 'SJP/JNT/20260901/002',
    tipeSuratJalan: 'pengantaran_paket_marketplace',
    date: '2026-09-01',
    time: '14:15 WIB',
    ekspedisi: 'J&T Express',
    pengirim: {
      nama: 'Kang Ujang (Admin Gudang)',
      gudang: 'Gudang Pusat Sabhira Fashion Bandung',
      telepon: '0812-8899-0001',
      alamat: 'Jl. R.E. Martadinata No. 128, Bandung, Jawa Barat',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70"><path d="M15 50 Q 35 15 65 45 T 115 25 T 145 50" stroke="%231e3a8a" stroke-width="2.5" fill="none"/></svg>',
      signatureDate: '2026-09-01 14:10 WIB'
    },
    penerima: {
      nama: 'Pak Joko Santoso (Driver J&T)',
      tujuan: 'Drop Point J&T Express Riau Bandung',
      telepon: '0812-9988-4455',
      alamat: 'Jl. L.L.R.E. Martadinata No. 88, Bandung',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70"><path d="M10 40 Q 30 10 50 40 T 90 20 T 110 45" stroke="%230f172a" stroke-width="2" fill="none"/></svg>',
      signatureDate: '2026-09-01 14:15 WIB'
    },
    kendaraanDriver: {
      namaSupir: 'Pak Joko Santoso',
      platNomor: 'D 8912 JNT',
      kurirPhone: '0812-9988-4455'
    },
    items: [],
    packages: [
      {
        orderId: 'ord-102',
        orderNumber: '260901TIKTOK7721X',
        channel: 'TikTok Shop',
        resiNumber: 'JX9922110044',
        ekspedisi: 'J&T Express',
        customerName: 'Dewi Lestari (Bandung)',
        destinationCity: 'Bandung, Jawa Barat',
        totalQty: 5,
        itemsSummary: 'Tunik Rayon (3 pcs) + Pashmina (2 pcs)',
        packageWeightKg: 1.2,
        scanStatus: 'scanned',
        scannedAt: '2026-09-01 14:45 WIB'
      },
      {
        orderId: 'ord-107',
        orderNumber: '260901TIKTOK8811Q',
        channel: 'TikTok Shop',
        resiNumber: 'JX8899001122',
        ekspedisi: 'J&T Express',
        customerName: 'Rina Kartika (Yogyakarta)',
        destinationCity: 'Sleman, DI Yogyakarta',
        totalQty: 1,
        itemsSummary: 'Mukena Silk 2in1 Lasercut Mauve Rose (1 pcs)',
        packageWeightKg: 0.6,
        scanStatus: 'missing_alert'
      }
    ],
    totalPcs: 6,
    totalKoli: 2,
    catatan: 'PERHATIAN: Resi JX8899001122 belum terscan oleh J&T setelah pick-up. Bukti TTD Pak Joko ada di surat jalan ini untuk klaim!',
    status: 'dikirim'
  },
  {
    id: 'sj-001',
    nomorSuratJalan: 'SJ/SBH/202609/001',
    tipeSuratJalan: 'distribusi_internal',
    date: '2026-09-01',
    time: '11:30 WIB',
    ekspedisi: 'J&T Cargo Express',
    noResi: 'JTC9922001188',
    pengirim: {
      nama: 'Pak Budi Santoso',
      gudang: 'Gudang Pusat Sabhira Fashion',
      telepon: '0812-8899-0001',
      alamat: 'Jl. R.E. Martadinata No. 128, Bandung, Jawa Barat',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="M10 40 Q 30 10 50 40 T 90 20 T 110 45" stroke="%230f172a" stroke-width="2" fill="none"/></svg>'
    },
    penerima: {
      nama: 'Ibu Sabrina',
      tujuan: 'Butik Sabrina Fashion (Cabang Pekalongan)',
      telepon: '0813-9988-7766',
      alamat: 'Jl. Hayam Wuruk No. 45, Pekalongan Timur, Jawa Tengah'
    },
    kendaraanDriver: {
      namaSupir: 'Pak Joko (Driver J&T Cargo)',
      platNomor: 'D 8912 AB'
    },
    items: [
      {
        skuId: 'prod-1',
        skuCode: 'SBH-GMS-SLK-SGE-M',
        productName: 'Gamis Silk Luxury Sage Green',
        color: 'Sage Green',
        size: 'M',
        quantity: 10,
        unit: 'pcs',
        keterangan: 'Plastik zipper + hangtag rapi'
      },
      {
        skuId: 'prod-7',
        skuCode: 'SBH-MKN-SLK-MAUVE-AS',
        productName: 'Mukena Silk 2in1 Lasercut Mauve Rose',
        color: 'Mauve Rose',
        size: 'All Size',
        quantity: 5,
        unit: 'pcs',
        keterangan: 'Pouch box exclusive'
      }
    ],
    totalPcs: 15,
    catatan: 'Harap dijaga jangan tertindih barang basah/berat. Simpan di area sejuk.',
    status: 'dikirim'
  }
];

