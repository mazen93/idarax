'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    TrendingUp, Users, DollarSign, Clock, CheckCircle, XCircle,
    AlertTriangle, ChevronDown, Search, Filter, RefreshCw
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PlanStat { planName: string; tenantCount: number; mrr: number; price: number; }
interface MonthData { month: string; count: number; }
interface Analytics {
    totalMrr: number;
    planBreakdown: PlanStat[];
    monthlyGrowth: MonthData[];
    conversionRate: string;
    expiringSoon: any[];
    countryAnalytics: { country: string; code: string; tenantCount: number; activeCount: number; trialCount: number; totalRevenue: number; totalOrders: number; }[];
}
interface Tenant {
    id: string; name: string; domain: string;
    plan?: { name: string };
    subscriptionStatus: string;
    subscriptionExpiresAt?: string;
    orderCount: number; branchCount: number; userCount: number;
}
interface UpgradeRequest {
    id: string; status: string; requestedAt: string; processedAt?: string;
    tenant: { id: string; name: string; domain: string };
    fromPlan?: { name: string };
    toPlan: { name: string };
}

const PLAN_COLORS: Record<string, string> = {
    Starter: 'var(--chart-2)',
    Professional: 'var(--primary)',
    Enterprise: 'var(--chart-4)',
};

const STATUS_BADGES: Record<string, string> = {
    ACTIVE: 'bg-primary/20 text-primary border-primary/30',
    TRIAL: 'bg-primary/10 text-primary border-primary/20',
    EXPIRED: 'bg-error-500/20 text-error-500 border-error-500/30',
    PENDING: 'bg-warning-500/20 text-warning-500 border-warning-500/30',
    APPROVED: 'bg-success-500/20 text-success-500 border-success-500/30',
    REJECTED: 'bg-error-500/20 text-error-500 border-error-500/30',
};

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className="bg-[var(--background)] border border-white/8 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
        </div>
    );
}

