'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { getHeaders } from '@/utils/auth';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { Clock, ChefHat, BarChart3 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function KitchenPerformancePage() {
    const { t, formatCurrency } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const h = getHeaders();
            const params = new URLSearchParams();
            if (dateRange.start) params.append('start', dateRange.start);
            if (dateRange.end) params.append('end', dateRange.end);

            const res = await fetch(`${API_URL}/analytics/reports/kitchen-performance?${params.toString()}`, { headers: h });
            if (!res.ok) throw new Error('Failed to fetch Kitchen Performance');
            const result = await res.json();
            setData(result.data || (Array.isArray(result) ? result : []));
        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange.start, dateRange.end]);

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Kitchen_Performance', headerMap);
        if (format === 'excel') exportToExcel(data, 'Kitchen_Performance', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Kitchen_Performance');
    };

    const columns = [
        { key: 'stationName', label: t('station_name') || 'Station Name' },
        { key: 'totalItems', label: t('total_items') || 'Total Items' },
        { key: 'avgPrepTimeMinutes', label: t('avg_prep_time') || 'Avg. Prep Time (min)', format: 'minutes' },
    ];

    const filters = (
        <>
            <ReportFilterGroup label={t('date_range')}>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary w-[120px]"
                    />
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary w-[120px]"
                    />
                </div>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('kitchen_performance') || 'Kitchen Performance'}
            subtitle={t('kitchen_performance_desc') || "Analyze average preparation times and item volume across kitchen stations."}
            filters={filters}
            isLoading={loading}
            onExport={handleExport}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {data.length > 0 && (
                    <>
                        <div className="bg-card/40 border border-border p-6 rounded-3xl">
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <ChefHat className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('most_active_station') || 'Most Active Station'}</span>
                            </div>
                            <div className="text-2xl font-black text-foreground">
                                {data.reduce((prev, current) => (prev.totalItems > current.totalItems) ? prev : current).stationName}
                            </div>
                        </div>
                        <div className="bg-card/40 border border-border p-6 rounded-3xl">
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('avg_kitchen_time') || 'Avg. Kitchen Prep'}</span>
                            </div>
                            <div className="text-2xl font-black text-primary">
                                {(data.reduce((acc, curr) => acc + curr.avgPrepTimeMinutes, 0) / data.length).toFixed(1)} min
                            </div>
                        </div>
                        <div className="bg-card/40 border border-border p-6 rounded-3xl">
                            <div className="flex items-center gap-3 mb-2 text-muted-foreground">
                                <BarChart3 className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t('total_items_processed') || 'Total Items Processed'}</span>
                            </div>
                            <div className="text-2xl font-black text-primary-400">
                                {data.reduce((acc, curr) => acc + curr.totalItems, 0)}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/60 border-b border-border">
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-10 text-center text-muted-foreground italic text-sm">
                                    {t('no_kitchen_data') || 'No kitchen performance data found for this period.'}
                                </td>
                            </tr>
                        ) : data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-5">
                                        <span className={`text-sm font-bold ${col.key === 'avgPrepTimeMinutes' ? (row[col.key] > 15 ? 'text-error-400' : 'text-primary') : 'text-foreground'}`}>
                                            {col.format === 'minutes'
                                                ? row[col.key].toFixed(2) + ' min'
                                                : row[col.key]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ReportLayout>
    );
}
