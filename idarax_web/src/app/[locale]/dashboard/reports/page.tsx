'use client';

import React from 'react';
import Link from 'next/link';
import {
    BarChart3, Landmark, Package, ShieldCheck,
    Users, Heart, ChevronRight, TrendingUp,
    CreditCard, Boxes, Scale, UserCheck, Star
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function ReportsLandingPage() {
    const { t, isRTL } = useLanguage();

    const categories = [
        {
            id: 'sales',
            title: t('sales_reports'),
            desc: t('sales_reports_desc'),
            icon: TrendingUp,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
            reports: [
                { name: t('daily_sales_summary'), href: '/dashboard/reports/sales/daily' },
                { name: t('time_day_analysis'), href: '/dashboard/reports/sales/time' },
            ]
        },
        {
            id: 'payments',
            title: t('payment_reports'),
            desc: t('payment_reports_desc'),
            icon: CreditCard,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10',
            border: 'border-primary-500/20',
            reports: [
                { name: t('payment_reconciliation'), href: '/dashboard/reports/payments/recon' },
            ]
        },
        {
            id: 'inventory',
            title: t('inventory_reports'),
            desc: t('inventory_reports_desc'),
            icon: Boxes,
            color: 'text-warning-400',
            bg: 'bg-warning-500/10',
            border: 'border-warning-500/20',
            reports: [
                { name: t('inventory_valuation'), href: '/dashboard/reports/inventory/valuation' },
                { name: t('inventory_movement'), href: '/dashboard/reports/inventory/movement' },
                { name: t('product_profitability'), href: '/dashboard/reports/inventory/profitability' },
            ]
        },
        {
            id: 'tax',
            title: t('tax_reports'),
            desc: t('tax_reports_desc'),
            icon: Scale,
            color: 'text-error-400',
            bg: 'bg-error-500/10',
            border: 'border-error-500/20',
            reports: [
                { name: t('sales_tax_liability'), href: '/dashboard/reports/tax/liability' }
            ]
        },
        {
            id: 'staff',
            title: t('staff_reports'),
            desc: t('staff_reports_desc'),
            icon: UserCheck,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
            reports: [
                { name: t('cash_drawer_reconciliation'), href: '/dashboard/reports/staff/drawer' },
                { name: t('cashier_performance'), href: '/dashboard/reports/staff/performance' },
                { name: t('kitchen_performance'), href: '/dashboard/reports/staff/kitchen-performance' },
            ]
        },
        {
            id: 'customer',
            title: t('customer_reports'),
            desc: t('customer_reports_desc'),
            icon: Star,
            color: 'text-fuchsia-400',
            bg: 'bg-fuchsia-500/10',
            border: 'border-fuchsia-500/20',
            reports: [
                { name: t('customer_sales_summary'), href: '/dashboard/reports/customer/sales' }
            ]
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{t('reports')}</h1>
                <p className="text-muted-foreground text-lg">{t('reports_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        className={`bg-card/40 border ${cat.border} p-8 rounded-[2.5rem] backdrop-blur-sm group hover:border-border transition-all flex flex-col shadow-sm`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color}`}>
                                <cat.icon className="h-6 w-6" />
                            </div>
                            <ChevronRight className={`h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2">{cat.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1">{cat.desc}</p>

                        <div className="space-y-2">
                            {cat.reports.map((report, idx) => (
                                <Link
                                    key={idx}
                                    href={report.href}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border/50 hover:border-primary/30 text-sm font-bold text-foreground hover:text-primary transition-all group/link"
                                >
                                    {report.name}
                                    <ChevronRight className={`h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-all ${isRTL ? 'rotate-180 -translate-x-1' : 'translate-x-1'}`} />
                                </Link>
                            ))}
                            {cat.reports.length === 0 && (
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-4 border border-dashed border-border rounded-2xl text-center">
                                    {t('upcoming_module')}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
