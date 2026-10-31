'use client';

import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { saveUserApiKey, getUserApiKey } from '@/lib/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState(getUserApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400">
          <Key className="h-5 w-5" />
          <h3 className="text-base font-bold text-white">Perfect Corp YouCam API Key</h3>
        </div>

        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          BarrierAudit interfaces with Perfect Corp&apos;s AI Skin Analysis Task endpoint (
          <code className="text-cyan-300">https://yce-api.makeupar.com/api/v1/task</code>).
        </p>

        <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-3 text-xs text-cyan-200">
          <ShieldCheck className="h-4 w-4 inline mr-1 text-cyan-400" />
          <strong>100% Production Real Output:</strong> All scans execute live against Perfect Corp servers. No simulated numbers or mock fallbacks are used.
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              Your YouCam API Key:
            </label>
            <input
              type="text"
              placeholder="e.g. your_perfect_corp_api_key_here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://yce.makeupar.com/api-console/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-300"
            >
              <span>Get API Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-cyan-500"
              >
                {savedSuccess ? <Check className="h-4 w-4" /> : <span>Save & Connect</span>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};