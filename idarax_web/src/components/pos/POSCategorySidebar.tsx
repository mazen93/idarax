'use client';

import React from 'react';
import { Grid3X3, Layers } from 'lucide-react';

interface POSCategorySidebarProps {
    categories: any[];
    menus: any[];
    selectedCategory: string;
    setSelectedCategory: (id: string) => void;
    selectedMenuId: string;
    setSelectedMenuId: (id: string) => void;
    t: any;
    isRTL: boolean;
    language: string;
}

export function POSCategorySidebar({
    categories,
    menus,
    selectedCategory,
    setSelectedCategory,
    selectedMenuId,
    setSelectedMenuId,
    t,
    isRTL,
    language
}: POSCategorySidebarProps) {
    return (
        <aside className="w-72 bg-[var(--background)] border-r border-border flex flex-col h-full overflow-hidden">
            {/* Menu Picker */}
            {menus.length > 0 && (
                <div className="p-4 border-b border-border space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2 flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        {t('active_menus') || 'Menus'}
                    </p>
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => setSelectedMenuId('all')}
                            className={`px-4 py-2 rounded-xl text-left text-sm font-bold transition-all ${
                                selectedMenuId === 'all' 
                                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {t('all_menus') || 'All Menus'}
                        </button>
                        {menus.map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => setSelectedMenuId(menu.id)}
                                className={`px-4 py-2 rounded-xl text-left text-sm font-medium transition-all ${
                                    selectedMenuId === menu.id 
                                    ? 'bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20' 
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {isRTL ? (menu.nameAr || menu.name) : menu.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-6">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-2 flex items-center gap-2">
                        <Grid3X3 className="w-3 h-3" />
                        {t('categories')}
                    </p>
                    <div className="space-y-1.5">
                        <button
                            key="all"
                            onClick={() => setSelectedCategory('all')}
                            className={`w-full px-4 py-4 rounded-2xl flex items-center justify-between transition-all group ${
                                selectedCategory === 'all'
                                ? 'bg-white/5 border border-border text-white shadow-xl'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-zinc-300'
                            }`}
                        >
                            <span className="font-bold">{t('all')}</span>
                        </button>

                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full px-4 py-4 rounded-2xl flex items-center justify-between transition-all group ${
                                    selectedCategory === cat.id
                                    ? 'bg-white/10 border border-white/20 text-white shadow-xl scale-[1.02]'
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-zinc-300'
                                }`}
                            >
                                <span className="font-bold">{isRTL ? (cat.nameAr || cat.name) : cat.name}</span>
                                {cat.id === selectedCategory && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
