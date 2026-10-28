'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { JudgeBar } from '@/components/JudgeBar';
import { SkinAnalysisCard } from '@/components/SkinAnalysisCard';
import { MaskCanvasViewer } from '@/components/MaskCanvasViewer';
import { ShelfScanner } from '@/components/ShelfScanner';
import { QuarantineDashboard } from '@/components/QuarantineDashboard';
import { StepDownProtocol } from '@/components/StepDownProtocol';
import { LongitudinalDelta } from '@/components/LongitudinalDelta';
import { QuarantineCardModal } from '@/components/QuarantineCardModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { SkinTelemetry, ShelfProduct, BIRAnalysis, CasePreset } from '@/lib/types';
import { calculateBIR } from '@/lib/bir-arbiter';
import { CASE_PRESETS } from '@/lib/sample-data';
import {
  saveTelemetryHistory,
  getTelemetryHistory,
  saveShelfInventory,
  getShelfInventory,
  clearAllLocalData,
} from '@/lib/storage';

export default function Home() {
  const [telemetry, setTelemetry] = useState<SkinTelemetry | null>(null);
  const [birAnalysis, setBirAnalysis] = useState<BIRAnalysis | null>(null);
  const [shelfProducts, setShelfProducts] = useState<ShelfProduct[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<SkinTelemetry[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>('case-collapse');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiSource, setApiSource] = useState<'YOUCAM_CLOUD_API' | 'LOCAL_CLINICAL_CV_FALLBACK'>('LOCAL_CLINICAL_CV_FALLBACK');

  // Modals
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Initialize with Case 1 (The Critical Barrier Collapse preset) on first load
  useEffect(() => {
    const savedProducts = getShelfInventory();
    const savedHistory = getTelemetryHistory();

    if (savedHistory.length > 0) {
      setTelemetryHistory(savedHistory);
      setTelemetry(savedHistory[0]);
      setBirAnalysis(calculateBIR(savedHistory[0]));
    } else {
      // Load preset 1 default
      loadPreset(CASE_PRESETS[0]);
    }

    if (savedProducts.length > 0) {
      setShelfProducts(savedProducts);
    }
  }, []);

  const loadPreset = (preset: CasePreset) => {
    setActivePresetId(preset.id);
    setTelemetry(preset.telemetry);
    const bir = calculateBIR(preset.telemetry);
    setBirAnalysis(bir);

    const generatedProducts: ShelfProduct[] = preset.sampleShelf.map((p, idx) => ({
      ...p,
      id: `preset-${preset.id}-${idx}`,
      scannedAt: new Date().toISOString(),
    }));

    setShelfProducts(generatedProducts);
    saveShelfInventory(generatedProducts);

    // Update history
    const updatedHistory = [preset.telemetry, ...telemetryHistory.filter((t) => t.timestamp !== preset.telemetry.timestamp)];
    setTelemetryHistory(updatedHistory);
    saveTelemetryHistory(preset.telemetry);
  };

  const handleCustomAnalysisComplete = (newTelemetry: SkinTelemetry) => {
    setActivePresetId(null);
    setTelemetry(newTelemetry);
    const bir = calculateBIR(newTelemetry);
    setBirAnalysis(bir);

    const updatedHistory = [newTelemetry, ...telemetryHistory];
    setTelemetryHistory(updatedHistory);
    saveTelemetryHistory(newTelemetry);

    // Re-evaluate shelf products with new barrier state
    const isCollapse = bir.status === 'CRITICAL_BARRIER_COLLAPSE';
    const updatedShelf = shelfProducts.map((prod) => {
      const hasContraindicated = prod.detectedActives.some((a) => a.contraindicatedInCollapse);
      return {
        ...prod,
        isQuarantined: isCollapse && hasContraindicated,
        quarantineDaysRemaining: isCollapse && hasContraindicated ? (prod.overallHazard === 'SEVERE_EXFOLIANT' ? 7 : 5) : 0,
      };
    });
    setShelfProducts(updatedShelf);
    saveShelfInventory(updatedShelf);

    // Sync to Supabase route in background
    fetch('/api/save-telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telemetry: newTelemetry, birAnalysis: bir }),
    }).catch((e) => console.log('Supabase sync skipped'));
  };

  const handleAddProduct = (product: ShelfProduct) => {
    const updated = [product, ...shelfProducts];
    setShelfProducts(updated);
    saveShelfInventory(updated);
  };

  const handleRemoveProduct = (id: string) => {
    const updated = shelfProducts.filter((p) => p.id !== id);
    setShelfProducts(updated);
    saveShelfInventory(updated);
  };

  const handleClearData = () => {
    clearAllLocalData();
    setTelemetry(null);
    setBirAnalysis(null);
    setShelfProducts([]);
    setTelemetryHistory([]);
    setActivePresetId(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] clinical-grid">
      {/* Navigation */}
      <Navbar
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onClearData={handleClearData}
        apiSource={apiSource}
      />

      {/* Judges / Evaluators 1-Click Test Toolbar */}
      <JudgeBar
        activePresetId={activePresetId}
        onSelectPreset={loadPreset}
        onResetToCapture={() => {
          setActivePresetId(null);
          setTelemetry(null);
          setBirAnalysis(null);
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-950/20 p-5 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Real-Time Cosmetic Circuit Breaker
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
                Stop Over-Exfoliation. Lock Away Destructive Actives.
              </h1>
              <p className="mt-1.5 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                Over 60% of consumers confuse chemical barrier collapse for new acne breakouts and apply harsh acids to wounded skin.
                BarrierAudit pairs <strong>YouCam Skin AI computer vision</strong> with <strong>on-device OCR</strong> to differentiate diffuse erythema from acne, compute the Barrier Integrity Ratio (BIR), and quarantine conflicting bottles.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-cyan-400 hover:text-white transition-all"
              >
                Bathroom Quarantine Card
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Visual Telemetry & Spatial Mask Layer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkinAnalysisCard
            telemetry={telemetry}
            birAnalysis={birAnalysis}
            onAnalysisComplete={handleCustomAnalysisComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          <MaskCanvasViewer telemetry={telemetry} />
        </div>

        {/* Section 2: Physical Shelf Scanning & Regimen Quarantine Arbiter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ShelfScanner
            products={shelfProducts}
            isBarrierCollapsed={birAnalysis?.status === 'CRITICAL_BARRIER_COLLAPSE'}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
          />
          <QuarantineDashboard
            products={shelfProducts}
            birAnalysis={birAnalysis}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onRemoveProduct={handleRemoveProduct}
          />
        </div>

        {/* Section 3: Prescribed Step-Down Protocol & Longitudinal Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StepDownProtocol />
          <LongitudinalDelta history={telemetryHistory} />
        </div>
      </main>

      {/* Printable / Downloadable Bathroom Mirror Quarantine Card Modal */}
      <QuarantineCardModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        products={shelfProducts}
        birAnalysis={birAnalysis}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySaved={() => setApiSource('YOUCAM_CLOUD_API')}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-[#060910] py-8 text-center text-xs text-slate-500 font-mono">
        <p>
          BARRIERAUDIT &bull; Cosmetic Routine Decision Support Tool &bull; Powered by Perfect Corp YouCam Skin AI
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Disclaimer: BarrierAudit is a cosmetic routine arbiter and does not provide medical diagnosis or treat clinical dermatological diseases.
        </p>
      </footer>
    </div>
  );
}
