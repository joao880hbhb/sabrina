import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { MarketplaceSales } from './components/marketplace/MarketplaceSales';
import { ProductHppManager } from './components/products/ProductHppManager';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ProductionManager } from './components/production/ProductionManager';
import { FinanceManager } from './components/finance/FinanceManager';
import { SuratJalanManager } from './components/delivery/SuratJalanManager';
import { BusinessReports } from './components/reports/BusinessReports';
import { UserManagement } from './components/users/UserManagement';

const MainLayout: React.FC = () => {
  const { activeNavTab } = useApp();

  const renderActiveModule = () => {
    switch (activeNavTab) {
      case 'dashboard':
        return <OwnerDashboard />;
      case 'marketplace':
        return <MarketplaceSales />;
      case 'products':
        return <ProductHppManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'production':
        return <ProductionManager />;
      case 'finance':
        return <FinanceManager />;
      case 'suratJalan':
      case 'delivery':
        return <SuratJalanManager />;
      case 'reports':
        return <BusinessReports />;
      case 'users':
        return <UserManagement />;
      default:
        return <OwnerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
