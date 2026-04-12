'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChefHat, Plus, Trash2, Pencil, Search, Layers, Scale, History, X, Check, Package, Loader2, Info, ArrowRight } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function RecipesPage() {
    const { t } = useLanguage();
    const { showAlert, showConfirm, showPrompt } = useModal();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [recipeItems, setRecipeItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [ingredientSearch, setIngredientSearch] = useState('');

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/retail/products`, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                setProducts(result.data || (Array.isArray(result) ? result : []));
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecipe = useCallback(async (productId: string) => {
        try {
            const res = await fetch(`${API_URL}/restaurant/recipes/product/${productId}`, { headers: getHeaders() });
            if (res.ok) {
                const result = await res.json();
                setRecipeItems(result.data || (Array.isArray(result) ? result : []));
            }
        } catch (err) {
            console.error('Failed to fetch recipe', err);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        if (selectedProduct) {
            fetchRecipe(selectedProduct.id);
        } else {
            setRecipeItems([]);
        }
    }, [selectedProduct, fetchRecipe]);

    const addIngredient = async (ingredient: any) => {
        if (!selectedProduct) return;

        // Check if already in recipe
        if (recipeItems.some(item => item.ingredientId === ingredient.id)) {
            showAlert({ title: t('already_added'), message: t('ingredient_already_added'), variant: 'WARNING' });
            return;
        }

        showPrompt({
            title: t('ingredient_qty'),
            message: `${t('enter_qty_for')} ${ingredient.name}:`,
            defaultValue: '1',
            placeholder: 'e.g. 500',
            onConfirmText: (quantity) => {
                showPrompt({
                    title: t('ingredient_unit'),
                    message: `${t('enter_unit_for')} ${ingredient.name} (e.g., g, ml, unit):`,
                    defaultValue: 'unit',
                    placeholder: 'unit',
                    onConfirmText: async (unit) => {
                        setSaving(true);
                        try {
                            const res = await fetch(`${API_URL}/restaurant/recipes`, {
                                method: 'POST',
                                headers: getHeaders(),
                                body: JSON.stringify({
                                    parentId: selectedProduct.id,
                                    ingredientId: ingredient.id,
                                    quantity: parseFloat(quantity),
                                    unit: unit || 'unit'
                                })
                            });

                            if (res.ok) {
                                fetchRecipe(selectedProduct.id);
                                setShowAddModal(false);
                                setIngredientSearch('');
                                showAlert({ title: t('success'), message: t('recipe_success'), variant: 'SUCCESS' });
                            } else {
                                const err = await res.json();
                                showAlert({ title: t('error'), message: err.message || t('operation_failed'), variant: 'DANGER' });
                            }
                        } catch (err) {
                            showAlert({ title: t('error'), message: t('operation_failed'), variant: 'DANGER' });
                        } finally {
                            setSaving(false);
                        }
                    }
                });
            }
        });
    };

    const removeIngredient = async (id: string) => {
        showConfirm({
            title: t('remove_ingredient_title'),
            message: t('remove_ingredient_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                try {
                    const res = await fetch(`${API_URL}/restaurant/recipes/${id}`, {
                        method: 'DELETE',
                        headers: getHeaders()
                    });

                    if (res.ok) {
                        setRecipeItems(items => items.filter(item => item.id !== id));
                        showAlert({ title: t('removed'), message: t('ingredient_removed'), variant: 'INFO' });
                    }
                } catch (err) {
                    showAlert({ title: t('error'), message: t('operation_failed'), variant: 'DANGER' });
                }
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const availableIngredients = products.filter(p =>
        p.id !== selectedProduct?.id &&
        p.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 antialiased text-slate-200">
            {/* Product List Sidebar */}
            <div className="w-80 flex flex-col bg-card/50 border border-border rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-4 border-b border-border bg-card/80">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {t('catalog')}
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('search_products')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                        </div>
                    ) : filteredProducts.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedProduct(p)}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${selectedProduct?.id === p.id
                                ? 'bg-primary/20 border border-primary/30 text-white'
                                : 'hover:bg-muted/50 border border-transparent text-muted-foreground'
                                }`}
                        >
                            <div className="font-medium text-sm truncate">{p.name}</div>
                            <div className="text-xs opacity-50 flex justify-between mt-1">
                                <span>{p.sku || t('no_SKU')}</span>
                                <span>${parseFloat(p.price).toFixed(2)}</span>
                            </div>
                        </button>
                    ))}
                    {!loading && filteredProducts.length === 0 && (
                        <div className="text-center py-10 text-slate-600 text-sm">{t('no_products_found')}</div>
                    )}
                </div>
            </div>

            {/* Recipe Detail View */}
            <div className="flex-1 bg-card/50 border border-border rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm">
                {!selectedProduct ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-10">
                        <ChefHat className="h-16 w-16 mb-4 opacity-10" />
                        <p className="text-lg font-medium">{t('select_product_recipe')}</p>
                        <p className="text-sm mt-2 max-w-xs text-center">{t('recipe_desc')}</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-border bg-card/80 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {selectedProduct.name}
                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-slate-700">
                                        {t('recipe_component')}
                                    </span>
                                </h2>
                                <p className="text-muted-foreground text-sm mt-1">{t('recipe_desc')}</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
                            >
                                <Plus className="h-4 w-4" />
                                Add Ingredient
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {(!Array.isArray(recipeItems) || recipeItems.length === 0) ? (
                                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-10 bg-background/20">
                                    <Info className="h-10 w-10 text-slate-700 mb-4" />
                                    <p className="text-muted-foreground font-medium">{t('no_ingredients_defined')}</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="mt-4 text-primary hover:text-primary-300 text-sm font-semibold underline underline-offset-4"
                                    >
                                        {t('setup_recipe_ingredients')}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {recipeItems.map(item => (
                                        <div key={item.id} className="group bg-background/40 border border-border/50 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary font-bold border border-slate-700 group-hover:bg-primary/10 transition-colors">
                                                    {item.ingredient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{item.ingredient.name}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                                        <span className="font-mono">{item.ingredient.sku || t('no_SKU')}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-primary">{item.quantity} <span className="text-muted-foreground font-normal uppercase text-[10px] tracking-wider ml-1">{item.unit}</span></div>
                                                    <div className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">{t('qty_per_unit')}</div>
                                                </div>

                                                <button
                                                    onClick={() => removeIngredient(item.id)}
                                                    className="p-2.5 rounded-xl text-slate-600 hover:text-error-400 hover:bg-error-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-2xl grid grid-cols-2 gap-4">
                                        <div className="flex gap-4 items-start border-r border-primary/10 pr-4">
                                            <div className="p-2 bg-primary/20 rounded-lg">
                                                <ChefHat className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white mb-1">{t('stock_impact')}</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {t('stock_impact_desc').replace('this product', selectedProduct.name)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center pl-2">
                                            <div className="text-[10px] text-primary uppercase tracking-widest font-bold mb-1">{t('total_prod_cost')}</div>
                                            <div className="text-3xl font-black text-white">
                                                ${(Array.isArray(recipeItems) ? recipeItems.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.ingredient?.costPrice || '0')), 0) : 0).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                {t('profit_margin')}:
                                                <span className="text-primary font-bold">
                                                    {(() => {
                                                        const cost = recipeItems.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.ingredient.costPrice || '0')), 0);
                                                        const price = parseFloat(selectedProduct.price);
                                                        if (price === 0) return '0%';
                                                        return (((price - cost) / price) * 100).toFixed(1) + '%';
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Add Ingredient Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/40 animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-card/80">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" />
                                {t('add_ingredient')}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder={t('search_ingredients')}
                                    value={ingredientSearch}
                                    onChange={(e) => setIngredientSearch(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                                {availableIngredients.length === 0 ? (
                                    <div className="text-center py-10 text-slate-600 text-sm">No other products found</div>
                                ) : availableIngredients.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => addIngredient(p)}
                                        disabled={saving}
                                        className="w-full text-left p-3 flex items-center justify-between rounded-xl hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all group"
                                    >
                                        <div>
                                            <div className="font-medium text-sm text-slate-200 group-hover:text-primary-300 transition-colors">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">{p.sku || 'No SKU'}</div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-background/30 border-t border-border flex justify-end">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
        </div>
    );
}
