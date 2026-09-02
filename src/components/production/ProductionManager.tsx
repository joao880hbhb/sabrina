import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductionPlan, SpkStatus } from '../../types';
import { 
  Scissors, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Printer, 
  Layers, 
  Percent, 
  TrendingDown, 
  TrendingUp,
  User,
  X,
  FileCheck,
  Check
} from 'lucide-react';

export const ProductionManager: React.FC = () => {
  const { 
    productionPlans, 
    products, 
    materials, 
    createProductionSPK, 
    updateProductionStatus 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showCreateSpkModal, setShowCreateSpkModal] = useState(false);
  const [showQcResultModal, setShowQcResultModal] = useState<ProductionPlan | null>(null);
  const [printSpk, setPrintSpk] = useState<ProductionPlan | null>(null);

  // New SPK Form State
  const [spkForm, setSpkForm] = useState({
    title: '',
    skuId: products[0]?.id || '',
    targetQty: 100,
    startDate: new Date().toISOString().split('T')[0],
    deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tailorVendorName: 'Konveksi Barokah Taylor (Kudus)',
    materialId: materials[0]?.id || '',
    notes: 'Perhatikan kerapian jahitan stik balik dan pasang label rose gold'
  });

  // QC & Actual HPP Form State
  const [qcForm, setQcForm] = useState({
    finishedGoodQty: 98,
    rejectQty: 2,
    reworkQty: 0,
    actualHpp: 115000,
    status: 'completed' as SpkStatus
  });

  const selectedProductForSpk = products.find(p => p.id === spkForm.skuId) || products[0];
  const selectedMaterialForSpk = materials.find(m => m.id === spkForm.materialId) || materials[0];
  const estimatedFabricMeters = selectedProductForSpk ? Number((selectedProductForSpk.materialUsagePerPcs * spkForm.targetQty).toFixed(1)) : 0;

  const filteredPlans = productionPlans.filter(p => {
    const matchSearch = p.spkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.tailorVendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Production Metrics
  const totalInProduction = productionPlans.filter(p => p.status === 'sewing' || p.status === 'cutting').reduce((s, p) => s + p.targetQty, 0);
  const totalFinishedGoods = productionPlans.reduce((s, p) => s + p.finishedGoodQty, 0);
  const totalRejects = productionPlans.reduce((s, p) => s + p.rejectQty, 0);
  const rejectRate = (totalFinishedGoods + totalRejects) > 0 ? (totalRejects / (totalFinishedGoods + totalRejects)) * 100 : 0;

  const handleCreateSpkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForSpk) return;

    createProductionSPK({
      title: spkForm.title || `Produksi ${selectedProductForSpk.name} (${spkForm.targetQty} Pcs)`,
      skuId: selectedProductForSpk.id,
      skuCode: selectedProductForSpk.sku,
      productName: selectedProductForSpk.name,
      targetQty: spkForm.targetQty,
      startDate: spkForm.startDate,
      deadlineDate: spkForm.deadlineDate,
      tailorVendorName: spkForm.tailorVendorName,
      materialUsed: [
        {
          materialId: selectedMaterialForSpk?.id || 'mat-1',
          materialName: selectedMaterialForSpk?.name || 'Kain Utama',
          qtyPlan: estimatedFabricMeters,
          qtyActual: estimatedFabricMeters,
          unit: selectedMaterialForSpk?.unit || 'meter'
        }
      ],
      standardHpp: selectedProductForSpk.hppFinal,
      actualHpp: selectedProductForSpk.hppFinal,
      finishedGoodQty: 0,
      rejectQty: 0,
      reworkQty: 0,
      status: 'cutting',
      notes: spkForm.notes
    });

    setShowCreateSpkModal(false);
    alert('SPK Produksi berhasil diterbitkan!');
  };

  const handleOpenQcModal = (plan: ProductionPlan) => {
    setShowQcResultModal(plan);
    setQcForm({
      finishedGoodQty: plan.targetQty,
      rejectQty: 0,
      reworkQty: 0,
      actualHpp: plan.standardHpp,
      status: 'completed'
    });
  };

  const handleSaveQcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQcResultModal) return;

    updateProductionStatus(
      showQcResultModal.id,
      qcForm.status,
      qcForm.finishedGoodQty,
      qcForm.rejectQty,
      qcForm.reworkQty,
      qcForm.actualHpp
    );

    setShowQcResultModal(null);
    alert('Hasil QC & Realisasi HPP berhasil disimpan dan stok gudang otomatis bertambah!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-orange-100 text-orange-800 text-xs font-bold uppercase">Manufaktur & Konveksi</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Rencana Produksi & Surat Perintah Kerja (SPK)</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pantau pemakaian meteran kain, proses cutting, jahitan konveksi, QC reject, dan selisih HPP standar vs aktual.
          </p>
        </div>

        <button
          onClick={() => setShowCreateSpkModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat SPK Produksi Baru</span>
        </button>
      </div>

      {/* Production KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <span className="text-[10px] font-bold uppercase text-blue-700">Sedang Dikerjakan</span>
          <p className="text-xl font-black text-blue-900 mt-0.5">{totalInProduction} Pcs</p>
          <span className="text-[10px] text-blue-700">Dalam proses cutting & jahit</span>
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Total Barang Jadi (QC Lolos)</span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">{totalFinishedGoods} Pcs</p>
          <span className="text-[10px] text-emerald-700">Siap jual & masuk gudang</span>
        </div>

        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
          <span className="text-[10px] font-bold uppercase text-rose-700">Barang Reject / Cacat</span>
          <p className="text-xl font-black text-rose-800 mt-0.5">{totalRejects} Pcs</p>
          <span className="text-[10px] text-rose-700">Tingkat reject: {rejectRate.toFixed(1)}%</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total SPK Terbit</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{productionPlans.length} Batch</p>
          <span className="text-[10px] text-slate-500">Konveksi internal & mitra</span>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No SPK, Nama Gamis, atau Vendor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="all">Semua Status SPK</option>
            <option value="cutting">Cutting (Potong Kain)</option>
            <option value="sewing">Sewing (Sedang Dijahit)</option>
            <option value="finishing_qc">Finishing & QC</option>
            <option value="completed">Completed (Selesai)</option>
          </select>
        </div>
      </div>

      {/* SPK Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No SPK & Judul</th>
                <th className="py-3 px-3">Produk & Target</th>
                <th className="py-3 px-3">Bahan Kain (Rencana vs Riil)</th>
                <th className="py-3 px-3">Mitra Penjahit / Konveksi</th>
                <th className="py-3 px-3">Target Deadline</th>
                <th className="py-3 px-3 text-right">HPP (Standar vs Riil)</th>
                <th className="py-3 px-3 text-center">Hasil QC</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPlans.map(plan => {
                const isUnderHpp = plan.actualHpp < plan.standardHpp;
                const isOverHpp = plan.actualHpp > plan.standardHpp;

                return (
                  <tr key={plan.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* No SPK & Judul */}
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900 text-xs">{plan.spkNumber}</p>
                      <p className="font-semibold text-slate-700 text-xs">{plan.title}</p>
                      <span className="text-[10px] text-slate-400">Dibuat: {plan.createdAt}</span>
                    </td>

                    {/* Produk & Target */}
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800">{plan.productName}</p>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Target: {plan.targetQty} Pcs
                      </span>
                    </td>

                    {/* Bahan Kain */}
                    <td className="py-3.5 px-3 text-xs">
                      {plan.materialUsed.map((m, idx) => (
                        <div key={idx}>
                          <p className="text-slate-700 font-medium">{m.materialName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Plan: {m.qtyPlan} {m.unit} | Real: {m.qtyActual} {m.unit}
                          </p>
                        </div>
                      ))}
                    </td>

                    {/* Vendor */}
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-slate-800">{plan.tailorVendorName}</p>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{plan.deadlineDate}</p>
                      <span className="text-[10px] text-slate-500">Mulai: {plan.startDate}</span>
                    </td>

                    {/* HPP Variance */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      <div>
                        <p className="text-slate-500 text-[10px]">Std: Rp {plan.standardHpp.toLocaleString('id-ID')}</p>
                        <p className="font-bold text-slate-900">Aktual: Rp {plan.actualHpp.toLocaleString('id-ID')}</p>
                        {plan.status === 'completed' && (
                          <span className={`text-[10px] font-bold ${isUnderHpp ? 'text-emerald-700' : isOverHpp ? 'text-rose-700' : 'text-slate-500'}`}>
                            {isUnderHpp ? `Hemat Rp ${(plan.standardHpp - plan.actualHpp).toLocaleString('id-ID')}` :
                             isOverHpp ? `Boros Rp ${(plan.actualHpp - plan.standardHpp).toLocaleString('id-ID')}` : 'Sesuai Standar'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Hasil QC */}
                    <td className="py-3.5 px-3 text-center">
                      {plan.status === 'completed' ? (
                        <div className="space-y-0.5 text-[11px]">
                          <p className="font-bold text-emerald-700">Lolos: {plan.finishedGoodQty} pcs</p>
                          {plan.rejectQty > 0 && <p className="text-rose-600 font-medium">Reject: {plan.rejectQty} pcs</p>}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Menunggu jahit selesai</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        plan.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        plan.status === 'sewing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                        plan.status === 'cutting' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {plan.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {plan.status !== 'completed' && (
                          <button
                            onClick={() => handleOpenQcModal(plan)}
                            className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                            title="Input Hasil QC & Masukkan ke Stok Gudang"
                          >
                            Input QC
                          </button>
                        )}
                        <button
                          onClick={() => setPrintSpk(plan)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Cetak SPK Format Resmi"
                        >
                          <Printer className="w-3.5 h-3.5" />
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

      {/* Modal: Buat SPK Baru */}
      {showCreateSpkModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Terbitkan Surat Perintah Kerja (SPK) Produksi</h3>
              <button onClick={() => setShowCreateSpkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpkSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Produk SKU yang Hendak Diproduksi</label>
                <select
                  value={spkForm.skuId}
                  onChange={e => setSpkForm({ ...spkForm, skuId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) • Size {p.size} - HPP Standar: Rp {p.hppFinal.toLocaleString('id-ID')} | Stok Gudang: {p.stockGudang} pcs
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Produksi (Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={spkForm.targetQty}
                    onChange={e => setSpkForm({ ...spkForm, targetQty: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={spkForm.startDate}
                    onChange={e => setSpkForm({ ...spkForm, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline Selesai</label>
                  <input
                    type="date"
                    required
                    value={spkForm.deadlineDate}
                    onChange={e => setSpkForm({ ...spkForm, deadlineDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bahan Kain yang Dialokasikan</label>
                  <select
                    value={spkForm.materialId}
                    onChange={e => setSpkForm({ ...spkForm, materialId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    {materials.filter(m => m.type === 'Kain').map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Stok Ready: {m.currentStock} {m.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mitra Konveksi / Penjahit</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Konveksi Barokah Taylor (Kudus)"
                    value={spkForm.tailorVendorName}
                    onChange={e => setSpkForm({ ...spkForm, tailorVendorName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs flex items-center justify-between">
                <div>
                  <p className="text-blue-900 font-semibold">Estimasi Kebutuhan Bahan Kain:</p>
                  <p className="text-[11px] text-blue-700">
                    {spkForm.targetQty} Pcs × {selectedProductForSpk?.materialUsagePerPcs} meter/pcs
                  </p>
                </div>
                <p className="text-lg font-black text-blue-900">{estimatedFabricMeters} Meter</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruksi Khusus & Catatan Penjahit</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Jahitan stik balik, pasang label rose gold di leher bagian dalam, kancing bungkus"
                  value={spkForm.notes}
                  onChange={e => setSpkForm({ ...spkForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateSpkModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Terbitkan SPK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Input QC & Actual HPP */}
      {showQcResultModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Input Hasil QC & Selesaikan SPK</h3>
              <button onClick={() => setShowQcResultModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQcSubmit} className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">{showQcResultModal.spkNumber}</p>
                <p className="text-slate-600">{showQcResultModal.productName} (Target: {showQcResultModal.targetQty} pcs)</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-emerald-800 mb-1">Barang Jadi Lolos QC (Pcs)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={qcForm.finishedGoodQty}
                    onChange={e => setQcForm({ ...qcForm, finishedGoodQty: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-emerald-50/50 border border-emerald-300 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-rose-700 mb-1">Barang Reject / Cacat (Pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={qcForm.rejectQty}
                    onChange={e => setQcForm({ ...qcForm, rejectQty: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 text-xs bg-rose-50/50 border border-rose-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">HPP Aktual Riil Per Pcs (Rp)</label>
                <input
                  type="number"
                  value={qcForm.actualHpp}
                  onChange={e => setQcForm({ ...qcForm, actualHpp: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-bold"
                />
                <span className="text-[10px] text-slate-400">HPP Standar Awal: Rp {showQcResultModal.standardHpp.toLocaleString('id-ID')}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Pengerjaan</label>
                <select
                  value={qcForm.status}
                  onChange={e => setQcForm({ ...qcForm, status: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl font-medium"
                >
                  <option value="completed">Completed (Selesai & Masuk Stok Gudang)</option>
                  <option value="finishing_qc">Finishing & QC (Sebagian)</option>
                  <option value="sewing">Masih Jahit</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQcResultModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Simpan & Update Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cetak Format Resmi SPK */}
      {printSpk && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200">
            {/* SPK Document Format */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">SABHIRA FASHION APPAREL</h2>
                <p className="text-xs text-slate-500">Workshop & Production Division • Bandung, Jawa Barat</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-md">SURAT PERINTAH KERJA</span>
                <p className="font-mono font-bold text-slate-900 text-xs mt-1">{printSpk.spkNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 text-xs">
              <div>
                <p className="text-slate-500">Mitra Penjahit / Vendor:</p>
                <p className="font-bold text-slate-900 text-sm">{printSpk.tailorVendorName}</p>
                <p className="text-slate-600 mt-1">Tanggal Mulai: {printSpk.startDate}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Deadline Selesai:</p>
                <p className="font-bold text-rose-700 text-sm">{printSpk.deadlineDate}</p>
                <p className="text-slate-600 mt-1">Status: <strong className="uppercase">{printSpk.status}</strong></p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs my-4">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-2.5">Nama Produk & SKU</th>
                    <th className="p-2.5 text-center">Target Pcs</th>
                    <th className="p-2.5">Bahan Kain Dialokasikan</th>
                    <th className="p-2.5 text-right">Ongkos Jahit Std</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">{printSpk.productName} ({printSpk.skuCode})</td>
                    <td className="p-2.5 text-center font-bold text-emerald-800">{printSpk.targetQty} Pcs</td>
                    <td className="p-2.5">
                      {printSpk.materialUsed.map((m, i) => `${m.materialName} (${m.qtyPlan} ${m.unit})`).join(', ')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">Rp {printSpk.standardHpp.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p className="font-bold mb-0.5">Instruksi Khusus Produksi:</p>
              <p>{printSpk.notes || 'Patuhi standar kerapian jahitan Sabhira dan lolos QC sebelum packing.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-8 pt-4 border-t border-slate-200">
              <div>
                <p className="text-slate-500 mb-12">Kepala Produksi Sabhira</p>
                <p className="font-bold text-slate-900">( Kang Asep / Sabhira )</p>
              </div>
              <div>
                <p className="text-slate-500 mb-12">Penerima Kerja / Penjahit</p>
                <p className="font-bold text-slate-900">( {printSpk.tailorVendorName} )</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setPrintSpk(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen SPK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
