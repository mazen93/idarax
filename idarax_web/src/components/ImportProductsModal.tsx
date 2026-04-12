import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2, Info, RefreshCw } from 'lucide-react';
import { getHeaders } from '@/utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ImportProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    t: (key: string) => string;
}

export const ImportProductsModal: React.FC<ImportProductsModalProps> = ({ isOpen, onClose, onSuccess, t }) => {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'SKIP_EXISTING' | 'OVERRIDE'>('SKIP_EXISTING');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/import/products?mode=${mode}`, {
                method: 'POST',
                headers: {
                    'Authorization': getHeaders().Authorization,
                },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setResult(data);
                if (data.imported > 0 || data.updated > 0) {
                    onSuccess();
                }
            } else {
                setError(data.message || 'Import failed.');
            }
        } catch (err) {
            setError('An error occurred during upload.');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = [
            'Handle', 'Type', 'Name', 'NameAr', 'SKU', 'Barcode', 'Price', 'CostPrice',
            'Category', 'ModifierRequired', 'ModifierMultiSelect', 'ModifierOptions',
            'IngredientSKU', 'IngredientName', 'Quantity', 'Unit'
        ].join(',');

        const example1 = 'burger-01,PRODUCT,Classic Burger,برجر كلاسيك,BRG-01,123456789,10.00,5.00,Burgers,,,,,,,';
        const example2 = 'burger-01,MODIFIER,Add Cheese,اضافة جبنة,,,,,,false,true,Cheddar:1.5;Swiss:2.0,,,,';
        const example3 = 'meal-01,COMBO,Burger Meal,وجبة برجر,MEAL-01,,15.00,8.00,Combos,,,,,,,';
        const example4 = 'meal-01,COMBO_ITEM,,,,,,,,,,BRG-01,,1,unit';

        const csvContent = "data:text/csv;charset=utf-8," + [headers, example1, example2, example3, example4].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1a1c23] border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-success-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <FileSpreadsheet className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{t('import_products') || 'Import Products'}</h3>
                            <p className="text-white/40 text-xs">Bulk upload via CSV or Excel (XLSX)</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5 text-white/40" />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    {/* Mode Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/30 uppercase tracking-wider px-1">Import Strategy</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setMode('SKIP_EXISTING')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${mode === 'SKIP_EXISTING' ? 'bg-primary/10 border-primary/50 text-primary ring-2 ring-success-500/20' : 'bg-white/5 border-border text-white/40 hover:bg-white/10'}`}
                            >
                                <CheckCircle2 className={`w-5 h-5 ${mode === 'SKIP_EXISTING' ? 'text-primary' : 'text-white/20'}`} />
                                <span className="text-sm font-bold">Skip Existing</span>
                                <span className="text-[10px] opacity-60">Prevent duplicates</span>
                            </button>
                            <button
                                onClick={() => setMode('OVERRIDE')}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${mode === 'OVERRIDE' ? 'bg-warning-500/10 border-warning-500/50 text-warning-400 ring-2 ring-warning-500/20' : 'bg-white/5 border-border text-white/40 hover:bg-white/10'}`}
                            >
                                <RefreshCw className={`w-5 h-5 ${mode === 'OVERRIDE' ? 'text-warning-400' : 'text-white/20'}`} />
                                <span className="text-sm font-bold">Override All</span>
                                <span className="text-[10px] opacity-60">Update current data</span>
                            </button>
                        </div>
                    </div>

                    {/* File Drop Area */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-white/30 uppercase tracking-wider px-1">Select File</label>
                        <label className={`relative group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'}`}>
                            <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileChange} className="hidden" />
                            <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${file ? 'bg-primary/20' : 'bg-white/5'}`}>
                                <Upload className={`w-8 h-8 ${file ? 'text-primary' : 'text-white/20'}`} />
                            </div>
                            <span className="text-sm font-medium text-white/60 mb-1">
                                {file ? file.name : 'Click to select or drag & drop'}
                            </span>
                            <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">
                                CSV, XLSX or XLS (MAX. 5MB)
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={downloadTemplate}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-border rounded-xl text-white/60 text-sm font-medium transition-all"
                    >
                        <Download className="w-4 h-4" /> Download CSV Template
                    </button>

                    {/* Status Messages */}
                    {error && (
                        <div className="flex items-start gap-3 p-4 bg-error-500/10 border border-error-500/20 rounded-xl text-error-400">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="text-sm font-medium">{error}</div>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-3">
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-2">
                                <div className="flex items-center gap-2 text-primary text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> Import Complete
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-primary/10 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-primary">{result.imported}</div>
                                        <div className="text-[10px] text-primary/60 uppercase">New</div>
                                    </div>
                                    <div className="bg-warning-500/10 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-warning-400">{result.updated}</div>
                                        <div className="text-[10px] text-warning-400/60 uppercase">Updated</div>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                        <div className="text-lg font-bold text-white/40">{result.skipped}</div>
                                        <div className="text-[10px] text-white/20 uppercase">Skipped</div>
                                    </div>
                                </div>
                            </div>

                            {result.errors?.length > 0 && (
                                <div className="p-4 bg-error-500/5 border border-error-500/10 rounded-xl max-h-32 overflow-y-auto">
                                    <div className="text-[10px] font-bold text-error-400/60 uppercase mb-2">Warnings / Errors ({result.errors.length})</div>
                                    {Array.isArray(result.errors) && result.errors.map((err: string, i: number) => (
                                        <div key={i} className="text-xs text-error-400/80 mb-1 flex gap-2">
                                            <span>•</span> {err}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-white/[0.01] flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 font-bold rounded-xl transition-all"
                    >
                        Close
                    </button>
                    <button
                        disabled={!file || loading}
                        onClick={handleUpload}
                        className="flex-[2] py-3 bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl shadow-lg shadow-success-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {loading ? 'Processing...' : 'Run Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};
