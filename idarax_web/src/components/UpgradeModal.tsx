'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { X, ArrowUp, Lock, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface UpgradeModalConfig {
  featureName: string;
  featureDescription: string;
  requiredPlan: 'Professional' | 'Enterprise';
  icon?: string;
}

interface UpgradeModalContextType {
  openUpgradeModal: (config: UpgradeModalConfig) => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextType>({ openUpgradeModal: () => {} });

export const useUpgradeModal = () => useContext(UpgradeModalContext);

// Colour scheme per plan
const planConfig = {
  Professional: {
    color: 'from-primary-500 to-purple-600',
    badge: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    btn: 'bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700',
  },
  Enterprise: {
    color: 'from-warning-500 to-orange-600',
    badge: 'bg-warning-500/20 text-warning-300 border-warning-500/30',
    btn: 'bg-gradient-to-r from-warning-500 to-orange-600 hover:from-warning-600 hover:to-orange-700',
  },
};

function UpgradeModal({ config, onClose }: { config: UpgradeModalConfig; onClose: () => void }) {
  const locale = useLocale();
  const plan = planConfig[config.requiredPlan];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--background)] border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gradient header */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${plan.color}`} />

        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-5">
          {/* Icon + lock */}
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl shadow-lg`}>
              {config.icon || '✨'}
            </div>
            <div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${plan.badge} mb-1`}>
                <Lock className="h-3 w-3" /> {config.requiredPlan} Plan
              </span>
              <h2 className="text-lg font-bold text-white">{config.featureName}</h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed">{config.featureDescription}</p>

          {/* What you get */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-warning-400" /> What you get
            </p>
            {config.requiredPlan === 'Professional' ? (
              <>
                {['Tables & Reservations', 'KDS Kitchen Display', 'CRM & Loyalty', 'Up to 5 branches'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="h-4 w-4 text-primary-400 shrink-0" /> {f}
                  </div>
                ))}
              </>
            ) : (
              <>
                {['Advanced Analytics', 'Marketing & Campaigns', 'Unlimited branches', 'White-label & API'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle className="h-4 w-4 text-warning-400 shrink-0" /> {f}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
            >
              Maybe later
            </button>
            <Link
              href={`/${locale}/dashboard/billing`}
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center flex items-center justify-center gap-2 transition-all shadow-lg ${plan.btn}`}
            >
              <ArrowUp className="h-4 w-4" /> View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UpgradeModalConfig | null>(null);

  const openUpgradeModal = (cfg: UpgradeModalConfig) => setConfig(cfg);
  const closeModal = () => setConfig(null);

  return (
    <UpgradeModalContext.Provider value={{ openUpgradeModal }}>
      {children}
      {config && <UpgradeModal config={config} onClose={closeModal} />}
    </UpgradeModalContext.Provider>
  );
}
