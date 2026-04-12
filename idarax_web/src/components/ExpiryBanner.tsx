'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ExpiryBanner() {
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkExpiry = () => {
            const expired = localStorage.getItem('is_expired') === 'true';
            const days = parseInt(localStorage.getItem('days_remaining') || '999', 10);
            
            setIsExpired(expired);
            if (!expired && days <= 7) {
                setDaysRemaining(days);
            } else {
                setDaysRemaining(null);
            }
        };

        checkExpiry();
        window.addEventListener('storage', checkExpiry);
        window.addEventListener('localStorageChanged', checkExpiry);
        return () => {
            window.removeEventListener('storage', checkExpiry);
            window.removeEventListener('localStorageChanged', checkExpiry);
        };
    }, []);

    if (!mounted) return null;
    if (!isExpired && daysRemaining === null) return null;

    if (isExpired) {
        return (
            <div className="bg-error-500/10 border-b border-error-500/20 px-4 py-3 flex items-center justify-center gap-3 w-full relative z-[60]">
                <ShieldAlert className="h-5 w-5 text-error-500 shrink-0" />
                <p className="text-sm font-bold text-error-500">
                    Your subscription has expired. Access to operational features has been restricted. 
                    <Link href="/dashboard/settings" className="ml-2 underline hover:text-error-400">
                        Renew Plan
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="bg-warning-500/10 border-b border-warning-500/20 px-4 py-2.5 flex items-center justify-center gap-3 w-full relative z-[60]">
            <AlertTriangle className="h-5 w-5 text-warning-500 shrink-0" />
            <p className="text-sm font-medium text-warning-500">
                Warning: Your subscription expires in <strong>{daysRemaining} day(s)</strong>. 
                <Link href="/dashboard/settings" className="ml-2 underline font-bold hover:text-warning-400">
                    Renew now
                </Link>
                {' '}to avoid service interruption.
            </p>
        </div>
    );
}
