'use client';

import React from 'react';
import {
    X, Sparkles, TrendingUp, Package,
    ArrowUpRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface AIReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        revenue: any;
        inventory: any;
        topProducts: any[];
    };
}

export default function AIReportModal({ isOpen, onClose, data }: AIReportModalProps) {
    const { t, language } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative p-8 bg-gradient-to-br from-primary-600/20 to-transparent border-b border-border/50">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground tracking-tight">{t('ai_report_title')}</h2>
                                <p className="text-muted-foreground text-sm font-medium mt-1">{t('gen_ai_desc')}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Revenue Insight */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> {t('revenue_insight')}
                        </h3>
                        <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground font-medium">{t('target_progress')}</span>
                                <span className="text-sm font-black text-primary">72%</span>
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '72%' }} />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                                {t('target_progress_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Inventory Insight */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-error-400 uppercase tracking-widest flex items-center gap-2">
                            <Package className="h-4 w-4" /> {t('inventory_insight')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle className="h-4 w-4 text-error-400" />
                                    <span className="text-xs font-bold text-foreground uppercase">{t('critical_stock')}</span>
                                </div>
                                <div className="text-2xl font-black text-foreground">{data.inventory?.lowStockCount || 0}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{t('items_need_attention')}</p>
                            </div>
                            <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-bold text-foreground uppercase">{t('stock_turnover')}</span>
                                </div>
                                <div className="text-2xl font-black text-foreground">4.2x</div>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{t('above_avg')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-warning-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="h-4 w-4" /> {t('actionable_recs')}
                        </h3>
                        <div className="space-y-3">
                            {[
                                t('rec_1'),
                                t('rec_2'),
                                t('rec_3')
                            ].map((rec, i) => (
                                <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all cursor-default group">
                                    <div className="mt-1">
                                        <ArrowUpRight className="h-4 w-4 text-primary group-hover:scale-125 transition-transform" />
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-muted/50 border-t border-border/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-2xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                        {t('close')}
                    </button>
                    <button className="bg-primary hover:bg-primary text-white px-8 py-3 rounded-2xl text-sm font-black shadow-lg shadow-success-500/20 hover:scale-105 transition-all active:scale-95">
                        {t('view_full_report')}
                    </button>
                </div>
            </div>
        </div>
    );
}
