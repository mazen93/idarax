'use client';

import { useEffect } from 'react';
import { api } from '@/lib/api';

export default function DynamicBranding() {
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // Fetch settings from the backend
                // Note: The middleware/auth should already have tenantId in cookies
                const response = await api.get('/tenant/settings');
                const settings = response.data;

                if (settings?.brandColor) {
                    document.documentElement.style.setProperty('--primary', settings.brandColor);
                    document.documentElement.style.setProperty('--ring', settings.brandColor);
                    
                    // Also update sidebar branding if needed
                    // --sidebar-accent can be derived or set separately
                }
                
                if (settings?.secondaryColor) {
                    document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
                }
            } catch (err: any) {
                // If 401, it means we don't have access (though we just made it public)
                // If 429, we are being throttled.
                if (err.response?.status === 401) {
                    console.info('Settings are private, using default branding.');
                } else {
                    console.warn('Failed to fetch dynamic branding settings', err.message);
                }
            }
        };

        fetchBranding();
    }, []);

    return null; // This component only manages side effects
}
