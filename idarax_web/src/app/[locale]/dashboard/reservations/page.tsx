'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Plus, X, Clock, Users, Phone, ChevronDown, CheckCircle2, XCircle, ArrowRight, Pencil, BookOpen, List, Search, UserPlus, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/components/LanguageContext';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const RES_STATUSES = ['UPCOMING', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
const WAIT_STATUSES = ['WAITING', 'SEATED', 'LEFT'];

const RES_COLORS: Record<string, string> = {
    UPCOMING: 'bg-primary/10 text-primary border-primary/30',
    SEATED: 'bg-primary/10 text-primary border-primary/30',
    COMPLETED: 'bg-muted-foreground/50 text-muted-foreground border-slate-600',
    CANCELLED: 'bg-error-500/10 text-error-400 border-error-500/30',
    NO_SHOW: 'bg-warning-500/10 text-warning-400 border-warning-500/30',
    WAITING: 'bg-warning-500/10 text-warning-400 border-warning-500/30',
    LEFT: 'bg-muted-foreground/50 text-muted-foreground border-slate-600',
};

type Tab = 'reservations' | 'waiting';

export default function ReservationsPage() {
    const { t } = useLanguage();
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [tab, setTab] = useState<Tab>('reservations');
    const [reservations, setReservations] = useState<any[]>([]);
    const [waiting, setWaiting] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Customer Selection State
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    // Calendar State
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Reservation form
    const [showResModal, setShowResModal] = useState(false);
    const [editRes, setEditRes] = useState<any>(null);
    const [resForm, setResForm] = useState({ guestName: '', guestPhone: '', partySize: '2', date: '', note: '', tableId: '', customerId: '', status: 'UPCOMING' });

    // Waiting form
    const [showWaitModal, setShowWaitModal] = useState(false);
    const [waitForm, setWaitForm] = useState({ guestName: '', guestPhone: '', partySize: '2', note: '', customerId: '' });

    const [saving, setSaving] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const [rRes, wRes, tRes, cRes] = await Promise.all([
                api.get('/restaurant/reservations'),
                api.get('/restaurant/waiting'),
                api.get('/restaurant/tables'),
                api.get('/crm/customers'),
            ]);
            setReservations(Array.isArray(rRes.data) ? rRes.data : rRes.data.data || []);
            setWaiting(Array.isArray(wRes.data) ? wRes.data : wRes.data.data || []);
            setTables(Array.isArray(tRes.data) ? tRes.data : tRes.data.data || []);
            setCustomers(Array.isArray(cRes.data) ? cRes.data : cRes.data.data || []);
        } catch (err) {
            console.error('Failed to load reservations data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Click outside to close customer search
    useEffect(() => {
        const handleClick = () => setShowCustomerSearch(false);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // ── Reservation CRUD ──
    const openNewRes = () => {
        setEditRes(null);
        // Default date to 30 min from now
        const d = new Date(); d.setMinutes(d.getMinutes() + 30);
        setResForm({ guestName: '', guestPhone: '', partySize: '2', date: d.toISOString().slice(0, 16), note: '', tableId: '', customerId: '', status: 'UPCOMING' });
        setCustomerSearch('');
        setShowCustomerSearch(false);
        setShowResModal(true);
    };

    const openEditRes = (r: any) => {
        setEditRes(r);
        setResForm({ guestName: r.guestName, guestPhone: r.guestPhone || '', partySize: String(r.partySize), date: new Date(r.date).toISOString().slice(0, 16), note: r.note || '', tableId: r.tableId || '', customerId: r.customerId || '', status: r.status });
        setCustomerSearch(r.guestName);
        setShowResModal(true);
    };

    const filteredCRM = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter(c =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            (c.phone && c.phone.includes(customerSearch))
        ).slice(0, 5);
    }, [customers, customerSearch]);

    const selectCustomer = (c: any, targetTab?: Tab) => {
        const activeTab = targetTab || tab;
        if (activeTab === 'reservations') {
            setResForm(f => ({ ...f, customerId: c.id, guestName: c.name, guestPhone: c.phone || f.guestPhone }));
        } else {
            setWaitForm(f => ({ ...f, customerId: c.id, guestName: c.name, guestPhone: c.phone || f.guestPhone }));
        }
        setCustomerSearch(c.name);
        setShowCustomerSearch(false);
    };

    const handleCreateQuickCustomer = async (targetTab?: Tab) => {
        const activeTab = targetTab || tab;
        const name = activeTab === 'reservations' ? resForm.guestName : waitForm.guestName;
        const phone = activeTab === 'reservations' ? resForm.guestPhone : waitForm.guestPhone;

        if (!name || !phone) {
            alert('Name and Phone are required for new customers');
            return;
        }
        setIsCreatingCustomer(true);
        try {
            const res = await api.post('/crm/customers', {
                name,
                phone,
                email: ''
            });
            const newCust = res.data;
            setCustomers(prev => [newCust, ...prev]);
            if (activeTab === 'reservations') {
                setResForm(f => ({ ...f, customerId: newCust.id }));
            } else {
                setWaitForm(f => ({ ...f, customerId: newCust.id }));
            }
            setShowCustomerSearch(false);
            alert('Customer created and linked!');
        } catch (err) {
            console.error('Failed to create customer', err);
            alert('Failed to create customer');
        } finally {
            setIsCreatingCustomer(false);
        }
    };

    const saveReservation = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        // Ensure the date string has seconds so Prisma's ISO parser is happy
        const fullDate = resForm.date.length === 16 ? resForm.date + ':00' : resForm.date;
        const payload = { ...resForm, date: fullDate, partySize: parseInt(resForm.partySize), tableId: resForm.tableId || undefined, customerId: resForm.customerId || undefined };

        try {
            if (editRes) {
                await api.patch(`/restaurant/reservations/${editRes.id}`, payload);
            } else {
                await api.post('/restaurant/reservations', payload);
            }
            setShowResModal(false);
            fetchAll();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Quick time presets — sets just the time part, keeps current date
    const setQuickTime = (hhmm: string) => {
        const currentDate = resForm.date ? resForm.date.split('T')[0] : new Date().toISOString().split('T')[0];
        setResForm(f => ({ ...f, date: `${currentDate}T${hhmm}` }));
    };


    const updateResStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/restaurant/reservations/${id}`, { status });
            fetchAll();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const deleteRes = async (id: string) => {
        if (!confirm('Delete this reservation?')) return;
        try {
            await api.delete(`/restaurant/reservations/${id}`);
            fetchAll();
        } catch (err) {
            console.error('Failed to delete reservation', err);
        }
    };

    // ── Waiting CRUD ──
    const saveWaiting = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true);
        try {
            await api.post('/restaurant/waiting', { ...waitForm, partySize: parseInt(waitForm.partySize), customerId: waitForm.customerId || undefined });
            setShowWaitModal(false);
            setWaitForm({ guestName: '', guestPhone: '', partySize: '2', note: '', customerId: '' });
            setCustomerSearch('');
            fetchAll();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add to list');
        } finally {
            setSaving(false);
        }
    };

    const openNewWait = () => {
        setWaitForm({ guestName: '', guestPhone: '', partySize: '2', note: '', customerId: '' });
        setCustomerSearch('');
        setShowCustomerSearch(false);
        setShowWaitModal(true);
    };

    const updateWaitStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/restaurant/waiting/${id}`, { status });
            fetchAll();
        } catch (err) {
            console.error('Failed to update wait status', err);
        }
    };

    const activeWaiting = waiting.filter(w => w.status === 'WAITING');
    const upcomingRes = reservations.filter(r => r.status === 'UPCOMING' || r.status === 'SEATED');

    return (
        <div className="text-slate-200">
            {/* Header */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('reservations_title')}</h1>
                    <p className="text-muted-foreground text-lg">{t('reservations_subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={openNewWait} className="flex items-center gap-2 bg-warning-600 hover:bg-warning-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <List className="h-4 w-4" /> {t('add_to_waitlist')}
                    </button>
                    <button onClick={openNewRes} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                        <Plus className="h-4 w-4" /> {t('new_reservation')}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: t('upcoming_reservations'), value: upcomingRes.length, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: t('waiting_now'), value: activeWaiting.length, color: 'text-warning-400', bg: 'bg-warning-500/10' },
                    { label: t('available_tables'), value: tables.filter(t => t.status === 'AVAILABLE').length, color: 'text-primary', bg: 'bg-primary/10' },
                ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`p-5 rounded-xl border border-border bg-card flex items-center gap-4`}>
                        <div className={`text-3xl font-black ${color}`}>{value}</div>
                        <div className="text-sm text-muted-foreground">{label}</div>
                    </div>
                ))}
            </div>

            {/* View & Tab Toggles */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
                    {([['reservations', BookOpen, t('reservations_title')], ['waiting', List, t('waiting_list')]] as [Tab, any, string][]).map(([tLabel, Icon, label]) => (
                        <button key={tLabel} onClick={() => setTab(tLabel)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === tLabel ? 'bg-muted-foreground text-white' : 'text-muted-foreground hover:text-slate-200'}`}>
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>

                {tab === 'reservations' && (
                    <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
                        <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-slate-300'}`}>
                            <LayoutList className="h-5 w-5" />
                        </button>
                        <button onClick={() => setView('calendar')} className={`p-2 rounded-lg transition-colors ${view === 'calendar' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-slate-300'}`}>
                            <LayoutGrid className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>

            {loading ? <div className="py-20 text-center text-muted-foreground">Loading...</div> : tab === 'reservations' ? (
                // ─── RESERVATIONS TAB ───
                <div className="space-y-3">
                    {view === 'list' ? (
                        reservations.length === 0 ? (
                            <div className="py-20 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">{t('no_reservations')}</p>
                                <p className="text-sm mt-1">{t('click_to_start_res')}</p>
                            </div>
                        ) : reservations.map(r => (
                            <div key={r.id} className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl hover:border-slate-700 transition-colors group">
                                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-white">{r.guestName}</p>
                                            {r.customerId && <div className="h-1.5 w-1.5 rounded-full bg-primary" title="Linked to CRM" />}
                                        </div>
                                        {r.guestPhone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{r.guestPhone}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                                        <span>{new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" /> {r.partySize} guests
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {r.table ? `Table #${r.table.number}` : <span className="text-slate-600">No table</span>}
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border w-fit ${RES_COLORS[r.status] || ''}`}>{r.status}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {r.status === 'UPCOMING' && (
                                        <button onClick={() => updateResStatus(r.id, 'SEATED')} className="text-xs px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                            <ArrowRight className="h-3.5 w-3.5" /> {t('seat')}
                                        </button>
                                    )}
                                    {r.status === 'SEATED' && (
                                        <button onClick={() => updateResStatus(r.id, 'COMPLETED')} className="text-xs px-3 py-1.5 bg-muted-foreground text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-1">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> {t('done_action')}
                                        </button>
                                    )}
                                    <button onClick={() => openEditRes(r)} className="p-2 text-muted-foreground hover:text-white hover:bg-muted rounded-lg transition-colors">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => deleteRes(r.id)} className="p-2 text-slate-600 hover:text-error-400 hover:bg-error-500/10 rounded-lg transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Calendar Placeholder - Basic Day View */
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                                <div className="flex items-center justify-between p-4 bg-card border-b border-border">
                                    <div className="flex items-center gap-4">
                                        <h3 className="font-bold text-lg text-white">{selectedDate.toLocaleDateString([], { month: 'long', year: 'numeric', day: 'numeric' })}</h3>
                                        <div className="flex gap-1 border border-border rounded-lg overflow-hidden">
                                            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); }} className="p-2 hover:bg-muted transition-colors border-r border-border"><ChevronLeft className="h-4 w-4" /></button>
                                            <button onClick={() => { const d = new Date(); setSelectedDate(d); }} className="px-3 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">{t('today')}</button>
                                            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); }} className="p-2 hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-medium">Showing {reservations.filter(r => new Date(r.date).toDateString() === selectedDate.toDateString()).length} reservations</div>
                                </div>
                                <div className="divide-y divide-slate-800/50">
                                    {Array.from({ length: 15 }, (_, i) => i + 8).map(hour => {
                                        const hourRes = reservations.filter(r => {
                                            const d = new Date(r.date);
                                            return d.toDateString() === selectedDate.toDateString() && d.getHours() === hour;
                                        });
                                        return (
                                            <div key={hour} className="flex min-h-[80px]">
                                                <div className="w-20 p-4 text-xs font-black text-slate-600 text-right border-r border-border/50 bg-background/20">{hour}:00</div>
                                                <div className="flex-1 p-2 flex gap-2 flex-wrap items-start bg-card/40">
                                                    {hourRes.map(r => (
                                                        <div key={r.id} onClick={() => openEditRes(r)} className={`p-2.5 rounded-xl border text-xs cursor-pointer shadow-sm min-w-[150px] transition-all hover:scale-[1.02] ${RES_COLORS[r.status]}`}>
                                                            <div className="font-black truncate">{r.guestName}</div>
                                                            <div className="flex items-center gap-1.5 mt-1 opacity-70">
                                                                <Clock className="h-3 w-3" /> {new Date(r.date).getMinutes().toString().padStart(2, '0')} • {r.partySize}p
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // ─── WAITING LIST TAB ───
                <div className="space-y-3">
                    {waiting.length === 0 ? (
                        <div className="py-20 text-center border border-dashed border-border rounded-2xl text-muted-foreground">
                            <List className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">{t('waiting_list_empty')}</p>
                            <p className="text-sm mt-1">{t('add_walkin_guests')}</p>
                        </div>
                    ) : waiting.map((w, idx) => {
                        const waited = Math.floor((Date.now() - new Date(w.createdAt).getTime()) / 60000);
                        return (
                            <div key={w.id} className={`flex items-center gap-4 p-5 bg-card border rounded-2xl transition-colors ${w.status === 'WAITING' ? 'border-warning-500/20' : 'border-border opacity-60'}`}>
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-warning-500/10 border border-warning-500/20 flex items-center justify-center font-black text-warning-400">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="font-semibold text-white">{w.guestName}</p>
                                        {w.guestPhone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{w.guestPhone}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" /> {w.partySize} guests
                                    </div>
                                    <div className={`flex items-center gap-2 text-sm font-medium ${waited >= 15 ? 'text-error-400' : waited >= 8 ? 'text-warning-400' : 'text-muted-foreground'}`}>
                                        <Clock className="h-4 w-4" /> Waiting {waited}m
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border w-fit ${RES_COLORS[w.status] || ''}`}>{w.status}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {w.status === 'WAITING' && <>
                                        <button onClick={() => updateWaitStatus(w.id, 'SEATED')} className="text-xs px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                                            <ArrowRight className="h-3.5 w-3.5" /> {t('seat')}
                                        </button>
                                        <button onClick={() => updateWaitStatus(w.id, 'LEFT')} className="text-xs px-3 py-1.5 bg-error-500/10 border border-error-500/20 text-error-400 rounded-lg hover:bg-error-500/20 transition-colors flex items-center gap-1">
                                            <XCircle className="h-3.5 w-3.5" /> {t('cancel')}
                                        </button>
                                    </>}
                                    {w.note && <span className="text-xs text-muted-foreground italic">"{w.note}"</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Reservation Modal ─── */}
            {showResModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                            <h2 className="text-xl font-bold text-white">{editRes ? t('edit_reservation') : t('new_reservation')}</h2>
                            <button onClick={() => setShowResModal(false)} className="text-muted-foreground hover:text-white p-1.5 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={saveReservation} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('guest_customer')} *</label>
                                    <div className="relative group" onClick={e => e.stopPropagation()}>
                                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            required
                                            value={customerSearch}
                                            onChange={e => {
                                                setCustomerSearch(e.target.value);
                                                setResForm({ ...resForm, guestName: e.target.value, customerId: '' });
                                                setShowCustomerSearch(true);
                                            }}
                                            onFocus={() => setShowCustomerSearch(true)}
                                            placeholder="Search or type name..."
                                            className={`w-full bg-background border ${resForm.customerId ? 'border-primary/50 ring-1 ring-success-500/20' : 'border-border'} rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-primary transition-all`}
                                        />
                                        {resForm.customerId && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Customer Dropdown */}
                                    {showCustomerSearch && (customerSearch.length > 0) && (
                                        <div className="absolute z-[60] left-0 right-0 mt-1 bg-card border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                            {filteredCRM.map(c => (
                                                <button key={c.id} type="button" onClick={() => selectCustomer(c, 'reservations')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left border-b border-border last:border-0 transition-colors">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Search className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{c.name}</div>
                                                        <div className="text-[10px] text-muted-foreground">{c.phone || 'No phone'}</div>
                                                    </div>
                                                </button>
                                            ))}
                                            {!resForm.customerId && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCreateQuickCustomer('reservations')}
                                                    disabled={isCreatingCustomer}
                                                    className="w-full px-4 py-3 flex items-center gap-3 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-colors"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                    {isCreatingCustomer ? 'Creating...' : `Create "${customerSearch}" as new customer`}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('phone')}</label>
                                    <input value={resForm.guestPhone} onChange={e => setResForm({ ...resForm, guestPhone: e.target.value })} type="tel"
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('date_time')} *</label>
                                    <div className="space-y-2">
                                        {/* Date + Time pickers side by side */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                required
                                                type="date"
                                                value={resForm.date ? resForm.date.split('T')[0] : ''}
                                                onChange={e => {
                                                    const timePart = resForm.date?.split('T')[1] || '19:00';
                                                    setResForm(f => ({ ...f, date: `${e.target.value}T${timePart}` }));
                                                }}
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white outline-none focus:border-primary text-sm"
                                            />
                                            <input
                                                required
                                                type="time"
                                                value={resForm.date ? resForm.date.split('T')[1]?.slice(0, 5) : ''}
                                                onChange={e => {
                                                    const datePart = resForm.date?.split('T')[0] || new Date().toISOString().split('T')[0];
                                                    setResForm(f => ({ ...f, date: `${datePart}T${e.target.value}` }));
                                                }}
                                                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-white outline-none focus:border-primary text-sm"
                                            />
                                        </div>
                                        {/* Quick time buttons */}
                                        <div className="flex gap-1.5 flex-wrap">
                                            <span className="text-xs text-slate-600 self-center">Quick:</span>
                                            {['12:00', '13:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => {
                                                const currentTime = resForm.date?.split('T')[1]?.slice(0, 5);
                                                return (
                                                    <button key={t} type="button" onClick={() => setQuickTime(t)}
                                                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${currentTime === t ? 'bg-primary border-primary text-white' : 'border-slate-700 text-muted-foreground hover:border-primary/50 hover:text-primary'}`}>
                                                        {t}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('party_size')}</label>
                                    <input type="number" min="1" max="50" value={resForm.partySize} onChange={e => setResForm({ ...resForm, partySize: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('table_optional')}</label>
                                    <div className="relative">
                                        <select value={resForm.tableId} onChange={e => setResForm({ ...resForm, tableId: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-slate-300 appearance-none outline-none focus:border-primary">
                                            <option value="">{t('auto_assign')}</option>
                                            {tables.map(tOption => <option key={tOption.id} value={tOption.id}>Table #{tOption.number} ({tOption.capacity} seats)</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('status')}</label>
                                    <div className="relative">
                                        <select value={resForm.status} onChange={e => setResForm({ ...resForm, status: e.target.value })}
                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-slate-300 appearance-none outline-none focus:border-primary">
                                            {RES_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('note')}</label>
                                <input value={resForm.note} onChange={e => setResForm({ ...resForm, note: e.target.value })} placeholder={t('order_note_placeholder')}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-primary" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowResModal(false)} className="flex-1 py-2.5 bg-muted hover:bg-muted-foreground text-white rounded-lg transition-colors">{t('cancel')}</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors disabled:opacity-60">
                                    {saving ? t('saving_btn') : editRes ? t('update') : t('create_reservation')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Waiting List Modal ─── */}
            {showWaitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                            <h2 className="text-xl font-bold text-white">{t('add_to_waitlist')}</h2>
                            <button onClick={() => setShowWaitModal(false)} className="text-muted-foreground hover:text-white p-1.5 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={saveWaiting} className="p-6 space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('guest_customer')} *</label>
                                <div className="relative group" onClick={e => e.stopPropagation()}>
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <input
                                        required
                                        value={customerSearch}
                                        onChange={e => {
                                            setCustomerSearch(e.target.value);
                                            setWaitForm({ ...waitForm, guestName: e.target.value, customerId: '' });
                                            setShowCustomerSearch(true);
                                        }}
                                        onFocus={() => setShowCustomerSearch(true)}
                                        placeholder="Search or type name..."
                                        className={`w-full bg-background border ${waitForm.customerId ? 'border-primary/50 ring-1 ring-success-500/20' : 'border-border'} rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-warning-500 transition-all`}
                                    />
                                    {waitForm.customerId && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                    )}
                                </div>

                                {showCustomerSearch && customerSearch.length > 0 && (
                                    <div className="absolute z-[60] left-0 right-0 mt-1 bg-card border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                                        {filteredCRM.map(c => (
                                            <button key={c.id} type="button" onClick={() => selectCustomer(c, 'waiting')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted text-left border-b border-border last:border-0 transition-colors">
                                                <div className="h-8 w-8 rounded-full bg-warning-500/10 flex items-center justify-center">
                                                    <Search className="h-4 w-4 text-warning-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{c.name}</div>
                                                    <div className="text-[10px] text-muted-foreground">{c.phone || 'No phone'}</div>
                                                </div>
                                            </button>
                                        ))}
                                        {!waitForm.customerId && (
                                            <button
                                                type="button"
                                                onClick={() => handleCreateQuickCustomer('waiting')}
                                                disabled={isCreatingCustomer}
                                                className="w-full px-4 py-3 flex items-center gap-3 bg-warning-600/10 hover:bg-warning-600/20 text-warning-400 text-sm font-bold transition-colors"
                                            >
                                                <UserPlus className="h-4 w-4" />
                                                {isCreatingCustomer ? 'Creating...' : `Create "${customerSearch}" as new customer`}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('phone')}</label>
                                    <input type="tel" value={waitForm.guestPhone} onChange={e => setWaitForm({ ...waitForm, guestPhone: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-warning-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('party_size')}</label>
                                    <input type="number" min="1" max="50" value={waitForm.partySize} onChange={e => setWaitForm({ ...waitForm, partySize: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-warning-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('note')}</label>
                                <input value={waitForm.note} onChange={e => setWaitForm({ ...waitForm, note: e.target.value })} placeholder="Special requests..."
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white outline-none focus:border-warning-500" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowWaitModal(false)} className="flex-1 py-2.5 bg-muted hover:bg-muted-foreground text-white rounded-lg transition-colors">{t('cancel')}</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-warning-600 hover:bg-warning-500 text-white rounded-lg font-medium transition-colors disabled:opacity-60">
                                    {saving ? t('adding_btn') : t('add_to_list')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
