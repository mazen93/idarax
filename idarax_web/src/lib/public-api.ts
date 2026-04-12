const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function getLandingContent(): Promise<Record<string, any>> {
    const res = await fetch(`${API_URL}/cms/content`, { cache: 'no-store' });
    if (!res.ok) return {};
    const resValue = await res.json();
    const data = Array.isArray(resValue) ? resValue : (resValue.data || []);

    // Convert array to map keyed by section
    const map: Record<string, any> = {};
    for (const item of data) { map[item.section] = item; }
    return map;
}

export async function getPlans() {
    const res = await fetch(`${API_URL}/cms/plans`, { cache: 'no-store' });
    if (!res.ok) return [];
    const resValue = await res.json();
    return Array.isArray(resValue) ? resValue : (resValue.data || []);
}

export async function selfRegister(payload: {
    tenantName: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    planId?: string;
    country?: string;
    countryCode?: string;
    vatNumber?: string;
}) {
    const res = await fetch(`${API_URL}/cms/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
    }

    return res.json();
}
