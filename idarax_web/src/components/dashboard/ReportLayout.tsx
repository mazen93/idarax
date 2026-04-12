'use client';

import React, { useState } from 'react';
import {
    Download, Calendar, Filter, FileText,
    ChevronDown, Printer, Share2, Search
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface ReportLayoutProps {
    title: string;
    subtitle?: string;
    filters?: React.ReactNode;
    children: React.ReactNode;
    onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
    isLoading?: boolean;
}

export default function ReportLayout({
    title,
    subtitle,
    filters,
    children,
    onExport,
    isLoading
}: ReportLayoutProps) {
    const { t, isRTL } = useLanguage();
    const [showExportMenu, setShowExportMenu] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section with Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-card border border-border p-8 rounded-[2.5rem] backdrop-blur-sm shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{title}</h1>
                    {subtitle && <p className="text-muted-foreground font-medium text-sm">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-success-500/20 active:scale-95"
                        >
                            <Download className="h-4 w-4" />
                            {t('export')}
                            <ChevronDown className={`h-4 w-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showExportMenu && (
                            <div className={`absolute top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 p-2 overflow-hidden ${isRTL ? 'left-0' : 'right-0'}`}>
                                {[
                                    { id: 'csv', label: 'CSV', icon: FileText },
                                    { id: 'excel', label: 'Excel', icon: Grid3X3 },
                                    { id: 'pdf', label: 'PDF', icon: Printer }
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            onExport?.(type.id as any);
                                            setShowExportMenu(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-xl"
                                    >
                                        <type.icon className="h-4 w-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-muted/40 border border-border/50 p-6 rounded-3xl flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('filters')}</span>
                </div>
                <div className="h-4 w-[1px] bg-border hidden md:block" />
                <div className="flex-1 flex flex-wrap items-center gap-4">
                    {filters}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[2px] rounded-3xl flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-success-500 rounded-full animate-spin" />
                    </div>
                )}
                <div className={`overflow-hidden rounded-3xl border border-border bg-card/20 backdrop-blur-sm ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

// Sub-component for a Standard Filter Option
export function ReportFilterGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">{label}</label>
            {children}
        </div>
    );
}

const Grid3X3 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>
);
