'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { Tag, Printer, Plus, Minus, X, Info } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useLanguage } from '@/components/LanguageContext';
import { useModal } from '@/components/ModalContext';

interface LabelItem {
    product: any;
    quantity: number;
}

export default function BarcodeLabelsPage() {
    const { t, isRTL, formatCurrency } = useLanguage();
    const { showAlert } = useModal();
    
    const [products, setProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [labelItems, setLabelItems] = useState<LabelItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Label settings
    const [labelWidth, setLabelWidth] = useState('50'); // mm
    const [labelHeight, setLabelHeight] = useState('30'); // mm
    const [barcodeMode, setBarcodeMode] = useState<'SKU'|'BARCODE'>('SKU');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetchWithAuth('/retail/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
                }
            } catch (err) {
                console.error("Failed to fetch products:", err);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const handleAddProduct = (product: any) => {
        const exists = labelItems.find(item => item.product.id === product.id);
        if (exists) {
            setLabelItems(labelItems.map(item => 
                item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setLabelItems([...labelItems, { product, quantity: 1 }]);
        }
        setSearchQuery('');
    };

    const updateQuantity = (productId: string, delta: number) => {
        setLabelItems(labelItems.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (productId: string) => {
        setLabelItems(labelItems.filter(item => item.product.id !== productId));
    };

    const handlePrint = () => {
        if (labelItems.length === 0) {
            showAlert({ title: "No Items", message: "Please add products to print labels for.", variant: 'WARNING' });
            return;
        }

        // Needs a slight timeout to render barcodes if not already rendered
        setTimeout(() => {
            const jsb = (window as any).JsBarcode;
            if (jsb) {
                try {
                    jsb(".barcode-svg").init();
                    window.print();
                } catch (e) {
                    console.error("JsBarcode error:", e);
                    window.print();
                }
            } else {
                window.print();
            }
        }, 100);
    };

    // Render barcodes whenever labelItems change
    useEffect(() => {
        const jsb = (window as any).JsBarcode;
        if (jsb && labelItems.length > 0) {
            try {
                jsb(".barcode-svg").init();
            } catch (e) {
                console.warn("JsBarcode init warning; might have invalid SKU data", e);
            }
        }
    }, [labelItems, barcodeMode]);

    const filteredProducts = products.filter(p => {
        if (!searchQuery) return false;
        return (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    }).slice(0, 5); // Limit suggestions

    const totalLabels = labelItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className={`p-6 max-w-6xl mx-auto space-y-6 text-slate-200 ${isRTL ? 'text-right' : 'text-left'} print-hide`}>
            {/* Load JsBarcode script */}
            <Script 
                src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js" 
                strategy="lazyOnload" 
                onLoad={() => console.log('JsBarcode loaded')}
            />

            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0; }
                    body { background: white; margin: 0; padding: 0; }
                    .print-hide { display: none !important; }
                    .print-show { display: block !important; }
                    .label-page { 
                        display: flex;
                        flex-wrap: wrap;
                        align-content: flex-start;
                        width: 100%;
                        background: white;
                    }
                    .label-item {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        box-sizing: border-box;
                        page-break-inside: avoid;
                        overflow: hidden;
                        padding: 2mm;
                        color: black !important;
                        text-align: center;
                    }
                    .label-item-name {
                        font-weight: bold;
                        font-family: sans-serif;
                        font-size: 8pt;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-width: 100%;
                        margin-bottom: 1mm;
                    }
                    .label-item-price {
                        font-weight: bold;
                        font-family: sans-serif;
                        font-size: 9pt;
                        margin-top: 1mm;
                    }
                    .label-item svg {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                }
            `}} />

            <div className="flex justify-between items-center print-hide">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Tag className="h-8 w-8 text-primary" />
                        Barcode Labels
                    </h1>
                    <p className="text-muted-foreground mt-1">Generate and print price tags and scannable barcodes.</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                >
                    <Printer className="h-5 w-5" /> Print {totalLabels > 0 ? `(${totalLabels} Labels)` : ''}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-hide">
                <div className="lg:col-span-2 space-y-6">
                    {/* Search & Add */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl relative">
                        <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-2 block">Search Product to Add</label>
                        <input 
                            type="text" 
                            placeholder="Type product name or SKU..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary"
                        />
                        
                        {searchQuery && (
                            <div className="absolute left-6 right-6 top-[85px] z-50 bg-muted border border-border rounded-xl shadow-2xl overflow-hidden">
                                {filteredProducts.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground">No products found.</div>
                                ) : (
                                    filteredProducts.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => handleAddProduct(p)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-border/50 last:border-0 flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-bold text-white">{p.name}</div>
                                                <div className="text-xs text-muted-foreground">{p.sku || 'No SKU'}</div>
                                            </div>
                                            <Tag className="h-4 w-4 text-primary" />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pending Print Queue */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                        <h3 className="font-bold text-white mb-4">Labels Queue</h3>
                        {labelItems.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                <Tag className="h-8 w-8 mx-auto mb-3 opacity-30" />
                                <p>Search and select products to add them to the queue.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {labelItems.map((item, index) => {
                                    const codeValue = barcodeMode === 'SKU' ? item.product.sku : item.product.barcode;
                                    const hasValidCode = !!codeValue;
                                    
                                    return (
                                        <div key={`${item.product.id}-${index}`} className="flex items-center justify-between bg-background border border-border rounded-xl p-3">
                                            <div className="flex-1">
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {item.product.name}
                                                    {!hasValidCode && <span className="text-[10px] bg-error-500/10 text-error-400 px-2 py-0.5 rounded-full">Missing {barcodeMode}</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{formatCurrency(item.product.price)}</div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
                                                    <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 hover:bg-white/10 rounded-md transition-colors"><Minus className="h-4 w-4" /></button>
                                                    <span className="w-10 text-center font-bold text-sm text-white">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 hover:bg-white/10 rounded-md transition-colors"><Plus className="h-4 w-4" /></button>
                                                </div>
                                                <button onClick={() => removeItem(item.product.id)} className="p-2 hover:bg-error-500/10 text-muted-foreground hover:text-error-400 rounded-lg transition-colors">
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Print Settings Sidebar */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                        <h3 className="font-bold text-white mb-4">Print Settings</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-1">Barcode Value Source</label>
                                <div className="flex bg-background border border-border rounded-lg overflow-hidden">
                                    {['SKU', 'BARCODE'].map(mode => (
                                        <button 
                                            key={mode} 
                                            onClick={() => setBarcodeMode(mode as any)}
                                            className={`flex-1 py-2 text-xs font-bold transition-colors ${barcodeMode === mode ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-white/5'}`}
                                        >
                                            Use {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-1">Width (mm)</label>
                                    <input type="number" value={labelWidth} onChange={e => setLabelWidth(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mb-1">Height (mm)</label>
                                    <input type="number" value={labelHeight} onChange={e => setLabelHeight(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white outline-none focus:border-primary" />
                                </div>
                            </div>

                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary/80 flex gap-2 items-start mt-4">
                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                <p>Ensure your physical printer (e.g., Dymo, Zebra) matches these dimensions in the print dialog properties.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔥 HIDDEN PRINT VIEW: Only visible during window.print() 🔥 */}
            <div className="hidden print-show label-page">
                {labelItems.map((item) => {
                    const elements = [];
                    const valueToEncode = barcodeMode === 'SKU' ? item.product.sku : item.product.barcode;
                    
                    for (let i = 0; i < item.quantity; i++) {
                        elements.push(
                            <div 
                                key={`print-${item.product.id}-${i}`} 
                                className="label-item"
                                style={{ width: `${labelWidth}mm`, height: `${labelHeight}mm`, display: 'inline-flex' }}
                            >
                                <div className="label-item-name">{item.product.name}</div>
                                {valueToEncode ? (
                                    <svg 
                                        className="barcode-svg"
                                        /* Uses jsbarcode declarative syntax */
                                        jsbarcode-value={valueToEncode}
                                        jsbarcode-format="CODE128"
                                        jsbarcode-width="1.5"
                                        jsbarcode-height="30"
                                        jsbarcode-margin="0"
                                        jsbarcode-displayvalue="true"
                                        jsbarcode-fontsize="12"
                                        jsbarcode-background="transparent"
                                        jsbarcode-linecolor="#000"
                                    ></svg>
                                ) : (
                                    <div style={{ fontSize: '8pt', color: 'gray', padding: '10px' }}>NO {barcodeMode}</div>
                                )}
                                <div className="label-item-price">{formatCurrency(item.product.price)}</div>
                            </div>
                        );
                    }
                    return elements;
                })}
            </div>

        </div>
    );
}
