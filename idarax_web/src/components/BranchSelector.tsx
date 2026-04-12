'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface Branch {
    id: string;
    name: string;
    isActive: boolean;
}

export default function BranchSelector() {
    const { t } = useLanguage();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await api.get('/branches');
                // Backend wraps in { status, data }, handle both cases
                const branchData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                setBranches(branchData);

                const savedBranchId = Cookies.get('branch_id');
                const isValidBranch = savedBranchId && branchData.some((b: any) => b.id === savedBranchId);

                if (isValidBranch) {
                    setSelectedBranch(savedBranchId as string);
                } else if (branchData.length > 0) {
                    const firstBranch = branchData[0].id;
                    setSelectedBranch(firstBranch);
                    Cookies.set('branch_id', firstBranch, { expires: 7, path: '/' });
                } else {
                    setSelectedBranch(null);
                    Cookies.remove('branch_id', { path: '/' });
                }
            } catch (error) {
                console.error('Failed to fetch branches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    const handleSelect = (branchId: string) => {
        setSelectedBranch(branchId);
        Cookies.set('branch_id', branchId, { expires: 7, path: '/' });
        setIsOpen(false);
        window.location.reload();
    };

    const currentBranchName = branches.find(b => b.id === selectedBranch)?.name || t('select_branch');

    if (loading) {
        return (
            <div className="mx-4 my-2 h-10 animate-pulse rounded-lg bg-muted" />
        );
    }

    if (branches.length === 0) return null;

    return (
        <div className="relative px-4 py-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium text-slate-200 transition-all hover:bg-muted hover:text-white border border-slate-700/50"
            >
                <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{currentBranchName}</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-4 right-4 z-20 mt-1 max-h-60 overflow-auto rounded-lg bg-muted p-1 shadow-xl border border-slate-700 ring-1 ring-black ring-opacity-5">
                        {branches.map((branch) => (
                            <button
                                key={branch.id}
                                onClick={() => handleSelect(branch.id)}
                                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${selectedBranch === branch.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted-foreground/50 hover:text-slate-200'
                                    }`}
                            >
                                <span className="truncate">{branch.name}</span>
                                {selectedBranch === branch.id && <Check className="h-4 w-4" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
