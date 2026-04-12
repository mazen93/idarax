import { SectionStyle } from '../../../utils/theme';
import { FeatureItem } from '../../../types/cms';
import { useTranslations } from 'next-intl';

interface FeaturesProps {
  content: { title?: string; content?: string };
  features: FeatureItem[];
  style: SectionStyle;
  locale: string;
}

export default function Features({ content, features, style, locale }: FeaturesProps) {
  const t = useTranslations();
  
  // Try to get features from JSON messages first, then fallback to features prop, then empty
  let messagesFeatures: any = [];
  try {
    const raw = t.raw('features_list');
    if (Array.isArray(raw)) messagesFeatures = raw;
  } catch (e) {
    console.error('Error loading features_list from translations:', e);
  }
  
  const filteredCmsFeatures = features.filter((f: any) => f && f.title);
  const displayFeatures = filteredCmsFeatures.length > 0 ? filteredCmsFeatures : messagesFeatures.filter((f: any) => f && f.title);

  return (
    <section id="features" className={`py-24 ${style.bg} ${style.text} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-black mb-6">
            {(content.title || (locale === 'ar' ? 'كل ما تحتاجه للنمو' : 'Everything you need to scale')).replace(/ \((EN|AR)\)$/, '')}
          </h2>
          <p className={`text-xl ${style.textMuted} max-w-2xl mx-auto`}>
            {content.content || (locale === 'ar' ? 'أدوات قوية مصممة لتجارة التجزئة والمطاعم الحديثة.' : 'Robust tools built for modern retail and hospitality operations.')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatures.map((feat, i) => (
            <div key={i} className={`p-8 rounded-3xl border ${style.isDark ? 'bg-white/5 border-border' : 'bg-white border-slate-100'} hover:-translate-y-2 transition-all duration-300 shadow-lg`}>
              <div className="text-4xl mb-6">{feat.icon}</div>
              <h4 className="text-xl font-bold mb-4">{feat.title}</h4>
              <p className={style.textMuted}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
