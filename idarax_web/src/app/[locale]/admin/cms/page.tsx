'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface Section { section: string; title: string; content?: string; items?: any; theme?: string; }

type Locale = 'en' | 'ar';

// Section type hints
const SECTION_HINTS: Record<string, string> = {
  theme_settings: 'Controls the GLOBAL brand color for buttons, links, and highlights across the ENTIRE website. This also controls the color glow in the Contact section.',
  hero: 'Controls Hero title, subtitle, badge text, primary/secondary CTA button labels, and hero screenshot URL.',
  header: 'Controls navigation links, brand name, login button label, and contact email.',
  trusted_by: 'Controls the "Trusted By" banner. Add brand names or logo URLs.',
  alternating_blocks: 'Controls the Z-pattern feature cards (POS, Kitchen, Marketing). Each block needs title, desc, bullets (array), color, and optional imageUrl.',
  features: 'Controls the features mini-grid. Each item needs icon (emoji), title, and desc.',
  pricing: 'Override pricing section heading and subtitle.',
  cta: '⭐ This is the CONTACT section at the bottom of the landing page. Edit the title, subtitle/body text here. Set "contactEmail" for the email link shown. Change "Section Background Theme" below to change the contact section background color.',
  footer: 'Controls footer columns and description.',
};

const SECTION_KEYS = ['theme_settings', 'hero', 'header', 'trusted_by', 'alternating_blocks', 'features', 'pricing', 'cta', 'footer'];

