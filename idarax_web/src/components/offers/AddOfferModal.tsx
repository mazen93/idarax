'use client';

import { useState } from 'react';
import { X, Calendar, DollarSign, Percent, Tag, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface AddOfferModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddOfferModal({ onClose, onSuccess }: AddOfferModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'PERCENTAGE', // PERCENTAGE or FIXED_AMOUNT
        value: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        validFrom: '',
        validUntil: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const payload = {
                code: formData.code.toUpperCase(),
                description: formData.description,
                type: formData.type,
                value: Number(formData.value),
                minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
                maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
                validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
                validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
            };

            await api.post('/offers', payload);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create offer.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-card/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Create New Offer</h2>
                            <p className="text-sm text-muted-foreground">Set up a promotional code or discount rule</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-error-50 text-error-600 rounded-xl text-sm font-medium border border-error-100 flex items-start">
                            <X className="w-5 h-5 mr-2 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form id="addOfferForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* Section: Basic Info */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Offer Code <span className="text-error-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Tag className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. SUMMER20"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all uppercase placeholder:normal-case font-semibold"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Customers will enter this code at checkout.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (Internal)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Summer promotional campaign"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Discount Value */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Discount Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Discount Type</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'PERCENTAGE' })}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center space-x-2 transition-all ${formData.type === 'PERCENTAGE' ? 'bg-white text-primary-700 shadow-sm' : 'text-muted-foreground hover:text-slate-700'}`}
                                        >
                                            <Percent className="w-4 h-4" />
                                            <span>Percentage</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'FIXED_AMOUNT' })}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg flex justify-center items-center space-x-2 transition-all ${formData.type === 'FIXED_AMOUNT' ? 'bg-white text-success-700 shadow-sm' : 'text-muted-foreground hover:text-slate-700'}`}
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            <span>Fixed Amount</span>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Discount Value <span className="text-error-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {formData.type === 'PERCENTAGE' ? (
                                                <Percent className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step={formData.type === 'PERCENTAGE' ? "1" : "0.01"}
                                            max={formData.type === 'PERCENTAGE' ? "100" : undefined}
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            placeholder={formData.type === 'PERCENTAGE' ? "20" : "15.00"}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all font-semibold"
                                        />
                                    </div>
                                </div>

                                {formData.type === 'PERCENTAGE' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Maximum Discount Cap (Optional)</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.maxDiscountAmount}
                                                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                                placeholder="e.g. 50.00"
                                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-600 transition-all"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Prevents 20% off from discounting too much on large orders.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section: Restrictions */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Restrictions & Validity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Order Amount (Opt)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-600 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Valid From (Opt)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={formData.validFrom}
                                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-600 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Valid Until (Opt)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={formData.validUntil}
                                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-600 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="addOfferForm"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin mr-2"></span>
                        ) : (
                            <Check className="w-5 h-5 mr-2" />
                        )}
                        <span>Save Offer</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
