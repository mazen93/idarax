'use client';

import { useState, useEffect } from 'react';

/**
 * Returns the current network online status.
 * Safe to use server-side (defaults to true).
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState<boolean>(true); // Default to true for SSR

    useEffect(() => {
        // Update to actual status on mount
        setIsOnline(navigator.onLine);

        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    return isOnline;
}
