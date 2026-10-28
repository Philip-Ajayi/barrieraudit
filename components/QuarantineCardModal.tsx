'use client';

import React from 'react';
import { X, Lock, ShieldAlert, Check, Calendar, AlertTriangle } from 'lucide-react';
import { ShelfProduct, BIRAnalysis } from '@/lib/types';

interface QuarantineCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ShelfProduct[];
  birAnalysis: BIRAnalysis | null;
}

export const QuarantineCardModal: React.FC<QuarantineCardModalProps> = ({
  isOpen,
  onClose,
  products,
  birAnalysis,
}) => {
  if (!isOpen) return null;

  const quarantinedProducts = products.filter((p) => p.isQuarantined);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-red-500/40 bg-slate-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg border border-slate-700 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Printable Section */}
        <div id="quarantine-printable-card" className="p-4 bg-white text-slate-900 rounded-xl">
          <div className="border-b-2 border-red-600 pb-3 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-black tracking-wider text-red-600 font-mono">
                  BARRIERAUDIT NOTICE
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                ACTIVE-INDUCED STRATUM CORNEUM COLLAPSE INTERCEPT
              </p>
            </div>

            <div className="text-right font-mono text-xs">
              <span className="font-bold">STATUS: QUARANTINED</span>
              <div className="text-red-600 font-bold">
                BIR: {birAnalysis?.birScore || '0.22'} (CRITICAL)
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-red-50 p-3 border border-red-200 text-xs text-red-900">
            <strong>ATTENTION:</strong> Do NOT apply the following physical bottles sitting on your
            bathroom counter. Nerves and corneal lipids are stripped. Plain water may sting.
          </div>

          <div className="mt-4 space-y-2">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wide text-slate-700">
              Physical Bottles to Lock Away (7 Days Minimum):
            </h3>
            {quarantinedProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between rounded border border-slate-300 p-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{prod.name}</span>
                  <div className="text-[10px] text-slate-500">
                    Actives: {prod.detectedActives.map((a) => a.inciName).join(', ')}
                  </div>
                </div>
                <span className="rounded bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                  DO NOT TOUCH
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900">
            <strong>PERMITTED ROUTINE:</strong> Lukewarm water rinse, Ceramide NP/AP/EOP cream,
            pure Squalane oil, Zinc Oxide SPF. No foams, no scrubs, no acids.
          </div>

          <div className="mt-4 text-[10px] text-slate-500 border-t pt-2 flex justify-between">
            <span>Verified by Perfect Corp YouCam Skin AI Telemetry</span>
            <span>Printed on: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:text-white"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
          >
            Print / Save PDF for Bathroom Mirror
          </button>
        </div>
      </div>
    </div>
  );
};
