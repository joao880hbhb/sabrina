import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Boxes, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  AlertCircle,
  Scissors,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { 
    orders, 
    products, 
    accounts, 
    cashTransactions, 
    productionPlans,
    setActiveNavTab 
  } = useApp();

  const [timeframe, setTimeframe] = useState<'today' | 'this_month' | 'all_time'>('this_month');

  // Filter orders by timeframe
  const todayStr = '2026-09-01';
  const currentMonthStr = '2026-09';

  const filteredOrders = orders.filter(o => {
    if (timeframe === 'today') return o.date.startsWith(todayStr);
    if (timeframe === 'this_month') return o.date.startsWith(currentMonthStr) || o.date.startsWith('2026-08');
    return true;
  });

  // Calculate Metrics
  const totalGrossOmzet = filteredOrders.reduce((sum, o) => sum + o.grossAmount, 0);
  
  // Total HPP for items sold in these orders
  const totalHppSold = filteredOrders.reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => itemSum + (item.unitHpp * item.quantity), 0);
  }, 0);

  // Marketplace Costs
  const totalAdminFee = filteredOrders.reduce((sum, o) => sum + o.adminFee, 0);
  const totalVoucher = filteredOrders.reduce((sum, o) => sum + o.voucherAmount, 0);
  const totalDiscount = filteredOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalShippingSubsidy = filteredOrders.reduce((sum, o) => sum + o.shippingSubsidy, 0);
  const totalMarketplaceCosts = totalAdminFee + totalVoucher + totalDiscount + totalShippingSubsidy;

  // Laba Kotor (Gross Profit = Omzet Kotor - Total HPP Produk)
  const labaKotor = totalGrossOmzet - totalHppSold;
  const marginKotorPercent = totalGrossOmzet > 0 ? (labaKotor / totalGrossOmzet) * 100 : 0;

  // Net Payout Received/Escrow from marketplace
  const totalNetMarketplacePayout = filteredOrders.reduce((sum, o) => sum + o.netPayout, 0);

  // Additional Operational Expenses from Cash Out
  const filteredCashOut = cashTransactions.filter(tx => {
    if (tx.type !== 'out') return false;
    // Exclude production HPP if already accounted, but include operational/salary/marketing
    return ['MARKETING_ADS', 'GAJI_KARYAWAN', 'BIAYA_OPERASIONAL_LISTRIK_SEWA', 'BIAYA_PACKAGING'].includes(tx.category);
  });
  const totalOperatingExpenses = filteredCashOut.reduce((sum, tx) => sum + tx.amount, 0);

  // Laba Bersih = Laba Kotor - Biaya Marketplace - Biaya Operasional
  const labaBersih = labaKotor - totalMarketplaceCosts - totalOperatingExpenses;
  const netProfitMarginPercent = totalGrossOmzet > 0 ? (labaBersih / totalGrossOmzet) * 100 : 0;

  // Total Kas & Bank Saldo
  const totalCashBankBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const liquidCashBank = accounts.filter(a => a.type.startsWith('bank_') || a.type === 'kas_tunai').reduce((s, a) => s + a.balance, 0);
  const escrowSaldo = accounts.filter(a => a.type.startsWith('escrow_')).reduce((s, a) => s + a.balance, 0);

  // Total Inventory Stock & Valuation
  const totalPcsGudang = products.reduce((sum, p) => sum + p.stockGudang, 0);
  const totalPcsMarketplace = products.reduce((sum, p) => sum + p.stockMarketplace, 0);
  const totalStockValuationHpp = products.reduce((sum, p) => sum + ((p.stockGudang + p.stockMarketplace) * p.hppFinal), 0);
  const totalStockValuationSelling = products.reduce((sum, p) => sum + ((p.stockGudang + p.stockMarketplace) * p.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.stockGudang <= p.minStockAlert).length;

  // Best Selling Products calculation
  const productSalesMap: Record<string, { product: typeof products[0]; totalQty: number; totalRevenue: number; totalMargin: number }> = {};
  
  orders.forEach(ord => {
    ord.items.forEach(item => {
      const prod = products.find(p => p.id === item.skuId || p.sku === item.sku);
      if (prod) {
        if (!productSalesMap[prod.id]) {
          productSalesMap[prod.id] = { product: prod, totalQty: 0, totalRevenue: 0, totalMargin: 0 };
        }
        productSalesMap[prod.id].totalQty += item.quantity;
        productSalesMap[prod.id].totalRevenue += item.subtotal;
        productSalesMap[prod.id].totalMargin += (item.subtotal - (item.unitHpp * item.quantity));
      }
    });
  });

  const bestSellingList = Object.values(productSalesMap).sort((a, b) => b.totalQty - a.totalQty);

  // Sales by Channel
  const channelBreakdown: Record<string, { count: number; omzet: number; net: number; fee: number }> = {};
  orders.forEach(o => {
    if (!channelBreakdown[o.channel]) {
      channelBreakdown[o.channel] = { count: 0, omzet: 0, net: 0, fee: 0 };
    }
    channelBreakdown[o.channel].count += 1;
    channelBreakdown[o.channel].omzet += o.grossAmount;
    channelBreakdown[o.channel].net += o.netPayout;
    channelBreakdown[o.channel].fee += (o.adminFee + o.voucherAmount + o.discountAmount + o.shippingSubsidy);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
              Executive Overview
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring arus bisnis fashion dari barang masuk, produksi konveksi, stok ready, hingga pencairan kas dan laba bersih.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200/80">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              timeframe === 'today' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setTimeframe('this_month')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              timeframe === 'this_month' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setTimeframe('all_time')}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              timeframe === 'all_time' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            Semua Data
          </button>
        </div>
      </div>

      {/* Visual Supply Chain Pipeline Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div 
          onClick={() => setActiveNavTab('inventory')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Bahan Masuk</span>
            <Scissors className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">1,350 m Kain</p>
          <p className="text-[10px] text-slate-500">Kain & Aksesoris Ready</p>
        </div>

        <div 
          onClick={() => setActiveNavTab('production')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Produksi SPK</span>
            <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">{productionPlans.length} Batch SPK</p>
          <p className="text-[10px] text-indigo-600 font-medium">Sedang Dijahit</p>
        </div>

        <div 
          onClick={() => setActiveNavTab('products')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3. Stok Ready</span>
            <Boxes className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">{totalPcsGudang + totalPcsMarketplace} Pcs</p>
          <p className="text-[10px] text-slate-500">Gudang & Channel</p>
        </div>

        <div 
          onClick={() => setActiveNavTab('marketplace')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">4. Marketplace</span>
            <ShoppingBag className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">{filteredOrders.length} Pesanan</p>
          <p className="text-[10px] text-indigo-600 font-medium">Shopee, TikTok, WA</p>
        </div>

        <div 
          onClick={() => setActiveNavTab('finance')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">5. Uang Masuk</span>
            <Wallet className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
          </div>
          <p className="text-sm font-bold text-slate-900">Rp {(liquidCashBank / 1000000).toFixed(1)} Jt</p>
          <p className="text-[10px] text-slate-500">Saldo Bank Cair</p>
        </div>

        <div 
          onClick={() => setActiveNavTab('reports')}
          className="p-3.5 bg-indigo-600 text-white rounded-xl border border-indigo-700 transition-all cursor-pointer shadow-xs"
        >
          <div className="flex items-center justify-between text-indigo-200 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">6. Laba Bersih</span>
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-sm font-bold text-white">Rp {(labaBersih / 1000000).toFixed(2)} Jt</p>
          <p className="text-[10px] text-indigo-200 font-medium">{netProfitMarginPercent.toFixed(1)}% Net Margin</p>
        </div>
      </div>

      {/* Row 1: Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Omzet Bulan Ini */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Omzet Bulan Ini</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Rp {totalGrossOmzet.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-emerald-600 font-bold">+12.4%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
              <div className="bg-indigo-500 h-full w-[75%] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Card 2: Laba Bersih */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laba Bersih</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Rp {labaBersih.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-emerald-600 font-bold">+{netProfitMarginPercent.toFixed(1)}%</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Margin Bersih: <strong className="text-emerald-700">{netProfitMarginPercent.toFixed(1)}%</strong></div>
          </div>
        </div>

        {/* Card 3: Total HPP Produk */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total HPP Produk</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Rp {totalHppSold.toLocaleString('id-ID')}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Laba Kotor: <strong className="text-slate-800">Rp {labaKotor.toLocaleString('id-ID')}</strong> ({marginKotorPercent.toFixed(1)}%)</div>
          </div>
        </div>

        {/* Card 4: Kas & Saldo Bank */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kas & Saldo Bank</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Rp {totalCashBankBalance.toLocaleString('id-ID')}</span>
            </div>
            <div 
              onClick={() => setActiveNavTab('marketplace')}
              className="text-[11px] text-indigo-600 font-medium hover:underline cursor-pointer mt-2"
            >
              Lihat Rekap Marketplace (Escrow: Rp {escrowSaldo.toLocaleString('id-ID')})
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Growth Performance & Marketplace Share */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Growth Performance (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-sm font-bold uppercase tracking-tight text-slate-900">Growth Performance</span>
              <p className="text-xs text-slate-500">Tren pertumbuhan omzet vs laba bersih bulanan</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Omzet
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Laba
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2 min-h-[180px]">
            {[
              { month: 'JAN', omzetH: '45%', labaH: '30%', omzetVal: '310Jt', labaVal: '95Jt' },
              { month: 'FEB', omzetH: '60%', labaH: '42%', omzetVal: '345Jt', labaVal: '110Jt' },
              { month: 'MAR', omzetH: '55%', labaH: '38%', omzetVal: '320Jt', labaVal: '102Jt' },
              { month: 'APR', omzetH: '85%', labaH: '60%', omzetVal: '412Jt', labaVal: '145Jt' },
              { month: 'MEI', omzetH: '75%', labaH: '52%', omzetVal: '380Jt', labaVal: '128Jt' },
              { month: 'JUN', omzetH: '95%', labaH: '70%', omzetVal: '450Jt', labaVal: '162Jt' },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-50 rounded-t-lg relative h-44 border-b border-slate-200">
                  <div 
                    style={{ height: bar.omzetH }} 
                    className="absolute bottom-0 w-full bg-indigo-100 rounded-t-lg transition-all group-hover:bg-indigo-200"
                    title={`Omzet: ${bar.omzetVal}`}
                  ></div>
                  <div 
                    style={{ height: bar.labaH }} 
                    className="absolute bottom-0 left-1/4 w-1/2 bg-indigo-500 rounded-t-md transition-all group-hover:bg-indigo-600 shadow-xs"
                    title={`Laba: ${bar.labaVal}`}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>Rata-rata pertumbuhan bulanan: <strong className="text-slate-800">+14.2%</strong></span>
            <span>Total Omzet Semester 1: <strong className="text-slate-900">Rp 2.217.000.000</strong></span>
          </div>
        </div>

        {/* Marketplace Share (1 Col) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-sm font-bold uppercase tracking-tight text-slate-900 block mb-1">Marketplace Share</span>
            <p className="text-xs text-slate-500 mb-5">Distribusi penjualan per channel</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Shopee</span>
                  <span className="font-bold text-slate-900">45%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[45%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">TikTok Shop</span>
                  <span className="font-bold text-slate-900">30%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full w-[30%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Tokopedia</span>
                  <span className="font-bold text-slate-900">15%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[15%] rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Offline / WhatsApp</span>
                  <span className="font-bold text-slate-900">10%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full w-[10%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center uppercase tracking-widest font-semibold">
            Total Orders: {filteredOrders.length} Pesanan Aktif
          </div>
        </div>
      </div>

      {/* Row 3: Produk Terlaris & Margin Terbesar Table */}
      <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm font-bold uppercase tracking-tight text-slate-900">Produk Terlaris & Margin Terbesar</span>
            <p className="text-xs text-slate-500">Leaderboard performa penjualan dan kontribusi profit per SKU</p>
          </div>
          <button 
            onClick={() => setActiveNavTab('products')}
            className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
          >
            Lihat Semua Produk →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-bold">SKU / Produk</th>
                <th className="pb-3 font-bold">Kategori</th>
                <th className="pb-3 font-bold text-center">Terjual</th>
                <th className="pb-3 font-bold text-right">HPP Final</th>
                <th className="pb-3 font-bold text-right">Harga Jual</th>
                <th className="pb-3 font-bold text-right">Margin</th>
                <th className="pb-3 font-bold text-center">Status Stok</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {bestSellingList.slice(0, 6).map((item) => {
                const marginPercent = item.product.sellingPrice > 0 
                  ? ((item.product.sellingPrice - item.product.hppFinal) / item.product.sellingPrice) * 100 
                  : 0;
                const isLowStock = item.product.stockGudang <= item.product.minStockAlert;

                return (
                  <tr key={item.product.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{item.product.sku}</div>
                      <div className="text-[10px] text-slate-500">{item.product.name} - Size {item.product.size}</div>
                    </td>
                    <td className="py-3.5 text-slate-500">{item.product.category}</td>
                    <td className="py-3.5 text-center font-bold text-slate-800">{item.totalQty}</td>
                    <td className="py-3.5 text-right text-slate-600 font-mono">Rp {item.product.hppFinal.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 text-right font-medium text-slate-900">Rp {item.product.sellingPrice.toLocaleString('id-ID')}</td>
                    <td className="py-3.5 text-right text-emerald-600 font-bold">{marginPercent.toFixed(0)}%</td>
                    <td className="py-3.5 text-center">
                      {isLowStock ? (
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[9px] font-bold">
                          Low Stock ({item.product.stockGudang})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold">
                          Aman ({item.product.stockGudang})
                        </span>
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
  );
};
