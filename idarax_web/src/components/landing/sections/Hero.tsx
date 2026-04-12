'use client';

import { CheckCircle2 } from 'lucide-react';
import { ThemeMap, SectionStyle } from '../../../utils/theme';
import { HeroContent } from '../../../types/cms';

interface HeroProps {
  content: HeroContent;
  style: SectionStyle;
  cTheme: ThemeMap;
  locale: string;
  onRegister: () => void;
}

export default function Hero({ content, style, cTheme, locale, onRegister }: HeroProps) {
  return (
    <section id="hero" className={`${style.bg} ${style.text} transition-colors duration-500`}>
      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${style.isDark ? 'bg-white/10 border-white/20 text-white' : `${cTheme.bg50} ${cTheme.text700} border ${cTheme.border100}`} font-semibold text-sm mb-6`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cTheme.bg400} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${cTheme.bg500}`}></span>
            </span>
            {content.badge || (locale === 'ar' ? 'مرحباً بك في إدارة المطاعم' : 'Meet the New Loyalty Engine')}
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            {content.title || (locale === 'ar' ? 'نظام إدارة مطاعم متكامل' : 'The complete restaurant management system')}
          </h1>
          <p className={`text-xl ${style.textMuted} mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0`}>
            {content.content || (locale === 'ar' ? 'وحّد نقطة البيع والمطبخ والمخزون والتحليلات في منصة واحدة قوية.' : 'Unify your Point of Sale, Kitchen, Inventory, and Analytics into one powerful, easy-to-use platform.')}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button
              onClick={onRegister}
              className={`w-full sm:w-auto ${cTheme.bg600} ${cTheme.hoverBg700} text-white font-bold text-lg py-4 px-8 rounded-xl shadow-xl ${cTheme.shadow30} transition-all hover:-translate-y-1`}
            >
              {content.primaryCta || (locale === 'ar' ? 'ابدأ مجاناً' : 'Get Started for Free')}
            </button>
            <a
              href="#products"
              className={`w-full sm:w-auto font-bold text-lg py-4 px-8 rounded-xl border ${style.isDark ? 'border-border text-white hover:bg-white/10' : 'border-slate-200 text-slate-800 hover:bg-slate-50'} shadow-sm transition-all`}
            >
              {content.secondaryCta || (locale === 'ar' ? 'استكشف المنتجات' : 'Explore Products')}
            </a>
          </div>
        </div>

        <div className="lg:w-1/2 relative">
          <div className="relative w-full aspect-[4/3] rounded-3xl bg-card shadow-2xl overflow-hidden border-8 border-white group">
            <div className="absolute top-0 left-0 w-full h-12 bg-muted flex items-center px-4 gap-2 z-10">
              <div className="w-3 h-3 rounded-full bg-error-400"></div>
              <div className="w-3 h-3 rounded-full bg-warning-400"></div>
              <div className="w-3 h-3 rounded-full bg-success-400"></div>
              <div className="ml-4 text-xs font-mono text-muted-foreground">idarax-pos-terminal</div>
            </div>
            <img
               src={content.imageUrl || '/pos-mockup.png'}
               alt="Idarax POS Dashboard"
               className="absolute inset-0 w-full h-full object-cover mt-12 transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
