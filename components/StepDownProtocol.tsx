'use client';

import React, { useState } from 'react';
import { Calendar, Sun, Moon, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { RECOVERY_PROTOCOL } from '@/lib/bir-arbiter';

export const StepDownProtocol: React.FC = () => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const currentSchedule = RECOVERY_PROTOCOL[activeDayIndex];

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface-card/70 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <span>Prescribed 5-to-7 Day Step-Down Soothing Protocol</span>
          </h3>
          <p className="text-xs text-slate-400">
            Metric-governed emergency lipid replacement protocol to restore stratum corneum integrity
          </p>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {RECOVERY_PROTOCOL.map((sched, idx) => (
            <button
              key={sched.day}
              onClick={() => setActiveDayIndex(idx)}
              className={`rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all ${
                activeDayIndex === idx
                  ? 'bg-cyan-500 text-black shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Day {sched.day}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5">
          <span className="font-mono text-xs font-bold text-cyan-300">
            {currentSchedule.phase}
          </span>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
            {currentSchedule.rationale}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AM Routine */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-300 pb-2 border-b border-slate-800">
              <Sun className="h-4 w-4" />
              <span>MORNING REPAIR (AM)</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {currentSchedule.amSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-mono font-bold mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* PM Routine */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-indigo-300 pb-2 border-b border-slate-800">
              <Moon className="h-4 w-4" />
              <span>NIGHTTIME OCCLUSIVE (PM)</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {currentSchedule.pmSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-mono font-bold mt-0.5">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prohibited in this phase */}
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-950/20 p-3 flex items-center space-x-2 text-xs text-red-300">
          <AlertOctagon className="h-4 w-4 shrink-0 text-red-400" />
          <span>
            <strong>Prohibited in this phase:</strong> {currentSchedule.restrictedActives.join(', ')}
          </span>
        </div>
      </div>
    </div>
  );
};
