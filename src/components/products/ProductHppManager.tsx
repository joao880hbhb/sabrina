import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductSKU, HppBreakdown } from '../../types';
import * as XLSX from 'xlsx';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Download, 
  Scissors, 
  Layers, 
  Percent, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  Sliders,
  DollarSign,
  Boxes,
  X
} from 'lucide-react';

export const ProductHppManager: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [marginFilter, setMarginFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductSKU | null>(null);
  const [inspectHppProduct, setInspectHppProduct] = useState<ProductSKU | null>(null);

  // Form State
  const defaultHpp: HppBreakdown = {
    bahanKain: 50000,
    cutting: 3500,
    jahit: 25000,
    obras: 3500,
    sablonPrinting: 0,
    label: 1500,
    hangtag: 1200,
    packaging: 4000,
    overhead: 4500
  };

  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    category: ProductSKU['category'];
    color: string;
    size: ProductSKU['size'];
    sellingPrice: number;
    materialName: string;
    materialUsagePerPcs: number;
    hppBreakdown: HppBreakdown;
    stockGudang: number;
    stockMarketplace: number;
    minStockAlert: number;
    imageUrl: string;
    status: ProductSKU['status'];
  }>({
    sku: '',
    name: '',
    category: 'Gamis',
    color: '',
    size: 'M',
    sellingPrice: 225000,
    materialName: 'Armani Silk Premium',
    materialUsagePerPcs: 2.7,
    hppBreakdown: defaultHpp,
    stockGudang: 50,
    stockMarketplace: 25,
    minStockAlert: 20,
    imageUrl: '',
    status: 'active'
  });

  // Calculate live HPP inside form
  const currentCalculatedHpp = 
    formData.hppBreakdown.bahanKain +
    formData.hppBreakdown.cutting +
    formData.hppBreakdown.jahit +
    formData.hppBreakdown.obras +
    formData.hppBreakdown.sablonPrinting +
    formData.hppBreakdown.label +
    formData.hppBreakdown.hangtag +
    formData.hppBreakdown.packaging +
    formData.hppBreakdown.overhead;

  const currentMarginRp = formData.sellingPrice - currentCalculatedHpp;
  const currentMarginPercent = formData.sellingPrice > 0 ? (currentMarginRp / formData.sellingPrice) * 100 : 0;

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    
    let matchMargin = true;
    if (marginFilter === 'high') matchMargin = p.marginPercent >= 50;
    if (marginFilter === 'mid') matchMargin = p.marginPercent >= 35 && p.marginPercent < 50;
    if (marginFilter === 'low') matchMargin = p.marginPercent < 35;

    return matchSearch && matchCat && matchMargin;
  });

  const categories = ['all', 'Gamis', 'Tunik', 'Hijab', 'Dress', 'Kemeja', 'Mukena', 'Outer', 'Bawahan'];

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SBH-GMS-${Date.now().toString().slice(-4)}`,
      name: '',
      category: 'Gamis',
      color: '',
      size: 'M',
      sellingPrice: 225000,
      materialName: 'Armani Silk Premium',
      materialUsagePerPcs: 2.7,
      hppBreakdown: defaultHpp,
      stockGudang: 50,
      stockMarketplace: 25,
      minStockAlert: 20,
      imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=300&auto=format&fit=crop&q=80',
      status: 'active'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (prod: ProductSKU) => {
    setEditingProduct(prod);
    setFormData({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      color: prod.color,
      size: prod.size,
      sellingPrice: prod.sellingPrice,
      materialName: prod.materialName,
      materialUsagePerPcs: prod.materialUsagePerPcs,
      hppBreakdown: { ...prod.hppBreakdown },
      stockGudang: prod.stockGudang,
      stockMarketplace: prod.stockMarketplace,
      minStockAlert: prod.minStockAlert,
      imageUrl: prod.imageUrl || '',
      status: prod.status
    });
    setShowAddModal(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      alert('Nama Produk dan SKU wajib diisi!');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData
      });
    } else {
      addProduct({
        ...formData
      });
    }

    setShowAddModal(false);
  };

  const exportProductCatalog = () => {
    const exportData = filteredProducts.map(p => ({
      SKU: p.sku,
      'Nama Produk': p.name,
      Kategori: p.category,
      Warna: p.color,
      Size: p.size,
      'Harga Jual (Rp)': p.sellingPrice,
      'Bahan Kain': p.materialName,
      'Pemakaian Kain (m)': p.materialUsagePerPcs,
      'Biaya Kain (Rp)': p.hppBreakdown.bahanKain,
      'Ongkos Cutting (Rp)': p.hppBreakdown.cutting,
      'Ongkos Jahit (Rp)': p.hppBreakdown.jahit,
      'Biaya Obras (Rp)': p.hppBreakdown.obras,
      'Sablon/Bordir (Rp)': p.hppBreakdown.sablonPrinting,
      'Biaya Label (Rp)': p.hppBreakdown.label,
      'Biaya Hangtag (Rp)': p.hppBreakdown.hangtag,
      'Biaya Packaging (Rp)': p.hppBreakdown.packaging,
      'Overhead Pabrik (Rp)': p.hppBreakdown.overhead,
      'HPP Final (Rp)': p.hppFinal,
      'Margin Laba (Rp)': p.marginRp,
      'Margin Laba (%)': `${p.marginPercent.toFixed(2)}%`,
      'Stok Gudang': p.stockGudang,
      'Stok Marketplace': p.stockMarketplace,
      'Total Stok': p.stockGudang + p.stockMarketplace
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Katalog & HPP Sabhira');
    XLSX.writeFile(wb, `Katalog_HPP_Sabhira_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">Master Data SKU</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Katalog Produk & Breakdown HPP</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Hitung HPP presisi hingga ke detail kain, cutting, ongkos jahit, obras, sablon/bordir, label, hangtag, packaging, & overhead.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportProductCatalog}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah SKU Baru</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-slate-50 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Katalog SKU</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{products.length} SKU</p>
          <span className="text-[10px] text-slate-500">Gamis, Tunik, Abaya, Hijab</span>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Rata-Rata Margin Laba</span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">
            {(products.reduce((s, p) => s + p.marginPercent, 0) / (products.length || 1)).toFixed(1)}%
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Tingkat profitabilitas sehat</span>
        </div>

        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-[10px] font-bold uppercase text-blue-700">Total Stok Ready</span>
          <p className="text-xl font-black text-blue-900 mt-0.5">
            {products.reduce((s, p) => s + p.stockGudang + p.stockMarketplace, 0)} Pcs
          </p>
          <span className="text-[10px] text-blue-700">Gudang & Marketplace</span>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <span className="text-[10px] font-bold uppercase text-amber-700">Total Nilai HPP Aset</span>
          <p className="text-xl font-black text-amber-900 mt-0.5">
            Rp {(products.reduce((s, p) => s + ((p.stockGudang + p.stockMarketplace) * p.hppFinal), 0) / 1000000).toFixed(1)} Jt
          </p>
          <span className="text-[10px] text-amber-700">Modal tertanam di barang</span>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari SKU, Nama Produk, atau Warna..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'Semua Kategori' : c}</option>
            ))}
          </select>

          {/* Margin Health Filter */}
          <select
            value={marginFilter}
            onChange={e => setMarginFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="all">Semua Tingkat Margin</option>
            <option value="high">Margin Tinggi (≥ 50%)</option>
            <option value="mid">Margin Sedang (35 - 50%)</option>
            <option value="low">Margin Tipis (&lt; 35%)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Produk & SKU</th>
                <th className="py-3 px-3">Kategori & Spek</th>
                <th className="py-3 px-3 text-right">Harga Jual</th>
                <th className="py-3 px-3 text-right text-amber-700">HPP Final</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-700">Margin Laba</th>
                <th className="py-3 px-3 text-center">Margin %</th>
                <th className="py-3 px-3 text-center">Stok (Gudang / Mktp)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(prod => {
                const isHealthy = prod.marginPercent >= 45;
                const isWarning = prod.marginPercent < 35;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Produk & SKU */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                            {prod.size}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{prod.name}</p>
                          <p className="font-mono text-[11px] text-slate-500">{prod.sku}</p>
                          <span className="text-[10px] text-slate-400">{prod.materialName} ({prod.materialUsagePerPcs}m)</span>
                        </div>
                      </div>
                    </td>

                    {/* Kategori & Spek */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold inline-block">
                          {prod.category}
                        </span>
                        <p className="text-[11px] text-slate-600">{prod.color} • Size: <strong className="text-slate-900">{prod.size}</strong></p>
                      </div>
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                      Rp {prod.sellingPrice.toLocaleString('id-ID')}
                    </td>

                    {/* HPP Final */}
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono font-bold text-amber-800">
                          Rp {prod.hppFinal.toLocaleString('id-ID')}
                        </span>
                        <button
                          onClick={() => setInspectHppProduct(prod)}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="Lihat Rincian HPP 10 Komponen"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Margin Laba */}
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                      Rp {prod.marginRp.toLocaleString('id-ID')}
                    </td>

                    {/* Margin % */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        isHealthy ? 'bg-emerald-100 text-emerald-800' :
                        isWarning ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prod.marginPercent.toFixed(1)}%
                      </span>
                    </td>

                    {/* Stok */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="text-xs">
                        <strong className={prod.stockGudang <= prod.minStockAlert ? 'text-rose-600' : 'text-slate-800'}>
                          {prod.stockGudang} pcs
                        </strong>
                        <span className="text-slate-400 text-[10px]"> / {prod.stockMarketplace} mktp</span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Produk & HPP"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus SKU ${prod.sku}?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus SKU"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Breakdown HPP Inspector */}
      {inspectHppProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rincian Komponen HPP Sabhira</h3>
                <p className="text-xs text-slate-500 font-mono">{inspectHppProduct.sku} • {inspectHppProduct.name}</p>
              </div>
              <button onClick={() => setInspectHppProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <div className="flex justify-between text-slate-700">
                  <span>1. Bahan Kain ({inspectHppProduct.materialName} - {inspectHppProduct.materialUsagePerPcs}m):</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.bahanKain.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>2. Ongkos Potong (Cutting):</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.cutting.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>3. Ongkos Jahit (Penjahit/Konveksi):</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.jahit.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>4. Biaya Obras:</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.obras.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>5. Sablon / Bordir / Plisket:</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.sablonPrinting.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>6. Woven/Satin Label Brand:</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.label.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>7. Hangtag & Tali:</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.hangtag.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>8. Packaging (Polymailer/Zipper bag):</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.packaging.toLocaleString('id-ID')}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>9. Overhead Pabrik (Listrik, QC, Penyusutan):</span>
                  <strong className="font-mono">Rp {inspectHppProduct.hppBreakdown.overhead.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Total HPP Final Produksi:</span>
                <span className="text-base font-black text-amber-900">Rp {inspectHppProduct.hppFinal.toLocaleString('id-ID')}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-800">Harga Jual: <strong>Rp {inspectHppProduct.sellingPrice.toLocaleString('id-ID')}</strong></span>
                  <p className="font-bold text-emerald-950">Margin Laba Bersih Per Pcs:</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-700">Rp {inspectHppProduct.marginRp.toLocaleString('id-ID')}</span>
                  <p className="text-[11px] font-bold text-emerald-800">({inspectHppProduct.marginPercent.toFixed(1)}%)</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectHppProduct(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit SKU & Simulator HPP */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit SKU & Penyesuaian HPP' : 'Tambah SKU Fashion Baru'}
                </h3>
                <p className="text-xs text-slate-500">Isi spesifikasi produk dan rincian ongkos produksi.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {/* Product Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: SBH-GMS-SLK-SGE-M"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Produk Fashion</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Gamis Silk Luxury Sage Green"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="Gamis">Gamis</option>
                    <option value="Tunik">Tunik</option>
                    <option value="Hijab">Hijab</option>
                    <option value="Dress">Dress</option>
                    <option value="Kemeja">Kemeja</option>
                    <option value="Mukena">Mukena</option>
                    <option value="Outer">Outer</option>
                    <option value="Bawahan">Bawahan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warna</label>
                  <input
                    type="text"
                    placeholder="Sage Green"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Size</label>
                  <select
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="All Size">All Size</option>
                    <option value="Jumbo">Jumbo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-emerald-800">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-emerald-300 bg-emerald-50/50 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Material Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Bahan Kain</label>
                  <input
                    type="text"
                    placeholder="Misal: Armani Silk Grade A"
                    value={formData.materialName}
                    onChange={e => setFormData({ ...formData, materialName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pemakaian Kain Per Pcs (Meter)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.materialUsagePerPcs}
                    onChange={e => setFormData({ ...formData, materialUsagePerPcs: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* 9 Komponen HPP Breakdown Fields */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 uppercase">9 Komponen Rincian HPP (Per Pcs)</span>
                  <span className="text-xs font-mono font-bold text-amber-900">
                    Total HPP: Rp {currentCalculatedHpp.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">1. Biaya Kain (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.bahanKain}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, bahanKain: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">2. Cutting / Potong (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.cutting}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, cutting: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">3. Ongkos Jahit (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.jahit}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, jahit: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">4. Obras (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.obras}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, obras: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">5. Sablon/Printing/Bordir (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.sablonPrinting}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, sablonPrinting: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">6. Woven Label (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.label}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, label: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">7. Hangtag (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.hangtag}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, hangtag: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">8. Packaging / Zipper (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.packaging}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, packaging: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600">9. Overhead / QC (Rp)</label>
                    <input
                      type="number"
                      value={formData.hppBreakdown.overhead}
                      onChange={e => setFormData({
                        ...formData,
                        hppBreakdown: { ...formData.hppBreakdown, overhead: Number(e.target.value) }
                      })}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Live Margin Calculation Bar */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <p className="text-emerald-800">
                    Harga: <strong>Rp {formData.sellingPrice.toLocaleString('id-ID')}</strong> | HPP: <strong>Rp {currentCalculatedHpp.toLocaleString('id-ID')}</strong>
                  </p>
                  <p className="text-xs font-bold text-emerald-950">Margin Keuntungan Bersih:</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-emerald-700">Rp {currentMarginRp.toLocaleString('id-ID')}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentMarginPercent >= 45 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {currentMarginPercent.toFixed(1)}% Margin
                  </span>
                </div>
              </div>

              {/* Stock Input */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Gudang (Pcs)</label>
                  <input
                    type="number"
                    value={formData.stockGudang}
                    onChange={e => setFormData({ ...formData, stockGudang: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Marketplace</label>
                  <input
                    type="number"
                    value={formData.stockMarketplace}
                    onChange={e => setFormData({ ...formData, stockMarketplace: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Minimum Stock</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={e => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
