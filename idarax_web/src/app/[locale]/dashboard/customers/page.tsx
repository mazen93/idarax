'use client';

import { useState, useEffect } from 'react';
import { Search, User, Star, Plus, Minus, CreditCard, ShoppingBag, Calendar, X, Clock, Package, TrendingUp, MapPin, Trash2, Download, Upload, Edit2, ChevronLeft, ChevronRight, Zap, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';
import { FeatureGate } from '@/components/common/FeatureGate';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';
import { ImportCustomersModal } from '@/components/ImportCustomersModal';
import dynamic from 'next/dynamic';

const LocationPickerModal = dynamic(
    () => import('@/components/crm/LocationPickerModal').then((mod) => mod.LocationPickerModal),
    { ssr: false }
);


export default function CustomerCrmPage() {
    const { showAlert, showConfirm } = useModal();
    const { t } = useLanguage();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        birthday: '',
        addresses: [{ label: 'Home', address: '', isDefault: true, lat: '', lng: '' }]
    });

    // Pagination State
    const [meta, setMeta] = useState({ total: 0, page: 1, lastPage: 1 });
    const [limit] = useState(10);
    const [activeSegment, setActiveSegment] = useState<string>('segment_all');

    // Details Drawer State
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [customerDetail, setCustomerDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Address Form State (in Drawer)
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: 'Home', address: '', lat: '', lng: '' });
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addingAddress, setAddingAddress] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);

    // Points Management State
    const [pointsModalOpen, setPointsModalOpen] = useState(false);
    const [pointsAction, setPointsAction] = useState<'EARNED' | 'REDEEMED'>('EARNED');
    const [pointsAmount, setPointsAmount] = useState<number | ''>('');
    const [pointsReason, setPointsReason] = useState('');

    // Map Modal State
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [activeMapTarget, setActiveMapTarget] = useState<{ type: 'form' | 'drawer', index?: number } | null>(null);

    // AI Campaigns State
    const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    const fetchCustomers = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/crm/customers', {
                params: {
                    page,
                    limit,
                    search: search || undefined
                }
            });
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            
            // Apply client-side segmentation (since backend doesn't support segment filters yet)
            let filteredData = data;
            const now = new Date();
            
            if (activeSegment !== 'segment_all') {
                filteredData = data.filter((c: any) => {
                    const spent = parseFloat(c.totalSpent || 0);
                    const ordersCount = parseInt(c.ordersCount || 0);
                    const joinedDays = (now.getTime() - new Date(c.createdAt).getTime()) / (1000 * 3600 * 24);
                    
                    let lastOrderDays = -1;
                    if (c.lastOrderDate) {
                        lastOrderDays = (now.getTime() - new Date(c.lastOrderDate).getTime()) / (1000 * 3600 * 24);
                    }

                    if (activeSegment === 'segment_vip') return spent > 1000 || c.loyaltyTier === 'GOLD';
                    if (activeSegment === 'segment_active') return ordersCount > 0 && lastOrderDays >= 0 && lastOrderDays <= 30;
                    if (activeSegment === 'segment_slipping') return ordersCount > 0 && lastOrderDays > 30 && lastOrderDays <= 90;
                    if (activeSegment === 'segment_inactive') return ordersCount > 0 && lastOrderDays > 90;
                    if (activeSegment === 'segment_new') return ordersCount === 0 && joinedDays <= 30;
                    
                    return true;
                });
            }

            const metaData = res.data?.meta || { total: filteredData.length, page, lastPage: 1 };
            setCustomers(filteredData);
            setMeta({
                total: metaData.total,
                page: metaData.page,
                lastPage: metaData.lastPage
            });
        } catch (err) {
            console.error('Failed to load customers', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDetail = async (id: string) => {
        setLoadingDetail(true);
        setSelectedCustomerId(id);
        try {
            const res = await api.get(`/crm/customers/${id}`);
            setCustomerDetail(res.data);
        } catch (err) {
            console.error('Failed to load customer details', err);
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, activeSegment]);

    const fetchActiveCampaigns = async () => {
        setLoadingCampaigns(true);
        try {
            const res = await api.get('/crm/campaigns/active');
            setActiveCampaigns(res.data);
        } catch (err) {
            console.error('Failed to load active campaigns', err);
        } finally {
            setLoadingCampaigns(false);
        }
    };

    useEffect(() => {
        fetchActiveCampaigns();
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Filter out empty addresses and clean email
            const cleanedAddresses = formData.addresses
                .filter(a => a.address.trim() !== '')
                .map(a => ({
                    ...a,
                    lat: a.lat !== '' ? parseFloat(a.lat as string) : undefined,
                    lng: a.lng !== '' ? parseFloat(a.lng as string) : undefined
                }));
            const payload = {
                ...formData,
                addresses: cleanedAddresses,
                email: formData.email.trim() === '' ? undefined : formData.email,
                birthday: formData.birthday.trim() === '' ? null : formData.birthday
            };

            if (isEditing && selectedId) {
                const res = await api.patch(`/crm/customers/${selectedId}`, payload);
                const updatedCustomer = res.data?.data || res.data;
                // Update local state instead of re-fetching the whole list
                setCustomers((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...updatedCustomer } : c)));
            } else {
                const res = await api.post('/crm/customers', payload);
                const newCustomer = res.data?.data || res.data;
                // Prepend new customer to local state
                setCustomers((prev) => [newCustomer, ...prev]);
                // Adjust meta total
                setMeta((prev) => ({ ...prev, total: prev.total + 1 }));
            }

            setShowForm(false);
            resetForm();
        } catch (e: any) {
            let errorMsg = `Failed to ${isEditing ? 'update' : 'create'} customer`;
            if (e.response?.data?.message) {
                errorMsg = Array.isArray(e.response.data.message) 
                    ? e.response.data.message.join(', ') 
                    : e.response.data.message;
            } else if (e.response?.data?.error) {
                errorMsg = e.response.data.error;
            }
            showAlert({ title: t('error') || 'Error', message: errorMsg, variant: 'DANGER' });
        }
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', email: '', birthday: '', addresses: [{ label: 'Home', address: '', isDefault: true, lat: '', lng: '' }] });
        setIsEditing(false);
        setSelectedId(null);
    };

    const handleEditClick = (customer: any) => {
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            birthday: customer.birthday ? customer.birthday.substring(0, 10) : '',
            addresses: customer.addresses && customer.addresses.length > 0
                ? customer.addresses.map((a: any) => ({ label: a.label, address: a.address, isDefault: a.isDefault, lat: a.lat || '', lng: a.lng || '' }))
                : [{ label: 'Home', address: '', isDefault: true, lat: '', lng: '' }]
        });
        setSelectedId(customer.id);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const scrollTarget = document.querySelector('main') || document.querySelector('.overflow-y-auto');
        if (scrollTarget) scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteCustomer = async (id: string) => {
        showConfirm({
            title: t('delete_customer') || 'Delete Customer',
            message: t('confirm_delete_customer') || 'Are you sure you want to delete this customer? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await api.delete(`/crm/customers/${id}`);
                    fetchCustomers(meta.page);
                } catch (err) {
                    showAlert({ title: t('error'), message: 'Failed to delete customer', variant: 'DANGER' });
                }
            }
        });
    };

    const handleManagePointsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !pointsAmount) return;
        try {
            await api.post('/crm/loyalty/transaction', {
                customerId: selectedCustomerId,
                points: Number(pointsAmount),
                type: pointsAction,
                description: pointsReason || undefined
            });
            setPointsModalOpen(false);
            setPointsAmount('');
            setPointsReason('');
            fetchCustomerDetail(selectedCustomerId);
            fetchCustomers(meta.page);
        } catch (err) {
            showAlert({ title: t('error') || 'Error', message: 'Failed to adjust points', variant: 'DANGER' });
        }
    };

    const handleAddAddressField = () => {
        setFormData({
            ...formData,
            addresses: [...formData.addresses, { label: 'Other', address: '', isDefault: false, lat: '', lng: '' }]
        });
    };

    const handleRemoveAddressField = (index: number) => {
        const newAddresses = [...formData.addresses];
        newAddresses.splice(index, 1);
        setFormData({ ...formData, addresses: newAddresses });
    };

    const handleAddressChange = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newAddresses = [...prev.addresses];
            newAddresses[index] = { ...newAddresses[index], [field]: value };

            // Ensure only one default
            if (field === 'isDefault' && value === true) {
                newAddresses.forEach((addr, i) => {
                    if (i !== index) addr.isDefault = false;
                });
            }
            return { ...prev, addresses: newAddresses };
        });
    };

    const handleMapConfirm = (lat: number, lng: number) => {
        if (!activeMapTarget) return;
        if (activeMapTarget.type === 'form' && activeMapTarget.index !== undefined) {
            const idx = activeMapTarget.index;
            setFormData(prev => {
                const newAddresses = [...prev.addresses];
                newAddresses[idx] = { ...newAddresses[idx], lat: lat.toString(), lng: lng.toString() };
                return { ...prev, addresses: newAddresses };
            });
        } else if (activeMapTarget.type === 'drawer') {
            setNewAddress(prev => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId) return;
        setAddingAddress(true);
        try {
            if (editingAddressId) {
                await api.patch(`/crm/addresses/${editingAddressId}`, {
                    ...newAddress,
                    lat: newAddress.lat !== '' ? parseFloat(newAddress.lat as string) : undefined,
                    lng: newAddress.lng !== '' ? parseFloat(newAddress.lng as string) : undefined
                });
            } else {
                await api.post('/crm/addresses', {
                    customerId: selectedCustomerId,
                    ...newAddress,
                    lat: newAddress.lat !== '' ? parseFloat(newAddress.lat as string) : undefined,
                    lng: newAddress.lng !== '' ? parseFloat(newAddress.lng as string) : undefined
                });
            }
            setNewAddress({ label: 'Home', address: '', lat: '', lng: '' });
            setShowAddressForm(false);
            setEditingAddressId(null);
            fetchCustomerDetail(selectedCustomerId);
        } catch (err) {
            showAlert({ title: t('error'), message: 'Failed to add address', variant: 'DANGER' });
        } finally {
            setAddingAddress(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!selectedCustomerId) return;
        try {
            await api.delete(`/crm/addresses/${addressId}`);
            fetchCustomerDetail(selectedCustomerId);
        } catch (err) {
            showAlert({ title: t('error'), message: 'Failed to delete address', variant: 'DANGER' });
        }
    };

    const handleExport = (type: 'CSV' | 'EXCEL') => {
        const dataToExport = customers.map(c => ({
            Name: c.name,
            Phone: c.phone || '',
            Email: c.email || '',
            Points: c.points || 0,
            Orders: c.ordersCount || 0,
            Spent: parseFloat(c.totalSpent || 0).toFixed(2),
            Joined: new Date(c.createdAt).toLocaleDateString(),
            Addresses: (c.addresses || []).map((a: any) => `${a.label}: ${a.address}`).join(' | ')
        }));

        if (type === 'CSV') {
            exportToCSV(dataToExport, 'customers');
        } else {
            exportToExcel(dataToExport, 'customers');
        }
    };


    return (
        <FeatureGate 
            feature="CRM" 
            requiredPlan="Professional"
            title={t('crm_locked_title') || 'Enterprise CRM & Loyalty'}
            description={t('crm_locked_desc') || 'Unlock advanced customer profiles, automated loyalty points, and AI-driven re-engagement campaigns.'}
            icon="👥"
        >
            <div className="text-foreground min-h-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center">
                        {t('crm_title')}
                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-3 border border-primary/20">{t('crm_updated')}</span>
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-lg">{t('crm_subtitle')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('search_customer')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-64 rounded-lg border border-border py-2.5 pl-10 pr-4 bg-input text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-success-500 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <button
                        onClick={() => setImportModalOpen(true)}
                        className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm border border-border"
                    >
                        <Upload className="h-4 w-4" />
                        {t('import') || 'Import'}
                    </button>
                    <button
                        onClick={() => handleExport('CSV')}
                        className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm border border-border"
                    >
                        <Download className="h-4 w-4" />
                        {t('export') || 'Export'}
                    </button>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        {t('new_customer')}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="mb-8 p-6 bg-card border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{isEditing ? t('edit_customer') || 'Edit Customer' : t('add_customer_form')}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('full_name')}</label>
                                <input required placeholder={t('full_name')} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-success-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('phone')}</label>
                                <input required type="tel" placeholder={t('phone')} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-success-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('email')}</label>
                                <input type="email" placeholder={`${t('email')} (${t('optional') || 'optional'})`} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-success-500 outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('birthday') || 'Birthday'}</label>
                                <input type="date" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-success-500 outline-none" />
                            </div>
                        </div>

                        {/* Addresses Section in Form */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {t('addresses') || 'Addresses'}
                                </h4>
                                <button type="button" onClick={handleAddAddressField} className="text-xs font-black text-primary hover:text-primary uppercase tracking-widest flex items-center gap-1">
                                    <Plus className="h-3 w-3" /> {t('add_address') || 'Add Address'}
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {formData.addresses.map((addr, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 p-3 bg-muted/30 border border-border rounded-lg group animate-in slide-in-from-left-2 duration-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-32">
                                                <input
                                                    placeholder="Label (e.g. Home)"
                                                    value={addr.label}
                                                    onChange={e => handleAddressChange(idx, 'label', e.target.value)}
                                                    className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    placeholder="Address detail"
                                                    value={addr.address}
                                                    onChange={e => handleAddressChange(idx, 'address', e.target.value)}
                                                    className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 px-2">
                                                <input
                                                    type="checkbox"
                                                    checked={addr.isDefault}
                                                    onChange={e => handleAddressChange(idx, 'isDefault', e.target.checked)}
                                                    className="h-4 w-4 rounded border-border text-success-600 focus:ring-success-500"
                                                />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('default') || 'Default'}</span>
                                            </div>
                                            {formData.addresses.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveAddressField(idx)} className="p-1.5 text-error-500 hover:bg-error-500/10 rounded-md transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
                                            <div className="flex items-center gap-2 flex-1 w-full">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        placeholder="Latitude (e.g. 24.7136)"
                                                        value={addr.lat}
                                                        onChange={e => handleAddressChange(idx, 'lat', e.target.value)}
                                                        className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        placeholder="Longitude (e.g. 46.6753)"
                                                        value={addr.lng}
                                                        onChange={e => handleAddressChange(idx, 'lng', e.target.value)}
                                                        className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground"
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setActiveMapTarget({ type: 'form', index: idx });
                                                    setMapModalOpen(true);
                                                }}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-primary/20"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                {t('select_on_map')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors">{t('cancel')}</button>
                            <button type="submit" className="px-8 py-2 bg-primary hover:bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-success-500/20 transition-all active:scale-95">
                                {isEditing ? t('save_changes') || 'Save Changes' : t('add_customer_btn')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* AI CRM Automations Block */}
            <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="w-32 h-32 text-primary" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="max-w-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-primary/20 rounded-lg">
                                        <Zap className="w-4 h-4 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-primary">{t('ai_crm_automations')}</h3>
                                </div>
                                <h2 className="text-2xl font-black text-foreground mb-2">{t('automated_reengagement')}</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {t('reengagement_desc')}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-4 bg-card border border-border rounded-2xl text-center min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        <span className="text-sm font-black text-foreground uppercase">Active</span>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-card border border-border rounded-2xl text-center min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Sent</p>
                                    <p className="text-xl font-black text-primary">{activeCampaigns.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-2xl h-full flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> {t('recent_actions')}
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[140px] custom-scrollbar">
                            {loadingCampaigns ? (
                                <div className="p-4 space-y-3">
                                    <div className="h-10 bg-muted animate-pulse rounded-lg" />
                                    <div className="h-10 bg-muted animate-pulse rounded-lg" />
                                </div>
                            ) : activeCampaigns.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground italic text-[10px] uppercase tracking-widest">
                                    {t('no_campaigns_sent')}
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {activeCampaigns.map((camp) => (
                                        <div key={camp.id} className="p-3 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-black text-foreground truncate max-w-[120px]">{camp.customer?.name}</span>
                                                <span className="text-[9px] text-muted-foreground">{new Date(camp.sentAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MessageSquare className="w-2.5 h-2.5 text-primary" />
                                                <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">{t('sent_reengagement')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                {/* Segmentation Tabs */}
                <div className="flex items-center gap-2 p-4 border-b border-border overflow-x-auto custom-scrollbar bg-muted/20">
                    {['segment_all', 'segment_vip', 'segment_active', 'segment_slipping', 'segment_inactive', 'segment_new'].map((segment) => (
                        <button
                            key={segment}
                            onClick={() => setActiveSegment(segment)}
                            className={`px-4 py-2 rounded-full text-sm font-bold tracking-wide whitespace-nowrap transition-all ${
                                activeSegment === segment
                                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : 'bg-card text-muted-foreground border border-border hover:bg-muted/60 hover:text-foreground'
                            }`}
                        >
                            {t(segment)}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('customer')}
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('contact')}
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('orders_count')}
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('total_spends')}
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('last_visit')}
                                </th>
                                <th scope="col" className="px-3 py-4 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {t('loyalty')}
                                </th>
                                <th scope="col" className="relative py-4 pl-3 pr-6 text-right">
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-4">{t('actions')}</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            {t('loading_crm')}
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                        {t('no_customers')}
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="whitespace-nowrap py-4 pl-6 pr-3">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground">{customer.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{t('joined')} {new Date(customer.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="text-sm font-semibold text-foreground">
                                                {customer.phone || 'N/A'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {customer.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-tight">
                                                {customer.ordersCount || 0} {t('orders')}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="text-sm font-black text-primary">
                                                ${parseFloat(customer.totalSpent || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 opacity-60" />
                                                {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : t('never')}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4">
                                            <div className="flex items-center gap-1.5 bg-warning-500/5 px-2 py-1 rounded-lg border border-warning-500/10 w-max">
                                                <Star className="h-3.5 w-3.5 text-warning-500 fill-warning-500" />
                                                <span className="text-warning-500 font-black text-sm">{customer.points || 0}</span>
                                            </div>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditClick(customer)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                title={t('edit')}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(customer.id)}
                                                className="p-2 text-muted-foreground hover:text-error-500 hover:bg-error-500/10 rounded-lg transition-all"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => fetchCustomerDetail(customer.id)}
                                                className="text-primary hover:text-primary/80 text-[10px] font-black uppercase tracking-widest bg-primary/10 px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
                                            >
                                                {t('view_profile')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && meta.lastPage > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-border bg-muted/20">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            {t('page')} {meta.page} {t('of')} {meta.lastPage} ({meta.total} {t('customers_count') || 'customers'})
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={meta.page <= 1}
                                onClick={() => fetchCustomers(meta.page - 1)}
                                className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                disabled={meta.page >= meta.lastPage}
                                onClick={() => fetchCustomers(meta.page + 1)}
                                className="p-2 bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Detail Drawer */}
            {selectedCustomerId && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedCustomerId(null)} />
                    <div className="relative w-full max-w-2xl bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col h-full">
                        {loadingDetail ? (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                <div className="animate-pulse flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-muted" />
                                    <p className="text-sm font-medium">{t('fetching_profile')}</p>
                                </div>
                            </div>
                        ) : customerDetail && (
                            <>
                                {/* Drawer Header */}
                                <div className="p-6 border-b border-border flex items-center justify-between bg-card">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <User className="h-7 w-7 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground leading-tight flex items-center gap-2">
                                                {customerDetail.name}
                                                {customerDetail.referralCode && (
                                                    <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 uppercase">
                                                        Ref: {customerDetail.referralCode}
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                {customerDetail.phone || t('no_phone')} 
                                                <span>•</span> {t('joined')} {new Date(customerDetail.createdAt).toLocaleDateString()}
                                                {customerDetail.birthday && (
                                                    <><span>•</span> 🎂 {customerDetail.birthday.substring(0, 10)}</>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomerId(null)} className="p-2 hover:bg-muted rounded-xl transition-colors">
                                        <X className="h-6 w-6 text-muted-foreground" />
                                    </button>
                                </div>

                                {/* Drawer Content */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl bg-muted border border-border">
                                            <TrendingUp className="h-5 w-5 text-primary mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('total_spent')}</p>
                                            <p className="text-lg font-black text-foreground">${parseFloat(customerDetail.totalSpent || 0).toFixed(2)}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted border border-border">
                                            <ShoppingBag className="h-5 w-5 text-primary mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('orders_count')}</p>
                                            <p className="text-lg font-black text-foreground">{customerDetail.ordersCount || 0}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted border border-border relative group">
                                            <Star className="h-5 w-5 text-warning-500 mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('loyalty_pts')}</p>
                                            <p className="text-lg font-black text-foreground">{customerDetail.points || 0}</p>
                                            <button 
                                                onClick={() => setPointsModalOpen(true)}
                                                className="absolute top-4 right-4 text-[10px] font-black uppercase text-warning-500 bg-warning-500/10 hover:bg-warning-500/20 px-2 py-1 rounded transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </div>
                                    </div>

                                    {/* Behavior Insights */}
                                    {customerDetail.insights && (
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" /> {t('behavior_insights') || 'Behavior Insights'}
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t('avg_order_value') || 'Avg. Order Value'}</p>
                                                    <p className="text-xl font-black text-foreground">${parseFloat(customerDetail.insights.aov || 0).toFixed(2)}</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t('visit_frequency') || 'Visit Frequency'}</p>
                                                    <p className="text-xl font-black text-foreground">
                                                        {customerDetail.insights.avgDaysBetweenOrders > 0
                                                            ? `${parseFloat(customerDetail.insights.avgDaysBetweenOrders).toFixed(1)} ${t('days_avg') || 'days avg.'}`
                                                            : t('first_visits') || 'N/A'
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{t('top_products') || 'Top Products'}</h4>
                                                    <div className="space-y-2">
                                                        {customerDetail.insights.topProducts?.map((p: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/40 rounded-lg border border-border">
                                                                <span className="font-medium text-foreground truncate mr-2">{p.name}</span>
                                                                <span className="font-black text-primary shrink-0">{p.count}x</span>
                                                            </div>
                                                        ))}
                                                        {(!customerDetail.insights.topProducts || customerDetail.insights.topProducts.length === 0) && (
                                                            <p className="text-[10px] text-muted-foreground italic">{t('no_data') || 'No data yet'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{t('top_categories') || 'Top Categories'}</h4>
                                                    <div className="space-y-2">
                                                        {customerDetail.insights.topCategories?.map((c: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-muted/40 rounded-lg border border-border">
                                                                <span className="font-medium text-foreground truncate mr-2">{c.name}</span>
                                                                <span className="font-black text-primary shrink-0">{c.count}x</span>
                                                            </div>
                                                        ))}
                                                        {(!customerDetail.insights.topCategories || customerDetail.insights.topCategories.length === 0) && (
                                                            <p className="text-[10px] text-muted-foreground italic">{t('no_data') || 'No data yet'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Addresses */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-4 w-4" /> {t('addresses') || 'Addresses'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    if (showAddressForm) {
                                                        setShowAddressForm(false);
                                                        setEditingAddressId(null);
                                                        setNewAddress({ label: 'Home', address: '', lat: '', lng: '' });
                                                    } else {
                                                        setShowAddressForm(true);
                                                    }
                                                }}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary transition-colors"
                                            >
                                                {showAddressForm ? t('cancel') : `+ ${t('add_address') || 'Add Address'}`}
                                            </button>
                                        </div>

                                        {showAddressForm && (
                                            <form onSubmit={handleAddAddress} className="mb-4 p-4 bg-muted border border-border rounded-2xl space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">{t('label') || 'Label'}</label>
                                                        <input
                                                            required
                                                            placeholder="Home, Work..."
                                                            value={newAddress.label}
                                                            onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                                            className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">{t('address') || 'Address'}</label>
                                                        <input
                                                            required
                                                            placeholder="123 Street..."
                                                            value={newAddress.address}
                                                            onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                                            className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">{t('latitude') || 'Latitude'}</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="e.g. 24.7136"
                                                            value={newAddress.lat}
                                                            onChange={e => setNewAddress({ ...newAddress, lat: e.target.value })}
                                                            className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">{t('longitude') || 'Longitude'}</label>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            placeholder="e.g. 46.6753"
                                                            value={newAddress.lng}
                                                            onChange={e => setNewAddress({ ...newAddress, lng: e.target.value })}
                                                            className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground"
                                                        />
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setActiveMapTarget({ type: 'drawer' });
                                                        setMapModalOpen(true);
                                                    }}
                                                    className="w-full mt-2 flex justify-center items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-primary/20"
                                                >
                                                    <MapPin className="h-3 w-3" />
                                                    Select on Map
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={addingAddress}
                                                    className="w-full mt-2 py-2 bg-primary hover:bg-primary text-primary-foreground rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                >
                                                    {addingAddress ? t('saving') : (editingAddressId ? 'Update Address' : (t('save_address') || 'Save Address'))}
                                                </button>
                                            </form>
                                        )}

                                        <div className="space-y-2">
                                            {customerDetail.addresses?.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic pl-1">{t('no_addresses_saved') || 'No addresses saved.'}</p>
                                            ) : (
                                                customerDetail.addresses.map((addr: any) => (
                                                    <div key={addr.id} className="flex items-center justify-between p-3 bg-muted border border-border rounded-xl group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-foreground">{addr.label}</p>
                                                                <p className="text-[10px] text-muted-foreground">{addr.address}</p>
                                                                <p className="text-[10px] text-muted-foreground max-w-[200px] truncate">{addr.address}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => {
                                                                    setNewAddress({
                                                                        label: addr.label,
                                                                        address: addr.address,
                                                                        lat: addr.lat ? String(addr.lat) : '',
                                                                        lng: addr.lng ? String(addr.lng) : ''
                                                                    });
                                                                    setEditingAddressId(addr.id);
                                                                    setShowAddressForm(true);
                                                                }}
                                                                className="p-1.5 text-muted-foreground hover:bg-card hover:text-foreground rounded-md transition-colors"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-error-500 hover:bg-card hover:text-error-600 rounded-md transition-colors">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Order History */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-4 w-4" /> {t('order_history')}
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {customerDetail.orders?.length === 0 ? (
                                                <div className="py-8 text-center bg-muted border border-dashed border-border rounded-2xl">
                                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{t('no_order_history')}</p>
                                                </div>
                                            ) : (
                                                customerDetail.orders.map((order: any) => (
                                                    <div key={order.id} className="p-4 rounded-2xl bg-muted border border-border group hover:border-primary/30 transition-all">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center">
                                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-muted-foreground uppercase">#{order.id.slice(-6)}</p>
                                                                    <p className="text-xs text-foreground font-bold">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-foreground">${parseFloat(order.totalAmount).toFixed(2)}</p>
                                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${order.status === 'COMPLETED' ? 'bg-primary/10 text-primary' : 'bg-warning-500/10 text-warning-500'}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="pl-11 border-t border-border pt-3 flex flex-wrap gap-2">
                                                            {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                                                                <span key={idx} className="text-[10px] bg-card text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                                                                    {item.quantity}x {item.product.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Loyalty History */}
                                    {customerDetail.loyaltyHistory?.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                                                <Star className="h-4 w-4" /> {t('loyalty_activity')}
                                            </h3>
                                            <div className="bg-muted rounded-2xl border border-border divide-y divide-border">
                                                {customerDetail.loyaltyHistory.map((lh: any) => (
                                                    <div key={lh.id} className="p-4 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${lh.type === 'EARNED' ? 'bg-primary/10' : 'bg-error-500/10'}`}>
                                                                {lh.type === 'EARNED' ? <Plus className="h-4 w-4 text-primary" /> : <Minus className="h-4 w-4 text-error-500" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-foreground">{lh.description || (lh.type === 'EARNED' ? t('points_earned') : t('points_redeemed'))}</p>
                                                                <p className="text-[10px] text-muted-foreground font-medium">{new Date(lh.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm font-black ${lh.type === 'EARNED' ? 'text-primary' : 'text-error-500'}`}>
                                                            {lh.type === 'EARNED' ? '+' : '-'}{lh.points}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {pointsModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setPointsModalOpen(false)} />
                    <div className="relative w-full max-w-sm bg-card border border-border shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">Manage Points</h3>
                            <button onClick={() => setPointsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleManagePointsSubmit} className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPointsAction('EARNED')}
                                    className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                                        pointsAction === 'EARNED' ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border text-muted-foreground'
                                    }`}
                                >
                                    Add Points
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPointsAction('REDEEMED')}
                                    className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                                        pointsAction === 'REDEEMED' ? 'bg-error-500/10 border-error-500 text-error-500' : 'bg-transparent border-border text-muted-foreground'
                                    }`}
                                >
                                    Deduct Points
                                </button>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Amount</label>
                                <input 
                                    required
                                    type="number" 
                                    min="1"
                                    value={pointsAmount}
                                    onChange={(e) => setPointsAmount(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-success-500 outline-none"
                                    placeholder="e.g. 100"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Reason (Optional)</label>
                                <input 
                                    type="text" 
                                    value={pointsReason}
                                    onChange={(e) => setPointsReason(e.target.value)}
                                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-success-500 outline-none"
                                    placeholder="e.g. Apology credit"
                                />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary hover:bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-success-500/20 transition-all">
                                Update Points
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ImportCustomersModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={fetchCustomers}
                t={t}
            />

            <LocationPickerModal 
                isOpen={mapModalOpen} 
                onClose={() => setMapModalOpen(false)} 
                onConfirm={handleMapConfirm} 
                initialLat={
                    activeMapTarget?.type === 'form' 
                        ? (formData.addresses[activeMapTarget.index!]?.lat ? parseFloat(formData.addresses[activeMapTarget.index!].lat as string) : undefined)
                        : (newAddress.lat ? parseFloat(newAddress.lat as string) : undefined)
                }
                initialLng={
                    activeMapTarget?.type === 'form' 
                        ? (formData.addresses[activeMapTarget.index!]?.lng ? parseFloat(formData.addresses[activeMapTarget.index!].lng as string) : undefined)
                        : (newAddress.lng ? parseFloat(newAddress.lng as string) : undefined)
                }
            />
            </div>
        </FeatureGate>
    );
}
