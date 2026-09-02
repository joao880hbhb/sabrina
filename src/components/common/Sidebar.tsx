import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Boxes, 
  Scissors, 
  Wallet, 
  Truck, 
  BarChart3, 
  Users,
  Layers,
  Lock
} from 'lucide-react';

interface SidebarProps {
  onOpenAiAdvisor?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAiAdvisor }) => {
  const { activeNavTab, setActiveNavTab, currentUser, products, orders, productionPlans, debts } = useApp();

  const lowStockCount = products.filter(p => p.stockGudang <= p.minStockAlert).length;
  const escrowOrdersCount = orders.filter(o => o.payoutStatus === 'escrow').length;
  const activeSpkCount = productionPlans.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length;
  const unpaidDebtsCount = debts.filter(d => d.status === 'belum_lunas').length;
  const missingResiAlertCount = orders.filter(o => o.resiStatus === 'lost_or_unscanned').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Owner',
      icon: LayoutDashboard,
      desc: 'Omzet, Laba & KPI',
      permissionKey: 'dashboard' as const,
      badge: null,
    },
    {
      id: 'marketplace',
      label: 'Penjualan Marketplace',
      icon: ShoppingBag,
      desc: 'Shopee, TikTok, Tokped & Payout',
      permissionKey: 'marketplace' as const,
      badge: escrowOrdersCount > 0 ? `${escrowOrdersCount} Cair` : null,
      badgeColor: 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50',
    },
    {
      id: 'products',
      label: 'Produk & HPP',
      icon: Tag,
      desc: 'Breakdown HPP, Kain, Margin SKU',
      permissionKey: 'products' as const,
      badge: `${products.length} SKU`,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      desc: 'Stok Gudang, Mutasi & Opname',
      permissionKey: 'inventory' as const,
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : null,
      badgeColor: 'bg-amber-950/80 text-amber-300 border border-amber-800/50',
    },
    {
      id: 'production',
      label: 'Produksi',
      icon: Scissors,
      desc: 'Rencana, SPK, Jahit & QC Reject',
      permissionKey: 'production' as const,
      badge: activeSpkCount > 0 ? `${activeSpkCount} SPK` : null,
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50',
    },
    {
      id: 'finance',
      label: 'Keuangan',
      icon: Wallet,
      desc: 'Kas Masuk/Keluar, Bank & Hutang',
      permissionKey: 'finance' as const,
      badge: unpaidDebtsCount > 0 ? `${unpaidDebtsCount} Tagihan` : null,
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-800/50',
    },
    {
      id: 'suratJalan',
      label: 'Surat Jalan & Resi',
      icon: Truck,
      desc: 'Manifest Paket, TTD Digital & Tracing',
      permissionKey: 'suratJalan' as const,
      badge: missingResiAlertCount > 0 ? `${missingResiAlertCount} Resi Alert` : null,
      badgeColor: 'bg-rose-950/80 text-rose-300 border border-rose-800/50 animate-pulse',
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: BarChart3,
      desc: 'Laba Rugi, Pareto & Margin',
      permissionKey: 'reports' as const,
      badge: 'Lengkap',
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      desc: 'Role & Hak Akses Berjenjang',
      permissionKey: 'users' as const,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-64px)] border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm shadow-indigo-500/30">
            S
          </div>
          <div>
            <span className="font-bold text-white tracking-tight uppercase text-xs">Sabhira Finance</span>
            <div className="text-[10px] text-slate-400">ERP & Cashflow V2</div>
          </div>
        </div>
        <button 
          onClick={onOpenAiAdvisor}
          className="text-xs text-indigo-400 hover:text-indigo-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
          title="Buka AI Advisor"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="px-5 mb-2 uppercase text-[10px] text-slate-400 font-bold tracking-widest">
          Main Menu
        </div>

        <div className="space-y-0.5">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isAllowed = currentUser.permissions[item.permissionKey];
            const isActive = activeNavTab === item.id;

            return (
              <React.Fragment key={item.id}>
                {idx === 8 && (
                  <div className="px-5 mt-4 mb-2 uppercase text-[10px] text-slate-400 font-bold tracking-widest border-t border-slate-800/60 pt-3">
                    System
                  </div>
                )}
                <button
                  onClick={() => {
                    if (isAllowed) {
                      setActiveNavTab(item.id);
                    }
                  }}
                  disabled={!isAllowed}
                  className={`w-full flex items-center justify-between px-5 py-2.5 text-left text-xs transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold border-r-4 border-indigo-500'
                      : isAllowed
                      ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      : 'text-slate-600 bg-slate-900/40 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : isAllowed ? 'text-slate-400' : 'text-slate-600'}`} />
                    <div className="truncate">
                      <p className={`text-xs tracking-tight truncate ${isActive ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 ml-2">
                    {item.badge && isAllowed && !isActive && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                    {!isAllowed && (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
          />
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              {currentUser.role} • ERP Active
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
