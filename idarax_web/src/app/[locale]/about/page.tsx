'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Rocket, Users, Target } from 'lucide-react';

export default function AboutPage() {
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
                const aboutKey = `${locale}_about`;
                const about = data[aboutKey] || data['about'];
                setContent(about);
            } catch (err) {
                console.error('Failed to fetch about:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchContent();
    }, [locale]);

    if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-white">Loading...</div>;

    const title = content?.title || (isRtl ? 'من نحن' : 'About Idarax');
    const mission = content?.mission || (isRtl ? 'مهمتنا هي تمكين المطاعم في العالم العربي من خلال التكنولوجيا المبتكرة.' : 'Our mission is to empower restaurants in the MENA region with world-class technology.');
    
    const items = content?.items && Array.isArray(content.items) ? content.items : [
        { icon: Rocket, title: isRtl ? 'الابتكار' : 'Innovation', body: isRtl ? 'نبحث دائماً عن أحدث الحلول التقنية.' : 'We are always looking for the latest technical solutions.' },
        { icon: Users, title: isRtl ? 'العميل أولاً' : 'Customer First', body: isRtl ? 'نجاح عملائنا هو نجاحنا.' : 'Our customers success is our success.' },
        { icon: Target, title: isRtl ? 'الدقة' : 'Precision', body: isRtl ? 'نهتم بأدق التفاصيل في نظامنا.' : 'We care about the finest details in our system.' },
    ];

    return (
        <div className={`min-h-screen bg-[var(--background)] text-[#e8e8f0] py-24 px-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                <Link href={`/${locale}`} className="text-primary hover:text-success-300 flex items-center gap-2 mb-12 font-medium transition-colors">
                    <ArrowLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    {isRtl ? 'العودة للرئيسية' : 'Back to home'}
                </Link>

                <div className="text-center mb-24">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-white to-success-400 bg-clip-text text-transparent leading-tight mb-8">
                        {title}
                    </h1>
                    <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {mission}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {items.map((item: any, i: number) => {
                        const Icon = item.icon || Rocket;
                        return (
                            <div key={i} className="bg-white/5 border border-border p-8 rounded-3xl hover:bg-white/[0.08] transition-all group">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 mb-6 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.body || item.content}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-3xl bg-gradient-to-br from-success-500/20 to-primary-500/20 border border-border p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6 underline decoration-success-500 underline-offset-8">
                        {isRtl ? 'جاهز للانضمام إلينا؟' : 'Ready to join our journey?'}
                    </h2>
                    <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                        {isRtl ? 'اكتشف كيف يمكن لإيداركس مساعدتك في تنمية مطعمك اليوم.' : 'Discover how Idarax can help you grow your restaurant today.'}
                    </p>
                    <Link href={`/${locale}`} className="bg-primary hover:bg-primary text-slate-900 font-extrabold px-10 py-4 rounded-2xl transition-all inline-block hover:scale-105">
                        {isRtl ? 'ابدأ الآن' : 'Get Started'}
                    </Link>
                </div>

                {content?.content && (
                   <div className="mt-24 text-muted-foreground leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: content.content }} />
                )}
            </div>
        </div>
    );
}
