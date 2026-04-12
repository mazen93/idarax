'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { getHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function InventoryMovementPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [productSearch, setProductSearch] = useState('');
    const [movementType, setMovementType] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const h = getHeaders();
                const params = new URLSearchParams();
                if (movementType !== 'all') params.append('type', movementType);
                if (productSearch) params.append('search', productSearch);
                if (dateRange.start) params.append('start', dateRange.start);
                if (dateRange.end) params.append('end', dateRange.end);

                const res = await fetch(`${API_URL}/analytics/reports/inventory-movement?${params.toString()}`, { headers: h });
                if (!res.ok) throw new Error('Failed to fetch inventory movement');
                const result = await res.json();
                setData(result.data || (Array.isArray(result) ? result : []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange.start, dateRange.end, movementType, productSearch]);

    const columns = [
        { key: 'transaction_date', label: t('transaction_date') },
        { key: 'transaction_time', label: t('transaction_time') },
        { key: 'branch_name', label: t('branch_name') },
        { key: 'product_sku', label: t('sku') },
        { key: 'product_name', label: t('name') },
        { key: 'movement_type', label: t('movement_type') },
        { key: 'reference_type', label: t('reference_type') },
        { key: 'qty_change', label: 'Qty Change', format: 'number' },
        { key: 'qty_after', label: 'Balance', format: 'number' },
        { key: 'unit_cost', label: t('unit_cost'), format: 'currency' },
    ];

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Inventory_Movement', headerMap);
        if (format === 'excel') exportToExcel(data, 'Inventory_Movement', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Inventory_Movement');
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

            <ReportFilterGroup label={t('search_products')}>
                <input
                    type="text"
                    placeholder={t('search_sku_name') || "Search SKU or Name..."}
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary w-[180px]"
                />
            </ReportFilterGroup>

            <ReportFilterGroup label={t('movement_type')}>
                <select
                    value={movementType}
                    onChange={e => setMovementType(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    <option value="purchase">{t('purchase_receipt') || 'Purchase Receipt'}</option>
                    <option value="sale">{t('sale_deduction') || 'Sale Deduction'}</option>
                    <option value="adjustment">{t('stock_adjustment') || 'Stock Adjustment'}</option>
                    <option value="transfer">{t('warehouse_transfer') || 'Warehouse Transfer'}</option>
                </select>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('inventory_movement')}
            subtitle={t('inventory_movement_desc') || "Detailed audit trail of inventory transactions for COGS and accrual reconciliations."}
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
                                        <span className={`text-sm font-bold ${col.format === 'currency' ? 'text-primary' :
                                            col.key === 'qty_change' ? (row[col.key] > 0 ? 'text-teal-500' : 'text-error-500') :
                                                'text-foreground'
                                            }`}>
                                            {col.format === 'currency'
                                                ? `$${row[col.key].toLocaleString(undefined, { minimumFractionDigits: 2 })}` :
                                                col.key === 'qty_change'
                                                    ? `${row[col.key] > 0 ? '+' : ''}${row[col.key]}` :
                                                    row[col.key]}
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
