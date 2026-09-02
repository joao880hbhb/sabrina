import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  Bell, 
  Search, 
  Sparkles, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  AlertTriangle,
  Wallet,
  Shirt,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onOpenAiAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAiAdvisor }) => {
  const { 
    currentUser, 
    users, 
    switchUserRole, 
    products, 
    debts, 
    orders, 
    productionPlans, 
    resetToDemoData, 
    exportAllDataJson,
    setActiveNavTab
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Compute notifications
  const lowStockProducts = products.filter(p => p.stockGudang <= p.minStockAlert);
  const pendingEscrowOrders = orders.filter(o => o.payoutStatus === 'escrow');
  const activeSPK = productionPlans.filter(p => p.status === 'sewing' || p.status === 'cutting');
  const dueDebts = debts.filter(d => d.status === 'belum_lunas');

  const totalNotifications = lowStockProducts.length + (dueDebts.length > 0 ? 1 : 0) + (activeSPK.length > 0 ? 1 : 0);

  const roleColors: Record<UserRole, { bg: string; text: string; label: string }> = {
    owner: { bg: 'bg-amber-100 text-amber-900 border-amber-300', text: 'text-amber-800', label: 'Owner / Direktur' },
    finance: { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', text: 'text-emerald-800', label: 'Finance & Accounting' },
    admin: { bg: 'bg-blue-100 text-blue-900 border-blue-300', text: 'text-blue-800', label: 'Admin Marketplace' },
    gudang: { bg: 'bg-purple-100 text-purple-900 border-purple-300', text: 'text-purple-800', label: 'Kepala Gudang' },
    produksi: { bg: 'bg-orange-100 text-orange-900 border-orange-300', text: 'text-orange-800', label: 'Kepala Produksi' },
    marketing: { bg: 'bg-pink-100 text-pink-900 border-pink-300', text: 'text-pink-800', label: 'Digital Marketing & Live' },
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left: Brand Identity & Flow Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base">Executive Dashboard</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Sabhira V2
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Arus Material → Produksi → Stok → Marketplace → Kas Bersih
            </p>
          </div>
        </div>

        {/* Center: Global Search & Quick AI Assistant */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari SKU, Nama Produk, No SPK, Resi, atau Surat Jalan..." 
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
          
          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            title="Sabhira AI Business & HPP Advisor"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>AI Advisor</span>
          </button>
        </div>

        {/* Right Controls: Notifications, Data Actions, Role Switcher */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Quick AI on mobile */}
          <button
            onClick={onOpenAiAdvisor}
            className="md:hidden p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200"
            title="AI Advisor"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </button>

          {/* Quick Action Input Penjualan */}
          <button
            onClick={() => setActiveNavTab('marketplace')}
            className="hidden sm:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-xs transition-colors"
          >
            + Input Penjualan
          </button>

          {/* Backup Data button */}
          <button
            onClick={exportAllDataJson}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Download Backup Data ERP"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Backup</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Data Demo Sabhira ERP"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifikasi & Peringatan Sistem"
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalNotifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pemberitahuan Bisnis</h4>
                  <span className="text-[10px] text-slate-400">{totalNotifications} Perlu Tindakan</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                  {lowStockProducts.length > 0 && (
                    <div 
                      onClick={() => { setActiveNavTab('inventory'); setShowNotifications(false); }}
                      className="py-2.5 px-2 hover:bg-amber-50/70 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-amber-900">Stok Menipis ({lowStockProducts.length} SKU)</p>
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {lowStockProducts.map(p => `${p.name} (${p.stockGudang} pcs)`).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {pendingEscrowOrders.length > 0 && (
                    <div 
                      onClick={() => { setActiveNavTab('marketplace'); setShowNotifications(false); }}
                      className="py-2.5 px-2 hover:bg-indigo-50/70 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Wallet className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-indigo-900">Dana Marketplace Tertahan di Escrow</p>
                          <p className="text-[11px] text-slate-600">
                            {pendingEscrowOrders.length} Pesanan belum cair (Total Rp {pendingEscrowOrders.reduce((s, o) => s + o.netPayout, 0).toLocaleString('id-ID')})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSPK.length > 0 && (
                    <div 
                      onClick={() => { setActiveNavTab('production'); setShowNotifications(false); }}
                      className="py-2.5 px-2 hover:bg-emerald-50/70 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Shirt className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-emerald-900">SPK Produksi Sedang Berjalan</p>
                          <p className="text-[11px] text-slate-600">
                            {activeSPK.length} Batch jahitan sedang dikerjakan di konveksi rekanan
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {dueDebts.length > 0 && (
                    <div 
                      onClick={() => { setActiveNavTab('finance'); setShowNotifications(false); }}
                      className="py-2.5 px-2 hover:bg-rose-50/70 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-rose-900">Hutang Kain Jatuh Tempo</p>
                          <p className="text-[11px] text-slate-600">
                            Ada {dueDebts.length} tagihan supplier kain yang perlu dilunasi bulan ini
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 p-1.5 pl-2 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-300"
              />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{currentUser.name}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${roleColors[currentUser.role].bg}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900">Ganti Hak Akses (RBAC)</p>
                  <p className="text-[10px] text-slate-400">Pilih peran untuk menguji hak akses tiap staf Sabhira</p>
                </div>

                <div className="space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserRole(u.role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        currentUser.role === u.role ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                        <div>
                          <p className="text-xs leading-none">{u.name}</p>
                          <span className={`text-[9px] font-medium px-1 rounded inline-block mt-0.5 ${roleColors[u.role].bg}`}>
                            {roleColors[u.role].label}
                          </span>
                        </div>
                      </div>
                      {currentUser.role === u.role && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset ke Data Awal Pabrik?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Tindakan ini akan mengembalikan semua data produk gamis, transaksi marketplace, SPK, dan kas ke data bawaan demo Sabhira.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetToDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
