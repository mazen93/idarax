import React from 'react';
import { BarcodeGenerator } from './BarcodeGenerator';

export interface BarcodeLabelProps {
    product: any;
    settings: {
        currency: string;
        showPrice: boolean;
        showName: boolean;
        copies: number;
    };
}

export function BarcodeLabelTemplate({ product, settings }: BarcodeLabelProps) {
    // Array of length `copies` to render multiple labels
    const labels = Array.from({ length: settings.copies || 1 });
    
    return (
        <div className="label-print-container flex flex-col items-center w-[50mm]">
            <div className="flex flex-col w-full items-center">
                {labels.map((_, index) => (
                    <div 
                        key={index} 
                        className="sticker-label flex flex-col items-center justify-center p-2 bg-white text-black break-inside-avoid shadow-sm border border-dashed border-gray-300"
                        style={{ 
                            width: '50mm', 
                            height: '25mm',
                            overflow: 'hidden'
                        }}
                    >
                        <div className="w-full flex-1 flex flex-col items-center justify-between">
                            {/* Header: Name and Price */}
                            <div className="w-full flex justify-between items-start px-1 leading-none mb-1">
                                {settings.showName && (
                                    <span className="text-[9px] font-bold uppercase truncate max-w-[70%]">
                                        {product.name}
                                    </span>
                                )}
                                {settings.showPrice && (
                                    <span className="text-[10px] font-black tracking-tighter">
                                        {settings.currency} {parseFloat(product.price).toFixed(2)}
                                    </span>
                                )}
                            </div>
                            
                            {/* Barcode Body */}
                            <div className="w-full flex-1 flex items-center justify-center px-2">
                                <BarcodeGenerator 
                                    value={product.sku || product.id?.substring(0, 8)} 
                                    width="100%" 
                                    height="10mm"
                                    displayValue={true}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .label-print-container, .label-print-container *, .sticker-label, .sticker-label * { 
                        visibility: visible !important; 
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .label-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0;
                        padding: 0;
                        width: 50mm;
                    }
                    .sticker-label {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 50mm;
                        height: 25mm;
                    }
                    .sticker-label:not(:last-child) {
                        page-break-after: always;
                        break-after: page;
                    }
                    /* Remove headers/footers in Chrome/Safari */
                    @page { margin: 0; size: 50mm 25mm; }
                }
            `}</style>
        </div>
    );
}
