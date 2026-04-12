'use client';

import React from 'react';
import { 
    Search, WifiOff, RefreshCw, Lock as LockIcon, History, 
    ClipboardList, MoreHorizontal 
} from 'lucide-react';

interface POSHeaderProps {
    t: any;
    isRTL: boolean;
    isOnline: boolean;
    offlineQueueCount: number;
    usingCache: boolean;
    search: string;
    setSearch: (val: string) => void;
    onRefresh: () => void;
    onCloseDrawer: () => void;
    syncToast: { count: number } | null;
}

export function POSHeader({
    t,
    isRTL,
    isOnline,
    offlineQueueCount,
    usingCache,
    search,
    setSearch,
    onRefresh,
    onCloseDrawer,
    syncToast
}: POSHeaderProps) {
    return (
        <header className="h-20 bg-[var(--background)] border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-opacity-90">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="search"
                        placeholder={t('search_products')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-border rounded-2xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                </div>

                {!isOnline && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-500/10 border border-warning-500/20 rounded-full">
                        <WifiOff className="h-4 w-4 text-warning-500" />
                        <span className="text-[10px] font-bold text-warning-500 uppercase tracking-wider">{t('offline_mode')}</span>
                    </div>
                )}
                
                {usingCache && isOnline && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full animate-pulse">
                        <RefreshCw className="h-4 w-4 text-primary-500" />
                        <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">{t('refreshing_data')}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {offlineQueueCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-error-500/10 border border-error-500/20 rounded-xl text-error-500">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-error-500"></span>
                        </span>
                        <span className="text-sm font-black">{offlineQueueCount} {t('pending_sync')}</span>
                    </div>
                )}

                {syncToast && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-primary animate-in fade-in slide-in-from-top duration-500">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-black">{syncToast.count} {t('orders_synced')}</span>
                    </div>
                )}

                <div className="flex bg-white/5 p-1 rounded-2xl border border-border">
                    <button 
                        onClick={onCloseDrawer}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-warning-500/10 rounded-xl transition-all group text-warning-500"
                    >
                        <Landmark className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('close_drawer')}</span>
                    </button>
                    <div className="w-[1px] h-6 bg-white/10 my-auto mx-1" />
                    <button className="p-3 hover:bg-white/5 rounded-xl transition-all group border-l border-border">
                        <MoreHorizontal className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                    </button>
                </div>
            </div>
        </header>
    );
}

function Landmark({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <line x1="3" y1="22" x2="21" y2="22"></line>
            <line x1="6" y1="18" x2="6" y2="11"></line>
            <line x1="10" y1="18" x2="10" y2="11"></line>
            <line x1="14" y1="18" x2="14" y2="11"></line>
            <line x1="18" y1="18" x2="18" y2="11"></line>
            <polygon points="12 2 3 7 21 7 12 2"></polygon>
        </svg>
    );
}
