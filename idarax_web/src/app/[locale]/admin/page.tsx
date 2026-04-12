'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, BarChart3, Receipt, Globe, TrendingUp, CreditCard } from 'lucide-react';

interface Stats {
    activeTenants: number;
    totalBranches: number;
    totalOrders: number;
    totalRevenue: number;
    mrr: number;
    activeSubscriptions: number;
    tenantsByCountry?: { country: string; code: string; count: number }[];
}

export default function AdminIndexPage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'en';
    const isRtl = locale === 'ar';
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/superadmin/overview`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        { 
            title: isRtl ? 'المستأجرين النشطين' : 'Active Tenants', 
            value: stats?.activeTenants?.toLocaleString() ?? '...', 
            icon: Users, 
            color: 'text-primary-400',
            bg: 'bg-primary-400/10'
        },
        { 
            title: isRtl ? 'الإيرادات الشهرية المتكررة' : 'Monthly Recurring Revenue', 
            value: stats?.mrr !== undefined ? `$${stats.mrr.toLocaleString()}` : '...', 
            icon: TrendingUp, 
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        { 
            title: isRtl ? 'إجمالي المعاملات' : 'Total Transactions', 
            value: stats?.totalOrders?.toLocaleString() ?? '...', 
            icon: Receipt, 
            color: 'text-warning-400',
            bg: 'bg-warning-400/10'
        },
        { 
            title: isRtl ? 'الفروع العالمية' : 'Global Branches', 
            value: stats?.totalBranches?.toLocaleString() ?? '...', 
            icon: Globe, 
            color: 'text-primary',
            bg: 'bg-primary-400/10'
        },
        { 
            title: isRtl ? 'إجمالي الإيرادات' : 'Total Revenue', 
            value: stats?.totalRevenue !== undefined ? `$${stats.totalRevenue.toLocaleString()}` : '...', 
            icon: CreditCard, 
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
        },
        { 
            title: isRtl ? 'الاشتراكات النشطة' : 'Active Subscriptions', 
            value: stats?.activeSubscriptions?.toLocaleString() ?? '...', 
            icon: BarChart3, 
            color: 'text-error-400',
            bg: 'bg-error-400/10'
        },
    ];

    return (
        <div className={`p-10 text-slate-200 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">
                    {isRtl ? 'لوحة المراقبة العامة' : 'Platform Overview'}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
                    {isRtl 
                        ? 'مرحباً بك في وحدة التحكم الرئيسية. من هنا يمكنك الإشراف على المقاييس العالمية وإدارة اشتراكات المستأجرين وتكوين صفحة الهبوط العامة.'
                        : 'Welcome to the Master Control Panel. From here you can oversee global metrics, manage tenant subscriptions, and configure the public landing page.'
                    }
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-card border border-border p-8 rounded-2xl hover:bg-muted/50 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {isRtl ? 'مباشر' : 'Live'}
                            </span>
                        </div>
                        <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">
                            {card.title}
                        </h3>
                        <div className="text-4xl font-black text-white tracking-tight">
                            {loading ? (
                                <div className="h-10 w-24 bg-white/5 animate-pulse rounded-lg" />
                            ) : card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Global Distribution - NEW */}
            {stats?.tenantsByCountry && stats.tenantsByCountry.length > 0 && (
                <div className="mt-10 bg-card border border-border p-10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-primary/10" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">
                                    {isRtl ? 'التوزيع العالمي' : 'Global Distribution'}
                                </h2>
                                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
                                    {isRtl ? 'حسب عدد المستأجرين' : 'By Tenant Count'}
                                </p>
                            </div>
                            <Globe className="w-8 h-8 text-primary opacity-50" />
                        </div>

                        <div className="space-y-6">
                            {stats.tenantsByCountry.map((item, idx) => {
                                const maxCount = stats.tenantsByCountry![0].count;
                                const percentage = (item.count / maxCount) * 100;
                                
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm font-bold tracking-tight">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 text-muted-foreground">0{idx + 1}</span>
                                                <span className="text-white text-lg">{item.country}</span>
                                                <span className="px-2 py-0.5 bg-muted rounded text-[10px] uppercase">{item.code}</span>
                                            </div>
                                            <span className="text-primary font-black">{item.count} {isRtl ? 'مستأجر' : 'Tenants'}</span>
                                        </div>
                                        <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick links */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href={`/${locale}/admin/subscriptions`} className="flex items-center gap-4 p-5 bg-primary-500/10 border border-primary-500/20 rounded-2xl hover:bg-primary-500/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">Subscription Manager</p>
                        <p className="text-xs text-primary-400">Analytics, tenants & upgrade requests</p>
                    </div>
                </a>
                <a href={`/${locale}/admin/tenants`} className="flex items-center gap-4 p-5 bg-primary-500/10 border border-primary-500/20 rounded-2xl hover:bg-primary-500/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">Tenants</p>
                        <p className="text-xs text-primary-400">Manage all tenants</p>
                    </div>
                </a>
                <a href={`/${locale}/admin/cms`} className="flex items-center gap-4 p-5 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">CMS</p>
                        <p className="text-xs text-primary">Manage landing page content</p>
                    </div>
                </a>
            </div>
        </div>
    );
}
