'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Settings2, Shield, User, Mail, ShieldAlert, CheckCircle2, AlertCircle, Search, Filter, Loader2, UserPlus, Phone, MapPin, Calendar, Clock, Building, Users, Pencil, X, ChefHat, UserCheck, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

import RolesTab from './RolesTab';

type MainTab = 'employees' | 'roles';

export default function StaffPage() {
    const { t, isRTL } = useLanguage();
    const { showAlert, showConfirm } = useModal();
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [mainTab, setMainTab] = useState<MainTab>('employees');
    const [roles, setRoles] = useState<any[]>([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', roleId: '', pinCode: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setStaff(Array.isArray(d) ? d : []);
            }
        } catch { }
        setLoading(false);
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch(`${API_URL}/roles`, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setRoles(Array.isArray(d) ? d : []);
            }
        } catch { }
    };

    useEffect(() => { fetchStaff(); fetchRoles(); }, []);

    const openCreate = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', password: '', roleId: roles[0]?.id || '', pinCode: '' });
        setError('');
        setShowModal(true);
    };

    const openEdit = (user: any) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, password: '', roleId: user.roleId || '', pinCode: user.pinCode || '' });
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload: any = { name: form.name, roleId: form.roleId, pinCode: form.pinCode };
            if (!editingUser) payload.email = form.email;
            if (form.password) payload.password = form.password;

            const res = await fetchWithAuth(
                editingUser ? `/users/${editingUser.id}` : '/users',
                {
                    method: editingUser ? 'PATCH' : 'POST',
                    body: JSON.stringify(payload)
                }
            );
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'An error occurred');
            } else {
                setShowModal(false);
                fetchStaff();
            }
        } catch {
            setError('Network error');
        }
        setSaving(false);
    };

    const toggleStatus = async (user: any) => {
        try {
            const res = await fetchWithAuth(`/users/${user.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !user.isActive })
            });
            if (res.ok) {
                fetchStaff();
                showAlert({ title: t('status_updated'), message: `${user.name} is now ${!user.isActive ? t('active') : t('inactive')}`, variant: 'SUCCESS' });
            }
        } catch {
            showAlert({ title: t('error'), message: 'Failed to update status', variant: 'DANGER' });
        }
    };

    const handleDelete = async (id: string, name: string) => {
        showConfirm({
            title: t('remove_staff_member'),
            message: t('remove_staff_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                await fetchWithAuth(`/users/${id}`, { method: 'DELETE' });
                fetchStaff();
                showAlert({ title: t('removed'), message: t('staff_removed'), variant: 'INFO' });
            }
        });
    };

    const isAdmin = (role: string) => ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role);

    return (
        <div className="text-foreground min-h-full" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('staff_management')}</h1>
                    <p className="text-muted-foreground text-lg">{t('staff_mgmt_subtitle')}</p>
                </div>
                {mainTab === 'employees' && (
                    <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> {t('add_employee')}
                    </button>
                )}
            </div>

            <div className="flex bg-muted p-1 rounded-xl w-fit mb-8 border border-border">
                <button onClick={() => setMainTab('employees')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${mainTab === 'employees' ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>Staff Directory (Updated)</button>
                <button onClick={() => setMainTab('roles')} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${mainTab === 'roles' ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>Roles & Permissions</button>
            </div>

            {mainTab === 'roles' ? (
                <RolesTab t={t} isRTL={isRTL} />
            ) : (
                <>
                {/* Role Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {(Array.isArray(roles) ? roles : []).map(role => {
                    const count = staff.filter(s => s.roleId === role.id).length;
                    return (
                        <div key={role.id} className={`p-4 rounded-xl border flex items-center gap-4 bg-card border-border`}>
                            <div className="p-2.5 rounded-lg border bg-primary/10 border-primary/20 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">{count}</p>
                                <p className="text-sm text-muted-foreground">{role.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Staff Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                        <tr>
                            <th className={`py-4 ${isRTL ? 'pr-6 pl-3' : 'pl-6 pr-3'} text-left text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('employee')}</th>
                             <th className={`px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('role')}</th>
                             <th className={`px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('status')}</th>
                             <th className={`px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : ''}`}>Permissions</th>
                             <th className={`px-3 py-4 text-left text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : ''}`}>{t('joined')}</th>
                            <th className={`py-4 ${isRTL ? 'pl-6 text-left' : 'pr-6 text-right'} text-xs font-semibold uppercase text-muted-foreground`}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-background/50">
                        {loading ? (
                            <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">{t('loading')}</td></tr>
                        ) : staff.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-muted-foreground">{t('no_staff_found') || 'No staff members found'}</p>
                                </td>
                            </tr>
                        ) : (
                                (Array.isArray(staff) ? staff : []).map((user: any) => {
                                    const userRole = roles.find(r => r.id === user.roleId) || { name: user.role || 'Staff' };
                                    const perms: string[] = user.permissions || [];
                                    return (
                                        <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                                            <td className={`py-4 ${isRTL ? 'pr-6 pl-3' : 'pl-6 pr-3'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground font-bold text-sm">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-bold border text-primary border-primary/20 bg-primary/10">
                                                    <Shield className="h-3.5 w-3.5" />
                                                    {userRole.name}
                                                </span>
                                            </td>
                                             <td className="px-3 py-4">
                                                 {user.isActive !== false ? (
                                                     <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border text-primary border-primary/20 bg-primary/10">
                                                         <CheckCircle2 className="h-3 w-3" />
                                                         {t('active')}
                                                     </span>
                                                 ) : (
                                                     <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold border text-error-500 border-error-500/20 bg-error-500/10">
                                                         <AlertCircle className="h-3 w-3" />
                                                         {t('inactive')}
                                                     </span>
                                                 )}
                                             </td>
                                         <td className="px-3 py-4">
                                            {isAdmin(user.role) ? (
                                                <span className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                                                    <Shield className="h-3.5 w-3.5" /> Full Access
                                                </span>
                                            ) : perms.length === 0 ? (
                                                <span className="text-xs text-muted-foreground">No permissions</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {perms.slice(0, 3).map(p => (
                                                        <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">{p}</span>
                                                    ))}
                                                    {perms.length > 3 && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground border border-border font-medium">+{perms.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                         <td className={`py-4 ${isRTL ? 'pl-6 text-left' : 'pr-6 text-right'} ${isRTL ? 'space-x-reverse' : ''}`}>
                                             <div className="flex items-center justify-end gap-3 px-2">
                                                 {/* Status Toggle Button - Premium Switch Design */}
                                                 <button 
                                                     onClick={() => toggleStatus(user)} 
                                                     title={user.isActive !== false ? t('deactivate_staff') : t('activate_staff')} 
                                                     className={`group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-warning-500/20 shadow-inner ${user.isActive !== false ? 'bg-warning-500 shadow-warning-900/40' : 'bg-muted-foreground shadow-black/40'}`}
                                                 >
                                                     <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out ${isRTL ? (user.isActive !== false ? '-translate-x-6' : '-translate-x-1') : (user.isActive !== false ? 'translate-x-6' : 'translate-x-1')}`} />
                                                 </button>

                                                 <div className="flex flex-col gap-1.5">
                                                     <button 
                                                         onClick={() => openEdit(user)} 
                                                         className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary transition-all active:scale-95 group shadow-sm backdrop-blur-sm"
                                                     >
                                                         <Pencil className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                                         <span className="text-[11px] font-bold uppercase tracking-wider">{t('edit') || 'Edit'}</span>
                                                     </button>

                                                     <button 
                                                         onClick={() => handleDelete(user.id, user.name)} 
                                                         className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-500/10 hover:bg-error-500/20 border border-error-500/20 hover:border-error-500/40 text-error-500 transition-all active:scale-95 group shadow-sm backdrop-blur-sm"
                                                     >
                                                         <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                                         <span className="text-[11px] font-bold uppercase tracking-wider">{t('remove') || 'Remove'}</span>
                                                     </button>
                                                 </div>
                                             </div>
                                         </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">{editingUser ? t('edit_employee') : t('add_new_employee')}</h2>
                                <p className="text-muted-foreground text-sm mt-0.5">{editingUser ? `${t('editing')} ${editingUser.name}` : t('create_employee_desc')}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Details */}
                        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
                            <div className="overflow-y-auto flex-1 p-6">
                                <div className="space-y-4">
                                        {error && (
                                            <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-500 text-sm">{error}</div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('full_name')}</label>
                                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary transition-colors ${isRTL ? 'pr-4 pl-4' : 'px-4'}`}
                                                placeholder="e.g. Ahmed Hassan" />
                                        </div>

                                        {!editingUser && (
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">{t('email_address')}</label>
                                                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                                    className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary transition-colors ${isRTL ? 'text-right pr-4' : 'px-4'}`}
                                                    dir="ltr"
                                                    placeholder="employee@store.com" />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                                {editingUser ? t('new_password_help') : t('password')}
                                            </label>
                                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                                required={!editingUser}
                                                className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary transition-colors ${isRTL ? 'pr-4 text-right' : 'px-4'}`}
                                                dir="ltr"
                                                placeholder={editingUser ? t('leave_blank_keep') : t('min_chars')} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">{t('terminal_pin') || 'Terminal PIN (4-6 digits)'}</label>
                                            <input
                                                type="text"
                                                maxLength={6}
                                                value={form.pinCode}
                                                onChange={e => setForm({ ...form, pinCode: e.target.value.replace(/\D/g, '') })}
                                                className={`w-full bg-input border border-border rounded-lg py-2.5 text-foreground outline-none focus:border-primary transition-colors ${isRTL ? 'text-right pr-4' : 'px-4'}`}
                                                placeholder="1234" />
                                            <p className="text-[10px] text-muted-foreground mt-1">Used for quick terminal switching.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">{t('access_role')}</label>
                                            <div className="space-y-2">
                                                {roles.length === 0 && (
                                                    <p className="text-sm text-warning-500 font-medium p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg">No custom roles created. Please create one from the Roles & Permissions tab.</p>
                                                )}
                                                {(Array.isArray(roles) ? roles : []).map(role => (
                                                    <label key={role.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.roleId === role.id ? `bg-primary/10 border-primary text-primary` : 'border-border hover:border-border/80 bg-background'}`}>
                                                        <input type="radio" name="roleId" value={role.id} checked={form.roleId === role.id} onChange={e => setForm({ ...form, roleId: e.target.value })} className="sr-only" />
                                                        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                                            <Shield className="h-4 w-4" />
                                                        </div>
                                                        <span className={`font-medium text-sm ${form.roleId === role.id ? '' : 'text-foreground'}`}>{role.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-lg transition-colors font-medium">
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors disabled:opacity-60">
                                        {saving ? t('saving') : editingUser ? t('update_employee') : t('create_employee')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                </>
            )}
        </div>
    );
}
