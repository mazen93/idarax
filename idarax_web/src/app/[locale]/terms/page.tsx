'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe } from 'lucide-react';

export default function TermsPage() {
    const params = useParams();
    const locale = params.locale as string || 'en';
    const isRtl = locale === 'ar';
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/cms/landing?locale=${locale}`);
                const data = await res.json();
                // Find terms section
                const termsKey = `${locale}_terms`;
                const terms = data[termsKey] || data['terms'];
                setContent(terms);
            } catch (err) {
                console.error('Failed to fetch terms:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [locale]);

    if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-white">Loading...</div>;

    const title = content?.title || (isRtl ? 'شروط الخدمة' : 'Terms of Service');
    const updatedAt = content?.updatedAt || 'January 1, 2024';
    const items = content?.items && Array.isArray(content.items) ? content.items : [
        { title: '1. Acceptance of Terms', body: 'By accessing or using Idarax, you agree to be bound by these Terms of Service.' },
        { title: '2. Account Responsibility', body: 'You are responsible for maintaining the security of your account credentials.' },
        // ... (fallback items)
    ];

    return (
        <div className={`min-h-screen bg-[var(--background)] text-[#e8e8f0] py-24 px-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-3xl mx-auto">
                <Link href={`/${locale}`} className="text-primary hover:text-success-300 flex items-center gap-2 mb-12 font-medium transition-colors">
                    <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    {isRtl ? 'العودة للرئيسية' : 'Back to home'}
                </Link>

                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white to-success-400 bg-clip-text text-transparent">
                    {title}
                </h1>
                <p className="text-muted-foreground mb-16 font-medium">
                    {isRtl ? 'آخر تحديث: ' : 'Effective: '} {updatedAt}
                </p>

                <div className="space-y-12">
                    {items.map((item: any, i: number) => (
                        <div key={i} className="group">
                            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors">
                                {item.title}
                            </h2>
                            <div className="text-muted-foreground leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: item.body || item.content || '' }} />
                            {!item.body && !item.content && <p className="text-muted-foreground leading-relaxed text-lg">{item.text}</p>}
                        </div>
                    ))}
                </div>
                
                {content?.content && (
                   <div className="mt-12 text-muted-foreground leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: content.content }} />
                )}
            </div>
        </div>
    );
}
