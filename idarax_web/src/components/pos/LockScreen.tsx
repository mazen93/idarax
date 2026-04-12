'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Lock, Delete, X, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

interface LockScreenProps {
    onUnlock: (userData?: any) => void;
    isRTL?: boolean;
    t?: any;
}

export default function LockScreen({ onUnlock, isRTL: propsIsRTL, t: propsT }: LockScreenProps) {
    const { t: contextT, isRTL: contextIsRTL } = useLanguage();
    const t = propsT || contextT;
    const isRTL = propsIsRTL || contextIsRTL;
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNumberClick = (num: string) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPin('');
    };

    const handleSubmit = async () => {
        if (pin.length < 6) return;

        setLoading(true);
        setError('');

        try {
            const tenantId = localStorage.getItem('tenant_id');
            if (!tenantId) {
                setError('Store ID not found. Please log in normally first.');
                return;
            }

            const res = await api.post('/auth/pin-login', { pin, tenantId });
            
            // Robust unwrapping: Handle both raw Axios response data and interceptor-unwrapped data
            // Also handle double-unwrapping if it ever happens
            let data = res.data;
            if (data && typeof data === 'object' && data.status !== undefined && data.data) {
                data = data.data;
            }

            if (!data || (!data.access_token && !res.data.access_token)) {
                setError('Invalid PIN');
                setPin('');
                return;
            }

            const token = data.access_token || res.data.access_token;
            const refreshToken = data.refresh_token || res.data.refresh_token;

            console.log('PIN Login Response:', { 
                hasToken: !!token, 
                tokenType: typeof token, 
                tokenVal: token === 'undefined' ? 'STRING_UNDEFINED' : (token ? 'PRESENT' : 'MISSING')
            });

            if (!token || String(token) === 'undefined' || String(token) === 'null') {
                console.error('Invalid token received:', token);
                setError('Authentication failed: No valid token received from server.');
                setPin('');
                return;
            }

            // Extract role and name with deep fallbacks (handle potential nesting)
            const resolvedRole = data.role || data.user?.role || data.roleName || '';
            const resolvedName = data.name || data.user?.name || '';

            // Save auth data with explicit string fallbacks and global path
            Cookies.set('token', token, { expires: 7, path: '/' });
            Cookies.set('refresh_token', refreshToken, { expires: 7, path: '/' });
            localStorage.setItem('token', token);
            localStorage.setItem('refresh_token', refreshToken);
            localStorage.setItem('user_role', resolvedRole ? String(resolvedRole) : '');
            localStorage.setItem('user_name', resolvedName ? String(resolvedName) : '');
            localStorage.setItem('user_permissions', JSON.stringify(data.permissions || data.user?.permissions || []));
            
            // Notify DashboardSidebar to re-sync immediately
            window.dispatchEvent(new Event('localStorageChanged'));
            
            if (data.branchId) {
                localStorage.setItem('branch_id', data.branchId);
                Cookies.set('branch_id', data.branchId, { expires: 7, path: '/' });
            }

            onUnlock(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid PIN or Connection error');
            setPin('');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pin.length === 6) {
            const timeout = setTimeout(handleSubmit, 300);
            return () => clearTimeout(timeout);
        }
    }, [pin]);

    return (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm space-y-8 text-center">
                <div className="space-y-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 mb-4 animate-bounce">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">{t('terminal_locked') || 'Terminal Locked'}</h2>
                    <p className="text-muted-foreground font-medium">{t('enter_pin_to_unlock') || 'Enter your PIN to start'}</p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-4 py-8">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <div
                            key={idx}
                            className={`w-4 h-4 rounded-full transition-all duration-200 ${pin.length > idx ? 'bg-primary scale-125 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-error-500/10 border border-error-500/20 text-error-400 py-3 rounded-2xl text-sm font-bold animate-in shake duration-300">
                        {error}
                    </div>
                )}

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="h-20 bg-card border border-border hover:border-primary/50 hover:bg-muted text-white text-2xl font-black rounded-3xl transition-all active:scale-95"
                        >
                            {num}
                        </button>
                    ))}
                    <button
                        onClick={handleClear}
                        className="h-20 bg-card border border-border hover:border-error-500/50 hover:bg-error-500/10 text-error-500 text-xl font-bold rounded-3xl transition-all active:scale-95"
                    >
                        {t('clear') || 'Clear'}
                    </button>
                    <button
                        onClick={() => handleNumberClick('0')}
                        className="h-20 bg-card border border-border hover:border-primary/50 hover:bg-muted text-white text-2xl font-black rounded-3xl transition-all active:scale-95"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-20 bg-card border border-border hover:border-slate-600 hover:bg-muted text-muted-foreground flex items-center justify-center rounded-3xl transition-all active:scale-95"
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                {loading && (
                    <div className="flex items-center justify-center gap-3 text-primary font-bold">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-success-500 rounded-full animate-spin" />
                        Verifying...
                    </div>
                )}

                <div className="pt-6">
                    <button
                        onClick={() => window.location.href = '/staff-login'}
                        className="text-muted-foreground hover:text-white text-sm font-bold transition-colors underline underline-offset-4"
                    >
                        {t('switch_account') || 'Login with Email instead'}
                    </button>
                </div>
            </div>
        </div>
    );
}
