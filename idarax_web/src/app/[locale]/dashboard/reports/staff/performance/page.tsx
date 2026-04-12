'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { getHeaders } from '@/utils/auth';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function CashierPerformancePage() {
    const { t, formatCurrency } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [branchId, setBranchId] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const h = getHeaders();
            const params = new URLSearchParams();
            if (branchId !== 'all') params.append('branchId', branchId);
            if (dateRange.start) params.append('start', dateRange.start);
            if (dateRange.end) params.append('end', dateRange.end);

            const res = await fetch(`${API_URL}/analytics/reports/cashier-performance?${params.toString()}`, { headers: h });
            if (!res.ok) throw new Error('Failed to fetch Cashier Performance');
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
    }, [branchId, dateRange.start, dateRange.end]);

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Cashier_Performance', headerMap);
        if (format === 'excel') exportToExcel(data, 'Cashier_Performance', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Cashier_Performance');
    };

    const columns = [
        { key: 'cashier_name', label: t('cashier_name') || 'Cashier Name' },
        { key: 'order_count', label: t('order_count') || 'Orders' },
        { key: 'gross_sales', label: t('gross_sales') || 'Gross Sales', format: 'currency' },
        { key: 'avg_order_value', label: t('avg_order_value') || 'Avg. Order Value', format: 'currency' },
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

            <ReportFilterGroup label={t('branch')}>
                <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    {/* These would ideally come from an API, but keeping it simple like other reports for now */}
                </select>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('cashier_performance') || 'Cashier Performance'}
            subtitle={t('cashier_performance_desc') || "Analyze sales volume and order numbers handled by each staff member."}
            filters={filters}
            isLoading={loading}
            onExport={handleExport}
        >
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
                                    {t('no_data_found') || 'No performance data found for this period.'}
                                </td>
                            </tr>
                        ) : data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-5">
                                        <span className={`text-sm font-bold ${col.format === 'currency' ? 'text-primary' : 'text-foreground'}`}>
                                            {col.format === 'currency'
                                                ? formatCurrency(row[col.key])
                                                : row[col.key]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot>
                            <tr className="bg-muted/40 font-black border-t border-border">
                                <td className="px-6 py-5 text-sm text-foreground uppercase tracking-tighter">{t('totals') || 'Totals'}</td>
                                <td className="px-6 py-5 text-sm text-foreground">
                                    {data.reduce((acc, curr) => acc + (Number(curr.order_count) || 0), 0)}
                                </td>
                                <td className="px-6 py-5 text-sm text-primary">
                                    {formatCurrency(data.reduce((acc, curr) => acc + (Number(curr.gross_sales) || 0), 0))}
                                </td>
                                <td className="px-6 py-5 text-sm text-primary font-black">
                                    {formatCurrency(data.reduce((acc, curr) => acc + (Number(curr.gross_sales) || 0), 0) / data.reduce((acc, curr) => acc + (Number(curr.order_count) || 1), 0))}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </ReportLayout>
    );
}
