import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SuratJalan, SuratJalanItem, SuratJalanPackageItem, MarketplaceOrder, TrackingCheckpoint } from '../../types';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { TrackingModal } from '../marketplace/TrackingModal';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  Truck, 
  CheckCircle, 
  Clock, 
  Send, 
  UserCheck, 
  Package,
  Calendar,
  X,
  Building,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  PenTool,
  Check,
  Eye,
  AlertOctagon,
  Copy,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const SuratJalanManager: React.FC = () => {
  const { 
    suratJalanList, 
    orders, 
    products, 
    materials, 
    currentUser,
    createSuratJalan, 
    createPackageDeliverySuratJalan,
    updateSuratJalanStatus,
    updateSuratJalanSignatures,
    updatePackageScanStatus,
    updateOrderTracking,
    setActiveNavTab
  } = useApp();

  // Primary Tab
  const [activeTab, setActiveTab] = useState<'pengantaran_paket' | 'distribusi_internal'>('pengantaran_paket');

  const [searchQuery, setSearchQuery] = useState('');
  const [ekspedisiFilter, setEkspedisiFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [showCreateInternalModal, setShowCreateInternalModal] = useState(false);
  const [printSuratJalan, setPrintSuratJalan] = useState<SuratJalan | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<MarketplaceOrder | null>(null);

  // Digital Signature Modal State
  const [signatureModalConfig, setSignatureModalConfig] = useState<{
    suratJalanId: string;
    type: 'kurir' | 'gudang';
    signerName: string;
    roleLabel: string;
    initialSignature?: string;
  } | null>(null);

  // Expanded package lists in cards
  const [expandedSjIds, setExpandedSjIds] = useState<Record<string, boolean>>({
    'sjp-001': true,
    'sjp-002': true
  });

  const toggleExpand = (id: string) => {
    setExpandedSjIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Form State for Package Manifest Creation
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [pkgForm, setPkgForm] = useState({
    ekspedisi: 'Shopee Xpress (SPX)',
    driverName: 'Pak Dani Kurniawan',
    platNomor: 'D 3341 SPX',
    driverPhone: '0857-1122-3344',
    catatan: 'Serah terima paket reguler sore. Kantong tersegel utuh.',
    pengirimSig: '',
    kurirSig: ''
  });

  // Form State for Internal Distribution
  const [sjInternalForm, setSjInternalForm] = useState<{
    tujuanKategori: string;
    ekspedisi: string;
    noResi: string;
    pengirimNama: string;
    pengirimGudang: string;
    pengirimTelepon: string;
    pengirimAlamat: string;
    penerimaNama: string;
    penerimaTujuan: string;
    penerimaTelepon: string;
    penerimaAlamat: string;
    namaSupir: string;
    platNomor: string;
    items: SuratJalanItem[];
    catatan: string;
  }>({
    tujuanKategori: 'Penjahit Konveksi',
    ekspedisi: 'Kurir Logistik Internal',
    noResi: '',
    pengirimNama: 'Kang Ujang (Gudang)',
    pengirimGudang: 'Gudang Kain & Aksesoris Sabhira',
    pengirimTelepon: '0812-8899-0000',
    pengirimAlamat: 'Komp. Sentra Rajut & Fashion Blok B-12, Bandung',
    penerimaNama: 'Konveksi Barokah (Bpk. Ahmad)',
    penerimaTujuan: 'Workshop Penjahit Kudus',
    penerimaTelepon: '0813-4455-6677',
    penerimaAlamat: 'Jl. Melati Raya No. 45, Kudus, Jawa Tengah',
    namaSupir: 'Pak Budi JTR',
    platNomor: 'D 1882 SBH',
    items: [
      {
        skuId: 'mat-1',
        skuCode: 'RAW-RAYON-TWL',
        productName: 'Kain Rayon Twill Sage Green (Pola Potong Gamis)',
        color: 'Sage Green',
        size: 'M & L',
        quantity: 270,
        unit: 'meter',
        keterangan: 'Pola Gamis M (50 pcs) & L (50 pcs)'
      }
    ],
    catatan: 'Harap periksa kelengkapan gulungan potongan kain dan label saat serah terima.'
  });

  // Filtered Surat Jalan
  const filteredSJs = suratJalanList.filter(sj => {
    const matchType = sj.tipeSuratJalan === activeTab;
    const matchEkspedisi = ekspedisiFilter === 'all' || sj.ekspedisi.toLowerCase().includes(ekspedisiFilter.toLowerCase());
    const matchStatus = statusFilter === 'all' || sj.status === statusFilter;
    
    const search = searchQuery.toLowerCase();
    const matchSearch = sj.nomorSuratJalan.toLowerCase().includes(search) ||
      sj.penerima.nama.toLowerCase().includes(search) ||
      sj.ekspedisi.toLowerCase().includes(search) ||
      (sj.packages && sj.packages.some(p => 
        p.resiNumber.toLowerCase().includes(search) || 
        p.orderNumber.toLowerCase().includes(search) ||
        p.customerName.toLowerCase().includes(search)
      )) ||
      (sj.items && sj.items.some(i => i.productName.toLowerCase().includes(search)));

    return matchType && matchEkspedisi && matchStatus && matchSearch;
  });

  // Calculate Metrics for Package Handover
  const packageSJs = suratJalanList.filter(s => s.tipeSuratJalan === 'pengantaran_paket_marketplace');
  const allPackages = packageSJs.flatMap(s => s.packages || []);
  const totalPackagesHandedOver = allPackages.length;
  const totalScanned = allPackages.filter(p => p.scanStatus === 'scanned').length;
  const totalPendingScan = allPackages.filter(p => p.scanStatus === 'pending_scan').length;
  const totalMissingAlert = allPackages.filter(p => p.scanStatus === 'missing_alert').length;

  // Available orders for new manifest (orders that have resiNumber and aren't already completed/cancelled or need pickup)
  const readyOrdersForPickup = orders.filter(o => 
    Boolean(o.resiNumber) && 
    (o.orderStatus === 'processing' || o.orderStatus === 'shipped') &&
    (o.resiStatus === 'pending_pickup' || !o.suratJalanNomor)
  );

  const handleSelectAllReadyOrders = () => {
    if (selectedOrderIds.length === readyOrdersForPickup.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(readyOrdersForPickup.map(o => o.id));
    }
  };

  const handleToggleOrderSelection = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreatePackageManifestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrderIds.length === 0) {
      alert('Pilih minimal satu pesanan dengan nomor resi untuk dibuatkan Surat Jalan!');
      return;
    }

    const selectedOrdersList = orders.filter(o => selectedOrderIds.includes(o.id));
    const packages: SuratJalanPackageItem[] = selectedOrdersList.map(o => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      channel: o.channel,
      resiNumber: o.resiNumber || 'RESI-UNSET',
      ekspedisi: pkgForm.ekspedisi,
      customerName: o.customerName,
      destinationCity: o.destinationCity || 'Tujuan Pelanggan',
      totalQty: o.items.reduce((sum, i) => sum + i.quantity, 0),
      itemsSummary: o.items.map(i => `${i.productName} (${i.quantity}x)`).join(', '),
      packageWeightKg: 0.8,
      scanStatus: 'pending_scan'
    }));

    createPackageDeliverySuratJalan({
      ekspedisi: pkgForm.ekspedisi,
      driverName: pkgForm.driverName,
      platNomor: pkgForm.platNomor,
      driverPhone: pkgForm.driverPhone,
      packages,
      pengirimSig: pkgForm.pengirimSig || undefined,
      kurirSig: pkgForm.kurirSig || undefined,
      catatan: pkgForm.catatan
    });

    setShowCreatePackageModal(false);
    setSelectedOrderIds([]);
  };

  const handleSaveSignature = (signatureDataUrl: string, signerName: string) => {
    if (!signatureModalConfig) return;

    if (signatureModalConfig.type === 'kurir') {
      updateSuratJalanSignatures(
        signatureModalConfig.suratJalanId,
        undefined,
        signatureDataUrl,
        signerName
      );
    } else {
      updateSuratJalanSignatures(
        signatureModalConfig.suratJalanId,
        signatureDataUrl,
        undefined
      );
    }
    setSignatureModalConfig(null);
  };

  const openSignatureModal = (sj: SuratJalan, type: 'kurir' | 'gudang') => {
    if (type === 'kurir') {
      setSignatureModalConfig({
        suratJalanId: sj.id,
        type: 'kurir',
        signerName: sj.kendaraanDriver?.namaSupir || sj.penerima.nama || 'Driver Kurir Ekspedisi',
        roleLabel: `Kurir Penjemput (${sj.ekspedisi}) • Kendaraan: ${sj.kendaraanDriver?.platNomor || '-'}`,
        initialSignature: sj.penerima.signatureDataUrl
      });
    } else {
      setSignatureModalConfig({
        suratJalanId: sj.id,
        type: 'gudang',
        signerName: sj.pengirim.nama || currentUser.name || 'Admin Gudang Sabhira',
        roleLabel: 'Petugas Penyerah Paket Gudang Sabhira Fashion',
        initialSignature: sj.pengirim.signatureDataUrl
      });
    }
  };

  const handleOpenTrackingByResi = (resiNumber: string) => {
    const matchedOrder = orders.find(o => o.resiNumber === resiNumber);
    if (matchedOrder) {
      setTrackingOrder(matchedOrder);
    } else {
      alert(`Data pesanan untuk resi ${resiNumber} tidak ditemukan.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold uppercase">Logistik & Pengiriman</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Surat Jalan & Manifest Serah Terima Kurir
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manifest serah terima paket marketplace dengan tanda tangan digital anti-resi hilang, cetak dokumen resmi, dan audit scan ekspedisi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveNavTab('marketplace')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>Tracing Online Marketplace</span>
          </button>

          {activeTab === 'pengantaran_paket' ? (
            <button
              onClick={() => setShowCreatePackageModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Manifest Serah Terima Paket</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCreateInternalModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Surat Jalan Distribusi Kain</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pengantaran_paket')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'pengantaran_paket'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4 text-indigo-400" />
          <span>Pengantaran Paket Marketplace & TTD Digital</span>
          {totalMissingAlert > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {totalMissingAlert} Resi Alert
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('distribusi_internal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'distribusi_internal'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4 text-indigo-400" />
          <span>Distribusi Bahan & Konveksi Internal</span>
        </button>
      </div>

      {/* Metrics Banner for Package Handover */}
      {activeTab === 'pengantaran_paket' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Surat Jalan Manifest</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{packageSJs.length}</p>
            <span className="text-[11px] text-slate-500">Dokumen sah serah terima kurir</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Paket Diserahkan</span>
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalPackagesHandedOver} Paket</p>
            <span className="text-[11px] text-blue-700 font-medium">Tersebar di {packageSJs.length} ekspedisi</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800">Paket Terscan Aman</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950 mt-1">{totalScanned} Paket</p>
            <span className="text-[11px] text-emerald-700 font-medium">Inbound hub ekspedisi tervalidasi</span>
          </div>

          <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
            totalMissingAlert > 0 
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' 
              : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${totalMissingAlert > 0 ? 'text-rose-900' : 'text-slate-500'}`}>
                Resi Belum Terscan / Hilang
              </span>
              <AlertOctagon className={`w-4 h-4 ${totalMissingAlert > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            </div>
            <p className={`text-2xl font-black mt-1 ${totalMissingAlert > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalMissingAlert} Paket
            </p>
            <span className={`text-[11px] font-semibold ${totalMissingAlert > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
              {totalMissingAlert > 0 ? 'Klaim siap diajukan dengan TTD!' : 'Semua resi aman'}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No SJ, No Resi, Kurir, Pembeli..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {activeTab === 'pengantaran_paket' && (
            <select
              value={ekspedisiFilter}
              onChange={e => setEkspedisiFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl bg-white outline-none"
            >
              <option value="all">Semua Ekspedisi</option>
              <option value="Shopee Xpress">Shopee Xpress (SPX)</option>
              <option value="J&T">J&T Express</option>
              <option value="SiCepat">SiCepat REG</option>
              <option value="JNE">JNE Reguler</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl bg-white outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="dikirim">Sedang Dikirim / Serah Terima</option>
            <option value="diterima">Selesai / Diterima</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* List of Surat Jalan Cards */}
      <div className="space-y-4">
        {filteredSJs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Truck className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
            <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Surat Jalan Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tidak ada dokumen Surat Jalan yang cocok dengan kriteria pencarian Anda. Klik tombol buat manifest di atas untuk memulai.
            </p>
          </div>
        ) : (
          filteredSJs.map((sj) => {
            const hasMissingAlert = sj.packages?.some(p => p.scanStatus === 'missing_alert');
            const isExpanded = expandedSjIds[sj.id] ?? false;

            return (
              <div 
                key={sj.id} 
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                  hasMissingAlert ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{sj.nomorSuratJalan}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          {sj.ekspedisi}
                        </span>
                        {hasMissingAlert && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            RESI BELUM TERSCAN / POTENSI HILANG
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sj.status === 'diterima' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sj.status === 'diterima' ? 'SUKSES DITERIMA' : 'DIKIRIM / DISERAHKAN'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span>Tanggal: <strong className="text-slate-700">{sj.date}</strong> {sj.time ? `• ${sj.time}` : ''}</span>
                        <span>• Total: <strong className="text-slate-700">{sj.totalPcs} Pcs</strong> ({sj.totalKoli || sj.packages?.length || 1} Koli/Paket)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPrintSuratJalan(sj)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Cetak Lembar Resmi</span>
                    </button>
                    {sj.packages && (
                      <button
                        onClick={() => toggleExpand(sj.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
                        title={isExpanded ? 'Sembunyikan Rincian' : 'Lihat Rincian'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Handover Parties & Digital Signatures Box */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border-b border-slate-100 text-xs">
                  {/* Pihak Pengirim (Gudang Sabhira) */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Pihak Penyerah (Gudang Sabhira):
                      </span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{sj.pengirim.nama}</p>
                      <p className="text-slate-600 text-[11px]">{sj.pengirim.gudang}</p>
                      <p className="text-slate-500 text-[10px]">{sj.pengirim.alamat}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      {sj.pengirim.signatureDataUrl ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={sj.pengirim.signatureDataUrl} 
                            alt="TTD Gudang" 
                            className="h-10 w-24 object-contain bg-white rounded border border-slate-200 p-0.5"
                          />
                          <div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5" /> TTD Terverifikasi
                            </span>
                            <span className="text-[9px] text-slate-400 block">{sj.pengirim.signatureDate || sj.date}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum ada tanda tangan petugas</span>
                      )}

                      <button
                        onClick={() => openSignatureModal(sj, 'gudang')}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>{sj.pengirim.signatureDataUrl ? 'Ubah TTD' : 'Tanda Tangani'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Pihak Penerima / Kurir Ekspedisi */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Pihak Kurir Ekspedisi Penjemput:
                      </span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">
                        {sj.kendaraanDriver?.namaSupir || sj.penerima.nama}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Kendaraan: <strong className="font-mono text-slate-900">{sj.kendaraanDriver?.platNomor || '-'}</strong> • HP: {sj.kendaraanDriver?.kurirPhone || sj.penerima.telepon || '-'}
                      </p>
                      <p className="text-slate-500 text-[10px]">{sj.penerima.tujuan}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      {sj.penerima.signatureDataUrl ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={sj.penerima.signatureDataUrl} 
                            alt="TTD Kurir" 
                            className="h-10 w-24 object-contain bg-white rounded border border-slate-200 p-0.5"
                          />
                          <div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5" /> TTD Kurir Sah
                            </span>
                            <span className="text-[9px] text-slate-400 block">{sj.penerima.signatureDate || sj.date}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Belum ditandatangani kurir!
                        </span>
                      )}

                      <button
                        onClick={() => openSignatureModal(sj, 'kurir')}
                        className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                      >
                        <PenTool className="w-3 h-3" />
                        <span>{sj.penerima.signatureDataUrl ? 'Ubah TTD' : 'TTD Kurir Sekarang'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Missing Resi Warning Banner inside card */}
                {hasMissingAlert && (
                  <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 text-rose-900 flex items-start gap-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        Peringatan Audit Resi: Terdapat paket yang belum ter-scan inbound oleh {sj.ekspedisi}!
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Karena paket sudah diserahterimakan di dokumen Surat Jalan ini dengan tanda tangan kurir 
                        <strong> {sj.kendaraanDriver?.namaSupir || sj.penerima.nama} ({sj.kendaraanDriver?.platNomor})</strong>, 
                        pihak ekspedisi tidak bisa menyangkal serah terima dan wajib mengganti rugi 100% jika paket tercecer/hilang.
                      </p>
                    </div>
                  </div>
                )}

                {/* Package Items Table (if pengantaran_paket) */}
                {sj.packages && isExpanded && (
                  <div className="p-4 sm:p-5 overflow-x-auto text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-indigo-600" />
                        Daftar Paket & Status Scan Ekspedisi ({sj.packages.length} Paket):
                      </h4>
                      <span className="text-[10px] text-slate-400">Klik status untuk memperbarui hasil audit scan</span>
                    </div>

                    <table className="w-full text-left">
                      <thead className="bg-slate-100/70 text-slate-700 font-bold border-y border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">No Resi (AWB)</th>
                          <th className="py-2.5 px-3">No Pesanan & Channel</th>
                          <th className="py-2.5 px-3">Penerima & Kota</th>
                          <th className="py-2.5 px-3">Ringkasan Barang</th>
                          <th className="py-2.5 px-3 text-center">Qty Pcs</th>
                          <th className="py-2.5 px-3">Status Scan Ekspedisi</th>
                          <th className="py-2.5 px-3 text-right">Aksi Tracing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sj.packages.map((pkg, pIdx) => {
                          const isMissing = pkg.scanStatus === 'missing_alert';
                          const isScanned = pkg.scanStatus === 'scanned';

                          return (
                            <tr key={pIdx} className={isMissing ? 'bg-rose-50/50' : 'hover:bg-slate-50/60'}>
                              <td className="py-2.5 px-3 text-slate-500 font-medium">{pIdx + 1}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-900">{pkg.resiNumber}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(pkg.resiNumber);
                                      alert(`Nomor resi ${pkg.resiNumber} disalin!`);
                                    }}
                                    className="text-slate-400 hover:text-slate-700"
                                    title="Salin Resi"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-mono text-slate-700 block">{pkg.orderNumber}</span>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {pkg.channel}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <p className="font-semibold text-slate-900">{pkg.customerName}</p>
                                <p className="text-[10px] text-slate-500">{pkg.destinationCity}</p>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                                {pkg.itemsSummary}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                                {pkg.totalQty}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-1.5">
                                  {isScanned && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <CheckCircle className="w-3 h-3" /> Terscan di Hub
                                    </span>
                                  )}
                                  {isMissing && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 animate-pulse">
                                      <AlertTriangle className="w-3 h-3" /> BELUM TERSCAN / HILANG
                                    </span>
                                  )}
                                  {pkg.scanStatus === 'pending_scan' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      <Clock className="w-3 h-3" /> Menunggu Scan
                                    </span>
                                  )}

                                  {/* Quick toggle status */}
                                  <button
                                    onClick={() => {
                                      const next = isScanned ? 'missing_alert' : isMissing ? 'pending_scan' : 'scanned';
                                      updatePackageScanStatus(sj.id, pkg.resiNumber, next);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800"
                                    title="Ganti status scan"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => handleOpenTrackingByResi(pkg.resiNumber)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Lacak Resi</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Items Table for Internal Distribution */}
                {sj.items && sj.items.length > 0 && isExpanded && (
                  <div className="p-4 sm:p-5 overflow-x-auto text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100/70 text-slate-700 font-bold border-y border-slate-200 text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">SKU & Deskripsi Barang</th>
                          <th className="py-2.5 px-3">Warna / Ukuran</th>
                          <th className="py-2.5 px-3 text-center">Jumlah</th>
                          <th className="py-2.5 px-3">Satuan</th>
                          <th className="py-2.5 px-3">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sj.items.map((it, iIdx) => (
                          <tr key={iIdx} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-500">{iIdx + 1}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{it.productName}</td>
                            <td className="py-2.5 px-3 text-slate-600">{it.color} / {it.size}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-800">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-slate-600">{it.unit}</td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px]">{it.keterangan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Footer notes */}
                {sj.catatan && (
                  <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                    <span><strong>Catatan Serah Terima:</strong> {sj.catatan}</span>
                    <span className="text-[10px] text-slate-400">PT Sabhira Mitra Busana Official Handover</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Buat Manifest Serah Terima Paket Marketplace */}
      {showCreatePackageModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Buat Surat Jalan Pengantaran Paket (Manifest Kurir)</h3>
                  <p className="text-[11px] text-slate-400">Dokumen serah terima fisik paket marketplace anti-resi hilang</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreatePackageModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreatePackageManifestSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Courier info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Ekspedisi:</label>
                  <select
                    value={pkgForm.ekspedisi}
                    onChange={e => setPkgForm({ ...pkgForm, ekspedisi: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white outline-none"
                  >
                    <option value="Shopee Xpress (SPX)">Shopee Xpress (SPX)</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="SiCepat REG">SiCepat REG</option>
                    <option value="JNE Reguler">JNE Reguler</option>
                    <option value="Ninja Xpress">Ninja Xpress</option>
                    <option value="J&T Cargo">J&T Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Driver / Kurir:</label>
                  <input
                    type="text"
                    value={pkgForm.driverName}
                    onChange={e => setPkgForm({ ...pkgForm, driverName: e.target.value })}
                    placeholder="Contoh: Pak Dani Kurniawan"
                    required
                    className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No Polisi (Plat Mobil/Motor):</label>
                  <input
                    type="text"
                    value={pkgForm.platNomor}
                    onChange={e => setPkgForm({ ...pkgForm, platNomor: e.target.value })}
                    placeholder="D 1234 SPX"
                    required
                    className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No Handphone Kurir:</label>
                  <input
                    type="text"
                    value={pkgForm.driverPhone}
                    onChange={e => setPkgForm({ ...pkgForm, driverPhone: e.target.value })}
                    placeholder="0857-xxxx-xxxx"
                    className="w-full px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white outline-none"
                  />
                </div>
              </div>

              {/* Package Selection Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">
                      Pilih Pesanan Siap Kirim yang Diserahkan ({selectedOrderIds.length} terpilih):
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hanya pesanan yang sudah memiliki nomor resi dan siap di-pickup oleh kurir
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAllReadyOrders}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
                  >
                    {selectedOrderIds.length === readyOrdersForPickup.length ? 'Batalkan Semua' : 'Pilih Semua'}
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                  {readyOrdersForPickup.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      Tidak ada pesanan pending yang menunggu pick-up. Semua pesanan sudah memiliki Surat Jalan serah terima.
                    </div>
                  ) : (
                    readyOrdersForPickup.map(order => {
                      const isSelected = selectedOrderIds.includes(order.id);
                      return (
                        <label
                          key={order.id}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleOrderSelection(order.id)}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-900 text-xs">{order.resiNumber}</span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                  {order.channel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Order: <span className="font-mono">{order.orderNumber}</span> • {order.customerName} ({order.destinationCity || 'Tujuan'})
                              </p>
                              <p className="text-[10px] text-slate-400 truncate max-w-md">
                                Item: {order.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">
                              Rp {order.grossAmount.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {order.items.reduce((sum, i) => sum + i.quantity, 0)} Pcs
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Serah Terima:</label>
                <input
                  type="text"
                  value={pkgForm.catatan}
                  onChange={e => setPkgForm({ ...pkgForm, catatan: e.target.value })}
                  placeholder="Misal: Paket diserahkan dalam 2 karung terikat rapi..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none"
                />
              </div>

              {/* Legal reminder */}
              <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <p>
                  Setelah manifest ini diterbitkan, Anda dapat meminta kurir penjemput langsung membubuhkan tanda tangan digital pada tablet/layar HP gudang untuk mengunci bukti serah terima paket yang sah.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePackageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={selectedOrderIds.length === 0}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors ${
                    selectedOrderIds.length === 0 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  Terbitkan Manifest & Surat Jalan ({selectedOrderIds.length} Paket)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cetak Surat Jalan Resmi (Print Document) */}
      {printSuratJalan && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header Dokumen */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">SABHIRA FASHION & APPAREL</h2>
                <p className="text-xs font-semibold text-slate-600">PT SABHIRA MITRA BUSANA INDONESIA</p>
                <p className="text-[11px] text-slate-500">Sentra Rajut & Busana Muslim • Telp: 0812-8899-0000</p>
                <p className="text-[11px] text-slate-500">Jl. R.E. Martadinata No. 128, Bandung, Jawa Barat</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-black rounded tracking-wider uppercase">
                  {printSuratJalan.tipeSuratJalan === 'pengantaran_paket_marketplace' 
                    ? 'MANIFEST SERAH TERIMA KURIR' 
                    : 'SURAT JALAN PENGIRIMAN'}
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1.5">{printSuratJalan.nomorSuratJalan}</p>
                <p className="text-xs text-slate-600">Tanggal: {printSuratJalan.date} {printSuratJalan.time ? `• ${printSuratJalan.time}` : ''}</p>
              </div>
            </div>

            {/* Entity metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Pihak Pengirim (Asal Gudang):</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{printSuratJalan.pengirim.nama}</p>
                <p className="text-indigo-800 font-semibold">{printSuratJalan.pengirim.gudang}</p>
                <p className="text-slate-600 mt-1">{printSuratJalan.pengirim.alamat}</p>
                <p className="text-slate-500">Telp: {printSuratJalan.pengirim.telepon}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-bold uppercase text-[10px]">
                  {printSuratJalan.tipeSuratJalan === 'pengantaran_paket_marketplace' 
                    ? 'Kurir & Ekspedisi Penjemput:' 
                    : 'Penerima & Alamat Tujuan:'}
                </p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {printSuratJalan.kendaraanDriver?.namaSupir || printSuratJalan.penerima.nama}
                </p>
                <p className="text-indigo-800 font-semibold">{printSuratJalan.ekspedisi}</p>
                {printSuratJalan.kendaraanDriver?.platNomor && (
                  <p className="text-slate-700 font-mono">
                    No Polisi: <strong>{printSuratJalan.kendaraanDriver.platNomor}</strong>
                  </p>
                )}
                <p className="text-slate-500">Tujuan: {printSuratJalan.penerima.tujuan}</p>
              </div>
            </div>

            {/* Content Table */}
            {printSuratJalan.packages && printSuratJalan.packages.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs my-4">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nomor Resi (AWB)</th>
                      <th className="p-2.5">No Pesanan</th>
                      <th className="p-2.5">Channel</th>
                      <th className="p-2.5">Penerima & Kota</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5">Status Scan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {printSuratJalan.packages.map((pkg, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{pkg.resiNumber}</td>
                        <td className="p-2.5 font-mono text-slate-700">{pkg.orderNumber}</td>
                        <td className="p-2.5 font-semibold text-indigo-800">{pkg.channel}</td>
                        <td className="p-2.5 text-slate-700">
                          {pkg.customerName} ({pkg.destinationCity})
                        </td>
                        <td className="p-2.5 text-center font-bold text-slate-900">{pkg.totalQty}</td>
                        <td className="p-2.5">
                          {pkg.scanStatus === 'scanned' ? (
                            <span className="text-emerald-700 font-bold">✓ Terscan</span>
                          ) : pkg.scanStatus === 'missing_alert' ? (
                            <span className="text-rose-700 font-bold">🚨 Alert Tak Terscan</span>
                          ) : (
                            <span className="text-amber-700">Menunggu Scan</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="p-2.5 text-right">TOTAL PAKET DISERAHKAN:</td>
                      <td className="p-2.5 text-center font-black text-indigo-900">
                        {printSuratJalan.packages.reduce((sum, p) => sum + p.totalQty, 0)} pcs
                      </td>
                      <td className="p-2.5">({printSuratJalan.packages.length} Koli)</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs my-4">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-800 text-[11px]">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama & Deskripsi Barang</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5">Satuan</th>
                      <th className="p-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {printSuratJalan.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-2.5 text-center font-bold text-emerald-800">{item.quantity}</td>
                        <td className="p-2.5 text-slate-600">{item.unit}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">{item.keterangan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legal Handover Clause */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-relaxed my-4">
              <p className="font-bold text-slate-900 mb-0.5">PERNYATAAN SAH SERAH TERIMA FISIK PAKET:</p>
              Dokumen manifest ini merupakan bukti sah bahwa paket-paket dengan nomor resi terdaftar di atas telah diserahterimakan secara fisik oleh pihak pengirim (PT Sabhira) kepada kurir ekspedisi penjemput ({printSuratJalan.ekspedisi}) dalam kondisi terbungkus rapi, tersegel, dan utuh. Tanda tangan digital di bawah ini berkekuatan hukum untuk pembuktian klaim ganti rugi 100% apabila terjadi resi tidak terscan atau hilang di tangan kurir.
            </div>

            {/* Embedded Digital Signatures Section */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-6 pt-4 border-t border-slate-200">
              {/* Gudang */}
              <div className="flex flex-col items-center">
                <p className="text-slate-500 font-semibold mb-2">Diserahkan Oleh (Gudang Sabhira)</p>
                <div className="h-20 w-44 border border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50/50 mb-2">
                  {printSuratJalan.pengirim.signatureDataUrl ? (
                    <img 
                      src={printSuratJalan.pengirim.signatureDataUrl} 
                      alt="TTD Gudang" 
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Tanda Tangan Manual</span>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-sm">( {printSuratJalan.pengirim.nama} )</p>
                <p className="text-[10px] text-slate-400">{printSuratJalan.pengirim.signatureDate || printSuratJalan.date}</p>
              </div>

              {/* Kurir Penjemput */}
              <div className="flex flex-col items-center">
                <p className="text-slate-500 font-semibold mb-2">
                  Kurir Penjemput ({printSuratJalan.ekspedisi})
                </p>
                <div className="h-20 w-44 border border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50/50 mb-2">
                  {printSuratJalan.penerima.signatureDataUrl ? (
                    <img 
                      src={printSuratJalan.penerima.signatureDataUrl} 
                      alt="TTD Kurir" 
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Tanda Tangan Manual</span>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  ( {printSuratJalan.kendaraanDriver?.namaSupir || printSuratJalan.penerima.nama} )
                </p>
                <p className="text-[10px] text-slate-500">
                  Plat: {printSuratJalan.kendaraanDriver?.platNomor || '-'} • {printSuratJalan.penerima.signatureDate || printSuratJalan.date}
                </p>
              </div>
            </div>

            {/* Print Dialog Actions */}
            <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => setPrintSuratJalan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Capture Modal */}
      {signatureModalConfig && (
        <DigitalSignaturePad
          title={`Tanda Tangan Digital ${signatureModalConfig.type === 'kurir' ? 'Kurir Ekspedisi' : 'Admin Gudang'}`}
          roleLabel={signatureModalConfig.roleLabel}
          defaultSignerName={signatureModalConfig.signerName}
          initialSignature={signatureModalConfig.initialSignature}
          onSave={handleSaveSignature}
          onClose={() => setSignatureModalConfig(null)}
        />
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <TrackingModal
          order={trackingOrder}
          onClose={() => setTrackingOrder(null)}
          onUpdateStatus={(orderId, newStatus, checkpoint) => {
            updateOrderTracking(orderId, newStatus, checkpoint);
          }}
          onViewSuratJalan={(sjNomor) => {
            const found = suratJalanList.find(s => s.nomorSuratJalan === sjNomor);
            if (found) {
              setPrintSuratJalan(found);
              setTrackingOrder(null);
            }
          }}
        />
      )}
    </div>
  );
};
