'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Play, Landmark, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface ShiftAndDrawerSetupProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
    userName?: string;
    t?: any;
    isRTL?: boolean;
}

export default function ShiftAndDrawerSetup({ isOpen, onClose, onComplete, userName, t: propsT, isRTL: propsIsRTL }: ShiftAndDrawerSetupProps) {
    const { t: contextT } = useLanguage();
    const t = propsT || contextT;

    if (!isOpen) return null;

    const [checking, setChecking] = useState(true);
    const [hasShift, setHasShift] = useState(false);
    const [hasDrawer, setHasDrawer] = useState(false);

    const [clockingIn, setClockingIn] = useState(false);
    const [openingDrawer, setOpeningDrawer] = useState(false);
    const [openingBalance, setOpeningBalance] = useState('');
    const [openNote, setOpenNote] = useState('');
    const [error, setError] = useState('');

    // Check current shift and drawer status
    const checkStatus = async () => {
        setChecking(true);
        setError('');
        try {
            const [shiftRes, drawerRes] = await Promise.all([
                api.get('/staff/shifts/current'),
                api.get('/staff/drawer/current'),
            ]);

            const shiftObj = shiftRes.data?.shift || shiftRes.data;
            const drawerObj = drawerRes.data;

            const shiftOpen = shiftObj && shiftObj.status === 'OPEN';
            const drawerOpen = drawerObj && drawerObj.status === 'OPEN';

            setHasShift(shiftOpen);
            setHasDrawer(drawerOpen);

            // If both are done, complete immediately
            if (shiftOpen && drawerOpen) {
                onComplete();
            }
        } catch {
            setError('Failed to check status. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        checkStatus();
    }, []);

    const handleClockIn = async () => {
        setClockingIn(true);
        setError('');
        try {
            const res = await api.post('/staff/shifts/clock-in', {});
            if (res.status === 200 || res.status === 201) {
                setHasShift(true);
            } else {
                setError('Failed to clock in. Please try again.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to clock in. Please try again.');
        } finally {
            setClockingIn(false);
        }
    };

    const handleOpenDrawer = async () => {
        if (!openingBalance) { setError('Please enter an opening balance.'); return; }
        setOpeningDrawer(true);
        setError('');
        try {
            const rawBranch = typeof window !== 'undefined' ? localStorage.getItem('branch_id') : null;
            const branchId = (rawBranch && rawBranch !== 'null' && rawBranch !== 'undefined' && rawBranch.trim() !== '') ? rawBranch : undefined;

            const res = await api.post('/staff/drawer/open', {
                openingBalance: parseFloat(openingBalance),
                note: openNote,
                branchId: branchId || undefined
            });

            if (res.status === 200 || res.status === 201) {
                setHasDrawer(true);
                // Both steps complete — allow POS access
                onComplete();
            } else {
                setError('Failed to open drawer. Please try again.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to open drawer. Please try again.');
        } finally {
            setOpeningDrawer(false);
        }
    };

    const step1Done = hasShift;
    const step2Active = step1Done && !hasDrawer;

    return (
        <div className="fixed inset-0 z-[200] bg-background/98 backdrop-blur-xl flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        {t('welcome_back') || 'Welcome back'}{userName ? `, ${userName}` : ''}!
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">
                        {t('setup_required') || 'Please complete setup before taking orders.'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 justify-center">
                    {[
                        { label: t('clock_in') || 'Clock In', done: hasShift, num: 1 },
                        { label: t('open_drawer') || 'Open Drawer', done: hasDrawer, num: 2 },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all
                                ${s.done
                                    ? 'bg-primary/20 border-primary/40 text-primary'
                                    : 'bg-muted border-slate-700 text-muted-foreground'}`}
                            >
                                {s.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 flex items-center justify-center">{s.num}</span>}
                                {s.label}
                            </div>
                            {i < 1 && <div className="w-8 h-px bg-muted-foreground" />}
                        </div>
                    ))}
                </div>

                {/* Content Card */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {checking ? (
                        <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground text-sm font-medium">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t('checking_status') || 'Checking status...'}
                        </div>
                    ) : !hasShift ? (
                        /* Step 1: Clock In */
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Play className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{t('start_your_shift') || 'Start Your Shift'}</h3>
                                    <p className="text-muted-foreground text-xs">{t('clock_in_description') || 'Clock in to begin your work session.'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClockIn}
                                disabled={clockingIn}
                                className="w-full py-3 bg-primary hover:bg-primary active:scale-95 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                            >
                                {clockingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                {clockingIn ? (t('clocking_in') || 'Clocking in...') : (t('clock_in') || 'Clock In')}
                            </button>
                        </div>
                    ) : !hasDrawer ? (
                        /* Step 2: Open Drawer */
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center flex-shrink-0">
                                    <Landmark className="h-5 w-5 text-warning-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">{t('open_cash_drawer') || 'Open Cash Drawer'}</h3>
                                    <p className="text-muted-foreground text-xs">{t('enter_opening_balance_description') || 'Count your starting cash and enter the amount.'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    placeholder={t('opening_balance_placeholder') || 'Opening Balance (e.g. 200.00)'}
                                    value={openingBalance}
                                    onChange={e => setOpeningBalance(e.target.value)}
                                    className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-warning-500 text-lg"
                                    autoFocus
                                />
                                <input
                                    placeholder={t('note_optional') || 'Note (optional)'}
                                    value={openNote}
                                    onChange={e => setOpenNote(e.target.value)}
                                    className="w-full bg-background border border-slate-700 rounded-xl px-4 py-2.5 text-slate-300 text-sm outline-none focus:border-slate-500"
                                />
                            </div>
                            <button
                                onClick={handleOpenDrawer}
                                disabled={openingDrawer || !openingBalance}
                                className="w-full py-3 bg-warning-500 hover:bg-warning-400 active:scale-95 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                            >
                                {openingDrawer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
                                {openingDrawer ? (t('opening') || 'Opening...') : (t('open_drawer') || 'Open Drawer')}
                            </button>
                        </div>
                    ) : null}

                    {/* Error */}
                    {error && (
                        <div className="px-6 pb-4 flex items-center gap-2 text-error-400 text-sm font-medium">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Shift already done indicator */}
                {step1Done && (
                    <div className="flex items-center gap-2 justify-center text-xs text-primary font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t('shift_started') || 'Shift started — great!'}
                    </div>
                )}
            </div>
        </div>
    );
}
