'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';

// Utilities & Types
import { THEMES, getSectionStyle } from '../../utils/theme';
import { sec, items, itemObj } from '../../utils/cms';
import { PricingPlan, CmsThemeSettings, CmsHeader, HeroContent, CmsCta } from '../../types/cms';

// Components
import RegisterModal from './RegisterModal';
import Hero from './sections/Hero';
import SocialProof from './sections/SocialProof';
import AlternatingBlocks from './sections/AlternatingBlocks';
import Features from './sections/Features';
import Pricing from './sections/Pricing';
import ContactCTA from './sections/ContactCTA';
import Footer from './sections/Footer';

interface LandingPageProps {
  content: Record<string, any>;
  plans: PricingPlan[];
  locale?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  { 
    id: 'basic', 
    name: 'Starter', 
    nameAr: 'البداية',
    price: 29, 
    features: ['Up to 20 tables', '3 staff accounts', 'Kitchen Display (KDS)', 'Basic Analytics', 'Email support', 'Digital Menu (QR)'],
    featuresAr: ['حتى 20 طاولة', '3 حسابات موظفين', 'شاشة عرض المطبخ', 'تحليلات أساسية', 'دعم عبر البريد', 'منيو رقمي (QR)']
  },
  { 
    id: 'pro', 
    name: 'Professional', 
    nameAr: 'الاحترافية',
    price: 79, 
    features: ['Unlimited tables', '20 staff accounts', 'Full Inventory Management', 'AI Business Analytics', 'Multi-warehouse support', 'Priority Support', 'Loyalty Program'], 
    featuresAr: ['طاولات غير محدودة', '20 حساب موظفين', 'إدارة كاملة للمخزون', 'تحليلات أعمال ذكية (AI)', 'دعم مستودعات متعددة', 'دعم ذو أولوية', 'برنامج الولاء'],
    popular: true 
  },
  { 
    id: 'enterprise', 
    name: 'Enterprise', 
    nameAr: 'المؤسسات',
    price: 199, 
    features: ['Everything in Pro', 'Custom Integrations (API)', 'Dedicated Account Manager', 'SLA 99.9% Guarantee', 'Advanced Fraud Detection', 'White-label POS option', 'On-premise deployment'],
    featuresAr: ['كل ميزات الاحترافية', 'تكاملات مخصصة (API)', 'مدير حساب مخصص', 'ضمان الخدمة 99.9%', 'كشف متقدم للاحتيال', 'خيار POS مخصص', 'نشر محلي (On-premise)']
  },
];

