import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Boxes, 
  Plus, 
  Search, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  ClipboardCheck, 
  Layers,
  Scissors,
  Check,
  X,
  Sliders,
  FileText,
  Truck,
  TrendingDown,
  ShieldAlert,
  BellRing,
  ExternalLink,
  Edit2,
  RefreshCw,
  PackagePlus,
  PackageMinus,
  Sparkles
} from 'lucide-react';
import { InventoryTransactionType, ProductSKU, StockAlert } from '../../types';

export const InventoryManager: React.FC = () => {
  const { 
    products, 
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
    updateProductMinStock,
    createProductionSPK,
    currentUser,
    setActiveNavTab
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'transactions' | 'opname' | 'lowstock' | 'materials'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');

  // Modals
  const [showMutationModal, setShowMutationModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showOpnameModal, setShowOpnameModal] = useState(false);
  const [showManualMovementModal, setShowManualMovementModal] = useState(false);
  const [showStockCardModal, setShowStockCardModal] = useState(false);
  const [showMinStockEditModal, setShowMinStockEditModal] = useState(false);

  // Selected SKU for stock card ledger / min stock editing
  const [selectedSkuForCard, setSelectedSkuForCard] = useState<ProductSKU | null>(null);
  const [selectedSkuForMinStock, setSelectedSkuForMinStock] = useState<ProductSKU | null>(null);
  const [tempMinStockValue, setTempMinStockValue] = useState<number>(20);

  // Mutation form state
  const [mutationForm, setMutationForm] = useState({
    skuId: products[0]?.id || '',
    qty: 10,
    from: 'Gudang Utama Pusat',
    to: 'Alokasi Stok Live Shopee & TikTok',
    notes: 'Alokasi stok live selling event'
  });

  // Manual Movement Form State (In / Out / Return / Purchase)
  const [manualMovementForm, setManualMovementForm] = useState<{
    itemCategory: 'product' | 'material';
    skuId: string;
    materialId: string;
    type: InventoryTransactionType;
    qty: number;
    referenceNo: string;
    fromLocation: string;
    toLocation: string;
    notes: string;
  }>({
    itemCategory: 'product',
    skuId: products[0]?.id || '',
    materialId: materials[0]?.id || '',
    type: 'BARANG_MASUK_PRODUKSI',
    qty: 50,
    referenceNo: '',
    fromLocation: 'Vendor Konveksi',
    toLocation: 'Gudang Utama Pusat',
    notes: 'Penerimaan barang jadi hasil SPK konveksi'
  });

  // Material form state
  const [materialForm, setMaterialForm] = useState({
    code: `RAW-KLN-${Date.now().toString().slice(-4)}`,
    name: '',
    type: 'Kain' as const,
    unit: 'meter' as const,
    currentStock: 100,
    minStock: 30,
    avgCostPerUnit: 25000,
    supplier: ''
  });

  // Stock opname form state
  const [opnameForm, setOpnameForm] = useState({
    skuId: products[0]?.id || '',
    physicalStock: products[0]?.stockGudang || 0,
    reason: ''
  });

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredTransactions = inventoryTransactions.filter(tx => {
    const matchesSearch = (tx.transactionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (tx.productName?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (tx.skuCode?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (tx.referenceNo?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (tx.pic?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesType = txTypeFilter === 'all' || tx.type === txTypeFilter;
    return matchesSearch && matchesType;
  });

  // Stock status checks
  const lowStockProducts = products.filter(p => p.stockGudang <= p.minStockAlert);
  const approachingMinProducts = products.filter(p => p.stockGudang > p.minStockAlert && p.stockGudang <= p.minStockAlert * 1.25);
  const lowStockMaterials = materials.filter(m => m.currentStock <= m.minStock);

  const totalGudangPcs = products.reduce((sum, p) => sum + p.stockGudang, 0);
  const totalMarketplacePcs = products.reduce((sum, p) => sum + p.stockMarketplace, 0);
  const totalInventoryAssetValue = products.reduce((sum, p) => sum + ((p.stockGudang + p.stockMarketplace) * p.hppFinal), 0);

  // Handlers
  const handleMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutationForm.qty <= 0) {
      alert('Jumlah mutasi harus lebih besar dari 0!');
      return;
    }
    const sourceProd = products.find(p => p.id === mutationForm.skuId);
    if (sourceProd && mutationForm.from.toLowerCase().includes('gudang') && sourceProd.stockGudang < mutationForm.qty) {
      if (!confirm(`Peringatan: Stok fisik di gudang hanya tersisa ${sourceProd.stockGudang} pcs. Tetap lakukan mutasi?`)) {
        return;
      }
    }
    recordStockMutation(mutationForm.skuId, mutationForm.qty, mutationForm.from, mutationForm.to, mutationForm.notes);
    setShowMutationModal(false);
  };

  const handleManualMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualMovementForm.qty <= 0) {
      alert('Jumlah pergerakan harus lebih dari 0!');
      return;
    }

    processManualInventoryMovement({
      type: manualMovementForm.type,
      skuId: manualMovementForm.itemCategory === 'product' ? manualMovementForm.skuId : undefined,
      materialId: manualMovementForm.itemCategory === 'material' ? manualMovementForm.materialId : undefined,
      qty: manualMovementForm.qty,
      referenceNo: manualMovementForm.referenceNo,
      fromLocation: manualMovementForm.fromLocation,
      toLocation: manualMovementForm.toLocation,
      notes: manualMovementForm.notes
    });

    setShowManualMovementModal(false);
  };

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.name) {
      alert('Nama bahan wajib diisi!');
      return;
    }
    addMaterial(materialForm);
    setShowAddMaterialModal(false);
    setMaterialForm({
      code: `RAW-KLN-${Date.now().toString().slice(-4)}`,
      name: '',
      type: 'Kain',
      unit: 'meter',
      currentStock: 100,
      minStock: 30,
      avgCostPerUnit: 25000,
      supplier: ''
    });
  };

  const handleOpnameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === opnameForm.skuId);
    if (!prod) return;

    const discrepancy = opnameForm.physicalStock - prod.stockGudang;
    const discrepancyValue = discrepancy * prod.hppFinal;

    createStockOpname({
      date: new Date().toISOString().split('T')[0],
      skuId: prod.id,
      skuCode: prod.sku,
      productName: prod.name,
      systemStock: prod.stockGudang,
      physicalStock: opnameForm.physicalStock,
      discrepancy,
      discrepancyValue,
      reason: opnameForm.reason || 'Audit berkala hitungan fisik gudang',
      status: 'approved',
      auditorName: currentUser.name
    });

    setShowOpnameModal(false);
  };

  const handleSaveMinStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkuForMinStock) return;
    updateProductMinStock(selectedSkuForMinStock.id, tempMinStockValue);
    setShowMinStockEditModal(false);
    setSelectedSkuForMinStock(null);
  };

  const openMinStockModal = (prod: ProductSKU) => {
    setSelectedSkuForMinStock(prod);
    setTempMinStockValue(prod.minStockAlert);
    setShowMinStockEditModal(true);
  };

  const openStockCardModal = (prod: ProductSKU) => {
    setSelectedSkuForCard(prod);
    setShowStockCardModal(true);
  };

  const handleCreateAutoSPK = (prod: ProductSKU) => {
    const targetQty = Math.max(100, (prod.minStockAlert * 3));
    createProductionSPK({
      title: `Batch Restock Darurat - ${prod.name} (${targetQty} pcs)`,
      skuId: prod.id,
      skuCode: prod.sku,
      productName: prod.name,
      targetQty,
      startDate: new Date().toISOString().split('T')[0],
      deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tailorVendorName: 'Konveksi Barokah Taylor (Prioritas)',
      materialUsed: materials.slice(0, 2).map(m => ({
        materialId: m.id,
        materialName: m.name,
        qtyPlan: 50
      })),
      cuttingCostPlan: 5000 * targetQty,
      sewingCostPlan: 25000 * targetQty,
      accessoriesCostPlan: 8000 * targetQty,
      overheadCostPlan: 4000 * targetQty,
      totalBudgetPlan: (prod.hppFinal * targetQty),
      status: 'planning',
      finishedGoodQty: 0,
      rejectQty: 0,
      reworkQty: 0
    });
    alert(`SPK Produksi otomatis sebanyak ${targetQty} pcs berhasil dibuat untuk ${prod.name}! Tim produksi telah menerima notifikasi.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              Logistik & Pergudangan
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              Real-Time Sync
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Manajemen Stok & Mutasi Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pantau arus barang masuk produksi, barang keluar pesanan marketplace, mutasi channel live, retur, dan audit stock opname fisik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowManualMovementModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <PackagePlus className="w-4 h-4 text-indigo-600" />
            <span>+ Catat Arus Barang</span>
          </button>

          <button
            onClick={() => setShowMutationModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            <span>Mutasi Alokasi Stok</span>
          </button>

          <button
            onClick={() => setShowOpnameModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit Opname</span>
          </button>

          <button
            onClick={() => setShowAddMaterialModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Beli Bahan Kain</span>
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Stok Fisik Gudang Pusat</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">{totalGudangPcs.toLocaleString('id-ID')} Pcs</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Tersedia untuk packing & kirim</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Alokasi Marketplace & Live</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-blue-700 mt-2 font-mono">{totalMarketplacePcs.toLocaleString('id-ID')} Pcs</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Shopee, TikTok, Tokopedia</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nilai Aset Stok (HPP Final)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-2 font-mono">
            Rp {(totalInventoryAssetValue / 1000000).toFixed(1)} Juta
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Valuasi total {products.length} SKU</p>
        </div>

        <div 
          onClick={() => setActiveSubTab('lowstock')}
          className="bg-white p-4 rounded-2xl border border-rose-200 hover:border-rose-300 shadow-xs cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Peringatan Stok Kritis</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center animate-bounce">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-700 mt-2 font-mono">
            {lowStockProducts.length} SKU
          </p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5 flex items-center gap-1">
            <span>Perlu restock segera</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </p>
        </div>
      </div>

      {/* Active Role Alert Notice (Dedicated for Owner & Warehouse) */}
      {(currentUser.role === 'owner' || currentUser.role === 'gudang') && lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <span>Peringatan Otomatis untuk {currentUser.role === 'owner' ? 'Owner / Direktur' : 'Kepala Gudang'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                  {lowStockProducts.length} SKU di Bawah Minimum
                </span>
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Stok fisik untuk {lowStockProducts.map(p => p.name).slice(0, 2).join(', ')} {lowStockProducts.length > 2 ? `dan ${lowStockProducts.length - 2} lainnya` : ''} telah menyentuh batas minimum. Segera terbitkan SPK Produksi atau mutasi stok dari channel live.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('lowstock')}
              className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors"
            >
              Lihat Daftar Restock
            </button>
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'products' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stok Produk Jadi ({products.length} SKU)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'transactions' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Riwayat Pergerakan & Mutasi ({inventoryTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('opname')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'opname' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Stock Opname & Selisih ({stockOpnames.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lowstock')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'lowstock' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Peringatan Minimum Stock ({lowStockProducts.length + lowStockMaterials.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeSubTab === 'materials' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Bahan Baku / Kain ({materials.length})</span>
        </button>
      </div>

      {/* Tab 1: Stok Produk Jadi */}
      {activeSubTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari SKU, nama produk, warna..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span>Menampilkan <strong>{filteredProducts.length}</strong> dari {products.length} SKU</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Produk & SKU</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-center">Stok Gudang Pusat</th>
                  <th className="py-3 px-3 text-center">Alokasi Live / Mktp</th>
                  <th className="py-3 px-3 text-center">Total Stok</th>
                  <th className="py-3 px-3 text-center">Batas Minimum</th>
                  <th className="py-3 px-3 text-center">Status Keamanan</th>
                  <th className="py-3 px-3 text-right">Valuasi HPP</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const isOutOfStock = p.stockGudang === 0;
                  const isCritical = p.stockGudang <= p.minStockAlert;
                  const isApproaching = p.stockGudang <= p.minStockAlert * 1.25;
                  const totalStok = p.stockGudang + p.stockMarketplace;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{p.sku}</span>
                          <span>•</span>
                          <span>{p.color}</span>
                          <span>({p.size})</span>
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold">
                        <span className={`text-sm ${
                          isOutOfStock ? 'text-rose-700 font-black' :
                          isCritical ? 'text-rose-600' :
                          isApproaching ? 'text-amber-700' : 'text-slate-900'
                        }`}>
                          {p.stockGudang} pcs
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-semibold text-blue-700">
                        {p.stockMarketplace} pcs
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        {totalStok} pcs
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => openMinStockModal(p)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-mono font-medium transition-colors"
                          title="Klik untuk mengatur batas minimum stock"
                        >
                          <span>{p.minStockAlert} pcs</span>
                          <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full ring-1 ring-rose-300">
                            🚨 Habis (0 Pcs)
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Di Bawah Min
                          </span>
                        ) : isApproaching ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                            ⚡ Mendekati Min
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aman
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        Rp {(totalStok * p.hppFinal).toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openStockCardModal(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="Lihat Kartu Stok (Ledger Riwayat)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setMutationForm({ ...mutationForm, skuId: p.id });
                              setShowMutationModal(true);
                            }}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                            title="Mutasi Alokasi Stok"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {isCritical && (
                            <button
                              onClick={() => handleCreateAutoSPK(p)}
                              className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors"
                              title="Buat SPK Produksi Restock Otomatis"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Pergerakan Masuk/Keluar/Mutasi */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari no transaksi, SKU, ref, atau PIC..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <select
                value={txTypeFilter}
                onChange={e => setTxTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="all">Semua Jenis Pergerakan</option>
                <option value="BARANG_MASUK_PRODUKSI">📥 Barang Masuk Produksi</option>
                <option value="BARANG_MASUK_PEMBELIAN">📥 Barang Masuk Pembelian</option>
                <option value="BARANG_KELUAR_PENJUALAN">📤 Barang Keluar Penjualan</option>
                <option value="MUTASI_GUDANG">🔀 Mutasi Gudang / Channel</option>
                <option value="RETUR_MASUK">↩️ Retur Masuk</option>
                <option value="STOCK_OPNAME_ADJUSTMENT">📋 Penyesuaian Opname</option>
              </select>
            </div>

            <button
              onClick={() => setShowManualMovementModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Pergerakan Manual</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No Transaksi & Tanggal</th>
                  <th className="py-3 px-3">Jenis Pergerakan</th>
                  <th className="py-3 px-3">Item / Produk / SKU</th>
                  <th className="py-3 px-3 text-center">Perubahan Qty</th>
                  <th className="py-3 px-3">Dari Lokasi → Tujuan Lokasi</th>
                  <th className="py-3 px-3">PIC / Petugas</th>
                  <th className="py-3 px-4">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-slate-900">{tx.transactionNumber}</p>
                      <p className="text-[10px] text-slate-400">{tx.date}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tx.type === 'BARANG_MASUK_PRODUKSI' || tx.type === 'BARANG_MASUK_PEMBELIAN' ? 'bg-emerald-100 text-emerald-800' :
                        tx.type === 'BARANG_KELUAR_PENJUALAN' ? 'bg-blue-100 text-blue-800' :
                        tx.type === 'PEMBELIAN_BAHAN' ? 'bg-purple-100 text-purple-800' :
                        tx.type === 'RETUR_MASUK' ? 'bg-amber-100 text-amber-800' :
                        tx.type === 'MUTASI_GUDANG' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800">{tx.productName || tx.materialName}</p>
                      {tx.skuCode && <p className="text-[10px] text-slate-400 font-mono">{tx.skuCode}</p>}
                      {tx.referenceNo && (
                        <p className="text-[10px] text-slate-400 font-mono">Ref: {tx.referenceNo}</p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold font-mono">
                      <span className={`text-sm ${tx.qtyChange > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {tx.qtyChange > 0 ? `+${tx.qtyChange}` : tx.qtyChange} {tx.unit}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      <span>{tx.fromLocation}</span>
                      <span className="text-slate-400 mx-1.5 font-bold">→</span>
                      <span className="font-medium text-slate-900">{tx.toLocation}</span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">{tx.pic}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{tx.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stock Opname */}
      {activeSubTab === 'opname' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit Fisik Stock Opname & Koreksi Selisih</h3>
                <p className="text-xs text-slate-500">
                  Bandingkan pencatatan stok sistem dengan hitungan fisik riil di rak gudang untuk mendeteksi barang hilang atau sample.
                </p>
              </div>

              <button
                onClick={() => setShowOpnameModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Mulai Audit Opname SKU</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No Opname & Tanggal</th>
                    <th className="py-3 px-3">Produk / SKU</th>
                    <th className="py-3 px-3 text-center">Stok Sistem</th>
                    <th className="py-3 px-3 text-center font-bold">Stok Fisik Riil</th>
                    <th className="py-3 px-3 text-center font-bold">Selisih Unit</th>
                    <th className="py-3 px-3 text-right">Valuasi Selisih (Rp)</th>
                    <th className="py-3 px-3">Alasan / Keterangan</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockOpnames.map(op => (
                    <tr key={op.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-slate-900">{op.opnameNumber}</p>
                        <p className="text-[10px] text-slate-400">{op.date}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{op.productName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{op.skuCode}</p>
                      </td>

                      <td className="py-3 px-3 text-center text-slate-600">{op.systemStock} pcs</td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">{op.physicalStock} pcs</td>

                      <td className="py-3 px-3 text-center font-bold">
                        <span className={op.discrepancy === 0 ? 'text-emerald-700' : op.discrepancy > 0 ? 'text-blue-700' : 'text-rose-700'}>
                          {op.discrepancy > 0 ? `+${op.discrepancy}` : op.discrepancy} pcs
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800">
                        Rp {op.discrepancyValue.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-xs">{op.reason}</td>

                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {op.status === 'approved' ? 'Telah Disesuaikan' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-600 font-medium">{op.auditorName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Minimum Stock Warnings (Safety Stock Alert Center) */}
      {activeSubTab === 'lowstock' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-rose-100 text-rose-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-950">Pusat Peringatan Level Minimum Stock</h4>
                <p className="text-xs text-rose-800 mt-1">
                  Sistem secara otomatis mendeteksi SKU produk jadi & bahan baku yang mendekati atau berada di bawah level minimum. Segera terbitkan SPK atau re-order bahan agar pesanan tidak mengalami <em>out-of-stock</em>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Products Alert List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Produk Jadi Menipis</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                    {lowStockProducts.length} Kritis
                  </span>
                </h4>
              </div>

              <div className="space-y-2.5">
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-800">Semua Stok Produk Jadi Aman!</p>
                    <p className="text-[11px] text-slate-400">Tidak ada produk yang berada di bawah level minimum.</p>
                  </div>
                ) : (
                  lowStockProducts.map(p => (
                    <div key={p.id} className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          SKU: {p.sku} • {p.color} ({p.size})
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="font-bold text-rose-700">Sisa Fisik: {p.stockGudang} pcs</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">Batas Min: {p.minStockAlert} pcs</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openMinStockModal(p)}
                          className="px-2.5 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50"
                        >
                          Ubah Min
                        </button>
                        <button
                          onClick={() => handleCreateAutoSPK(p)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Buat SPK Restock</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Materials Alert List */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Bahan Baku / Kain Menipis</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                    {lowStockMaterials.length} Perlu Order
                  </span>
                </h4>
              </div>

              <div className="space-y-2.5">
                {lowStockMaterials.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold text-emerald-800">Semua Stok Bahan Baku & Kain Aman!</p>
                    <p className="text-[11px] text-slate-400">Kuota kain, benang, dan packaging mencukupi.</p>
                  </div>
                ) : (
                  lowStockMaterials.map(m => (
                    <div key={m.id} className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Supplier: {m.supplier}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="font-bold text-amber-800">Stok: {m.currentStock} {m.unit}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">Batas Min: {m.minStock} {m.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setShowAddMaterialModal(true)}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs"
                        >
                          + Beli ke Supplier
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Bahan Baku & Kain */}
      {activeSubTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stok Bahan Baku Kain, Label & Packaging</h3>
              <p className="text-xs text-slate-500">Bahan baku terpotong otomatis saat SPK Produksi diterbitkan.</p>
            </div>
            <button
              onClick={() => setShowAddMaterialModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl"
            >
              + Tambah Bahan Baku
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Bahan</th>
                  <th className="py-3 px-3">Kategori Tipe</th>
                  <th className="py-3 px-3 text-center">Stok Terkini</th>
                  <th className="py-3 px-3 text-right">Harga Beli Satuan</th>
                  <th className="py-3 px-3 text-right">Total Nilai Bahan</th>
                  <th className="py-3 px-3">Supplier Utama</th>
                  <th className="py-3 px-4 text-center">Batas Minimum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{m.code}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono text-sm">
                      {m.currentStock} {m.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      Rp {m.avgCostPerUnit.toLocaleString('id-ID')} / {m.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-emerald-800">
                      Rp {(m.currentStock * m.avgCostPerUnit).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.supplier}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs font-bold ${m.currentStock <= m.minStock ? 'text-rose-600' : 'text-slate-500'}`}>
                        {m.minStock} {m.unit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Catat Pergerakan Arus Barang Manual (In / Out / Return) */}
      {showManualMovementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Catat Arus Barang Masuk / Keluar / Retur</h3>
              <button onClick={() => setShowManualMovementModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualMovementSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Item</label>
                  <select
                    value={manualMovementForm.itemCategory}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, itemCategory: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="product">Produk Jadi (SKU)</option>
                    <option value="material">Bahan Baku / Kain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Pergerakan</label>
                  <select
                    value={manualMovementForm.type}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="BARANG_MASUK_PRODUKSI">📥 Barang Masuk Hasil Produksi</option>
                    <option value="BARANG_MASUK_PEMBELIAN">📥 Barang Masuk Pembelian</option>
                    <option value="BARANG_KELUAR_PENJUALAN">📤 Barang Keluar Penjualan</option>
                    <option value="RETUR_MASUK">↩️ Retur Masuk (Restock Gudang)</option>
                    <option value="RETUR_REJECT">🚫 Retur Reject (Karantina)</option>
                    <option value="MUTASI_GUDANG">🔀 Mutasi Antar Gudang/Channel</option>
                  </select>
                </div>
              </div>

              {manualMovementForm.itemCategory === 'product' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Produk SKU</label>
                  <select
                    value={manualMovementForm.skuId}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, skuId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) | Stok Gudang: {p.stockGudang} pcs
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Bahan Baku</label>
                  <select
                    value={manualMovementForm.materialId}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, materialId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} | Stok: {m.currentStock} {m.unit}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Perubahan (Qty)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualMovementForm.qty}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, qty: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No Referensi (PO / SPK / Resi)</label>
                  <input
                    type="text"
                    placeholder="Misal: SPK-2609-001 / RESI-9918"
                    value={manualMovementForm.referenceNo}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, referenceNo: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dari Asal Lokasi</label>
                  <input
                    type="text"
                    value={manualMovementForm.fromLocation}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, fromLocation: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ke Tujuan Lokasi</label>
                  <input
                    type="text"
                    value={manualMovementForm.toLocation}
                    onChange={e => setManualMovementForm({ ...manualMovementForm, toLocation: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Restock 50 pcs dari Konveksi Kudus setelah lolos QC"
                  value={manualMovementForm.notes}
                  onChange={e => setManualMovementForm({ ...manualMovementForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualMovementModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Simpan Arus Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Minimum Stock (Safety Stock Threshold) */}
      {showMinStockEditModal && selectedSkuForMinStock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Atur Minimum Stock (Safety Alert)</h3>
              <button onClick={() => setShowMinStockEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMinStock} className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-900 text-xs">{selectedSkuForMinStock.name}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{selectedSkuForMinStock.sku}</p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Stok Saat Ini:</span>
                  <span className="font-bold text-slate-900">{selectedSkuForMinStock.stockGudang} pcs</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Minimum Stock Alert (Pcs)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={tempMinStockValue}
                  onChange={e => setTempMinStockValue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-black text-slate-900 border border-slate-200 rounded-xl"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Sistem akan otomatis memberikan notifikasi kepada <strong>Owner</strong> dan <strong>Tim Gudang</strong> jika stok gudang menyentuh atau kurang dari angka ini.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMinStockEditModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-sm"
                >
                  Simpan Level Batas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kartu Stok (Stock Card Ledger) per SKU */}
      {showStockCardModal && selectedSkuForCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Kartu Stok (Stock Card Ledger)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSkuForCard.name} ({selectedSkuForCard.sku})
                </p>
              </div>
              <button onClick={() => setShowStockCardModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4 shrink-0 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500">Stok Fisik Gudang</span>
                <p className="text-lg font-black text-slate-900 font-mono mt-1">{selectedSkuForCard.stockGudang} Pcs</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <span className="text-blue-700">Alokasi Marketplace</span>
                <p className="text-lg font-black text-blue-800 font-mono mt-1">{selectedSkuForCard.stockMarketplace} Pcs</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="text-emerald-700">Batas Min Safety</span>
                <p className="text-lg font-black text-emerald-800 font-mono mt-1">{selectedSkuForCard.minStockAlert} Pcs</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Riwayat Transaksi Masuk / Keluar</h4>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Tanggal & Ref</th>
                    <th className="py-2 px-3">Jenis Arus</th>
                    <th className="py-2 px-3 text-center">Masuk / Keluar</th>
                    <th className="py-2 px-3">Lokasi / PIC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryTransactions
                    .filter(tx => tx.skuId === selectedSkuForCard.id || tx.skuCode === selectedSkuForCard.sku)
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <p className="font-mono font-bold text-slate-900">{tx.date}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{tx.referenceNo || tx.transactionNumber}</p>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-[10px] font-semibold text-slate-700">
                            {tx.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold">
                          <span className={tx.qtyChange > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {tx.qtyChange > 0 ? `+${tx.qtyChange}` : tx.qtyChange} pcs
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[11px] text-slate-500">
                          <p>{tx.toLocation}</p>
                          <p className="text-[10px] text-slate-400">PIC: {tx.pic}</p>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-3 shrink-0">
              <button
                onClick={() => setShowStockCardModal(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Tutup Kartu Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mutasi Stok Antar Gudang / Marketplace */}
      {showMutationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Mutasi Alokasi Stok Gudang & Marketplace</h3>
              <button onClick={() => setShowMutationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMutationSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Produk SKU</label>
                <select
                  value={mutationForm.skuId}
                  onChange={e => setMutationForm({ ...mutationForm, skuId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.size} - {p.color}) | Gudang: {p.stockGudang} pcs | Live Mktp: {p.stockMarketplace} pcs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Pcs yang Dipindahkan</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={mutationForm.qty}
                  onChange={e => setMutationForm({ ...mutationForm, qty: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dari Lokasi Asal</label>
                  <select
                    value={mutationForm.from}
                    onChange={e => setMutationForm({ ...mutationForm, from: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Gudang Utama Pusat">Gudang Utama Pusat</option>
                    <option value="Alokasi Stok Live Shopee & TikTok">Alokasi Stok Live Shopee & TikTok</option>
                    <option value="Gudang Butik Offline">Gudang Butik Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Menuju Lokasi Tujuan</label>
                  <select
                    value={mutationForm.to}
                    onChange={e => setMutationForm({ ...mutationForm, to: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Alokasi Stok Live Shopee & TikTok">Alokasi Stok Live Shopee & TikTok</option>
                    <option value="Gudang Utama Pusat">Gudang Utama Pusat</option>
                    <option value="Gudang Butik Offline">Gudang Butik Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Keterangan / Alasan Mutasi</label>
                <input
                  type="text"
                  placeholder="Misal: Persiapan flash sale TikTok live malam ini"
                  value={mutationForm.notes}
                  onChange={e => setMutationForm({ ...mutationForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMutationModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                >
                  Eksekusi Mutasi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Input Stock Opname */}
      {showOpnameModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Audit Stock Opname Fisik</h3>
              <button onClick={() => setShowOpnameModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpnameSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Produk SKU yang Dihitung</label>
                <select
                  value={opnameForm.skuId}
                  onChange={e => {
                    const selected = products.find(p => p.id === e.target.value);
                    setOpnameForm({
                      ...opnameForm,
                      skuId: e.target.value,
                      physicalStock: selected ? selected.stockGudang : 0
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - Stok Sistem: {p.stockGudang} pcs
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah Fisik Riil yang Dihitung di Rak (Pcs)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={opnameForm.physicalStock}
                  onChange={e => setOpnameForm({ ...opnameForm, physicalStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm font-black text-slate-900 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Selisih / Keterangan Audit</label>
                <textarea
                  rows={2}
                  placeholder="Misal: 2 pcs sample display photoshoot konten TikTok atau rusak saat handling"
                  value={opnameForm.reason}
                  onChange={e => setOpnameForm({ ...opnameForm, reason: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOpnameModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Simpan & Sesuaikan Saldo Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Bahan Baku */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Beli / Tambah Bahan Baku Baru</h3>
              <button onClick={() => setShowAddMaterialModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bahan / Kain</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kain Ceruty Babydoll Pink"
                  value={materialForm.name}
                  onChange={e => setMaterialForm({ ...materialForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Bahan</label>
                  <select
                    value={materialForm.type}
                    onChange={e => setMaterialForm({ ...materialForm, type: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Kain">Kain</option>
                    <option value="Benang">Benang</option>
                    <option value="Kancing">Kancing</option>
                    <option value="Resleting">Resleting</option>
                    <option value="Label">Label</option>
                    <option value="Hangtag">Hangtag</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan</label>
                  <select
                    value={materialForm.unit}
                    onChange={e => setMaterialForm({ ...materialForm, unit: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="meter">Meter</option>
                    <option value="yard">Yard</option>
                    <option value="roll">Roll</option>
                    <option value="pcs">Pcs</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Masuk</label>
                  <input
                    type="number"
                    value={materialForm.currentStock}
                    onChange={e => setMaterialForm({ ...materialForm, currentStock: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Beli / Satuan (Rp)</label>
                  <input
                    type="number"
                    value={materialForm.avgCostPerUnit}
                    onChange={e => setMaterialForm({ ...materialForm, avgCostPerUnit: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Toko Kain</label>
                <input
                  type="text"
                  placeholder="Misal: PT Textile Mega Prima Bandung"
                  value={materialForm.supplier}
                  onChange={e => setMaterialForm({ ...materialForm, supplier: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMaterialModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
