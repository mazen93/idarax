import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, User, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customer: any) => void;
    t: (key: string) => string;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSuccess, t }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [addresses, setAddresses] = useState([{ label: 'Home', address: '', isDefault: true }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleAddAddressField = () => {
        setAddresses([...addresses, { label: 'Other', address: '', isDefault: false }]);
    };

    const handleRemoveAddressField = (index: number) => {
        const newAddresses = [...addresses];
        newAddresses.splice(index, 1);
        setAddresses(newAddresses);
    };

    const handleAddressChange = (index: number, field: string, value: any) => {
        const newAddresses = [...addresses];
        newAddresses[index] = { ...newAddresses[index], [field]: value };

        // Ensure only one default
        if (field === 'isDefault' && value === true) {
            newAddresses.forEach((addr, i) => {
                if (i !== index) addr.isDefault = false;
            });
        }

        setAddresses(newAddresses);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const cleanedAddresses = addresses.filter(a => a.address.trim() !== '');
            const payload = {
                name,
                email: email.trim() === '' ? undefined : email.trim(),
                phone: phone.trim() === '' ? undefined : phone.trim(),
                addresses: cleanedAddresses
            };

            const res = await api.post('/crm/customers', payload);
            const newCustomer = res.data.data || res.data;
            onSuccess(newCustomer);
            onClose();
            // Reset state
            setName('');
            setEmail('');
            setPhone('');
            setAddresses([{ label: 'Home', address: '', isDefault: true }]);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add customer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200 custom-scrollbar">
                <div className="sticky top-0 z-10 p-5 border-b border-border flex justify-between items-center bg-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{t('add_customer') || 'Add New Customer'}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted/80 rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                {t('customer_name') || 'Customer Name'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                {t('phone_number') || 'Phone Number'}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1..."
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                {t('email_address') || 'Email Address'}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder={`customer@example.com (${t('optional') || 'optional'})`}
                                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-foreground outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 -mx-2 px-2">
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
                            {addresses.map((addr, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg group animate-in slide-in-from-left-2 duration-200">
                                    <div className="w-full sm:w-32">
                                        <input
                                            placeholder="Label (e.g. Home)"
                                            value={addr.label}
                                            onChange={e => handleAddressChange(idx, 'label', e.target.value)}
                                            className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="w-full sm:flex-1">
                                        <input
                                            placeholder="Address detail"
                                            value={addr.address}
                                            onChange={e => handleAddressChange(idx, 'address', e.target.value)}
                                            className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 px-1">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={addr.isDefault}
                                                onChange={e => handleAddressChange(idx, 'isDefault', e.target.checked)}
                                                className="h-4 w-4 rounded border-border text-success-600 focus:ring-success-500"
                                            />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('default') || 'Default'}</span>
                                        </div>
                                        {addresses.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveAddressField(idx)} className="p-1.5 text-error-500 hover:bg-error-500/10 rounded-md transition-colors ml-2">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-error-500/10 border border-error-500/20 rounded-xl text-error-500 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 mt-6 flex gap-3 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-xl transition-all border border-border"
                        >
                            {t('cancel') || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name || !phone}
                            className="flex-[2] py-3 bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl shadow-lg shadow-success-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                            {loading ? (t('saving') || 'Saving...') : (t('add_customer') || 'Add Customer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
