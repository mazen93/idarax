'use client';

import { useState, useEffect } from 'react';
import { Landmark, Calendar, ChevronRight, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || '' : '';
    const branchId = typeof window !== 'undefined' ? localStorage.getItem('branch_id') || '' : '';
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'x-tenant-id': tenantId, 'x-branch-id': branchId };
};

const TYPE_STYLE: Record<string, string> = {
    OPENING: 'text-primary-400', SALE: 'text-primary', REFUND: 'text-error-400',
    CASH_IN: 'text-teal-400', CASH_OUT: 'text-warning-400', CLOSING: 'text-purple-400',
};

export default function DrawerHistoryPage() {
    const { t } = useLanguage();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [selected, setSelected] = useState<any>(null);
    const [report, setReport] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => { fetchSessions(); }, [filterDate]);

    const fetchSessions = async () => {
        setLoading(true);
        let url = `${API_URL}/staff/drawer/history`;
        if (filterDate) url += `?from=${new Date(filterDate).toISOString()}`;
        const res = await fetch(url, { headers: getHeaders() });
        if (res.ok) {
            const result = await res.json();
            setSessions(result.data || (Array.isArray(result) ? result : []));
        }
        setLoading(false);
    };

    const openReport = async (session: any) => {
        setSelected(session);
        setReport(null);
        setReportLoading(true);
        const res = await fetch(`${API_URL}/staff/drawer/report/${session.id}`, { headers: getHeaders() });
        if (res.ok) {
            const result = await res.json();
            setReport(result.data || result);
        }
        setReportLoading(false);
    };

    const fmt = (v: any) => Number(v ?? 0).toFixed(2);

    return (
        <div className="text-slate-200 min-h-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('cash_drawer_sessions')}</h1>
                    <p className="text-muted-foreground text-lg">{t('cash_drawer_desc')}</p>
                </div>
            </div>

            <div className="flex gap-3 mb-6">
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                        className="bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary text-sm" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sessions list */}
                <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-card">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('sessions')}</p>
                    </div>
                    {loading ? (
                        <p className="py-10 text-center text-muted-foreground text-sm">{t('loading')}</p>
                    ) : sessions.length === 0 ? (
                        <p className="py-10 text-center text-muted-foreground text-sm">{t('no_sessions_found')}</p>
                    ) : (
                        <div className="divide-y divide-slate-800/80">
                            {sessions.map(s => (
                                <button key={s.id} onClick={() => openReport(s)}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left ${selected?.id === s.id ? 'bg-muted/60' : ''}`}>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${s.status === 'OPEN' ? 'bg-primary' : 'bg-slate-500'}`} />
                                            <span className="text-sm font-bold text-slate-200">{s.user?.name}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(s.openedAt).toLocaleString()}</p>
                                        {s.branch && <p className="text-[10px] text-slate-600">{s.branch.name}</p>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-primary">{fmt(s.openingBalance)}</p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${s.status === 'OPEN' ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {s.status === 'OPEN' ? t('status_open') : s.status}
                                            </span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-600" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Z-Report Panel */}
                <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {report?.status === 'OPEN' ? t('x_report_active') : t('z_report_closed')}
                        </p>
                        {selected && <button onClick={() => { setSelected(null); setReport(null); }}><X className="h-4 w-4 text-muted-foreground hover:text-white" /></button>}
                    </div>

                    {!selected ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                            <Landmark className="h-10 w-10 mb-3" />
                            <p className="text-sm">{t('select_session_report')}</p>
                        </div>
                    ) : reportLoading ? (
                        <p className="py-10 text-center text-muted-foreground text-sm">{t('loading_report')}</p>
                    ) : report ? (
                        <div className="p-4 space-y-4">
                            {/* Header */}
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: t('cashier'), value: report.user?.name },
                                    { label: t('branch'), value: report.branch?.name || t('main_branch') },
                                    { label: t('opened'), value: new Date(report.openedAt).toLocaleTimeString() },
                                    { label: t('closed'), value: report.closedAt ? new Date(report.closedAt).toLocaleTimeString() : '–' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-background p-2 rounded-lg">
                                        <p className="text-[10px] text-muted-foreground">{label}</p>
                                        <p className="text-xs font-bold text-slate-200">{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="bg-background rounded-xl p-3 space-y-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">{t('summary')}</p>
                                {[
                                    { label: t('opening'), value: fmt(report.openingBalance), color: 'text-primary-400' },
                                    { label: t('sales'), value: `+${fmt(report.totals?.sales)}`, color: 'text-primary', icon: <TrendingUp className="h-3 w-3" /> },
                                    { label: t('refunds'), value: `-${fmt(report.totals?.refunds)}`, color: 'text-error-400', icon: <TrendingDown className="h-3 w-3" /> },
                                    { label: t('cash_in'), value: `+${fmt(report.totals?.cashIn)}`, color: 'text-teal-400' },
                                    { label: t('cash_out'), value: `-${fmt(report.totals?.cashOut)}`, color: 'text-warning-400' },
                                ].map(({ label, value, color, icon }) => (
                                    <div key={label} className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
                                        <span className={`font-mono font-bold text-sm ${color}`}>{value}</span>
                                    </div>
                                ))}
                                <div className="border-t border-border pt-2 flex justify-between">
                                    <span className="text-xs text-slate-300 font-bold">{t('expected')}</span>
                                    <span className="font-mono font-bold text-white">{fmt(report.expectedBalance)}</span>
                                </div>
                                {report.closingBalance != null && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-xs text-slate-300 font-bold">{t('counted')}</span>
                                            <span className="font-mono font-bold text-white">{fmt(report.closingBalance)}</span>
                                        </div>
                                        <div className={`flex justify-between items-center p-2 rounded-lg ${report.discrepancy < 0 ? 'bg-error-500/10' : 'bg-primary/10'}`}>
                                            <div className="flex items-center gap-1.5 text-xs font-black">
                                                {report.discrepancy !== 0 && <AlertTriangle className="h-3 w-3 text-warning-500" />}
                                                {t('discrepancy')}
                                            </div>
                                            <span className={`font-mono font-bold ${report.discrepancy < 0 ? 'text-error-400' : 'text-primary'}`}>
                                                {report.discrepancy >= 0 ? '+' : ''}{fmt(report.discrepancy)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Movements list */}
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{t('movements')}</p>
                                {report.movements?.map((m: any) => (
                                    <div key={m.id} className="flex justify-between items-center bg-background px-3 py-2 rounded-lg">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase ${TYPE_STYLE[m.type] || 'text-muted-foreground'}`}>
                                                {m.type === 'OPENING' ? t('opening') :
                                                    m.type === 'SALE' ? t('sales') :
                                                        m.type === 'REFUND' ? t('refunds') :
                                                            m.type === 'CASH_IN' ? t('cash_in') :
                                                                m.type === 'CASH_OUT' ? t('cash_out') :
                                                                    m.type === 'CLOSING' ? t('closing') : m.type.replace('_', ' ')}
                                            </span>
                                            {m.reason && <p className="text-[10px] text-slate-600 truncate max-w-32">{m.reason}</p>}
                                        </div>
                                        <span className={`font-mono text-xs font-bold ${['CASH_OUT', 'REFUND'].includes(m.type) ? 'text-error-400' : 'text-primary'}`}>
                                            {['CASH_OUT', 'REFUND'].includes(m.type) ? '-' : '+'}{fmt(m.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
