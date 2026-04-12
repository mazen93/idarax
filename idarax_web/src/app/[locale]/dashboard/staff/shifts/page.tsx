'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Coffee, MapPin, Play, Square } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || '' : '';
    const branchId = typeof window !== 'undefined' ? localStorage.getItem('branch_id') || '' : '';
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'x-tenant-id': tenantId, 'x-branch-id': branchId };
};

export default function ShiftsReportPage() {
    const { t } = useLanguage();
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchShifts();
    }, [filterDate]);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/staff/shifts/all`;
            if (filterDate) {
                const date = new Date(filterDate);
                url += `?from=${date.toISOString()}`;
            }
            const res = await fetch(url, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                const data = result.data || (Array.isArray(result) ? result : []);
                setShifts(data);
            }
        } catch (err) {
            console.error('Failed to fetch shifts', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateDuration = (start: string, end: string | null) => {
        if (!end) return t('status_active');
        const s = new Date(start).getTime();
        const e = new Date(end).getTime();
        const diff = e - s;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const calculateBreakTime = (breaks: any[]) => {
        let total = 0;
        breaks.forEach(b => {
            if (b.endTime) {
                total += new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
            }
        });
        const minutes = Math.floor(total / (1000 * 60));
        return `${minutes}m`;
    };

    const filteredShifts = shifts.filter(s =>
        s.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        s.user?.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="text-slate-200 min-h-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('staff_shifts_report')}</h1>
                    <p className="text-muted-foreground text-lg">{t('staff_shifts_desc')}</p>
                </div>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('search_staff_name')}
                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary text-sm"
                    />
                </div>
                <div className="relative min-w-[200px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary text-sm"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-800/80">
                        <thead className="bg-card">
                            <tr>
                                <th className="py-4 pl-6 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('staff_member')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('date')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('shift_time')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('duration')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('breaks')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('status')}</th>
                                <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('note')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-card/20">
                            {loading ? (
                                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">{t('loading_shifts')}</td></tr>
                            ) : filteredShifts.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">{t('no_shift_records')}</td></tr>
                            ) : (
                                filteredShifts.map(s => (
                                    <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-muted border border-slate-700 flex items-center justify-center text-xs font-bold text-primary">
                                                    {s.user?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-200">{s.user?.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{s.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="text-xs text-slate-300 font-medium">
                                                {new Date(s.startTime).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-2.5 w-2.5" /> {s.branch?.name || t('main_branch')}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="text-[10px] font-mono text-muted-foreground flex flex-col gap-0.5">
                                                <span className="flex items-center gap-1"><Play className="h-2.5 w-2.5 text-primary" /> {new Date(s.startTime).toLocaleTimeString()}</span>
                                                <span className="flex items-center gap-1"><Square className="h-2.5 w-2.5 text-error-500" /> {s.endTime ? new Date(s.endTime).toLocaleTimeString() : '--:--'}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 font-mono font-bold text-sm text-primary">
                                            {calculateDuration(s.startTime, s.endTime)}
                                        </td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-warning-400">
                                                <Coffee className="h-3.5 w-3.5" />
                                                {calculateBreakTime(s.breaks)}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${s.status === 'OPEN'
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : 'bg-muted text-muted-foreground border-slate-700'
                                                }`}>
                                                {s.status === 'OPEN' ? t('status_open') : s.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 text-[10px] text-muted-foreground italic max-w-xs truncate">
                                            {s.note || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
