'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useModal } from '@/components/ModalContext';
import { FeatureGate } from '@/components/common/FeatureGate';
import { 
    Megaphone, Users, Mail, Percent, ArrowUpRight, 
    RefreshCw, Send, AlertCircle, CheckCircle2, History,
    Settings2, Save, ToggleLeft, ToggleRight, Plus, Trash2, Gift, DollarSign
} from 'lucide-react';

export default function MarketingPage() {
    const t = useTranslations();
    const { showConfirm, showAlert } = useModal();
    const [stats, setStats] = useState<any>(null);
    const [rule, setRule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [activeTab, setActiveTab] = useState<'winback' | 'birthday' | 'referral' | 'loyalty'>('winback');
    const [settings, setSettings] = useState<any>(null);
    const [rewards, setRewards] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [newReward, setNewReward] = useState({ productId: '', pointsCost: '' });
    const fetchData = async () => {
        try {
            const [statsRes, ruleRes, setRes, rewRes, prodRes] = await Promise.all([
                api.get('/marketing/stats'),
                api.get('/marketing/rule'),
                api.get('/tenant/settings'),
                api.get('/crm/rewards'),
                api.get('/retail/products?limit=250')
            ]);
            setStats(statsRes.data);
            setRule(ruleRes.data);
            setSettings(setRes.data);
            setRewards(rewRes.data);
            setProducts(prodRes.data.data || prodRes.data);
        } catch (err) {
            console.error('Failed to fetch marketing data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTrigger = () => {
        showConfirm({
            title: 'Trigger Win-Back Campaign',
            message: 'Are you sure you want to trigger the Win-Back campaign manually? This will send emails to all eligible inactive customers based on your current settings.',
            variant: 'WARNING',
            confirmText: 'Run Now',
            onConfirm: async () => {
                setTriggering(true);
                setMessage(null);
                try {
                    await api.post('/marketing/win-back/trigger', {});
                    setMessage({ type: 'success', text: 'Campaign triggered successfully!' });
                    fetchData();
                } catch (err: any) {
                    setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to trigger campaign' });
                } finally {
                    setTriggering(false);
                }
            }
        });
    };

    const handleSaveRule = async () => {
        setSaving(true);
        try {
            if (activeTab === 'loyalty') {
                await api.patch('/tenant/settings', {
                    loyaltyRatioEarning: Number(settings?.loyaltyRatioEarning || 1.0),
                    loyaltyRatioRedemption: Number(settings?.loyaltyRatioRedemption || 0.01)
                });
            } else {
                await api.post('/marketing/rule', rule);
            }
            setMessage({ type: 'success', text: 'Settings updated!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleAddReward = async () => {
        if (!newReward.productId || !newReward.pointsCost) return;
        try {
            await api.post('/crm/rewards', {
                productId: newReward.productId,
                pointsCost: Number(newReward.pointsCost)
            });
            setNewReward({ productId: '', pointsCost: '' });
            const rewRes = await api.get('/crm/rewards');
            setRewards(rewRes.data);
            setMessage({ type: 'success', text: 'Reward added!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add reward' });
        }
    };

    const handleDeleteReward = async (id: string) => {
        try {
            await api.delete(`/crm/rewards/${id}`);
            setRewards(rewards.filter(r => r.id !== id));
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to delete reward' });
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <FeatureGate 
            feature="MARKETING" 
            requiredPlan="Enterprise"
            title={t('marketing_locked_title') || 'AI Marketing & Campaigns'}
            description={t('marketing_locked_desc') || 'Run automated win-back campaigns, birthday rewards, and personalized SMS/Email re-engagement.'}
            icon="📣"
        >
            <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Megaphone className="h-8 w-8 text-primary" />
                        </div>
                        {t('marketing')}
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium italic">
                        Automated customer retention & re-engagement engine.
                    </p>
                </div>
                {activeTab === 'winback' && (
                    <button
                        onClick={handleTrigger}
                        disabled={triggering || !rule?.isActive}
                        className="flex items-center gap-2 bg-primary hover:bg-primary disabled:opacity-30 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-success-500/20 active:scale-95"
                    >
                        {triggering ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        Trigger Win-Back
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-px">
                {[
                    { id: 'winback', label: 'Win-Back' },
                    { id: 'birthday', label: 'Birthday Rewards' },
                    { id: 'referral', label: 'Refer-a-Friend' },
                    { id: 'loyalty', label: 'Loyalty Engine' }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-6 py-3 font-bold text-sm tracking-widest uppercase transition-all border-b-2
                            ${activeTab === t.id 
                                ? 'text-primary border-primary' 
                                : 'text-muted-foreground border-transparent hover:text-slate-300'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm animate-in slide-in-from-top-2 ${
                    message.type === 'success' 
                        ? 'bg-primary/10 border-primary/30 text-primary' 
                        : 'bg-error-500/10 border-error-500/30 text-error-500'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Stats and History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Emails Sent', value: stats?.totalSent || 0, icon: Mail, color: 'text-primary-400', bg: 'bg-primary-400/10' },
                            { label: 'Conversion', value: stats?.conversionRate || '0%', icon: ArrowUpRight, color: 'text-primary', bg: 'bg-primary/10' },
                            { label: 'Revenue', value: `${stats?.totalRevenue || 0} ${stats?.currency || 'USD'}`, icon: Percent, color: 'text-warning-400', bg: 'bg-warning-400/10' },
                            { label: 'Converted', value: stats?.totalConverted || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-card/50 border border-border rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Campaign History */}
                    <div className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold text-white">Recent Campaigns</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto text-white">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-background/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Date Sent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {stats?.recentCampaigns?.map((camp: any) => (
                                        <tr key={camp.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-200">{camp.customer?.name}</div>
                                                <div className="text-xs text-muted-foreground">{camp.customer?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-muted-foreground bg-muted/50 inline-block px-2 py-1 rounded">
                                                    {camp.type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                                    <div className="h-1 w-1 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                                                    {camp.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-muted-foreground font-medium">
                                                {new Date(camp.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!stats?.recentCampaigns || stats.recentCampaigns.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic font-medium">
                                                No campaigns recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings Panel */}
                <div className="space-y-6">
                    <div className="bg-card/50 border border-border rounded-3xl p-6 shadow-xl sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Settings2 className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {activeTab === 'winback' && 'Win-Back Rules'}
                                {activeTab === 'birthday' && 'Birthday Rules'}
                                {activeTab === 'referral' && 'Referral Rewards'}
                                {activeTab === 'loyalty' && 'Loyalty Designer'}
                            </h2>
                        </div>

                        <div className="space-y-6">

                            {activeTab === 'winback' && (
                                <>
                                    {/* Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Status</p>
                                            <p className="text-[10px] text-muted-foreground">Enable/Disable automation</p>
                                        </div>
                                        <button 
                                            onClick={() => setRule({ ...rule, isActive: !rule.isActive })}
                                            className="focus:outline-none"
                                        >
                                            {rule?.isActive ? (
                                                <ToggleRight className="h-10 w-10 text-primary fill-success-500/10" />
                                            ) : (
                                                <ToggleLeft className="h-10 w-10 text-slate-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Inactive Days */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Inactive Threshold (Days)</label>
                                        <input 
                                            type="number"
                                            value={rule?.inactiveDays || 30}
                                            onChange={(e) => setRule({ ...rule, inactiveDays: parseInt(e.target.value) })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Discount */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Discount Value (%)</label>
                                        <input 
                                            type="number"
                                            value={rule?.discountValue || 15}
                                            onChange={(e) => setRule({ ...rule, discountValue: parseFloat(e.target.value) })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Email Subject */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Subject</label>
                                        <input 
                                            type="text"
                                            value={rule?.emailSubject || ''}
                                            onChange={(e) => setRule({ ...rule, emailSubject: e.target.value })}
                                            placeholder="Placeholder: {{customer_name}}"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Email Content Snippet */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Template (Snippet)</label>
                                        <textarea 
                                            rows={4}
                                            value={rule?.emailContent || ''}
                                            onChange={(e) => setRule({ ...rule, emailContent: e.target.value })}
                                            placeholder="HTML/Text. Use {{customer_name}}, {{promo_code}}, etc."
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-medium text-xs focus:border-primary/50 outline-none transition-colors resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'birthday' && (
                                <>
                                    {/* Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Status</p>
                                            <p className="text-[10px] text-muted-foreground">Enable automated birthday rewards</p>
                                        </div>
                                        <button 
                                            onClick={() => setRule({ ...rule, birthdayActive: !rule.birthdayActive })}
                                            className="focus:outline-none"
                                        >
                                            {rule?.birthdayActive ? (
                                                <ToggleRight className="h-10 w-10 text-primary fill-success-500/10" />
                                            ) : (
                                                <ToggleLeft className="h-10 w-10 text-slate-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Discount */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Birthday Discount (%)</label>
                                        <input 
                                            type="number"
                                            value={rule?.birthdayDiscount || 20}
                                            onChange={(e) => setRule({ ...rule, birthdayDiscount: parseFloat(e.target.value) })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Email Subject */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Subject</label>
                                        <input 
                                            type="text"
                                            value={rule?.birthdayEmailSubject || ''}
                                            onChange={(e) => setRule({ ...rule, birthdayEmailSubject: e.target.value })}
                                            placeholder="Happy Birthday {{customer_name}}!"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Email Content Snippet */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Template</label>
                                        <textarea 
                                            rows={4}
                                            value={rule?.birthdayEmailContent || ''}
                                            onChange={(e) => setRule({ ...rule, birthdayEmailContent: e.target.value })}
                                            placeholder="A little gift for your special day: {{promo_code}}"
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-medium text-xs focus:border-primary/50 outline-none transition-colors resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'referral' && (
                                <>
                                    {/* Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-border">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-bold text-white uppercase tracking-tight">Status</p>
                                            <p className="text-[10px] text-muted-foreground">Enable refer-a-friend system</p>
                                        </div>
                                        <button 
                                            onClick={() => setRule({ ...rule, referralActive: !rule.referralActive })}
                                            className="focus:outline-none"
                                        >
                                            {rule?.referralActive ? (
                                                <ToggleRight className="h-10 w-10 text-primary fill-success-500/10" />
                                            ) : (
                                                <ToggleLeft className="h-10 w-10 text-slate-600" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Reward for Referrer */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Points Reward for Referrer</label>
                                        <input 
                                            type="number"
                                            value={rule?.referralReward || 500}
                                            onChange={(e) => setRule({ ...rule, referralReward: parseFloat(e.target.value) })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                            placeholder="e.g. 500 points"
                                        />
                                    </div>

                                    {/* Reward for new Friend */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Points Reward for Referred Friend</label>
                                        <input 
                                            type="number"
                                            value={rule?.referralFriendReward || 200}
                                            onChange={(e) => setRule({ ...rule, referralFriendReward: parseFloat(e.target.value) })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                            placeholder="e.g. 200 points"
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'loyalty' && (
                                <>
                                    <div className="space-y-4 mb-6 pb-6 border-b border-border">
                                        <h3 className="text-white font-bold flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                            Earning Config
                                        </h3>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Currency to Point Multiplier</label>
                                            <input 
                                                type="number" step="0.1"
                                                value={settings?.loyaltyRatioEarning || 1.0}
                                                onChange={(e) => setSettings({ ...settings, loyaltyRatioEarning: parseFloat(e.target.value) })}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                                placeholder="e.g. 1.0 = 1 pt per $1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Point to Currency Value</label>
                                            <input 
                                                type="number" step="0.01"
                                                value={settings?.loyaltyRatioRedemption || 0.01}
                                                onChange={(e) => setSettings({ ...settings, loyaltyRatioRedemption: parseFloat(e.target.value) })}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white font-bold text-sm focus:border-primary/50 outline-none transition-colors"
                                                placeholder="e.g. 0.01 = 1 pt = $0.01"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-white font-bold flex items-center gap-2">
                                            <Gift className="h-4 w-4 text-purple-500" />
                                            Free Product Catalog
                                        </h3>
                                        <div className="flex gap-2">
                                            <select 
                                                value={newReward.productId}
                                                onChange={(e) => setNewReward({ ...newReward, productId: e.target.value })}
                                                className="flex-1 bg-background border border-border rounded-xl px-3 text-white text-xs py-3 max-w-[60%] outline-none"
                                            >
                                                <option value="">Select Product...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <input 
                                                type="number"
                                                placeholder="Cost"
                                                value={newReward.pointsCost}
                                                onChange={(e) => setNewReward({ ...newReward, pointsCost: e.target.value })}
                                                className="w-20 bg-background border border-border rounded-xl px-3 py-3 text-center text-white text-xs outline-none"
                                            />
                                            <button 
                                                onClick={handleAddReward}
                                                className="bg-purple-500 text-white p-3 rounded-xl hover:bg-purple-600 transition-colors shadow shadow-purple-500/20"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {rewards.map(r => (
                                                <div key={r.id} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border group">
                                                    <div>
                                                        <div className="text-xs font-bold text-white truncate max-w-[150px]">{r.product?.name}</div>
                                                        <div className="text-[10px] text-purple-400 font-black tracking-widest uppercase mt-0.5">{r.pointsCost} PTS</div>
                                                    </div>
                                                    <button onClick={() => handleDeleteReward(r.id)} className="text-muted-foreground hover:text-error-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {rewards.length === 0 && (
                                                <div className="text-center text-muted-foreground text-xs py-4 italic font-medium">No rewards in catalog</div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <button 
                                onClick={handleSaveRule}
                                disabled={saving}
                                className="w-full bg-primary hover:bg-primary disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/20 active:scale-95 uppercase tracking-widest text-xs"
                            >
                                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Settings
                            </button>
                        </div>
                    </div>

                    <div className="bg-warning-500/5 border border-warning-500/10 rounded-3xl p-6">
                        <div className="flex gap-4">
                            <AlertCircle className="h-5 w-5 text-warning-500 shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-warning-400">Pro Tip</h4>
                                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                                    Use <code className="text-warning-500">{"{{customer_name}}"}</code> to personalize your subject or body. Automation runs daily at 2 AM.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </FeatureGate>
    );
}
