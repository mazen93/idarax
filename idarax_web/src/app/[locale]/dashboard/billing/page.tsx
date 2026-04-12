'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, ArrowUp, Clock, Zap, Crown, Star, AlertCircle } from 'lucide-react';

interface Plan {
    id: string;
    name: string;
    nameAr?: string;
    price: number;
    features: string[];
    maxBranches: number;
    maxPos: number;
    maxKds: number;
    maxUsers: number;
    description?: string;
}

interface SubscriptionInfo {
    currentPlan: Plan | null;
    status: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
    expiresAt: string | null;
    isTrial: boolean;
    pendingUpgradeRequest: { toPlan: Plan; requestedAt: string } | null;
}

const planIcons: Record<string, any> = {
    Starter: Star,
    Professional: Zap,
    Enterprise: Crown,
};

const planColors: Record<string, string> = {
    Starter: 'border-primary-500/30 from-primary-500/10',
    Professional: 'border-primary-500/30 from-primary-500/10',
    Enterprise: 'border-warning-500/30 from-warning-500/10',
};

const planAccents: Record<string, string> = {
    Starter: 'text-primary-400',
    Professional: 'text-primary-400',
    Enterprise: 'text-warning-400',
};

const planBtns: Record<string, string> = {
    Starter: 'bg-primary-500/20 text-primary-300 border-primary-500/30 cursor-default',
    Professional: 'bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white border-transparent',
    Enterprise: 'bg-gradient-to-r from-warning-500 to-orange-600 hover:from-warning-600 hover:to-orange-700 text-white border-transparent',
};

const ALL_FEATURES = [
    'Basic POS',
    'Order Management',
    'Products & Categories',
    'Reports & Sales',
    'Staff Management',
    'Tables & Reservations',
    'KDS Kitchen Display',
    'CRM & Customers',
    'Loyalty Points',
    'Marketing & Campaigns',
    'Inventory Management',
    'Advanced Analytics',
    'Multiple Branches',
    'White-label',
    'API Access',
];

const planFeatureSets: Record<string, string[]> = {
    Starter: ['Basic POS', 'Order Management', 'Products & Categories', 'Reports & Sales', 'Staff Management'],
    Professional: ['Basic POS', 'Order Management', 'Products & Categories', 'Reports & Sales', 'Staff Management', 'Tables & Reservations', 'KDS Kitchen Display', 'CRM & Customers', 'Loyalty Points', 'Inventory Management', 'Multiple Branches'],
    Enterprise: ALL_FEATURES,
};

