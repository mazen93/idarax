'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Clock, ShieldCheck, Mail, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';

export default function OnboardingPendingPage() {
    const params = useParams();
    const router = useRouter();
    const locale = (params?.locale as string) || 'en';

    useEffect(() => {
        const isActive = localStorage.getItem('is_tenant_active') === 'true';
        if (isActive) {
            router.replace(`/${locale}/dashboard`);
        }
    }, [locale, router]);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('refresh_token');
        localStorage.clear();
        router.push(`/${locale}/login`);
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-white font-sans">
            <div className="max-w-xl w-full text-center space-y-12">
                {/* Visual Header */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="relative w-32 h-32 bg-[#111118] border border-white/10 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl">
                        <Clock className="w-16 h-16 text-primary animate-[pulse_3s_infinite]" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-success-500/10 border border-success-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <ShieldCheck className="w-6 h-6 text-success-500" />
                    </div>
                </div>

                <div className="space-y-6">
                    <h1 className="text-5xl font-black tracking-tight leading-tight">
                        Registration <span className="text-primary">Received</span>
                    </h1>
                    <p className="text-zinc-400 text-xl leading-relaxed max-w-lg mx-auto">
                        Your business profile is currently under review by our Super Admin team to ensure the best setup for your region.
                    </p>
                </div>

                {/* Steps/Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Step 1</h3>
                        <p className="text-zinc-300 text-sm">Our team verifies your VAT and business details for compliance.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Step 2</h3>
                        <p className="text-zinc-300 text-sm">Once approved, you'll receive a confirmation email with full access.</p>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3 text-zinc-500 text-sm">
                            <Mail className="w-4 h-4" />
                            <span>Contact support if you have any questions: <strong className="text-zinc-300">support@idarax.io</strong></span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
                        >
                            Check Status ✦
                        </button>
                        <button 
                            onClick={handleLogout}
                            className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-400 font-bold rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
