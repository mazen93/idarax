'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Pencil, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { useModal } from '@/components/ModalContext';
import { PERMISSION_MODULES } from '@/lib/permissions.constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function RolesTab({ t, isRTL }: { t: any, isRTL: boolean }) {
    const { showAlert, showConfirm } = useModal();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [form, setForm] = useState({ name: '', description: '', permissions: [] as string[] });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/roles`, { headers: getHeaders() });
            if (res.ok) setRoles(await res.json().then(d => d.data || (Array.isArray(d) ? d : [])));
        } catch {}
        setLoading(false);
    };

    useEffect(() => { fetchRoles(); }, []);

    const openCreate = () => {
        setEditingRole(null);
        setForm({ name: '', description: '', permissions: [] });
        setError('');
        setShowModal(true);
    };

    const openEdit = (role: any) => {
        setEditingRole(role);
        setForm({ name: role.name, description: role.description || '', permissions: role.permissions || [] });
        setError('');
        setShowModal(true);
    };

    const togglePermission = (perm: string) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const toggleModule = (moduleActions: any[]) => {
        const moduleValues = moduleActions.map(a => a.value);
        const allSelected = moduleValues.every(v => form.permissions.includes(v));

        setForm(prev => {
            if (allSelected) {
                return { ...prev, permissions: prev.permissions.filter(p => !moduleValues.includes(p)) };
            } else {
                return { ...prev, permissions: Array.from(new Set([...prev.permissions, ...moduleValues])) };
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const url = editingRole ? `${API_URL}/roles/${editingRole.id}` : `${API_URL}/roles`;
            const method = editingRole ? 'PATCH' : 'POST';

            const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'An error occurred');
            } else {
                setShowModal(false);
                fetchRoles();
            }
        } catch {
            setError('Network error');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string, name: string) => {
        showConfirm({
            title: t('delete_role') || 'Delete Role',
            message: `Are you sure you want to delete ${name}? Staff using this role will lose their permissions.`,
            variant: 'DANGER',
            onConfirm: async () => {
                await fetch(`${API_URL}/roles/${id}`, { method: 'DELETE', headers: getHeaders() });
                fetchRoles();
                showAlert({ title: t('deleted') || 'Deleted', message: 'Role has been removed.', variant: 'INFO' });
            }
        });
    };

    return (
        <div className="text-foreground min-h-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Custom Roles</h2>
                    <p className="text-muted-foreground text-sm">Create and manage granular roles and permissions for your staff.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                    <Plus className="h-4 w-4" /> Create Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center text-muted-foreground">{t('loading')}</div>
                ) : roles.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 py-12 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-card">
                        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground font-medium">No custom roles created yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Create a role to start grouping staff permissions.</p>
                    </div>
                ) : (
                    roles.map(role => (
                        <div key={role.id} className="p-6 rounded-xl border border-border bg-card flex flex-col h-full hover:border-primary/30 transition-colors group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{role.name}</h3>
                                    {role.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{role.description}</p>}
                                </div>
                                <div className="p-2.5 bg-primary/10 text-primary rounded-lg flex-shrink-0">
                                    <Shield className="h-5 w-5" />
                                </div>
                            </div>
                            
                            <div className="flex-1 mt-2">
                                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Assigned Modules ({role.permissions?.length || 0})</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {role.permissions?.slice(0, 6).map((p: string) => (
                                        <span key={p} className="px-2 py-1 bg-muted/50 border border-border rounded text-[10px] font-medium text-foreground">{p.replace(':', ' ')}</span>
                                    ))}
                                    {(role.permissions?.length || 0) > 6 && (
                                        <span className="px-2 py-1 bg-muted/50 border border-border rounded text-[10px] font-bold text-primary">+{role.permissions.length - 6}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 pt-5 border-t border-border">
                                <button 
                                    onClick={() => openEdit(role)} 
                                    className="flex-1 flex justify-center items-center gap-2 px-3 py-2 text-sm text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 rounded-lg transition-all hover:scale-[1.02] active:scale-95 font-medium"
                                >
                                    <Pencil className="h-4 w-4" /> {t('edit_role') || 'Edit Role'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(role.id, role.name)} 
                                    title={t('delete')}
                                    className="p-2 flex justify-center items-center text-error-500 bg-error-500/10 hover:bg-error-500/20 border border-error-500/20 hover:border-error-500/40 rounded-lg transition-all hover:scale-110 active:scale-95"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{editingRole ? 'Edit Custom Role' : 'Create Custom Role'}</h2>
                                <p className="text-muted-foreground text-sm mt-0.5">{editingRole ? 'Update the role and its access levels' : 'Define a new role and assign permissions to it.'}</p>
                            </div>
                            <button type="button" onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto flex-1 p-6 space-y-8">
                                {error && <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-500 text-sm">{error}</div>}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 sm:col-span-1 border-primary focus-within:border-primary">
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Role Title</label>
                                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full bg-input border border-border rounded-lg py-2.5 px-4 text-foreground outline-none focus:border-primary transition-colors"
                                            placeholder="e.g. Senior Cashier" />
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Description (Optional)</label>
                                        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                            className="w-full bg-input border border-border rounded-lg py-2.5 px-4 text-foreground outline-none focus:border-primary transition-colors"
                                            placeholder="What does this role do?" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                                        <h3 className="text-base font-bold text-foreground">Module & Action Access</h3>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setForm(f => ({ ...f, permissions: PERMISSION_MODULES.flatMap(m => m.actions.map(a => a.value)) }))} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">Select All</button>
                                            <button type="button" onClick={() => setForm(f => ({ ...f, permissions: [] }))} className="text-xs px-2 py-1 rounded bg-error-500/10 text-error-500 font-medium hover:bg-error-500/20 transition-colors">Clear All</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {PERMISSION_MODULES.map(module => {
                                            const moduleValues = module.actions.map(a => a.value);
                                            const selectedCount = moduleValues.filter(v => form.permissions.includes(v)).length;
                                            const allSelected = selectedCount === moduleValues.length;

                                            return (
                                                <div key={module.module} className={`p-4 rounded-xl border transition-colors ${selectedCount > 0 ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}>
                                                    <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-foreground text-sm">{module.label}</h4>
                                                            {selectedCount > 0 && <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">{selectedCount}/{moduleValues.length}</span>}
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => toggleModule(module.actions)}
                                                            className={`text-[11px] font-semibold transition-colors ${allSelected ? 'text-primary hover:text-success-600' : 'text-muted-foreground hover:text-foreground'}`}
                                                        >
                                                            {allSelected ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {module.actions.map(action => {
                                                            const isEnabled = form.permissions.includes(action.value);
                                                            return (
                                                                <label key={action.value} className="flex items-center gap-3 cursor-pointer group py-0.5">
                                                                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${isEnabled ? 'bg-primary border-primary' : 'bg-background border-border group-hover:border-primary'}`}>
                                                                        {isEnabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                                    </div>
                                                                    <input type="checkbox" className="sr-only" checked={isEnabled} onChange={() => togglePermission(action.value)} />
                                                                    <span className={`text-sm select-none ${isEnabled ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>{action.label}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-border bg-card">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg transition-colors font-medium">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                    {saving ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" /> {editingRole ? 'Update Role' : 'Save Custom Role'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
