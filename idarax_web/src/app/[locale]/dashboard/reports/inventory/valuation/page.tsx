'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { getHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function InventoryValuationPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [valuationDate, setValuationDate] = useState(new Date().toISOString().split('T')[0]);
    const [branchId, setBranchId] = useState('all');
    const [category, setCategory] = useState('all');
    const [costingMethod, setCostingMethod] = useState('fifo');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const h = getHeaders();
                const params = new URLSearchParams();
                if (branchId !== 'all') params.append('branchId', branchId);
                if (category !== 'all') params.append('category', category);
                if (costingMethod) params.append('method', costingMethod);
                if (valuationDate) params.append('date', valuationDate);

                const res = await fetch(`${API_URL}/analytics/reports/inventory-valuation?${params.toString()}`, { headers: h });
                if (!res.ok) throw new Error('Failed to fetch inventory valuation');
                const result = await res.json();
                setData(result.data || (Array.isArray(result) ? result : []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [valuationDate, branchId, category, costingMethod]);

    const columns = [
        { key: 'product_sku', label: t('sku') },
        { key: 'product_name', label: t('name') },
        { key: 'category', label: t('category') },
        { key: 'branch_name', label: t('branch_name') },
        { key: 'unit_of_measure', label: t('unit_of_measure') },
        { key: 'qty_on_hand', label: t('qty_on_hand') },
        { key: 'unit_cost', label: t('unit_cost'), format: 'currency' },
        { key: 'total_value', label: t('total_value'), format: 'currency' },
        { key: 'days_on_hand', label: t('days_on_hand') },
    ];

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Inventory_Valuation', headerMap);
        if (format === 'excel') exportToExcel(data, 'Inventory_Valuation', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Inventory_Valuation');
    };

    const filters = (
        <>
            <ReportFilterGroup label={t('valuation_date')}>
                <input
                    type="date"
                    value={valuationDate}
                    onChange={e => setValuationDate(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary w-[140px]"
                />
            </ReportFilterGroup>

            <ReportFilterGroup label={t('branch')}>
                <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    <option value="main">{t('main_warehouse') || 'Main Warehouse'}</option>
                </select>
            </ReportFilterGroup>

            <ReportFilterGroup label={t('category')}>
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    <option value="ingredients">{t('ingredients') || 'Ingredients'}</option>
                    <option value="packaging">{t('packaging') || 'Packaging'}</option>
                </select>
            </ReportFilterGroup>

            <ReportFilterGroup label={t('costing_method')}>
                <select
                    value={costingMethod}
                    onChange={e => setCostingMethod(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="fifo">{t('fifo')}</option>
                    <option value="average">{t('avg_cost')}</option>
                </select>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('inventory_valuation')}
            subtitle={t('inventory_valuation_desc') || "Balance sheet inventory asset valuation and COGS calculation baseline."}
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
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                {columns.map(col => (
                                    <td key={col.key} className="px-6 py-5 whitespace-nowrap">
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
                            <td colSpan={7} className="px-6 py-5 text-sm text-foreground uppercase tracking-tighter text-right">{t('total_inventory_value') || 'Total Inventory Value'}</td>
                            <td className="px-6 py-5 text-sm text-primary">
                                ${(data.reduce((acc, curr) => acc + (Number(curr.total_value) || 0), 0) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="bg-transparent"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </ReportLayout>
    );
}
