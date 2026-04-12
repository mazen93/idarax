'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { getHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function CashDrawerReconciliationPage() {
    const { t, formatCurrency } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [branchId, setBranchId] = useState('all');
    const [staffId, setStaffId] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const h = getHeaders();
                const params = new URLSearchParams();
                if (branchId !== 'all') params.append('branchId', branchId);
                if (staffId !== 'all') params.append('staffId', staffId);
                if (dateRange.start) params.append('start', dateRange.start);
                if (dateRange.end) params.append('end', dateRange.end);

                const res = await fetch(`${API_URL}/analytics/reports/drawer-reconciliation?${params.toString()}`, { headers: h });
                if (!res.ok) throw new Error('Failed to fetch drawer reconciliation');
                const result = await res.json();
                setData(result.data || (Array.isArray(result) ? result : []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange.start, dateRange.end, branchId, staffId]);

    const columns = [
        { key: 'shift_date', label: t('shift_date') },
        { key: 'branch_name', label: t('branch_name') },
        { key: 'register_id', label: t('register_id') },
        { key: 'cashier_name', label: t('cashier') },
        { key: 'opening_cash', label: t('opening_cash'), format: 'currency' },
        { key: 'cash_sales', label: t('cash_sales'), format: 'currency' },
        { key: 'expected_cash', label: t('expected_cash'), format: 'currency' },
        { key: 'actual_count', label: t('actual_count'), format: 'currency' },
        { key: 'over_short', label: t('over_short'), format: 'variance' },
        { key: 'manager_approval', label: t('manager_approval') },
    ];

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Cash_Drawer_Reconciliation', headerMap);
        if (format === 'excel') exportToExcel(data, 'Cash_Drawer_Reconciliation', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Cash_Drawer_Reconciliation');
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

            <ReportFilterGroup label={t('staff_member')}>
                <select
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    <option value="john">John Doe</option>
                    <option value="sarah">Sarah Smith</option>
                </select>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('cash_drawer_reconciliation')}
            subtitle={t('cash_drawer_recon_desc') || "Track drawer sessions, cash control, and staff accountability."}
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
                                        {col.format === 'variance' ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${row.over_short < 0 ? 'text-error-500' : 'text-primary'}`}>
                                                    {row.over_short === 0 ? t('reconciled') : formatCurrency(row.over_short)}
                                                </span>
                                                {row.over_short < 0 ? <AlertTriangle className="h-3.5 w-3.5 text-error-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">{row.over_short_status}</span>
                                            </div>
                                        ) : (
                                            <span className={`text-sm font-bold ${col.format === 'currency' ? 'text-primary' : 'text-foreground'}`}>
                                                {col.format === 'currency'
                                                    ? `$${row[col.key].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                    : row[col.key]}
                                            </span>
                                        )}
                                        {col.key === 'manager_approval' && row.approval_notes && (
                                            <p className="text-[10px] text-muted-foreground mt-1">{row.approval_notes}</p>
                                        )}
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
