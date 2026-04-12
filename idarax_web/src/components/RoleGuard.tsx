'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';

// Mapping from URL path to the Permission enum value
const PATH_TO_PERMISSION: Record<string, string> = {
    '/dashboard/products': 'CATALOG',
    '/dashboard/inventory': 'INVENTORY',
    '/dashboard/recipes': 'INVENTORY',
    '/dashboard/offers': 'OFFERS',
    '/dashboard/customers': 'CUSTOMERS',
    '/dashboard/staff': 'STAFF_MANAGEMENT',
    '/dashboard/reports': 'REPORTS',
    '/dashboard/settings': 'SETTINGS',
    '/dashboard/pos': 'POS',
    '/dashboard/orders': 'ORDERS',
    '/dashboard/tables': 'TABLES',
    '/dashboard/reservations': 'TABLES',
    '/dashboard/kds': 'KDS',
    '/dashboard/staff/drawer': 'CASH_DRAWER',
    '/dashboard/staff/shifts': 'STAFF_MANAGEMENT',
};

// Mapping from URL path to the Feature enum value
const PATH_TO_FEATURE: Record<string, string> = {
    '/dashboard/inventory': 'INVENTORY',
    '/dashboard/recipes': 'INVENTORY',
    '/dashboard/kds': 'KDS',
    '/dashboard/customers': 'CRM',
    '/dashboard/marketing': 'MARKETING',
};

// Admin-level roles that always bypass permission checks
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];

interface RoleGuardProps {
    children: React.ReactNode;
}

/**
 * RoleGuard — client-side page protection.
 * For admin roles: allows everything.
 * For other roles: checks user_permissions from localStorage.
 */
export default function RoleGuard({ children }: RoleGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const locale = (params?.locale as string) || 'en';

    useEffect(() => {
        const rawRole = localStorage.getItem('user_role') || '';
        if (!rawRole) return; // Not loaded yet — let middleware handle it

        const role = rawRole.toUpperCase().replace(/\s/g, '_');

        // Prevent Super Admins from accessing the tenant dashboard
        if (role === 'SUPER_ADMIN') {
            router.replace(`/${locale}/admin`);
            return;
        }

        const isActive = localStorage.getItem('is_tenant_active') !== 'false';
        if (!isActive && !pathname.includes('/onboarding-pending')) {
            router.replace(`/${locale}/onboarding-pending`);
            return;
        }

        const isExpiredStr = localStorage.getItem('is_expired');
        if (isExpiredStr === 'true' && !pathname.includes('/settings')) {
            router.replace('/dashboard/settings');
            return;
        }

        // Check subscription features first (applies to ALL roles, including admins)
        const requiredFeatureKV = Object.entries(PATH_TO_FEATURE).find(
            ([path]) => pathname.startsWith(path)
        );
        
        if (requiredFeatureKV) {
            const requiredFeature = requiredFeatureKV[1];
            try {
                const rawFeatures = localStorage.getItem('user_features') || '[]';
                const parsedFeatures = JSON.parse(rawFeatures);
                const userFeatures = Array.isArray(parsedFeatures) ? parsedFeatures : [];

                if (!userFeatures.includes(requiredFeature)) {
                    router.replace('/dashboard');
                    return;
                }
            } catch {
                // Ignore parse errors, just deny access if feature check fails securely
                router.replace('/dashboard');
                return;
            }
        }

        // Admin roles always have full permission access (after feature check)
        if (ADMIN_ROLES.includes(role)) return;

        // Find the required permission for the current path
        const requiredPermission = Object.entries(PATH_TO_PERMISSION).find(
            ([path]) => pathname.startsWith(path)
        )?.[1];

        // If this path has no required permission, allow all authenticated users
        if (!requiredPermission) return;

        // Check user's granted permissions
        const rawPermissions = localStorage.getItem('user_permissions') || '[]';
        let userPermissions: string[] = [];
        try {
            const parsed = JSON.parse(rawPermissions);
            userPermissions = Array.isArray(parsed)
                ? parsed.map((p: any) => typeof p === 'string' ? p : p.action)
                : [];
        } catch {
            userPermissions = [];
        }

        // Standardize permissions to uppercase for matching
        const normalizedPerms = userPermissions.map(p => String(p).toUpperCase());
        const target = requiredPermission.toUpperCase();

        // Check if the user has any permission for this module
        const hasPermission = normalizedPerms.some(p => 
            p === target || 
            p === `MODULE:${target}` || 
            p.startsWith(`${target}:`)
        );

        if (!hasPermission) {
            // Redirect to the first accessible page
            if (normalizedPerms.some(p => p.startsWith('POS'))) {
                router.replace('/dashboard/pos');
            } else if (normalizedPerms.some(p => p.startsWith('ORDERS'))) {
                router.replace('/dashboard/orders');
            } else {
                router.replace('/dashboard');
            }
        }
    }, [pathname, router]);

    return <>{children}</>;
}
