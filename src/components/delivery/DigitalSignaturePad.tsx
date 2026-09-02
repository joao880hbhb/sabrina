import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface DigitalSignaturePadProps {
  title: string;
  roleLabel: string;
  defaultSignerName: string;
  initialSignature?: string;
  onSave: (signatureDataUrl: string, signerName: string) => void;
  onClose: () => void;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  title,
  roleLabel,
  defaultSignerName,
  initialSignature,
  onSave,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [inkColor, setInkColor] = useState<'#0f172a' | '#1e3a8a'>('#1e3a8a'); // Navy blue default
  const [errorMsg, setErrorMsg] = useState('');

  // Setup canvas resolution and initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = inkColor;

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  }, []);

  // Update stroke color
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = inkColor;
  }, [inkColor]);

  // Coordinate helper
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg('');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (!signerName.trim()) {
      setErrorMsg('Nama penanda tangan wajib diisi!');
      return;
    }
    if (!hasDrawn) {
      setErrorMsg('Silakan buat goresan tanda tangan di kotak kanvas terlebih dahulu!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export high-res PNG
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, signerName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">{roleLabel}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Signer Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap Penanda Tangan:
            </label>
            <input 
              type="text"
              value={signerName}
              onChange={(e) => {
                setSignerName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Pak Joko (Kurir J&T Express)"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>

          {/* Canvas Signature Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Goreskan Tanda Tangan Digital:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Warna Tinta:</span>
                <button
                  type="button"
                  onClick={() => setInkColor('#1e3a8a')}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    inkColor === '#1e3a8a' ? 'border-indigo-600 scale-110 shadow-xs' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: '#1e3a8a' }}
                  title="Tinta Biru Resmi"
                />
                <button
                  type="button"
                  onClick={() => setInkColor('#0f172a')}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    inkColor === '#0f172a' ? 'border-indigo-600 scale-110 shadow-xs' : 'border-slate-300'
                  }`}
                  style={{ backgroundColor: '#0f172a' }}
                  title="Tinta Hitam Pekat"
                />
              </div>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/70 overflow-hidden group hover:border-indigo-400 transition-colors">
              <canvas
                ref={canvasRef}
                className="w-full h-44 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400">
                  <PenTool className="w-6 h-6 mb-1 stroke-1 opacity-50" />
                  <span className="text-xs font-medium">Tanda tangan di sini (Mouse / Touch Screen)</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Berlaku sebagai bukti sah serah terima paket kurir</span>
                </div>
              )}
              {hasDrawn && (
                <div className="absolute bottom-2 left-2 pointer-events-none flex items-center gap-1 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded backdrop-blur-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Sabhira Verified Handover Signature</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-2 bg-rose-50 p-2 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Legal Note */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <p className="font-semibold flex items-center gap-1 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Perlindungan Hukum & Bukti Anti Resi Hilang:
            </p>
            Tanda tangan digital ini mengikat dan membuktikan paket telah diserahterimakan secara fisik ke kurir penjemput. Jika resi tidak di-scan oleh kurir atau hilang, dokumen ini dapat diajukan sebagai bukti klaim ganti rugi 100%.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hapus / Ulangi</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Tanda Tangan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
