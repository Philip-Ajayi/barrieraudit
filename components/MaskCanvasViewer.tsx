'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, Layers, Sliders, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SkinTelemetry } from '@/lib/types';

interface MaskCanvasViewerProps {
  telemetry: SkinTelemetry | null;
}

type ActiveChannel = 'redness' | 'moisture' | 'texture' | 'acne';

export const MaskCanvasViewer: React.FC<MaskCanvasViewerProps> = ({ telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [channel, setChannel] = useState<ActiveChannel>('redness');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [maskLoadError, setMaskLoadError] = useState<string | null>(null);

  const activeMaskUrl =
    telemetry?.maskUrls?.[channel] ||
    (channel === 'redness' ? telemetry?.maskDataUrl : undefined) ||
    telemetry?.maskUrls?.overlay ||
    telemetry?.maskUrls?.composite;

  useEffect(() => {
    if (!telemetry || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setMaskLoadError(null);

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src =
      telemetry.rawPhotoUrl ||
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=688&q=80';

    baseImg.onload = () => {
      canvas.width = 640;
      canvas.height = Math.round((640 * baseImg.height) / baseImg.width);

      // 1. Draw base photo
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      if (showOriginal || !activeMaskUrl) return;

      // 2. Load authentic YouCam spatial mask
      const maskImg = new Image();
      maskImg.crossOrigin = 'anonymous';
      maskImg.src = activeMaskUrl;

      maskImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      };

      maskImg.onerror = () => {
        setMaskLoadError(
          `Could not render YouCam mask bitmap for ${channel}. The mask asset may be blocked by CORS or unavailable.`
        );
      };
    };
  }, [telemetry, opacity, channel, showOriginal, activeMaskUrl]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <span>YouCam Spatial Mask Telemetry</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real production computer vision mask overlay returned by Perfect Corp API
          </p>
        </div>

        {/* Channel Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setChannel('redness');
              setShowOriginal(false);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'redness' && !showOriginal
                ? 'bg-red-600 text-white shadow-crimsonGlow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Redness
          </button>
          <button
            onClick={() => {
              setChannel('moisture');
              setShowOriginal(false);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'moisture' && !showOriginal
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Moisture
          </button>
          <button
            onClick={() => {
              setChannel('texture');
              setShowOriginal(false);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'texture' && !showOriginal
                ? 'bg-amber-600 text-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Texture
          </button>
          <button
            onClick={() => {
              setChannel('acne');
              setShowOriginal(false);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'acne' && !showOriginal
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Acne
          </button>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              showOriginal
                ? 'bg-emerald-600 text-white'
                : 'border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Raw Photo</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="mt-4 relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black/70 min-h-[300px]">
        {telemetry ? (
          <canvas
            ref={canvasRef}
            className="max-h-[460px] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        ) : (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            Awaiting selfie capture or upload to stream YouCam telemetry...
          </div>
        )}

        {/* Telemetry Indicator */}
        {telemetry && (
          <div className="absolute top-3 left-3 rounded border border-white/10 bg-black/80 px-2 py-1 font-mono text-[10px] text-cyan-300 backdrop-blur-sm">
            CHANNEL: {channel.toUpperCase()} | PRODUCTION SCORE:{' '}
            {channel === 'redness'
              ? telemetry.redness
              : channel === 'moisture'
              ? telemetry.moisture
              : channel === 'texture'
              ? telemetry.texture
              : telemetry.acne}
            /100
          </div>
        )}

        {/* Mask Availability Status */}
        {telemetry && !showOriginal && (
          <div className="absolute bottom-3 right-3 rounded border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 backdrop-blur-sm flex items-center space-x-1">
            {activeMaskUrl ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>YouCam Mask Bitmap Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Score Only (No Mask URL returned)</span>
              </>
            )}
          </div>
        )}
      </div>

      {maskLoadError && (
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 text-xs text-amber-300 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{maskLoadError}</span>
        </div>
      )}

      {/* Alpha Slider */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span>Mask Alpha Blending:</span>
          <span className="font-bold text-cyan-300">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          disabled={!activeMaskUrl || showOriginal}
          className="h-1.5 w-48 cursor-pointer accent-cyan-400 disabled:opacity-40"
        />
      </div>
    </div>
  );
};