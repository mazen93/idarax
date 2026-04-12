import { ThemeMap, SectionStyle } from '../../../utils/theme';
import { CmsHeader } from '../../../types/cms';

interface FooterProps {
  headerData: CmsHeader;
  footerDesc: string;
  footerLinks: { heading: string; links: { label: string; href: string }[] }[];
  style: SectionStyle;
  cTheme: ThemeMap;
  isRtl: boolean;
}

export default function Footer({ headerData, footerDesc, footerLinks, style, cTheme, isRtl }: FooterProps) {
  return (
    <footer className={`${style.bg} ${style.text} pt-24 pb-12 px-6 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 border-b border-border pb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-8 h-8 ${cTheme.bg600} rounded-lg flex items-center justify-center`}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">{headerData.brandName || 'Idarax'}</span>
            </div>
            <p className={`${style.textMuted} max-w-xs mb-8`}>
              {footerDesc}
            </p>
          </div>

          {footerLinks.map((col, i) => (
            <div key={i}>
              <h5 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">{col.heading}</h5>
              <ul className="space-y-4">
                {(col.links || []).map((link, li) => (
                  <li key={li}>
                    <a href={link.href} className={`${style.textMuted} hover:text-white transition-colors`}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className={`pt-12 flex flex-col md:flex-row justify-between items-center gap-6 ${style.textMuted} text-xs font-semibold`}>
          <div>© {new Date().getFullYear()} Idarax Management Systems. {isRtl ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
