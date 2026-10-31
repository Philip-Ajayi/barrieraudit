'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertOctagon, Activity, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SkinTelemetry, BIRAnalysis } from '@/lib/types';
import { analyzeSkinPhoto } from '@/lib/youcam-client';

interface SkinAnalysisCardProps {
  telemetry: SkinTelemetry | null;
  birAnalysis: BIRAnalysis | null;
  onAnalysisComplete: (telemetry: SkinTelemetry) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const SkinAnalysisCard: React.FC<SkinAnalysisCardProps> = ({
  telemetry,
  birAnalysis,
  onAnalysisComplete,
  isLoading,
  setIsLoading,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image exceeds 10MB limit. Please upload a smaller JPEG or PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setErrorMessage('Could not access camera. Please check browser permissions or upload a selfie file.');
    }
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.92);

    cancelCamera();
    processImage(base64);
  };

  const cancelCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const processImage = async (base64: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await analyzeSkinPhoto(base64);
      onAnalysisComplete(res.telemetry);
    } catch (err: any) {
      setErrorMessage(err.message || 'YouCam Skin AI task failed. Please verify API Key or image quality.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <span>Visual Skin Telemetry</span>
            </h2>
            {telemetry?.isLiveProduction && (
              <span className="flex items-center space-x-1 rounded bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>LIVE YOUCAM OUTPUT</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Perfect Corp YouCam Skin AI multi-spectral spatial scanning
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {!cameraActive ? (
            <>
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Live Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center space-x-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Selfie</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={captureSnapshot}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500"
              >
                Capture Face
              </button>
              <button
                onClick={cancelCamera}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300 flex items-start space-x-2">
          <AlertOctagon className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Live Stream Viewfinder */}
      {cameraActive && (
        <div className="mt-4 relative overflow-hidden rounded-xl border border-cyan-500/40 bg-black">
          <video ref={videoRef} className="w-full max-h-[320px] object-cover" />
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-cyan-400/40 m-8 rounded-2xl flex items-center justify-center">
            <span className="text-xs text-cyan-300 bg-black/70 px-2.5 py-1 rounded">
              Center face in frame
            </span>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-cyan-500/30 bg-slate-900/80 p-8 text-center">
          <Loader2 className="h-9 w-9 animate-spin text-cyan-400" />
          <p className="mt-3 text-sm font-semibold text-slate-200">
            Communicating with YouCam Cloud API...
          </p>
          <p className="text-xs font-mono text-cyan-400/80 mt-1">
            Running dst_actions: [&quot;redness&quot;, &quot;moisture&quot;, &quot;texture&quot;, &quot;acne&quot;]
          </p>
        </div>
      )}

      {/* Results Scores */}
      {telemetry && !isLoading && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Redness */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3.5 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-red-300">
                Redness (Erythema)
              </span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-2xl font-black text-red-400 font-mono">
                  {telemetry.redness}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${telemetry.redness}%` }}
                />
              </div>
              <span className="mt-1.5 block text-[10px] text-slate-400">
                {telemetry.redness > 50 ? 'Capillary Vasodilation' : 'Low Vasodilation'}
              </span>
            </div>

            {/* Moisture */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300">
                Moisture (Hydration)
              </span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {telemetry.moisture}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${telemetry.moisture}%` }}
                />
              </div>
              <span className="mt-1.5 block text-[10px] text-slate-400">
                {telemetry.moisture < 30 ? 'Severe Stratum Deficit' : 'Competent Hydration'}
              </span>
            </div>

            {/* Texture */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                Roughness / Texture
              </span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {telemetry.texture}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${telemetry.texture}%` }}
                />
              </div>
              <span className="mt-1.5 block text-[10px] text-slate-400">
                {telemetry.texture > 50 ? 'Micro-fissuring noted' : 'Smooth surface'}
              </span>
            </div>

            {/* Acne */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300">
                Follicular Lesions
              </span>
              <div className="mt-1 flex items-baseline justify-center space-x-1">
                <span className="text-2xl font-black text-purple-400 font-mono">
                  {telemetry.acne}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-400 transition-all duration-500"
                  style={{ width: `${telemetry.acne}%` }}
                />
              </div>
              <span className="mt-1.5 block text-[10px] text-slate-400">
                {telemetry.acne > 50 ? 'Active papules present' : 'Low acne burden'}
              </span>
            </div>
          </div>

          {/* Real BIR Computation Card */}
          {birAnalysis && (
            <div
              className={`rounded-xl border p-4 transition-all ${
                birAnalysis.status === 'CRITICAL_BARRIER_COLLAPSE'
                  ? 'border-red-500/60 bg-gradient-to-r from-red-950/60 to-slate-900 shadow-crimsonGlow'
                  : birAnalysis.status === 'STRESSED'
                  ? 'border-amber-500/60 bg-amber-950/30'
                  : 'border-emerald-500/60 bg-emerald-950/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
                      Barrier Integrity Ratio (BIR):
                    </span>
                    <span className="font-mono text-2xl font-black text-white">
                      {birAnalysis.birScore}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        birAnalysis.status === 'CRITICAL_BARRIER_COLLAPSE'
                          ? 'bg-red-600 text-white animate-pulse'
                          : birAnalysis.status === 'STRESSED'
                          ? 'bg-amber-600 text-black'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {birAnalysis.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {birAnalysis.clinicalSummary}
                  </p>
                </div>

                <div className="shrink-0 rounded-lg border border-slate-700 bg-black/50 p-2.5 font-mono text-[11px] text-slate-300">
                  <div className="text-slate-400 mb-1 font-bold">MATHEMATICAL PROOF:</div>
                  <div>
                    BIR = {birAnalysis.formulaEvidence.moistureVal} / (
                    {birAnalysis.formulaEvidence.rednessDenominator} *{' '}
                    {birAnalysis.formulaEvidence.textureMultiplier})
                  </div>
                  <div className="text-cyan-400 font-bold mt-0.5">
                    = {birAnalysis.birScore}{' '}
                    {birAnalysis.birScore < 0.6
                      ? '(Critical < 0.60 Breach)'
                      : '(Safe Tolerance)'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};