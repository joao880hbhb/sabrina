import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserAccount,
  UserRole,
  UserSettings,
  StockAlert,
  ProductSKU,
  MarketplaceOrder,
  MaterialStock,
  InventoryTransaction,
  InventoryTransactionType,
  StockOpnameRecord,
  ProductionPlan,
  FinancialAccount,
  CashTransaction,
  DebtPayable,
  SuratJalan,
  ResiDeliveryStatus,
  TrackingCheckpoint,
  SuratJalanPackageItem,
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_MATERIALS,
  INITIAL_INVENTORY_TX,
  INITIAL_STOCK_OPNAME,
  INITIAL_PRODUCTION_PLANS,
  INITIAL_ACCOUNTS,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_DEBTS,
  INITIAL_SURAT_JALAN,
} from "../data/initialData";

interface AppContextType {
  currentUser: UserAccount;
  users: UserAccount[];
  switchUserRole: (role: UserRole) => void;
  loginWithEmailPassword: (
    email: string,
    password: string,
  ) => UserAccount | null;
  updateUserPermissions: (
    userId: string,
    permissions: UserAccount["permissions"],
  ) => void;
  updateUserPassword: (userId: string, password: string) => void;
  updateUserSettings: (userId: string, settings: Partial<UserSettings>) => void;
  addUser: (user: Omit<UserAccount, "id">) => void;

  // Products & HPP
  products: ProductSKU[];
  addProduct: (product: Omit<ProductSKU, "id" | "createdAt">) => void;
  updateProduct: (id: string, product: Partial<ProductSKU>) => void;
  updateProductMinStock: (id: string, minStockAlert: number) => void;
  deleteProduct: (id: string) => void;

  // Marketplace & Orders
  orders: MarketplaceOrder[];
  addOrder: (order: Omit<MarketplaceOrder, "id">) => void;
  updateOrder: (id: string, order: Partial<MarketplaceOrder>) => void;
  updateOrderTracking: (
    orderId: string,
    resiStatus: ResiDeliveryStatus,
    checkpoint?: TrackingCheckpoint,
  ) => void;
  processPayoutSettlement: (orderId: string, accountId: string) => void;
  processOrderReturn: (
    orderId: string,
    reason: string,
    restockToWarehouse: boolean,
  ) => void;
  importBatchOrders: (importedOrders: Omit<MarketplaceOrder, "id">[]) => void;

  // Inventory & Materials
  materials: MaterialStock[];
  inventoryTransactions: InventoryTransaction[];
  stockOpnames: StockOpnameRecord[];
  stockAlerts: StockAlert[];
  addMaterial: (mat: Omit<MaterialStock, "id" | "lastUpdated">) => void;
  updateMaterialStock: (
    id: string,
    changeQty: number,
    avgCost?: number,
  ) => void;
  recordInventoryTransaction: (
    tx: Omit<InventoryTransaction, "id" | "transactionNumber">,
  ) => void;
  processManualInventoryMovement: (movement: {
    type: InventoryTransactionType;
    skuId?: string;
    materialId?: string;
    qty: number;
    referenceNo?: string;
    fromLocation: string;
    toLocation: string;
    notes?: string;
  }) => void;
  recordStockMutation: (
    skuId: string,
    qty: number,
    from: string,
    to: string,
    notes: string,
  ) => void;
  createStockOpname: (
    opname: Omit<StockOpnameRecord, "id" | "opnameNumber">,
  ) => void;
  approveStockOpname: (id: string) => void;

  // Production & SPK
  productionPlans: ProductionPlan[];
  createProductionSPK: (
    plan: Omit<ProductionPlan, "id" | "spkNumber" | "createdAt">,
  ) => void;
  updateProductionStatus: (
    id: string,
    status: ProductionPlan["status"],
    finishedQty?: number,
    rejectQty?: number,
    reworkQty?: number,
    actualHpp?: number,
  ) => void;

