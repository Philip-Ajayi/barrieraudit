'use client';

import React from 'react';
import { ShieldX, ShieldCheck, Lock, Clock, AlertTriangle, Sparkles, Printer } from 'lucide-react';
import { ShelfProduct, BIRAnalysis } from '@/lib/types';

interface QuarantineDashboardProps {
  products: ShelfProduct[];
  birAnalysis: BIRAnalysis | null;
  onOpenPrintModal: () => void;
  onRemoveProduct: (id: string) => void;
}

export const QuarantineDashboard: React.FC<QuarantineDashboardProps> = ({
  products,
  birAnalysis,
  onOpenPrintModal,
  onRemoveProduct,
}) => {
  const isCollapse = birAnalysis?.status === 'CRITICAL_BARRIER_COLLAPSE';
  const quarantinedCount = products.filter((p) => p.isQuarantined).length;
  const safeCount = products.filter((p) => !p.isQuarantined).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldX className="h-5 w-5 text-red-500" />
              <span>Regimen Quarantine Arbiter</span>
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                isCollapse ? 'bg-red-950 text-red-400 border border-red-500/50' : 'bg-emerald-950 text-emerald-400'
              }`}
            >
              {quarantinedCount} LOCKED / {safeCount} PERMITTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic chemical contraindication interceptor locking away irritants during active collapse
          </p>
        </div>

        {quarantinedCount > 0 && (
          <button
            onClick={onOpenPrintModal}
            className="flex items-center space-x-1.5 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-900/60 transition-all"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Generate Bathroom Quarantine Card</span>
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-500">
          No bottles in shelf inventory. Upload a bottle photo or choose a preset above.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {products.map((product) => {
            const isQuarantined = product.isQuarantined;

            return (
              <div
                key={product.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isQuarantined
                    ? 'border-red-500/60 bg-gradient-to-br from-red-950/40 to-slate-900 shadow-crimsonGlow'
                    : 'border-emerald-500/40 bg-slate-900/60'
                }`}
              >
                {/* Quarantine Stamp Badge */}
                {isQuarantined ? (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 rounded bg-red-600 px-2.5 py-1 font-mono text-[10px] font-black tracking-widest text-white shadow-lg">
                    <Lock className="h-3 w-3" />
                    <span>QUARANTINED ({product.quarantineDaysRemaining || 7} DAYS)</span>
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 rounded bg-emerald-600/90 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                    <ShieldCheck className="h-3 w-3" />
                    <span>SAFE FOR REPAIR</span>
                  </div>
                )}

                <div className="pr-32">
                  <h4 className="text-sm font-bold text-white">{product.name}</h4>
                  {product.brand && (
                    <span className="text-[11px] text-slate-400 font-mono">{product.brand}</span>
                  )}
                </div>

                {/* Detected Actives Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.detectedActives.length > 0 ? (
                    product.detectedActives.map((act, i) => (
                      <span
                        key={i}
                        className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold ${
                          act.contraindicatedInCollapse && isCollapse
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {act.inciName}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-500">No high-risk actives detected</span>
                  )}
                </div>

                {/* Clinical Hazard Warning */}
                {isQuarantined && (
                  <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 p-2.5 text-[11px] text-red-200">
                    <div className="flex items-center space-x-1 font-bold text-red-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Contraindicated in Stratum Corneum Breakdown</span>
                    </div>
                    <p className="mt-1 text-[10px] text-red-300/90 leading-tight">
                      Applying this product will chemically denature healing keratinocytes. Lock bottle away until BIR resets &gt; 1.0.
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="font-mono text-slate-500">
                    Hazard: <span className="text-slate-300">{product.overallHazard}</span>
                  </span>
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
