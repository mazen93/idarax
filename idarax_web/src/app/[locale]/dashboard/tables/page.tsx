'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';
import { Plus, Pencil, Trash2, X, Check, Table as TableIcon, Users, ShoppingCart, Circle, Layout, Move, Merge, LogOut, ChevronRight, Layers, Printer, Eye, QrCode } from 'lucide-react';
import { printOrderReceipt } from '@/utils/printUtils';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const STATUS_COLORS: Record<string, string> = {
    AVAILABLE: 'border-primary/40 bg-primary/5',
    OCCUPIED: 'border-warning-500/40 bg-warning-500/5',
    RESERVED: 'border-primary/40 bg-primary/5',
    CLEANING: 'border-error-500/40 bg-error-500/5',
};

const STATUS_DOT: Record<string, string> = {
    AVAILABLE: 'bg-primary',
    OCCUPIED: 'bg-warning-400',
    RESERVED: 'bg-primary-400',
    CLEANING: 'bg-error-400',
};

const ALL_STATUSES = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'];

export default function TablesPage() {
    const { showAlert, showConfirm } = useModal();
    const { t } = useLanguage();
    const router = useRouter();
    const [tables, setTables] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [activeSection, setActiveSection] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showMergeModal, setShowMergeModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState<any>(null);
    const [generatingQRs, setGeneratingQRs] = useState(false);

    const [editingTable, setEditingTable] = useState<any>(null);
    const [editingSection, setEditingSection] = useState<any>(null);
    const [selectedTable, setSelectedTable] = useState<any>(null);

    const [form, setForm] = useState({ number: '', capacity: '4', status: 'AVAILABLE', sectionId: '' });
    const [sectionForm, setSectionForm] = useState({ name: '' });
    const [moveTargetId, setMoveTargetId] = useState('');
    const [settings, setSettings] = useState<any>(null);

    const [saving, setSaving] = useState(false);

    const [inlineStatus, setInlineStatus] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tRes, sRes] = await Promise.all([
                api.get('/restaurant/tables'),
                api.get('/restaurant/table-sections')
            ]);
            setTables(Array.isArray(tRes.data) ? tRes.data : tRes.data?.data || []);
            setSections(Array.isArray(sRes.data) ? sRes.data : sRes.data?.data || []);

            const settingsRes = await api.get('/tenant/settings');
            setSettings(settingsRes.data);
        } catch (error) {
            console.error('Failed to fetch tables data:', error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setEditingTable(null);
        setForm({ number: '', capacity: '4', status: 'AVAILABLE', sectionId: '' });
        setShowModal(true);
    };

    const openEdit = (table: any) => {
        setEditingTable(table);
        setForm({
            number: String(table.number),
            capacity: String(table.capacity),
            status: table.status || 'AVAILABLE',
            sectionId: table.sectionId || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Unique Number Check
        const tableNumber = parseInt(form.number);
        const isDuplicate = tables.some(t => t.number === tableNumber && t.id !== editingTable?.id);
        if (isDuplicate) {
            alert(t('table_number_must_be_unique') || 'Table number must be unique');
            return;
        }

        setSaving(true);
        const payload: any = {
            number: tableNumber,
            capacity: parseInt(form.capacity),
            sectionId: form.sectionId || null
        };

        // Only include status if editing (backend CreateTableDto doesn't allow status)
        if (editingTable) {
            payload.status = form.status;
        }

        try {
            if (editingTable) {
                await api.patch(`/restaurant/tables/${editingTable.id}`, payload);
            } else {
                await api.post('/restaurant/tables', payload);
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            console.error('Failed to save table:', error);
            const errorMessage = error.response?.data?.message || error.message;
            alert(`${t('failed_to_save_table') || 'Failed to save table'}: ${errorMessage}`);
        } finally {
            setSaving(false);
        }
    };

    const handleSectionSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingSection) {
                await api.patch(`/restaurant/table-sections/${editingSection.id}`, sectionForm);
            } else {
                await api.post('/restaurant/table-sections', sectionForm);
            }
            setShowSectionModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save section:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleMoveOrder = async () => {
        if (!selectedTable || !moveTargetId) return;
        setSaving(true);
        try {
            await api.post(`/restaurant/tables/${selectedTable.id}/move-order`, { targetTableId: moveTargetId });
            setShowMoveModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to move order:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleMerge = async () => {
        if (!selectedTable || !moveTargetId) return;
        setSaving(true);
        try {
            await api.post(`/restaurant/tables/${selectedTable.id}/merge`, { targetTableId: moveTargetId });
            setShowMergeModal(false);
            fetchData();
        } catch (error) {
            console.error('Failed to merge tables:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateQRCodes = async () => {
        setGeneratingQRs(true);
        try {
            await api.post('/restaurant/tables/generate-qrcodes');
            showAlert({ title: t('success'), message: t('qrcodes_generated') || 'All QR codes have been regenerated successfully.', variant: 'SUCCESS' });
            fetchData();
        } catch (error) {
            console.error('Failed to generate QR codes:', error);
            showAlert({ title: t('error'), message: 'Failed to generate QR codes.', variant: 'DANGER' });
        } finally {
            setGeneratingQRs(false);
        }
    };

    const handleCheckout = async (tableId: string) => {
        showConfirm({
            title: t('checkout_table'),
            message: t('checkout_confirm'),
            variant: 'WARNING',
            onConfirm: async () => {
                setSaving(true);
                try {
                    const res = await api.post(`/restaurant/tables/${tableId}/checkout`);
                    const data = res.data;
                    if (data.orders && data.orders.length > 0) {
                        const tenantInfo = { name: localStorage.getItem('tenant_name') || 'Restaurant' };
                        const printSettings = settings || { currency: 'USD', taxRate: 0, serviceFee: 0 };
                        data.orders.forEach((order: any) => {
                            printOrderReceipt(tenantInfo, order, printSettings);
                        });
                    }
                    fetchData();
                    showAlert({ title: t('success'), message: t('table_cleared'), variant: 'SUCCESS' });
                } catch (error) {
                    console.error('Checkout failed:', error);
                    showAlert({ title: t('error'), message: 'Checkout failed.', variant: 'DANGER' });
                } finally {
                    setSaving(false);
                }
            }
        });
    };

    const handleStatusChange = async (tableId: string, newStatus: string) => {
        try {
            await api.patch(`/restaurant/tables/${tableId}`, { status: newStatus });
            setInlineStatus(null);
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDelete = async (id: string, num: number) => {
        showConfirm({
            title: 'Delete Table',
            message: `Are you sure you want to delete Table #${num}? This action cannot be undone.`,
            variant: 'DANGER',
            onConfirm: async () => {
                try {
                    await api.delete(`/restaurant/tables/${id}`);
                    fetchData();
                    showAlert({ title: 'Deleted', message: `Table #${num} has been removed.`, variant: 'INFO' });
                } catch (error) {
                    console.error('Failed to delete table:', error);
                    showAlert({ title: 'Error', message: 'Failed to delete table.', variant: 'DANGER' });
                }
            }
        });
    };

    const filteredTables = tables.filter(t => activeSection === 'all' || t.sectionId === activeSection);

    const stats = {
        total: tables.length,
        available: tables.filter(t => t.status === 'AVAILABLE').length,
        occupied: tables.filter(t => t.status === 'OCCUPIED').length,
        reserved: tables.filter(t => t.status === 'RESERVED').length,
    };

    return (
        <div className="text-foreground" onClick={() => inlineStatus && setInlineStatus(null)}>
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('tables_title')}</h1>
                    <p className="text-muted-foreground text-lg">{t('tables_subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleGenerateQRCodes} disabled={generatingQRs}
                        className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2.5 rounded-lg font-medium transition-colors border border-primary/20">
                        <QrCode className={`h-4 w-4 ${generatingQRs ? 'animate-spin' : ''}`} /> {generatingQRs ? t('generating') || 'Generating...' : t('generate_qr_codes') || 'Generate QR Codes'}
                    </button>
                    <button onClick={() => { setEditingSection(null); setSectionForm({ name: '' }); setShowSectionModal(true); }}
                        className="flex items-center gap-2 bg-muted hover:bg-muted-foreground text-foreground px-4 py-2.5 rounded-lg font-medium transition-colors border border-slate-700">
                        <Layers className="h-4 w-4" /> {t('add_section')}
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-success-900/20">
                        <Plus className="h-4 w-4" /> {t('add_table')}
                    </button>
                </div>
            </div>

            {/* Quick Filters / Sections */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveSection('all')}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeSection === 'all' ? 'bg-primary text-primary-foreground shadow-xl scale-105' : 'bg-card text-muted-foreground border border-border hover:text-foreground'}`}
                >
                    {t('all_areas')} ({tables.length})
                </button>
                {sections.map(s => (
                    <div key={s.id} className="flex items-center gap-1 group">
                        <button
                            onClick={() => setActiveSection(s.id)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${activeSection === s.id ? 'bg-primary text-primary-foreground shadow-xl scale-105' : 'bg-card text-muted-foreground border border-border hover:text-foreground'}`}
                        >
                            {s.name} ({s.tables?.length || 0})
                        </button>
                        <button onClick={() => { setEditingSection(s); setSectionForm({ name: s.name }); setShowSectionModal(true); }} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-primary transition-all">
                            <Pencil className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: t('total_tables'), value: stats.total, icon: TableIcon, color: 'text-muted-foreground', bg: 'bg-muted' },
                    { label: t('available'), value: stats.available, icon: Circle, color: 'text-primary', bg: 'bg-primary/10' },
                    { label: t('occupied'), value: stats.occupied, icon: Users, color: 'text-warning-400', bg: 'bg-warning-500/10' },
                    { label: t('reserved'), value: stats.reserved, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="p-4 bg-card border border-border rounded-2xl flex items-center gap-4 backdrop-blur-sm">
                        <div className={`p-2.5 rounded-xl ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
                        <div><p className="text-xl font-black text-foreground">{value}</p><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{label}</p></div>
                    </div>
                ))}
            </div>

            {/* Tables Grid */}
            {loading ? (
                <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-success-500 rounded-full animate-spin" />
                    {t('scanning_floor')}
                </div>
            ) : filteredTables.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card/20">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <TableIcon className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="text-muted-foreground font-bold text-lg">{t('no_tables_section')}</p>
                    <p className="text-slate-600 text-sm mt-1">{t('try_another_area')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {filteredTables.sort((a, b) => a.number - b.number).map(table => (
                        <div key={table.id} className={`group relative p-5 rounded-3xl border-2 transition-all hover:scale-102 hover:shadow-2xl ${table.isMerged ? 'border-dashed' : ''} ${STATUS_COLORS[table.status] || STATUS_COLORS.AVAILABLE}`}>
                            {/* Status label */}
                            <div className="absolute top-4 right-4 outline-none">
                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest text-primary-foreground shadow-sm ${STATUS_DOT[table.status] || STATUS_DOT.AVAILABLE}`}>
                                    {table.status}
                                </div>
                            </div>

                            {table.isMerged && (
                                <div className="absolute top-4 left-4 flex items-center gap-1 text-[8px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                                    <Merge className="h-2.5 w-2.5" /> Merged
                                </div>
                            )}

                            <div className="mb-6 pt-2">
                                <p className="text-5xl font-black text-foreground leading-none tracking-tighter drop-shadow-sm group-hover:text-primary transition-colors">#{table.number}</p>
                                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                    <Users className="h-3 w-3" /> {table.capacity} {t('seater')}
                                    {table.section && <span className="text-muted-foreground">• {table.section.name}</span>}
                                </p>
                            </div>

                            {/* Table Actions Overlay */}
                            <div className="grid grid-cols-2 gap-2">
                                {table.status === 'OCCUPIED' ? (
                                    <>
                                        <button
                                            onClick={() => router.push(`/dashboard/pos?tableId=${table.id}`)}
                                            className="col-span-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2 mb-2"
                                        >
                                            <Eye className="h-4 w-4" /> {t('view_order_add')}
                                        </button>
                                        <button
                                            onClick={() => { setSelectedTable(table); setShowMoveModal(true); }}
                                            className="col-span-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-all flex flex-col items-center gap-1"
                                        >
                                            <Move className="h-4 w-4" /> {t('move_btn')}
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/pos?tableId=${table.id}&action=pay`)}
                                            className="col-span-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex flex-col items-center gap-1"
                                        >
                                            <LogOut className="h-4 w-4" /> {t('pay_btn')}
                                        </button>
                                    </>
                                ) : table.status === 'AVAILABLE' ? (
                                    <>
                                        <button
                                            onClick={() => { setSelectedTable(table); setShowMergeModal(true); }}
                                            className="col-span-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-warning-600/20 transition-all flex flex-col items-center gap-1"
                                        >
                                            <Merge className="h-4 w-4" /> {t('merge_btn')}
                                        </button>
                                        <button
                                            onClick={() => openEdit(table)}
                                            className="col-span-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all flex flex-col items-center gap-1"
                                        >
                                            <Pencil className="h-4 w-4" /> {t('edit')}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => handleStatusChange(table.id, 'AVAILABLE')}
                                        className="col-span-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2"
                                    >
                                        {t('make_available')}
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowQRModal(table)}
                                    className="col-span-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-all flex flex-col items-center gap-1"
                                >
                                    <QrCode className="h-4 w-4" /> {t('qr_code') || 'QR Code'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals ... Implementation omitted for brevity in chunking, will be provided in next steps */}
            {/* Table Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl scale-in-center">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div>
                                <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">{editingTable ? `RECONFIGURE #${editingTable.number}` : 'NEW UNIT'}</h2>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Configure physical table parameters</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Unit ID (Number)</label>
                                    <input required type="number" min="1" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })}
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:border-primary text-xl font-black" placeholder="1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Max Capacity</label>
                                    <input required type="number" min="1" max="50" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })}
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:border-primary text-xl font-black" placeholder="4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Floor Section</label>
                                <select
                                    value={form.sectionId}
                                    onChange={e => setForm({ ...form, sectionId: e.target.value })}
                                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-white outline-none focus:border-primary font-bold appearance-none"
                                >
                                    <option value="">No Section (Default)</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {editingTable && (
                                <div>
                                    <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Live Status</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {ALL_STATUSES.map(s => (
                                            <label key={s} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.status === s ? 'border-primary bg-primary/5 shadow-lg shadow-success-900/10' : 'border-border hover:border-border/60'}`}>
                                                <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setForm({ ...form, status: s })} className="sr-only" />
                                                <div className={`h-3 w-3 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`} />
                                                <span className="text-[10px] text-foreground font-black uppercase tracking-widest">{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={saving} className="w-full py-5 bg-primary hover:bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-success-900/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : editingTable ? t('sync_changes') : t('initialize_table')}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Section Modal */}
            {showSectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in zoom-in duration-200">
                    <div className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl">
                        <div className="p-8 border-b border-border text-center">
                            <Layers className="h-10 w-10 text-primary mx-auto mb-4" />
                            <h2 className="text-xl font-black text-foreground italic">{editingSection ? t('update_section') : t('new_section')}</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-2 tracking-widest">Organize your tables by location</p>
                        </div>
                        <form onSubmit={handleSectionSave} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-muted-foreground uppercase mb-2 tracking-widest">Section Alias (Name)</label>
                                <input required type="text" value={sectionForm.name} onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })}
                                    className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-foreground outline-none focus:border-primary font-bold" placeholder="e.g. Garden Terrace" />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowSectionModal(false)} className="flex-1 py-4 bg-muted hover:bg-muted-foreground text-foreground rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Abort</button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 bg-primary hover:bg-primary text-primary-foreground rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary-900/20 transition-all">
                                    {saving ? 'Processing...' : editingSection ? 'Sync Area' : 'Establish Area'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Move Order Modal */}
            {showMoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4">
                    <div className="bg-card border border-border rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 bg-muted/30 flex items-center justify-between border-b border-border">
                            <div>
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter flex items-center gap-3">
                                    <Move className="h-6 w-6 text-primary" />
                                    {t('relocate_order')}
                                </h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{t('moving_from')} #{selectedTable?.number}</p>
                            </div>
                            <button onClick={() => setShowMoveModal(false)} className="bg-muted text-muted-foreground p-2 rounded-full hover:text-foreground transition-all"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-8">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase mb-4 tracking-widest">Destination Seating</label>
                            <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {tables.filter(t => t.status === 'AVAILABLE').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setMoveTargetId(t.id)}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${moveTargetId === t.id ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-muted/20 hover:border-border/60'}`}
                                    >
                                        <span className="text-2xl font-black text-foreground">#{t.number}</span>
                                        <span className="text-[8px] text-muted-foreground uppercase font-black">{t.capacity}P</span>
                                    </button>
                                ))}
                                {tables.filter(t => t.status === 'AVAILABLE').length === 0 && (
                                    <div className="col-span-4 text-center py-10 text-muted-foreground font-bold">{t('no_empty_tables')}</div>
                                )}
                            </div>
                            <button
                                onClick={handleMoveOrder}
                                disabled={!moveTargetId || saving}
                                className="w-full mt-8 py-5 bg-primary hover:bg-primary disabled:opacity-30 text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-900/30 transition-all flex items-center justify-center gap-2"
                            >
                                {t('confirm_migration')} <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Merge Tables Modal */}
            {showMergeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl p-4">
                    <div className="bg-card border border-border rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 bg-muted/30 flex items-center justify-between border-b border-border">
                            <div>
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter flex items-center gap-3">
                                    <Merge className="h-6 w-6 text-warning-400" />
                                    {t('cluster_tables')}
                                </h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{t('moving_from')} #{selectedTable?.number}</p>
                            </div>
                            <button onClick={() => setShowMergeModal(false)} className="bg-muted text-muted-foreground p-2 rounded-full hover:text-foreground transition-all"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-8">
                            <label className="block text-[10px] font-black text-muted-foreground uppercase mb-4 tracking-widest">Parent Unit (Main Table)</label>
                            <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {tables.filter(t => t.status === 'OCCUPIED' && !t.isMerged).map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setMoveTargetId(t.id)}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${moveTargetId === t.id ? 'border-warning-500 bg-warning-500/10 scale-105' : 'border-border bg-muted/20 hover:border-border/60'}`}
                                    >
                                        <span className="text-2xl font-black text-foreground">#{t.number}</span>
                                        <span className="text-[8px] text-muted-foreground uppercase font-black">Active</span>
                                    </button>
                                ))}
                                {tables.filter(t => t.status === 'OCCUPIED' && !t.isMerged).length === 0 && (
                                    <div className="col-span-4 text-center py-10 text-muted-foreground font-bold italic">{t('no_active_tables')}</div>
                                )}
                            </div>
                            <button
                                onClick={handleMerge}
                                disabled={!moveTargetId || saving}
                                className="w-full mt-8 py-5 bg-warning-600 hover:bg-warning-500 disabled:opacity-30 text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-warning-900/30 transition-all flex items-center justify-center gap-2"
                            >
                                {t('merge_selection')} <Check className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-2xl p-4">
                    <div className="bg-card border border-border rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-10 text-center text-foreground">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">TABLE #{showQRModal.number}</h2>
                            <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mb-8">Scan to Order & Pay</p>
                            
                            <div className="bg-muted/50 p-8 rounded-[32px] border-2 border-border flex items-center justify-center mb-8 mx-auto w-fit">
                                {showQRModal.qrCodeUrl ? (
                                    <img src={showQRModal.qrCodeUrl} alt={`QR Code for Table ${showQRModal.number}`} className="w-48 h-48" />
                                ) : (
                                    <div className="w-48 h-48 flex flex-col items-center justify-center text-muted-foreground/30 gap-4">
                                        <QrCode className="w-12 h-12" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest px-4">{t('generate_first') || 'Generate QR Code first'}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-900/20 flex items-center justify-center gap-3 hover:bg-primary transition-all"
                                >
                                    <Printer className="h-4 w-4" /> {t('print_code') || 'Print Code'}
                                </button>
                                <button
                                    onClick={() => setShowQRModal(null)}
                                    className="px-6 py-4 bg-muted hover:bg-muted/80 text-foreground transition-all"
                                >
                                    {t('close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
