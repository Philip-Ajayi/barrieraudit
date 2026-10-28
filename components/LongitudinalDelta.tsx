'use client';

import React from 'react';
import { TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { SkinTelemetry } from '@/lib/types';

interface LongitudinalDeltaProps {
  history: SkinTelemetry[];
}

export const LongitudinalDelta: React.FC<LongitudinalDeltaProps> = ({ history }) => {
  if (history.length < 2) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
        <h3 className="text-base font-bold text-white flex items-center space-x-2 pb-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <span>Longitudinal Delta Engine (Day 1 vs Follow-up)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Requires at least 2 skin scans to compute objective metric deltas (ΔRedness, ΔMoisture).
          Select different presets or perform a follow-up scan to visualize progress.
        </p>
      </div>
    );
  }

  const latest = history[0];
  const baseline = history[history.length - 1];

  const deltaRedness = latest.redness - baseline.redness;
  const deltaMoisture = latest.moisture - baseline.moisture;
  const deltaTexture = latest.texture - baseline.texture;

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="pb-4 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          <span>Longitudinal Delta Engine (Day 1 Baseline vs Latest Scan)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Objective visual telemetry deltas proving barrier reconstruction
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Redness Delta */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-mono text-slate-400">Δ Erythema / Redness</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black font-mono ${
                deltaRedness <= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {deltaRedness > 0 ? `+${deltaRedness}` : deltaRedness}
            </span>
            <span className="text-xs text-slate-400">
              ({baseline.redness} → {latest.redness})
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-400">
            {deltaRedness < 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" /> Capillary inflammation resolving
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Active flushing increased
              </span>
            )}
          </div>
        </div>

        {/* Moisture Delta */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-mono text-slate-400">Δ Stratum Hydration</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black font-mono ${
                deltaMoisture >= 0 ? 'text-cyan-400' : 'text-red-400'
              }`}
            >
              {deltaMoisture > 0 ? `+${deltaMoisture}` : deltaMoisture}
            </span>
            <span className="text-xs text-slate-400">
              ({baseline.moisture} → {latest.moisture})
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-400">
            {deltaMoisture > 0 ? (
              <span className="text-cyan-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Lipid barrier holding moisture
              </span>
            ) : (
              <span className="text-red-400 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" /> Moisture deficit worsening
              </span>
            )}
          </div>
        </div>

        {/* Texture Delta */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-mono text-slate-400">Δ Roughness / Flaking</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              className={`text-2xl font-black font-mono ${
                deltaTexture <= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {deltaTexture > 0 ? `+${deltaTexture}` : deltaTexture}
            </span>
            <span className="text-xs text-slate-400">
              ({baseline.texture} → {latest.texture})
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-400">
            {deltaTexture < 0 ? (
              <span className="text-emerald-400 flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" /> Surface smoothing detected
              </span>
            ) : (
              <span className="text-amber-400 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Roughness persists
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