export default function BillingPage() {
    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            api.get('/tenant/subscription'),
            api.get('/tenant/subscription/plans'),
        ]).then(([subRes, planRes]) => {
            setSubscription(subRes.data);
            const rawPlans = planRes.data;
            setPlans(Array.isArray(rawPlans) ? rawPlans : rawPlans.data || []);
        }).catch(() => {
            setError('Failed to load subscription data');
        }).finally(() => setLoading(false));
    }, []);

    const handleUpgradeRequest = async (planId: string, planName: string) => {
        setSubmitting(planId);
        setError(null);
        setSuccess(null);
        try {
            await api.post('/tenant/subscription/upgrade-request', { planId });
            setSuccess(`✅ Your upgrade request to ${planName} has been submitted. Our team will process it shortly.`);
            // Refresh
            const subRes = await api.get('/tenant/subscription');
            setSubscription(subRes.data);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to submit upgrade request');
        } finally {
            setSubmitting(null);
        }
    };

    const statusBadge = () => {
        if (!subscription) return null;
        const cfg = {
            ACTIVE: { cls: 'bg-primary/20 text-primary border-primary/30', label: 'Active' },
            TRIAL: { cls: 'bg-primary-500/20 text-primary-400 border-primary-500/30', label: 'Trial' },
            EXPIRED: { cls: 'bg-error-500/20 text-error-400 border-error-500/30', label: 'Expired' },
        }[subscription.status];
        return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.cls}`}>{cfg.label}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const currentPlanName = subscription?.currentPlan?.name || 'Starter';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white mb-1">Billing & Subscription</h1>
                <p className="text-zinc-400 text-sm">Manage your plan, view limits, and upgrade to unlock more features.</p>
            </div>

            {/* Alerts */}
            {success && (
                <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary text-sm">
                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <span>{success}</span>
                </div>
            )}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-error-500/10 border border-error-500/30 rounded-xl text-error-400 text-sm">
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Current Plan card */}
            <div className={`p-6 rounded-2xl border bg-gradient-to-br ${planColors[currentPlanName] || 'border-zinc-800 from-zinc-900'} to-transparent`}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {(() => {
                            const Icon = planIcons[currentPlanName] || Star;
                            return <div className={`w-12 h-12 rounded-xl bg-white/5 border border-border flex items-center justify-center ${planAccents[currentPlanName]}`}><Icon className="h-6 w-6" /></div>;
                        })()}
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Current Plan</p>
                            <h2 className={`text-2xl font-black ${planAccents[currentPlanName]}`}>{subscription?.currentPlan?.name || 'Starter'}</h2>
                            <div className="flex items-center gap-2 mt-1">{statusBadge()}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground text-xs">Expires</p>
                        <p className="text-white font-bold text-sm">
                            {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
                        </p>
                        {subscription?.isTrial && subscription.expiresAt && (
                            <p className="text-xs text-warning-400 mt-1 flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                <span>Trial ends {new Date(subscription.expiresAt).toLocaleDateString()}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Limits */}
                {subscription?.currentPlan && (
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Branches', val: subscription.currentPlan.maxBranches },
                            { label: 'POS Devices', val: subscription.currentPlan.maxPos },
                            { label: 'KDS Screens', val: subscription.currentPlan.maxKds },
                            { label: 'Users', val: subscription.currentPlan.maxUsers },
                        ].map(({ label, val }) => (
                            <div key={label} className="bg-black/30 rounded-xl p-3 text-center border border-border">
                                <p className="text-xl font-black text-white">{val === 999 ? '∞' : val}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pending upgrade banner */}
                {subscription?.pendingUpgradeRequest && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-warning-500/10 border border-warning-500/20 rounded-xl text-sm text-warning-300">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span>Upgrade to <strong>{subscription.pendingUpgradeRequest.toPlan.name}</strong> is pending admin approval — submitted {new Date(subscription.pendingUpgradeRequest.requestedAt).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {/* Plans grid */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans.map((plan) => {
                        const isCurrent = plan.name === currentPlanName;
                        const isDowngrade = ['Starter'].includes(plan.name) && currentPlanName !== 'Starter';
                        const Icon = planIcons[plan.name] || Star;
                        const hasPending = subscription?.pendingUpgradeRequest?.toPlan?.name === plan.name;

                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col p-6 rounded-2xl border bg-gradient-to-br ${planColors[plan.name] || 'border-zinc-800 from-zinc-900'} to-[var(--background)] ${isCurrent ? 'ring-2 ring-primary-500/50' : ''}`}
                            >
                                {isCurrent && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        Current Plan
                                    </span>
                                )}

                                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center mb-4 ${planAccents[plan.name]}`}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <h3 className={`text-xl font-black ${planAccents[plan.name]}`}>{plan.name}</h3>
                                <p className="text-3xl font-black text-white mt-2">
                                    ${Number(plan.price).toFixed(0)}
                                    <span className="text-sm text-muted-foreground font-normal">/year</span>
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 mb-5">{plan.description || ''}</p>

                                {/* Features for this plan */}
                                <div className="flex-1 space-y-2 mb-6">
                                    {ALL_FEATURES.map(f => {
                                        const included = (planFeatureSets[plan.name] || plan.features).includes(f);
                                        return (
                                            <div key={f} className={`flex items-center gap-2 text-sm ${included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                                {included
                                                    ? <CheckCircle className={`h-4 w-4 shrink-0 ${planAccents[plan.name]}`} />
                                                    : <XCircle className="h-4 w-4 shrink-0 text-zinc-700" />
                                                }
                                                {f}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* CTA */}
                                {isCurrent ? (
                                    <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold border bg-white/5 text-zinc-400 border-border">
                                        ✓ Active Plan
                                    </div>
                                ) : isDowngrade ? (
                                    <div className="w-full py-2.5 rounded-xl text-center text-sm text-zinc-600 border border-zinc-800">
                                        Downgrade (contact support)
                                    </div>
                                ) : hasPending ? (
                                    <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold border bg-warning-500/10 text-warning-400 border-warning-500/20">
                                        <Clock className="h-4 w-4 inline mr-1" /> Pending Approval
                                    </div>
                                ) : (
                                    <button
                                        disabled={!!submitting || !!subscription?.pendingUpgradeRequest}
                                        onClick={() => handleUpgradeRequest(plan.id, plan.name)}
                                        className={`w-full py-2.5 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${planBtns[plan.name] || 'bg-muted-foreground text-white border-transparent'}`}
                                    >
                                        {submitting === plan.id ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><ArrowUp className="h-4 w-4" /> Upgrade to {plan.name}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FAQ note */}
            <div className="p-5 bg-white/3 border border-white/8 rounded-xl">
                <p className="text-sm text-zinc-400">
                    💬 <strong className="text-white">How upgrades work:</strong> After submitting your upgrade request, our team will review and activate your new plan within 24 hours. You&apos;ll receive a confirmation email when it&apos;s active. For urgent requests, contact <a href="mailto:support@idarax.io" className="text-primary-400 hover:underline">support@idarax.io</a>.
                </p>
            </div>
        </div>
    );
}
