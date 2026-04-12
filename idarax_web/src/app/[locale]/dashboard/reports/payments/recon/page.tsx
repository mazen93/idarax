'use client';

import React, { useState, useEffect } from 'react';
import ReportLayout, { ReportFilterGroup } from '@/components/dashboard/ReportLayout';
import { useLanguage } from '@/components/LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { getHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function PaymentReconciliationPage() {
    const { t, formatCurrency } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Filters
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [paymentMethod, setPaymentMethod] = useState('all');
    const [branchId, setBranchId] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const h = getHeaders();
                const params = new URLSearchParams();
                if (branchId !== 'all') params.append('branchId', branchId);
                if (paymentMethod !== 'all') params.append('method', paymentMethod);
                if (dateRange.start) params.append('start', dateRange.start);
                if (dateRange.end) params.append('end', dateRange.end);

                const res = await fetch(`${API_URL}/analytics/reports/payment-reconciliation?${params.toString()}`, { headers: h });
                if (!res.ok) throw new Error('Failed to fetch payment reconciliation');
                const result = await res.json();
                setData(result.data || (Array.isArray(result) ? result : []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange.start, dateRange.end, paymentMethod, branchId]);

    const columns = [
        { key: 'transaction_date', label: t('transaction_date') },
        { key: 'batch_id', label: t('batch_id') },
        { key: 'payment_method', label: t('payment_method') },
        { key: 'gross_amount', label: t('gross_amount'), format: 'currency' },
        { key: 'processor_fee', label: t('processor_fee'), format: 'currency' },
        { key: 'net_deposit', label: t('net_deposit'), format: 'currency' },
        { key: 'variance', label: t('variance'), format: 'variance' },
    ];

    const handleExport = (format: string) => {
        const headerMap = columns.reduce((acc, col) => ({ ...acc, [col.key]: col.label }), {});
        if (format === 'csv') exportToCSV(data, 'Payment_Reconciliation', headerMap);
        if (format === 'excel') exportToExcel(data, 'Payment_Reconciliation', headerMap);
        if (format === 'pdf') exportToPDF(data, 'Payment_Reconciliation');
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

            <ReportFilterGroup label={t('payment_method')}>
                <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="bg-card border border-border rounded-xl px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary min-w-[140px]"
                >
                    <option value="all">{t('all')}</option>
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="cash">{t('cash')}</option>
                </select>
            </ReportFilterGroup>
        </>
    );

    return (
        <ReportLayout
            title={t('payment_reconciliation')}
            subtitle={t('payment_recon_desc') || "Match POS payments to bank deposits and identify processing discrepancies."}
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
                                        {col.format === 'variance' ? (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${row.variance !== 0 ? 'text-error-500' : 'text-primary'}`}>
                                                    {row.variance === 0 ? t('reconciled') : formatCurrency(row.variance)}
                                                </span>
                                                {row.variance !== 0 ? <AlertCircle className="h-3.3 w-3.5 text-error-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                                            </div>
                                        ) : (
                                            <span className={`text-sm font-bold ${col.format === 'currency' ? 'text-primary' : 'text-foreground'}`}>
                                                {col.format === 'currency'
                                                    ? `$${row[col.key].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                    : row[col.key]}
                                            </span>
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