export default function CmsPage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [tab, setTab] = useState<'content' | 'plans'>('content');
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [editSection, setEditSection] = useState<Section | null>(null);


  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const cRes = await fetch(`${API_URL}/cms/content`, { headers });
      const cData = await cRes.json();
      setAllSections(Array.isArray(cData) ? cData : (cData.data ?? []));
    } catch { showToast('Failed to load CMS data', 'error'); }
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, []);

  // Filter sections by current locale prefix
  const sections = allSections.filter(s =>
    s.section.startsWith(`${locale}_`) || SECTION_KEYS.includes(s.section)
  );

  const saveSection = async () => {
    if (!editSection) return;
    try {
      await fetch(`${API_URL}/cms/content/${editSection.section}`, {
        method: 'PUT', headers, body: JSON.stringify({
          title: editSection.title,
          content: editSection.content,
          items: editSection.items,
          theme: editSection.theme || 'default'
        }),
      });
      setEditSection(null);
      showToast('Section saved!');
      fetchContent();
    } catch { showToast('Failed to save', 'error'); }
  };

  const createLocaleSection = async (key: string) => {
    const sectionKey = key === 'theme_settings' ? key : `${locale}_${key}`;
    await fetch(`${API_URL}/cms/content/${sectionKey}`, {
      method: 'PUT', headers, body: JSON.stringify({ title: `${key} (${locale.toUpperCase()})`, content: '', items: {} })
    });
    showToast(`Created section: ${sectionKey}`);
    fetchContent();
  };

  const deleteSection = async (section: string) => {
    if (!confirm(`Delete section "${section}"?`)) return;
    await fetch(`${API_URL}/cms/content/${section}`, { method: 'DELETE', headers });
    showToast('Section deleted'); fetchContent();
  };

  const updateHeroImage = (url: string) => {
    if (!editSection) return;
    setEditSection({ ...editSection, items: { ...(editSection.items || {}), imageUrl: url } });
  };

  const updateHeaderField = (field: string, value: string) => {
    if (!editSection) return;
    setEditSection({ ...editSection, items: { ...(editSection.items || {}), [field]: value } });
  };



  const updateTrustedBy = (index: number, field: string, value: string) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[index]) items[index] = { name: '' };
    items[index] = { ...items[index], [field]: value };
    setEditSection({ ...editSection, items });
  };

  const addTrustedBrand = () => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    items.push({ name: 'Brand Name', logoUrl: '' });
    setEditSection({ ...editSection, items });
  };

  const updateFeature = (index: number, field: string, value: string) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[index]) items[index] = { icon: '✨', title: '', desc: '' };
    items[index] = { ...items[index], [field]: value };
    setEditSection({ ...editSection, items });
  };

  const addFeature = () => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    items.push({ icon: '✨', title: 'New Feature', desc: 'Description' });
    setEditSection({ ...editSection, items });
  };

  const removeItem = (index: number) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    items.splice(index, 1);
    setEditSection({ ...editSection, items });
  };

  const addAltBlock = () => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    items.push({ title: 'New Block', desc: 'Description', color: 'blue', imageLeft: false, bullets: [] });
    setEditSection({ ...editSection, items });
  };

  const updateAltBlock = (index: number, field: string, value: any) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[index]) return;
    items[index] = { ...items[index], [field]: value };
    setEditSection({ ...editSection, items });
  };

  const addAltBullet = (blockIndex: number) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[blockIndex]) return;
    const bullets = Array.isArray(items[blockIndex].bullets) ? [...items[blockIndex].bullets] : [];
    bullets.push('New bullet');
    items[blockIndex] = { ...items[blockIndex], bullets };
    setEditSection({ ...editSection, items });
  };

  const updateAltBullet = (blockIndex: number, bulletIndex: number, value: string) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[blockIndex]) return;
    const bullets = Array.isArray(items[blockIndex].bullets) ? [...items[blockIndex].bullets] : [];
    bullets[bulletIndex] = value;
    items[blockIndex] = { ...items[blockIndex], bullets };
    setEditSection({ ...editSection, items });
  };

  const removeAltBullet = (blockIndex: number, bulletIndex: number) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[blockIndex]) return;
    const bullets = Array.isArray(items[blockIndex].bullets) ? [...items[blockIndex].bullets] : [];
    bullets.splice(bulletIndex, 1);
    items[blockIndex] = { ...items[blockIndex], bullets };
    setEditSection({ ...editSection, items });
  };

  const addFooterCol = () => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    items.push({ heading: 'New Column', links: [] });
    setEditSection({ ...editSection, items });
  };

  const updateFooterCol = (index: number, value: string) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[index]) return;
    items[index] = { ...items[index], heading: value };
    setEditSection({ ...editSection, items });
  };

  const addFooterLink = (colIndex: number) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[colIndex]) return;
    const links = Array.isArray(items[colIndex].links) ? [...items[colIndex].links] : [];
    links.push({ label: 'Label', href: '#' });
    items[colIndex] = { ...items[colIndex], links };
    setEditSection({ ...editSection, items });
  };

  const updateFooterLink = (colIndex: number, linkIndex: number, field: string, value: string) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[colIndex]) return;
    const links = Array.isArray(items[colIndex].links) ? [...items[colIndex].links] : [];
    links[linkIndex] = { ...links[linkIndex], [field]: value };
    items[colIndex] = { ...items[colIndex], links };
    setEditSection({ ...editSection, items });
  };

  const removeFooterLink = (colIndex: number, linkIndex: number) => {
    if (!editSection) return;
    const items = Array.isArray(editSection.items) ? [...editSection.items] : [];
    if (!items[colIndex]) return;
    const links = Array.isArray(items[colIndex].links) ? [...items[colIndex].links] : [];
    links.splice(linkIndex, 1);
    items[colIndex] = { ...items[colIndex], links };
    setEditSection({ ...editSection, items });
  };

  // Determine section base key
  const getSectionBase = (sectionKey: string) => {
    if (sectionKey.startsWith('en_')) return sectionKey.slice(3);
    if (sectionKey.startsWith('ar_')) return sectionKey.slice(3);
    return sectionKey;
  };


  const missingKeys = SECTION_KEYS.filter(key =>
    !allSections.find(s => s.section === `${locale}_${key}` || s.section === key)
  );

  return (
    <div style={{ padding: 32, maxWidth: 1100 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, padding: '12px 24px', borderRadius: 10, background: toast.type === 'success' ? 'var(--success)' : 'var(--error)', color: '#fff', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>Landing Page CMS</h1>
        <p style={{ color: '#64748b', marginTop: 6 }}>Control what visitors see on your public landing page — no code needed.</p>
      </div>

      {/* Locale + Tab Switchers */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Locale Toggle */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: '#1e293b', borderRadius: 12 }}>
          {(['en', 'ar'] as Locale[]).map(l => (
            <button key={l} onClick={() => setLocale(l)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: locale === l ? 'var(--success)' : 'transparent', color: locale === l ? '#fff' : '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}>
              {l === 'en' ? '🇬🇧 English' : '🇸🇦 العربية'}
            </button>
          ))}
        </div>

        </div>

      {loading ? (
        <div style={{ color: '#64748b', fontSize: 16 }}>Loading...</div>
      ) : tab === 'content' ? (
        <>
          {/* Missing section shortcuts */}
          {missingKeys.length > 0 && (
            <div style={{ padding: 16, borderRadius: 12, background: '#1e293b', border: '1px dashed rgba(124,58,237,0.4)', marginBottom: 24 }}>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>🚀 Quick-create missing sections for <strong style={{ color: '#a78bfa' }}>{locale.toUpperCase()}</strong>:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {missingKeys.map(key => (
                  <button key={key} onClick={() => createLocaleSection(key)} style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', fontSize: 13 }}>+ {key}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sections.map(sec => {
              const baseKey = getSectionBase(sec.section);
              const hint = SECTION_HINTS[baseKey];
              return (
                <div key={sec.section} style={{ padding: 24, borderRadius: 16, background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {editSection?.section === sec.section ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, padding: '3px 8px', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 4 }}>{sec.section}</span>
                        {hint && <span style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>{hint}</span>}
                      </div>

                      <input value={editSection.title || ''} onChange={e => setEditSection({ ...editSection, title: e.target.value })} placeholder="Section Title" style={inputSty} />
                      <textarea value={editSection.content || ''} onChange={e => setEditSection({ ...editSection, content: e.target.value })} placeholder="Section content/subtitle..." rows={2} style={{ ...inputSty, resize: 'vertical' }} />

                      {/* Section Background Theme Dropdown */}
                      {baseKey !== 'theme_settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <label style={{ ...labelSty, color: '#94a3b8' }}>Section Background Theme</label>
                          <select value={editSection.theme || 'default'} onChange={e => setEditSection({ ...editSection, theme: e.target.value })} style={{ ...inputSty, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                            <option value="default">Default Theme</option>
                            <option value="white">Clean White (Light)</option>
                            <option value="gray">Light Gray (Light)</option>
                            <option value="brand">Brand Color (Dark)</option>
                            <option value="slate">Dark Slate (Dark)</option>
                            <option value="pitch">Pitch Black (Dark)</option>
                          </select>
                        </div>
                      )}

                      {/* === Specialized editors === */}

                      {/* THEME SETTINGS */}
                      {baseKey === 'theme_settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          <label style={labelSty}>Primary Brand Color Palette</label>
                          <select value={(editSection.items as any)?.brandColor || 'emerald'} onChange={e => updateHeaderField('brandColor', e.target.value)} style={inputSty}>
                            <option value="emerald">Emerald (Green)</option>
                            <option value="blue">Blue</option>
                            <option value="indigo">Indigo</option>
                            <option value="violet">Violet (Purple)</option>
                            <option value="rose">Rose (Red/Pink)</option>
                            <option value="amber">Amber (Yellow/Orange)</option>
                            <option value="slate">Slate (Grayscale/Black)</option>
                          </select>
                        </div>
                      )}

                      {/* HERO */}
                      {baseKey === 'hero' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          <label style={labelSty}>Hero Image URL</label>
                          <input value={(editSection.items as any)?.imageUrl || ''} onChange={e => updateHeroImage(e.target.value)} placeholder="/pos-mockup.png or https://..." style={inputSty} />
                          <label style={labelSty}>Badge Text (small top badge)</label>
                          <input value={(editSection.items as any)?.badge || ''} onChange={e => updateHeaderField('badge', e.target.value)} placeholder="e.g. Meet the New Loyalty Engine" style={inputSty} />
                          <label style={labelSty}>Primary CTA Button Label</label>
                          <input value={(editSection.items as any)?.primaryCta || ''} onChange={e => updateHeaderField('primaryCta', e.target.value)} placeholder="Get Started for Free" style={inputSty} />
                          <label style={labelSty}>Secondary CTA Button Label</label>
                          <input value={(editSection.items as any)?.secondaryCta || ''} onChange={e => updateHeaderField('secondaryCta', e.target.value)} placeholder="Explore Products" style={inputSty} />
                        </div>
                      )}

                      {/* HEADER */}
                      {baseKey === 'header' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          <label style={labelSty}>Brand Name</label>
                          <input value={(editSection.items as any)?.brandName || ''} onChange={e => updateHeaderField('brandName', e.target.value)} placeholder="Idarax" style={inputSty} />
                          <label style={labelSty}>Contact Email (for "Contact" link)</label>
                          <input value={(editSection.items as any)?.contactEmail || ''} onChange={e => updateHeaderField('contactEmail', e.target.value)} placeholder="hello@idarax.io" style={inputSty} />
                          <label style={labelSty}>Login Button Label</label>
                          <input value={(editSection.items as any)?.loginLabel || ''} onChange={e => updateHeaderField('loginLabel', e.target.value)} placeholder="Log in" style={inputSty} />
                          <label style={labelSty}>CTA Button Label</label>
                          <input value={(editSection.items as any)?.ctaLabel || ''} onChange={e => updateHeaderField('ctaLabel', e.target.value)} placeholder="Book a Demo" style={inputSty} />
                          <div style={{ marginTop: 12 }}>
                            <label style={labelSty}>Navigation Links (Name → URL)</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {(Array.isArray(editSection.items) ? editSection.items : []).map((link: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <input value={link.label || ''} onChange={e => updateFeature(idx, 'label', e.target.value)} placeholder="Label" style={{ ...inputSty, flex: 1 }} />
                                  <input value={link.href || ''} onChange={e => updateFeature(idx, 'href', e.target.value)} placeholder="href e.g. #pricing" style={{ ...inputSty, flex: 2 }} />
                                  <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                              ))}
                              <button onClick={addFeature} style={{ padding: '6px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>+ Add Link</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TRUSTED BY */}
                      {baseKey === 'trusted_by' && (
                        <div style={{ marginTop: 8 }}>
                          <label style={labelSty}>Brands / Logos</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(Array.isArray(editSection.items) ? editSection.items : []).map((brand: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input value={brand.name || ''} onChange={e => updateTrustedBy(idx, 'name', e.target.value)} placeholder="Brand Name" style={{ ...inputSty, flex: 1 }} />
                                <input value={brand.logoUrl || ''} onChange={e => updateTrustedBy(idx, 'logoUrl', e.target.value)} placeholder="Logo URL (optional)" style={{ ...inputSty, flex: 2, fontSize: 12, opacity: 0.7 }} />
                                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 18 }}>×</button>
                              </div>
                            ))}
                            <button onClick={addTrustedBrand} style={{ padding: '6px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>+ Add Brand</button>
                          </div>
                        </div>
                      )}

                      {/* FEATURES GRID */}
                      {baseKey === 'features' && (
                        <div style={{ marginTop: 8 }}>
                          <label style={labelSty}>Feature Cards</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {(Array.isArray(editSection.items) ? editSection.items : []).map((feat: any, idx: number) => (
                              <div key={idx} style={{ padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <input value={feat.icon || ''} onChange={e => updateFeature(idx, 'icon', e.target.value)} style={{ width: 40, padding: 8, borderRadius: 6, border: 'none', background: 'var(--background)', color: '#fff', textAlign: 'center', fontSize: 18 }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <input value={feat.title || ''} onChange={e => updateFeature(idx, 'title', e.target.value)} placeholder="Feature Title" style={{ ...inputSty }} />
                                  <input value={feat.desc || ''} onChange={e => updateFeature(idx, 'desc', e.target.value)} placeholder="Description" style={{ ...inputSty, opacity: 0.7, fontSize: 12 }} />
                                </div>
                                <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 18 }}>×</button>
                              </div>
                            ))}
                            <button onClick={addFeature} style={{ padding: '8px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>+ Add Feature Card</button>
                          </div>
                        </div>
                      )}

                      {/* CTA / CONTACT */}
                      {baseKey === 'cta' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                          <label style={labelSty}>Contact Email (shows link on CTA section)</label>
                          <input value={(editSection.items as any)?.contactEmail || ''} onChange={e => updateHeaderField('contactEmail', e.target.value)} placeholder="hello@idarax.io" style={inputSty} />
                          <label style={labelSty}>CTA Button Label</label>
                          <input value={(editSection.items as any)?.buttonLabel || ''} onChange={e => updateHeaderField('buttonLabel', e.target.value)} placeholder="Start Your Free Trial Now" style={inputSty} />
                        </div>
                      )}

                      {/* ALTERNATING BLOCKS — Advanced Editor */}
                      {baseKey === 'alternating_blocks' && (
                        <div style={{ marginTop: 8 }}>
                          <label style={{ ...labelSty, fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Feature Blocks</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {(Array.isArray(editSection.items) ? editSection.items : []).map((block: any, idx: number) => (
                              <div key={idx} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>Block {idx + 1}</span>
                                  <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                                <input value={block.title || ''} onChange={e => updateAltBlock(idx, 'title', e.target.value)} placeholder="Title" style={inputSty} />
                                <textarea value={block.desc || ''} onChange={e => updateAltBlock(idx, 'desc', e.target.value)} placeholder="Description" rows={2} style={{ ...inputSty, resize: 'vertical' }} />
                                
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                  <select value={block.color || 'blue'} onChange={e => updateAltBlock(idx, 'color', e.target.value)} style={{ ...inputSty, width: 'auto', padding: '8px 12px' }}>
                                    <option value="blue">Blue Outline</option>
                                    <option value="emerald">Emerald Outline</option>
                                    <option value="purple">Purple Outline</option>
                                  </select>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={block.imageLeft || false} onChange={e => updateAltBlock(idx, 'imageLeft', e.target.checked)} />
                                    Image on Left
                                  </label>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  <label style={labelSty}>Block Image URL</label>
                                  <input 
                                    value={block.imageUrl || ''} 
                                    onChange={e => updateAltBlock(idx, 'imageUrl', e.target.value)} 
                                    placeholder="https://images.unsplash.com/photo-... or /mockup.png" 
                                    style={{ ...inputSty, fontSize: 12 }} 
                                  />
                                </div>

                                <div style={{ marginTop: 8 }}>
                                  <label style={{ ...labelSty, marginBottom: 4 }}>Bullets</label>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {(Array.isArray(block.bullets) ? block.bullets : []).map((b: string, bIdx: number) => (
                                      <div key={bIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <input value={b || ''} onChange={e => updateAltBullet(idx, bIdx, e.target.value)} style={{ ...inputSty, flex: 1 }} />
                                        <button onClick={() => removeAltBullet(idx, bIdx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 16 }}>×</button>
                                      </div>
                                    ))}
                                    <button onClick={() => addAltBullet(idx)} style={{ padding: '6px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>+ Add Bullet</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button onClick={addAltBlock} style={{ padding: '8px', border: '1px dashed rgba(124,58,237,0.4)', borderRadius: 8, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add Feature Block</button>
                          </div>
                        </div>
                      )}

                      {/* FOOTER — Advanced Editor */}
                      {baseKey === 'footer' && (
                        <div style={{ marginTop: 8 }}>
                          <label style={{ ...labelSty, fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>Footer Columns</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {(Array.isArray(editSection.items) ? editSection.items : []).map((col: any, idx: number) => (
                              <div key={idx} style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <input value={col.heading || ''} onChange={e => updateFooterCol(idx, e.target.value)} placeholder="Column Heading (e.g. Company)" style={{ ...inputSty, flex: 1, fontWeight: 700 }} />
                                  <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 18 }}>×</button>
                                </div>
                                
                                <div style={{ marginTop: 4, paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {(Array.isArray(col.links) ? col.links : []).map((link: any, lIdx: number) => (
                                      <div key={lIdx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input value={link.label || ''} onChange={e => updateFooterLink(idx, lIdx, 'label', e.target.value)} placeholder="Label" style={{ ...inputSty, flex: 1, fontSize: 13, padding: '8px 10px' }} />
                                        <input value={link.href || ''} onChange={e => updateFooterLink(idx, lIdx, 'href', e.target.value)} placeholder="URL (#pricing)" style={{ ...inputSty, flex: 2, fontSize: 13, padding: '8px 10px' }} />
                                        <button onClick={() => removeFooterLink(idx, lIdx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 16 }}>×</button>
                                      </div>
                                    ))}
                                    <button onClick={() => addFooterLink(idx)} style={{ padding: '6px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, marginTop: 4, width: 'max-content' }}>+ Add Link</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button onClick={addFooterCol} style={{ padding: '8px', border: '1px dashed rgba(124,58,237,0.4)', borderRadius: 8, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Add Footer Column</button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={saveSection} style={{ padding: '8px 20px', borderRadius: 7, background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Save</button>
                        <button onClick={() => setEditSection(null)} style={{ padding: '8px 20px', borderRadius: 7, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, padding: '3px 8px', border: '1px solid rgba(124,58,237,0.4)', borderRadius: 4 }}>{sec.section}</span>
                          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 16 }}>{sec.title}</span>
                        </div>
                        {sec.content && <p style={{ color: '#64748b', margin: 0, fontSize: 14, maxWidth: 700, lineHeight: 1.6 }}>{sec.content.substring(0, 150)}{sec.content.length > 150 ? '...' : ''}</p>}
                        {hint && <p style={{ color: '#334155', fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>{hint}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                        <button onClick={() => setEditSection(sec)} style={{ padding: '7px 16px', borderRadius: 7, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', cursor: 'pointer', fontSize: 13 }}>Edit</button>
                        <button onClick={() => deleteSection(sec.section)} style={{ padding: '7px 16px', borderRadius: 7, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: 13 }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {sections.length === 0 && <p style={{ color: '#475569', fontSize: 15 }}>No sections yet for {locale.toUpperCase()}. Use the quick-create buttons above.</p>}
          </div>
        </>
      ) : null}
    </div>
  );
}

const inputSty: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
  background: 'var(--background)', color: '#f1f5f9', fontSize: 14, width: '100%', boxSizing: 'border-box',
};

const labelSty: React.CSSProperties = {
  fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4, marginTop: 6,
};
