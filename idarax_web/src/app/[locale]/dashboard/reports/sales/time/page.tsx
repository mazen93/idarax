'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { getHeaders, hasFeature } from '@/utils/auth';
import { Clock, Activity, Loader2, Download, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function TimeDayAnalysisPage() {
    const { t, isRTL, formatCurrency } = useLanguage();
    const [peakHours, setPeakHours] = useState<any[]>([]);
    const [busiestDays, setBusiestDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    // Filters
    const [filter, setFilter] = useState<'today' | '7d' | '30d' | 'mtd' | 'custom'>('30d');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchReport = () => {
        setLoading(true);

        fetchWithAuth(`/tenant/settings`)
            .then(res => res.json())
            .then(res => setSettings(res.data || res))
            .catch(() => {});

        let start = '';
        const now = new Date();
        if (filter === 'today') {
            const d = new Date(now); d.setHours(0, 0, 0, 0);
            start = d.toISOString();
        } else if (filter === '7d') {
            const d = new Date(now); d.setDate(d.getDate() - 7);
            start = d.toISOString();
        } else if (filter === '30d') {
            const d = new Date(now); d.setDate(d.getDate() - 30);
            start = d.toISOString();
        } else if (filter === 'mtd') {
            const d = new Date(now.getFullYear(), now.getMonth(), 1);
            start = d.toISOString();
        } else if (filter === 'custom' && dateRange.start) {
            start = new Date(dateRange.start).toISOString();
        }

        let query = start ? `?start=${start}` : '';
        if (filter === 'custom' && dateRange.end) {
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            query += `${query ? '&' : '?'}end=${end.toISOString()}`;
        }

        const hasAdvancedAnalytics = hasFeature('ADVANCED_ANALYTICS');

        Promise.all([
            hasAdvancedAnalytics ? fetchWithAuth(`/analytics/reports/peak-hours${query}`) : Promise.resolve({ ok: false, json: () => Promise.resolve([]) }),
            hasAdvancedAnalytics ? fetchWithAuth(`/analytics/reports/busiest-days${query}`) : Promise.resolve({ ok: false, json: () => Promise.resolve([]) })
        ]).then(async ([phRes, bdRes]) => {
            if (phRes.ok) {
                const res = await phRes.json();
                const d = res.data !== undefined ? res.data : res;
                setPeakHours((Array.isArray(d) ? d : []).map((item: any) => ({
                    ...item,
                    hourLabel: item.hour === 0 ? '12 AM' : item.hour < 12 ? `${item.hour} AM` : item.hour === 12 ? '12 PM' : `${item.hour - 12} PM`
                })));
            }
            if (bdRes.ok) {
                const res = await bdRes.json();
                const d = res.data !== undefined ? res.data : res;
                setBusiestDays(Array.isArray(d) ? d : []);
            }
            setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch time analysis', err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchReport();
    }, [filter, dateRange.start, dateRange.end]);

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Idarax POS';
        
        // Sheet 1: Peak Hours
        const sh1 = workbook.addWorksheet('Peak Hours');
        sh1.columns = [
            { header: 'Hour', key: 'hourLabel', width: 20 },
            { header: 'Order Count', key: 'orderCount', width: 15 },
            { header: 'Revenue', key: 'revenue', width: 20 }
        ];
        peakHours.forEach(h => sh1.addRow(h));

        // Sheet 2: Busiest Days
        const sh2 = workbook.addWorksheet('Busiest Days');
        sh2.columns = [
            { header: 'Day of Week', key: 'day', width: 20 },
            { header: 'Order Count', key: 'orderCount', width: 15 },
            { header: 'Revenue', key: 'revenue', width: 20 }
        ];
        busiestDays.forEach(d => sh2.addRow(d));

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Time_Day_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <Link href="/dashboard/reports" className="flex items-center gap-2 text-primary font-bold mb-4 hover:opacity-80 transition-opacity">
                        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} /> {t('back_to_reports') || 'Back to Reports'}
                    </Link>
                    <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
                        {t('time_day_analysis') || 'Time & Day Analysis'}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {t('time_day_analysis_desc') || 'Analyze sales volume by hour of day and day of week to optimize scheduling.'}
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className="flex bg-muted border border-border rounded-xl p-1 shadow-inner flex-wrap overflow-x-auto max-w-full">
                        {[
                            { id: 'today', label: t('today') },
                            { id: '7d', label: t('7d') },
                            { id: '30d', label: t('30d') },
                            { id: 'mtd', label: t('mtd') },
                            { id: 'custom', label: t('custom_range') }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setFilter(p.id as any)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === p.id ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {filter === 'custom' && (
                        <div className="flex items-center gap-2 animate-in slide-in-from-top-2">
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary outline-none" />
                            <span className="text-muted-foreground font-black text-xs">{t('to') || 'to'}</span>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary outline-none" />
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-success-500/20 hover:bg-primary transition-all ml-auto hover:-translate-y-0.5"
                    >
                        <Download className="h-4 w-4" /> {t('export_excel') || 'Export Excel'}
                    </button>
                </div>
            </div>

            {!hasFeature('ADVANCED_ANALYTICS') ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center mt-6">
                    <Activity className="h-16 w-16 text-warning-500/50 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Advanced Analytics Required</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        The Peak Hours and Busiest Days reports require the Advanced Analytics package, 
                        which is included in the Pro and Enterprise tiers.
                    </p>
                    <span className="px-4 py-2 bg-warning-500/20 text-warning-500 rounded-full text-sm font-bold border border-warning-500/30 uppercase tracking-wide">
                        Upgrade Required
                    </span>
                </div>
            ) : loading ? (
                <div className="flex h-[400px] items-center justify-center border border-border bg-card/40 backdrop-blur-sm rounded-[2.5rem]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">{t('generating_report') || 'Generating report...'}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Peak Hours Chart */}
                    <div className="bg-card border border-border p-6 rounded-[2.5rem] backdrop-blur-sm shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    {t('peak_hours') || 'Peak Sales Hours'}
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">Total revenue generated per hour block.</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                            <ResponsiveContainer width="99.9%" height="100%">
                                <BarChart data={peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="hourLabel" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} interval={2} angle={-30} textAnchor="end" />
                                    <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val, settings?.currency)} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }} itemStyle={{ color: '#818cf8', fontWeight: 'bold' }} />
                                    <Bar yAxisId="left" dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} name={t('revenue') || 'Revenue'} />
                                    <Bar yAxisId="right" dataKey="orderCount" fill="#cbd5e1" radius={[4, 4, 0, 0]} name={t('orders') || 'Orders'} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Busiest Days Chart */}
                    <div className="bg-card border border-border p-6 rounded-[2.5rem] backdrop-blur-sm shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-warning-500/10 text-warning-400">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    {t('busiest_days') || 'Busiest Days'}
                                </h3>
                                <p className="text-muted-foreground text-sm mt-1">Total revenue generated per day of the week.</p>
                            </div>
                        </div>
                        <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                            {busiestDays?.length > 0 && (
                                <ResponsiveContainer width="99.9%" height="100%">
                                    <BarChart data={busiestDays}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="left" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val, settings?.currency)} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid #1e293b', borderRadius: '12px', padding: '12px' }} itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }} />
                                        <Bar yAxisId="left" dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} name={t('revenue') || 'Revenue'} />
                                        <Bar yAxisId="right" dataKey="orderCount" fill="#fcd34d" radius={[4, 4, 0, 0]} name={t('orders') || 'Orders'} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
