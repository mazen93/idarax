import Cookies from 'js-cookie';

export const getHeaders = (overrideToken?: string) => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || Cookies.get('token') || '') : '';
    const tenantId = typeof window !== 'undefined' ? (localStorage.getItem('tenant_id') || Cookies.get('tenant_id') || '') : '';
    const branchId = typeof window !== 'undefined' ? Cookies.get('branch_id') || '' : '';

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-branch-id': branchId
    };

    // Robust token check: ignore literal "undefined" or "null" strings
    if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (overrideToken) {
        headers['x-override-token'] = overrideToken;
    }

    return headers;
};

export const hasPermission = (requiredAction: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    const rawRole = localStorage.getItem('user_role') || '';
    const role = rawRole.toUpperCase().replace(/\s/g, '_');
    
    if (['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role)) return true;
    
    
    try {
        const rawPermissions = localStorage.getItem('user_permissions') || '[]';
        const perms: string[] = JSON.parse(rawPermissions);
        
        // Check for exact action match OR module-level wildcard match if only passing module name
        return perms.includes(requiredAction) || perms.some(p => p.startsWith(`${requiredAction}:`));
    } catch {
        return false;
    }
};

export const hasFeature = (requiredFeature: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
        const rawFeatures = localStorage.getItem('user_features') || '[]';
        const features: string[] = JSON.parse(rawFeatures);
        return features.includes(requiredFeature);
    } catch {
        return false;
    }
};

export const getTenantType = (): string => {
    if (typeof window === 'undefined') return 'RESTAURANT';
    return localStorage.getItem('tenant_type') || 'RESTAURANT';
};

export const isRetail = (): boolean => {
    return getTenantType() === 'RETAIL';
};
