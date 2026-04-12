'use client';

import { MapPin, ChevronRight, Store } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface Branch {
    id: string;
    name: string;
    nameAr?: string;
    address?: string;
    phone?: string;
}

interface Props {
    tenant: any;
    branches: Branch[];
    onSelectBranch: (branchId: string) => void;
}

export default function BranchSelector({ tenant, branches, onSelectBranch }: Props) {
    const { isRTL } = useLanguage();

    if (branches.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 text-muted-foreground mb-4">
                    <Store className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No active branches</h3>
                <p className="text-muted-foreground">Ordering is currently unavailable.</p>
            </div>
        );
    }

    return (
        <section className="py-24 max-w-7xl mx-auto px-6 relative z-10" id="branches">
            <div className="mb-12 md:text-center">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Select a Location</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Choose the nearest {tenant.name} branch to view its local menu, availability, and to start your order.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map(branch => (
                    <button
                        key={branch.id}
                        onClick={() => onSelectBranch(branch.id)}
                        className="group text-left p-6 rounded-3xl bg-white/[0.02] border border-border hover:border-[var(--tenant-primary)] hover:bg-[var(--tenant-primary)]/5 transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--tenant-primary)] rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity" />

                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center group-hover:bg-[var(--tenant-primary)] group-hover:scale-110 transition-all shadow-[var(--tenant-primary)]/0 group-hover:shadow-[var(--tenant-primary)]/20 shadow-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors group-hover:translate-x-1" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-[var(--tenant-primary)] transition-colors">
                            {isRTL && branch.nameAr ? branch.nameAr : branch.name}
                        </h3>

                        {branch.address && (
                            <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                                {branch.address}
                            </p>
                        )}

                        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--tenant-primary)] mt-auto pt-4 border-t border-border">
                            Order from here <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
