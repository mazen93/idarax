import { getHeaders } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = {
        ...getHeaders(),
        ...(options.headers || {}),
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        cache: 'no-store',   // ← always bypass cache to prevent 304-empty-body JSON failures
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_permissions');
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    return response;
}

/**
 * Safely parse a fetch Response as JSON.
 * Returns null if the body is empty (e.g. 204 / 304) or not valid JSON.
 */
export async function safeJson(res: Response): Promise<any> {
    try {
        const text = await res.text();
        if (!text || !text.trim()) return null;
        return JSON.parse(text);
    } catch {
        return null;
    }
}
