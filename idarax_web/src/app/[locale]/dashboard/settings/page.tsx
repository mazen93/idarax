'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Store, MonitorPlay, Receipt, Save, Server, Percent, DollarSign, Image, FileText, Plus, CheckCircle2, ExternalLink, Globe, Printer, Trash2, Network, Bluetooth, Usb, Shield, Clock, Users, X, AlertCircle, Truck, Lock as LockIcon } from 'lucide-react';
import { getHeaders, hasFeature, isRetail } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useLanguage } from '@/components/LanguageContext';
import { useUpgradeModal } from '@/components/UpgradeModal';
import ReceiptTemplate from '@/components/ReceiptTemplate';
import Cookies from 'js-cookie';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const mockOrder = {
    id: 'ORDER-123456',
    receiptNumber: 125,
    createdAt: new Date().toISOString(),
    orderType: 'DINE IN',
    table: { number: '05' },
    customer: { name: 'John Doe' },
    items: [
        { name: 'Classic Burger', price: 15.00, quantity: 2 },
        { name: 'French Fries', price: 5.00, quantity: 1 }
    ],
    taxAmount: 1.50,
    serviceFeeAmount: 2.00,
    totalAmount: 33.50,
    paymentMethod: 'CASH'
};

export default function SettingsPage() {
    const { t, isRTL } = useLanguage();
    const { openUpgradeModal } = useUpgradeModal();
    const [tab, setTab] = useState<'profile' | 'kds' | 'receipts' | 'taxes' | 'devices' | 'branches' | 'integrations' | 'zatca'>('profile');

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        currency: 'USD', timezone: 'UTC',
        taxRate: '0', serviceFee: '0',
        logoUrl: '', receiptHeader: '', receiptFooter: '',
        receiptShowLogo: true, receiptShowTable: true, receiptShowCustomer: true,
        receiptShowOrderNumber: true, receiptFontSize: 12, receiptQrCodeUrl: '',
        receiptLanguage: 'en',
        receiptShowTimestamp: true, receiptShowOrderType: true, receiptShowOperator: true,
        receiptShowItemsDescription: true, receiptShowItemsQty: true, receiptShowItemsPrice: true,
        receiptShowSubtotal: true, receiptShowTax: true, receiptShowServiceCharge: true,
        receiptShowDiscount: true, receiptShowTotal: true, receiptShowPaymentMethod: true,
        receiptShowBarcode: true,
        drovoTenantId: '',
        drovoApiKey: '',
        preOrderEnabled: false,
        preOrderMaxDaysAhead: 7,
        preOrderLeadMinutes: 30,
        requireOpenShift: false,
        requireOpenDrawer: false,
        zatcaVatNumber: '', zatcaSellerNameAr: '', zatcaSellerNameEn: '', 
        zatcaPhase: 1, zatcaIsOnboarded: false
    });

    // Store profile (from Tenant entity, managed separately)
    const [profile, setProfile] = useState({ id: '', name: '', domain: '', slug: '', customDomain: '' });

    // KDS stations
    const [stations, setStations] = useState<any[]>([]);
    const [newStation, setNewStation] = useState('');
    const [staff, setStaff] = useState<any[]>([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [loadingPrinters, setLoadingPrinters] = useState(false);
    const [assigningStaffTo, setAssigningStaffTo] = useState<string | null>(null);
    const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

    // Printer devices
    const [printers, setPrinters] = useState<any[]>([]);
    const [newPrinter, setNewPrinter] = useState({ name: '', type: 'THERMAL', interface: 'NETWORK', address: '' });

    const [branches, setBranches] = useState<any[]>([]);
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });
    const [loadingBranches, setLoadingBranches] = useState(false);
    
    // Branch Settings UI
    const [configuringBranch, setConfiguringBranch] = useState<any>(null);
    const [branchSettings, setBranchSettings] = useState<any>({});
    const [loadingBranchSettings, setLoadingBranchSettings] = useState(false);
    const [savingBranchSettings, setSavingBranchSettings] = useState(false);

    // Auth state for restriction
    const [userRole, setUserRole] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');

    const [origin, setOrigin] = useState('');
    const loaded = useRef(false);

    useEffect(() => {
        setOrigin(window.location.origin);
        const rawRole = (localStorage.getItem('user_role') || '').trim();
        const cleanRole = rawRole.replace(/^["']|["']$/g, '').toUpperCase();
        setUserRole(cleanRole);
        setUserEmail((localStorage.getItem('user_email') || '').trim().toLowerCase());
    }, []);


    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        fetchSettings();
        fetchStations();
        fetchPrinters();
        fetchStaff();
        fetchBranches();
    }, []);


    const fetchSettings = async () => {
        try {
            const res = await fetchWithAuth('/tenant/settings');
            if (res.ok) {
                const response = await res.json();
                const data = response.data || response;
                setSettings({
                    currency: data.currency || 'USD',
                    timezone: data.timezone || 'UTC',
                    taxRate: String(data.taxRate ?? '0'),
                    serviceFee: String(data.serviceFee ?? '0'),
                    logoUrl: data.logoUrl || '',
                    receiptHeader: data.receiptHeader || '',
                    receiptFooter: data.receiptFooter || '',
                    receiptShowLogo: data.receiptShowLogo ?? true,
                    receiptShowTable: data.receiptShowTable ?? true,
                    receiptShowCustomer: data.receiptShowCustomer ?? true,
                    receiptShowOrderNumber: data.receiptShowOrderNumber ?? true,
                    receiptFontSize: data.receiptFontSize || 12,
                    receiptQrCodeUrl: data.receiptQrCodeUrl || '',
                    receiptLanguage: data.receiptLanguage || 'en',
                    receiptShowTimestamp: data.receiptShowTimestamp ?? true,
                    receiptShowOrderType: data.receiptShowOrderType ?? true,
                    receiptShowOperator: data.receiptShowOperator ?? true,
                    receiptShowItemsDescription: data.receiptShowItemsDescription ?? true,
                    receiptShowItemsQty: data.receiptShowItemsQty ?? true,
                    receiptShowItemsPrice: data.receiptShowItemsPrice ?? true,
                    receiptShowSubtotal: data.receiptShowSubtotal ?? true,
                    receiptShowTax: data.receiptShowTax ?? true,
                    receiptShowServiceCharge: data.receiptShowServiceCharge ?? true,
                    receiptShowDiscount: data.receiptShowDiscount ?? true,
                    receiptShowTotal: data.receiptShowTotal ?? true,
                    receiptShowPaymentMethod: data.receiptShowPaymentMethod ?? true,
                    receiptShowBarcode: data.receiptShowBarcode ?? true,
                    drovoTenantId: data.drovoTenantId || '',
                    drovoApiKey: data.drovoApiKey || '',
                    preOrderEnabled: data.preOrderEnabled ?? false,
                    preOrderMaxDaysAhead: data.preOrderMaxDaysAhead ?? 7,
                    preOrderLeadMinutes: data.preOrderLeadMinutes ?? 30,
                    requireOpenShift: data.requireOpenShift ?? false,
                    requireOpenDrawer: data.requireOpenDrawer ?? false,
                    zatcaVatNumber: data.zatcaVatNumber || '',
                    zatcaSellerNameAr: data.zatcaSellerNameAr || '',
                    zatcaSellerNameEn: data.zatcaSellerNameEn || '',
                    zatcaPhase: data.zatcaPhase || 1,
                    zatcaIsOnboarded: data.zatcaIsOnboarded || false
                });
                if (data.tenant) {
                    setProfile({
                        id: data.tenant.id,
                        name: data.tenant.name,
                        domain: data.tenant.domain || '',
                        slug: data.tenant.slug || '',
                        customDomain: data.tenant.customDomain || ''
                    });
                }
            }
        } catch { }
    };

    const fetchStations = async () => {
        setLoadingStations(true);
        try {
            const res = await fetchWithAuth('/restaurant/kds/stations');
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setStations(Array.isArray(d) ? d : []);
            }
        } catch {}
        setLoadingStations(false);
    };

    const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
            const res = await fetchWithAuth('/users');
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setStaff(Array.isArray(d) ? d : []);
            }
        } catch {}
        setLoadingStaff(false);
    };

    const fetchPrinters = async () => {
        setLoadingPrinters(true);
        try {
            const res = await fetchWithAuth('/restaurant/printers');
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setPrinters(Array.isArray(d) ? d : []);
            }
        } catch {}
        setLoadingPrinters(false);
    };

    const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
            const res = await fetchWithAuth('/branches');
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setBranches(Array.isArray(d) ? d : []);
            }
        } catch {}
        setLoadingBranches(false);
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetchWithAuth('/tenant/settings', {
                method: 'PATCH',
                body: JSON.stringify({
                    ...settings,
                    name: profile.name,
                    slug: profile.slug,
                    customDomain: profile.customDomain,
                    taxRate: parseFloat(settings.taxRate),
                    serviceFee: parseFloat(settings.serviceFee)
                })
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch { }
        setSaving(false);
    };

    const handleCreateStation = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchWithAuth('/restaurant/kds/stations', {
            method: 'POST',
            body: JSON.stringify({ name: newStation })
        });
        setNewStation('');
        fetchStations();
    };

    const handleAssignStaff = async () => {
        if (!assigningStaffTo) return;
        try {
            const res = await fetchWithAuth(`/restaurant/kds/stations/${assigningStaffTo}/staff`, {
                method: 'POST',
                body: JSON.stringify({ staffIds: selectedStaffIds })
            });
            if (res.ok) {
                setAssigningStaffTo(null);
                fetchStations();
            }
        } catch { }
    };

    const handleCreatePrinter = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchWithAuth('/restaurant/printers', {
            method: 'POST',
            body: JSON.stringify(newPrinter)
        });
        setNewPrinter({ name: '', type: 'THERMAL', interface: 'NETWORK', address: '' });
        fetchPrinters();
    };

    const handleDeletePrinter = async (id: string) => {
        if (!confirm('Are you sure you want to remove this printer?')) return;
        await fetchWithAuth(`/restaurant/printers/${id}`, { method: 'DELETE' });
        fetchPrinters();
    };

    const handleCreateBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchWithAuth('/branches', {
            method: 'POST',
            body: JSON.stringify({ ...newBranch, isActive: true })
        });
        setNewBranch({ name: '', address: '', phone: '' });
        fetchBranches();
    };

    const handleDeleteBranch = async (id: string) => {
        if (!confirm('Are you sure you want to delete this branch?')) return;
        await fetchWithAuth(`/branches/${id}`, { method: 'DELETE' });
        fetchBranches();
    };

    const handleOpenConfigureBranch = async (branch: any) => {
        setBranchSettings({}); // Reset state to prevent leakage
        setLoadingBranchSettings(true);
        setConfiguringBranch(branch);
        try {
            const res = await fetchWithAuth(`/tenant/branches/${branch.id}/settings`);
            if (res.ok) {
                const raw = await res.json();
                const data = raw.data || raw;
                setBranchSettings({
                    isActive: data.isActive || false,
                    taxRate: data.taxRate !== null && data.taxRate !== undefined ? String(data.taxRate) : '',
                    serviceFee: data.serviceFee !== null && data.serviceFee !== undefined ? String(data.serviceFee) : '',
                    receiptHeader: data.receiptHeader || '',
                    receiptFooter: data.receiptFooter || '',
                    preOrderEnabled: data.preOrderEnabled || false,
                    preOrderMaxDaysAhead: data.preOrderMaxDaysAhead || 7,
                    preOrderLeadMinutes: data.preOrderLeadMinutes || 30,
                    requireOpenShift: data.requireOpenShift || false,
                    requireOpenDrawer: data.requireOpenDrawer || false,
                });
            } else {
                setBranchSettings({ isActive: false });
            }
        } catch (error) {
            setBranchSettings({ isActive: false });
        } finally {
            setLoadingBranchSettings(false);
        }
    };

    const handleSaveBranchSettings = async () => {
        setSavingBranchSettings(true);
        try {
            const payload: any = {
                isActive: branchSettings.isActive
            };
            if (branchSettings.taxRate?.trim() !== '' && branchSettings.taxRate !== undefined) payload.taxRate = parseFloat(branchSettings.taxRate);
            if (branchSettings.serviceFee?.trim() !== '' && branchSettings.serviceFee !== undefined) payload.serviceFee = parseFloat(branchSettings.serviceFee);
            if (branchSettings.receiptHeader?.trim() !== '' && branchSettings.receiptHeader !== undefined) payload.receiptHeader = branchSettings.receiptHeader;
            if (branchSettings.receiptFooter?.trim() !== '' && branchSettings.receiptFooter !== undefined) payload.receiptFooter = branchSettings.receiptFooter;
            
            payload.preOrderEnabled = branchSettings.preOrderEnabled;
            payload.preOrderMaxDaysAhead = parseInt(branchSettings.preOrderMaxDaysAhead);
            payload.preOrderLeadMinutes = parseInt(branchSettings.preOrderLeadMinutes);
            payload.requireOpenShift = branchSettings.requireOpenShift;
            payload.requireOpenDrawer = branchSettings.requireOpenDrawer;

            await fetchWithAuth(`/tenant/branches/${configuringBranch.id}/settings`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setConfiguringBranch(null);
            alert('Branch Settings correctly overriden!');
        } catch {}
        setSavingBranchSettings(false);
    };

    const tabs = [
        { id: 'profile', label: t('store_profile_tab'), Icon: Store },
        { id: 'taxes', label: t('taxes_fees_tab'), Icon: Percent },
        { id: 'kds', label: t('kds_routing_tab'), Icon: MonitorPlay },
        { id: 'receipts', label: t('receipt_design_tab'), Icon: Receipt },
        { id: 'devices', label: t('devices_tab'), Icon: Printer },
        { id: 'integrations', label: 'Delivery Integrations', Icon: Truck },
        { id: 'zatca', label: 'Fiscal (ZATCA)', Icon: Shield },
    ].filter(tab => isRetail() ? tab.id !== 'kds' : true);

    const isOwner = userRole.includes('ADMIN') || userRole.includes('OWNER') || userRole.includes('MANAGER') || userEmail === 'demo@restaurant.com';
    
    if (isOwner) {
        tabs.push({ id: 'branches' as any, label: 'Branches', Icon: Network });
    }

    const securityLinks = [
        { href: '/dashboard/settings/sessions', label: 'Active Sessions', Icon: Shield },
    ];


    return (
        <div className="text-foreground min-h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('settings_title')}</h1>
                <p className="text-muted-foreground text-lg">{t('settings_subtitle')}</p>
            </div>

            <div className="flex bg-card border border-border rounded-xl overflow-hidden min-h-[640px] shadow-sm">

                {/* Sidebar */}
                <div className={`w-64 bg-muted p-4 ${isRTL ? 'border-l border-border' : 'border-r border-border'}`}>
                    <nav className="space-y-1">
                        {tabs.map(({ id, label, Icon }) => (
                            <button key={id} onClick={() => setTab(id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <Icon className="h-5 w-5" /> {label}
                            </button>
                        ))}
                        {/* Security Section */}
                        <div className="pt-3 mt-3 border-t border-border">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground px-4 pb-2 tracking-widest">Security</p>
                            {securityLinks.map(({ href, label, Icon }) => (
                                <Link key={href} href={href} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                    <Icon className="h-5 w-5" /> {label}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-8">

                    {/* ─── Store Profile ─── */}
                    {tab === 'profile' && (
                        <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-bold text-foreground">{t('general_store_info')}</h2>

                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('store_logo_url')}</label>
                                <div className="flex gap-4 items-start">
                                    {settings.logoUrl && (
                                        <img src={settings.logoUrl} alt="logo" className="h-20 w-20 object-contain rounded-xl bg-background border border-border p-2" />
                                    )}
                                    {!settings.logoUrl && (
                                        <div className="h-20 w-20 flex items-center justify-center rounded-xl bg-background border border-dashed border-border">
                                            <Image className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input
                                            type="url"
                                            placeholder="https://yourstore.com/logo.png"
                                            value={settings.logoUrl}
                                            onChange={e => setSettings({ ...settings, logoUrl: e.target.value })}
                                            className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary ${isRTL ? 'pr-4 pl-2' : 'px-4'}`}
                                        />
                                        <p className="text-xs text-muted-foreground">{t('logo_help_text') || 'Paste a direct link to your logo image. Shown on receipts and customer portals.'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Public Website Link */}
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Globe className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-foreground font-bold">{t('public_ordering_website')}</h3>
                                        <p className="text-xs text-muted-foreground">{t('public_ordering_subtitle') || 'Your unique menu URL for customers'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-primary font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                                        {origin}/m/{profile.slug || profile.id || 'your-id'}
                                    </div>
                                    <a
                                        href={`/m/${profile.slug || profile.id}`}
                                        target="_blank"
                                        className="px-4 py-2.5 bg-muted hover:bg-border text-foreground rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        {t('visit_btn')} <ExternalLink className="h-4 w-4" />
                                    </a>
                                </div>
                                <p className="mt-3 text-xs text-muted-foreground italic">{t('public_ordering_help') || 'Share this link on your social media, QR codes, or marketing materials.'}</p>
                            </div>

                            {/* Branded URLs */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ordering Slug</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. hookah-lounge"
                                            value={profile.slug}
                                            onChange={e => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                            className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary ${isRTL ? 'pr-3 pl-3' : 'px-3'}`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Unique identifier for your URL (letters, numbers, and dashes only).</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Domain</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="e.g. orders.myrestaurant.com"
                                            value={profile.customDomain}
                                            onChange={e => setProfile({ ...profile, customDomain: e.target.value.toLowerCase().trim() })}
                                            className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary ${isRTL ? 'pr-3 pl-3' : 'px-3'}`}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Point your CNAME or A record to our servers to use your own domain.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('default_currency')}</label>
                                    <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground appearance-none">
                                        <option value="USD">USD – US Dollar</option>
                                        <option value="EUR">EUR – Euro</option>
                                        <option value="GBP">GBP – British Pound</option>
                                        <option value="EGP">EGP – Egyptian Pound</option>
                                        <option value="SAR">SAR – Saudi Riyal</option>
                                        <option value="AED">AED – UAE Dirham</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('timezone')}</label>
                                    <select value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground appearance-none">
                                        <option value="UTC">UTC</option>
                                        <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                                        <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                                        <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                                        <option value="Europe/London">Europe/London</option>
                                        <option value="America/New_York">America/New_York</option>
                                        <option value="America/Chicago">America/Chicago</option>
                                        <option value="America/Los_Angeles">America/Los_Angeles</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pre-Order Settings */}
                            <div className="pt-6 border-t border-border space-y-4">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" /> {t('pre_order_settings') || 'Pre-Order Management'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">{t('enable_pre_orders') || 'Enable Pre-Orders'}</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{t('pre_order_desc') || 'Allow customers to schedule orders for later date/time.'}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.preOrderEnabled || false}
                                                onChange={(e) => setSettings({...settings, preOrderEnabled: e.target.checked})}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                                        </label>
                                    </div>

                                    {settings.preOrderEnabled && (
                                        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('max_days_ahead') || 'Max Days Ahead'}</label>
                                                <input
                                                    type="number"
                                                    value={settings.preOrderMaxDaysAhead}
                                                    onChange={e => setSettings({ ...settings, preOrderMaxDaysAhead: parseInt(e.target.value) })}
                                                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('lead_firing_minutes') || 'Lead Firing Minutes'}</label>
                                                <input
                                                    type="number"
                                                    value={settings.preOrderLeadMinutes}
                                                    onChange={e => setSettings({ ...settings, preOrderLeadMinutes: parseInt(e.target.value) })}
                                                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                />
                                                <p className="text-[9px] text-muted-foreground italic">Fires to kitchen X mins before slot.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Operational Enforcement */}
                            <div className="pt-6 border-t border-border space-y-4">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" /> Operational Enforcement
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">Require Open Shift</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Staff must clock-in before creating orders.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.requireOpenShift || false}
                                                onChange={(e) => setSettings({...settings, requireOpenShift: e.target.checked})}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">Require Open Drawer</h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">Cash drawer must be open before creating orders.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.requireOpenDrawer || false}
                                                onChange={(e) => setSettings({...settings, requireOpenDrawer: e.target.checked})}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {saved ? <><CheckCircle2 className="h-4 w-4" /> {t('saved') || 'Saved!'}</> : <><Save className="h-4 w-4" /> {t('save_changes')}</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ─── Taxes & Fees ─── */}
                    {tab === 'taxes' && (
                        <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-bold text-foreground">{t('taxes_service_fees')}</h2>
                            <p className="text-muted-foreground text-sm">{t('taxes_subtitle')}</p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-background border border-border rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-warning-500/10 border border-warning-500/20 p-2 rounded-lg"><Percent className="h-5 w-5 text-warning-500" /></div>
                                        <div>
                                            <h3 className="text-foreground font-semibold">{t('tax_rate') || 'Tax Rate'}</h3>
                                            <p className="text-xs text-muted-foreground">{t('vat_sales_tax') || 'VAT / Sales Tax'}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.01" min="0" max="100"
                                            value={settings.taxRate}
                                            onChange={e => setSettings({ ...settings, taxRate: e.target.value })}
                                            className={`w-full bg-input border border-border rounded-lg py-3 text-foreground text-xl font-bold outline-none focus:border-warning-500 ${isRTL ? 'pl-10 pr-4' : 'px-4 pr-10'}`}
                                        />
                                        <span className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold ${isRTL ? 'left-4' : 'right-4'}`}>%</span>
                                    </div>
                                </div>

                                <div className="bg-background border border-border rounded-xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg"><DollarSign className="h-5 w-5 text-primary" /></div>
                                        <div>
                                            <h3 className="text-foreground font-semibold">{t('service_fee') || 'Service Fee'}</h3>
                                            <p className="text-xs text-muted-foreground">{t('applied_per_order') || 'Applied per order'}</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number" step="0.01" min="0"
                                            value={settings.serviceFee}
                                            onChange={e => setSettings({ ...settings, serviceFee: e.target.value })}
                                            className={`w-full bg-input border border-border rounded-lg py-3 text-foreground text-xl font-bold outline-none focus:border-primary ${isRTL ? 'pr-10 pl-4' : 'px-4 pl-10'}`}
                                        />
                                        <span className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold ${isRTL ? 'right-4' : 'left-4'}`}>{settings.currency}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-background border border-border rounded-xl text-sm text-muted-foreground">
                                <p className="font-semibold text-foreground mb-1">{t('preview_order_total') || 'Preview: Order Total Breakdown'}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between"><span>{t('subtotal')}</span><span>100.00</span></div>
                                    <div className="flex justify-between text-warning-500"><span>{t('tax')} ({settings.taxRate}%)</span><span>{(100 * parseFloat(settings.taxRate || '0') / 100).toFixed(2)}</span></div>
                                    <div className="flex justify-between text-primary"><span>{t('service_fee') || 'Service Fee'}</span><span>{parseFloat(settings.serviceFee || '0').toFixed(2)}</span></div>
                                    <div className="flex justify-between text-foreground font-bold border-t border-border pt-1 mt-1">
                                        <span>{t('total')}</span>
                                        <span>{(100 + 100 * parseFloat(settings.taxRate || '0') / 100 + parseFloat(settings.serviceFee || '0')).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {saved ? <><CheckCircle2 className="h-4 w-4" /> {t('saved')}</> : <><Save className="h-4 w-4" /> {t('save_tax_settings') || 'Save Tax Settings'}</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ─── KDS Routing ─── */}
                    {tab === 'kds' && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-foreground">{t('kds_stations_title')}</h2>
                                {assigningStaffTo && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setAssigningStaffTo(null)} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">{t('cancel')}</button>
                                        <button onClick={handleAssignStaff} className="px-6 py-2 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors">{t('save_assignment') || 'Save Assignment'}</button>
                                    </div>
                                )}
                            </div>

                            {assigningStaffTo ? (
                                <div className="bg-card border border-border rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Assign Staff to {stations.find(s => s.id === assigningStaffTo)?.name}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Array.isArray(staff) && staff.map(s => (
                                            <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedStaffIds.includes(s.id) ? 'bg-primary/10 border-primary' : 'bg-background border-border hover:border-slate-600'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStaffIds.includes(s.id)}
                                                    onChange={e => {
                                                        if (e.target.checked) setSelectedStaffIds([...selectedStaffIds, s.id]);
                                                        else setSelectedStaffIds(selectedStaffIds.filter(id => id !== s.id));
                                                    }}
                                                    className="w-4 h-4 accent-success-500"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white">{s.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-black">{s.role}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-card border border-border rounded-xl p-6 mb-6">
                                        <h3 className="text-sm font-semibold text-foreground mb-3">{t('add_station')}</h3>
                                        <form onSubmit={handleCreateStation} className="flex gap-4">
                                            <input required placeholder={t('kds_placeholder') || 'E.g. Grill Station, Bar, Assembly'} value={newStation} onChange={e => setNewStation(e.target.value)} className={`flex-1 bg-input border border-border rounded-lg py-2 text-foreground outline-none focus:border-primary ${isRTL ? 'pl-4 pr-3' : 'px-4'}`} />
                                            <button type="submit" className="px-5 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium border border-border flex items-center gap-2 transition-colors">
                                                <Plus className="h-4 w-4" /> {t('add') || 'Add'}
                                            </button>
                                        </form>
                                    </div>
                                    <div className="space-y-3">
                                        {!Array.isArray(stations) || stations.length === 0
                                            ? <div className="text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground">{t('no_stations')}</div>
                                            : (Array.isArray(stations) ? stations : []).map(s => (
                                                <div key={s.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-primary/10 border border-primary/20 p-2.5 rounded-lg"><Server className="h-5 w-5 text-primary" /></div>
                                                        <div>
                                                            <h4 className="text-foreground font-medium">{s.name}</h4>
                                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                {Array.isArray(s.assignedStaff) && s.assignedStaff.length > 0 ? s.assignedStaff.map((st: any) => (
                                                                    <span key={st.id} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-slate-700">{st.name}</span>
                                                                )) : <span className="text-[9px] text-muted-foreground italic pb-1">No staff assigned</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setAssigningStaffTo(s.id);
                                                            setSelectedStaffIds(s.assignedStaff?.map((st: any) => st.id) || []);
                                                        }}
                                                        className="text-xs text-success-600 hover:text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full transition-colors"
                                                    >
                                                        {t('assign_staff') || 'Assign Staff'}
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ─── Receipt Design ─── */}
                    {tab === 'receipts' && (
                        <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-bold text-foreground">{t('receipt_customization')}</h2>
                            <p className="text-muted-foreground text-sm">{t('receipt_subtitle')}</p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-2">{t('receipt_language') || 'Receipt Language'}</h3>
                                    <select
                                        value={settings.receiptLanguage}
                                        onChange={e => setSettings({ ...settings, receiptLanguage: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground appearance-none outline-none focus:border-primary"
                                    >
                                        <option value="en">English</option>
                                        <option value="ar">Arabic (العربية)</option>
                                    </select>

                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-2 mt-6">{t('header_info_visibility') || 'Header & Info Visibility'}</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'receiptShowLogo', label: t('show_store_logo') || 'Show Store Logo' },
                                            { id: 'receiptShowTimestamp', label: t('show_timestamp') || 'Show Order Timestamp' },
                                            { id: 'receiptShowOrderType', label: t('show_order_type') || 'Show Order Type (Dine-in, etc)' },
                                            { id: 'receiptShowOrderNumber', label: t('show_order_number') || 'Show Order ID/Number' },
                                            { id: 'receiptShowTable', label: t('show_table_number') || 'Show Table Number', hidden: isRetail() },
                                            { id: 'receiptShowOperator', label: t('show_operator_name') || 'Show Operator Name' },
                                            { id: 'receiptShowCustomer', label: t('show_customer_info') || 'Show Customer Info' }
                                        ].filter(item => !item.hidden).map(flag => (
                                            <label key={flag.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer">
                                                <span className="text-xs text-foreground">{flag.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings as any)[flag.id]}
                                                    onChange={e => setSettings({ ...settings, [flag.id]: e.target.checked })}
                                                    className="w-4 h-4 rounded border-border text-success-600 focus:ring-success-500 bg-input"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-2 mt-6">{t('items_totals_visibility') || 'Items & Totals Visibility'}</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'receiptShowItemsDescription', label: t('show_items_description') || 'Show Item Descriptions' },
                                            { id: 'receiptShowItemsQty', label: t('show_items_qty') || 'Show Quantities' },
                                            { id: 'receiptShowItemsPrice', label: t('show_items_price') || 'Show Item Prices' },
                                            { id: 'receiptShowSubtotal', label: t('show_subtotal') || 'Show Subtotal' },
                                            { id: 'receiptShowDiscount', label: t('show_discount') || 'Show Discount Amount' },
                                            { id: 'receiptShowTax', label: t('show_tax_amount') || 'Show Tax Amount' },
                                            { id: 'receiptShowServiceCharge', label: t('show_service_charge') || 'Show Service Charge' },
                                            { id: 'receiptShowTotal', label: t('show_grand_total') || 'Show Grand Total' }
                                        ].map(flag => (
                                            <label key={flag.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer">
                                                <span className="text-xs text-foreground">{flag.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings as any)[flag.id]}
                                                    onChange={e => setSettings({ ...settings, [flag.id]: e.target.checked })}
                                                    className="w-4 h-4 rounded border-border text-success-600 focus:ring-success-500 bg-input"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border pb-2 mt-6">{t('footer_visibility') || 'Footer Visibility'}</h3>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'receiptShowPaymentMethod', label: t('show_payment_method') || 'Show Payment Method' },
                                            { id: 'receiptShowBarcode', label: t('show_procedural_barcode') || 'Show Procedural Barcode' }
                                        ].map(flag => (
                                            <label key={flag.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border hover:border-primary/50 transition-all cursor-pointer">
                                                <span className="text-xs text-foreground">{flag.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={(settings as any)[flag.id]}
                                                    onChange={e => setSettings({ ...settings, [flag.id]: e.target.checked })}
                                                    className="w-4 h-4 rounded border-border text-success-600 focus:ring-success-500 bg-input"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase">{t('receipt_font_size')}</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range" min="10" max="24" step="1"
                                                value={settings.receiptFontSize}
                                                onChange={e => setSettings({ ...settings, receiptFontSize: parseInt(e.target.value) })}
                                                className="flex-1 h-1.5 bg-input rounded-lg appearance-none cursor-pointer accent-success-500"
                                            />
                                            <span className="text-foreground font-mono text-sm w-8">{settings.receiptFontSize}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase">{t('qr_code_url')}</label>
                                        <input
                                            type="url" placeholder="https://example.com/feedback"
                                            value={settings.receiptQrCodeUrl}
                                            onChange={e => setSettings({ ...settings, receiptQrCodeUrl: e.target.value })}
                                            className={`w-full bg-input border border-border rounded-lg py-2 text-foreground text-sm outline-none focus:border-primary ${isRTL ? 'pr-3 pl-3' : 'px-3'}`}
                                        />
                                        <p className="text-[10px] text-muted-foreground italic">{t('qr_code_help') || 'Adds a QR code at the bottom of every receipt.'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('header_text')}</label>
                                        <textarea
                                            rows={2}
                                            placeholder="e.g. Thank you for dining with us! | Store Name | VAT No: 123456789"
                                            value={settings.receiptHeader}
                                            onChange={e => setSettings({ ...settings, receiptHeader: e.target.value })}
                                            className={`w-full bg-input border border-border rounded-lg py-3 text-foreground outline-none focus:border-primary resize-none font-mono text-xs ${isRTL ? 'text-right px-4' : 'px-4'}`}
                                            dir="auto"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('footer_text')}</label>
                                        <textarea
                                            rows={2}
                                            placeholder="e.g. Follow us @MyBusiness | Wifi: MyStore | Powered by Idarax"
                                            value={settings.receiptFooter}
                                            onChange={e => setSettings({ ...settings, receiptFooter: e.target.value })}
                                            className={`w-full bg-input border border-border rounded-lg py-3 text-foreground outline-none focus:border-primary resize-none font-mono text-xs ${isRTL ? 'text-right px-4' : 'px-4'}`}
                                            dir="auto"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="border border-border rounded-xl overflow-hidden mt-8">
                                <div className="px-4 py-2 bg-muted text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 border-b border-border">
                                    <FileText className="h-3.5 w-3.5" /> {t('live_preview')}
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-8 border-2 border-dashed border-slate-200 sticky top-6">
                                    <div className="bg-white shadow-2xl rounded-sm max-w-[300px] mx-auto overflow-hidden scale-[0.8] origin-top">
                                        <ReceiptTemplate
                                            tenant={profile}
                                            order={mockOrder}
                                            settings={{
                                                ...settings,
                                                taxRate: parseFloat(settings.taxRate || '0'),
                                                serviceFee: parseFloat(settings.serviceFee || '0')
                                            }}
                                        />
                                    </div>
                                    <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase font-bold tracking-[0.2em]">{t('live_mock_preview') || 'Live System Preview'}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Receipt Settings</>}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ─── Printer Management ─── */}
                    {tab === 'devices' && (
                        <div className="max-w-4xl space-y-8">
                            <div>
                                <h1 className="text-xl font-bold text-foreground mb-2">{t('printer_management')}</h1>
                                <p className="text-muted-foreground text-sm">{t('printer_subtitle')}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div className="col-span-1 space-y-6">
                                    <form onSubmit={handleCreatePrinter} className="bg-card border border-border p-6 rounded-2xl space-y-4">
                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Plus className="h-4 w-4" /> {t('add_printer')}</h3>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('printer_name')}</label>
                                            <input
                                                type="text" required placeholder={t('printer_name_placeholder') || 'e.g., Main Kitchen'}
                                                value={newPrinter.name}
                                                onChange={e => setNewPrinter({ ...newPrinter, name: e.target.value })}
                                                className={`w-full bg-input border border-border rounded-lg py-2 text-foreground text-sm outline-none focus:border-primary ${isRTL ? 'px-3 pr-3' : 'px-3'}`}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('printer_type')}</label>
                                            <select
                                                value={newPrinter.type}
                                                onChange={e => setNewPrinter({ ...newPrinter, type: e.target.value })}
                                                className={`w-full bg-input border border-border rounded-lg py-2 text-foreground text-sm outline-none focus:border-primary ${isRTL ? 'pl-3 pr-8' : 'px-3'}`}
                                            >
                                                <option value="THERMAL">{t('printer_thermal') || 'Customer Receipt (Thermal)'}</option>
                                                <option value="KITCHEN">{t('printer_kitchen') || 'Kitchen Ticket'}</option>
                                                <option value="BAR">{t('printer_bar') || 'Bar Ticket'}</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('interface_label')}</label>
                                            <div className="flex gap-2">
                                                {['NETWORK', 'USB', 'BT'].map(iface => (
                                                    <button
                                                        key={iface} type="button"
                                                        onClick={() => setNewPrinter({ ...newPrinter, interface: iface })}
                                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold border transition-all ${newPrinter.interface === iface ? 'bg-primary/10 border-primary text-success-600 dark:text-primary' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                                                    >
                                                        {iface}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                {newPrinter.interface === 'NETWORK' ? t('ip_address') || 'IP Address' : t('device_port_id') || 'Device/Port ID'}
                                            </label>
                                            <input
                                                type="text" required placeholder={newPrinter.interface === 'NETWORK' ? '192.168.1.100' : 'USB001'}
                                                value={newPrinter.address}
                                                onChange={e => setNewPrinter({ ...newPrinter, address: e.target.value })}
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary"
                                            />
                                        </div>

                                        <button className="w-full py-2.5 bg-primary hover:bg-primary text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95">
                                            {t('register_printer')}
                                        </button>
                                    </form>
                                </div>

                                <div className="col-span-2">
                                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-border bg-muted">
                                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('configured_printers')}</h3>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {loadingPrinters ? (
                                                <div className="text-center py-8 text-muted-foreground animate-pulse">Loading printers...</div>
                                            ) : (!Array.isArray(printers) || printers.length === 0) ? (
                                                <div className="p-12 text-center">
                                                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                                        <Printer className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">{t('no_printers')}</p>
                                                </div>
                                            ) : (
                                                (Array.isArray(printers) ? printers : []).map((p: any) => (
                                                    <div key={p.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-muted p-3 rounded-xl border border-border">
                                                                {p.interface === 'NETWORK' ? <Network className="h-5 w-5 text-primary" /> : p.interface === 'USB' ? <Usb className="h-5 w-5 text-orange-400" /> : <Bluetooth className="h-5 w-5 text-primary-400" />}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-bold text-foreground">{p.name}</h4>
                                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-muted text-muted-foreground uppercase tracking-tighter">{p.type}</span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.interface}: {p.address}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => alert('Simulating test print... Order #1234')}
                                                                className="px-4 py-1.5 bg-muted hover:bg-border text-foreground rounded-lg text-xs font-bold transition-all border border-border"
                                                            >
                                                                {t('test_print')}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePrinter(p.id)}
                                                                className="p-2 bg-error-500/10 hover:bg-error-500/20 text-error-500 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── ZATCA Fiscal Compliance ─── */}
                    {tab === 'zatca' && (
                        <div className="max-w-2xl space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-foreground">Fiscal Compliance (Saudi Arabia)</h2>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${settings.zatcaIsOnboarded ? 'bg-success-500/10 text-success-500 border border-success-500/20' : 'bg-warning-500/10 text-warning-500 border border-warning-500/20'}`}>
                                    {settings.zatcaIsOnboarded ? 'Onboarded' : 'Not Integrated'}
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <h3 className="font-bold text-foreground">ZATCA (Fatoora) Integration</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Generate QR-code-based VAT invoices compliant with Saudi Arabia's ZATCA Phase 1 & 2 requirements.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">VAT Registration Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="300000000000003"
                                            value={settings.zatcaVatNumber}
                                            onChange={e => setSettings({...settings, zatcaVatNumber: e.target.value})}
                                            className="w-full bg-input border border-border rounded-lg py-2.5 px-4 text-foreground outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Seller Name (Arabic)</label>
                                            <input 
                                                type="text" 
                                                placeholder="اسم المتجر"
                                                dir="rtl"
                                                value={settings.zatcaSellerNameAr}
                                                onChange={e => setSettings({...settings, zatcaSellerNameAr: e.target.value})}
                                                className="w-full bg-input border border-border rounded-lg py-2.5 px-4 text-foreground outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Seller Name (English)</label>
                                            <input 
                                                type="text" 
                                                placeholder="Store Name"
                                                value={settings.zatcaSellerNameEn}
                                                onChange={e => setSettings({...settings, zatcaSellerNameEn: e.target.value})}
                                                className="w-full bg-input border border-border rounded-lg py-2.5 px-4 text-foreground outline-none focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">ZATCA Phase</label>
                                        <select 
                                            value={settings.zatcaPhase}
                                            onChange={e => setSettings({...settings, zatcaPhase: parseInt(e.target.value)})}
                                            className="w-full bg-background border border-border rounded-lg py-2.5 px-4 text-foreground outline-none focus:border-primary"
                                        >
                                            <option value={1}>Phase 1 (Generation - QR Code only)</option>
                                            <option value={2}>Phase 2 (Integration - Reporting & Signing)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-border flex gap-3">
                                    <button 
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                await fetchWithAuth('/zatca/settings', {
                                                    method: 'PATCH',
                                                    body: JSON.stringify({
                                                        vatNumber: settings.zatcaVatNumber,
                                                        sellerNameAr: settings.zatcaSellerNameAr,
                                                        sellerNameEn: settings.zatcaSellerNameEn,
                                                        phase: settings.zatcaPhase
                                                    })
                                                });
                                                alert('Fiscal settings saved!');
                                            } catch (err) { alert('Failed to save settings'); }
                                            setSaving(false);
                                        }}
                                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" /> Save Settings
                                    </button>

                                    {!settings.zatcaIsOnboarded && (
                                        <button 
                                            onClick={async () => {
                                                if (!confirm('This will generate a new device identity for ZATCA. Continue?')) return;
                                                setSaving(true);
                                                try {
                                                    const res = await fetchWithAuth('/zatca/onboard', { method: 'POST' });
                                                    if (res.ok) alert('Device identity generated! Now you need to enter the OTP from ZATCA portal.');
                                                } catch (err) { alert('Onboarding failed'); }
                                                setSaving(false);
                                            }}
                                            className="px-6 py-2.5 bg-muted hover:bg-border text-foreground rounded-lg font-bold transition-all flex items-center gap-2"
                                        >
                                            <Network className="h-4 w-4" /> Onboard Device
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!settings.zatcaIsOnboarded && (
                                <div className="bg-card border border-border rounded-2xl p-6">
                                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-warning-500" /> Complete Onboarding
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Enter the 6-digit OTP from your ZATCA Fatoora dashboard to complete integration.
                                    </p>
                                    <div className="flex gap-3">
                                        <input 
                                            id="zatca-otp"
                                            type="text" 
                                            placeholder="123456" 
                                            className="w-32 bg-input border border-border rounded-lg py-2 px-4 text-foreground text-center font-bold tracking-widest outline-none focus:border-primary"
                                        />
                                        <button 
                                            onClick={async () => {
                                                const otp = (document.getElementById('zatca-otp') as HTMLInputElement).value;
                                                if (!otp) return;
                                                setSaving(true);
                                                try {
                                                    const res = await fetchWithAuth('/zatca/complete-onboarding', { 
                                                        method: 'POST',
                                                        body: JSON.stringify({ otp })
                                                    });
                                                    if (res.ok) {
                                                        alert('Onboarding completed successfully!');
                                                        fetchSettings();
                                                    }
                                                } catch (err) { alert('Failed to complete onboarding'); }
                                                setSaving(false);
                                            }}
                                            className="px-6 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-bold transition-all"
                                        >
                                            Verify & Activate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Branch Management ─── */}
                    {tab === 'branches' && (
                        <div className="max-w-4xl space-y-8">
                            <div>
                                <h1 className="text-xl font-bold text-foreground mb-2">{t('branch_management')}</h1>
                                <p className="text-muted-foreground text-sm">{t('branch_mgmt_subtitle')}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-8">
                                <div className="col-span-1 space-y-6">
                                    <form onSubmit={handleCreateBranch} className="bg-card border border-border p-6 rounded-2xl space-y-4">
                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Plus className="h-4 w-4" /> {t('add_branch_title')}</h3>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('branch_name')}</label>
                                            <input
                                                type="text" required placeholder="e.g. Downtown Cafe"
                                                value={newBranch.name}
                                                onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                                                className={`w-full bg-input border border-border rounded-lg py-2 text-foreground text-sm outline-none focus:border-primary px-3`}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('address_optional')}</label>
                                            <input
                                                type="text" placeholder="123 Main St"
                                                value={newBranch.address}
                                                onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                                                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('phone_optional')}</label>
                                            <input
                                                type="text" placeholder="+1 234 567 8900"
                                                value={newBranch.phone}
                                                onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                                                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary"
                                            />
                                        </div>

                                        <button 
                                            disabled={loadingBranches || (branches.length >= (hasFeature('ENTERPRISE') ? 9999 : hasFeature('PROFESSIONAL') ? 5 : 1))} 
                                            className="w-full py-2.5 bg-primary hover:bg-primary text-white rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
                                        >
                                            {branches.length >= (hasFeature('ENTERPRISE') ? 9999 : hasFeature('PROFESSIONAL') ? 5 : 1) ? (
                                                <>
                                                    <LockIcon className="h-4 w-4" />
                                                    Limit Reached
                                                </>
                                            ) : (
                                                t('create_branch_btn')
                                            )}
                                        </button>
                                        
                                        {branches.length >= (hasFeature('ENTERPRISE') ? 9999 : hasFeature('PROFESSIONAL') ? 5 : 1) && (
                                            <button
                                                type="button"
                                                onClick={() => openUpgradeModal({
                                                    featureName: 'Multi-Branch Management',
                                                    featureDescription: 'Expand your business across multiple locations. Basic plans include 1 branch, Professional up to 5, and Enterprise is unlimited.',
                                                    requiredPlan: hasFeature('PROFESSIONAL') ? 'Enterprise' : 'Professional',
                                                    icon: '🏢'
                                                })}
                                                className="w-full py-2 border border-primary-500/30 bg-primary-500/10 text-primary-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-500/20 transition-all"
                                            >
                                                Upgrade for more branches
                                            </button>
                                        )}
                                    </form>
                                    
                                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                         <h4 className="flex items-center gap-2 font-bold text-primary text-sm mb-2"><Globe className="h-4 w-4" /> {t('auto_provisioning')}</h4>
                                         <p className="text-xs text-primary-300">{t('auto_provisioning_desc')}</p>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                        <div className="px-6 py-4 border-b border-border bg-muted">
                                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">{t('configured_branches')}</h3>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {loadingBranches ? (
                                                <div className="text-center py-8 text-muted-foreground animate-pulse">{t('loading')}</div>
                                            ) : (!Array.isArray(branches) || branches.length === 0) ? (
                                                <div className="p-12 text-center">
                                                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                                        <Network className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">{t('no_branches_found')}</p>
                                                </div>
                                            ) : (
                                                (Array.isArray(branches) ? branches : []).map((b: any) => (
                                                    <div key={b.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-muted p-3 rounded-xl border border-border">
                                                                <Store className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-bold text-foreground">{b.name}</h4>
                                                                    {b.isActive ? 
                                                                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-primary/20 text-primary uppercase tracking-tighter">{t('status_active')}</span> :
                                                                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-error-500/20 text-error-500 uppercase tracking-tighter">{t('status_inactive')}</span>
                                                                    }
                                                                </div>
                                                                <p className="text-xs text-muted-foreground font-mono mt-0.5">{b.address || t('no_address')} • {b.phone || t('no_phone')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenConfigureBranch(b)}
                                                                className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-all border border-primary/20"
                                                            >
                                                                {t('configure_rules')}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteBranch(b.id)}
                                                                className="p-2 bg-error-500/10 hover:bg-error-500/20 text-error-500 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BRANCH CONFIGURATION MODAL */}
                            {configuringBranch && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
                                        
                                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/50">
                                            <div>
                                                <h2 className="text-lg font-bold text-foreground">{t('configure_branch').replace('{name}', configuringBranch.name)}</h2>
                                                <p className="text-xs text-muted-foreground mt-0.5">{t('override_global_desc')}</p>
                                            </div>
                                            <button 
                                                onClick={() => setConfiguringBranch(null)}
                                                className="p-2 bg-background hover:bg-muted text-muted-foreground rounded-full transition-colors border border-border"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="p-6 overflow-y-auto space-y-6">
                                            {loadingBranchSettings ? (
                                                <div className="text-center py-12 animate-pulse text-muted-foreground">{t('loading')}</div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between p-4 border border-primary/30 bg-primary/5 rounded-xl">
                                                        <div>
                                                            <h3 className="font-bold text-sm text-foreground">{t('enable_branch_overrides')}</h3>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{t('enable_overrides_desc')}</p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={branchSettings.isActive || false}
                                                                onChange={(e) => setBranchSettings({...branchSettings, isActive: e.target.checked})}
                                                                className="sr-only peer" 
                                                            />
                                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                                                        </label>
                                                    </div>

                                                    <div className={`space-y-6 transition-opacity duration-300 ${!branchSettings.isActive ? 'opacity-40 pointer-events-none' : ''}`}>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                                    <Percent className="h-3 w-3" /> {t('branch_tax_rate')}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder={t('use_global_placeholder')}
                                                                    value={branchSettings.taxRate || ''}
                                                                    onChange={e => setBranchSettings({ ...branchSettings, taxRate: e.target.value })}
                                                                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                                    <DollarSign className="h-3 w-3" /> {t('branch_service_fee')}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder={t('use_global_placeholder')}
                                                                    value={branchSettings.serviceFee || ''}
                                                                    onChange={e => setBranchSettings({ ...branchSettings, serviceFee: e.target.value })}
                                                                    className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 pt-4 border-t border-border">
                                                            <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {t('pre_order_settings') || 'Pre-Order Management'}</h3>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                                                    <div>
                                                                        <h4 className="text-xs font-bold text-foreground">{t('enable_pre_orders') || 'Enable Pre-Orders'}</h4>
                                                                        <p className="text-[10px] text-muted-foreground">{t('pre_order_desc') || 'Allow customers to schedule orders for later date/time.'}</p>
                                                                    </div>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={branchSettings.preOrderEnabled || false}
                                                                            onChange={(e) => setBranchSettings({...branchSettings, preOrderEnabled: e.target.checked})}
                                                                            className="sr-only peer" 
                                                                        />
                                                                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 border border-border"></div>
                                                                    </label>
                                                                </div>

                                                                {branchSettings.preOrderEnabled && (
                                                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('max_days_ahead') || 'Max Days Ahead'}</label>
                                                                            <input
                                                                                type="number"
                                                                                value={branchSettings.preOrderMaxDaysAhead}
                                                                                onChange={e => setBranchSettings({ ...branchSettings, preOrderMaxDaysAhead: e.target.value })}
                                                                                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-ellipsis overflow-hidden whitespace-nowrap">{t('lead_firing_minutes') || 'Lead Firing Minutes'}</label>
                                                                            <input
                                                                                type="number"
                                                                                value={branchSettings.preOrderLeadMinutes}
                                                                                onChange={e => setBranchSettings({ ...branchSettings, preOrderLeadMinutes: e.target.value })}
                                                                                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:border-primary"
                                                                            />
                                                                            <p className="text-[9px] text-muted-foreground italic">Fires to kitchen X mins before slot.</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="space-y-4 pt-4 border-t border-border">
                                                                <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Operational Enforcement</h3>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-foreground">Require Open Shift</h4>
                                                                            <p className="text-[10px] text-muted-foreground">Staff must clock-in.</p>
                                                                        </div>
                                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={branchSettings.requireOpenShift || false}
                                                                                onChange={(e) => setBranchSettings({...branchSettings, requireOpenShift: e.target.checked})}
                                                                                className="sr-only peer" 
                                                                            />
                                                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                                                                        </label>
                                                                    </div>

                                                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                                                                        <div>
                                                                            <h4 className="text-xs font-bold text-foreground">Require Open Drawer</h4>
                                                                            <p className="text-[10px] text-muted-foreground">Drawer must be open.</p>
                                                                        </div>
                                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                checked={branchSettings.requireOpenDrawer || false}
                                                                                onChange={(e) => setBranchSettings({...branchSettings, requireOpenDrawer: e.target.checked})}
                                                                                className="sr-only peer" 
                                                                            />
                                                                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border"></div>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 pt-4 border-t border-border">
                                                            <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> {t('receipt_overrides')}</h3>
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs text-muted-foreground">{t('custom_header')}</label>
                                                                    <textarea
                                                                        rows={2}
                                                                        placeholder={t('header_placeholder')}
                                                                        value={branchSettings.receiptHeader || ''}
                                                                        onChange={e => setBranchSettings({ ...branchSettings, receiptHeader: e.target.value })}
                                                                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs text-muted-foreground">{t('custom_footer')}</label>
                                                                    <textarea
                                                                        rows={2}
                                                                        placeholder={t('footer_placeholder')}
                                                                        value={branchSettings.receiptFooter || ''}
                                                                        onChange={e => setBranchSettings({ ...branchSettings, receiptFooter: e.target.value })}
                                                                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                                            <button 
                                                onClick={() => setConfiguringBranch(null)}
                                                className="px-6 py-2 bg-background hover:bg-muted text-foreground border border-border rounded-lg font-bold text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                disabled={loadingBranchSettings || savingBranchSettings}
                                                onClick={handleSaveBranchSettings}
                                                className="px-8 py-2 bg-primary hover:bg-primary text-white rounded-lg font-bold text-sm transition-colors shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {savingBranchSettings ? 'Saving...' : <><Save className="h-4 w-4" /> Save Overrides</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* ─── Integrations Management ─── */}
                    {tab === 'integrations' && (
                        <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
                            <h2 className="text-xl font-bold text-foreground">Delivery Integrations</h2>
                            <p className="text-muted-foreground text-sm">Configure your third-party delivery aggregators to seamlessly push orders and synchronize driver tracking.</p>

                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Truck className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-foreground font-bold">Drovo Delivery</h3>
                                        <p className="text-xs text-muted-foreground">Premium delivery dispatch & fleet tracking</p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Drovo Tenant ID</label>
                                        <input
                                            type="text"
                                            placeholder="Enter your Drovo Tenant ID"
                                            value={settings.drovoTenantId || ''}
                                            onChange={e => setSettings({ ...settings, drovoTenantId: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Drovo API Key</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••••••••••"
                                            value={settings.drovoApiKey || ''}
                                            onChange={e => setSettings({ ...settings, drovoApiKey: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground outline-none focus:border-primary"
                                        />
                                        <p className="text-[10px] text-muted-foreground italic mt-2">Requires an active Delivery Management subscription to function.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60">
                                    {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Integrations</>}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}
