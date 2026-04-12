'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { getHeaders } from '@/utils/auth';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function DailySalesSummaryPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [branchId, setBranchId] = useState('all');
    const [registerId, setRegisterId] = useState('all');
    const [staffId, setStaffId] = useState('all');

    const fetchData = async () => {
        setLoading(true);
        try {
            const h = getHeaders();
            const params = new URLSearchParams();
            if (branchId !== 'all') params.append('branchId', branchId);
            if (registerId !== 'all') params.append('registerId', registerId);
            if (staffId !== 'all') params.append('staffId', staffId);
            if (dateRange.start) params.append('start', dateRange.start);
            if (dateRange.end) params.append('end', dateRange.end);

            const res = await fetch(`${API_URL}/analytics/reports/sales-summary?${params.toString()}`, { headers: h });
            if (!res.ok) throw new Error('Failed to fetch Daily Sales Summary');
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
    }, [branchId, registerId, staffId, dateRange.start, dateRange.end]);

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Daily_Sales_Summary', headerMap);
        if (format === 'excel') exportToExcel(data, 'Daily_Sales_Summary', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Daily_Sales_Summary');
    };

    const columns = [
        { key: 'report_date', label: t('report_date') },
        { key: 'branch_name', label: t('branch_name') },
        { key: 'register_id', label: t('register_id') },
        { key: 'gross_sales', label: t('gross_sales'), format: 'currency' },
        { key: 'discounts_total', label: t('discounts_total'), format: 'currency' },
        { key: 'refunds_total', label: t('refunds_total'), format: 'currency' },
        { key: 'net_sales', label: t('net_sales'), format: 'currency' },
        { key: 'total_cost', label: t('total_cost'), format: 'currency' },
        { key: 'net_profit', label: t('net_profit'), format: 'currency' },
        { key: 'sales_tax_collected', label: t('sales_tax_collected'), format: 'currency' },
        { key: 'tips_collected', label: t('tips_collected'), format: 'currency' },
        { key: 'total_payments', label: t('total_payments'), format: 'currency' },
        { key: 'payment_cash', label: t('payment_cash'), format: 'currency' },
        { key: 'payment_card', label: t('payment_card'), format: 'currency' },
        { key: 'order_count', label: t('order_count') },
        { key: 'avg_order_value', label: t('avg_order_value'), format: 'currency' },
        { key: 'void_count', label: t('void_count') },
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
                    <option value="main">{t('main_branch') || 'Main Branch'}</option>
                    <option value="mall">{t('mall_outlet') || 'Mall Outlet'}</option>
                </select>
            </ReportFilterGroup>

            <ReportFilterGroup label={t('register_id')}>
                <select
                    value={registerId}
                    onChange={e => setRegisterId(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    <option value="reg1">REG-01</option>
                    <option value="reg2">REG-02</option>
                </select>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('daily_sales_summary')}
            subtitle={t('daily_sales_summary_desc') || "Primary revenue recognition document for accounting and audit."}
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
                        {(!Array.isArray(data) || data.length === 0) ? (
                            <tr><td colSpan={columns.length} className="py-12 text-center text-muted-foreground">{t('no_data') || 'No data found'}</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors group">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-5">
                                        <span className={`text-sm font-bold ${col.format === 'currency' ? 'text-primary' : 'text-foreground'}`}>
                                            {col.format === 'currency'
                                                ? `$${row[col.key].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                : row[col.key]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-muted/40 font-black border-t border-border">
                            <td colSpan={3} className="px-6 py-5 text-sm text-foreground uppercase tracking-tighter">{t('totals') || 'Totals'}</td>
                            <td className="px-6 py-5 text-sm text-primary">
                                ${(Array.isArray(data) ? data.reduce((acc, curr) => acc + (Number(curr.gross_sales) || 0), 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-5 text-sm text-primary">
                                ${(Array.isArray(data) ? data.reduce((acc, curr) => acc + (Number(curr.discounts_total) || 0), 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-5 text-sm text-primary">
                                ${(Array.isArray(data) ? data.reduce((acc, curr) => acc + (Number(curr.refunds_total) || 0), 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-5 text-sm text-primary font-black">
                                ${(Array.isArray(data) ? data.reduce((acc, curr) => acc + (Number(curr.net_sales) || 0), 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-5 text-sm text-primary font-black">
                                ${(Array.isArray(data) ? data.reduce((acc, curr) => acc + (Number(curr.total_cost) || 0), 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-5 text-sm text-primary font-black underline decoration-double">
                                ${(Array.isArray(data) ? data.reduce((acc, curr) => acc + (Number(curr.net_profit) || 0), 0) : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td colSpan={6} className="bg-transparent"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </ReportLayout>
    );
}
