'use client';

import React, { useState, useRef } from 'react';
import { ScanText, Plus, Camera, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { ShelfProduct } from '@/lib/types';
import {
  parseIngredientsText,
  determineProductHazard,
  evaluateQuarantineRequirement,
} from '@/lib/inci-engine';
import { DEMO_BOTTLE_PRESETS } from '@/lib/sample-data';

interface ShelfScannerProps {
  products: ShelfProduct[];
  isBarrierCollapsed: boolean;
  onAddProduct: (product: ShelfProduct) => void;
  onRemoveProduct: (id: string) => void;
}

export const ShelfScanner: React.FC<ShelfScannerProps> = ({
  products,
  isBarrierCollapsed,
  onAddProduct,
  onRemoveProduct,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualText, setManualText] = useState('');
  const [manualName, setManualName] = useState('');

  // Live Camera for Physical Bottles
  const [isBottleCameraOpen, setIsBottleCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start webcam focused on bottle label
  const startBottleCamera = async () => {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsBottleCameraOpen(true);
    } catch {
      setScanError('Could not access camera for bottle scan. Please use photo upload or manual entry.');
    }
  };

  const stopBottleCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsBottleCameraOpen(false);
  };

  const captureBottleSnapshot = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    stopBottleCamera();

    canvas.toBlob(async (blob) => {
      if (blob) {
        await executeOcr(blob, 'Live Camera Bottle');
      }
    }, 'image/jpeg', 0.95);
  };

  const handleBottleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await executeOcr(file, file.name.replace(/\.[^/.]+$/, ''));
  };

  const executeOcr = async (imageSource: Blob, defaultName: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanStatusMsg('Loading Tesseract.js client-side OCR engine...');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');

      setScanStatusMsg('Running OCR text recognition on bottle label...');
      const ret = await worker.recognize(imageSource);
      await worker.terminate();

      const extractedText = (ret.data.text || '').trim();

      if (!extractedText || extractedText.length < 5) {
        setScanError(
          'OCR could not detect legible text from this image. Please take a closer photo with better lighting or enter the INCI ingredients manually below.'
        );
        return;
      }

      processExtractedBottleText(defaultName, extractedText, 'CAMERA_OCR');
    } catch (err: any) {
      console.error('Real OCR failure:', err);
      setScanError(
        `OCR failed to read image: ${err.message || 'Unknown processing error'}. Please type or paste ingredients manually.`
      );
    } finally {
      setIsScanning(false);
      setScanStatusMsg('');
    }
  };

  const processExtractedBottleText = (
    name: string,
    rawText: string,
    source: ShelfProduct['source'] = 'MANUAL_INCI'
  ) => {
    const detectedActives = parseIngredientsText(rawText);
    const overallHazard = determineProductHazard(detectedActives);
    const quarantineEval = evaluateQuarantineRequirement(detectedActives, isBarrierCollapsed);

    const newProd: ShelfProduct = {
      id: `shelf-${Date.now()}`,
      name: name || 'Cosmetic Serum / Wash',
      rawText,
      detectedActives,
      overallHazard,
      isQuarantined: quarantineEval.shouldQuarantine,
      quarantineDaysRemaining: quarantineEval.quarantineDays,
      scannedAt: new Date().toISOString(),
      source,
    };

    onAddProduct(newProd);
    setManualName('');
    setManualText('');
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() && !manualText.trim()) return;
    processExtractedBottleText(
      manualName.trim() || 'Custom Regimen Product',
      manualText.trim() || manualName.trim(),
      'MANUAL_INCI'
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ScanText className="h-5 w-5 text-amber-400" />
            <span>Physical Shelf Inventory & On-Device OCR</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real on-device OCR parses physical labels and matches against 100+ active cosmetic compounds
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={startBottleCamera}
            disabled={isScanning || isBottleCameraOpen}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-amber-400 hover:text-white"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Live Bottle Cam</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex items-center space-x-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/60"
          >
            <ScanText className="h-3.5 w-3.5" />
            <span>Upload Bottle Photo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBottleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Live Bottle Camera Viewfinder */}
      {isBottleCameraOpen && (
        <div className="mt-4 relative overflow-hidden rounded-xl border border-amber-500/40 bg-black">
          <video ref={videoRef} className="w-full max-h-[300px] object-cover" />
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/50 m-6 rounded-xl flex items-center justify-center">
            <span className="text-xs text-amber-200 bg-black/70 px-2 py-1 rounded">
              Hold bottle ingredient label steadily inside frame
            </span>
          </div>
          <div className="absolute bottom-3 right-3 flex space-x-2">
            <button
              onClick={captureBottleSnapshot}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500"
            >
              Capture & Run OCR
            </button>
            <button
              onClick={stopBottleCamera}
              className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* OCR Status Display */}
      {isScanning && (
        <div className="mt-4 flex items-center space-x-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
          <div className="text-xs font-mono text-amber-200">{scanStatusMsg}</div>
        </div>
      )}

      {scanError && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{scanError}</span>
        </div>
      )}

      {/* Evaluator Quick-Add Presets (Optional testing) */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
        <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1 mb-2">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Quick-Add Benchmark Retail Formulations:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {DEMO_BOTTLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() =>
                processExtractedBottleText(preset.name, preset.text, 'BENCHMARK_PRESET')
              }
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-400 hover:text-white"
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Real INCI Formulation Input */}
      <form onSubmit={handleManualAdd} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Product Name (e.g. Cerave SA Cleanser)"
          value={manualName}
          onChange={(e) => setManualName(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Paste real INCI text (e.g. Salicylic Acid, Glycolic Acid, Ceramides...)"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          className="flex items-center justify-center space-x-1 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Real Product</span>
        </button>
      </form>
    </div>
  );
};