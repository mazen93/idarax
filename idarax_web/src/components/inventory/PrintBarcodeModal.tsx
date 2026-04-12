import React, { useState, useEffect } from 'react';
import { X, Printer, Package, Settings, Info } from 'lucide-react';
import { printBarcodeLabel } from '@/utils/printUtils';

interface PrintBarcodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    currency: string;
}

export function PrintBarcodeModal({ isOpen, onClose, product, currency }: PrintBarcodeModalProps) {
    const [copies, setCopies] = useState<number>(1);
    const [showPrice, setShowPrice] = useState<boolean>(true);
    const [showName, setShowName] = useState<boolean>(true);
    const [isPrinting, setIsPrinting] = useState<boolean>(false);

    // Load saved preferences if any
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('idarax_print_barcode_prefs');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setShowPrice(parsed.showPrice ?? true);
                    setShowName(parsed.showName ?? true);
                } catch(e) {}
            }
        }
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const handlePrint = async () => {
        setIsPrinting(true);
        // Save preferences
        localStorage.setItem('idarax_print_barcode_prefs', JSON.stringify({ showPrice, showName }));
        
        // Settings obj
        const settings = {
            currency,
            showPrice,
            showName,
            copies
        };

        try {
            await printBarcodeLabel(product, settings);
        } catch(e) {
            console.error('Print failed', e);
        }
        
        setIsPrinting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 text-primary p-2 rounded-lg">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Print Labels</h2>
                            <p className="text-xs text-muted-foreground">{product.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white hover:bg-muted rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Number of Copies</label>
                        <div className="flex items-center">
                           <button onClick={() => setCopies(Math.max(1, copies - 1))} className="bg-muted px-4 py-2 border border-border rounded-l-lg text-white hover:bg-muted-foreground h-10 w-12">-</button>
                           <input 
                               type="number" 
                               value={copies} 
                               onChange={(e) => setCopies(parseInt(e.target.value) || 1)} 
                               min="1" 
                               max="500"
                               className="bg-background border-y border-border text-center text-white h-10 w-20 outline-none focus:border-primary font-bold" 
                           />
                           <button onClick={() => setCopies(copies + 1)} className="bg-muted px-4 py-2 border border-border rounded-r-lg text-white hover:bg-muted-foreground h-10 w-12">+</button>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                           <Settings className="w-4 h-4 text-primary" /> Label Layout Settings
                        </div>
                        
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Show Product Name</span>
                                <span className="text-xs text-muted-foreground">Print name above barcode</span>
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showName ? 'bg-primary' : 'bg-muted-foreground'}`}>
                                <input type="checkbox" className="sr-only" checked={showName} onChange={() => setShowName(!showName)} />
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showName ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </label>
                        
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">Show Retail Price</span>
                                <span className="text-xs text-muted-foreground">Print price beside name</span>
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showPrice ? 'bg-primary' : 'bg-muted-foreground'}`}>
                                <input type="checkbox" className="sr-only" checked={showPrice} onChange={() => setShowPrice(!showPrice)} />
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showPrice ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </label>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex gap-3 text-xs text-primary-200 mt-2">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                        <p>Labels will be generated for standard thermal sticker sizes (e.g., 50x25mm). Ensure your printer margin is set to "None" in the print dialog.</p>
                    </div>
                </div>

                <div className="flex gap-3 p-4 border-t border-border bg-muted/10">
                    <button onClick={onClose} className="flex-1 py-2.5 px-4 font-medium text-muted-foreground hover:text-white hover:bg-muted rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handlePrint} disabled={isPrinting} className="flex-1 py-2.5 px-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2">
                        {isPrinting ? 'Preparing...' : <><Printer className="w-4 h-4" /> Print Labels</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
