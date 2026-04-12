'use client';

import React, { useState } from 'react';
import { X, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

interface POSPreOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (date: Date | null, note?: string) => void;
    currentScheduledAt: Date | null;
    currentNote?: string;
    settings: any;
    t: any;
}

export default function POSPreOrderModal({
    onClose,
    onSave,
    currentScheduledAt,
    currentNote,
    settings,
    t
}: POSPreOrderModalProps) {
    const maxDays = settings?.preOrderMaxDaysAhead || 7;
    
    // Default to tomorrow at 12:00 PM if nothing scheduled
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(12, 0, 0, 0);

    const [selectedDate, setSelectedDate] = useState(
        currentScheduledAt ? new Date(currentScheduledAt).toISOString().split('T')[0] : defaultDate.toISOString().split('T')[0]
    );
    const [selectedTime, setSelectedTime] = useState(
        currentScheduledAt ? new Date(currentScheduledAt).toTimeString().slice(0, 5) : '12:00'
    );
    const [note, setNote] = useState(currentNote || '');

    const minDate = new Date().toISOString().split('T')[0];
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + maxDays);
    const maxDate = maxDateObj.toISOString().split('T')[0];

    const handleSave = () => {
        const scheduledDate = new Date(`${selectedDate}T${selectedTime}`);
        if (scheduledDate < new Date()) {
            alert(t('error_past_date') || 'Cannot schedule an order in the past.');
            return;
        }
        onSave(scheduledDate, note);
    };

    const handleClear = () => {
        onSave(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/20">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-foreground uppercase tracking-widest leading-none">
                                {t('schedule_order') || 'Schedule Order'}
                            </h2>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-wider opacity-60">
                                Pre-Order Setup
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                            {t('pickup_delivery_date') || 'Select Date'}
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-foreground transition-colors" />
                            <input 
                                type="date"
                                min={minDate}
                                max={maxDate}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full h-14 bg-muted/20 border border-border rounded-2xl pl-12 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/40 transition-all appearance-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                            {t('requested_time') || 'Select Time'}
                        </label>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-foreground transition-colors" />
                            <input 
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full h-14 bg-muted/20 border border-border rounded-2xl pl-12 pr-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/40 transition-all appearance-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                            {t('preparation_notes') || 'Preparation Instructions'}
                        </label>
                        <div className="relative group">
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={t('pre_order_note_placeholder') || 'e.g. Add extra sauce, call upon arrival...'}
                                className="w-full min-h-[100px] bg-muted/20 border border-border rounded-2xl p-4 text-xs font-medium text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/40 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {!currentScheduledAt && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <p className="text-[10px] leading-relaxed text-muted-foreground italic">
                                    {t('pre_order_info_msg') || `This order will be held in the kitchen until ${settings?.preOrderLeadMinutes || 30} minutes before the scheduled time.`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                    {t('payment_required_notice') || 'Payment confirms your schedule'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 flex gap-3">
                    {currentScheduledAt && (
                        <button 
                            onClick={handleClear}
                            className="flex-1 h-14 bg-muted/30 hover:bg-error-500/10 text-muted-foreground hover:text-error-500 border border-border rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            {t('clear_schedule') || 'Clear'}
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {t('confirm_schedule') || 'Confirm Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}
