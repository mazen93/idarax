'use client';

import { useState } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';
import { Landmark, Eye, EyeOff, AlertCircle, ShoppingCart } from 'lucide-react';

export default function StaffLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const t = useTranslations();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Use the centralized api client, but override headers for tenant-id if needed
            // Actually, the api client uses Cookies.get('tenant_id'), but we haven't set it yet.
            // We'll pass it manually if required or set cookie first.

            const res = await api.post('/auth/login',
                { email, password },
                { headers: { 'x-tenant-id': tenantId } }
            );

            // Robust unwrapping: Handle both raw Axios response data and interceptor-unwrapped data
            let data = res.data;
            if (data && typeof data === 'object' && data.status !== undefined && data.data) {
                data = data.data;
            }

            // Verify we have a valid response and permissions
            if (!data.access_token) {
                setError('Invalid login response. Please contact support.');
                return;
            }

            // Extract role, name and permissions with deep fallbacks (handle potential nesting)
            const role = data.role || data.user?.role || data.roleName || 'Staff';
            const name = data.name || data.user?.name || '';
            const permissions = Array.isArray(data.permissions) 
                ? data.permissions.map((p: any) => typeof p === 'string' ? p : p.action)
                : Array.isArray(data.user?.permissions)
                    ? data.user.permissions.map((p: any) => typeof p === 'string' ? p : p.action)
                    : [];

            // Since we use custom roles now, we check if the user has basic access permissions
            // instead of hardcoded role name strings.
            const hasAccess = permissions.length > 0 || ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(String(role).toUpperCase());
            
            if (!hasAccess) {
                setError('You do not have any permissions assigned to your account.');
                return;
            }

            if (!data.access_token || String(data.access_token) === 'undefined') {
                setError('Invalid login response. No valid token found.');
                return;
            }

            // Save auth data with explicit string fallbacks
            const token = String(data.access_token);
            const refreshToken = data.refresh_token ? String(data.refresh_token) : '';

            Cookies.set('token', token, { expires: 7, path: '/' });
            Cookies.set('refresh_token', refreshToken, { expires: 7, path: '/' });
            Cookies.set('tenant_id', tenantId, { expires: 7, path: '/' });
            if (role) {
                Cookies.set('user_role', String(role), { expires: 7, path: '/' });
            }

            localStorage.setItem('token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('tenant_id', tenantId);
            localStorage.setItem('user_role', role ? String(role) : '');
            localStorage.setItem('user_name', name ? String(name) : '');
            localStorage.setItem('user_permissions', JSON.stringify(permissions));
            localStorage.setItem('user_features', JSON.stringify(data.features || []));
            localStorage.setItem('is_expired', String(data.isExpired || false));
            localStorage.setItem('days_remaining', String(data.daysRemaining || 1));
            localStorage.setItem('is_tenant_active', String(data.isTenantActive ?? true));
            localStorage.setItem('tenant_status', String(data.tenantStatus || 'ACTIVE'));
            localStorage.setItem('tenant_type', String(data.tenantType || 'RESTAURANT'));

            if (data.branchId) {
                localStorage.setItem('branch_id', data.branchId);
                Cookies.set('branch_id', data.branchId, { expires: 7, path: '/' });
            }

            // Dispatch event for components to sync
            window.dispatchEvent(new Event('localStorageChanged'));

            // Lock the screen immediately for terminal setup
            localStorage.setItem('pos_locked', 'true');

            // Route to POS where the LockScreen will be displayed
            router.push('/dashboard/pos');
        } catch {
            setError('Connection failed. Please check your network and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-success-950 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-2xl shadow-success-900/60 ring-4 ring-success-400/20">
                        <ShoppingCart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{t('staff_portal')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">{t('staff_portal_desc')}</p>
                </div>

                {/* Card */}
                <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Tenant ID */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('store_id')}</label>
                            <input
                                id="tenantId"
                                type="text"
                                placeholder={t('store_id_placeholder')}
                                value={tenantId}
                                onChange={e => setTenantId(e.target.value)}
                                required
                                className="w-full bg-muted/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-primary/60 focus:bg-muted focus:ring-2 focus:ring-success-500/20 transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('email_address')}</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="cashier@yourstore.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className="w-full bg-muted/60 border border-slate-700/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 outline-none focus:border-primary/60 focus:bg-muted focus:ring-2 focus:ring-success-500/20 transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('password')}</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-muted/60 border border-slate-700/60 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-slate-500 outline-none focus:border-primary/60 focus:bg-muted focus:ring-2 focus:ring-success-500/20 transition-all text-sm font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-3 bg-error-500/10 border border-error-500/30 rounded-xl px-4 py-3 text-error-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="login-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-4 font-black text-sm uppercase tracking-wider shadow-2xl shadow-success-900/40 transition-all duration-200 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <Landmark className="w-4 h-4" />
                                    {t('login_btn')}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Admin link */}
                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-slate-600 text-xs">
                            {t('store_manager_q')}{' '}
                            <Link href="/login" className="text-primary hover:text-primary font-bold transition-colors">
                                {t('admin_login_link')} →
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6 font-medium">
                    {t('staff_access_portal')}
                </p>
            </div>
        </div>
    );
}
