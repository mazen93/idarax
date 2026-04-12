"use client";

import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from './LanguageContext';

interface ManagerOverrideModalProps {
    action: string;
    onSuccess: (overrideToken: string) => void;
    onCancel: () => void;
}

export default function ManagerOverrideModal({ action, onSuccess, onCancel }: ManagerOverrideModalProps) {
    const { t } = useLanguage();
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pin) return;

        setLoading(true);
        setError('');

        try {
            const tenantId = localStorage.getItem('tenant_id') || '';
            const res = await api.post('/auth/verify-override', { pin, tenantId, action });
            
            if (res.data?.override_token) {
                onSuccess(res.data.override_token);
            } else {
                setError(t('invalid_pin') || 'Invalid PIN or insufficient permissions');
            }
        } catch (err: any) {
            console.error('Override error:', err);
            setError(err.response?.data?.message || t('invalid_pin') || 'Invalid PIN or insufficient permissions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-card/90 border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="h-1 w-full bg-warning-500" />
                
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 bg-background/50 rounded-2xl border border-warning-500/30">
                            <ShieldAlert size={32} className="text-warning-500" />
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                {t('manager_override') || 'Manager Override'}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
                                {t('manager_pin_required') || 'This action requires manager approval. Please enter a Manager PIN.'}
                                <br/>
                                <span className="text-xs opacity-70 mt-1 block font-mono">Action: {action}</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="password"
                            autoFocus
                            value={pin}
                            placeholder="****"
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-center text-white tracking-[0.5em] font-black text-xl outline-none focus:border-warning-500/50 transition-colors"
                        />
                    </div>

                    {error && (
                        <p className="mt-3 text-error-500 text-xs font-bold text-center">{error}</p>
                    )}

                    <div className="mt-8 flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={loading || !pin}
                            className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-warning-600 hover:bg-warning-500 shadow-warning-500/20 rounded-xl text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (t('verify') || 'Verify')}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl text-xs font-bold transition-all"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
