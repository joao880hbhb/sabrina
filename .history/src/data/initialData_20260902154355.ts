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
  SuratJalan,
} from "../types";

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "user-1",
    name: "Hj. Sabhira Azzahra",
    email: "owner@sabhirafashion.id",
    password: "owner123",
    role: "owner",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "0812-8899-0001",
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
      defaultWarehouse: "Semua Gudang (Konsolidasi)",
      defaultView: "dashboard",
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
    },
  },
  {
    id: "user-2",
    name: "Rian Syahputra, S.Ak.",
    email: "finance@sabhirafashion.id",
    password: "finance123",
    role: "finance",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "0813-2211-9988",
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
      defaultWarehouse: "Gudang Utama Pusat",
      defaultView: "finance",
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
    },
  },
  {
    id: "user-3",
    name: "Nabila Putri (Admin Marketplace)",
    email: "admin@sabhirafashion.id",
    password: "admin123",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    phone: "0857-4433-2211",
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
      defaultWarehouse: "Alokasi Stok Marketplace & Live Stream",
      defaultView: "marketplace",
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
    },
  },
  {
    id: "user-4",
    name: "Pak Budi Santoso (Kepala Gudang)",
    email: "gudang@sabhirafashion.id",
    password: "gudang123",
    role: "gudang",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    phone: "0819-7788-6655",
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
      defaultWarehouse: "Gudang Utama Produk Jadi (Bandung)",
      defaultView: "inventory",
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
    },
  },
  {
    id: "user-5",
    name: "Kang Asep (Kepala Produksi & Cutting)",
    email: "produksi@sabhirafashion.id",
    password: "produksi123",
    role: "produksi",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "0878-1122-3344",
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
      defaultWarehouse: "Gudang Bahan Baku & Workshop Cutting",
      defaultView: "production",
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
    },
  },
  {
    id: "user-6",
    name: "Dinda Lestari (Digital Marketing & Live)",
    email: "marketing@sabhirafashion.id",
    password: "marketing123",
    role: "marketing",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    phone: "0821-6677-8899",
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
      defaultWarehouse: "Alokasi Stok Live Streaming TikTok & Shopee",
      defaultView: "dashboard",
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
    },
  },
];

export const INITIAL_PRODUCTS: ProductSKU[] = [];

export const INITIAL_ORDERS: MarketplaceOrder[] = [];

export const INITIAL_MATERIALS: MaterialStock[] = [];

export const INITIAL_INVENTORY_TX: InventoryTransaction[] = [];

export const INITIAL_STOCK_OPNAME: StockOpnameRecord[] = [];

export const INITIAL_PRODUCTION_PLANS: ProductionPlan[] = [];

export const INITIAL_ACCOUNTS: FinancialAccount[] = [];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [];

export const INITIAL_DEBTS: DebtPayable[] = [];

export const INITIAL_SURAT_JALAN: SuratJalan[] = [];
