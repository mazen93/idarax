'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, Plus, X, Calendar, Settings2, Trash2, CheckCircle2, AlertCircle, Search, Grid3X3, Layers, ChevronRight } from 'lucide-react';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';

const DAYS_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const defaultForm = {
    name: '',
    nameAr: '',
    startTime: '06:00',
    endTime: '23:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    categoryIds: [] as string[],
};

export default function MenusPage() {
    const { showAlert, showConfirm } = useModal();
    const { t, isRTL } = useLanguage();
    const [menus, setMenus] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...defaultForm });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [menuRes, catRes] = await Promise.all([
                api.get('/retail/menus'),
                api.get('/retail/categories')
            ]);

            setMenus(Array.isArray(menuRes.data) ? menuRes.data : (menuRes.data?.data || []));
            setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data || []));
        } catch (err) {
            console.error('Error fetching data:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...form,
            categoryIds: form.categoryIds,
        };

        try {
            if (editingId) {
                await api.patch(`/retail/menus/${editingId}`, payload);
            } else {
                await api.post('/retail/menus', payload);
            }

            setShowForm(false);
            setEditingId(null);
            setForm({ ...defaultForm });
            fetchData();
            showAlert({ title: t('success'), message: t('save_success') || 'Menu saved successfully', variant: 'SUCCESS' });
        } catch (err: any) {
            console.error(err);
            showAlert({ title: t('error'), message: err.response?.data?.message || 'Failed to save menu', variant: 'DANGER' });
        }
    };

    const handleEdit = (menu: any) => {
        setEditingId(menu.id);
        setForm({
            name: menu.name,
            nameAr: menu.nameAr || '',
            startTime: menu.startTime,
            endTime: menu.endTime,
            daysOfWeek: Array.isArray(menu.daysOfWeek) ? menu.daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
            categoryIds: Array.isArray(menu.categories) ? menu.categories.map((c: any) => c.categoryId) : []
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        showConfirm({
            title: t('delete_menu'),
            message: t('delete_menu_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                try {
                    await api.delete(`/retail/menus/${id}`);
                    fetchData();
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    const toggleDay = (day: number) => {
        setForm(prev => ({
            ...prev,
            daysOfWeek: prev.daysOfWeek.includes(day)
                ? prev.daysOfWeek.filter(d => d !== day)
                : [...prev.daysOfWeek, day]
        }));
    };

    const toggleCategory = (catId: string) => {
        setForm(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(catId)
                ? prev.categoryIds.filter(id => id !== catId)
                : [...prev.categoryIds, catId]
        }));
    };

    return (
        <div className={`min-h-screen text-slate-200 p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2 flex items-center gap-3">
                        <Clock className="w-8 h-8 text-primary" /> {t('menus_title')}
                    </h1>
                    <p className="text-muted-foreground text-lg">{t('menus_subtitle')}</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (!showForm) {
                            setEditingId(null);
                            setForm({ ...defaultForm });
                        }
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-success-900/20 active:scale-95"
                >
                    {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                    {showForm ? t('cancel') : editingId ? t('edit') : t('new_menu')}
                </button>
            </div>

            {showForm && (
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" />
                            {editingId ? t('edit') : t('new_menu')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1">{t('name')}</label>
                                        <input
                                            required
                                            placeholder="e.g. Breakfast"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-success-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1">{t('name_ar')}</label>
                                        <input
                                            placeholder="مثال: الفطور"
                                            value={form.nameAr}
                                            onChange={e => setForm({ ...form, nameAr: e.target.value })}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-success-500 transition-all text-right"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground ml-1">{t('start_time')}</label>
                                            <div className="relative">
                                                <input
                                                    type="time"
                                                    required
                                                    value={form.startTime}
                                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground ml-1">{t('end_time')}</label>
                                            <div className="relative">
                                                <input
                                                    type="time"
                                                    required
                                                    value={form.endTime}
                                                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" /> {t('days_of_week')}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {DAYS_SHORT.map((day, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleDay(idx)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${form.daysOfWeek.includes(idx)
                                                        ? 'bg-primary/10 border-primary text-primary'
                                                        : 'bg-background border-border text-muted-foreground hover:border-primary/30'
                                                        }`}
                                                >
                                                    {t(day)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-muted-foreground ml-1 flex items-center gap-2">
                                            <Layers className="w-4 h-4 text-primary" /> {t('link_categories')}
                                        </label>
                                        <div className="bg-background border border-border rounded-2xl p-4 max-h-[240px] overflow-y-auto custom-scrollbar space-y-2">
                                            {categories.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">{t('no_categories') || 'No categories found.'}</p>}
                                            {Array.isArray(categories) && categories.map(cat => (
                                                <label
                                                    key={cat.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${form.categoryIds.includes(cat.id)
                                                        ? 'bg-primary/5 border-primary/30'
                                                        : 'hover:bg-muted border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${form.categoryIds.includes(cat.id) ? 'bg-primary border-primary' : 'border-border'
                                                            }`}>
                                                            {form.categoryIds.includes(cat.id) && <Plus className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">{isRTL ? (cat.nameAr || cat.name) : cat.name}</span>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={form.categoryIds.includes(cat.id)}
                                                        onChange={() => toggleCategory(cat.id)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold transition-all"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-10 py-3 bg-primary hover:bg-primary text-white rounded-xl font-bold transition-all shadow-lg shadow-success-900/20"
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-card/50">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Grid3X3 className="w-5 h-5 text-primary" /> {t('active_menus')}
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('name')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('time_range')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('days_of_week')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('category')}</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-primary/20 border-t-success-500 rounded-full animate-spin" />
                                            <p className="text-muted-foreground font-medium animate-pulse">{t('loading')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (!Array.isArray(menus) || menus.length === 0) ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Clock className="w-12 h-12 mb-2" />
                                            <p className="text-lg font-medium">{t('no_menus')}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : Array.isArray(menus) && menus.map(menu => (
                                <tr key={menu.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {isRTL ? (menu.nameAr || menu.name) : menu.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold border border-primary/20">
                                            <Clock className="w-3.5 h-3.5" />
                                            {menu.startTime} - {menu.endTime}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1">
                                            {menu.daysOfWeek.length === 7 ? (
                                                <span className="text-xs font-medium text-muted-foreground">{t('all_day')}</span>
                                            ) : (
                                                Array.isArray(menu.daysOfWeek) && menu.daysOfWeek.map((d: number) => (
                                                    <span key={d} className="px-1.5 py-0.5 bg-muted rounded text-[10px] uppercase font-bold text-muted-foreground">
                                                        {t(DAYS_SHORT[d])}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {Array.isArray(menu.categories) && menu.categories.map((c: any) => (
                                                <span key={c.categoryId} className="inline-flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-lg text-xs font-medium text-muted-foreground">
                                                    {isRTL ? (c.category?.nameAr || c.category?.name) : c.category?.name}
                                                </span>
                                            ))}
                                            {(!menu.categories || menu.categories.length === 0) && <span className="text-xs text-muted-foreground italic">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(menu)}
                                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(menu.id)}
                                                className="p-2 text-muted-foreground hover:text-error-400 hover:bg-error-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
