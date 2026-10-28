'use client';

import React from 'react';
import { ShieldAlert, Cpu, Key, Trash2, HeartHandshake } from 'lucide-react';
import { getUserApiKey } from '@/lib/storage';

interface NavbarProps {
  onOpenKeyModal: () => void;
  onClearData: () => void;
  apiSource: 'YOUCAM_CLOUD_API' | 'LOCAL_CLINICAL_CV_FALLBACK';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenKeyModal,
  onClearData,
  apiSource,
}) => {
  const hasCustomKey = typeof window !== 'undefined' && !!getUserApiKey();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-red-600 shadow-glow">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-black tracking-wider text-white">
                BARRIER<span className="text-cyan-400">AUDIT</span>
              </span>
              <span className="rounded border border-red-500/40 bg-red-950/60 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                CIRCUIT BREAKER
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Active-Induced Barrier Collapse & Regimen Quarantine Arbiter
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* API Status Pill */}
          <button
            onClick={onOpenKeyModal}
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-mono transition-all ${
              apiSource === 'YOUCAM_CLOUD_API' || hasCustomKey
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400'
            }`}
            title="Configure Perfect Corp YouCam Skin API Key"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span className="hidden md:inline">
              {apiSource === 'YOUCAM_CLOUD_API' ? 'YouCam API: Connected' : 'YouCam Engine: Ready'}
            </span>
            <span className="md:hidden">YouCam</span>
            <Key className="h-3 w-3 opacity-60" />
          </button>

          {/* Anti-consumption badge */}
          <div className="hidden items-center space-x-1 rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300 lg:flex">
            <HeartHandshake className="h-3.5 w-3.5 text-pink-400" />
            <span>Anti-Consumption Defender</span>
          </div>

          {/* Reset */}
          <button
            onClick={onClearData}
            title="Reset telemetry & inventory"
            className="flex items-center rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
