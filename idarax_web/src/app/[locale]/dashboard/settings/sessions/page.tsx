'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Session {
    id: string;
    jti: string;
    deviceName?: string;
    ipAddress?: string;
    lastSeenAt: string;
    createdAt: string;
    isActive: boolean;
}

export default function SessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/sessions');
            setSessions(Array.isArray(res.data) ? res.data : []);
        } catch {
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const revokeSession = async (jti: string) => {
        setRevoking(jti);
        try {
            await api.delete(`/auth/sessions/${jti}`);
            setSessions(prev => prev.filter(s => s.jti !== jti));
        } finally {
            setRevoking(null);
        }
    };

    const revokeAll = async () => {
        if (!confirm('Log out from ALL other devices? Your current session will remain active.')) return;
        setRevoking('all');
        try {
            await api.delete('/auth/sessions/all');
            fetchSessions();
        } finally {
            setRevoking(null);
        }
    };

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

    const getDeviceIcon = (deviceName?: string) => {
        if (!deviceName) return '🖥️';
        const d = deviceName.toLowerCase();
        if (d.includes('mobile') || d.includes('android') || d.includes('iphone')) return '📱';
        if (d.includes('tablet') || d.includes('ipad')) return '📲';
        return '💻';
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Active Sessions</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage where you're logged in. Revoke any session you don't recognise.</p>
                </div>
                {sessions.length > 1 && (
                    <button
                        onClick={revokeAll}
                        disabled={revoking === 'all'}
                        className="px-4 py-2 rounded-lg bg-error-600 hover:bg-error-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {revoking === 'all' ? 'Revoking…' : 'Logout All'}
                    </button>
                )}
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">Loading sessions…</div>
                ) : sessions.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground">No active sessions found.</div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted border border-slate-700 hover:border-slate-500 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{getDeviceIcon(session.deviceName)}</div>
                                <div>
                                    <p className="text-white font-medium text-sm">
                                        {session.deviceName || 'Unknown Device'}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-0.5">
                                        {session.ipAddress && <span className="mr-3">🌐 {session.ipAddress}</span>}
                                        <span>Last active: {formatDate(session.lastSeenAt)}</span>
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Signed in: {formatDate(session.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => revokeSession(session.jti)}
                                disabled={revoking === session.jti}
                                className="px-3 py-1.5 rounded-lg bg-error-900/30 hover:bg-error-800/50 border border-error-800/40 text-error-400 hover:text-error-300 text-xs font-medium transition-all disabled:opacity-40"
                            >
                                {revoking === session.jti ? 'Revoking…' : 'Revoke'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
