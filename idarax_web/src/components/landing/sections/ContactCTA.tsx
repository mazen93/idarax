'use client';

import { Mail, CheckCircle2 } from 'lucide-react';
import { ThemeMap, SectionStyle } from '../../../utils/theme';
import { CmsCta } from '../../../types/cms';

interface ContactCTAProps {
  content: CmsCta;
  style: SectionStyle;
  cTheme: ThemeMap;
  locale: string;
  contactForm: { name: string; email: string; message: string };
  setContactForm: (form: any) => void;
  submittingContact: boolean;
  contactSuccess: boolean;
  setContactSuccess: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ContactCTA({ 
  content, style, cTheme, locale, contactForm, setContactForm, 
  submittingContact, contactSuccess, setContactSuccess, onSubmit 
}: ContactCTAProps) {
  return (
    <section id="contact" className={`${style.bg} py-24 px-6 overflow-hidden relative transition-colors duration-500`}>
      <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 ${cTheme.bg600} opacity-20 blur-[120px] rounded-full`}></div>
      <div className={`absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 ${cTheme.bg400} opacity-10 blur-[120px] rounded-full`}></div>
      
      <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className={style.text}>
            <h2 className="text-5xl font-extrabold mb-8">{content.title || (locale === 'ar' ? 'تواصل معنا' : 'Get in Touch')}</h2>
            <p className={`text-xl ${style.textMuted} mb-8`}>{content.content}</p>
            <div className="flex items-center gap-4">
              <span className={cTheme.text400}><Mail /></span>
              <span>{content.contactEmail || 'hello@idarax.io'}</span>
            </div>
          </div>
          
           <div className="bg-white/5 border border-border rounded-3xl p-8 backdrop-blur-sm">
              {contactSuccess ? (
                <div className="text-center py-12">
                   <div className={`${cTheme.text400} mx-auto mb-4`}><CheckCircle2 className="w-16 h-16" /></div>
                   <h3 className="text-2xl font-bold mb-2 text-white">{locale === 'ar' ? 'شكراً لك!' : 'Thank you!'}</h3>
                   <p className="text-muted-foreground">{locale === 'ar' ? 'سنقوم بالرد عليك قريباً.' : 'We will reply soon.'}</p>
                   <button onClick={() => setContactSuccess(false)} className={`mt-6 ${cTheme.text400} font-bold underline`}>Send another</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <input required type="text" className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder={locale === 'ar' ? 'الاسم' : 'Name'} value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                  <input required type="email" className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                  <textarea required rows={4} className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" placeholder={locale === 'ar' ? 'رسالتك' : 'Message'} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                  <button disabled={submittingContact} className={`w-full ${cTheme.bg500} text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all`}>
                    {submittingContact ? (locale === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (locale === 'ar' ? 'إرسال الرسالة' : 'Send Message')}
                  </button>
                </form>
              )}
           </div>
      </div>
    </section>
  );
}
