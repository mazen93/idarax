'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Settings, Save, Mail, Clock, ShieldAlert, 
  HelpCircle, CheckCircle2, AlertTriangle 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function GlobalSettingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isRtl = locale === 'ar';
  
  const [settings, setSettings] = useState<any>({
    defaultTrialDays: 14,
    platformEmail: 'support@idarax.io',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/settings`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleUpdate = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/settings/${key}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ value })
      });
      if (res.ok) {
        setSettings({ ...settings, [key]: value });
        showToast(`✅ ${isRtl ? 'تم التحديث بنجاح' : 'Setting updated'}`);
      }
    } catch { showToast('❌ Failed to update'); }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-muted-foreground">{isRtl ? 'جاري التحميل...' : 'Loading settings...'}</div>;

  return (
    <div className={`p-10 text-slate-200 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: isRtl ? 'auto' : 24, left: isRtl ? 24 : 'auto', zIndex: 9999, padding: '12px 24px', borderRadius: 10, background: 'var(--success)', color: '#fff', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      <div className="mb-12">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          {isRtl ? 'الإعدادات العامة للنظام' : 'Global Platform Settings'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-medium leading-relaxed">
          {isRtl 
            ? 'تكوين المعلمات الافتراضية للمنصة، وإدارة وضع الصيانة، وتعيين تفاصيل دعم النظام.'
            : 'Configure default platform parameters, manage maintenance mode, and set system-wide support details.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Config */}
        <div className="bg-card/50 border border-border rounded-3xl p-8 space-y-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">{isRtl ? 'الإعدادات الأساسية' : 'Base Configuration'}</h3>
          </div>

          <div className="space-y-6">
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white/5 border border-border transition-all`}>
              <div>
                <p className="text-white font-bold text-lg mb-1">{isRtl ? 'وضع الصيانة' : 'Maintenance Mode'}</p>
                <p className="text-muted-foreground text-sm">{isRtl ? 'تقييد الوصول إلى المنصة أثناء التحديثات.' : 'Restrict platform access during system updates.'}</p>
              </div>
              <button 
                onClick={() => handleUpdate('maintenanceMode', !settings.maintenanceMode)}
                className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                  settings.maintenanceMode ? 'bg-error-500 text-white shadow-lg shadow-error-500/30' : 'bg-muted text-muted-foreground hover:bg-muted-foreground'
                }`}
              >
                {settings.maintenanceMode ? (isRtl ? 'نشط' : 'ENABLED') : (isRtl ? 'معطل' : 'DISABLED')}
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-border">
                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-4 block">
                    {isRtl ? 'الأيام الافتراضية للفترة التجريبية' : 'Default Trial Duration (Days)'}
                </label>
                <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        value={settings.defaultTrialDays} 
                        onChange={(e) => setSettings({...settings, defaultTrialDays: Number(e.target.value)})}
                        className="bg-background border border-border rounded-xl px-4 py-3 text-white font-bold w-24 outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button 
                        onClick={() => handleUpdate('defaultTrialDays', settings.defaultTrialDays)}
                        className="p-3 bg-primary hover:bg-primary-400 text-white rounded-xl transition-all active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Support & Communications */}
        <div className="bg-card/50 border border-border rounded-3xl p-8 space-y-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-white font-extrabold text-sm uppercase tracking-widest">{isRtl ? 'التواصل والدعم' : 'Support & Communications'}</h3>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-border">
                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-4 block">
                    {isRtl ? 'البريد الإلكتروني لدعم النظام' : 'System Support Email'}
                </label>
                <div className="flex items-center gap-4">
                    <input 
                        type="email" 
                        value={settings.platformEmail} 
                        onChange={(e) => setSettings({...settings, platformEmail: e.target.value})}
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-white font-bold outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="support@idarax.io"
                    />
                    <button 
                        onClick={() => handleUpdate('platformEmail', settings.platformEmail)}
                        className="p-3 bg-primary hover:bg-primary text-white rounded-xl transition-all active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-warning-500/5 border border-warning-500/10 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-warning-400 shrink-0" />
                <div>
                   <p className="text-warning-400 font-bold text-sm mb-1">{isRtl ? 'تنبيه الأمان' : 'Security Advisory'}</p>
                   <p className="text-muted-foreground text-xs leading-relaxed">
                        {isRtl 
                          ? 'تغيير الإعدادات العامة يؤثر على جميع المستأجرين على الفور. يرجى التأكد من المراجعة قبل الحفظ.'
                          : 'Changing global settings affects all tenants immediately. Please ensure you review your changes before saving.'
                        }
                   </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
