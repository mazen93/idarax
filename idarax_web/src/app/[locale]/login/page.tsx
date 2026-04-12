'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            const data = response.data;
            
            if (!data.access_token || String(data.access_token) === 'undefined') {
                setError('Invalid login response. No valid access token received.');
                return;
            }

            const token = String(data.access_token);
            const refreshToken = data.refresh_token ? String(data.refresh_token) : '';
            const resolvedTenantId = String(data.tenantId || '');

            Cookies.set('token', token, { expires: 7, path: '/' });
            Cookies.set('refresh_token', refreshToken, { expires: 7, path: '/' });
            Cookies.set('tenant_id', resolvedTenantId, { expires: 7, path: '/' });
            Cookies.set('user_role', String(data.role || ''), { expires: 7, path: '/' });
            
            localStorage.setItem('token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('tenant_id', resolvedTenantId);
            localStorage.setItem('user_role', String(data.role || ''));
            localStorage.setItem('user_name', String(data.name || ''));
            localStorage.setItem('user_permissions', JSON.stringify(data.permissions || []));
            localStorage.setItem('tenant_type', String(data.tenantType || 'RESTAURANT'));
            localStorage.setItem('user_features', JSON.stringify(data.features || []));
            localStorage.setItem('is_expired', String(data.isExpired || false));
            localStorage.setItem('days_remaining', String(data.daysRemaining || 1));
            localStorage.setItem('is_tenant_active', String(data.isTenantActive ?? true));
            localStorage.setItem('tenant_status', String(data.tenantStatus || 'ACTIVE'));
            localStorage.setItem('user_email', email.toLowerCase().trim());
            
            // Dispatch event for components to sync
            window.dispatchEvent(new Event('localStorageChanged'));

            // Role-based redirection
            const role = String(data.role || '');
            if (role === 'SUPER_ADMIN') {
                router.push(`/admin`);
            } else {
                router.push(`/dashboard`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 rounded-lg bg-gray-800 p-8 shadow-xl">
                <h1 className="text-center text-3xl font-bold text-deep-purple-400">{t('auth_title')}</h1>
                {error && <p className="text-error-500">{error}</p>}
                <input
                    type="email"
                    placeholder={t('email')}
                    className="w-full rounded bg-gray-700 p-2 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder={t('password')}
                    className="w-full rounded bg-gray-700 p-2 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="w-full rounded bg-primary p-2 font-bold hover:bg-primary-700">
                    {t('login_btn')}
                </button>
            </form>
        </div>
    );
}
