export type UserRole = 'owner' | 'finance' | 'admin' | 'gudang' | 'produksi' | 'marketing';

export interface UserSettings {
  defaultWarehouse: string;
  defaultView: string;
  notifications: {
    lowStockAlert: boolean;
    criticalStockAlert: boolean;
    approachingMinStockAlert: boolean;
    spkDeadlineAlert: boolean;
    escrowSettlementAlert: boolean;
    returAlert: boolean;
    newOrderAlert: boolean;
    debtDueAlert: boolean;
  };
  minStockBufferPercent: number; // e.g. 20% warning threshold above minStock
  soundAlert: boolean;
  emailSummary: boolean;
  compactTableMode: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar: string;
  phone: string;
  permissions: {
    dashboard: boolean;
    marketplace: boolean;
    products: boolean;
    inventory: boolean;
    production: boolean;
    finance: boolean;
    suratJalan: boolean;
    reports: boolean;
    users: boolean;
  };
  settings?: UserSettings;
}

export interface StockAlert {
  id: string;
  type: 'CRITICAL_STOCK' | 'APPROACHING_MIN' | 'OUT_OF_STOCK' | 'RETUR_PENDING' | 'OPNAME_DISCREPANCY';
  severity: 'danger' | 'warning' | 'info';
  skuId?: string;
  skuCode?: string;
  productName: string;
  currentStock: number;
  minStockAlert: number;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetRoles: UserRole[];
}

export type MarketplaceChannel = 'Shopee' | 'TikTok Shop' | 'Tokopedia' | 'Lazada' | 'Offline/WhatsApp' | 'WhatsApp / Langsung';

export interface HppBreakdown {
  bahanKain: number; // Biaya kain per pcs
  cutting: number; // Biaya potong
  jahit: number; // Ongkos jahit
  obras: number; // Biaya obras
  sablonPrinting: number; // Sablon / printing / bordir
  label: number; // Woven/satin label
  hangtag: number; // Hangtag & tali
  packaging: number; // Polymailer, zip lock, thank you card
  overhead: number; // Listrik, QC, penyusutan alat
}

export interface ProductSKU {
  id: string;
  sku: string;
  name: string;
  category: 'Gamis' | 'Tunik' | 'Hijab' | 'Dress' | 'Kemeja' | 'Outer' | 'Mukena' | 'Bawahan';
  color: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'All Size' | 'Jumbo';
  sellingPrice: number;
  materialName: string; // e.g. "Rayon Twill Premium", "Ceruty Babydoll", "Silk Sutra"
  materialUsagePerPcs: number; // in meters/yard
  hppBreakdown: HppBreakdown;
  hppFinal: number; // Calculated sum of breakdown
  marginRp: number; // sellingPrice - hppFinal
  marginPercent: number; // (marginRp / sellingPrice) * 100
  stockGudang: number;
  stockMarketplace: number;
  minStockAlert: number;
  imageUrl?: string;
  status: 'active' | 'archived' | 'preorder';
  createdAt: string;
}

export type OrderStatus = 'completed' | 'processing' | 'shipped' | 'returned' | 'cancelled';
export type PayoutStatus = 'settled' | 'escrow' | 'pending' | 'deducted';

export type ResiDeliveryStatus = 
  | 'pending_pickup'      // Menunggu Penjemputan Kurir / Siap Serah Terima
  | 'picked_up'          // Diserahkan ke Kurir (Ada Bukti Surat Jalan)
  | 'in_transit'         // Dalam Perjalanan (Sorting / Hub Ekspedisi)
  | 'out_for_delivery'    // Sedang Diantar Kurir ke Pembeli
  | 'delivered'          // Sukses Terkirim & Diterima
  | 'lost_or_unscanned';  // Peringatan: Resi Hilang / Belum Terscan Kurir > 24 Jam

export interface TrackingCheckpoint {
  timestamp: string;
  location: string;
  status: 'manifested' | 'picked_up' | 'in_transit' | 'sorting_hub' | 'out_for_delivery' | 'delivered' | 'failed_attempt' | 'lost_alert';
  title: string;
  description: string;
  courierOrHub?: string;
}

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  channel: MarketplaceChannel;
  date: string;
  customerName: string;
  destinationCity?: string;
  items: {
    skuId: string;
    sku: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    unitHpp: number;
    subtotal: number;
  }[];
  grossAmount: number; // Total harga barang
  adminFee: number; // Potongan komisi marketplace
  voucherAmount: number; // Voucher diskon toko/seller
  discountAmount: number; // Diskon kampanye
  shippingSubsidy: number; // Biaya subsidi ongkir ditanggung seller
  netPayout: number; // grossAmount - (adminFee + voucherAmount + discountAmount + shippingSubsidy)
  payoutStatus: PayoutStatus;
  payoutDate?: string;
  orderStatus: OrderStatus;
  ekspedisi?: string; // e.g. "Shopee Xpress", "J&T Express", "SiCepat", "JNE", "Ninja Xpress"
  resiNumber?: string;
  resiStatus?: ResiDeliveryStatus;
  resiLastUpdate?: string;
  trackingHistory?: TrackingCheckpoint[];
  suratJalanNomor?: string;
  suratJalanId?: string;
  notes?: string;
  returnReason?: string;
  returnProcessed?: boolean;
}

export interface MaterialStock {
  id: string;
  code: string;
  name: string;
  type: 'Kain' | 'Benang' | 'Kancing' | 'Resleting' | 'Label' | 'Hangtag' | 'Packaging';
  unit: 'meter' | 'yard' | 'roll' | 'pcs' | 'lusin' | 'pack';
  currentStock: number;
  minStock: number;
  avgCostPerUnit: number;
  supplier: string;
  lastUpdated: string;
}

