'use client';

import { useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
    const isOnline = useOnlineStatus();
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (!isOnline) {
            setWasOffline(true);
            setShowReconnected(false);
        } else if (wasOffline && isOnline) {
            setShowReconnected(true);
            const timer = setTimeout(() => {
                setShowReconnected(false);
                setWasOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline, mounted]);

    if (!mounted) return null;
    if (isOnline && !showReconnected) return null;

    if (showReconnected) {
        return (
            <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold bg-primary text-white shadow-lg animate-fade-in">
                <Wifi className="h-4 w-4" />
                <span>Back online — syncing offline data…</span>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 py-2.5 px-4 text-sm font-semibold bg-warning-500 text-black shadow-lg">
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            <span>You are offline. Changes will be saved locally and synced when reconnected.</span>
            <span className="ml-2 flex gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce [animation-delay:0ms]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce [animation-delay:150ms]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce [animation-delay:300ms]" />
            </span>
        </div>
    );
}
