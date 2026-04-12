'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Save, CheckCircle2, XCircle, ArrowLeft, Loader2, AlertTriangle, ScanLine, Filter } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useLanguage } from '@/components/LanguageContext';
import { useModal } from '@/components/ModalContext';

export default function ActiveAuditPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { t, isRTL } = useLanguage();
    const router = useRouter();
    const { showAlert, showConfirm } = useModal();
    
    const [audit, setAudit] = useState<any>(null);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'discrepancy' | 'uncounted'>('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`/retail/audit/${id}`);
            if (res.ok) {
                const data = await res.json();
                const fetchedAudit = data.data || data;
                setAudit(fetchedAudit);
                
                // Initialize counts
                const initialCounts: Record<string, number> = {};
                fetchedAudit.items?.forEach((item: any) => {
                    // physicalQuantity is nullable if not yet counted
                    initialCounts[item.productId] = item.physicalQuantity !== null && item.physicalQuantity !== undefined 
                        ? item.physicalQuantity : '';
                });
                setCounts(initialCounts);
            }
        } catch (err) {
            console.error('Failed to load audit', err);
            showAlert({ title: "Error", message: "Failed to load audit details.", variant: 'DANGER' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSaveProgress = async () => {
        setSaving(true);
        try {
            const items = Object.entries(counts)
                .filter(([_, qty]) => qty !== '' && qty !== null)
                .map(([productId, physicalQuantity]) => ({
                    productId,
                    physicalQuantity: Number(physicalQuantity)
                }));
                
            const res = await fetchWithAuth(`/retail/audit/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ items })
            });

            if (res.ok) {
                showAlert({ title: "Progress Saved", message: "Audit counts updated successfully.", variant: 'INFO' });
                fetchData();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            showAlert({ title: "Error", message: "Failed to save progress.", variant: 'DANGER' });
        }
        setSaving(false);
    };

    const handleCommit = () => {
        showConfirm({
            title: "Commit Audit?",
            message: "This will finalize the audit and update all inventory levels to match your physical counts. This action CANNOT be undone.",
            variant: "WARNING",
            onConfirm: async () => {
                setSaving(true);
                try {
                    // First save progress
                    const items = Object.entries(counts)
                        .filter(([_, qty]) => qty !== '' && qty !== null)
                        .map(([productId, physicalQuantity]) => ({
                            productId,
                            physicalQuantity: Number(physicalQuantity)
                        }));
                        
                    await fetchWithAuth(`/retail/audit/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ items })
                    });

                    // Then commit
                    const res = await fetchWithAuth(`/retail/audit/${id}/commit`, {
                        method: 'POST'
                    });

                    if (res.ok) {
                        showAlert({ title: "Success", message: "Audit completed! Inventory adjusted.", variant: 'INFO' });
                        router.push('/dashboard/inventory/audit');
                    } else {
                        throw new Error('Commit failed');
                    }
                } catch (error) {
                    showAlert({ title: "Error", message: "Failed to commit audit.", variant: 'DANGER' });
                }
                setSaving(false);
            }
        });
    };

    const handleCancel = () => {
        showConfirm({
            title: "Cancel Audit?",
            message: "This will abort the audit. No inventory levels will be changed.",
            variant: "DANGER",
            onConfirm: async () => {
                try {
                    const res = await fetchWithAuth(`/retail/audit/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        router.push('/dashboard/inventory/audit');
                    }
                } catch (error) {
                    showAlert({ title: "Error", message: "Failed to cancel audit.", variant: 'DANGER' });
                }
            }
        });
    };

    const filteredItems = useMemo(() => {
        if (!audit?.items) return [];
        return audit.items.filter((item: any) => {
            const matchesSearch = item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.product?.sku?.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!matchesSearch) return false;

            const countedQty = counts[item.productId];
            const hasCount = countedQty !== '' && countedQty !== null;
            const expected = item.expectedQuantity || 0;
            const variance = hasCount ? (Number(countedQty) - expected) : 0;

            if (filter === 'discrepancy') return hasCount && variance !== 0;
            if (filter === 'uncounted') return !hasCount;
            return true;
        });
    }, [audit, searchQuery, counts, filter]);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!audit) return <div className="text-center py-20 text-white">Audit not found.</div>;

    const isEditable = audit.status === 'IN_PROGRESS';

    // Summary Calculations
    const totalItems = audit.items?.length || 0;
    const countedItems = audit.items?.filter((i: any) => counts[i.productId] !== '' && counts[i.productId] !== null).length || 0;
    const progress = totalItems > 0 ? (countedItems / totalItems) * 100 : 0;

    return (
        <div className={`p-6 max-w-6xl mx-auto space-y-6 text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
            <button onClick={() => router.push('/dashboard/inventory/audit')} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Audits
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-card p-6 rounded-2xl border border-border shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ScanLine className="h-7 w-7 text-primary" />
                        Audit Validation: {audit.warehouse?.name}
                    </h1>
                    <p className="text-muted-foreground mt-1">Status: <strong className={audit.status === 'COMPLETED' ? 'text-success-400' : 'text-warning-400'}>{audit.status.replace('_', ' ')}</strong></p>
                </div>
                {isEditable && (
                    <div className="flex gap-3">
                        <button onClick={handleCancel} className="px-5 py-2.5 bg-error-500/10 hover:bg-error-500/20 text-error-400 rounded-xl font-bold transition-colors">
                            Abort
                        </button>
                        <button onClick={handleSaveProgress} disabled={saving} className="px-5 py-2.5 bg-muted hover:bg-muted-foreground text-white rounded-xl font-bold flex items-center gap-2 transition-colors">
                            <Save className="h-4 w-4" /> Save Progress
                        </button>
                        <button onClick={handleCommit} disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-success-600/20 transition-transform hover:scale-105">
                            <CheckCircle2 className="h-5 w-5" /> Commit Audit
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-card w-full h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Search by Name or SKU (Scan barcode)" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full max-w-sm bg-card border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-white" 
                    autoFocus
                />
                <div className="flex gap-2">
                    {['all', 'uncounted', 'discrepancy'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border ${filter === f ? 'bg-primary/20 border-primary text-primary' : 'bg-card border-border text-muted-foreground hover:bg-white/5'}`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Expected</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Physical Count</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right border-l border-border">Variance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredItems.length === 0 && (
                            <tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No items match your filters.</td></tr>
                        )}
                        {filteredItems.map((item: any) => {
                            const expected = item.expectedQuantity || 0;
                            const currentInput = counts[item.productId];
                            const hasCount = currentInput !== '' && currentInput !== null && currentInput !== undefined;
                            const physical = hasCount ? Number(currentInput) : 0;
                            const variance = hasCount ? (physical - expected) : 0;

                            let varianceColor = 'text-muted-foreground';
                            if (hasCount) {
                                if (variance > 0) varianceColor = 'text-primary';
                                else if (variance < 0) varianceColor = 'text-error-400';
                            }

                            return (
                                <tr key={item.id} className={`hover:bg-white/[0.02] transition-colors ${!hasCount ? 'opacity-70' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{item.product?.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{item.product?.sku || 'No SKU'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-medium text-slate-300 bg-white/[0.01]">
                                        {expected} {item.product?.unit || ''}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {isEditable ? (
                                                <input 
                                                    type="number" 
                                                    min="0"
                                                    value={counts[item.productId] ?? ''}
                                                    onChange={e => setCounts({ ...counts, [item.productId]: e.target.value })}
                                                    className={`w-28 text-center bg-background border rounded-lg px-2 py-2 font-bold outline-none focus:ring-2 focus:ring-primary/50 transition-all ${hasCount && variance !== 0 ? 'border-warning-500/50 text-warning-400' : 'border-border text-white focus:border-primary'}`}
                                                    placeholder="Count"
                                                />
                                            ) : (
                                                <span className="font-bold text-lg text-white">{item.physicalQuantity ?? '—'}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right border-l border-border bg-white/[0.01] ${varianceColor}`}>
                                        {hasCount ? (
                                            <div className="flex items-center justify-end gap-2 font-black">
                                                {variance !== 0 && <AlertTriangle className="h-4 w-4 opacity-50" />}
                                                {variance > 0 ? '+' : ''}{variance}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
