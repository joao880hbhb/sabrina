import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MarketplaceChannel, MarketplaceOrder, OrderStatus, PayoutStatus, ResiDeliveryStatus } from '../../types';
import { TrackingModal } from './TrackingModal';
import * as XLSX from 'xlsx';
import { 
  ShoppingBag, 
  UploadCloud, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ArrowDownLeft, 
  FileText, 
  RefreshCw, 
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Truck,
  ShieldCheck,
  MapPin,
  Copy,
  ExternalLink,
  ChevronRight,
  AlertOctagon,
  Eye
} from 'lucide-react';

export const MarketplaceSales: React.FC = () => {
  const { 
    orders, 
    products, 
    accounts, 
    suratJalanList,
    addOrder, 
    updateOrderTracking,
    processPayoutSettlement, 
    processOrderReturn, 
    importBatchOrders,
    setActiveNavTab
  } = useApp();

  // Primary View Mode
  const [viewMode, setViewMode] = useState<'pesanan' | 'tracing' | 'payout'>('pesanan');

  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payoutFilter, setPayoutFilter] = useState<string>('all');
  const [resiStatusFilter, setResiStatusFilter] = useState<string>('all');

  // Modals
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState<MarketplaceOrder | null>(null);
  const [showReturnModal, setShowReturnModal] = useState<MarketplaceOrder | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<MarketplaceOrder | null>(null);
  const [selectedAccountForSettlement, setSelectedAccountForSettlement] = useState(accounts[0]?.id || '');
  const [returnReason, setReturnReason] = useState('');
  const [restockToGudang, setRestockToGudang] = useState(true);

  // New Order Form State
  const [newOrder, setNewOrder] = useState<{
    orderNumber: string;
    channel: MarketplaceChannel;
    customerName: string;
    destinationCity: string;
    ekspedisi: string;
    items: {
      skuId: string;
      sku: string;
      productName: string;
      size: string;
      color: string;
      quantity: number;
      unitPrice: number;
      unitHpp: number;
      subtotal: number;
    }[];
    grossAmount: number;
    adminFee: number;
    voucherAmount: number;
    discountAmount: number;
    shippingSubsidy: number;
    netPayout: number;
    resiNumber: string;
    notes: string;
  }>({
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    channel: 'Shopee',
    customerName: '',
    destinationCity: 'Kota Bandung',
    ekspedisi: 'Shopee Xpress (SPX)',
    items: [],
    grossAmount: 0,
    adminFee: 0,
    voucherAmount: 0,
    discountAmount: 0,
    shippingSubsidy: 0,
    netPayout: 0,
    resiNumber: '',
    notes: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchChannel = selectedChannel === 'all' || o.channel === selectedChannel;
    const search = searchQuery.toLowerCase();
    const matchSearch = o.orderNumber.toLowerCase().includes(search) ||
      o.customerName.toLowerCase().includes(search) ||
      (o.resiNumber && o.resiNumber.toLowerCase().includes(search)) ||
      (o.destinationCity && o.destinationCity.toLowerCase().includes(search)) ||
      (o.ekspedisi && o.ekspedisi.toLowerCase().includes(search)) ||
      o.items.some(i => i.productName.toLowerCase().includes(search) || i.sku.toLowerCase().includes(search));
    
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchPayout = payoutFilter === 'all' || o.payoutStatus === payoutFilter;
    const matchResi = resiStatusFilter === 'all' || o.resiStatus === resiStatusFilter;

    return matchChannel && matchSearch && matchStatus && matchPayout && matchResi;
  });

  // Summary Metrics
  const totalGross = filteredOrders.reduce((s, o) => s + o.grossAmount, 0);
  const totalAdmin = filteredOrders.reduce((s, o) => s + o.adminFee, 0);
  const totalVoucherDiscount = filteredOrders.reduce((s, o) => s + o.voucherAmount + o.discountAmount + o.shippingSubsidy, 0);
  const totalNet = filteredOrders.reduce((s, o) => s + o.netPayout, 0);
  const totalEscrow = filteredOrders.filter(o => o.payoutStatus === 'escrow').reduce((s, o) => s + o.netPayout, 0);

  // Resi Tracking Metrics
  const totalActiveResi = orders.filter(o => Boolean(o.resiNumber)).length;
  const pendingPickupCount = orders.filter(o => o.resiStatus === 'pending_pickup').length;
  const inTransitCount = orders.filter(o => o.resiStatus === 'in_transit' || o.resiStatus === 'out_for_delivery' || o.resiStatus === 'picked_up').length;
  const deliveredCount = orders.filter(o => o.resiStatus === 'delivered').length;
  const lostOrUnscannedCount = orders.filter(o => o.resiStatus === 'lost_or_unscanned').length;

  // Channels List (strictly online marketplaces)
  const channels: { key: string; name: string; iconBg: string; feeRate: string }[] = [
    { key: 'all', name: 'Semua Channel', iconBg: 'bg-slate-800 text-white', feeRate: 'Rata-rata' },
    { key: 'Shopee', name: 'Shopee', iconBg: 'bg-orange-500 text-white', feeRate: 'Admin ~8.5%' },
    { key: 'TikTok Shop', name: 'TikTok Shop', iconBg: 'bg-black text-white', feeRate: 'Admin ~8.0%' },
    { key: 'Tokopedia', name: 'Tokopedia', iconBg: 'bg-emerald-600 text-white', feeRate: 'Admin ~6.5%' },
    { key: 'Lazada', name: 'Lazada', iconBg: 'bg-blue-600 text-white', feeRate: 'Admin ~7.0%' },
    { key: 'Blibli', name: 'Blibli', iconBg: 'bg-sky-600 text-white', feeRate: 'Admin ~5.0%' },
  ];

  // Helper to add item to new order
  const handleAddItemToOrder = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existingIndex = newOrder.items.findIndex(i => i.skuId === prod.id);
    let updatedItems = [...newOrder.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].subtotal = updatedItems[existingIndex].quantity * updatedItems[existingIndex].unitPrice;
    } else {
      updatedItems.push({
        skuId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        size: prod.size,
        color: prod.color,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        unitHpp: prod.hppFinal,
        subtotal: prod.sellingPrice
      });
    }

    const gross = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const feeRate = newOrder.channel === 'Shopee' ? 0.085 :
                    newOrder.channel === 'TikTok Shop' ? 0.08 :
                    newOrder.channel === 'Tokopedia' ? 0.065 :
                    newOrder.channel === 'Lazada' ? 0.07 : 0.05;

    const calculatedAdmin = Math.round(gross * feeRate);
    const net = gross - (calculatedAdmin + newOrder.voucherAmount + newOrder.discountAmount + newOrder.shippingSubsidy);

    setNewOrder({
      ...newOrder,
      items: updatedItems,
      grossAmount: gross,
      adminFee: calculatedAdmin,
      netPayout: net
    });
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrder.items.length === 0) {
      alert('Silakan pilih minimal 1 produk!');
      return;
    }
    if (!newOrder.customerName) {
      alert('Silakan isi nama pembeli!');
      return;
    }

    const resiNum = newOrder.resiNumber || `SPXID${Date.now().toString().slice(-8)}`;

    addOrder({
      orderNumber: newOrder.orderNumber,
      channel: newOrder.channel,
      date: new Date().toISOString(),
      customerName: newOrder.customerName,
      destinationCity: newOrder.destinationCity,
      ekspedisi: newOrder.ekspedisi,
      items: newOrder.items,
      grossAmount: newOrder.grossAmount,
      adminFee: newOrder.adminFee,
      voucherAmount: newOrder.voucherAmount,
      discountAmount: newOrder.discountAmount,
      shippingSubsidy: newOrder.shippingSubsidy,
      netPayout: newOrder.netPayout,
      payoutStatus: 'escrow',
      orderStatus: 'processing',
      resiNumber: resiNum,
      resiStatus: 'pending_pickup',
      resiLastUpdate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      trackingHistory: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          location: 'Gudang Sabhira Bandung',
          status: 'pending_pickup',
          title: 'Pesanan Telah Dikemas & Menunggu Pick-up Kurir',
          description: `Nomor resi ${resiNum} telah dicetak. Menunggu jadwal kedatangan kurir ekspedisi.`,
          courierOrHub: newOrder.ekspedisi
        }
      ],
      notes: newOrder.notes
    });

    setShowAddOrderModal(false);
    // Reset form
    setNewOrder({
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      channel: 'Shopee',
      customerName: '',
      destinationCity: 'Kota Bandung',
      ekspedisi: 'Shopee Xpress (SPX)',
      items: [],
      grossAmount: 0,
      adminFee: 0,
      voucherAmount: 0,
      discountAmount: 0,
      shippingSubsidy: 0,
      netPayout: 0,
      resiNumber: '',
      notes: ''
    });
  };

  // Excel / CSV Importer with XLSX
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (!data || data.length === 0) {
          alert('File Excel/CSV kosong!');
          return;
        }

        const parsedOrders: Omit<MarketplaceOrder, 'id'>[] = data.map((row, idx) => {
          const channelName = (row.Marketplace || row.Channel || row.channel || 'Shopee') as MarketplaceChannel;
          const gross = Number(row['Harga Total'] || row.Gross || row.grossAmount || row.Total || 245000);
          const admin = Number(row['Biaya Admin'] || row.AdminFee || row.adminFee || Math.round(gross * 0.08));
          const voucher = Number(row['Voucher Toko'] || row.Voucher || row.voucherAmount || 0);
          const disc = Number(row['Diskon'] || row.Discount || 0);
          const ongkir = Number(row['Ongkir'] || row.ShippingSubsidy || 0);
          const net = gross - (admin + voucher + disc + ongkir);
          const resi = String(row['No Resi'] || row.Resi || row.resiNumber || `IMP-RESI-${Date.now()}-${idx}`);

          // Match or fallback product
          const skuCode = row.SKU || row.sku || products[0]?.sku || 'SBH-GMS-SLK-SGE-M';
          const matchedProd = products.find(p => p.sku === skuCode) || products[0];

          return {
            orderNumber: String(row['No Pesanan'] || row.OrderNumber || row.orderNumber || `IMP-${Date.now()}-${idx}`),
            channel: channelName,
            date: row.Tanggal ? new Date(row.Tanggal).toISOString() : new Date().toISOString(),
            customerName: String(row.Pembeli || row.Customer || 'Customer Marketplace'),
            destinationCity: String(row.Kota || row.City || 'Jawa Barat'),
            ekspedisi: String(row.Ekspedisi || 'J&T Express'),
            items: [
              {
                skuId: matchedProd?.id || 'prod-1',
                sku: matchedProd?.sku || skuCode,
                productName: matchedProd?.name || 'Gamis Silk Sabhira',
                size: matchedProd?.size || 'M',
                color: matchedProd?.color || 'Sage Green',
                quantity: Number(row.Qty || row.quantity || 1),
                unitPrice: matchedProd?.sellingPrice || 245000,
                unitHpp: matchedProd?.hppFinal || 110000,
                subtotal: gross
              }
            ],
            grossAmount: gross,
            adminFee: admin,
            voucherAmount: voucher,
            discountAmount: disc,
            shippingSubsidy: ongkir,
            netPayout: net,
            payoutStatus: (row.StatusPayout || 'escrow') as PayoutStatus,
            orderStatus: 'shipped',
            resiNumber: resi,
            resiStatus: 'in_transit',
            resiLastUpdate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            trackingHistory: [
              {
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
                location: 'Hub Transit Ekspedisi',
                status: 'in_transit',
                title: 'Paket Dalam Perjalanan ke Kota Tujuan',
                description: 'Paket telah lolos sortir dan diberangkatkan ke gateway tujuan.',
                courierOrHub: 'Ekspedisi Reguler'
              }
            ],
            notes: 'Imported via Batch Excel'
          };
        });

        importBatchOrders(parsedOrders);
        setShowImportModal(false);
        alert(`Berhasil mengimpor ${parsedOrders.length} pesanan marketplace!`);
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        alert('Gagal membaca file Excel. Pastikan format tabel sesuai kolom.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export current orders to Excel
  const exportOrdersToExcel = () => {
    const exportData = filteredOrders.map(o => ({
      'No Pesanan': o.orderNumber,
      Marketplace: o.channel,
      Tanggal: o.date.split('T')[0],
      Pembeli: o.customerName,
      Kota: o.destinationCity || '-',
      Ekspedisi: o.ekspedisi || '-',
      Item: o.items.map(i => `${i.productName} (${i.quantity}x)`).join(', '),
      'Omzet Bruto (Rp)': o.grossAmount,
      'Biaya Admin (Rp)': o.adminFee,
      'Voucher Toko (Rp)': o.voucherAmount,
      'Diskon Promo (Rp)': o.discountAmount,
      'Subsidi Ongkir (Rp)': o.shippingSubsidy,
      'Net Cair (Rp)': o.netPayout,
      'Status Payout': o.payoutStatus,
      'Status Order': o.orderStatus,
      'No Resi': o.resiNumber || '-',
      'Status Resi': o.resiStatus || 'pending_pickup',
      'No Surat Jalan': o.suratJalanNomor || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Penjualan Sabhira');
    XLSX.writeFile(wb, `Laporan_Penjualan_Marketplace_${selectedChannel}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const getResiStatusBadge = (status?: ResiDeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Terkirim Sukses
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3 text-purple-600" /> Diantar Kurir
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3 text-blue-600" /> Dalam Perjalanan
          </span>
        );
      case 'picked_up':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            <ShieldCheck className="w-3 h-3 text-indigo-600" /> Diserahterimakan
          </span>
        );
      case 'lost_or_unscanned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
            <AlertOctagon className="w-3 h-3" /> ALERT: BELUM TERSCAN / HILANG
          </span>
        );
      case 'pending_pickup':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" /> Menunggu Pick-up
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold uppercase">Marketplace Online</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Penjualan Marketplace & Tracing Resi Online
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Manajemen order Shopee, TikTok Shop, Tokopedia, tracing resi real-time, audit serah terima kurir, dan pencairan escrow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveNavTab('suratJalan')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Surat Jalan & Manifest</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-slate-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={exportOrdersToExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors border border-slate-200 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setShowAddOrderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Pesanan</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation: Pesanan vs Tracing Online vs Payout */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewMode('pesanan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            viewMode === 'pesanan'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-indigo-400" />
          <span>Daftar Pesanan & Finansial</span>
        </button>

        <button
          onClick={() => setViewMode('tracing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            viewMode === 'tracing'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4 text-indigo-400" />
          <span>Tracing Online Marketplace & Status Resi</span>
          {lostOrUnscannedCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              {lostOrUnscannedCount} Alert Hilang
            </span>
          )}
        </button>

        <button
          onClick={() => setViewMode('payout')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            viewMode === 'payout'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Rekapitulasi Payout Escrow ({filteredOrders.filter(o => o.payoutStatus === 'escrow').length})</span>
        </button>
      </div>

      {/* VIEW MODE: TRACING ONLINE MARKETPLACE */}
      {viewMode === 'tracing' && (
        <div className="space-y-5">
          {/* Tracing Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div 
              onClick={() => setResiStatusFilter('all')}
              className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs ${
                resiStatusFilter === 'all' ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Resi Marketplace</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalActiveResi}</p>
              <span className="text-[11px] text-slate-500">Semua order dengan AWB</span>
            </div>

            <div 
              onClick={() => setResiStatusFilter('pending_pickup')}
              className={`p-4 bg-amber-50/70 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                resiStatusFilter === 'pending_pickup' ? 'border-amber-600 ring-2 ring-amber-200' : 'border-amber-200 hover:border-amber-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-amber-800">Menunggu Pick-up</span>
              <p className="text-2xl font-black text-amber-950 mt-1">{pendingPickupCount}</p>
              <span className="text-[11px] text-amber-700">Belum diserahterimakan</span>
            </div>

            <div 
              onClick={() => setResiStatusFilter('in_transit')}
              className={`p-4 bg-blue-50/70 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                resiStatusFilter === 'in_transit' ? 'border-blue-600 ring-2 ring-blue-200' : 'border-blue-200 hover:border-blue-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-blue-800">Dalam Perjalanan / Diantar</span>
              <p className="text-2xl font-black text-blue-950 mt-1">{inTransitCount}</p>
              <span className="text-[11px] text-blue-700">In Transit & On Delivery</span>
            </div>

            <div 
              onClick={() => setResiStatusFilter('delivered')}
              className={`p-4 bg-emerald-50/70 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                resiStatusFilter === 'delivered' ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-emerald-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-emerald-800">Sukses Terkirim</span>
              <p className="text-2xl font-black text-emerald-950 mt-1">{deliveredCount}</p>
              <span className="text-[11px] text-emerald-700">Diterima oleh pelanggan</span>
            </div>

            <div 
              onClick={() => setResiStatusFilter('lost_or_unscanned')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                lostOrUnscannedCount > 0 
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 animate-pulse' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase text-rose-800 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                Resi Belum Terscan / Hilang
              </span>
              <p className="text-2xl font-black text-rose-600 mt-1">{lostOrUnscannedCount}</p>
              <span className="text-[11px] text-rose-700 font-semibold">
                {lostOrUnscannedCount > 0 ? 'Klaim Siap dengan TTD Kurir' : 'Nol Resi Bermasalah'}
              </span>
            </div>
          </div>

          {/* Missing Resi Handover Legal Protection Banner */}
          {lostOrUnscannedCount > 0 && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-950 text-sm">
                    Peringatan Resi Belum Ter-scan Ekspedisi ({lostOrUnscannedCount} Paket Terdeteksi)
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                    Paket fisik sudah diserahkan ke kurir tetapi belum ter-scan inbound di gateway logistik &gt; 12 jam. 
                    Gunakan nomor Surat Jalan dan <strong>Tanda Tangan Digital Kurir Penjemput</strong> sebagai bukti sah hukum untuk klaim ganti rugi 100%.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveNavTab('suratJalan')}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shrink-0 shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Lihat Bukti TTD di Surat Jalan</span>
              </button>
            </div>
          )}

          {/* Tracing Search & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari No Resi, Pembeli, Kota Tujuan, Kurir..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={resiStatusFilter}
                onChange={e => setResiStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl bg-white outline-none"
              >
                <option value="all">Semua Status Resi</option>
                <option value="pending_pickup">Menunggu Pick-up</option>
                <option value="picked_up">Diserahkan ke Kurir</option>
                <option value="in_transit">Dalam Perjalanan (In Transit)</option>
                <option value="out_for_delivery">Sedang Diantar</option>
                <option value="delivered">Sukses Terkirim</option>
                <option value="lost_or_unscanned">🚨 Belum Terscan / Hilang</option>
              </select>

              <button
                onClick={() => setActiveNavTab('suratJalan')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Surat Jalan Serah Terima</span>
              </button>
            </div>
          </div>

          {/* Tracing Order Cards / Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">No Resi & Ekspedisi</th>
                    <th className="py-3 px-4">No Order & Marketplace</th>
                    <th className="py-3 px-4">Pembeli & Kota Tujuan</th>
                    <th className="py-3 px-4">Status Pengiriman</th>
                    <th className="py-3 px-4">Lokasi / Checkpoint Terakhir</th>
                    <th className="py-3 px-4">Surat Jalan Terkait</th>
                    <th className="py-3 px-4 text-center">Aksi Tracing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Truck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Tidak ada resi ditemukan</p>
                        <p className="text-xs text-slate-400 mt-0.5">Coba sesuaikan kata kunci pencarian atau filter status.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isLost = order.resiStatus === 'lost_or_unscanned';
                      const latestCheckpoint = order.trackingHistory && order.trackingHistory.length > 0 
                        ? order.trackingHistory[order.trackingHistory.length - 1] 
                        : null;

                      return (
                        <tr 
                          key={order.id} 
                          className={`transition-colors ${
                            isLost ? 'bg-rose-50/70 hover:bg-rose-100/50' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          {/* Resi & Ekspedisi */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {order.resiNumber || 'RESI-BELUM-ADA'}
                              </span>
                              {order.resiNumber && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.resiNumber || '');
                                    alert(`Nomor resi ${order.resiNumber} disalin!`);
                                  }}
                                  className="text-slate-400 hover:text-slate-700"
                                  title="Salin Resi"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-indigo-700 block mt-0.5">
                              {order.ekspedisi || 'Shopee Xpress'}
                            </span>
                          </td>

                          {/* Order & Marketplace */}
                          <td className="py-3.5 px-4">
                            <p className="font-mono text-slate-800 text-xs font-medium">{order.orderNumber}</p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                              order.channel === 'Shopee' ? 'bg-orange-100 text-orange-800' :
                              order.channel === 'TikTok Shop' ? 'bg-slate-900 text-white' :
                              order.channel === 'Tokopedia' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.channel}
                            </span>
                          </td>

                          {/* Pembeli & Kota */}
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">{order.customerName}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {order.destinationCity || 'Tujuan'}
                            </p>
                          </td>

                          {/* Status Resi */}
                          <td className="py-3.5 px-4">
                            {getResiStatusBadge(order.resiStatus)}
                            {order.resiLastUpdate && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                Update: {order.resiLastUpdate}
                              </p>
                            )}
                          </td>

                          {/* Checkpoint Terakhir */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {latestCheckpoint ? (
                              <div>
                                <p className="font-semibold text-slate-800 text-[11px] truncate">
                                  {latestCheckpoint.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {latestCheckpoint.location} • {latestCheckpoint.timestamp}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">Belum ada checkpoint scan</span>
                            )}
                          </td>

                          {/* Surat Jalan Terkait */}
                          <td className="py-3.5 px-4">
                            {order.suratJalanNomor ? (
                              <div>
                                <span className="font-mono text-[11px] font-bold text-slate-900 block">
                                  {order.suratJalanNomor}
                                </span>
                                <button
                                  onClick={() => setActiveNavTab('suratJalan')}
                                  className="text-[10px] text-indigo-700 hover:text-indigo-900 font-semibold inline-flex items-center gap-0.5 mt-0.5"
                                >
                                  <span>Lihat Bukti TTD</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-medium border border-amber-200">
                                Belum ada Surat Jalan
                              </span>
                            )}
                          </td>

                          {/* Aksi Tracing */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setTrackingOrder(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 shadow-2xs"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Lacak & Timeline</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: PESANAN & FINANSIAL */}
      {viewMode === 'pesanan' && (
        <div className="space-y-5">
          {/* Channel Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {channels.map(ch => {
              const isSelected = selectedChannel === ch.key;
              const count = ch.key === 'all' ? orders.length : orders.filter(o => o.channel === ch.key).length;
              return (
                <button
                  key={ch.key}
                  onClick={() => setSelectedChannel(ch.key)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${ch.iconBg}`}>
                      {ch.name.slice(0, 3)}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-800 text-indigo-400' : 'bg-slate-100 text-slate-600'}`}>
                      {count}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold truncate">{ch.name}</p>
                    <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{ch.feeRate}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Financial Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Omzet Kotor</span>
              <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">Rp {totalGross.toLocaleString('id-ID')}</p>
              <span className="text-[10px] text-slate-500">{filteredOrders.length} transaksi</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-[10px] font-bold uppercase text-rose-600">Total Biaya Admin Marketplace</span>
              <p className="text-base sm:text-lg font-black text-rose-700 mt-0.5">- Rp {totalAdmin.toLocaleString('id-ID')}</p>
              <span className="text-[10px] text-rose-600">Potongan komisi</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] font-bold uppercase text-amber-700">Voucher, Diskon & Ongkir</span>
              <p className="text-base sm:text-lg font-black text-amber-800 mt-0.5">- Rp {totalVoucherDiscount.toLocaleString('id-ID')}</p>
              <span className="text-[10px] text-amber-700">Biaya promosi</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Net Cair Bersih (Escrow & Bank)</span>
              <p className="text-base sm:text-lg font-black text-emerald-800 mt-0.5">Rp {totalNet.toLocaleString('id-ID')}</p>
              <span className="text-[10px] text-emerald-600">Tertahan di Escrow: Rp {totalEscrow.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Search & Filter Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari no pesanan, resi, pembeli, SKU..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={payoutFilter}
                  onChange={e => setPayoutFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
                >
                  <option value="all">Semua Status Payout</option>
                  <option value="settled">Sudah Cair ke Bank</option>
                  <option value="escrow">Tertahan di Escrow</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
                >
                  <option value="all">Semua Status Order</option>
                  <option value="processing">Diproses / Siap Kirim</option>
                  <option value="shipped">Sedang Dikirim</option>
                  <option value="completed">Selesai</option>
                  <option value="returned">Retur / Pengembalian</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No Pesanan & Channel</th>
                    <th className="py-3 px-4">Tanggal & Pembeli</th>
                    <th className="py-3 px-4">Detail Item Fashion</th>
                    <th className="py-3 px-4">Resi & Tracing</th>
                    <th className="py-3 px-3 text-right">Omzet Kotor</th>
                    <th className="py-3 px-3 text-right text-rose-700">Admin Mktp</th>
                    <th className="py-3 px-3 text-right font-bold text-emerald-700">Net Cair</th>
                    <th className="py-3 px-4 text-center">Status Payout</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">Tidak ada data pesanan</p>
                        <p className="text-xs text-slate-400 mt-0.5">Coba sesuaikan filter atau input pesanan baru.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* No Pesanan & Channel */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block ${
                              order.channel === 'Shopee' ? 'bg-orange-100 text-orange-800' :
                              order.channel === 'TikTok Shop' ? 'bg-slate-900 text-white' :
                              order.channel === 'Tokopedia' ? 'bg-emerald-100 text-emerald-800' :
                              order.channel === 'Lazada' ? 'bg-blue-100 text-blue-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {order.channel}
                            </span>
                            <p className="font-mono font-bold text-slate-900 text-xs">{order.orderNumber}</p>
                          </div>
                        </td>

                        {/* Tanggal & Pembeli */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{order.customerName}</p>
                          <p className="text-[10px] text-slate-400">{order.date.split('T')[0]}</p>
                          {order.orderStatus === 'returned' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded mt-1">
                              <RotateCcw className="w-3 h-3" /> Retur ({order.returnReason || 'Dibatalkan'})
                            </span>
                          )}
                        </td>

                        {/* Detail Item Fashion */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-[11px] gap-2">
                                <span className="text-slate-800 font-medium truncate">
                                  • {item.productName} ({item.size})
                                </span>
                                <span className="text-slate-500 font-mono shrink-0">
                                  {item.quantity}x @ Rp {item.unitPrice.toLocaleString('id-ID')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Resi & Tracing */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {order.resiNumber ? (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-900 text-[11px]">
                                    {order.resiNumber}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {getResiStatusBadge(order.resiStatus)}
                                  <button
                                    onClick={() => setTrackingOrder(order)}
                                    className="p-1 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded"
                                    title="Lacak Resi"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Belum ada resi</span>
                            )}
                          </div>
                        </td>

                        {/* Omzet Kotor */}
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                          Rp {order.grossAmount.toLocaleString('id-ID')}
                        </td>

                        {/* Biaya Admin */}
                        <td className="py-3.5 px-3 text-right font-mono text-rose-600">
                          {order.adminFee > 0 ? `- Rp ${order.adminFee.toLocaleString('id-ID')}` : '-'}
                        </td>

                        {/* Net Cair Bersih */}
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-700 text-sm">
                          Rp {order.netPayout.toLocaleString('id-ID')}
                        </td>

                        {/* Status Payout */}
                        <td className="py-3.5 px-4 text-center">
                          {order.payoutStatus === 'settled' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              <Check className="w-3 h-3 text-emerald-600" /> Sudah Cair
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold animate-pulse">
                              <Clock className="w-3 h-3 text-blue-600" /> Escrow
                            </span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {order.payoutStatus === 'escrow' && (
                              <button
                                onClick={() => setShowSettlementModal(order)}
                                className="px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                                title="Cairkan Dana Escrow ke Rekening Bank"
                              >
                                Cairkan
                              </button>
                            )}
                            {order.orderStatus !== 'returned' && (
                              <button
                                onClick={() => setShowReturnModal(order)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Proses Retur Pesanan"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: REKAPITULASI PAYOUT & ESCROW */}
      {viewMode === 'payout' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rekapitulasi Saldo Escrow Belum Cair</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total dana penjualan yang sedang ditahan oleh sistem marketplace sampai paket berstatus diterima pembeli.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Total Escrow Menunggu Pencairan:</span>
              <p className="text-2xl font-black text-indigo-700">Rp {totalEscrow.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No Pesanan & Marketplace</th>
                    <th className="py-3 px-4">Tanggal Order</th>
                    <th className="py-3 px-4">Pembeli & No Resi</th>
                    <th className="py-3 px-4">Status Pengiriman</th>
                    <th className="py-3 px-4 text-right">Dana Net (Rp)</th>
                    <th className="py-3 px-4 text-center">Tindakan Pencairan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.filter(o => o.payoutStatus === 'escrow').map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 text-xs block">{order.orderNumber}</span>
                        <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-1.5 py-0.2 rounded">
                          {order.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {order.date.split('T')[0]}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] font-mono text-slate-500">{order.resiNumber || 'Resi -'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {getResiStatusBadge(order.resiStatus)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                        Rp {order.netPayout.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setShowSettlementModal(order)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                        >
                          Cairkan ke Bank
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Input Order Baru */}
      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Input Transaksi Penjualan Baru</h3>
              <button onClick={() => setShowAddOrderModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No Pesanan / Order ID</label>
                  <input
                    type="text"
                    required
                    value={newOrder.orderNumber}
                    onChange={e => setNewOrder({ ...newOrder, orderNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Penjualan</label>
                  <select
                    value={newOrder.channel}
                    onChange={e => {
                      const ch = e.target.value as MarketplaceChannel;
                      const feeRate = ch === 'Shopee' ? 0.085 :
                                      ch === 'TikTok Shop' ? 0.08 :
                                      ch === 'Tokopedia' ? 0.065 :
                                      ch === 'Lazada' ? 0.07 : 0.05;
                      const calculatedAdmin = Math.round(newOrder.grossAmount * feeRate);
                      const net = newOrder.grossAmount - (calculatedAdmin + newOrder.voucherAmount + newOrder.discountAmount + newOrder.shippingSubsidy);
                      setNewOrder({ ...newOrder, channel: ch, adminFee: calculatedAdmin, netPayout: net });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="Shopee">Shopee</option>
                    <option value="TikTok Shop">TikTok Shop</option>
                    <option value="Tokopedia">Tokopedia</option>
                    <option value="Lazada">Lazada</option>
                    <option value="Blibli">Blibli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pembeli</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Penerima"
                    value={newOrder.customerName}
                    onChange={e => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kota Tujuan</label>
                  <input
                    type="text"
                    placeholder="Kota / Kabupaten"
                    value={newOrder.destinationCity}
                    onChange={e => setNewOrder({ ...newOrder, destinationCity: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ekspedisi</label>
                  <select
                    value={newOrder.ekspedisi}
                    onChange={e => setNewOrder({ ...newOrder, ekspedisi: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                  >
                    <option value="Shopee Xpress (SPX)">Shopee Xpress (SPX)</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="SiCepat REG">SiCepat REG</option>
                    <option value="JNE Reguler">JNE Reguler</option>
                    <option value="Ninja Xpress">Ninja Xpress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Resi (AWB)</label>
                  <input
                    type="text"
                    placeholder="Auto generate jika kosong"
                    value={newOrder.resiNumber}
                    onChange={e => setNewOrder({ ...newOrder, resiNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              {/* Pilih Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Produk Fashion yang Terjual</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleAddItemToOrder(p.id)}
                      className="p-2 text-left bg-white rounded-lg border border-slate-200 hover:border-indigo-500 hover:shadow-xs transition-all text-xs"
                    >
                      <p className="font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.size} • {p.color}</p>
                      <p className="text-xs font-bold text-indigo-700 mt-1">Rp {p.sellingPrice.toLocaleString('id-ID')}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Selected Summary */}
              {newOrder.items.length > 0 && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                  <span className="font-bold text-indigo-950 block">Daftar Item Terpilih:</span>
                  {newOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span>• {it.productName} ({it.size}) x {it.quantity}</span>
                      <span className="font-bold">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Breakdown Biaya */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Omzet Kotor</span>
                  <p className="font-bold text-slate-900">Rp {newOrder.grossAmount.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600">Admin Marketplace</span>
                  <p className="font-bold text-rose-600">- Rp {newOrder.adminFee.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Voucher / Diskon</span>
                  <input
                    type="number"
                    value={newOrder.voucherAmount}
                    onChange={e => {
                      const v = Number(e.target.value) || 0;
                      const net = newOrder.grossAmount - (newOrder.adminFee + v + newOrder.discountAmount + newOrder.shippingSubsidy);
                      setNewOrder({ ...newOrder, voucherAmount: v, netPayout: net });
                    }}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700">Estimasi Bersih</span>
                  <p className="font-bold text-emerald-700 text-sm">Rp {newOrder.netPayout.toLocaleString('id-ID')}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOrderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Simpan Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Import Penjualan dari Excel / CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 text-center">
              <UploadCloud className="w-12 h-12 text-indigo-500 mx-auto mb-2 stroke-1" />
              <p className="text-xs text-slate-600 mb-4">
                Pilih file laporan export dari Shopee, TikTok Shop, atau Tokopedia.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Pilih File Excel / CSV
              </button>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cairkan Escrow ke Rekening Bank */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Pencairan Saldo Escrow</h3>
            <p className="text-xs text-slate-600 mt-1">
              Pencairan dana pesanan <strong className="font-mono text-slate-900">{showSettlementModal.orderNumber}</strong> ({showSettlementModal.channel}) sebesar:
            </p>

            <div className="p-4 bg-emerald-50 rounded-xl my-4 text-center border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800">Nominal Net Yang Masuk Rekening:</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                Rp {showSettlementModal.netPayout.toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Masuk ke Rekening Finansial:</label>
              <select
                value={selectedAccountForSettlement}
                onChange={e => setSelectedAccountForSettlement(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountNumber}) - Saldo: Rp {acc.balance.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSettlementModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  processPayoutSettlement(showSettlementModal.id, selectedAccountForSettlement);
                  setShowSettlementModal(null);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                Konfirmasi Masuk Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Proses Retur */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Proses Retur / Pembatalan Pesanan</h3>
            <p className="text-xs text-slate-600 mt-1">
              Pesanan <strong className="font-mono text-slate-900">{showReturnModal.orderNumber}</strong> ({showReturnModal.customerName})
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Retur / Komplain Pelanggan:</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  placeholder="Misal: Tukar size, jahitan kurang rapi, atau paket salah kirim"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="restockCheck"
                  checked={restockToGudang}
                  onChange={e => setRestockToGudang(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="restockCheck" className="text-xs text-slate-700 font-medium">
                  Kembalikan barang retur ke Stok Gudang (Restock otomatis)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    processOrderReturn(showReturnModal.id, returnReason || 'Retur Pelanggan', restockToGudang);
                    setShowReturnModal(null);
                    setReturnReason('');
                  }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Proses Retur
                </button>
              </div>
            </div>
          </div>
        </div>
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
            setActiveNavTab('suratJalan');
            setTrackingOrder(null);
          }}
        />
      )}
    </div>
  );
};
