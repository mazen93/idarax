'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { selfRegister } from '../../lib/public-api';

interface Props {
    isOpen?: boolean;
    onClose: () => void;
    initialPlanId?: string;
    plans?: any[];
    cTheme?: any;
}

export default function RegisterModal({ initialPlanId, onClose, plans, cTheme }: Props) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '', tenantName: '',
        country: '', countryCode: '', vatNumber: '',
    });

    const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        if (!form.adminEmail || !form.adminPassword || !form.tenantName) {
            setError('Please fill all required fields.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await selfRegister({ ...form, planId: initialPlanId });
            setStep(3); // Success
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Registration failed. Please try again.');
        }
        setLoading(false);
    };

    const brandBg = cTheme?.bg600 || 'bg-primary';
    const brandText = cTheme?.text600 || 'text-success-600';

    return (
        <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[#111118] border border-border rounded-[32px] p-10 w-full max-w-lg shadow-2xl">
                {step < 3 ? <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <div className={`${brandText} text-xs font-bold uppercase tracking-widest mb-1`}>Step {step} of 2</div>
                            <h2 className="text-white text-3xl font-black">{step === 1 ? 'Create account' : 'Business details'}</h2>
                        </div>
                        <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors text-2xl">✕</button>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden">
                        <div 
                            className={`h-full ${brandBg} transition-all duration-500`} 
                            style={{ width: step === 1 ? '50%' : '100%' }} 
                        />
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">First Name</label>
                                    <input value={form.adminFirstName} onChange={e => update('adminFirstName', e.target.value)} placeholder="Jane" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Last Name</label>
                                    <input value={form.adminLastName} onChange={e => update('adminLastName', e.target.value)} placeholder="Doe" className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Email Address *</label>
                                <input value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} placeholder="jane@business.com" type="email" className={inputClass} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Password *</label>
                                <input value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} placeholder="Min. 8 characters" type="password" className={inputClass} />
                            </div>
                            <button 
                                onClick={() => { if (!form.adminEmail || !form.adminPassword) { setError('Email and password are required.'); return; } setError(''); setStep(2); }} 
                                className={`w-full py-4 rounded-xl ${brandBg} text-white font-bold text-lg shadow-xl transition-all hover:-translate-y-1 active:scale-95`}
                            >
                                Continue →
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Business Name *</label>
                                    <input value={form.tenantName} onChange={e => update('tenantName', e.target.value)} placeholder="My Restaurant" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Country *</label>
                                    <select 
                                        value={form.country} 
                                        onChange={e => {
                                            const c = COUNTRIES.find(x => x.name === e.target.value);
                                            setForm(prev => ({ ...prev, country: e.target.value, countryCode: c?.code || '??' }));
                                        }} 
                                        className={inputClass}
                                    >
                                        <option value="">Select Country</option>
                                        {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">VAT / Tax Number (Optional)</label>
                                <input value={form.vatNumber} onChange={e => update('vatNumber', e.target.value)} placeholder="e.g. 300012345600003" className={inputClass} />
                            </div>
                            {initialPlanId && (
                                <div className="p-4 rounded-xl bg-white/5 border border-border text-xs text-slate-300 flex items-center gap-3">
                                    <span className="text-xl">✦</span>
                                    <span>Selected plan will be activated after account creation.</span>
                                </div>
                            )}
                            {error && <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm">{error}</div>}
                            <button 
                                onClick={handleSubmit} 
                                disabled={loading} 
                                className={`w-full py-4 rounded-xl ${brandBg} text-white font-bold text-lg shadow-xl transition-all hover:-translate-y-1 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Creating account...' : 'Complete Registration ✦'}
                            </button>
                            <button onClick={() => setStep(1)} className="w-full text-muted-foreground hover:text-white transition-colors font-bold text-sm">← Go back</button>
                        </div>
                    )}
                    {error && step === 1 && <div className="mt-6 p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm">{error}</div>}
                </> : (
                    <div className="text-center py-6">
                        <div className="text-7xl mb-6">🎉</div>
                        <h2 className="text-white text-3xl font-black mb-4">Welcome to Idarax!</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-8">Your account has been created. Check your email for the verification link, then sign in to start your free trial.</p>
                        <Link 
                            href="/login" 
                            className={`inline-block px-10 py-4 rounded-xl ${brandBg} text-white font-bold text-lg shadow-xl transition-all hover:-translate-y-1`}
                        >
                            Go to Dashboard →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

const inputClass = "w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all";

const COUNTRIES = [
    { name: 'Saudi Arabia', code: 'SA' },
    { name: 'United Arab Emirates', code: 'AE' },
    { name: 'Egypt', code: 'EG' },
    { name: 'Jordan', code: 'JO' },
    { name: 'Kuwait', code: 'KW' },
    { name: 'Qatar', code: 'QA' },
    { name: 'Oman', code: 'OM' },
    { name: 'Bahrain', code: 'BH' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'United States', code: 'US' },
];
