'use client';

import DashboardSidebar from "@/components/DashboardSidebar";
import RoleGuard from "@/components/RoleGuard";
import OfflineBanner from "@/components/OfflineBanner";
import ExpiryBanner from "@/components/ExpiryBanner";
import { NotificationsProvider } from "@/components/NotificationsContext";
import { UpgradeModalProvider } from "@/components/UpgradeModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LockScreen from "@/components/pos/LockScreen";
import { useLanguage } from "@/components/LanguageContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPOS = pathname?.includes('/dashboard/pos');
    const { t } = useLanguage();
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        // Only enforce locking on the client side
        if (typeof window !== 'undefined') {
            const locked = localStorage.getItem('pos_locked') === 'true';
            if (locked) setIsLocked(true);

            const handleToggleLock = (e: any) => {
                const shouldLock = e.detail?.locked === true;
                setIsLocked(shouldLock);
                localStorage.setItem('pos_locked', shouldLock ? 'true' : 'false');
            };
            window.addEventListener('toggleLock', handleToggleLock);
            return () => window.removeEventListener('toggleLock', handleToggleLock);
        }
    }, []);

    const handleUnlock = () => {
        setIsLocked(false);
        localStorage.setItem('pos_locked', 'false');
    };

    return (
        <ErrorBoundary>
            <RoleGuard>
                <NotificationsProvider>
                    <UpgradeModalProvider>
                        {isLocked && <LockScreen onUnlock={handleUnlock} t={t} />}
                        <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
                            <OfflineBanner />
                            <ExpiryBanner />
                            <div className="flex flex-1 overflow-hidden">
                                <DashboardSidebar />
                                <main className="flex-1 overflow-y-auto w-full relative">
                                    {isPOS ? (
                                        <div className="h-full w-full">
                                            {children}
                                        </div>
                                    ) : (
                                        <div className="mx-auto max-w-7xl p-8">
                                            {children}
                                        </div>
                                    )}
                                </main>
                            </div>
                        </div>
                    </UpgradeModalProvider>
                </NotificationsProvider>
            </RoleGuard>
        </ErrorBoundary>
    );
}

