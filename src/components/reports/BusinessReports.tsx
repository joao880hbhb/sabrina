import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Printer, 
  PieChart as PieChartIcon, 
  AlertTriangle, 
  Award, 
  Percent, 
  DollarSign, 
  Layers, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const BusinessReports: React.FC = () => {
  const { products, orders, cashTransactions, accounts } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'pareto' | 'deadstock' | 'margin' | 'channel'>('pareto');

  // Revenue & Sold Qty Aggregations per Product SKU
  const productSalesMap: Record<string, { sku: string; name: string; qty: number; gross: number; hpp: number; profit: number }> = {};

  products.forEach(p => {
    productSalesMap[p.id] = {
      sku: p.sku,
      name: p.name,
      qty: 0,
      gross: 0,
      hpp: p.hppFinal,
      profit: 0
    };
  });

  orders.forEach(o => {
    o.items.forEach(item => {
      if (productSalesMap[item.skuId]) {
        productSalesMap[item.skuId].qty += item.quantity;
        productSalesMap[item.skuId].gross += item.subtotal;
        productSalesMap[item.skuId].profit += item.subtotal - (item.unitHpp * item.quantity);
      }
    });
  });

  const rankedProducts = Object.values(productSalesMap).sort((a, b) => b.gross - a.gross);
  const totalSalesAll = rankedProducts.reduce((s, p) => s + p.gross, 0);

  // Cumulative percentage for Pareto 80/20
  let cumulative = 0;
  const paretoData = rankedProducts.map((p, idx) => {
    cumulative += p.gross;
    const cumPercent = totalSalesAll > 0 ? (cumulative / totalSalesAll) * 100 : 0;
    return {
      ...p,
      rank: idx + 1,
      share: totalSalesAll > 0 ? (p.gross / totalSalesAll) * 100 : 0,
      cumPercent,
      isTop80: cumPercent <= 85 // Top 80% contributors
    };
  });

  // Dead Stock / Slow Moving Analysis (Stock > 30 pcs and Qty Sold < 5)
  const deadStockProducts = products.filter(p => {
    const sold = productSalesMap[p.id]?.qty || 0;
    return (p.stockGudang + p.stockMarketplace) >= 20 && sold <= 15;
  });

  // Channel Profitability
  const channelBreakdown: Record<string, { gross: number; admin: number; net: number; count: number }> = {};
  orders.forEach(o => {
    if (!channelBreakdown[o.channel]) {
      channelBreakdown[o.channel] = { gross: 0, admin: 0, net: 0, count: 0 };
    }
    channelBreakdown[o.channel].gross += o.grossAmount;
    channelBreakdown[o.channel].admin += o.adminFee;
    channelBreakdown[o.channel].net += o.netPayout;
    channelBreakdown[o.channel].count += 1;
  });

  const channelChartData = Object.entries(channelBreakdown).map(([name, val]) => ({
    name,
    gross: val.gross,
    admin: val.admin,
    net: val.net,
    count: val.count
  }));

  const COLORS = ['#ea580c', '#0f172a', '#059669', '#2563eb', '#0d9488', '#8b5cf6'];

  const exportExecutiveReportToExcel = () => {
    const exportData = paretoData.map(p => ({
      Rank: p.rank,
      SKU: p.sku,
      'Nama Produk': p.name,
      'Qty Terjual (Pcs)': p.qty,
      'Omzet Terkumpul (Rp)': p.gross,
      'Kontribusi Omzet (%)': `${p.share.toFixed(1)}%`,
      'Kumulatif (%)': `${p.cumPercent.toFixed(1)}%`,
      'Klasifikasi Pareto': p.isTop80 ? 'Class A (Fast Moving 80%)' : 'Class B/C (Slow Moving)'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analisa Pareto & Best Seller');
    XLSX.writeFile(wb, `Laporan_Eksekutif_Sabhira_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">Executive Analytics</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Laporan & Analisa Bisnis Fashion</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Keputusan berbasis data: Analisa Pareto 80/20 Best Seller, Dead Stock / Slow Moving, dan Efisiensi Margin Channel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak PDF</span>
          </button>

          <button
            onClick={exportExecutiveReportToExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel Lengkap</span>
          </button>
        </div>
      </div>

      {/* Analytics Sub Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveReportTab('pareto')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeReportTab === 'pareto' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Analisa Produk Terlaris (Pareto 80/20)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('deadstock')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeReportTab === 'deadstock' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Dead Stock & Slow Moving ({deadStockProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('margin')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeReportTab === 'margin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Analisa Margin & Profitabilitas SKU</span>
        </button>

        <button
          onClick={() => setActiveReportTab('channel')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeReportTab === 'channel' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Kinerja & Efisiensi Marketplace</span>
        </button>
      </div>

      {/* Tab 1: Pareto 80/20 */}
      {activeReportTab === 'pareto' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-900">Prinsip Pareto Bisnis Fashion: 20% SKU Menghasilkan 80% Omzet</h4>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                Fokuskan kapasitas produksi konveksi dan modal kain pada SKU 'Class A' di bawah ini untuk mencegah kehabisan stok (stockout) pada produk primadona Anda.
              </p>
            </div>
          </div>

          {/* Pareto Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Nama Produk & SKU</th>
                    <th className="py-3 px-3 text-center font-bold">Qty Terjual</th>
                    <th className="py-3 px-3 text-right">Total Omzet</th>
                    <th className="py-3 px-3 text-right">Porsi Omzet</th>
                    <th className="py-3 px-3 text-right">Kumulatif %</th>
                    <th className="py-3 px-4 text-center">Klasifikasi Pareto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paretoData.map(p => (
                    <tr key={p.sku} className={`hover:bg-slate-50/70 ${p.isTop80 ? 'bg-emerald-50/20' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                          p.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-xs' :
                          p.rank === 2 ? 'bg-slate-200 text-slate-800' :
                          p.rank === 3 ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="font-mono text-[10px] text-slate-400">{p.sku}</p>
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900 text-sm">
                        {p.qty} Pcs
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                        Rp {p.gross.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-emerald-700">
                        {p.share.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-500">
                        {p.cumPercent.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.isTop80 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.isTop80 ? '⭐ Class A (Best Seller)' : 'Class B/C (Reguler)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dead Stock & Slow Moving */}
      {activeReportTab === 'deadstock' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-rose-900">Analisa Dead Stock & Modal Tertahan</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Produk dengan stok tinggi namun kecepatan penjualan rendah. Rekomendasi: Adakan Flash Sale diskon khusus atau jadikan bundling hadiah.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-rose-700 font-bold">Total Modal Tertahan:</span>
              <p className="text-lg font-black text-rose-900 font-mono">
                Rp {deadStockProducts.reduce((s, p) => s + ((p.stockGudang + p.stockMarketplace) * p.hppFinal), 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deadStockProducts.map(p => {
              const totalStok = p.stockGudang + p.stockMarketplace;
              const modalTertahan = totalStok * p.hppFinal;
              return (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">{p.name}</h5>
                      <p className="text-[10px] text-slate-500 font-mono">{p.sku} • {p.color} ({p.size})</p>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md">
                      Slow Moving
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Sisa Stok Fisik:</span>
                      <strong className="text-slate-900">{totalStok} Pcs</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>HPP Pokok:</span>
                      <strong className="font-mono">Rp {p.hppFinal.toLocaleString('id-ID')}</strong>
                    </div>
                    <div className="flex justify-between text-rose-700 font-bold pt-1 border-t border-slate-200">
                      <span>Modal Tertahan:</span>
                      <strong className="font-mono">Rp {modalTertahan.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Analisa Margin */}
      {activeReportTab === 'margin' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Peta Margin Keuntungan Per SKU</h3>
            <p className="text-xs text-slate-500">Evaluasi efisiensi biaya produksi terhadap harga jual yang ditetapkan.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Produk & SKU</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-right text-amber-700">HPP Total</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-700">Margin Nominal</th>
                  <th className="py-3 px-3 text-center">Margin %</th>
                  <th className="py-3 px-4 text-center">Rekomendasi Strategi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(prod => {
                  const isHigh = prod.marginPercent >= 50;
                  const isHealthy = prod.marginPercent >= 35 && prod.marginPercent < 50;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{prod.sku} • {prod.category}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        Rp {prod.sellingPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-800">
                        Rp {prod.hppFinal.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 font-mono">
                        Rp {prod.marginRp.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          isHigh ? 'bg-emerald-100 text-emerald-800' :
                          isHealthy ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {prod.marginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] text-slate-600">
                          {isHigh ? 'Bagus untuk Campaign Iklan Ads Besar' :
                           isHealthy ? 'Margin Ideal Standar Retail Fashion' : 'Negosiasi Ulang Ongkos Jahit / Kain'}
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

      {/* Tab 4: Kinerja & Efisiensi Marketplace */}
      {activeReportTab === 'channel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Performance Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Perbandingan Omzet Kotor vs Net Cair Per Channel</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']} />
                    <Bar dataKey="gross" fill="#0f172a" name="Omzet Bruto" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="net" fill="#059669" name="Net Cair" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Channel Admin Fee Summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Rincian Efisiensi & Potongan Biaya Admin</h4>
              <div className="space-y-2">
                {channelChartData.map(ch => {
                  const feePercentage = ch.gross > 0 ? ((ch.admin / ch.gross) * 100).toFixed(1) : '0';
                  return (
                    <div key={ch.name} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{ch.name}</p>
                        <p className="text-[10px] text-slate-500">{ch.count} Pesanan Masuk</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900">Rp {ch.net.toLocaleString('id-ID')}</p>
                        <span className="text-[10px] text-rose-600 font-semibold">Admin Potong: {feePercentage}% (-Rp {ch.admin.toLocaleString('id-ID')})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
