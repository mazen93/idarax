'use client';

import React from 'react';
import { Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { hasFeature } from '@/utils/auth';
import { useUpgradeModal } from '@/components/UpgradeModal';
import { useLanguage } from '@/components/LanguageContext';

interface FeatureGateProps {
    feature: string;
    requiredPlan: 'Professional' | 'Enterprise';
    children: React.ReactNode;
    title?: string;
    description?: string;
    icon?: string;
}

export function FeatureGate({
    feature,
    requiredPlan,
    children,
    title,
    description,
    icon
}: FeatureGateProps) {
    const { t, isRTL } = useLanguage();
    const { openUpgradeModal } = useUpgradeModal();
    const isLocked = !hasFeature(feature);

    if (isLocked) {
        return (
            <div className="relative min-h-[400px] w-full rounded-3xl overflow-hidden border border-border bg-[#0d0f14]/50 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                {/* Background decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[100px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-md animate-in fade-in zoom-in-95 duration-500">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent border border-border mb-8 shadow-2xl">
                        <Lock className="w-8 h-8 text-zinc-400" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles className="w-3 h-3" />
                        {requiredPlan} Feature
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                        {title || t('feature_locked') || 'Premium Feature Locked'}
                    </h2>
                    
                    <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                        {description || t('feature_locked_desc') || `Unlock ${feature} and take your business to the next level with our ${requiredPlan} plan.`}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => openUpgradeModal({
                                featureName: title || feature,
                                featureDescription: description || `Upgrade to ${requiredPlan} to access this feature.`,
                                requiredPlan: requiredPlan,
                                icon: icon
                            })}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black text-sm transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center justify-center gap-2"
                        >
                            Upgrade Now
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                        
                        <button 
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-sm transition-all border border-border"
                        >
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Content preview (blurred) */}
                <div className="absolute inset-x-8 bottom-[-50px] top-8 rounded-t-[3rem] border-t border-x border-border bg-white/5 blur-[2px] opacity-20 pointer-events-none select-none overflow-hidden">
                    <div className="p-8 space-y-4">
                        <div className="h-8 w-1/3 bg-white/10 rounded-lg" />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-32 bg-white/10 rounded-2xl" />
                            <div className="h-32 bg-white/10 rounded-2xl" />
                            <div className="h-32 bg-white/10 rounded-2xl" />
                        </div>
                        <div className="h-64 bg-white/10 rounded-3xl" />
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
