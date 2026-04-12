import { CheckCircle2 } from 'lucide-react';
import { ThemeMap, SectionStyle } from '../../../utils/theme';
import { PricingPlan } from '../../../types/cms';
import { useTranslations } from 'next-intl';

interface PricingProps {
  content: { title?: string; content?: string };
  plans: PricingPlan[];
  style: SectionStyle;
  cTheme: ThemeMap;
  locale: string;
  isRtl: boolean;
  onSelectPlan: (id: string) => void;
}

export default function Pricing({ content, plans, style, cTheme, locale, isRtl, onSelectPlan }: PricingProps) {
  const t = useTranslations();
  return (
    <section id="pricing" className={`py-24 ${style.bg} ${style.text} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black mb-6">
            {(content.title || (locale === 'ar' ? 'خطط بسيطة وشفافة' : 'Simple, Transparent Pricing')).replace(/ \((EN|AR)\)$/, '')}
          </h2>
          <p className={`text-xl ${style.textMuted}`}>
            {content.content || (locale === 'ar' ? 'اختر الخطة المناسبة لحجم أعمالك.' : 'Choose the best plan for your restaurant size.')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const planName = locale === 'ar' ? (plan.nameAr || plan.name) : plan.name;
            const planDesc = locale === 'ar' ? (plan.descriptionAr || plan.description) : plan.description;
            const planFeatures = locale === 'ar' ? (plan.featuresAr || plan.features) : plan.features;
            
            return (
              <div key={plan.id} className={`relative flex flex-col p-8 rounded-3xl border ${plan.popular ? `${cTheme.border100} ring-4 ring-offset-0 ${style.isDark ? 'ring-white/10' : 'ring-success-50 shadow-2xl'}` : `${style.isDark ? 'border-border' : 'border-slate-100 shadow-xl'}`} ${style.isDark ? 'bg-white/5' : 'bg-white'}`}>
                {plan.popular && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${cTheme.bg600} text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg`}>
                    {isRtl ? 'الأكثر طلباً' : 'Most Popular'}
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">{planName}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">${Number(plan.price).toFixed(2)}</span>
                    <span className={style.textMuted}>/{isRtl ? 'شهرياً' : 'month'}</span>
                  </div>
                  {planDesc && <p className={`mt-4 text-sm ${style.textMuted}`}>{planDesc}</p>}
                </div>
                <ul className="mb-8 space-y-3 flex-1">
                  {(planFeatures || []).map((f: any, i: number) => (
                    <li key={i} className={`${style.textMuted} flex items-start gap-2`}>
                      <span className={cTheme.text500}><CheckCircle2 className="w-4 h-4 mt-1 shrink-0" /></span>
                      <span className="text-sm">{t(f) || f}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => onSelectPlan(plan.id)} 
                  className={`w-full py-3 ${cTheme.bg600} text-white rounded-xl font-bold ${cTheme.hoverBg700} transition-colors shadow-lg ${cTheme.shadow20}`}
                >
                  {isRtl ? 'ابدأ الفترة التجريبية' : 'Start Trial'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