export type InventoryTransactionType = 
  | 'PEMBELIAN_BAHAN' 
  | 'BARANG_MASUK_PRODUKSI' 
  | 'BARANG_MASUK_PEMBELIAN'
  | 'BARANG_KELUAR_PENJUALAN' 
  | 'MUTASI_GUDANG' 
  | 'RETUR_MASUK' 
  | 'RETUR_REJECT'
  | 'PENYESUAIAN_MANUAL'
  | 'STOCK_OPNAME_ADJUSTMENT';

export interface InventoryTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  type: InventoryTransactionType;
  referenceNo?: string; // No PO / No SPK / No Order
  skuId?: string;
  skuCode?: string;
  productName?: string;
  materialId?: string;
  materialName?: string;
  qtyChange: number; // Positive for in, negative for out
  unit: string;
  fromLocation: string;
  toLocation: string;
  pic: string;
  notes: string;
}

export interface StockOpnameRecord {
  id: string;
  opnameNumber: string;
  date: string;
  skuId: string;
  skuCode: string;
  productName: string;
  systemStock: number;
  physicalStock: number;
  discrepancy: number; // physicalStock - systemStock
  discrepancyValue: number; // discrepancy * hppFinal
  reason: string;
  status: 'draft' | 'approved' | 'rejected';
  auditorName: string;
}

export type SpkStatus = 'draft' | 'cutting' | 'sewing' | 'finishing_qc' | 'completed' | 'cancelled';

export interface ProductionPlan {
  id: string;
  spkNumber: string;
  title: string;
  skuId: string;
  skuCode: string;
  productName: string;
  targetQty: number;
  startDate: string;
  deadlineDate: string;
  tailorVendorName: string; // Nama Konveksi / Penjahit
  materialUsed: {
    materialId: string;
    materialName: string;
    qtyPlan: number;
    qtyActual: number;
    unit: string;
  }[];
  standardHpp: number;
  actualHpp: number;
  finishedGoodQty: number; // Hasil bagus lolos QC
  rejectQty: number; // Barang reject/cacat
  reworkQty: number; // Perlu permak
  status: SpkStatus;
  notes?: string;
  createdAt: string;
}

export type FinancialAccountType = 'kas_tunai' | 'bank_bca' | 'bank_mandiri' | 'bank_bri' | 'escrow_shopee' | 'escrow_tiktok' | 'escrow_tokopedia';

export interface FinancialAccount {
  id: string;
  name: string;
  type: FinancialAccountType;
  accountNumber?: string;
  holderName?: string;
  balance: number;
}

export type CashFlowCategory = 
  | 'PENJUALAN_MARKETPLACE_CAIR'
  | 'PENJUALAN_OFFLINE'
  | 'MODAL_TAMBAHAN'
  | 'PEMBAYARAN_PIUTANG'
  | 'PEMBELIAN_KAIN_BAHAN'
  | 'BIAYA_JAHIT_PRODUKSI'
  | 'GAJI_KARYAWAN'
  | 'MARKETING_ADS'
  | 'BIAYA_OPERASIONAL_LISTRIK_SEWA'
  | 'BIAYA_PACKAGING'
  | 'PEMBAYARAN_HUTANG'
  | 'PENARIKAN_OWNER_PRIVE'
  | 'BIAYA_LAINNYA';

export interface CashTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  type: 'in' | 'out';
  category: CashFlowCategory;
  amount: number;
  accountId: string;
  accountName: string;
  recipientOrSender: string;
  description: string;
  proofDocumentUrl?: string;
  referenceId?: string;
}

export interface DebtPayable {
  id: string;
  type: 'hutang' | 'piutang';
  referenceNo: string;
  entityName: string; // Supplier / Reseller / Rekanan
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'lunas' | 'belum_lunas' | 'jatuh_tempo';
  notes: string;
}

export interface SuratJalanItem {
  skuId: string;
  skuCode: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  unit: string;
  keterangan: string;
}

export interface SuratJalanPackageItem {
  orderId: string;
  orderNumber: string;
  channel: MarketplaceChannel;
  resiNumber: string;
  ekspedisi: string;
  customerName: string;
  destinationCity: string;
  totalQty: number;
  itemsSummary: string;
  packageWeightKg?: number;
  scanStatus: 'scanned' | 'pending_scan' | 'missing_alert';
  scannedAt?: string;
}

export type SuratJalanType = 'pengantaran_paket_marketplace' | 'distribusi_internal';

export interface SuratJalan {
  id: string;
  nomorSuratJalan: string;
  tipeSuratJalan: SuratJalanType; // 'pengantaran_paket_marketplace' vs 'distribusi_internal'
  date: string;
  time?: string;
  ekspedisi: string; // J&T, SiCepat, Shopee Xpress, Kurir Internal, dsb.
  noResi?: string;
  pengirim: {
    nama: string;
    gudang: string;
    telepon: string;
    alamat: string;
    signatureDataUrl?: string;
    signatureDate?: string;
  };
  penerima: {
    nama: string;
    tujuan: string; // Nama Toko / Reseller / Drop Point
    telepon: string;
    alamat: string;
    signatureDataUrl?: string;
    signatureDate?: string;
  };
  kendaraanDriver?: {
    namaSupir: string;
    platNomor: string;
    kurirPhone?: string;
  };
  items: SuratJalanItem[];
  packages?: SuratJalanPackageItem[];
  totalPcs: number;
  totalKoli?: number;
  catatan: string;
  status: 'draft' | 'dikirim' | 'diterima' | 'dibatalkan';
}
