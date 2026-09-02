import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { CashTransaction, DebtPayable } from "../../types";
import * as XLSX from "xlsx";
import {
  Wallet,
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Calendar,
  FileText,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

export const FinanceManager: React.FC = () => {
  const {
    accounts = [],
    cashTransactions = [],
    debts = [],
    orders = [],
    products = [],
    addCashTransaction,
    transferFunds,
    addDebtPayable,
    payDebt,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "cashbook" | "debt" | "profitloss" | "cashflow"
  >("cashbook");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showSettleDebtModal, setShowSettleDebtModal] =
    useState<DebtPayable | null>(null);

  const baseCategoryOptions = [
    {
      value: "BIAYA_OPERASIONAL_LISTRIK_SEWA",
      label: "Beban Operasional & Listrik",
    },
    { value: "GAJI_KARYAWAN", label: "Beban Gaji Karyawan" },
    { value: "MARKETING_ADS", label: "Beban Iklan Ads (Meta & TikTok)" },
    {
      value: "PEMBELIAN_KAIN_BAHAN",
      label: "Pembelian Bahan Kain / Aksesoris",
    },
    { value: "BIAYA_JAHIT_PRODUKSI", label: "Ongkos Jahit / SPK Produksi" },
    { value: "PENJUALAN_OFFLINE", label: "Penjualan Offline / WhatsApp" },
    {
      value: "PENJUALAN_MARKETPLACE_CAIR",
      label: "Pencairan Dana Marketplace",
    },
    { value: "BIAYA_LAINNYA", label: "Lain-lain" },
  ];

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("sabhira_custom_cash_categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customCategoryInput, setCustomCategoryInput] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "sabhira_custom_cash_categories",
      JSON.stringify(customCategories),
    );
  }, [customCategories]);

  const categoryOptions = [
    ...baseCategoryOptions,
    ...customCategories.map((category) => ({
      value: category,
      label: category,
    })),
  ];

  const handleAddCustomCategory = () => {
    const normalized = customCategoryInput.trim();
    if (!normalized) return;

    const uniqueValue = normalized.replace(/\s+/g, " ");
    if (customCategories.includes(uniqueValue)) {
      setTxForm((prev) => ({ ...prev, category: uniqueValue }));
      setCustomCategoryInput("");
      return;
    }

    setCustomCategories((prev) => [...prev, uniqueValue]);
    setTxForm((prev) => ({ ...prev, category: uniqueValue }));
    setCustomCategoryInput("");
  };

  // New Transaction Form State
  const [txForm, setTxForm] = useState<{
    type: "in" | "out";
    accountId: string;
    category: CashTransaction["category"];
    amount: number;
    description: string;
    counterparty: string;
  }>({
    type: "out",
    accountId: accounts[0]?.id || "",
    category: "BIAYA_OPERASIONAL_LISTRIK_SEWA",
    amount: 500000,
    description: "Biaya operasional kantor & packing sabhira",
    counterparty: "Toko Perlengkapan",
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    fromAccountId: accounts[0]?.id || "",
    toAccountId: accounts[1]?.id || "",
    amount: 1000000,
    notes: "Pemindahan dana operasional harian",
  });

  // Debt Form State
  const [debtForm, setDebtForm] = useState<{
    type: "hutang" | "piutang";
    partyName: string;
    amount: number;
    dueDate: string;
    notes: string;
  }>({
    type: "hutang",
    partyName: "PT Mega Textile Bandung",
    amount: 15000000,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: "Pembelian kain katun rayon 500 meter termin 14 hari",
  });

  // Settle Debt Form State
  const [settleAccount, setSettleAccount] = useState(accounts[0]?.id || "");
  const [settleAmount, setSettleAmount] = useState(0);

  // Filtered Cash Transactions
  const filteredTxs = (cashTransactions || []).filter((tx) => {
    const matchAcc =
      selectedAccountId === "all" || tx.accountId === selectedAccountId;
    const matchSearch =
      (tx.description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tx.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.recipientOrSender &&
        tx.recipientOrSender.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchAcc && matchSearch;
  });

  // Financial Calculations for P&L Statement
  const totalOmzetGross = (orders || []).reduce(
    (s, o) => s + (o.grossAmount || 0),
    0,
  );
  const totalHppSold = (orders || []).reduce(
    (s, o) =>
      s +
      (o.items || []).reduce(
        (is, i) => is + (i.unitHpp || 0) * (i.quantity || 0),
        0,
      ),
    0,
  );
  const totalGrossProfit = totalOmzetGross - totalHppSold;

  const totalMarketplaceAdmin = (orders || []).reduce(
    (s, o) => s + (o.adminFee || 0),
    0,
  );
  const totalVoucherPromo = (orders || []).reduce(
    (s, o) =>
      s +
      (o.voucherAmount || 0) +
      (o.discountAmount || 0) +
      (o.shippingSubsidy || 0),
    0,
  );

  // Operational Expenses from Cashbook
  const expenseOps = (cashTransactions || [])
    .filter(
      (t) =>
        (t.type === "out" || (t.type as string) === "OUT") &&
        (t.category === "BIAYA_OPERASIONAL_LISTRIK_SEWA" ||
          (t.category as string) === "BEBAN_OPERASIONAL"),
    )
    .reduce((s, t) => s + t.amount, 0);
  const expenseSalary = (cashTransactions || [])
    .filter(
      (t) =>
        (t.type === "out" || (t.type as string) === "OUT") &&
        (t.category === "GAJI_KARYAWAN" ||
          (t.category as string) === "BEBAN_GAJI"),
    )
    .reduce((s, t) => s + t.amount, 0);
  const expenseAds = (cashTransactions || [])
    .filter(
      (t) =>
        (t.type === "out" || (t.type as string) === "OUT") &&
        (t.category === "MARKETING_ADS" ||
          (t.category as string) === "BEBAN_IKLAN_ADS"),
    )
    .reduce((s, t) => s + t.amount, 0);
  const expenseFabric = (cashTransactions || [])
    .filter(
      (t) =>
        (t.type === "out" || (t.type as string) === "OUT") &&
        (t.category === "PEMBELIAN_KAIN_BAHAN" ||
          (t.category as string) === "PEMBELIAN_BAHAN"),
    )
    .reduce((s, t) => s + t.amount, 0);
  const expenseSewing = (cashTransactions || [])
    .filter(
      (t) =>
        (t.type === "out" || (t.type as string) === "OUT") &&
        (t.category === "BIAYA_JAHIT_PRODUKSI" ||
          (t.category as string) === "ONGKOS_JAHIT_PRODUKSI"),
    )
    .reduce((s, t) => s + t.amount, 0);

  const totalOperatingExpenses = expenseOps + expenseSalary + expenseAds;
  const netProfitFinal =
    totalGrossProfit -
    totalMarketplaceAdmin -
    totalVoucherPromo -
    totalOperatingExpenses;

  // Total Account Balances
  const totalLiquidCash = (accounts || []).reduce(
    (s, a) => s + (a.balance || 0),
    0,
  );

  // Total Debts & Receivables
  const totalHutangUsaha = (debts || [])
    .filter((d) => d.type === "hutang" || (d.type as string) === "HUTANG_KITA")
    .reduce((s, d) => s + (d.remainingAmount || 0), 0);
  const totalPiutangUsaha = (debts || [])
    .filter(
      (d) => d.type === "piutang" || (d.type as string) === "PIUTANG_CUSTOMER",
    )
    .reduce((s, d) => s + (d.remainingAmount || 0), 0);

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txForm.amount <= 0) {
      alert("Nominal transaksi harus lebih dari 0!");
      return;
    }

    const targetAcc =
      accounts.find((a) => a.id === txForm.accountId) || accounts[0];

    addCashTransaction({
      date: new Date().toISOString(),
      accountId: txForm.accountId || targetAcc?.id || "acc-1",
      accountName: targetAcc?.name || "Kas Utama",
      type: txForm.type,
      category: txForm.category,
      amount: txForm.amount,
      description: txForm.description,
      recipientOrSender: txForm.counterparty,
    });

    setShowAddTxModal(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferForm.fromAccountId === transferForm.toAccountId) {
      alert("Rekening asal dan tujuan tidak boleh sama!");
      return;
    }
    transferFunds(
      transferForm.fromAccountId,
      transferForm.toAccountId,
      transferForm.amount,
      transferForm.notes,
    );
    setShowTransferModal(false);
    alert("Transfer dana antar rekening berhasil!");
  };

  const handleAddDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = debts.length + 1;
    const refNo = `${debtForm.type === "hutang" ? "HUT" : "PIU"}/SBH/${Date.now().toString().slice(-4)}`;

    addDebtPayable({
      type: debtForm.type,
      referenceNo: refNo,
      entityName: debtForm.partyName,
      totalAmount: debtForm.amount,
      paidAmount: 0,
      remainingAmount: debtForm.amount,
      dueDate: debtForm.dueDate,
      status: "belum_lunas",
      notes: debtForm.notes,
    });
    setShowAddDebtModal(false);
    alert("Catatan hutang/piutang berhasil disimpan!");
  };

  const handleSettleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSettleDebtModal || settleAmount <= 0) return;

    payDebt(
      showSettleDebtModal.id,
      settleAmount,
      settleAccount || accounts[0]?.id || "acc-1",
    );
    setShowSettleDebtModal(null);
    alert("Pembayaran cicilan/pelunasan berhasil dicatat di buku kas!");
  };

  const exportCashbookToExcel = () => {
    const exportData = filteredTxs.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      return {
        Tanggal: (t.date || "").split("T")[0],
        "Rekening / Kas": acc?.name || t.accountName || "Kas",
        "Tipe Aliran":
          t.type === "in" || (t.type as string) === "IN"
            ? "Kas Masuk"
            : "Kas Keluar",
        Kategori: t.category,
        "Nominal (Rp)": t.amount,
        Keterangan: t.description,
        "Pihak Terkait": t.recipientOrSender || "-",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Kas Sabhira");
    XLSX.writeFile(
      wb,
      `Buku_Kas_Sabhira_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
              Financial Control
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Keuangan, Buku Kas & Laba Rugi (P&L)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Arus kas riil, pelunasan hutang supplier kain, piutang reseller,
            serta kalkulasi otomatis Laba Kotor & Laba Bersih.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-600" />
            <span>Transfer Kas/Bank</span>
          </button>

          <button
            onClick={exportCashbookToExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setShowAddTxModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Kas Masuk/Keluar</span>
          </button>
        </div>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                {acc.type.replace("_", " ")}
              </span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">
                {acc.name}
              </p>
              {acc.accountNumber && (
                <p className="text-[10px] text-slate-500 font-mono">
                  {acc.accountNumber}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm sm:text-base font-black text-slate-900 font-mono">
                Rp {acc.balance.toLocaleString("id-ID")}
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Aktif
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveTab("cashbook")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "cashbook"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Buku Kas & Riwayat Transaksi ({cashTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profitloss")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "profitloss"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Laporan Laba Rugi (P&L) Realtime</span>
        </button>

        <button
          onClick={() => setActiveTab("debt")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "debt"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Hutang Supplier & Piutang ({debts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("cashflow")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === "cashflow"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Arus Kas (Cash Flow Summary)</span>
        </button>
      </div>

      {/* Tab 1: Buku Kas */}
      {activeTab === "cashbook" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi, penerima, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium"
              >
                <option value="all">Semua Rekening & Kas</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-3">Rekening Bank</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Keterangan / Transaksi</th>
                  <th className="py-3 px-3">Pihak Terkait</th>
                  <th className="py-3 px-4 text-right">Nominal Arus Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxs.map((tx) => {
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-mono text-slate-900 font-bold">
                          {tx.date.split("T")[0]}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {tx.date.split("T")[1]?.slice(0, 5) || ""}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {acc?.name || "Kas Utama"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {tx.category.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {tx.counterparty || "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm">
                        <span
                          className={
                            tx.type === "IN"
                              ? "text-emerald-700"
                              : "text-rose-700"
                          }
                        >
                          {tx.type === "IN" ? "+" : "-"} Rp{" "}
                          {tx.amount.toLocaleString("id-ID")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Laporan Laba Rugi (P&L) */}
      {activeTab === "profitloss" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
              Laporan Keuangan Komprehensif
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Laporan Laba Rugi (Profit & Loss Statement)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Periode Berjalan • SABHIRA FINANCE & ERP
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Section 1: Pendapatan */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase text-xs">
                1. Pendapatan Penjualan (Revenue)
              </h3>
              <div className="flex justify-between text-slate-700 pl-3">
                <span>Omzet Penjualan Bruto ({orders.length} pesanan):</span>
                <strong className="font-mono text-sm">
                  Rp {totalOmzetGross.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>

            {/* Section 2: HPP (Cost of Goods Sold) */}
            <div className="bg-amber-50/60 p-4 rounded-xl space-y-2 border border-amber-200">
              <h3 className="font-bold text-amber-950 uppercase text-xs">
                2. Harga Pokok Penjualan (HPP / COGS)
              </h3>
              <div className="flex justify-between text-amber-900 pl-3">
                <span>
                  Total HPP Barang Terjual (Kain + Jahit + Aksesoris +
                  Packaging):
                </span>
                <strong className="font-mono text-sm text-rose-700">
                  - Rp {totalHppSold.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="pt-2 border-t border-amber-200 flex justify-between font-bold text-slate-900 pl-3">
                <span className="text-xs uppercase">
                  = LABA KOTOR (GROSS PROFIT):
                </span>
                <span className="text-base font-black text-emerald-800 font-mono">
                  Rp {totalGrossProfit.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Section 3: Biaya Marketplace & Promosi */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase text-xs">
                3. Potongan Komisi & Promosi Marketplace
              </h3>
              <div className="flex justify-between text-slate-700 pl-3">
                <span>
                  Biaya Komisi Admin Marketplace (Shopee, TikTok, Tokped,
                  Lazada):
                </span>
                <strong className="font-mono text-rose-700">
                  - Rp {totalMarketplaceAdmin.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="flex justify-between text-slate-700 pl-3">
                <span>Voucher Toko, Diskon Promo, & Subsidi Ongkir:</span>
                <strong className="font-mono text-rose-700">
                  - Rp {totalVoucherPromo.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>

            {/* Section 4: Beban Operasional Usaha */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase text-xs">
                4. Beban Operasional & Biaya Usaha
              </h3>
              <div className="flex justify-between text-slate-700 pl-3">
                <span>Gaji Karyawan & Staff:</span>
                <strong className="font-mono text-rose-700">
                  - Rp {expenseSalary.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="flex justify-between text-slate-700 pl-3">
                <span>Iklan Digital (Meta Ads & TikTok Ads):</span>
                <strong className="font-mono text-rose-700">
                  - Rp {expenseAds.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="flex justify-between text-slate-700 pl-3">
                <span>Operasional Kantor, Listrik, Internet & Packing:</span>
                <strong className="font-mono text-rose-700">
                  - Rp {expenseOps.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-semibold text-slate-800 pl-3">
                <span>Total Beban Operasional:</span>
                <span className="font-mono font-bold text-rose-700">
                  - Rp {totalOperatingExpenses.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Final Net Profit Banner */}
            <div className="p-5 bg-emerald-600 text-white rounded-2xl shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Bottom Line Result
                </span>
                <h4 className="text-lg font-black tracking-tight mt-0.5">
                  LABA BERSIH (NET PROFIT):
                </h4>
                <p className="text-xs text-emerald-100">
                  Margin Bersih:{" "}
                  {totalOmzetGross > 0
                    ? ((netProfitFinal / totalOmzetGross) * 100).toFixed(1)
                    : 0}
                  % dari Omzet Bruto
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-black font-mono">
                Rp {netProfitFinal.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hutang & Piutang */}
      {activeTab === "debt" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
              <span className="text-xs font-bold uppercase text-rose-700">
                Total Hutang Kita ke Supplier
              </span>
              <p className="text-2xl font-black text-rose-900 mt-1 font-mono">
                Rp {totalHutangUsaha.toLocaleString("id-ID")}
              </p>
              <span className="text-xs text-rose-700">
                Kewajiban bayar kain & konveksi
              </span>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <span className="text-xs font-bold uppercase text-blue-700">
                Total Piutang di Reseller / Dropshipper
              </span>
              <p className="text-2xl font-black text-blue-900 mt-1 font-mono">
                Rp {totalPiutangUsaha.toLocaleString("id-ID")}
              </p>
              <span className="text-xs text-blue-700">
                Tagihan masuk yang belum cair
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Hutang & Piutang Usaha
              </h3>
              <button
                onClick={() => setShowAddDebtModal(true)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl"
              >
                + Catat Hutang / Piutang
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-3">Nama Mitra / Supplier</th>
                    <th className="py-3 px-3 text-right">Total Nominal</th>
                    <th className="py-3 px-3 text-right">Sudah Dibayar</th>
                    <th className="py-3 px-3 text-right font-bold">
                      Sisa Saldo
                    </th>
                    <th className="py-3 px-3">Jatuh Tempo</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debts.map((debt) => {
                    const isHutang =
                      debt.type === "hutang" ||
                      (debt.type as string) === "HUTANG_KITA";
                    const isLunas =
                      debt.status === "lunas" || debt.status === "LUNAS";
                    const isSebagian =
                      debt.status === "belum_lunas" && debt.paidAmount > 0;
                    const entity =
                      debt.entityName ||
                      (debt as any).partyName ||
                      debt.referenceNo;
                    const total = debt.totalAmount || (debt as any).amount || 0;

                    return (
                      <tr key={debt.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isHutang
                                ? "bg-rose-100 text-rose-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isHutang ? "HUTANG (KITA)" : "PIUTANG (CUSTOMER)"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{entity}</p>
                          <p className="text-[10px] text-slate-400">
                            {debt.notes}{" "}
                            {debt.referenceNo ? `(${debt.referenceNo})` : ""}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          Rp {total.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-700">
                          Rp {debt.paidAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          Rp {debt.remainingAmount.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {debt.dueDate}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLunas
                                ? "bg-emerald-100 text-emerald-800"
                                : isSebagian
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isLunas
                              ? "LUNAS"
                              : isSebagian
                                ? "SEBAGIAN"
                                : "BELUM LUNAS"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {!isLunas && (
                            <button
                              onClick={() => {
                                setShowSettleDebtModal(debt);
                                setSettleAmount(debt.remainingAmount);
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                            >
                              Bayar / Lunas
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Arus Kas */}
      {activeTab === "cashflow" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Ringkasan Total Kas Masuk (Inflow)
            </h3>
            <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-medium">
                Total Penerimaan Uang Kas:
              </span>
              <span className="text-base font-black text-emerald-800 font-mono">
                Rp{" "}
                {(cashTransactions || [])
                  .filter((t) => t.type === "in" || (t.type as string) === "IN")
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Berasal dari pencairan payout Shopee, TikTok Shop, Tokopedia,
              serta penjualan langsung & WhatsApp.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase">
              Ringkasan Total Kas Keluar (Outflow)
            </h3>
            <div className="p-3 bg-rose-50 rounded-xl flex items-center justify-between">
              <span className="text-xs text-rose-800 font-medium">
                Total Pengeluaran Uang Kas:
              </span>
              <span className="text-base font-black text-rose-800 font-mono">
                Rp{" "}
                {(cashTransactions || [])
                  .filter(
                    (t) => t.type === "out" || (t.type as string) === "OUT",
                  )
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString("id-ID")}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mencakup pembelian kain, ongkos jahit SPK, iklan ads harian, dan
              operasional sabhira.
            </p>
          </div>
        </div>
      )}

      {/* Modal: Catat Kas Masuk / Keluar */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Catat Transaksi Kas Masuk / Keluar
              </h3>
              <button
                onClick={() => setShowAddTxModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddTxSubmit}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Aliran Kas
                  </label>
                  <select
                    value={txForm.type}
                    onChange={(e) =>
                      setTxForm({ ...txForm, type: e.target.value as any })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="OUT">Kas KELUAR (Beban/Beli)</option>
                    <option value="IN">Kas MASUK (Penerimaan)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rekening / Kas
                  </label>
                  <select
                    value={txForm.accountId}
                    onChange={(e) =>
                      setTxForm({ ...txForm, accountId: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Rp {a.balance.toLocaleString("id-ID")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kategori Transaksi
                </label>
                <div className="space-y-2">
                  <select
                    value={txForm.category}
                    onChange={(e) =>
                      setTxForm({ ...txForm, category: e.target.value as any })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="Tambah kategori baru"
                      className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  value={txForm.amount}
                  onChange={(e) =>
                    setTxForm({ ...txForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-black text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan / Deskripsi
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Top up saldo TikTok Ads live selling"
                  value={txForm.description}
                  onChange={(e) =>
                    setTxForm({ ...txForm, description: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pihak Terkait / Vendor
                </label>
                <input
                  type="text"
                  placeholder="Misal: TikTok Ads Pte Ltd"
                  value={txForm.counterparty}
                  onChange={(e) =>
                    setTxForm({ ...txForm, counterparty: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Kas / Bank */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Transfer Dana Antar Rekening Bank
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleTransferSubmit}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dari Rekening Asal
                </label>
                <select
                  value={transferForm.fromAccountId}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      fromAccountId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} - Saldo: Rp {a.balance.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ke Rekening Tujuan
                </label>
                <select
                  value={transferForm.toAccountId}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      toAccountId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} - Saldo: Rp {a.balance.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Transfer (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.amount}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan
                </label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) =>
                    setTransferForm({ ...transferForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-sm"
                >
                  Eksekusi Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Hutang / Piutang */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Catat Hutang / Piutang Usaha
              </h3>
              <button
                onClick={() => setShowAddDebtModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddDebtSubmit}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tipe Tagihan
                </label>
                <select
                  value={debtForm.type}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, type: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                >
                  <option value="HUTANG_KITA">
                    HUTANG KITA (Ke Supplier Kain/Konveksi)
                  </option>
                  <option value="PIUTANG_CUSTOMER">
                    PIUTANG CUSTOMER (Dari Reseller/Agen)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Mitra / Supplier
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: PT Kain Sejahtera Bandung"
                  value={debtForm.partyName}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, partyName: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={debtForm.amount}
                    onChange={(e) =>
                      setDebtForm({
                        ...debtForm,
                        amount: Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    required
                    value={debtForm.dueDate}
                    onChange={(e) =>
                      setDebtForm({ ...debtForm, dueDate: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan / No Invoice Ref
                </label>
                <input
                  type="text"
                  placeholder="Misal: Invoice #INV-KAY-8871"
                  value={debtForm.notes}
                  onChange={(e) =>
                    setDebtForm({ ...debtForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddDebtModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bayar / Pelunasan Hutang */}
      {showSettleDebtModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Pembayaran & Pelunasan
              </h3>
              <button
                onClick={() => setShowSettleDebtModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSettleDebtSubmit}
              className="mt-4 space-y-3 text-xs"
            >
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">
                  {showSettleDebtModal.entityName ||
                    (showSettleDebtModal as any).partyName ||
                    showSettleDebtModal.referenceNo}
                </p>
                <p className="text-slate-600 mt-0.5">
                  Sisa Tagihan:{" "}
                  <strong className="text-rose-700 font-mono">
                    Rp{" "}
                    {showSettleDebtModal.remainingAmount.toLocaleString(
                      "id-ID",
                    )}
                  </strong>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bayar Menggunakan Rekening:
                </label>
                <select
                  value={settleAccount}
                  onChange={(e) => setSettleAccount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Saldo: Rp {a.balance.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="number"
                  min="1"
                  max={showSettleDebtModal.remainingAmount}
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-black text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSettleDebtModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
