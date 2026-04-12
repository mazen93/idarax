'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Plus, Building2, Search, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useLanguage } from '@/components/LanguageContext';

export default function AuditsListPage() {
    const { t, isRTL } = useLanguage();
    const router = useRouter();
    const [audits, setAudits] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewAuditForm, setShowNewAuditForm] = useState(false);
    const [newAuditForm, setNewAuditForm] = useState({ warehouseId: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [auditsRes, whRes] = await Promise.all([
                fetchWithAuth('/retail/audit'),
                fetchWithAuth('/retail/inventory/warehouses')
            ]);
            
            if (auditsRes.ok) {
                const data = await auditsRes.json();
                setAudits(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
            if (whRes.ok) {
                const data = await whRes.json();
                setWarehouses(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
            }
        } catch (err) {
            console.error('Failed to load audits', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStartAudit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetchWithAuth('/retail/audit/start', {
                method: 'POST',
                body: JSON.stringify(newAuditForm)
            });
            if (res.ok) {
                const data = await res.json();
                router.push(`/dashboard/inventory/audit/${data.data?.id || data.id}`);
            }
        } catch (error) {
            console.error('Start audit error', error);
        }
        setSubmitting(false);
    };

    return (
        <div className={`p-6 max-w-6xl mx-auto space-y-6 text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        Stock Audits
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage physical inventory counts and reconcile variances.</p>
                </div>
                <button 
                    onClick={() => setShowNewAuditForm(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                    <Plus className="h-5 w-5" /> Start New Audit
                </button>
            </div>

            {showNewAuditForm && (
                <div className="bg-card/80 backdrop-blur-sm border border-border p-6 rounded-2xl animate-in slide-in-from-top-4">
                    <h2 className="text-xl font-bold text-white mb-4">Start Physical Count</h2>
                    <form onSubmit={handleStartAudit} className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Select Location</label>
                            <select 
                                required 
                                value={newAuditForm.warehouseId} 
                                onChange={e => setNewAuditForm({ ...newAuditForm, warehouseId: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white appearance-none outline-none focus:border-primary"
                            >
                                <option value="" disabled>Choose warehouse...</option>
                                {warehouses.map(w => (
                                    <option key={w.id} value={w.id}>{w.name} {w.location ? `(${w.location})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-[2] space-y-2">
                            <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Notes (Optional)</label>
                            <input 
                                placeholder="e.g. End of Month Full Count" 
                                value={newAuditForm.notes} 
                                onChange={e => setNewAuditForm({ ...newAuditForm, notes: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowNewAuditForm(false)} className="px-5 py-3 hover:bg-white/5 rounded-xl text-muted-foreground font-bold">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold flex items-center gap-2">
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
                                Begin Count
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Started By</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && <tr><td colSpan={5} className="py-12 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>}
                        {!loading && audits.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-16 text-center">
                                    <ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-lg">No stock audits found.</p>
                                    <p className="text-white/40 text-sm mt-1">Start a new physical count to reconcile your inventory.</p>
                                </td>
                            </tr>
                        )}
                        {audits.map(audit => (
                            <tr key={audit.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-lg"><Building2 className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <div className="font-bold text-white">{audit.warehouse?.name || 'Unknown Location'}</div>
                                            {audit.notes && <div className="text-xs text-muted-foreground mt-0.5">{audit.notes}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-300 font-medium">{audit.startedBy?.name || '—'}</td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-200">{new Date(audit.createdAt).toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(audit.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${audit.status === 'IN_PROGRESS' ? 'bg-warning-500/10 text-warning-400 border border-warning-500/20' : ''}
                                        ${audit.status === 'COMPLETED' ? 'bg-success-500/10 text-success-400 border border-success-500/20' : ''}
                                        ${audit.status === 'CANCELLED' ? 'bg-error-500/10 text-error-400 border border-error-500/20' : ''}
                                    `}>
                                        {audit.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => router.push(`/dashboard/inventory/audit/${audit.id}`)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium"
                                    >
                                        {audit.status === 'IN_PROGRESS' ? 'Resume Count' : 'View Details'}
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
