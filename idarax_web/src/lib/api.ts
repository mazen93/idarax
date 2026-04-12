import axios from 'axios';
import Cookies from 'js-cookie';
import * as offlineQueue from './offlineQueue';
import * as Sentry from '@sentry/nextjs';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/** Thrown when a request fails due to no network connection */
export class OfflineError extends Error {
    constructor(message = 'You are currently offline') {
        super(message);
        this.name = 'OfflineError';
    }
}

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    const tenantId = Cookies.get('tenant_id') || localStorage.getItem('tenant_id');
    const branchId = Cookies.get('branch_id') || localStorage.getItem('branch_id');
    const requestId = uuidv4();
    
    config.headers['x-request-id'] = requestId;
    (config as any).metadata = { startTime: new Date() };

    Sentry.addBreadcrumb({
        category: 'api',
        message: `Sending ${config.method?.toUpperCase()} ${config.url}`,
        level: 'info',
        data: { tenantId, branchId, requestId }
    });

    // Defensive: Ignore literal string "undefined" or "null" which can happen if storage is corrupted
    if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
        config.headers['x-tenant-id'] = tenantId;
    }
    if (branchId) {
        config.headers['x-branch-id'] = branchId;
    }
    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        const { config, data } = response;
        const startTime = (config as any).metadata?.startTime;
        const duration = startTime ? new Date().getTime() - startTime.getTime() : 0;

        Sentry.addBreadcrumb({
            category: 'api',
            message: `Received response for ${config.method?.toUpperCase()} ${config.url}`,
            level: 'info',
            data: { status: response.status, duration: `${duration}ms` }
        });

        if (data && typeof data === 'object' && 'status' in data && 'code' in data) {
            if (data.meta) {
                return {
                    ...response,
                    data: {
                        data: data.data,
                        meta: {
                            total: data.meta.total,
                            page: data.meta.current_page,
                            lastPage: data.meta.last_page,
                            limit: data.meta.per_page,
                        }
                    }
                };
            }
            return {
                ...response,
                data: data.data
            };
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = Cookies.get('refresh_token');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
                    // Handle transformed response or raw response
                    const responseData = res.data.data || res.data;
                    const { access_token, refresh_token: newRefreshToken } = responseData;

                    if (access_token && String(access_token) !== 'undefined' && String(access_token) !== 'null') {
                        // Sync tokens to both Cookies (for SSR/headers) and localStorage (for persistence)
                        Cookies.set('token', access_token, { expires: 7 });
                        if (newRefreshToken) {
                            Cookies.set('refresh_token', newRefreshToken, { expires: 7 });
                        }
                        localStorage.setItem('token', access_token);
                        localStorage.setItem('refresh_token', newRefreshToken || ''); // Store new refresh token or clear if not provided

                        // Update the Authorization header for both the global instance and the current retried request
                        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                        processQueue(null, access_token);
                        return api(originalRequest);
                    } else {
                        throw new Error('Invalid token in refresh response');
                    }
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    Cookies.remove('token');
                    Cookies.remove('refresh_token');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                if (typeof window !== 'undefined' && !originalRequest.url.includes('/auth/login')) {
                    window.location.href = '/login';
                }
            }
        }

        // Detect network / offline failures
        if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !navigator.onLine)) {
            return Promise.reject(new OfflineError());
        }
        // Capture API error in Sentry
        if (error.response?.status >= 500) {
            Sentry.captureException(error);
        }

        return Promise.reject(error);
    }
);

// Auto-flush offline order queue when the browser reconnects
if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
        const count = offlineQueue.queueLength();
        if (count === 0) return;
        try {
            const synced = await offlineQueue.flush(
                (url, data) => api.post(url, data)
            );
            if (synced > 0) {
                console.info(`[offline-queue] Synced ${synced} offline order(s).`);
                // Dispatch a custom event so UI components can react (e.g. show toast)
                window.dispatchEvent(new CustomEvent('offline-queue-synced', { detail: { synced } }));
            }
        } catch (err) {
            console.warn('[offline-queue] Flush failed:', err);
        }
    });
}

