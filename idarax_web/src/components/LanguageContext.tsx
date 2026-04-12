'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';

type Language = 'en' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    isRTL: boolean;
    formatCurrency: (amount: number, currencyCode?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const tIntl = useTranslations();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale() as Language;

    const isRTL = locale === 'ar';

    const formatCurrency = (amount: number, currencyCode: string = 'SAR') => {
        try {
            return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2
            }).format(amount);
        } catch {
            return `${Number(amount).toFixed(2)} ${currencyCode}`;
        }
    };

    /**
     * @deprecated Use localized routing (Link/useRouter from '@/i18n/routing') instead of manual language switching.
     */
    const setLanguage = (lang: Language) => {
        router.replace(pathname, { locale: lang });
    };

    /**
     * Compatibility wrapper for next-intl translations.
     */
    const t = (key: string): string => {
        try {
            // next-intl throws if key is missing, so we wrap it for safety during migration
            return tIntl(key);
        } catch {
            return key;
        }
    };

    const value = useMemo(() => ({
        language: locale,
        setLanguage,
        t,
        isRTL,
        formatCurrency
    }), [locale, tIntl, pathname, router]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        // Fallback for components that might be rendered outside the provider during transitions
        return {
            language: 'en' as Language,
            setLanguage: () => {},
            t: (k: string) => k,
            isRTL: false,
            formatCurrency: (a: number, c: string = 'SAR') => String(a) + ' ' + c
        };
    }
    return context;
};
