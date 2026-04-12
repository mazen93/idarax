'use client';

import { LucideIcon } from 'lucide-react';

interface Props {
    tenant: any;
    onOrderClick: () => void;
}

export default function StorefrontHeader({ tenant, onOrderClick }: Props) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-border transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {tenant?.logoUrl ? (
                        <img
                            src={tenant.logoUrl}
                            alt={tenant?.name || 'Restaurant'}
                            className="w-12 h-12 rounded-xl object-contain bg-card border border-border p-1"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-[var(--tenant-primary)] flex items-center justify-center font-bold text-xl text-white">
                            {tenant?.name?.[0] || 'R'}
                        </div>
                    )}
                    <h1 className="font-bold text-2xl text-white tracking-tight">{tenant?.name || 'Restaurant'}</h1>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="#about" className="text-slate-300 hover:text-white font-medium transition-colors">About</a>
                    {tenant.contactPhone && (
                        <a href={`tel:${tenant.contactPhone}`} className="text-slate-300 hover:text-white font-medium transition-colors">Contact</a>
                    )}
                </nav>

                <button
                    onClick={onOrderClick}
                    className="bg-[var(--tenant-primary)] hover:opacity-90 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[var(--tenant-primary)]/20 transition-all active:scale-95"
                >
                    Order Now
                </button>
            </div>
        </header>
    );
}