  // Finance
  accounts: FinancialAccount[];
  cashTransactions: CashTransaction[];
  debts: DebtPayable[];
  addCashTransaction: (
    tx: Omit<CashTransaction, "id" | "transactionNumber">,
  ) => void;
  addDebtPayable: (debt: Omit<DebtPayable, "id">) => void;
  payDebt: (id: string, amount: number, accountId: string) => void;
  transferFunds: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string,
  ) => void;

  // Surat Jalan
  suratJalanList: SuratJalan[];
  createSuratJalan: (
    sj: Omit<SuratJalan, "id" | "nomorSuratJalan">,
  ) => SuratJalan;
  updateSuratJalanStatus: (id: string, status: SuratJalan["status"]) => void;
  updateSuratJalanSignatures: (
    id: string,
    pengirimSig?: string,
    kurirSig?: string,
    kurirName?: string,
    platNomor?: string,
    kurirPhone?: string,
  ) => void;
  updatePackageScanStatus: (
    suratJalanId: string,
    resiNumber: string,
    newStatus: "scanned" | "pending_scan" | "missing_alert",
  ) => void;
  createPackageDeliverySuratJalan: (data: {
    ekspedisi: string;
    driverName: string;
    platNomor: string;
    driverPhone?: string;
    packages: SuratJalanPackageItem[];
    pengirimSig?: string;
    kurirSig?: string;
    catatan?: string;
  }) => SuratJalan;

  // Global / Utility
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  resetToDemoData: () => void;
  exportAllDataJson: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = "sabhira_erp_v2_";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load state from localStorage or initialData
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((user: Partial<UserAccount>) => {
            const fallbackUser = INITIAL_USERS.find(
              (initialUser) =>
                initialUser.email.trim().toLowerCase() ===
                String(user.email ?? "")
                  .trim()
                  .toLowerCase(),
            );

            return {
              ...fallbackUser,
              ...user,
              password: user.password ?? fallbackUser?.password ?? "",
              permissions:
                user.permissions ??
                fallbackUser?.permissions ??
                INITIAL_USERS[0].permissions,
              settings:
                user.settings ??
                fallbackUser?.settings ??
                INITIAL_USERS[0].settings,
            } as UserAccount;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to parse users from localStorage", e);
    }
    return INITIAL_USERS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>("owner");
  const [activeNavTab, setActiveNavTab] = useState<string>("dashboard");

  const [products, setProducts] = useState<ProductSKU[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse products from localStorage", e);
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<MarketplaceOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse orders from localStorage", e);
    }
    return INITIAL_ORDERS;
  });

  const [materials, setMaterials] = useState<MaterialStock[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}materials`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse materials from localStorage", e);
    }
    return INITIAL_MATERIALS;
  });

  const [inventoryTransactions, setInventoryTransactions] = useState<
    InventoryTransaction[]
  >(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}inv_tx`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn(
        "Failed to parse inventoryTransactions from localStorage",
        e,
      );
    }
    return INITIAL_INVENTORY_TX;
  });

  const [stockOpnames, setStockOpnames] = useState<StockOpnameRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stock_opnames`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse stockOpnames from localStorage", e);
    }
    return INITIAL_STOCK_OPNAME;
  });

  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>(
    () => {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}production`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse productionPlans from localStorage", e);
      }
      return INITIAL_PRODUCTION_PLANS;
    },
  );

  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}accounts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse accounts from localStorage", e);
    }
    return INITIAL_ACCOUNTS;
  });

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(
    () => {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cash_tx`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse cashTransactions from localStorage", e);
      }
      return INITIAL_CASH_TRANSACTIONS;
    },
  );

  const [debts, setDebts] = useState<DebtPayable[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}debts`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse debts from localStorage", e);
    }
    return INITIAL_DEBTS;
  });

  const [suratJalanList, setSuratJalanList] = useState<SuratJalan[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}surat_jalan`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse suratJalanList from localStorage", e);
    }
    return INITIAL_SURAT_JALAN;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}products`,
      JSON.stringify(products),
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}materials`,
      JSON.stringify(materials),
    );
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}inv_tx`,
      JSON.stringify(inventoryTransactions),
    );
  }, [inventoryTransactions]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}stock_opnames`,
      JSON.stringify(stockOpnames),
    );
  }, [stockOpnames]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}production`,
      JSON.stringify(productionPlans),
    );
  }, [productionPlans]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}accounts`,
      JSON.stringify(accounts),
    );
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}cash_tx`,
      JSON.stringify(cashTransactions),
    );
  }, [cashTransactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}debts`, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}surat_jalan`,
      JSON.stringify(suratJalanList),
    );
  }, [suratJalanList]);

  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  const switchUserRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const loginWithEmailPassword = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const matchedUser = users.find((user) => {
      const savedPassword = user.password ?? "";
      return (
        user.email.trim().toLowerCase() === normalizedEmail &&
        savedPassword === password
      );
    });

    if (!matchedUser) {
      const fallbackUser = INITIAL_USERS.find(
        (initialUser) =>
          initialUser.email.trim().toLowerCase() === normalizedEmail &&
          initialUser.password === password,
      );

      if (!fallbackUser) {
        return null;
      }

      setCurrentRole(fallbackUser.role);
      return fallbackUser;
    }

    setCurrentRole(matchedUser.role);
    return matchedUser;
  };

  const updateUserPermissions = (
    userId: string,
    permissions: UserAccount["permissions"],
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions } : u)),
    );
  };

  const updateUserPassword = (userId: string, password: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, password: password || u.password } : u,
      ),
    );
  };

  const updateUserSettings = (
    userId: string,
    settingsUpdate: Partial<UserSettings>,
  ) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const currentSettings: UserSettings = u.settings || {
          defaultWarehouse: "Gudang Utama Pusat",
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
          minStockBufferPercent: 20,
          soundAlert: true,
          emailSummary: false,
          compactTableMode: false,
        };
        return {
          ...u,
          settings: {
            ...currentSettings,
            ...settingsUpdate,
            notifications: {
              ...currentSettings.notifications,
              ...(settingsUpdate.notifications || {}),
            },
          },
        };
      }),
    );
  };

  const addUser = (userData: Omit<UserAccount, "id">) => {
    const newUser: UserAccount = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
  };

  // Products logic
  const calculateHpp = (breakdown: ProductSKU["hppBreakdown"]): number => {
    return (
      breakdown.bahanKain +
      breakdown.cutting +
      breakdown.jahit +
      breakdown.obras +
      breakdown.sablonPrinting +
      breakdown.label +
      breakdown.hangtag +
      breakdown.packaging +
      breakdown.overhead
    );
  };

  const addProduct = (prodData: Omit<ProductSKU, "id" | "createdAt">) => {
    const hppFinal = calculateHpp(prodData.hppBreakdown);
    const marginRp = prodData.sellingPrice - hppFinal;
    const marginPercent =
      prodData.sellingPrice > 0 ? (marginRp / prodData.sellingPrice) * 100 : 0;

    const newProd: ProductSKU = {
      ...prodData,
      id: `prod-${Date.now()}`,
      hppFinal,
      marginRp,
      marginPercent,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updateData: Partial<ProductSKU>) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updateData };
        if (updateData.hppBreakdown || updateData.sellingPrice !== undefined) {
          merged.hppFinal = calculateHpp(merged.hppBreakdown);
          merged.marginRp = merged.sellingPrice - merged.hppFinal;
          merged.marginPercent =
            merged.sellingPrice > 0
              ? (merged.marginRp / merged.sellingPrice) * 100
              : 0;
        }
        return merged;
      }),
    );
  };

  const updateProductMinStock = (id: string, minStockAlert: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, minStockAlert: Math.max(0, minStockAlert) } : p,
      ),
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Marketplace & Orders
  const addOrder = (orderData: Omit<MarketplaceOrder, "id">) => {
    const newOrder: MarketplaceOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Automatically deduct inventory stock
    orderData.items.forEach((item) => {
      setProducts((prevProds) =>
        prevProds.map((p) => {
          if (p.id === item.skuId || p.sku === item.sku) {
            const newGudang = Math.max(0, p.stockGudang - item.quantity);
            return { ...p, stockGudang: newGudang };
          }
          return p;
        }),
      );
    });

    // Record inventory transaction
    const txNumber = `OUT-${Date.now().toString().slice(-6)}`;
    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: txNumber,
      date: new Date().toISOString().split("T")[0],
      type: "BARANG_KELUAR_PENJUALAN",
      referenceNo: orderData.orderNumber,
      qtyChange: -orderData.items.reduce((sum, i) => sum + i.quantity, 0),
      unit: "pcs",
      fromLocation: "Gudang Utama",
      toLocation: `Pelanggan Marketplace (${orderData.channel})`,
      pic: currentUser.name,
      notes: `Order ${orderData.orderNumber} via ${orderData.channel}`,
    };
    setInventoryTransactions((prev) => [tx, ...prev]);
  };

  const updateOrder = (id: string, updateData: Partial<MarketplaceOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updateData } : o)),
    );
  };

  const updateOrderTracking = (
    orderId: string,
    resiStatus: ResiDeliveryStatus,
    checkpoint?: TrackingCheckpoint,
  ) => {
    const nowStr = new Date().toISOString().replace("T", " ").slice(0, 16);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        const updatedHistory = checkpoint
          ? [...(o.trackingHistory || []), checkpoint]
          : o.trackingHistory;

        // sync orderStatus if delivered
        let newOrderStatus = o.orderStatus;
        if (resiStatus === "delivered" && o.orderStatus !== "completed") {
          newOrderStatus = "completed";
        } else if (
          (resiStatus === "in_transit" ||
            resiStatus === "out_for_delivery" ||
            resiStatus === "picked_up") &&
          o.orderStatus === "processing"
        ) {
          newOrderStatus = "shipped";
        }

        return {
          ...o,
          resiStatus,
          orderStatus: newOrderStatus,
          resiLastUpdate: nowStr,
          trackingHistory: updatedHistory,
        };
      }),
    );
  };

  const processPayoutSettlement = (orderId: string, accountId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.payoutStatus === "settled") return;

    const targetAccount =
      accounts.find((a) => a.id === accountId) || accounts[0];

    // Update order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              payoutStatus: "settled",
              payoutDate: new Date().toISOString().split("T")[0],
            }
          : o,
      ),
    );

    // Increase target bank balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === targetAccount.id
          ? {
              ...acc,
              balance: acc.balance + order.netPayout,
            }
          : acc,
      ),
    );

    // Add cash transaction
    const cashTx: CashTransaction = {
      id: `ctx-${Date.now()}`,
      transactionNumber: `KM-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      type: "in",
      category: "PENJUALAN_MARKETPLACE_CAIR",
      amount: order.netPayout,
      accountId: targetAccount.id,
      accountName: targetAccount.name,
      recipientOrSender: `${order.channel} Escrow Settlement`,
      description: `Pencairan dana pesanan #${order.orderNumber} (Net: Rp ${order.netPayout.toLocaleString("id-ID")})`,
      referenceId: order.id,
    };
    setCashTransactions((prev) => [cashTx, ...prev]);
  };

  const processOrderReturn = (
    orderId: string,
    reason: string,
    restockToWarehouse: boolean,
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: "returned",
              returnReason: reason,
              returnProcessed: true,
            }
          : o,
      ),
    );

    if (restockToWarehouse) {
      order.items.forEach((item) => {
        setProducts((prevProds) =>
          prevProds.map((p) => {
            if (p.id === item.skuId || p.sku === item.sku) {
              return { ...p, stockGudang: p.stockGudang + item.quantity };
            }
            return p;
          }),
        );
      });

      const tx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `RET-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        type: "RETUR_MASUK",
        referenceNo: order.orderNumber,
        qtyChange: order.items.reduce((s, i) => s + i.quantity, 0),
        unit: "pcs",
        fromLocation: `Customer Retur (${order.channel})`,
        toLocation: "Gudang Utama (Restock)",
        pic: currentUser.name,
        notes: `Retur pesanan: ${reason}`,
      };
      setInventoryTransactions((prev) => [tx, ...prev]);
    }
  };

  const importBatchOrders = (
    importedOrders: Omit<MarketplaceOrder, "id">[],
  ) => {
    const newItems: MarketplaceOrder[] = importedOrders.map((ord, idx) => ({
      ...ord,
      id: `ord-imp-${Date.now()}-${idx}`,
    }));
    setOrders((prev) => [...newItems, ...prev]);
  };

  // Materials & Inventory
  const addMaterial = (matData: Omit<MaterialStock, "id" | "lastUpdated">) => {
    const newMat: MaterialStock = {
      ...matData,
      id: `mat-${Date.now()}`,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const updateMaterialStock = (
    id: string,
    changeQty: number,
    avgCost?: number,
  ) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        return {
          ...m,
          currentStock: Math.max(0, m.currentStock + changeQty),
          avgCostPerUnit: avgCost !== undefined ? avgCost : m.avgCostPerUnit,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }),
    );
  };

  const recordInventoryTransaction = (
    txData: Omit<InventoryTransaction, "id" | "transactionNumber">,
  ) => {
    const newTx: InventoryTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      transactionNumber: `TX-${Date.now().toString().slice(-6)}`,
    };
    setInventoryTransactions((prev) => [newTx, ...prev]);
  };

  const recordStockMutation = (
    skuId: string,
    qty: number,
    from: string,
    to: string,
    notes: string,
  ) => {
    const product = products.find((p) => p.id === skuId);
    if (!product) return;

    if (
      from.toLowerCase().includes("gudang") &&
      to.toLowerCase().includes("marketplace")
    ) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === skuId
            ? {
                ...p,
                stockGudang: Math.max(0, p.stockGudang - qty),
                stockMarketplace: p.stockMarketplace + qty,
              }
            : p,
        ),
      );
    } else if (
      from.toLowerCase().includes("marketplace") &&
      to.toLowerCase().includes("gudang")
    ) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === skuId
            ? {
                ...p,
                stockMarketplace: Math.max(0, p.stockMarketplace - qty),
                stockGudang: p.stockGudang + qty,
              }
            : p,
        ),
      );
    }

    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `MUT-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      type: "MUTASI_GUDANG",
      skuId: product.id,
      skuCode: product.sku,
      productName: product.name,
      qtyChange: qty,
      unit: "pcs",
      fromLocation: from,
      toLocation: to,
      pic: currentUser.name,
      notes: notes || `Mutasi alokasi stok ${product.name}`,
    };
    setInventoryTransactions((prev) => [tx, ...prev]);
  };

  const createStockOpname = (
    opnameData: Omit<StockOpnameRecord, "id" | "opnameNumber">,
  ) => {
    const count = stockOpnames.length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
    const opnameNumber = `SO/${yearMonth}/${String(count).padStart(3, "0")}`;
    const newRecord: StockOpnameRecord = {
      ...opnameData,
      id: `so-${Date.now()}`,
      opnameNumber,
    };
    setStockOpnames((prev) => [newRecord, ...prev]);
  };

  const approveStockOpname = (id: string) => {
    const record = stockOpnames.find((r) => r.id === id);
    if (!record || record.status === "approved") return;

    // Adjust product stock to match physical count
    setProducts((prev) =>
      prev.map((p) =>
        p.id === record.skuId
          ? {
              ...p,
              stockGudang: record.physicalStock,
            }
          : p,
      ),
    );

    setStockOpnames((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
    );

    // Record adjustment transaction
    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      type: "STOCK_OPNAME_ADJUSTMENT",
      referenceNo: record.opnameNumber,
      skuId: record.skuId,
      skuCode: record.skuCode,
      productName: record.productName,
      qtyChange: record.discrepancy,
      unit: "pcs",
      fromLocation: "Stock Opname Audit",
      toLocation: "Penyesuaian Sistem Gudang",
      pic: currentUser.name,
      notes: `Penyesuaian stok opname: ${record.reason} (Selisih: ${record.discrepancy} pcs)`,
    };
    setInventoryTransactions((prev) => [tx, ...prev]);
  };

  const processManualInventoryMovement = (movement: {
    type: InventoryTransactionType;
    skuId?: string;
    materialId?: string;
    qty: number;
    referenceNo?: string;
    fromLocation: string;
    toLocation: string;
    notes?: string;
  }) => {
    const isProduct = !!movement.skuId;
    const prod = isProduct
      ? products.find((p) => p.id === movement.skuId)
      : undefined;
    const mat =
      !isProduct && movement.materialId
        ? materials.find((m) => m.id === movement.materialId)
        : undefined;

    let qtyChange = movement.qty;
    let unit = "pcs";

    if (isProduct && prod) {
      unit = "pcs";
      if (
        movement.type === "BARANG_MASUK_PRODUKSI" ||
        movement.type === "BARANG_MASUK_PEMBELIAN" ||
        movement.type === "RETUR_MASUK"
      ) {
        qtyChange = Math.abs(movement.qty);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id
              ? { ...p, stockGudang: p.stockGudang + qtyChange }
              : p,
          ),
        );
      } else if (
        movement.type === "BARANG_KELUAR_PENJUALAN" ||
        movement.type === "RETUR_REJECT"
      ) {
        qtyChange = -Math.abs(movement.qty);
        setProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id
              ? { ...p, stockGudang: Math.max(0, p.stockGudang + qtyChange) }
              : p,
          ),
        );
      } else if (movement.type === "MUTASI_GUDANG") {
        recordStockMutation(
          prod.id,
          movement.qty,
          movement.fromLocation,
          movement.toLocation,
          movement.notes || "",
        );
        return;
      }
    } else if (mat) {
      unit = mat.unit;
      if (
        movement.type === "PEMBELIAN_BAHAN" ||
        movement.type === "BARANG_MASUK_PEMBELIAN"
      ) {
        qtyChange = Math.abs(movement.qty);
        updateMaterialStock(mat.id, qtyChange);
      } else {
        qtyChange = -Math.abs(movement.qty);
        updateMaterialStock(mat.id, qtyChange);
      }
    }

    const txPrefix =
      movement.type.startsWith("BARANG_MASUK") ||
      movement.type === "PEMBELIAN_BAHAN"
        ? "IN"
        : movement.type === "RETUR_MASUK"
          ? "RET"
          : "OUT";

    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `${txPrefix}-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      type: movement.type,
      referenceNo:
        movement.referenceNo || `MANUAL-${Date.now().toString().slice(-4)}`,
      skuId: prod?.id,
      skuCode: prod?.sku,
      productName: prod?.name,
      materialId: mat?.id,
      materialName: mat?.name,
      qtyChange,
      unit,
      fromLocation: movement.fromLocation,
      toLocation: movement.toLocation,
      pic: currentUser.name,
      notes:
        movement.notes ||
        `Pencatatan pergerakan stok manual (${movement.type})`,
    };

    setInventoryTransactions((prev) => [tx, ...prev]);
  };

  // Compute real-time stock alerts for warehouse and owner
  const stockAlerts: StockAlert[] = [
    ...products.flatMap((p) => {
      const alerts: StockAlert[] = [];
      const buffer = p.minStockAlert * 1.25; // 25% safety buffer

      if (p.stockGudang === 0) {
        alerts.push({
          id: `alert-out-${p.id}`,
          type: "OUT_OF_STOCK",
          severity: "danger",
          skuId: p.id,
          skuCode: p.sku,
          productName: p.name,
          currentStock: p.stockGudang,
          minStockAlert: p.minStockAlert,
          message: `🚨 Stok HABIS (0 pcs)! Segera terbitkan SPK Produksi untuk ${p.name}.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          targetRoles: ["owner", "gudang", "produksi", "admin"],
        });
      } else if (p.stockGudang <= p.minStockAlert) {
        alerts.push({
          id: `alert-crit-${p.id}`,
          type: "CRITICAL_STOCK",
          severity: "danger",
          skuId: p.id,
          skuCode: p.sku,
          productName: p.name,
          currentStock: p.stockGudang,
          minStockAlert: p.minStockAlert,
          message: `⚠️ Stok KRITIS: Tersisa ${p.stockGudang} pcs (Batas Min: ${p.minStockAlert} pcs) pada ${p.name}.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          targetRoles: ["owner", "gudang", "produksi", "admin"],
        });
      } else if (p.stockGudang <= buffer) {
        alerts.push({
          id: `alert-appr-${p.id}`,
          type: "APPROACHING_MIN",
          severity: "warning",
          skuId: p.id,
          skuCode: p.sku,
          productName: p.name,
          currentStock: p.stockGudang,
          minStockAlert: p.minStockAlert,
          message: `⚡ Stok Mendekati Batas Minimum: ${p.stockGudang} pcs (Buffer: ${Math.round(buffer)} pcs). Persiapkan kain & penjahit.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          targetRoles: ["owner", "gudang", "produksi"],
        });
      }
      return alerts;
    }),
    ...materials.flatMap((m) => {
      const alerts: StockAlert[] = [];
      if (m.currentStock <= m.minStock) {
        alerts.push({
          id: `alert-mat-${m.id}`,
          type: "CRITICAL_STOCK",
          severity: "warning",
          productName: m.name,
          currentStock: m.currentStock,
          minStockAlert: m.minStock,
          message: `🧵 Bahan Baku Kritis: ${m.name} tersisa ${m.currentStock} ${m.unit} (Min: ${m.minStock} ${m.unit}). Order ke supplier segera!`,
          timestamp: new Date().toISOString(),
          isRead: false,
          targetRoles: ["owner", "produksi", "gudang"],
        });
      }
      return alerts;
    }),
  ];

  // Production & SPK
  const createProductionSPK = (
    planData: Omit<ProductionPlan, "id" | "spkNumber" | "createdAt">,
  ) => {
    const count = productionPlans.length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
    const spkNumber = `SPK/SBH/${yearMonth}/${String(count).padStart(3, "0")}`;

    const newPlan: ProductionPlan = {
      ...planData,
      id: `spk-${Date.now()}`,
      spkNumber,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProductionPlans((prev) => [newPlan, ...prev]);

    // Deduct raw materials based on qty plan
    planData.materialUsed.forEach((mat) => {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === mat.materialId
            ? {
                ...m,
                currentStock: Math.max(0, m.currentStock - mat.qtyPlan),
              }
            : m,
        ),
      );
    });
  };

  const updateProductionStatus = (
    id: string,
    status: ProductionPlan["status"],
    finishedQty?: number,
    rejectQty?: number,
    reworkQty?: number,
    actualHpp?: number,
  ) => {
    const plan = productionPlans.find((p) => p.id === id);
    if (!plan) return;

    const finalFinished =
      finishedQty !== undefined ? finishedQty : plan.finishedGoodQty;
    const finalReject = rejectQty !== undefined ? rejectQty : plan.rejectQty;
    const finalRework = reworkQty !== undefined ? reworkQty : plan.reworkQty;
    const finalHpp = actualHpp !== undefined ? actualHpp : plan.actualHpp;

    setProductionPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              finishedGoodQty: finalFinished,
              rejectQty: finalReject,
              reworkQty: finalRework,
              actualHpp: finalHpp,
            }
          : p,
      ),
    );

    // If completed, add finished goods to product inventory
    if (
      status === "completed" &&
      plan.status !== "completed" &&
      finalFinished > 0
    ) {
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === plan.skuId
            ? {
                ...prod,
                stockGudang: prod.stockGudang + finalFinished,
              }
            : prod,
        ),
      );

      const tx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        transactionNumber: `PROD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split("T")[0],
        type: "BARANG_MASUK_PRODUKSI",
        referenceNo: plan.spkNumber,
        skuId: plan.skuId,
        skuCode: plan.skuCode,
        productName: plan.productName,
        qtyChange: finalFinished,
        unit: "pcs",
        fromLocation: `Konveksi (${plan.tailorVendorName})`,
        toLocation: "Gudang Utama Produk Jadi",
        pic: currentUser.name,
        notes: `Hasil produksi selesai SPK ${plan.spkNumber} (QC Lolos: ${finalFinished} pcs, Reject: ${finalReject} pcs)`,
      };
      setInventoryTransactions((prev) => [tx, ...prev]);
    }
  };

  // Finance
  const addCashTransaction = (
    txData: Omit<CashTransaction, "id" | "transactionNumber">,
  ) => {
    const isIncome = txData.type === "in";
    const prefix = isIncome ? "KM" : "KK";
    const txNumber = `${prefix}-${Date.now().toString().slice(-6)}`;

    const newTx: CashTransaction = {
      ...txData,
      id: `ctx-${Date.now()}`,
      transactionNumber: txNumber,
    };
    setCashTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.accountId) {
          return {
            ...acc,
            balance: isIncome
              ? acc.balance + txData.amount
              : acc.balance - txData.amount,
          };
        }
        return acc;
      }),
    );
  };

  const addDebtPayable = (debtData: Omit<DebtPayable, "id">) => {
    const newDebt: DebtPayable = {
      ...debtData,
      id: `debt-${Date.now()}`,
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const payDebt = (id: string, amount: number, accountId: string) => {
    const debt = debts.find((d) => d.id === id);
    const account = accounts.find((a) => a.id === accountId) || accounts[0];
    if (!debt) return;

    const newPaid = debt.paidAmount + amount;
    const newRemaining = Math.max(0, debt.totalAmount - newPaid);
    const newStatus = newRemaining === 0 ? "lunas" : "belum_lunas";

    setDebts((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              paidAmount: newPaid,
              remainingAmount: newRemaining,
              status: newStatus,
            }
          : d,
      ),
    );

    // Record cash transaction
    const isHutang = debt.type === "hutang";
    const cashTx: CashTransaction = {
      id: `ctx-${Date.now()}`,
      transactionNumber: isHutang
        ? `KK-${Date.now().toString().slice(-6)}`
        : `KM-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split("T")[0],
      type: isHutang ? "out" : "in",
      category: isHutang ? "PEMBAYARAN_HUTANG" : "PEMBAYARAN_PIUTANG",
      amount,
      accountId: account.id,
      accountName: account.name,
      recipientOrSender: debt.entityName,
      description: `${isHutang ? "Pembayaran hutang" : "Penerimaan piutang"} ref: ${debt.referenceNo} (Sisa: Rp ${newRemaining.toLocaleString("id-ID")})`,
    };
    setCashTransactions((prev) => [cashTx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id
          ? {
              ...a,
              balance: isHutang ? a.balance - amount : a.balance + amount,
            }
          : a,
      ),
    );
  };

  const transferFunds = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    notes?: string,
  ) => {
    if (amount <= 0 || fromAccountId === toAccountId) return;
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc) return;

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === fromAccountId)
          return { ...a, balance: a.balance - amount };
        if (a.id === toAccountId) return { ...a, balance: a.balance + amount };
        return a;
      }),
    );

    const dateStr = new Date().toISOString().split("T")[0];
    const txOut: CashTransaction = {
      id: `ctx-${Date.now()}-out`,
      transactionNumber: `KK-TRF-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      type: "out",
      category: "BIAYA_LAINNYA",
      amount,
      accountId: fromAccountId,
      accountName: fromAcc.name,
      recipientOrSender: toAcc.name,
      description: `Transfer keluar ke ${toAcc.name}: ${notes || "Pemindahan dana internal"}`,
    };

    const txIn: CashTransaction = {
      id: `ctx-${Date.now()}-in`,
      transactionNumber: `KM-TRF-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      type: "in",
      category: "MODAL_TAMBAHAN",
      amount,
      accountId: toAccountId,
      accountName: toAcc.name,
      recipientOrSender: fromAcc.name,
      description: `Transfer masuk dari ${fromAcc.name}: ${notes || "Pemindahan dana internal"}`,
    };

    setCashTransactions((prev) => [txIn, txOut, ...prev]);
  };

  // Surat Jalan
  const createSuratJalan = (
    sjData: Omit<SuratJalan, "id" | "nomorSuratJalan">,
  ): SuratJalan => {
    const count = suratJalanList.length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
    const nomorSuratJalan = `SJ/SBH/${yearMonth}/${String(count).padStart(3, "0")}`;

    const newSJ: SuratJalan = {
      ...sjData,
      id: `sj-${Date.now()}`,
      nomorSuratJalan,
    };
    setSuratJalanList((prev) => [newSJ, ...prev]);

    // Record inventory transaction
    const tx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `SJTX-${Date.now().toString().slice(-6)}`,
      date: sjData.date,
      type: "MUTASI_GUDANG",
      referenceNo: nomorSuratJalan,
      qtyChange: -sjData.totalPcs,
      unit: "pcs",
      fromLocation: sjData.pengirim.gudang,
      toLocation: `${sjData.penerima.tujuan} (${sjData.ekspedisi})`,
      pic: sjData.pengirim.nama,
      notes: `Pengiriman barang Surat Jalan ${nomorSuratJalan} (${sjData.totalPcs} pcs)`,
    };
    setInventoryTransactions((prev) => [tx, ...prev]);

    return newSJ;
  };

  const updateSuratJalanStatus = (id: string, status: SuratJalan["status"]) => {
    setSuratJalanList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  };

  const createPackageDeliverySuratJalan = (data: {
    ekspedisi: string;
    driverName: string;
    platNomor: string;
    driverPhone?: string;
    packages: SuratJalanPackageItem[];
    pengirimSig?: string;
    kurirSig?: string;
    catatan?: string;
  }): SuratJalan => {
    const count =
      suratJalanList.filter(
        (s) => s.tipeSuratJalan === "pengantaran_paket_marketplace",
      ).length + 1;
    const yearMonth = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const ekspPrefix = data.ekspedisi.includes("Shopee")
      ? "SPX"
      : data.ekspedisi.includes("J&T")
        ? "JNT"
        : data.ekspedisi.includes("SiCepat")
          ? "SCP"
          : data.ekspedisi.includes("JNE")
            ? "JNE"
            : "EXP";
    const nomorSuratJalan = `SJP/${ekspPrefix}/${yearMonth}/${String(count).padStart(3, "0")}`;
    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";
    const totalPcs = data.packages.reduce((sum, p) => sum + p.totalQty, 0);

    const newSJ: SuratJalan = {
      id: `sjp-${Date.now()}`,
      nomorSuratJalan,
      tipeSuratJalan: "pengantaran_paket_marketplace",
      date: dateStr,
      time: timeStr,
      ekspedisi: data.ekspedisi,
      pengirim: {
        nama: currentUser.name || "Admin Gudang Sabhira",
        gudang: "Gudang Pusat Sabhira Fashion Bandung",
        telepon: "0812-8899-0001",
        alamat: "Jl. R.E. Martadinata No. 128, Bandung, Jawa Barat",
        signatureDataUrl: data.pengirimSig,
        signatureDate: `${dateStr} ${timeStr}`,
      },
      penerima: {
        nama: data.driverName,
        tujuan: `Drop Point / Hub ${data.ekspedisi}`,
        telepon: data.driverPhone || "-",
        alamat: `Fasilitas Logistik ${data.ekspedisi}`,
        signatureDataUrl: data.kurirSig,
        signatureDate: `${dateStr} ${timeStr}`,
      },
      kendaraanDriver: {
        namaSupir: data.driverName,
        platNomor: data.platNomor,
        kurirPhone: data.driverPhone,
      },
      items: [],
      packages: data.packages,
      totalPcs,
      totalKoli: data.packages.length,
      catatan:
        data.catatan ||
        `Manifest serah terima ${data.packages.length} paket ke kurir ${data.ekspedisi}. Bukti serah terima sah.`,
      status: "dikirim",
    };

    setSuratJalanList((prev) => [newSJ, ...prev]);

    // Update each order in this manifest with suratJalanNomor and set resiStatus to 'picked_up'
    const orderIds = data.packages.map((p) => p.orderId);
    setOrders((prev) =>
      prev.map((o) => {
        if (orderIds.includes(o.id)) {
          const checkpt: TrackingCheckpoint = {
            timestamp: `${dateStr} ${timeStr}`,
            location: "Gudang Pusat Sabhira (Bandung)",
            status: "picked_up",
            title: `Paket Telah Diserahterimakan ke Kurir ${data.ekspedisi}`,
            description: `Diserahkan ke driver [${data.driverName}] dengan Surat Jalan ${nomorSuratJalan}. Bukti tanda tangan digital tersimpan.`,
            courierOrHub: `Driver: ${data.driverName} (${data.platNomor})`,
          };

          return {
            ...o,
            suratJalanNomor: nomorSuratJalan,
            suratJalanId: newSJ.id,
            orderStatus:
              o.orderStatus === "processing" ? "shipped" : o.orderStatus,
            resiStatus:
              o.resiStatus === "pending_pickup" || !o.resiStatus
                ? "picked_up"
                : o.resiStatus,
            resiLastUpdate: `${dateStr} ${timeStr}`,
            trackingHistory: [...(o.trackingHistory || []), checkpt],
          };
        }
        return o;
      }),
    );

    return newSJ;
  };

  const updateSuratJalanSignatures = (
    id: string,
    pengirimSig?: string,
    kurirSig?: string,
    kurirName?: string,
    platNomor?: string,
    kurirPhone?: string,
  ) => {
    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    setSuratJalanList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          pengirim: {
            ...s.pengirim,
            signatureDataUrl:
              pengirimSig !== undefined
                ? pengirimSig
                : s.pengirim.signatureDataUrl,
            signatureDate: pengirimSig
              ? `${dateStr} ${timeStr}`
              : s.pengirim.signatureDate,
          },
          penerima: {
            ...s.penerima,
            nama: kurirName || s.penerima.nama,
            signatureDataUrl:
              kurirSig !== undefined ? kurirSig : s.penerima.signatureDataUrl,
            signatureDate: kurirSig
              ? `${dateStr} ${timeStr}`
              : s.penerima.signatureDate,
          },
          kendaraanDriver: s.kendaraanDriver
            ? {
                ...s.kendaraanDriver,
                namaSupir: kurirName || s.kendaraanDriver.namaSupir,
                platNomor: platNomor || s.kendaraanDriver.platNomor,
                kurirPhone: kurirPhone || s.kendaraanDriver.kurirPhone,
              }
            : kurirName || platNomor
              ? {
                  namaSupir: kurirName || "",
                  platNomor: platNomor || "",
                  kurirPhone,
                }
              : undefined,
        };
      }),
    );
  };

  const updatePackageScanStatus = (
    suratJalanId: string,
    resiNumber: string,
    newStatus: "scanned" | "pending_scan" | "missing_alert",
  ) => {
    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr =
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB";

    setSuratJalanList((prev) =>
      prev.map((s) => {
        if (s.id !== suratJalanId || !s.packages) return s;
        return {
          ...s,
          packages: s.packages.map((p) => {
            if (p.resiNumber === resiNumber) {
              return {
                ...p,
                scanStatus: newStatus,
                scannedAt:
                  newStatus === "scanned"
                    ? `${dateStr} ${timeStr}`
                    : p.scannedAt,
              };
            }
            return p;
          }),
        };
      }),
    );

    // If marked as missing_alert, update order resiStatus as well!
    setOrders((prev) =>
      prev.map((o) => {
        if (o.resiNumber === resiNumber) {
          if (newStatus === "missing_alert") {
            return {
              ...o,
              resiStatus: "lost_or_unscanned",
              resiLastUpdate: `${dateStr} ${timeStr}`,
            };
          } else if (
            newStatus === "scanned" &&
            o.resiStatus === "lost_or_unscanned"
          ) {
            return {
              ...o,
              resiStatus: "in_transit",
              resiLastUpdate: `${dateStr} ${timeStr}`,
            };
          }
        }
        return o;
      }),
    );
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setMaterials(INITIAL_MATERIALS);
    setInventoryTransactions(INITIAL_INVENTORY_TX);
    setStockOpnames(INITIAL_STOCK_OPNAME);
    setProductionPlans(INITIAL_PRODUCTION_PLANS);
    setAccounts(INITIAL_ACCOUNTS);
    setCashTransactions(INITIAL_CASH_TRANSACTIONS);
    setDebts(INITIAL_DEBTS);
    setSuratJalanList(INITIAL_SURAT_JALAN);
    setCurrentRole("owner");
    setActiveNavTab("dashboard");
  };

  const exportAllDataJson = () => {
    const fullData = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      appName: "SABHIRA FINANCE & ERP",
      users,
      products,
      orders,
      materials,
      inventoryTransactions,
      stockOpnames,
      productionPlans,
      accounts,
      cashTransactions,
      debts,
      suratJalanList,
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SABHIRA_BACKUP_ERP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUserRole,
        loginWithEmailPassword,
        updateUserPermissions,
        updateUserPassword,
        updateUserSettings,
        addUser,
        products,
        addProduct,
        updateProduct,
        updateProductMinStock,
        deleteProduct,
        orders,
        addOrder,
        updateOrder,
        updateOrderTracking,
        processPayoutSettlement,
        processOrderReturn,
        importBatchOrders,
        materials,
        inventoryTransactions,
        stockOpnames,
        stockAlerts,
        addMaterial,
        updateMaterialStock,
        recordInventoryTransaction,
        processManualInventoryMovement,
        recordStockMutation,
        createStockOpname,
        approveStockOpname,
        productionPlans,
        createProductionSPK,
        updateProductionStatus,
        accounts,
        cashTransactions,
        debts,
        addCashTransaction,
        addDebtPayable,
        payDebt,
        transferFunds,
        suratJalanList,
        createSuratJalan,
        updateSuratJalanStatus,
        updateSuratJalanSignatures,
        updatePackageScanStatus,
        createPackageDeliverySuratJalan,
        activeNavTab,
        setActiveNavTab,
        resetToDemoData,
        exportAllDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
