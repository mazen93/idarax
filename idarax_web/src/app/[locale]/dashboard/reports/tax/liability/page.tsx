'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { getHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SalesTaxLiabilityPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const h = getHeaders();
                const params = new URLSearchParams();
                if (dateRange.start) params.append('start', dateRange.start);
                if (dateRange.end) params.append('end', dateRange.end);

                const res = await fetch(`${API_URL}/analytics/reports/tax-liability?${params.toString()}`, { headers: h });
                if (!res.ok) throw new Error('Failed to fetch tax liability');
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
        { key: 'report_date', label: t('report_date') },
        { key: 'tax_code', label: t('tax_code') },
        { key: 'tax_rate', label: t('tax_rate'), format: 'percentage' },
        { key: 'taxable_amount', label: t('taxable_amount'), format: 'currency' },
        { key: 'non_taxable_amount', label: t('non_taxable_amount'), format: 'currency' },
        { key: 'tax_collected', label: t('tax_collected'), format: 'currency' },
    ];

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Sales_Tax_Liability', headerMap);
        if (format === 'excel') exportToExcel(data, 'Sales_Tax_Liability', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Sales_Tax_Liability');
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
            title={t('sales_tax_liability')}
            subtitle={t('sales_tax_liability_desc') || "View collected sales tax to assist with accounting and compliance."}
            filters={filters}
            isLoading={loading}
            onExport={handleExport}
        >
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
                                                : col.format === 'percentage'
                                                    ? `${Number(row[col.key] || 0).toFixed(2)}%`
                                                    : row[col.key]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {data.length === 0 && !loading && (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-muted-foreground font-medium">
                                    {t('no_sales_data')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ReportLayout>
    );
}
