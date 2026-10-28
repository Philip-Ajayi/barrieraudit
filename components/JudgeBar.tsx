'use client';

import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { CASE_PRESETS } from '@/lib/sample-data';
import { CasePreset } from '@/lib/types';

interface JudgeBarProps {
  activePresetId: string | null;
  onSelectPreset: (preset: CasePreset) => void;
  onResetToCapture: () => void;
}

export const JudgeBar: React.FC<JudgeBarProps> = ({
  activePresetId,
  onSelectPreset,
  onResetToCapture,
}) => {
  return (
    <div className="border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-red-950/30 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex h-5 items-center space-x-1 rounded bg-cyan-500/20 px-2 font-mono font-bold text-cyan-300">
            <Sparkles className="h-3 w-3" />
            <span>JUDGES / TESTERS 1-CLICK SUITE</span>
          </span>
          <span className="hidden text-slate-400 sm:inline">
            Load validated clinical edge cases immediately:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {CASE_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            const isCollapse = preset.id === 'case-collapse';
            const isAcne = preset.id === 'case-acne';

            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-900/60 text-white shadow-glow'
                    : 'border-slate-700 bg-slate-900/90 text-slate-300 hover:border-slate-500 hover:text-white'
                }`}
              >
                {isCollapse && <AlertTriangle className="h-3 w-3 text-red-400" />}
                {isAcne && <CheckCircle2 className="h-3 w-3 text-amber-400" />}
                {!isCollapse && !isAcne && <RefreshCw className="h-3 w-3 text-emerald-400" />}
                <span>{preset.title.split(':')[0]}</span>
              </button>
            );
          })}

          <button
            onClick={onResetToCapture}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Custom Upload / Camera
          </button>
        </div>
      </div>
    </div>
  );
};
