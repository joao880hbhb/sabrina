import React, { useState } from 'react';
import { MarketplaceOrder, TrackingCheckpoint, ResiDeliveryStatus } from '../../types';
import { 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  FileText,
  RefreshCw,
  ShieldCheck,
  Building,
  User,
  AlertOctagon
} from 'lucide-react';

interface TrackingModalProps {
  order: MarketplaceOrder;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: ResiDeliveryStatus, checkpoint?: TrackingCheckpoint) => void;
  onViewSuratJalan?: (suratJalanNomor: string) => void;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onViewSuratJalan
}) => {
  const [copiedResi, setCopiedResi] = useState(false);
  const [showSimulateDropdown, setShowSimulateDropdown] = useState(false);

  const resi = order.resiNumber || 'BELUM-ADA-RESI';
  const ekspedisi = order.ekspedisi || 'J&T Express';
  const currentStatus: ResiDeliveryStatus = order.resiStatus || (
    order.orderStatus === 'completed' ? 'delivered' : 
    order.orderStatus === 'shipped' ? 'in_transit' : 'pending_pickup'
  );

  const handleCopyResi = () => {
    if (order.resiNumber) {
      navigator.clipboard.writeText(order.resiNumber);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  // Generate fallback checkpoints if none exist
  const getCheckpoints = (): TrackingCheckpoint[] => {
    if (order.trackingHistory && order.trackingHistory.length > 0) {
      return order.trackingHistory;
    }

    const checkpoints: TrackingCheckpoint[] = [
      {
        timestamp: `${order.date.split('T')[0]} 08:30 WIB`,
        location: 'Gudang Pusat Sabhira (Bandung)',
        status: 'manifested',
        title: 'Pesanan Telah Dikemas & Resi Diterbitkan',
        description: `Nomor resi ${resi} telah di-generate untuk pesanan ${order.orderNumber}. Paket siap diserahkan ke kurir ${ekspedisi}.`,
        courierOrHub: 'Petugas Gudang Sabhira'
      }
    ];

    if (currentStatus === 'lost_or_unscanned') {
      checkpoints.push({
        timestamp: `${order.date.split('T')[0]} 14:00 WIB`,
        location: 'Drop Point / Pick-up Kurir',
        status: 'lost_alert',
        title: 'PERINGATAN: Resi Belum Ter-scan di Sistem Ekspedisi',
        description: `Paket fisik telah diserahkan bersama Surat Jalan ${order.suratJalanNomor || 'SJP/202609/001'}, namun hingga saat ini belum ada record scan inbound dari ${ekspedisi}. Waspada paket tertinggal atau hilang!`,
        courierOrHub: `Driver Kurir ${ekspedisi}`
      });
      return checkpoints;
    }

    if (currentStatus === 'picked_up' || currentStatus === 'in_transit' || currentStatus === 'out_for_delivery' || currentStatus === 'delivered') {
      checkpoints.push({
        timestamp: `${order.date.split('T')[0]} 14:15 WIB`,
        location: 'Gudang Pusat Sabhira (Bandung)',
        status: 'picked_up',
        title: `Paket Telah Diserahterimakan ke Kurir ${ekspedisi}`,
        description: `Serah terima paket telah tervalidasi dengan Surat Jalan ${order.suratJalanNomor || 'SJP/202609/001'}. Kurir penjemput telah menandatangani bukti serah terima digital.`,
        courierOrHub: `Kurir Pick-up (${ekspedisi})`
      });
    }

    if (currentStatus === 'in_transit' || currentStatus === 'out_for_delivery' || currentStatus === 'delivered') {
      checkpoints.push({
        timestamp: `${order.date.split('T')[0]} 19:40 WIB`,
        location: 'Sorting Hub Pusat Ekspedisi Bandung Gedebage',
        status: 'sorting_hub',
        title: 'Tiba di Fasilitas Sortir (Inbound Hub)',
        description: `Paket sedang diproses sortir otomatis menuju kota tujuan ${order.destinationCity || 'Tujuan Pengiriman'}.`,
        courierOrHub: `Sorting Hub ${ekspedisi}`
      });
      checkpoints.push({
        timestamp: '2026-09-02 04:15 WIB',
        location: `Transit Hub ${order.destinationCity || 'Kota Tujuan'}`,
        status: 'in_transit',
        title: 'Tiba di Kota Tujuan',
        description: 'Paket telah tiba di gateway transit terdekat dengan alamat penerima.',
        courierOrHub: `Fasilitas Distribusi ${ekspedisi}`
      });
    }

    if (currentStatus === 'out_for_delivery' || currentStatus === 'delivered') {
      checkpoints.push({
        timestamp: '2026-09-02 08:30 WIB',
        location: `Drop Point ${order.destinationCity || 'Penerima'}`,
        status: 'out_for_delivery',
        title: 'Sedang Diantar oleh Kurir (With Delivery Courier)',
        description: `Paket sedang dibawa kurir pengantar menuju alamat penerima (${order.customerName}).`,
        courierOrHub: 'Kurir Pengantar'
      });
    }

    if (currentStatus === 'delivered') {
      checkpoints.push({
        timestamp: '2026-09-02 11:45 WIB',
        location: order.destinationCity || 'Alamat Penerima',
        status: 'delivered',
        title: 'Paket Telah Sukses Diterima (Delivered)',
        description: `Paket telah diterima dengan baik oleh [${order.customerName} / Yang Bersangkutan]. Bukti tanda tangan dan foto penerimaan tersimpan.`,
        courierOrHub: 'Penerima Langsung'
      });
    }

    return checkpoints;
  };

  const checkpoints = getCheckpoints();

  const handleManualStatusChange = (newStatus: ResiDeliveryStatus) => {
    if (!onUpdateStatus) return;

    let title = '';
    let description = '';
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16) + ' WIB';

    if (newStatus === 'delivered') {
      title = 'Paket Telah Sukses Diterima (Delivered)';
      description = `Konfirmasi penerimaan paket oleh pembeli ${order.customerName}. Pesanan telah selesai.`;
    } else if (newStatus === 'in_transit') {
      title = 'Paket Sedang Dalam Perjalanan (In Transit)';
      description = `Paket sedang berpindah fasilitas sortir ekspedisi ${ekspedisi}.`;
    } else if (newStatus === 'out_for_delivery') {
      title = 'Paket Sedang Dibawa Kurir Menuju Alamat';
      description = `Kurir sedang mengantar paket ke alamat penerima di ${order.destinationCity || 'kota tujuan'}.`;
    } else if (newStatus === 'lost_or_unscanned') {
      title = 'PERINGATAN: Resi Hilang / Belum Terscan Kurir!';
      description = `Paket dilaporkan belum ada scan ekspedisi atau mandek lebih dari 24 jam. Dokumen Surat Jalan ${order.suratJalanNomor || ''} siap diajukan untuk klaim ganti rugi.`;
    } else if (newStatus === 'picked_up') {
      title = `Paket Diserahkan ke Kurir ${ekspedisi}`;
      description = `Paket telah diserahterimakan fisik dan terdaftar pada Surat Jalan Pengantaran Paket.`;
    }

    const checkpoint: TrackingCheckpoint = {
      timestamp: nowStr,
      location: order.destinationCity || 'Jalur Pengiriman Ekspedisi',
      status: newStatus === 'lost_or_unscanned' ? 'lost_alert' : 
              newStatus === 'delivered' ? 'delivered' : 'in_transit',
      title,
      description,
      courierOrHub: `Admin Sabhira (${ekspedisi})`
    };

    onUpdateStatus(order.id, newStatus, checkpoint);
    setShowSimulateDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  {order.channel}
                </span>
                <span className="text-xs font-bold text-slate-300">Live Tracing Resi Marketplace</span>
              </div>
              <h3 className="font-mono font-bold text-base text-white mt-0.5 flex items-center gap-2">
                {order.resiNumber || 'Resi Belum Terbit'}
                {order.resiNumber && (
                  <button 
                    onClick={handleCopyResi}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Salin Nomor Resi"
                  >
                    {copiedResi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Status Alert Banner if lost or unscanned */}
          {currentStatus === 'lost_or_unscanned' && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-rose-900">
                    PERINGATAN: Resi Hilang / Belum Ter-scan Ekspedisi!
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    Paket fisik sudah diserahkan ke kurir penjemput, tetapi nomor resi ini tidak tercatat scan inbound oleh pihak {ekspedisi} selama lebih dari 24 jam. 
                    Segera hubungi PIC Ekspedisi dan gunakan lembar <strong>Surat Jalan Pengantaran Paket bertanda tangan digital kurir</strong> sebagai bukti serah terima hukum untuk klaim ganti rugi 100%!
                  </p>
                </div>
              </div>

              {order.suratJalanNomor && (
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                  <span className="font-semibold text-rose-800">
                    Bukti Surat Jalan: <span className="font-mono">{order.suratJalanNomor}</span>
                  </span>
                  {onViewSuratJalan && (
                    <button
                      onClick={() => onViewSuratJalan(order.suratJalanNomor!)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Buka Bukti Surat Jalan</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Ekspedisi:</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                {ekspedisi}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Status Resi:</span>
              <div className="mt-0.5">
                {currentStatus === 'delivered' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3" /> SUKSES TERKIRIM
                  </span>
                )}
                {currentStatus === 'in_transit' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    <Truck className="w-3 h-3" /> DALAM PERJALANAN
                  </span>
                )}
                {currentStatus === 'out_for_delivery' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    <Clock className="w-3 h-3" /> SEDANG DIANTAR
                  </span>
                )}
                {currentStatus === 'picked_up' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <Check className="w-3 h-3" /> SUDAH SERAH TERIMA
                  </span>
                )}
                {currentStatus === 'pending_pickup' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    <Clock className="w-3 h-3" /> MENUNGGU KURIR
                  </span>
                )}
                {currentStatus === 'lost_or_unscanned' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                    <AlertTriangle className="w-3 h-3" /> RESI HILANG / BELUM TERSCAN
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">Penerima:</span>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{order.customerName}</p>
              <p className="text-[10px] text-slate-500 truncate">{order.destinationCity || 'Jawa Barat'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block">No Pesanan:</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5 truncate">{order.orderNumber}</p>
              <p className="text-[10px] text-slate-500">Nilai: Rp {order.grossAmount.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Handover Manifest Surat Jalan Info */}
          {order.suratJalanNomor && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-700" />
                <div>
                  <p className="text-xs font-bold text-indigo-950">
                    Surat Jalan Serah Terima Kurir: <span className="font-mono">{order.suratJalanNomor}</span>
                  </p>
                  <p className="text-[10px] text-indigo-700">Tersedia bukti tanda tangan digital kurir dan petugas gudang</p>
                </div>
              </div>
              {onViewSuratJalan && (
                <button
                  onClick={() => onViewSuratJalan(order.suratJalanNomor!)}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white rounded-lg border border-indigo-200 shadow-2xs"
                >
                  Lihat Manifest
                </button>
              )}
            </div>
          )}

          {/* Checkpoints Stepper Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                Riwayat Perjalanan Paket (Checkpoint Timeline)
              </h4>
              <span className="text-[10px] text-slate-400">Diperbarui realtime sesuai kurir</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {checkpoints.map((cp, idx) => {
                const isLatest = idx === checkpoints.length - 1;
                const isAlert = cp.status === 'lost_alert';
                const isDelivered = cp.status === 'delivered';

                return (
                  <div key={idx} className="relative group">
                    {/* Bullet marker */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isAlert ? 'bg-rose-500 border-white text-white ring-4 ring-rose-100' :
                      isDelivered ? 'bg-emerald-500 border-white text-white ring-4 ring-emerald-100' :
                      isLatest ? 'bg-indigo-600 border-white text-white ring-4 ring-indigo-100' :
                      'bg-white border-slate-300 text-slate-500'
                    }`}>
                      {isAlert ? <AlertTriangle className="w-2.5 h-2.5" /> :
                       isDelivered ? <Check className="w-2.5 h-2.5" /> :
                       <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>

                    {/* Step details */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      isAlert ? 'bg-rose-50/70 border-rose-200' :
                      isLatest ? 'bg-slate-50 border-indigo-200 shadow-2xs' : 
                      'bg-white border-slate-100'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 mb-1">
                        <span className="font-mono font-semibold text-slate-700">{cp.timestamp}</span>
                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {cp.location}
                        </span>
                      </div>

                      <h5 className={`font-bold text-xs ${
                        isAlert ? 'text-rose-900' : isDelivered ? 'text-emerald-900' : 'text-slate-900'
                      }`}>
                        {cp.title}
                      </h5>

                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {cp.description}
                      </p>

                      {cp.courierOrHub && (
                        <p className="text-[10px] text-indigo-700 font-medium mt-1">
                          Petugas / Fasilitas: {cp.courierOrHub}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with simulation / status controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowSimulateDropdown(!showSimulateDropdown)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Simulasi / Perbarui Status Resi</span>
            </button>

            {showSimulateDropdown && (
              <div className="absolute left-0 bottom-full mb-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-20 space-y-1">
                <button
                  type="button"
                  onClick={() => handleManualStatusChange('pending_pickup')}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  ⏳ Set Menunggu Kurir (Pending)
                </button>
                <button
                  type="button"
                  onClick={() => handleManualStatusChange('picked_up')}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  🤝 Set Diserahkan ke Kurir (Picked Up)
                </button>
                <button
                  type="button"
                  onClick={() => handleManualStatusChange('in_transit')}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  🚚 Set Dalam Perjalanan (In Transit)
                </button>
                <button
                  type="button"
                  onClick={() => handleManualStatusChange('out_for_delivery')}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  🛵 Set Sedang Diantar Kurir
                </button>
                <button
                  type="button"
                  onClick={() => handleManualStatusChange('delivered')}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-emerald-50 text-emerald-800 font-bold"
                >
                  ✅ Set Sukses Terkirim (Delivered)
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => handleManualStatusChange('lost_or_unscanned')}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-rose-50 text-rose-700 font-bold"
                >
                  🚨 Tandai Resi Hilang / Tak Terscan
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cetak Bukti Tracing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
