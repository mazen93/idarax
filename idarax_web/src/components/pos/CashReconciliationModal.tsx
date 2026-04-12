'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
    X, 
    Calculator, 
    AlertTriangle, 
    CheckCircle2, 
    Loader2, 
    ShieldCheck, 
    History,
    TrendingUp,
    TrendingDown,
    Banknote
} from 'lucide-react';

interface CashReconciliationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    t: any;
    isRTL?: boolean;
}

export default function CashReconciliationModal({ 
    isOpen, 
    onClose, 
    onSuccess, 
    t, 
    isRTL 
}: CashReconciliationModalProps) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [actualBalance, setActualBalance] = useState<string>('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [closing, setClosing] = useState(false);
    
    // Manager authorization state
    const [showManagerAuth, setShowManagerAuth] = useState(false);
    const [managerPin, setManagerPin] = useState('');
    const [discrepancyLimit] = useState(5); // threshold for manager PIN

    useEffect(() => {
        if (isOpen) {
            fetchSession();
        }
    }, [isOpen]);

    const fetchSession = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/staff/drawer/current');
            setSession(res.data);
            // Default actual balance to expected for convenience, though counting is better
            if (res.data?.runningBalance !== undefined) {
                // setActualBalance(res.data.runningBalance.toString());
            }
        } catch (err: any) {
            setError(t('failed_to_fetch_session') || 'Failed to fetch session details');
        } finally {
            setLoading(false);
        }
    };

    const expectedBalance = session?.runningBalance || 0;
    const numericActual = parseFloat(actualBalance) || 0;
    const discrepancy = numericActual - expectedBalance;
    const isDiscrepancySignificant = Math.abs(discrepancy) > discrepancyLimit;

    const handleCloseDrawer = async () => {
        if (actualBalance === '') {
            setError(t('please_enter_actual_balance') || 'Please enter the actual physical cash count');
            return;
        }

        if (isDiscrepancySignificant && !managerPin) {
            setShowManagerAuth(true);
            return;
        }

        setClosing(true);
        setError('');
        try {
            await api.post('/staff/drawer/close', {
                closingBalance: numericActual,
                note: note || (isDiscrepancySignificant ? `Significant discrepancy: ${discrepancy.toFixed(2)}` : ''),
                managerPin: managerPin || undefined
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || t('failed_to_close_drawer') || 'Failed to close drawer');
        } finally {
            setClosing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="bg-card border border-border w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-warning-500/10 flex items-center justify-center border border-warning-500/20">
                            <Landmark className="h-5 w-5 text-warning-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg uppercase tracking-tight">{t('cash_reconciliation') || 'Cash Reconciliation'}</h3>
                            <p className="text-muted-foreground text-xs font-medium">{t('end_of_shift_report') || 'End of shift financial summary'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-warning-500" />
                            <span className="font-medium">{t('calculating_totals') || 'Calculating totals...'}</span>
                        </div>
                    ) : error ? (
                        <div className="py-10 text-center space-y-4">
                            <div className="h-12 w-12 rounded-full bg-error-500/10 flex items-center justify-center mx-auto border border-error-500/20">
                                <AlertTriangle className="h-6 w-6 text-error-500" />
                            </div>
                            <p className="text-error-400 font-medium">{error}</p>
                            <button onClick={fetchSession} className="px-4 py-2 bg-muted text-white text-sm font-bold rounded-xl hover:bg-muted-foreground">
                                {t('retry') || 'Retry'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-background/50 border border-border rounded-2xl space-y-1">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <History className="h-3 w-3" />
                                        {t('opening_balance') || 'Opening'}
                                    </span>
                                    <p className="text-xl font-black text-white">{session?.openingBalance?.toLocaleString() || '0.00'}</p>
                                </div>
                                <div className="p-4 bg-background/50 border border-border rounded-2xl space-y-1">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                        <TrendingUp className="h-3 w-3" />
                                        {t('net_cash_flow') || 'Cash Sales'}
                                    </span>
                                    <p className="text-xl font-black text-white">
                                        {(expectedBalance - Number(session?.openingBalance || 0)).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Expected Box */}
                            <div className="p-5 bg-warning-500/5 border border-warning-500/20 rounded-2xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-black text-warning-500/60 uppercase tracking-widest">{t('expected_in_drawer') || 'Expected In Drawer'}</span>
                                    <h4 className="text-3xl font-black text-warning-500 tracking-tighter">{expectedBalance.toLocaleString()}</h4>
                                </div>
                                <Calculator className="h-10 w-10 text-warning-500/20" />
                            </div>

                            {/* Actual Count Input */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">{t('actual_physical_count') || 'Actual Physical Count'}</label>
                                <div className="relative">
                                    <Banknote className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 ${isRTL ? 'right-4' : 'left-4'}`} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={actualBalance}
                                        onChange={(e) => setActualBalance(e.target.value)}
                                        className={`w-full bg-background border-2 border-border focus:border-warning-500 rounded-2xl py-4 font-black text-2xl text-white outline-none transition-all ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Discrepancy Display */}
                            {actualBalance !== '' && (
                                <div className={`p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300 ${
                                    discrepancy === 0 
                                    ? 'bg-primary/10 border border-primary/20 text-primary' 
                                    : Math.abs(discrepancy) <= discrepancyLimit
                                        ? 'bg-warning-500/10 border border-warning-500/20 text-warning-500'
                                        : 'bg-error-500/10 border border-error-500/20 text-error-500'
                                }`}>
                                    <div className="flex items-center gap-3">
                                        {discrepancy === 0 ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-wider">
                                                {discrepancy === 0 
                                                    ? (t('perfectly_balanced') || 'Balanced') 
                                                    : discrepancy > 0 ? (t('overage') || 'Overage') : (t('shortage') || 'Shortage')}
                                            </p>
                                            <p className="text-lg font-black">{discrepancy.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {isDiscrepancySignificant && (
                                        <div className="flex items-center gap-1 text-[10px] font-black bg-error-500 text-white px-2 py-1 rounded-lg uppercase">
                                            <ShieldCheck className="h-3 w-3" />
                                            {t('manager_required') || 'Manager Req.'}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Note */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">{t('reconciliation_note') || 'Notes'}</label>
                                <textarea
                                    placeholder={t('reason_for_discrepancy') || 'Any notes or reasons for discrepancy...'}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl p-3 text-slate-300 text-sm outline-none focus:border-slate-700 min-h-[80px] resize-none"
                                />
                            </div>

                            {/* Manager/Admin PIN if significant */}
                            {showManagerAuth && (
                                <div className="p-4 bg-muted/50 border border-slate-700 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center gap-3 text-warning-400">
                                        <ShieldCheck className="h-5 w-5" />
                                        <h4 className="font-bold text-sm tracking-tight">{t('manager_authorization_required') || 'Manager Authorization Required'}</h4>
                                    </div>
                                    <input
                                        type="password"
                                        placeholder={t('enter_manager_pin') || 'Enter Manager PIN'}
                                        value={managerPin}
                                        onChange={(e) => setManagerPin(e.target.value)}
                                        className="w-full bg-background border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-center tracking-[1em] text-xl focus:border-warning-500 outline-none"
                                        maxLength={6}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-muted hover:bg-muted-foreground text-slate-300 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                                >
                                    {t('cancel') || 'Cancel'}
                                </button>
                                <button
                                    onClick={handleCloseDrawer}
                                    disabled={closing || (isDiscrepancySignificant && !showManagerAuth)}
                                    className={`flex-[2] py-4 font-black rounded-2xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                                        isDiscrepancySignificant && !showManagerAuth && managerPin === ''
                                        ? 'bg-warning-500/20 text-warning-500/50 cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary text-white shadow-lg shadow-success-900/20 active:scale-95'
                                    }`}
                                >
                                    {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    {showManagerAuth ? (t('authorize_and_close') || 'Authorize & Close') : (t('finish_reconciliation') || 'Finish & Close Drawer')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Landmark icon fallback since Lucide sometimes differs
function Landmark({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <line x1="3" y1="22" x2="21" y2="22"></line>
            <line x1="6" y1="18" x2="6" y2="11"></line>
            <line x1="10" y1="18" x2="10" y2="11"></line>
            <line x1="14" y1="18" x2="14" y2="11"></line>
            <line x1="18" y1="18" x2="18" y2="11"></line>
            <polygon points="12 2 3 7 21 7 12 2"></polygon>
        </svg>
    );
}
