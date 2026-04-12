import { SectionStyle } from '../../../utils/theme';

interface SocialProofProps {
  content: { title?: string };
  brands: { name: string }[];
  style: SectionStyle;
  locale: string;
}

export default function SocialProof({ content, brands, style, locale }: SocialProofProps) {
  return (
    <section className={`${style.bg} py-12 border-y ${style.isDark ? 'border-border' : 'border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <p className={`text-center text-sm font-bold uppercase tracking-widest ${style.textMuted} mb-8`}>
          {content.title || (locale === 'ar' ? 'موثوق به في جميع أنحاء العالم' : 'Trusted by global restaurant groups')}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          {brands.map((b: any, i) => (
            b.logoUrl ? (
              <img key={i} src={b.logoUrl} alt={b.name} className="h-8 object-contain" />
            ) : (
              <span key={i} className={`text-xl font-black ${style.text}`}>{b.name}</span>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
