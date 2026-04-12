'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coffee, Play, Square } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') || '' : '';
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
    };
};

/** Returns milliseconds of completed break time (breaks with both start and end). */
function completedBreakMs(breaks: any[]): number {
    return breaks.reduce((acc: number, b: any) => {
        if (b.startTime && b.endTime) {
            return acc + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime());
        }
        return acc;
    }, 0);
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function ShiftClock() {
    const { t } = useLanguage();
    const [shift, setShift] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [timer, setTimer] = useState('00:00:00');
    const [serverOffset, setServerOffset] = useState(0); // Difference: ServerTime - ClientTime
    const [confirmingClockOut, setConfirmingClockOut] = useState(false);

    const fetchCurrentShift = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/staff/shifts/current`, { headers: getHeaders() });
            if (res.ok) {
                const text = await res.text();
                const parsed = text && text !== 'null' ? JSON.parse(text) : null;
                const data = parsed?.data || parsed; // Handle NestJS generic API wrapper
                
                if (data && data.shift !== undefined) {
                    setShift(data.shift);
                    if (data.serverTime) {
                        const sTime = new Date(data.serverTime).getTime();
                        const cTime = Date.now();
                        setServerOffset(sTime - cTime);
                    }
                } else {
                    setShift(data);
                }
            } else {
                setShift(null);
            }
        } catch (err) {
            console.error('Failed to fetch shift', err);
            setShift(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCurrentShift();
        // Poll every 60s to pick up remote clock-out, breaks, etc.
        const poll = setInterval(fetchCurrentShift, 60_000);
        return () => clearInterval(poll);
    }, [fetchCurrentShift]);

    useEffect(() => {
        if (!shift || shift.status !== 'OPEN') {
            setTimer('00:00:00');
            return;
        }

        const updateTimer = () => {
            const now = Date.now() + serverOffset;
            const start = new Date(shift.startTime).getTime();
            
            // Basic shift duration
            let durationMs = now - start;
            
            // Subtract completed breaks
            const completedBs = completedBreakMs(shift.breaks || []);
            durationMs -= completedBs;
            
            // If currently on an open break, subtract the ongoing break time as well
            const openBreak = shift.breaks?.find((b: any) => b.startTime && !b.endTime);
            if (openBreak) {
                const ongoingBreakMs = now - new Date(openBreak.startTime).getTime();
                durationMs -= ongoingBreakMs;
            }
            
            // Protect against negative duration (client clock slightly behind server)
            setTimer(formatDuration(Math.max(0, durationMs)));
        };

        // Initial update
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [shift, serverOffset]);


    const handleClockIn = async () => {
        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/staff/shifts/clock-in`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({}),
            });
            if (res.ok) await fetchCurrentShift();
        } catch {
            alert(t('operation_failed'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleClockOut = async () => {
        setActionLoading(true);
        setConfirmingClockOut(false);
        try {
            const res = await fetch(`${API_URL}/staff/shifts/clock-out`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({}),
            });
            if (res.ok) {
                setShift(null);
                setTimer('00:00:00');
            }
        } catch {
            alert(t('operation_failed'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleBreak = async () => {
        const isOnBreak = shift?.breaks?.some((b: any) => b.startTime && !b.endTime);
        const endpoint = isOnBreak ? 'break/end' : 'break/start';
        const body = isOnBreak ? {} : { type: 'LUNCH' };

        setActionLoading(true);
        try {
            const res = await fetch(`${API_URL}/staff/shifts/${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body),
            });
            if (res.ok) await fetchCurrentShift();
        } catch {
            alert(t('operation_failed'));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return null;

    const isOnBreak = shift?.breaks?.some((b: any) => b.startTime && !b.endTime);

    return (
        <div className="p-4 bg-card/50 border border-border rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${shift ? (isOnBreak ? 'bg-warning-500 animate-pulse' : 'bg-primary animate-pulse') : 'bg-slate-600'}`} />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {shift ? (isOnBreak ? t('on_break') : t('on_shift')) : t('off_duty')}
                    </span>
                </div>
                {shift && (
                    <span className={`font-mono font-bold text-sm ${isOnBreak ? 'text-warning-400' : 'text-primary'}`}>
                        {timer}
                    </span>
                )}
            </div>

            {!shift ? (
                <button
                    onClick={handleClockIn}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                >
                    <Play className="h-4 w-4" /> {t('clock_in')}
                </button>
            ) : (
                <div className="flex gap-2">
                    <button
                        onClick={handleToggleBreak}
                        disabled={actionLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${isOnBreak
                            ? 'bg-warning-500/10 border-warning-500/50 text-warning-400 hover:bg-warning-500/20'
                            : 'bg-muted border-slate-700 text-slate-300 hover:bg-muted-foreground'
                            }`}
                    >
                        {isOnBreak ? <Play className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                        {isOnBreak ? t('end_break') : t('start_break')}
                    </button>

                    {confirmingClockOut ? (
                        <div className="flex-1 flex gap-1">
                            <button
                                onClick={handleClockOut}
                                disabled={actionLoading}
                                className="flex-1 py-2 bg-error-600 text-white rounded-lg text-xs font-black transition-all"
                            >
                                {t('yes_end')}
                            </button>
                            <button
                                onClick={() => setConfirmingClockOut(false)}
                                className="flex-1 py-2 bg-muted-foreground text-slate-300 rounded-lg text-xs font-bold transition-all"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setConfirmingClockOut(true)}
                            disabled={actionLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-error-600/10 border border-error-500/50 text-error-500 hover:bg-error-600/20 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                        >
                            <Square className="h-4 w-4" /> {t('clock_out')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
