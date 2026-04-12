'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { getHeaders, hasFeature } from '@/utils/auth';
import { Activity } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function CustomerSalesSummaryPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        if (!hasFeature('ADVANCED_ANALYTICS')) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const h = getHeaders();
                const params = new URLSearchParams();
                if (dateRange.start) params.append('start', dateRange.start);
                if (dateRange.end) params.append('end', dateRange.end);

                const res = await fetch(`${API_URL}/analytics/reports/customer-summary?${params.toString()}`, { headers: h });
                if (!res.ok) throw new Error('Failed to fetch customer summary');
                const result = await res.json();
                setData(result.data || (Array.isArray(result) ? result : []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange.start, dateRange.end]);

    const columns = [
        { key: 'customer_name', label: t('customer_name') },
        { key: 'phone_number', label: t('phone_number') },
        { key: 'order_count', label: t('order_count') },
        { key: 'gross_sales', label: t('gross_sales'), format: 'currency' },
        { key: 'avg_order_value', label: t('avg_order_value'), format: 'currency' },
        { key: 'last_visit', label: t('last_visit') },
    ];

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Customer_Sales_Summary', headerMap);
        if (format === 'excel') exportToExcel(data, 'Customer_Sales_Summary', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Customer_Sales_Summary');
    };

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
            title={t('customer_sales_summary')}
            subtitle={t('customer_sales_summary_desc') || "Analyze spending habits and visit frequency for your customer base."}
            filters={filters}
            isLoading={loading}
            onExport={handleExport}
        >
            {!hasFeature('ADVANCED_ANALYTICS') ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-lg text-center mt-6">
                    <Activity className="h-16 w-16 text-warning-500/50 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Advanced Analytics Required</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        The Customer Sales Summary report requires the Advanced Analytics package, 
                        which is included in the Pro and Enterprise tiers.
                    </p>
                    <span className="px-4 py-2 bg-warning-500/20 text-warning-500 rounded-full text-sm font-bold border border-warning-500/30 uppercase tracking-wide">
                        Upgrade Required
                    </span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/60 border-b border-border">
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-5">
                                        <span className={`text-sm font-bold ${col.format === 'currency' ? 'text-primary' : 'text-foreground'}`}>
                                            {col.format === 'currency'
                                                ? `$${row[col.key]?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`
                                                : row[col.key]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && !loading && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground font-medium">
                                    {t('no_customer_data_found') || 'No customer data found.'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </ReportLayout>
    );
}
