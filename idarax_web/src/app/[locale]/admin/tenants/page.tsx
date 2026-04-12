'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Building2, Search, Plus, Users, ShoppingBag, Package, 
  ChevronDown, ChevronUp, X, Calendar, ShieldCheck, Clock,
  MoreHorizontal, Check, AlertCircle, TrendingUp
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Tenant {
  id: string; 
  name: string; 
  domain: string | null; 
  type: string; 
  createdAt: string;
  isTrial: boolean;
  trialExpiresAt: string | null;
  subscriptionExpiresAt: string | null;
  planId: string | null;
  branchCount: number;
  userCount: number;
  productCount: number;
  orderCount: number;
  country: string | null;
  countryCode: string | null;
  count: number;
  plan?: { name: string };
  users: { email: string; name: string }[];
  maxPos: number;
  maxBranches: number;
  maxUsers: number;
  isActive: boolean;
  status: string;
}

interface NewTenantForm {
  tenantName: string; adminEmail: string; adminPassword: string;
  adminFirstName: string; adminLastName: string; type: string;
  country: string; countryCode: string;
}

export default function TenantsDashboard() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isRtl = locale === 'ar';
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState('');
  
  const [form, setForm] = useState<NewTenantForm>({
    tenantName: '', adminEmail: '', adminPassword: '',
    adminFirstName: '', adminLastName: '', type: 'RESTAURANT',
    country: 'Saudi Arabia', countryCode: 'SA',
  });

  const [limitModal, setLimitModal] = useState<Tenant | null>(null);
  const [limitForm, setLimitForm] = useState({
    maxPos: 1,
    maxBranches: 1,
    maxUsers: 5,
    status: 'ACTIVE'
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, plansRes] = await Promise.all([
        fetch(`${API_URL}/superadmin/tenants?search=${search}&countryCode=${countryFilter}`, { headers }),
        fetch(`${API_URL}/cms/admin/plans`, { headers })
      ]);
      
      if (tenantsRes.ok) {
        const tData = await tenantsRes.json();
        setTenants(Array.isArray(tData) ? tData : (tData.data ?? []));
      }
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(Array.isArray(pData) ? pData : (pData.data ?? []));
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search, countryFilter]);

  const handleUpdateSubscription = async (tenantId: string, planId: string, days: number) => {
    try {
      const res = await fetch(`${API_URL}/superadmin/tenants/${tenantId}/subscription`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ planId, durationDays: days })
      });
      if (res.ok) {
        showToast('✅ Subscription updated');
        fetchData();
      }
    } catch { showToast('❌ Failed to update subscription'); }
  };

  const handleExtendTrial = async (tenantId: string, days: number) => {
    try {
      const res = await fetch(`${API_URL}/superadmin/tenants/${tenantId}/extend-trial`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ days })
      });
      if (res.ok) {
        showToast(`✅ Trial extended by ${days} days`);
        fetchData();
      }
    } catch { showToast('❌ Failed to extend trial'); }
  };

  const handleUpdateLimits = async () => {
    if (!limitModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/tenants/${limitModal.id}/limits`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(limitForm)
      });
      if (res.ok) {
        showToast('✅ Limits updated successfully');
        setLimitModal(null);
        fetchData();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }
    } catch (e: any) { showToast(`❌ ${e.message}`); }
    setSubmitting(false);
  };

  const registerTenant = async () => {
    if (!form.tenantName || !form.adminEmail || !form.adminPassword || !form.adminFirstName) {
      showToast('Please fill all required fields'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/cms/register`, { method: 'POST', headers, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setShowModal(false);
      setForm({ tenantName: '', adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '', type: 'RESTAURANT', country: 'Saudi Arabia', countryCode: 'SA' });
      showToast('✅ Tenant registered successfully!');
      fetchData();
    } catch (e: any) { showToast(`❌ ${e.message}`); }
    setSubmitting(false);
  };

  const filtered = tenants; // Backend handles filtering now

  const stats = [
    { label: isRtl ? 'إجمالي المستأجرين' : 'Total Tenants', value: tenants.length, icon: Building2, color: 'var(--primary)' },
    { label: isRtl ? 'إجمالي المستخدمين' : 'Total Users', value: tenants.reduce((a, t) => a + (t.userCount || 0), 0), icon: Users, color: 'var(--success)' },
    { label: isRtl ? 'إجمالي الطلبات' : 'Total Orders', value: tenants.reduce((a, t) => a + (t.orderCount || 0), 0), icon: ShoppingBag, color: 'var(--primary)' },
    { label: isRtl ? 'إجمالي المنتجات' : 'Total Products', value: tenants.reduce((a, t) => a + (t.productCount || 0), 0), icon: Package, color: 'var(--warning)' },
  ];

  const getDaysRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`text-slate-200 min-h-full ${isRtl ? 'rtl text-right' : 'ltr text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: isRtl ? 'auto' : 24, left: isRtl ? 24 : 'auto', zIndex: 9999, padding: '12px 24px', borderRadius: 10, background: toast.startsWith('✅') ? 'var(--success)' : 'var(--error)', color: '#fff', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            {isRtl ? 'المستأجرين والاشتراكات' : 'Tenants & Subscriptions'}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            {isRtl ? 'إدارة جميع الشركات المسجلة. عرض مقاييس الاستخدام والاشتراكات وتفاصيل المشرف.' : 'Manage all registered businesses. View usage metrics, subscriptions, and admin contacts.'}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
             <div className={`pointer-events-none absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input type="text" placeholder={isRtl ? 'بحث...' : 'Search businesses...'} value={search} onChange={e => setSearch(e.target.value)}
              className={`block w-full md:w-64 rounded-xl border-0 py-2.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-card text-white ring-1 ring-inset ring-white/5 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary-500 sm:text-sm`} />
          </div>
          
          <select 
            value={countryFilter} 
            onChange={e => setCountryFilter(e.target.value)}
            className="hidden md:block bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">{isRtl ? 'جميع الدول' : 'All Countries'}</option>
            <option value="SA">🇸🇦 {isRtl ? 'السعودية' : 'Saudi Arabia'}</option>
            <option value="AE">🇦🇪 {isRtl ? 'الإمارات' : 'UAE'}</option>
            <option value="EG">🇪🇬 {isRtl ? 'مصر' : 'Egypt'}</option>
            <option value="US">🇺🇸 {isRtl ? 'أمريكا' : 'USA'}</option>
          </select>

          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/20 active:scale-95">
            <Plus className="h-4 w-4" /> {isRtl ? 'تسجيل مستأجر' : 'Register Tenant'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card/50 p-6 hover:bg-white/5 transition-colors group">
            <div className={`flex items-center gap-3 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${color}15` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-3xl font-black text-white tracking-tight">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tenant list */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground font-medium">Loading platform data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-20 text-center">
          <Building2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-medium">{isRtl ? 'لا يوجد نتائج.' : 'No tenants found.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(tenant => {
            const tr = getDaysRemaining(tenant.trialExpiresAt);
            const sr = getDaysRemaining(tenant.subscriptionExpiresAt);
            return (
              <div key={tenant.id} className="rounded-2xl border border-border bg-card/40 overflow-hidden hover:border-border transition-colors">
                <div className={`flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-white/5 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
                  onClick={() => setExpanded(expanded === tenant.id ? null : tenant.id)}>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted border border-border group-hover:border-primary/50 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold text-white text-lg">{tenant.name}</span>
                      {tenant.isTrial ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-warning-500/10 text-warning-500 text-[10px] font-black uppercase tracking-wider border border-warning-500/20">
                          {isRtl ? 'فترة تجريبية' : 'TRIAL'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                          {tenant.plan?.name || (isRtl ? 'مشترك' : 'ACTIVE')}
                        </span>
                      )}
                    </div>
                    <p className={`text-muted-foreground text-sm mt-0.5 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                      <span className="truncate max-w-[150px]">{tenant.users?.[0]?.email || 'N/A'}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{tenant.country || 'N/A'}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className={`hidden lg:flex items-center gap-10 text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className="text-center"><p className="text-white font-black text-lg">{tenant.orderCount}</p><p className="text-muted-foreground font-bold text-xs uppercase">{isRtl ? 'الطلبات' : 'Orders'}</p></div>
                    <div className="text-center"><p className="text-white font-black text-lg">{tenant.branchCount}</p><p className="text-muted-foreground font-bold text-xs uppercase">{isRtl ? 'الفروع' : 'Branches'}</p></div>
                    <div className="text-center">
                        <p className={`font-black text-lg ${sr !== null && sr < 7 ? 'text-error-400' : 'text-primary'}`}>
                            {tenant.isTrial ? (tr ?? '∞') : (sr ?? '∞')}
                        </p>
                        <p className="text-muted-foreground font-bold text-xs uppercase">{isRtl ? 'يوم متبقي' : 'Days left'}</p>
                    </div>
                  </div>
                  <div className="text-slate-600">
                    {expanded === tenant.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                {expanded === tenant.id && (
                  <div className="border-t border-border px-8 py-8 bg-black/20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      {/* Left: Admin Users */}
                      <div>
                        <div className={`flex items-center gap-2 mb-6 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                            <Users className="w-4 h-4 text-primary" />
                            <h4 className="text-white font-extrabold text-sm uppercase tracking-widest">{isRtl ? 'مشرفي النظام' : 'Admin Users'}</h4>
                        </div>
                        <div className="space-y-4">
                            {tenant.users?.map((u, i) => (
                            <div key={i} className={`p-4 rounded-xl bg-white/5 border border-border hover:bg-white/10 transition-colors ${isRtl ? 'text-right' : ''}`}>
                                <p className="text-white font-bold">{u.name}</p>
                                <p className="text-muted-foreground text-sm">{u.email}</p>
                            </div>
                            ))}
                        </div>
                      </div>

                      {/* Middle: Usage Stats */}
                      <div>
                        <div className={`flex items-center gap-2 mb-6 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h4 className="text-white font-extrabold text-sm uppercase tracking-widest">{isRtl ? 'إحصائيات الاستخدام' : 'Usage Stats'}</h4>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: isRtl ? 'المستخدمين' : 'Total Users', val: tenant.userCount },
                                { label: isRtl ? 'المنتجات' : 'Total Products', val: tenant.productCount },
                                { label: isRtl ? 'الفروع' : 'Branches', val: tenant.branchCount },
                                { label: isRtl ? 'المعرف' : 'Tenant ID', val: tenant.id.slice(0, 8), mono: true },
                            ].map((s, i) => (
                                <div key={i} className={`flex justify-between items-center py-2 border-b border-border ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-muted-foreground font-medium">{s.label}</span>
                                    <span className={`text-white font-bold ${s.mono ? 'font-mono text-primary' : ''}`}>{s.val}</span>
                                </div>
                            ))}
                            <div className={`flex justify-between items-center py-2 border-b border-border border-dashed ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className="text-primary font-bold">{isRtl ? 'حد نقاط البيع' : 'Max POS Limit'}</span>
                                <span className="text-white font-black">{tenant.maxPos}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setLimitModal(tenant);
                                setLimitForm({
                                    maxPos: tenant.maxPos,
                                    maxBranches: tenant.maxBranches,
                                    maxUsers: tenant.maxUsers,
                                    status: tenant.status
                                });
                            }}
                            className="mt-4 w-full py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            {isRtl ? 'تعديل القيود' : 'Edit Manual Limits'}
                        </button>
                      </div>

                      {/* Right: Subscription Management */}
                      <div>
                        <div className={`flex items-center gap-2 mb-6 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                            <ShieldCheck className="w-4 h-4 text-warning-400" />
                            <h4 className="text-white font-extrabold text-sm uppercase tracking-widest">{isRtl ? 'إدارة الاشتراك' : 'Subscription'}</h4>
                        </div>
                        <div className="bg-muted/50 rounded-2xl p-6 border border-border">
                            <div className="mb-6">
                                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">{isRtl ? 'الخطة الحالية' : 'Current Plan'}</p>
                                <p className="text-white font-black text-xl">{tenant.plan?.name || (tenant.isTrial ? (isRtl ? 'تجريبي' : 'Trial') : (isRtl ? 'نشط' : 'Active'))}</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-muted-foreground text-xs font-bold uppercase block mb-2">{isRtl ? 'ترقية الخطة' : 'Assign New Plan'}</label>
                                    <select 
                                        className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm font-bold text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                        onChange={(e) => {
                                            if (e.target.value) handleUpdateSubscription(tenant.id, e.target.value, 30);
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>{isRtl ? 'اختر خطة...' : 'Select a plan...'}</option>
                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}/mo</option>)}
                                    </select>
                                </div>
                                <button 
                                    onClick={() => handleExtendTrial(tenant.id, 14)}
                                    className="w-full py-2.5 rounded-xl border border-warning-500/30 text-warning-500 font-bold text-sm bg-warning-500/5 hover:bg-warning-500/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" /> {isRtl ? 'تمديد الفترة التجريبية (14 يوم)' : 'Extend Trial (14 Days)'}
                                </button>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors"><X size={24} /></button>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                    <Plus className="w-7 h-7" />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-white">{isRtl ? 'تسجيل مستأجر جديد' : 'Register New Tenant'}</h2>
                   <p className="text-muted-foreground text-sm font-medium">{isRtl ? 'إنشاء حساب تجاري جديد على المنصة.' : 'Create a new business account on the platform.'}</p>
                </div>
            </div>

            <div className={`space-y-4 ${isRtl ? 'text-right' : ''}`}>
              <div>
                <label className={lbl_tw}>{isRtl ? 'اسم العمل *' : 'Business Name *'}</label>
                <input style={inp} value={form.tenantName} onChange={e => setForm({ ...form, tenantName: e.target.value })} placeholder="e.g. The Burger House" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl_tw}>{isRtl ? 'الاسم الأول *' : 'First Name *'}</label>
                  <input style={inp} value={form.adminFirstName} onChange={e => setForm({ ...form, adminFirstName: e.target.value })} placeholder="John" />
                </div>
                <div>
                  <label className={lbl_tw}>{isRtl ? 'الاسم الأخير' : 'Last Name'}</label>
                  <input style={inp} value={form.adminLastName} onChange={e => setForm({ ...form, adminLastName: e.target.value })} placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className={lbl_tw}>{isRtl ? 'البريد الإلكتروني للمشرف *' : 'Admin Email *'}</label>
                <input style={inp} type="email" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} placeholder="admin@business.com" />
              </div>
              <div>
                <label className={lbl_tw}>{isRtl ? 'كلمة المرور المؤقتة *' : 'Temporary Password *'}</label>
                <input style={inp} type="password" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} placeholder="Min 8 characters" />
              </div>
              <div>
                <label className={lbl_tw}>{isRtl ? 'نوع النشاط' : 'Business Type'}</label>
                <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="RESTAURANT">{isRtl ? 'مطعم' : 'Restaurant'}</option>
                  <option value="RETAIL">{isRtl ? 'تجزئة' : 'Retail'}</option>
                  <option value="CAFE">{isRtl ? 'مقهى' : 'Cafe'}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl_tw}>{isRtl ? 'الدولة' : 'Country'}</label>
                  <select 
                    style={inp} 
                    value={form.countryCode} 
                    onChange={e => {
                        const code = e.target.value;
                        const nameMap: Record<string, string> = { 'SA': 'Saudi Arabia', 'AE': 'UAE', 'EG': 'Egypt', 'US': 'USA' };
                        setForm({ ...form, countryCode: code, country: nameMap[code] || 'Other' });
                    }}
                  >
                    <option value="SA">🇸🇦 Saudi Arabia</option>
                    <option value="AE">🇦🇪 UAE</option>
                    <option value="EG">🇪🇬 Egypt</option>
                    <option value="US">🇺🇸 USA</option>
                  </select>
                </div>
                <div>
                   <label className={lbl_tw}>{isRtl ? 'الاسم المعروض' : 'Country Name'}</label>
                   <input style={inp} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={registerTenant} 
                disabled={submitting}
                className="flex-[2] py-4 rounded-2xl bg-primary hover:bg-primary text-white font-black text-lg transition-all shadow-xl shadow-primary-600/30 disabled:opacity-50 active:scale-95"
              >
                {submitting ? (isRtl ? 'جاري التسجيل...' : 'Registering...') : (isRtl ? 'إكمال التسجيل' : 'Complete Registration')}
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-muted-foreground font-bold hover:bg-white/10 transition-all">
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Limit Modal */}
      {limitModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            <button onClick={() => setLimitModal(null)} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors"><X size={20} /></button>
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">{isRtl ? 'تعديل قيود المستأجر' : 'Override Tenant Limits'}</h2>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-border mb-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{isRtl ? 'المستأجر' : 'Tenant'}</p>
                  <p className="text-white font-black">{limitModal.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl_tw}>{isRtl ? 'الحد الأقصى لنقاط البيع' : 'Max POS'}</label>
                  <input style={inp} type="number" value={limitForm.maxPos} onChange={e => setLimitForm({ ...limitForm, maxPos: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className={lbl_tw}>{isRtl ? 'الحد الأقصى للفروع' : 'Max Branches'}</label>
                  <input style={inp} type="number" value={limitForm.maxBranches} onChange={e => setLimitForm({ ...limitForm, maxBranches: parseInt(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className={lbl_tw}>{isRtl ? 'الحد الأقصى للمستخدمين' : 'Max Users'}</label>
                <input style={inp} type="number" value={limitForm.maxUsers} onChange={e => setLimitForm({ ...limitForm, maxUsers: parseInt(e.target.value) })} />
              </div>

              <div>
                <label className={lbl_tw}>{isRtl ? 'الحالة' : 'Status'}</label>
                <select style={inp} value={limitForm.status} onChange={e => setLimitForm({ ...limitForm, status: e.target.value })}>
                   <option value="ACTIVE">ACTIVE</option>
                   <option value="SUSPENDED">SUSPENDED</option>
                   <option value="PENDING">PENDING</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
               <button 
                onClick={handleUpdateLimits} 
                className="flex-1 py-3 bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-95 transition-all outline-none"
                disabled={submitting}
               >
                 {submitting ? '...' : (isRtl ? 'حفظ التغييرات' : 'Save Changes')}
               </button>
               <button onClick={() => setLimitModal(null)} className="px-6 py-3 bg-white/5 text-muted-foreground font-bold rounded-xl hover:bg-white/10">{isRtl ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', background: 'var(--background)', color: '#fff', fontSize: 15, fontWeight: 'bold', outline: 'none' };
const lbl_tw = "block text-muted-foreground text-[10px] font-black uppercase mb-1.5 tracking-widest";
