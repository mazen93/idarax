'use client';

import { useState, useEffect, useCallback } from 'react';
import { Landmark, TrendingUp, TrendingDown, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || '' : '';
    const branchId = typeof window !== 'undefined' ? localStorage.getItem('branch_id') || '' : '';
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'x-tenant-id': tenantId, 'x-branch-id': branchId };
};

export default function DrawerWidget() {
    const { t, formatCurrency } = useLanguage();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [openingBalance, setOpeningBalance] = useState('');
    const [openNote, setOpenNote] = useState('');
    const [movementAmount, setMovementAmount] = useState('');
    const [movementReason, setMovementReason] = useState('');
    const [movementType, setMovementType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_IN');
    const [confirmClose, setConfirmClose] = useState(false);
    const [closingBalance, setClosingBalance] = useState('');
    const [viewXReport, setViewXReport] = useState(false);
    const [xReport, setXReport] = useState<any>(null);
    const [xLoading, setXLoading] = useState(false);

    const fetchSession = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/staff/drawer/current`, { headers: getHeaders() });
            if (res.ok) {
                const text = await res.text();
                const parsed = text && text !== 'null' ? JSON.parse(text) : null;
                setSession(parsed?.data !== undefined ? parsed.data : parsed);
            } else {
                setSession(null);
            }
        } catch { setSession(null); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { 
        fetchSession(); 
        const handler = () => fetchSession();
        window.addEventListener('drawer-updated', handler);
        return () => window.removeEventListener('drawer-updated', handler);
    }, [fetchSession]);

    const handleOpen = async () => {
        if (!openingBalance) return;
        setActionLoading(true);
        const rawBranch = typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null;
        const branchId = (rawBranch && rawBranch !== 'null' && rawBranch !== 'undefined' && rawBranch.trim() !== '') ? rawBranch : undefined;

        const res = await fetch(`${API_URL}/staff/drawer/open`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({
                openingBalance: parseFloat(openingBalance),
                note: openNote,
                branchId: branchId || undefined
            }),
        });
        if (res.ok) { await fetchSession(); setOpeningBalance(''); setOpenNote(''); }
        setActionLoading(false);
    };

    const handleAddMovement = async () => {
        if (!movementAmount || !session) return;
        setActionLoading(true);
        const res = await fetch(`${API_URL}/staff/drawer/movement`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ amount: parseFloat(movementAmount), type: movementType, reason: movementReason }),
        });
        if (res.ok) { await fetchSession(); setMovementAmount(''); setMovementReason(''); }
        setActionLoading(false);
    };

    const handleClose = async () => {
        if (!closingBalance || !session) return;
        setActionLoading(true);
        const res = await fetch(`${API_URL}/staff/drawer/close`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ closingBalance: parseFloat(closingBalance) }),
        });
        if (res.ok) { setSession(null); setConfirmClose(false); setClosingBalance(''); }
        setActionLoading(false);
    };

    const handleFetchXReport = async () => {
        if (!session) return;
        setXLoading(true);
        setViewXReport(true);
        try {
            const res = await fetch(`${API_URL}/staff/drawer/report/${session.id}`, { headers: getHeaders() });
            if (res.ok) setXReport(await res.json());
        } catch (err) { console.error(err); }
        setXLoading(false);
    };

    if (loading) return null;

    const balance = session?.runningBalance ?? 0;

    return (
        <div className="mb-4 bg-card/50 border border-border rounded-xl overflow-hidden">
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${session ? 'bg-primary' : 'bg-slate-600'}`} />
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {t('cash_drawer')}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {session && (
                        <span className="font-mono text-primary font-bold text-xs">
                            {formatCurrency(balance)}
                        </span>
                    )}
                    {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border/60 pt-3">
                    {!session ? (
                        <div className="space-y-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t('open_drawer')}</p>
                            <input
                                type="number" placeholder={t('opening_balance_placeholder')}
                                value={openingBalance} onChange={e => setOpeningBalance(e.target.value)}
                                className="w-full bg-background border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                            />
                            <input
                                placeholder={t('note_optional')}
                                value={openNote} onChange={e => setOpenNote(e.target.value)}
                                className="w-full bg-background border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-primary"
                            />
                            <button onClick={handleOpen} disabled={actionLoading || !openingBalance}
                                className="w-full py-2 bg-primary hover:bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                {t('open_drawer')}
                            </button>
                        </div>
                    ) : !confirmClose ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-background rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground">{t('opening_label')}</p>
                                    <p className="text-xs font-bold text-slate-300">{formatCurrency(Number(session.openingBalance))}</p>
                                </div>
                                <div className="bg-background rounded-lg p-2">
                                    <p className="text-[10px] text-muted-foreground">{t('current')}</p>
                                    <p className="text-xs font-bold text-primary">{formatCurrency(balance)}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {(['CASH_IN', 'CASH_OUT'] as const).map(type => (
                                        <button key={type} onClick={() => setMovementType(type)}
                                            className={`flex-1 py-1.5 rounded text-[10px] font-black uppercase border transition-colors ${movementType === type
                                                ? type === 'CASH_IN'
                                                    ? 'bg-primary/20 border-primary/50 text-primary'
                                                    : 'bg-error-500/20 border-error-500/50 text-error-400'
                                                : 'border-slate-700 text-muted-foreground'}`}
                                        >
                                            {type === 'CASH_IN' ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
                                            {type === 'CASH_IN' ? t('cash_in') : t('cash_out')}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number" placeholder={t('amount')}
                                    value={movementAmount} onChange={e => setMovementAmount(e.target.value)}
                                    className="w-full bg-background border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                                />
                                <input
                                    placeholder={t('reason_optional')}
                                    value={movementReason} onChange={e => setMovementReason(e.target.value)}
                                    className="w-full bg-background border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-slate-500"
                                />
                                <button onClick={handleAddMovement} disabled={actionLoading || !movementAmount}
                                    className="w-full py-2 bg-muted-foreground hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold disabled:opacity-50"
                                >
                                    {t('record_movement')}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleFetchXReport}
                                    className="py-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg text-xs font-black uppercase tracking-widest"
                                >
                                    {t('x_report_btn')}
                                </button>
                                <button onClick={() => setConfirmClose(true)}
                                    className="py-2 bg-error-600/10 border border-error-500/30 text-error-400 hover:bg-error-600/20 rounded-lg text-xs font-black uppercase tracking-widest"
                                >
                                    {t('close_z_report')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-error-400 uppercase tracking-wider font-black">{t('count_close')}</p>
                                <button onClick={() => setConfirmClose(false)} className="text-muted-foreground hover:text-white"><X className="h-3.5 w-3.5" /></button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{t('expected_balance')}: <span className="text-white font-bold">{formatCurrency(balance)}</span></p>
                            <input
                                type="number" placeholder={t('counted_balance')}
                                value={closingBalance} onChange={e => setClosingBalance(e.target.value)}
                                className="w-full bg-background border border-error-500/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-error-500"
                            />
                            {closingBalance && (
                                <p className={`text-xs font-bold ${Number(closingBalance) < balance ? 'text-error-400' : 'text-primary'}`}>
                                    {t('discrepancy')}: {formatCurrency(Number(closingBalance) - balance)}
                                </p>
                            )}
                            <button onClick={handleClose} disabled={actionLoading || !closingBalance}
                                className="w-full py-2 bg-error-600 hover:bg-error-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                {actionLoading ? t('closing') : t('confirm_close')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* X-Report Modal */}
            {viewXReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="px-4 py-3 border-b border-border flex justify-between items-center bg-card/50">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tighter">{t('x_report_btn')}</h3>
                                <p className="text-[10px] text-muted-foreground">{t('mid_day_snapshot')}</p>
                            </div>
                            <button onClick={() => setViewXReport(false)} className="text-muted-foreground hover:text-white"><X className="h-4 w-4" /></button>
                        </div>

                        {xLoading ? (
                            <div className="p-10 text-center text-muted-foreground text-xs">{t('generating_snapshot')}</div>
                        ) : xReport ? (
                            <div className="p-4 space-y-4">
                                <div className="bg-background rounded-xl p-3 space-y-2 border border-border/50">
                                    {[
                                        { label: t('opening_balance_label'), value: formatCurrency(Number(xReport.openingBalance)), color: 'text-muted-foreground' },
                                        { label: t('total_sales'), value: `+${formatCurrency(Number(xReport.totals?.sales || 0))}`, color: 'text-primary' },
                                        { label: t('total_refunds'), value: `-${formatCurrency(Number(xReport.totals?.refunds || 0))}`, color: 'text-error-400' },
                                        { label: t('cash_in'), value: `+${formatCurrency(Number(xReport.totals?.cashIn || 0))}`, color: 'text-teal-400' },
                                        { label: t('cash_out'), value: `-${formatCurrency(Number(xReport.totals?.cashOut || 0))}`, color: 'text-warning-400' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-medium">{label}</span>
                                            <span className={`font-mono font-bold ${color}`}>{value}</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-border mt-2 pt-2 flex justify-between items-center">
                                        <span className="text-xs text-white font-bold">{t('expected_cash_label')}</span>
                                        <span className="font-mono font-bold text-primary text-sm">
                                            {formatCurrency(Number(xReport.expectedBalance || 0))}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setViewXReport(false)} className="w-full py-2.5 bg-muted hover:bg-muted-foreground text-white rounded-xl text-xs font-bold transition-colors">
                                    {t('done')}
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