export default function AdminSubscriptionsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'requests' | 'plans'>('overview');
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [tenantMeta, setTenantMeta] = useState({ total: 0, page: 1, lastPage: 1 });
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Filters
    const [planFilter, setPlanFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [reqStatusFilter, setReqStatusFilter] = useState('PENDING');

    const fetchAnalytics = async () => {
        const [aRes, tRes, rRes, cRes] = await Promise.all([
            api.get('/superadmin/subscription-analytics'),
            api.get('/superadmin/tenants', { params: { plan: planFilter || undefined, status: statusFilter || undefined, search: search || undefined } }),
            api.get('/superadmin/upgrade-requests', { params: { status: reqStatusFilter || undefined } }),
            api.get('/superadmin/country-analytics'),
        ]);
        setAnalytics({ ...aRes.data, countryAnalytics: cRes.data });
        const td = tRes.data;
        setTenants(Array.isArray(td) ? td : td.data || []);
        setTenantMeta(td.meta || { total: 0, page: 1, lastPage: 1 });
        setRequests(Array.isArray(rRes.data) ? rRes.data : rRes.data?.data || []);
    };

    useEffect(() => { fetchAnalytics().finally(() => setLoading(false)); }, []);
    useEffect(() => {
        if (!loading) fetchAnalytics();
    }, [planFilter, statusFilter, search, reqStatusFilter]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await api.put(`/superadmin/upgrade-requests/${id}/approve`);
            await fetchAnalytics();
        } finally { setActionLoading(null); }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await api.put(`/superadmin/upgrade-requests/${id}/reject`);
            await fetchAnalytics();
        } finally { setActionLoading(null); }
    };

    const [planModal, setPlanModal] = useState<any | null>(null);
    const [planForm, setPlanForm] = useState<any>({
        name: '', nameAr: '', description: '', descriptionAr: '', price: 0, 
        maxPos: 1, maxBranches: 1, maxUsers: 5, maxKds: 0, 
        features: [], featuresAr: [], isActive: true
    });

    const handleSavePlan = async () => {
        setActionLoading('save-plan');
        try {
            console.log('Attempting to save plan:', planForm); // DEBUG LOG
            
            // Strict whitelist of allowed fields for Create/Update
            const allowed = ['name', 'price', 'features', 'maxPos', 'maxKds', 'maxBranches', 'maxUsers', 'isActive', 'description', 'nameAr', 'descriptionAr', 'featuresAr'];
            const payload = Object.keys(planForm)
                .filter(key => allowed.includes(key))
                .reduce((obj: any, key: string) => {
                    // Ensure numeric fields are actually numbers
                    if (['price', 'maxPos', 'maxKds', 'maxBranches', 'maxUsers'].includes(key)) {
                        obj[key] = Number(planForm[key]);
                    } else {
                        obj[key] = planForm[key];
                    }
                    return obj;
                }, {});
            
            console.log('Sending payload:', payload); // DEBUG LOG

            if (planModal?.id) {
                await api.patch(`/superadmin/plans/${planModal.id}`, payload);
            } else {
                await api.post('/superadmin/plans', payload);
            }
            
            setPlanModal(null);
            fetchAnalytics();
        } catch (err: any) {
            console.error('CRITICAL: Failed to save plan configuration:', err);
            alert(`Error saving plan: ${err.response?.data?.message || err.message}`);
        } finally { setActionLoading(null); }
    };

    const handleApproveTenant = async (id: string) => {
        setActionLoading(id);
        try {
            await api.put(`/superadmin/tenants/${id}/approve`);
            await fetchAnalytics();
        } finally { setActionLoading(null); }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'tenants', label: `Tenants (${tenantMeta.total})` },
        { id: 'plans', label: 'Management' },
        { id: 'requests', label: `Upgrade Requests (${requests.filter(r => r.status === 'PENDING').length})` },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Subscriptions</h1>
                    <p className="text-muted-foreground text-sm mt-1">Monitor plans, revenue, and upgrade requests</p>
                </div>
                <button
                    onClick={() => fetchAnalytics()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border rounded-xl text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-border w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && analytics && (
                <div className="space-y-6">
                    {/* KPI strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={DollarSign} label="Monthly Recurring Revenue" value={`$${analytics.totalMrr.toLocaleString()}`} color="bg-primary/20 text-primary" />
                        <StatCard icon={Users} label="Total Tenants" value={analytics.planBreakdown.reduce((s, p) => s + p.tenantCount, 0)} color="bg-primary/10 text-primary" />
                        <StatCard icon={TrendingUp} label="Trial Conversion" value={`${analytics.conversionRate}%`} color="bg-primary/10 text-primary" />
                        <StatCard icon={AlertTriangle} label="Expiring in 7 Days" value={analytics.expiringSoon.length} color="bg-warning-500/10 text-warning-500" />
                    </div>

                    {/* Charts row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Plan distribution pie */}
                        <div className="bg-[var(--background)] border border-white/8 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-white mb-4">Tenants by Plan</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={analytics.planBreakdown} dataKey="tenantCount" nameKey="planName" cx="50%" cy="50%" outerRadius={80} label={(props: any) => `${props.planName}: ${props.tenantCount}`}>
                                        {analytics.planBreakdown.map((entry) => (
                                            <Cell key={entry.planName} fill={PLAN_COLORS[entry.planName] || '#6b7280'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`${v} tenants`]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Monthly growth bar */}
                        <div className="bg-[var(--background)] border border-white/8 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-white mb-4">Monthly New Tenants</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={analytics.monthlyGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ background: 'var(--chart-tooltip)', border: '1px solid var(--border)', borderRadius: 12 }}
                                        cursor={{ fill: 'var(--chart-grid)', opacity: 0.1 }}
                                    />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Geographical Insights */}
                    <div className="bg-[var(--background)] border border-white/8 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" /> Geographical Insights
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue by Country */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Revenue Distribution</p>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={analytics.countryAnalytics} layout="vertical" margin={{ left: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="country" type="category" tick={{ fill: 'var(--chart-axis)', fontSize: 11 }} width={100} />
                                        <Tooltip 
                                            cursor={{ fill: 'var(--chart-grid)', opacity: 0.1 }} 
                                            contentStyle={{ background: 'var(--chart-tooltip)', border: '1px solid var(--border)', borderRadius: 12 }}
                                            formatter={(v: any) => [`$${(v || 0).toLocaleString()}`, 'Total Revenue']}
                                        />
                                        <Bar dataKey="totalRevenue" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Tenant Status by Country */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Market Penetration</p>
                                <div className="space-y-3">
                                    {analytics.countryAnalytics.map(c => {
                                        const total = c.activeCount + c.trialCount;
                                        const activePercent = (c.activeCount / total) * 100;
                                        return (
                                            <div key={c.code} className="bg-white/5 border border-border p-3 rounded-xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{countryToFlag(c.code)}</span>
                                                        <span className="text-sm font-bold text-white">{c.country}</span>
                                                    </div>
                                                    <span className="text-xs text-zinc-400">{total} Tenants</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-primary" style={{ width: `${activePercent}%` }} title="Active" />
                                                    <div className="h-full bg-warning-500" style={{ width: `${100 - activePercent}%` }} title="Trial" />
                                                </div>
                                                <div className="flex justify-between mt-1.5">
                                                    <span className="text-[10px] text-zinc-500 uppercase tracking-tighter font-bold">{c.activeCount} Active</span>
                                                    <span className="text-[10px] text-warning-500 uppercase tracking-tighter font-bold">{c.trialCount} Trial</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan MRR breakdown table */}
                    <div className="bg-[var(--background)] border border-white/8 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/8">
                            <h3 className="text-sm font-bold text-white">Revenue by Plan</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="px-5 py-3 text-left">Plan</th>
                                    <th className="px-5 py-3 text-right">Tenants</th>
                                    <th className="px-5 py-3 text-right">Price/yr</th>
                                    <th className="px-5 py-3 text-right">MRR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.planBreakdown.map(p => (
                                    <tr key={p.planName} className="border-b border-border hover:bg-white/3">
                                        <td className="px-5 py-3">
                                            <span className="font-bold" style={{ color: PLAN_COLORS[p.planName] }}>{p.planName}</span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-zinc-300">{p.tenantCount}</td>
                                        <td className="px-5 py-3 text-right text-zinc-400">${p.price}</td>
                                        <td className="px-5 py-3 text-right font-bold text-primary">${p.mrr.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Expiring soon */}
                    {analytics.expiringSoon.length > 0 && (
                        <div className="bg-warning-500/5 border border-warning-500/20 rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-warning-400 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" /> Expiring Within 7 Days
                            </h3>
                            <div className="space-y-2">
                                {analytics.expiringSoon.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-300">{t.name}</span>
                                        <span className="text-warning-400 text-xs">{new Date(t.subscriptionExpiresAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Tenants Tab ── */}
            {activeTab === 'tenants' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by name or domain..."
                                className="w-full bg-[var(--background)] border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-primary-500"
                            />
                        </div>
                        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="bg-[var(--background)] border border-border rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none focus:border-primary-500">
                            <option value="">All Plans</option>
                            <option>Starter</option>
                            <option>Professional</option>
                            <option>Enterprise</option>
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[var(--background)] border border-border rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none focus:border-primary-500">
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="TRIAL">Trial</option>
                            <option value="PENDING">Pending Approval</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-[var(--background)] border border-white/8 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/8 text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="px-5 py-3 text-left">Tenant</th>
                                    <th className="px-5 py-3 text-left">Plan</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                    <th className="px-5 py-3 text-right">Orders</th>
                                    <th className="px-5 py-3 text-right">Expires</th>
                                    <th className="px-5 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map(t => (
                                    <tr key={t.id} className="border-b border-border hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-white">{t.name}</p>
                                            <p className="text-xs text-muted-foreground">{t.domain}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="font-bold text-sm" style={{ color: PLAN_COLORS[t.plan?.name || ''] || '#6b7280' }}>
                                                {t.plan?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGES[t.subscriptionStatus] || ''}`}>
                                                {t.subscriptionStatus}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-zinc-300">{t.orderCount}</td>
                                        <td className="px-5 py-3 text-right text-muted-foreground text-xs">
                                            {t.subscriptionExpiresAt ? new Date(t.subscriptionExpiresAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            {t.subscriptionStatus === 'PENDING' && (
                                                <div className="flex justify-center">
                                                    <button
                                                        disabled={actionLoading === t.id}
                                                        onClick={() => handleApproveTenant(t.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-colors disabled:opacity-50"
                                                    >
                                                        {actionLoading === t.id ? '...' : <><CheckCircle className="h-3.5 w-3.5" /> Approve</>}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {tenants.length === 0 && (
                            <div className="py-12 text-center text-zinc-600 text-sm">No tenants match the selected filters</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Upgrade Requests Tab ── */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        {['PENDING', 'APPROVED', 'REJECTED', ''].map(s => (
                            <button
                                key={s}
                                onClick={() => setReqStatusFilter(s)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${reqStatusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-border text-muted-foreground hover:text-white'}`}
                            >
                                {s || 'All'}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[var(--background)] border border-white/8 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/8 text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="px-5 py-3 text-left">Tenant</th>
                                    <th className="px-5 py-3 text-left">Request</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                    <th className="px-5 py-3 text-right">Date</th>
                                    <th className="px-5 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r.id} className="border-b border-border hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-white">{r.tenant.name}</p>
                                            <p className="text-xs text-muted-foreground">{r.tenant.domain}</p>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-muted-foreground">{r.fromPlan?.name || 'Trial'}</span>
                                            <span className="mx-2 text-zinc-700">→</span>
                                            <span className="font-bold" style={{ color: PLAN_COLORS[r.toPlan.name] || '#fff' }}>{r.toPlan.name}</span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGES[r.status] || ''}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right text-muted-foreground text-xs">
                                            {new Date(r.requestedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-3">
                                            {r.status === 'PENDING' ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        disabled={actionLoading === r.id}
                                                        onClick={() => handleApprove(r.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-colors disabled:opacity-50"
                                                    >
                                                        {actionLoading === r.id ? '...' : <><CheckCircle className="h-3.5 w-3.5" /> Approve</>}
                                                    </button>
                                                    <button
                                                        disabled={actionLoading === r.id}
                                                        onClick={() => handleReject(r.id)}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-error-500/20 border border-error-500/30 text-error-400 rounded-lg text-xs font-bold hover:bg-error-500/30 transition-colors disabled:opacity-50"
                                                    >
                                                        <XCircle className="h-3.5 w-3.5" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-center text-xs text-zinc-600">
                                                    {r.processedAt ? new Date(r.processedAt).toLocaleDateString() : '—'}
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {requests.length === 0 && (
                            <div className="py-12 text-center text-zinc-600 text-sm">No upgrade requests found</div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Plans Tab ── */}
            {activeTab === 'plans' && analytics && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <TrendingUp className="h-5 w-5 text-primary" /> Active Plan Tiers
                        </h2>
                        <button 
                            onClick={() => {
                                setPlanModal({});
                                setPlanForm({ 
                                    name: '', nameAr: '', description: '', descriptionAr: '', price: 0, 
                                    maxPos: 1, maxBranches: 1, maxUsers: 5, maxKds: 0, 
                                    features: [], featuresAr: [], isActive: true 
                                });
                            }}
                            className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all outline-none uppercase tracking-widest"
                        >
                            + Create New Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {analytics.planBreakdown.map(p => {
                            // Find full plan details from internal state if needed or just use current analytic data
                            // Note: analytics.planBreakdown only has some fields. We might need a separate GET /plans if we want more.
                            // But for editing POS, we have enough if we fetch the full list in getPlans() if we need to.
                            return (
                                <div key={p.planName} className="bg-zinc-900 border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-2xl font-black text-white">{p.planName}</span>
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-lg font-black">${p.price}</span>
                                        </div>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-xs text-zinc-400">
                                                <span>POS Limit:</span>
                                                <span className="text-white font-black">{p.tenantCount === undefined ? '—' : 'Included'}</span>
                                            </div>
                                            {/* Note: In a real app we'd fetch the full Plan details here or pass them in a better analytics response */}
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Current Usage: {p.tenantCount} Tenants</p>
                                        </div>
                                        <button 
                                            // The backend AdminService has getAllPlans, let's assume we can fetch specific plan by name or id
                                            onClick={async () => {
                                                const res = await api.get('/superadmin/plans');
                                                const fullPlan = res.data.find((f: any) => f.name === p.planName);
                                                if (fullPlan) {
                                                    setPlanModal(fullPlan);
                                                    setPlanForm(fullPlan);
                                                }
                                            }}
                                            className="w-full py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-zinc-400 group-hover:text-white"
                                        >
                                            Edit Plan Configuration
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Plan Editor Modal */}
            {planModal && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary shrink-0" />
                        
                        {/* Scrollable Content Area */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{planModal.id ? 'Edit System Plan' : 'Create New Tier'}</h2>
                                <button onClick={() => setPlanModal(null)} className="text-muted-foreground hover:text-white transition-colors"><XCircle size={20} /></button>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Plan Name</label>
                                    <input 
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                        value={planForm.name} 
                                        onChange={e => setPlanForm({ ...planForm, name: e.target.value })} 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Price ($)</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                            value={planForm.price ? Number(planForm.price).toFixed(2) : ''} 
                                            onChange={e => setPlanForm({ ...planForm, price: parseFloat(e.target.value) })} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Default POS Limit</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                            value={planForm.maxPos} 
                                            onChange={e => setPlanForm({ ...planForm, maxPos: parseInt(e.target.value) })} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Max Branches</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                            value={planForm.maxBranches} 
                                            onChange={e => setPlanForm({ ...planForm, maxBranches: parseInt(e.target.value) })} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Max Users</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                            value={planForm.maxUsers} 
                                            onChange={e => setPlanForm({ ...planForm, maxUsers: parseInt(e.target.value) })} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Max KDS</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                            value={planForm.maxKds || 0} 
                                            onChange={e => setPlanForm({ ...planForm, maxKds: parseInt(e.target.value) })} 
                                        />
                                    </div>
                                    <div className="flex items-end pb-1">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded-lg border-zinc-800 bg-zinc-950 text-primary focus:ring-primary/20"
                                                checked={planForm.isActive}
                                                onChange={e => setPlanForm({ ...planForm, isActive: e.target.checked })}
                                            />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Active for Visitors</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Branding & Localization Section */}
                                <div className="pt-4 border-t border-zinc-800 mt-2">
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Public Branding & Localization</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Arabic Name</label>
                                                <input 
                                                    dir="rtl"
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none text-right"
                                                    value={planForm.nameAr || ''} 
                                                    onChange={e => setPlanForm({ ...planForm, nameAr: e.target.value })} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">English Description</label>
                                                <input 
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none"
                                                    value={planForm.description || ''} 
                                                    onChange={e => setPlanForm({ ...planForm, description: e.target.value })} 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Arabic Description</label>
                                            <input 
                                                dir="rtl"
                                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-primary/50 outline-none text-right"
                                                value={planForm.descriptionAr || ''} 
                                                onChange={e => setPlanForm({ ...planForm, descriptionAr: e.target.value })} 
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Features (one per line)</label>
                                                <textarea 
                                                    rows={4}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium text-white focus:border-primary/50 outline-none resize-none"
                                                    value={(planForm.features || []).join('\n')} 
                                                    onChange={e => setPlanForm({ ...planForm, features: e.target.value.split('\n') })} 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5 ml-1">Arabic Features (واحد في السطر)</label>
                                                <textarea 
                                                    dir="rtl"
                                                    rows={4}
                                                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-medium text-white focus:border-primary/50 outline-none resize-none text-right"
                                                    value={(planForm.featuresAr || []).join('\n')} 
                                                    onChange={e => setPlanForm({ ...planForm, featuresAr: e.target.value.split('\n') })} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-zinc-800 shrink-0 bg-zinc-900 rounded-b-3xl">
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleSavePlan} 
                                    className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                    disabled={actionLoading === 'save-plan'}
                                >
                                    {actionLoading === 'save-plan' ? 'Saving...' : 'Save Configuration'}
                                </button>
                                <button onClick={() => setPlanModal(null)} className="px-8 py-4 bg-white/5 text-muted-foreground font-bold rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function countryToFlag(code: string) {
    if (!code || code === '??') return '🏳️';
    return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
