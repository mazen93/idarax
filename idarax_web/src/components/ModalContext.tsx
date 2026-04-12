'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

type ModalType = 'ALERT' | 'CONFIRM' | 'PROMPT';
type ModalVariant = 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';

interface ModalOptions {
    title?: string;
    message: string;
    variant?: ModalVariant;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    defaultValue?: string;
    placeholder?: string;
    onConfirmText?: (text: string) => void;
}

interface ModalContextType {
    showAlert: (options: ModalOptions) => void;
    showConfirm: (options: ModalOptions) => void;
    showPrompt: (options: ModalOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<ModalType>('ALERT');
    const [options, setOptions] = useState<ModalOptions | null>(null);
    const [promptValue, setPromptValue] = useState('');

    const showAlert = useCallback((opts: ModalOptions) => {
        setType('ALERT');
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const showConfirm = useCallback((opts: ModalOptions) => {
        setType('CONFIRM');
        setOptions(opts);
        setIsOpen(true);
    }, []);

    const showPrompt = useCallback((opts: ModalOptions) => {
        setType('PROMPT');
        setOptions(opts);
        setPromptValue(opts.defaultValue || '');
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        if (options?.onCancel) options.onCancel();
    }, [options]);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        if (type === 'PROMPT') {
            if (options?.onConfirmText) options.onConfirmText(promptValue);
        } else {
            if (options?.onConfirm) options.onConfirm();
        }
    }, [options, type, promptValue]);

    const renderIcon = () => {
        const variant = options?.variant || 'INFO';
        const size = 32;
        switch (variant) {
            case 'SUCCESS': return <CheckCircle2 size={size} className="text-primary" />;
            case 'WARNING': return <AlertCircle size={size} className="text-warning-500" />;
            case 'DANGER': return <XCircle size={size} className="text-error-500" />;
            default: return <Info size={size} className="text-primary-500" />;
        }
    };

    const getConfirmButtonStyle = () => {
        const variant = options?.variant || 'INFO';
        switch (variant) {
            case 'SUCCESS': return 'bg-primary hover:bg-primary shadow-success-500/20';
            case 'WARNING': return 'bg-warning-600 hover:bg-warning-500 shadow-warning-500/20';
            case 'DANGER': return 'bg-error-600 hover:bg-error-500 shadow-error-500/20';
            default: return 'bg-primary-600 hover:bg-primary-500 shadow-primary-500/20';
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
            {children}
            {isOpen && options && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-card/90 border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`h-1 w-full ${options.variant === 'DANGER' ? 'bg-error-500' :
                            options.variant === 'WARNING' ? 'bg-warning-500' :
                                options.variant === 'SUCCESS' ? 'bg-primary' : 'bg-primary-500'
                            }`} />

                        <div className="p-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-3 bg-background/50 rounded-2xl border border-border">
                                    {renderIcon()}
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                        {options.title || (type === 'ALERT' ? 'Notice' : type === 'CONFIRM' ? 'Confirm Action' : 'Input Required')}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
                                        {options.message}
                                    </p>
                                </div>
                            </div>

                            {type === 'PROMPT' && (
                                <div className="mt-6">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={promptValue}
                                        placeholder={options.placeholder}
                                        onChange={(e) => setPromptValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleConfirm();
                                            if (e.key === 'Escape') handleClose();
                                        }}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            )}

                            <div className="mt-8 flex flex-col gap-2">
                                <button
                                    onClick={handleConfirm}
                                    className={`w-full py-3 px-4 rounded-xl text-white text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${getConfirmButtonStyle()}`}
                                >
                                    {options.confirmText || (type === 'ALERT' ? 'Understand' : 'Confirm')}
                                </button>

                                {(type === 'CONFIRM' || type === 'PROMPT') && (
                                    <button
                                        onClick={handleClose}
                                        className="w-full py-3 px-4 bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white rounded-xl text-xs font-bold transition-all"
                                    >
                                        {options.cancelText || 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
}