export default function LandingPage({ content, plans, locale = 'en' }: LandingPageProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | undefined>();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };
  
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const isRtl = locale === 'ar';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContact(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const res = await fetch(`${apiUrl}/cms/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactForm({ name: '', email: '', message: '' });
      }
    } catch (err) {
      console.error('Contact submit error:', err);
    }
    setSubmittingContact(false);
  };

  // === Data & Style Resolution ===
  const themeSettings = sec(content, locale, 'theme_settings');
  const themeColor = itemObj<CmsThemeSettings>(themeSettings).brandColor || 'emerald';
  const cTheme = THEMES[themeColor as keyof typeof THEMES] || THEMES['emerald'];

  const headerData = sec(content, locale, 'header');
  const heroRes = sec(content, locale, 'hero');
  const trustedByRes = sec(content, locale, 'trusted_by');
  const altBlocksRes = sec(content, locale, 'alternating_blocks');
  const featuresRes = sec(content, locale, 'features');
  const pricingRes = sec(content, locale, 'pricing');
  const ctaRes = sec(content, locale, 'cta');
  const footerRes = sec(content, locale, 'footer');

  const navLinks = items(headerData).length > 0 ? items(headerData) : [
    { label: isRtl ? 'المنتجات' : 'Products', href: '#products' },
    { label: isRtl ? 'الميزات' : 'Features', href: '#features' },
    { label: isRtl ? 'الأسعار' : 'Pricing', href: '#pricing' },
    { label: isRtl ? 'اتصل بنا' : 'Contact', href: '#contact' },
  ];

  const footerLinks = items(footerRes).length > 0 ? items(footerRes) : [
    { heading: isRtl ? 'المنتجات' : 'Products', links: [{ label: 'POS', href: '#' }, { label: 'KDS', href: '#' }] },
    { heading: isRtl ? 'الشركة' : 'Company', links: [{ label: isRtl ? 'من نحن' : 'About', href: '#' }, { label: isRtl ? 'تواصل معنا' : 'Contact', href: '#' }] },
  ];

  return (
    <div className={`min-h-screen font-sans ${cTheme.selection} antialiased selection:bg-opacity-30`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 ${cTheme.bg600} rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className={`font-black text-2xl tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900 group-hover:text-slate-700'}`}>
                {itemObj<CmsHeader>(headerData).brandName || 'Idarax'}
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link: any, i: number) => (
                <a key={i} href={link.href} className={`text-sm font-bold ${scrolled ? 'text-slate-600' : 'text-slate-700'} ${cTheme.hoverText600} transition-colors uppercase tracking-wider`}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Link href="/login" className={`hidden sm:block font-bold ${scrolled ? 'text-slate-700' : 'text-slate-800'} ${cTheme.hoverText600} transition-colors ml-4`}>
              {itemObj<CmsHeader>(headerData).loginLabel || (isRtl ? 'تسجيل الدخول' : 'Log in')}
            </Link>

            {/* Language Switcher */}
            <button
              onClick={switchLocale}
              title={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                scrolled 
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-100' 
                  : 'border-slate-300/60 text-slate-800 hover:bg-white/60'
              }`}
            >
              <span className="text-base">{isRtl ? '🇬🇧' : '🇸🇦'}</span>
              <span>{isRtl ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={() => setShowRegister(true)}
              className={`${cTheme.bg600} text-white px-6 py-3 rounded-xl font-bold ${cTheme.hoverBg700} transition-all shadow-lg ${cTheme.shadow30} active:scale-95`}
            >
              {isRtl ? 'ابدأ الأن' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <Hero 
        content={itemObj<HeroContent>(heroRes)} 
        style={getSectionStyle(heroRes.theme, 'bg-slate-50', cTheme)} 
        cTheme={cTheme} 
        locale={locale} 
        onRegister={() => setShowRegister(true)} 
      />

      <SocialProof 
        content={itemObj<{ title?: string }>(trustedByRes)} 
        brands={items<{ name: string }>(trustedByRes).length > 0 ? items<{ name: string }>(trustedByRes) : [{ name: 'Brand A' }, { name: 'GourmetCo' }, { name: 'Foodies' }]} 
        style={getSectionStyle(trustedByRes.theme, 'bg-white', cTheme)} 
        locale={locale} 
      />

      <AlternatingBlocks 
        blocks={items(altBlocksRes).length > 0 ? items(altBlocksRes) : []} 
        style={getSectionStyle(altBlocksRes.theme, 'bg-white', cTheme)} 
        cTheme={cTheme} 
      />

      <Features 
        content={featuresRes} 
        features={items(featuresRes)} 
        style={getSectionStyle(featuresRes.theme, 'bg-slate-50', cTheme)} 
        locale={locale} 
      />

      <Pricing 
        content={pricingRes} 
        plans={plans.length > 0 ? plans : DEFAULT_PLANS} 
        style={getSectionStyle(pricingRes.theme, 'bg-white', cTheme)} 
        cTheme={cTheme} 
        locale={locale} 
        isRtl={isRtl} 
        onSelectPlan={(id) => { setSelectedPlan(id); setShowRegister(true); }} 
      />

      <ContactCTA 
        content={itemObj<CmsCta>(ctaRes)} 
        style={getSectionStyle(ctaRes.theme, 'bg-card', cTheme)} 
        cTheme={cTheme} 
        locale={locale} 
        contactForm={contactForm} 
        setContactForm={setContactForm} 
        submittingContact={submittingContact} 
        contactSuccess={contactSuccess} 
        setContactSuccess={setContactSuccess} 
        onSubmit={handleContactSubmit} 
      />

      <Footer 
        headerData={itemObj<CmsHeader>(headerData)} 
        footerDesc={footerRes.content || (isRtl ? 'الجيل القادم من أنظمة إدارة المطاعم.' : 'The next generation of restaurant management.')} 
        footerLinks={footerLinks} 
        style={getSectionStyle(footerRes.theme, 'bg-background', cTheme)} 
        cTheme={cTheme} 
        isRtl={isRtl} 
      />

      {showRegister && (
        <RegisterModal 
          isOpen={showRegister} 
          onClose={() => { setShowRegister(false); setSelectedPlan(undefined); }}
          initialPlanId={selectedPlan}
          plans={plans.length > 0 ? plans : DEFAULT_PLANS}
          cTheme={cTheme}
        />
      )}
    </div>
  );
}
