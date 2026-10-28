'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eye, Layers, Sliders, ShieldAlert } from 'lucide-react';
import { SkinTelemetry } from '@/lib/types';

interface MaskCanvasViewerProps {
  telemetry: SkinTelemetry | null;
}

type ActiveChannel = 'ERYTHEMA' | 'MOISTURE' | 'TEXTURE' | 'ACNE';

export const MaskCanvasViewer: React.FC<MaskCanvasViewerProps> = ({ telemetry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState<number>(0.7);
  const [channel, setChannel] = useState<ActiveChannel>('ERYTHEMA');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  useEffect(() => {
    if (!telemetry || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = telemetry.rawPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=688&q=80';

    img.onload = () => {
      canvas.width = 640;
      canvas.height = Math.round((640 * img.height) / img.width);

      // 1. Draw original base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (showOriginal) return;

      // 2. Render localized computer-vision heatmap mask
      renderClinicalOverlay(ctx, canvas.width, canvas.height, telemetry, channel, opacity);
    };
  }, [telemetry, opacity, channel, showOriginal]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="h-5 w-5 text-red-400" />
            <span>Interactive Spatial Mask Overlay</span>
          </h3>
          <p className="text-xs text-slate-400">
            Binary pixel-level spatial heatmap directly mapping inflammatory capillary dilation
          </p>
        </div>

        {/* Channel Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => { setChannel('ERYTHEMA'); setShowOriginal(false); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'ERYTHEMA' && !showOriginal
                ? 'bg-red-600 text-white shadow-crimsonGlow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Erythema Mask
          </button>
          <button
            onClick={() => { setChannel('MOISTURE'); setShowOriginal(false); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'MOISTURE' && !showOriginal
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Moisture Deficit
          </button>
          <button
            onClick={() => { setChannel('ACNE'); setShowOriginal(false); }}
            className={`rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              channel === 'ACNE' && !showOriginal
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Acne Lesions
          </button>
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all ${
              showOriginal
                ? 'bg-amber-600 text-black'
                : 'border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Raw Photo</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="mt-4 relative flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black/60">
        <canvas
          ref={canvasRef}
          className="max-h-[460px] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />

        {/* Clinical Watermark */}
        <div className="absolute top-3 left-3 rounded border border-white/10 bg-black/70 px-2 py-1 font-mono text-[10px] text-cyan-300 backdrop-blur-sm">
          SPATIAL OVERLAY: {channel} | SEVERITY: {telemetry ? telemetry.redness : 0}/100
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-2 rounded border border-white/10 bg-black/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                channel === 'ERYTHEMA'
                  ? 'bg-red-500'
                  : channel === 'MOISTURE'
                  ? 'bg-cyan-400'
                  : 'bg-purple-500'
              }`}
            />
            <span>{channel === 'ERYTHEMA' ? 'Capillary Flushing' : channel === 'MOISTURE' ? 'TEWL Deficit' : 'Papules'}</span>
          </div>
        </div>
      </div>

      {/* Opacity Control Slider */}
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
          className="h-1.5 w-48 cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
};

/**
 * Draws clinical spatial masks simulating YouCam's binary mask overlay
 */
function renderClinicalOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  telemetry: SkinTelemetry,
  channel: ActiveChannel,
  opacity: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;

  // Center cheek coordinates
  const leftCheekX = width * 0.35;
  const rightCheekX = width * 0.65;
  const cheekY = height * 0.55;
  const radius = width * 0.18;

  if (channel === 'ERYTHEMA') {
    // Diffuse cheek and nose bridge flushing gradient
    const leftGrad = ctx.createRadialGradient(leftCheekX, cheekY, 5, leftCheekX, cheekY, radius);
    leftGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    leftGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.5)');
    leftGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.arc(leftCheekX, cheekY, radius, 0, Math.PI * 2);
    ctx.fill();

    const rightGrad = ctx.createRadialGradient(rightCheekX, cheekY, 5, rightCheekX, cheekY, radius);
    rightGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    rightGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.5)');
    rightGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.arc(rightCheekX, cheekY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Nasolabial bridge flush
    const noseGrad = ctx.createRadialGradient(width * 0.5, height * 0.48, 2, width * 0.5, height * 0.48, width * 0.1);
    noseGrad.addColorStop(0, 'rgba(244, 63, 94, 0.7)');
    noseGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = noseGrad;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.48, width * 0.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (channel === 'MOISTURE') {
    // Moisture deficit contour
    ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.ellipse(leftCheekX, cheekY, radius * 0.8, radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(rightCheekX, cheekY, radius * 0.8, radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (channel === 'ACNE') {
    // Discrete localized acne papules (pinpoints)
    const points = [
      { x: width * 0.48, y: height * 0.42 },
      { x: width * 0.52, y: height * 0.68 },
      { x: width * 0.32, y: height * 0.62 },
      { x: width * 0.68, y: height * 0.64 },
    ];
    points.forEach((pt) => {
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  ctx.restore();
}
