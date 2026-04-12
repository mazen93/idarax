'use client';

import { useState } from 'react';
import { usePosDevice } from '@/hooks/usePosDevice';
import { Monitor, ShieldAlert, CheckCircle2, Loader2, XCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function PosDeviceGate({ children }: { children: React.ReactNode }) {
    const { t, isRTL } = useLanguage();
    const { 
        isRegistered, 
        loading, 
        limitReached, 
        registerDevice, 
        deactivateOtherDevice,
        recheck 
    } = usePosDevice();

    const [deviceName, setDeviceName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!deviceName.trim()) {
            setError('Please enter a name for this device');
            return;
        }
        setSubmitting(true);
        setError('');
        const res = await registerDevice(deviceName);
        if (!res.success) {
            setError(res.error || 'Registration failed');
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium animate-pulse">Initializing POS Security...</p>
            </div>
        );
    }

    if (isRegistered) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[300] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-6 text-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col">
                
                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500" />

                <div className="p-8 lg:p-12 space-y-8">
                    {limitReached ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                    <ShieldAlert className="h-10 w-10 text-red-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-white">POS Limit Reached</h2>
                                    <p className="text-zinc-400 font-medium max-w-md">
                                        Your subscription allows for <b className="text-white">{limitReached.limit}</b> POS device(s). 
                                        Please deactivate an existing device to register this one.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Active Devices</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {limitReached.activeDevices.map((dev: any) => (
                                        <div key={dev.id} className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                                                    <Monitor className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-zinc-200">{dev.name}</p>
                                                    <p className="text-[10px] text-zinc-500 font-medium">Last active: {new Date(dev.lastSeenAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    if (confirm(`Are you sure you want to deactivate "${dev.name}"?`)) {
                                                        await deactivateOtherDevice(dev.id);
                                                        recheck();
                                                    }
                                                }}
                                                className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all"
                                                title="Deactivate Device"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={recheck}
                                className="w-full py-4 bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Monitor className="h-10 w-10 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black tracking-tight text-white">Register POS Device</h2>
                                    <p className="text-zinc-400 font-medium max-w-md">
                                        This device is not yet registered. Give it a name to identify it in your dashboard.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Device Name</label>
                                    <input 
                                        placeholder="e.g. Main Counter, iPad 01..."
                                        value={deviceName}
                                        onChange={(e) => setDeviceName(e.target.value)}
                                        className="w-full h-14 bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 font-bold text-lg text-white focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-center"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                        <XCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <button 
                                    onClick={handleRegister}
                                    disabled={submitting || !deviceName.trim()}
                                    className="w-full h-16 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 text-lg uppercase tracking-wider"
                                >
                                    {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                                    {submitting ? (t('registering') || 'Registering...') : (t('activate_device') || 'Activate Device')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
