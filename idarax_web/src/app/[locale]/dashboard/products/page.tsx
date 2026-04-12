'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Layers, MoreVertical, X, Tag, Pencil, Trash2, Check, GitBranch, ToggleLeft, ToggleRight, RefreshCw, AlertCircle } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useModal } from '@/components/ModalContext';
import { useLanguage } from '@/components/LanguageContext';
import { ImportProductsModal } from '@/components/ImportProductsModal';
import { PrintBarcodeModal } from '@/components/inventory/PrintBarcodeModal';
import { Download, Printer } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function ProductsPage() {

    const { t, language, isRTL } = useLanguage();
    const { showAlert, showConfirm } = useModal();
    const [tab, setTab] = useState<'products' | 'categories' | 'branch'>('products');
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [stations, setStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    console.log("DEBUG: ProductsPage Rendering - Loading State:", loading);
    console.log("DEBUG: Stations Count:", stations ? stations.length : 'null');

    // Product form
    const [activeFormType, setActiveFormType] = useState<'product' | 'combo' | 'category' | null>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productForm, setProductForm] = useState({ name: '', nameAr: '', price: '', costPrice: '', description: '', descriptionAr: '', sku: '', categoryId: '', isSellable: true, productType: 'STANDARD', defaultStationId: '', unit: 'unit', imageUrl: '' });
    const [variants, setVariants] = useState<{ name: string, price: string, costPrice: string, sku: string }[]>([]);

    // Recipe Components (ingredients added to a product)
    const [recipeComponents, setRecipeComponents] = useState<{ ingredientId: string, variantId?: string | null, quantity: number, unit: string, name: string, ingredientUnit: string, costPrice: number }[]>([]);
    const [searchComponentQuery, setSearchComponentQuery] = useState('');

    // Category form
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [inlineCatEdit, setInlineCatEdit] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryForm, setCategoryForm] = useState({ name: '', nameAr: '', description: '', descriptionAr: '', defaultStationId: '', imageUrl: '' });

    // Action menu
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    // Branch Settings
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [branchProducts, setBranchProducts] = useState<any[]>([]);
    const [branchLoading, setBranchLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [productModifiers, setProductModifiers] = useState<any[]>([]);
    const [modifierFormOpen, setModifierFormOpen] = useState(false);
    const [editingModifierGroup, setEditingModifierGroup] = useState<any>(null);
    const [modifierGroupForm, setModifierGroupForm] = useState({ name: '', required: false, multiSelect: false });

    // Option Modal State
    const [optionFormOpen, setOptionFormOpen] = useState(false);
    const [optionFormGroupId, setOptionFormGroupId] = useState<string | null>(null);
    const [optionForm, setOptionForm] = useState({ name: '', priceAdjust: '' });
    const [importModalOpen, setImportModalOpen] = useState(false);
    
    // Print Barcode State
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [printingProduct, setPrintingProduct] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes, sRes, bRes] = await Promise.all([
                fetchWithAuth('/retail/products'),
                fetchWithAuth('/retail/categories'),
                fetchWithAuth('/restaurant/kds/stations'),
                fetchWithAuth('/branches'),
            ]);

            if (pRes.ok) {
                const result = await pRes.json();
                const d = result.data !== undefined ? result.data : result;
                setItems(Array.isArray(d) ? d : []);
            }
            if (cRes.ok) {
                const result = await cRes.json();
                const d = result.data !== undefined ? result.data : result;
                setCategories(Array.isArray(d) ? d : []);
            }
            if (sRes.ok) {
                const result = await sRes.json();
                const d = result.data !== undefined ? result.data : result;
                setStations(Array.isArray(d) ? d : []);
            }
            if (bRes.ok) {
                const result = await bRes.json();
                const d = result.data !== undefined ? result.data : result;
                const branchData = Array.isArray(d) ? d : [];
                setBranches(branchData);
                if (branchData.length > 0) {
                    setSelectedBranchId(prev => prev || branchData[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchBranchProducts = useCallback(async (branchId: string) => {
        if (!branchId) return;
        setBranchLoading(true);
        try {
            const res = await fetchWithAuth(`/retail/products/branch/${branchId}`);
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setBranchProducts(Array.isArray(d) ? d : []);
            }
        } catch { }
        setBranchLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        if (tab === 'branch' && selectedBranchId) {
            fetchBranchProducts(selectedBranchId);
        }
    }, [tab, selectedBranchId, fetchBranchProducts]);

    useEffect(() => {
        const handleError = (e: any) => {
            console.error("DEBUG: UI Crash detected:", e);
            if (e.message) showAlert({ title: "Debug Error", message: "UI Crash: " + e.message, variant: 'DANGER' });
        };
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, [showAlert]);

    const handleBranchToggle = async (productId: string, currentlyAvailable: boolean, priceOverride: number | null) => {
        setSavingId(productId);
        try {
            await fetchWithAuth(`/retail/products/branch/${selectedBranchId}/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ isAvailable: !currentlyAvailable, priceOverride }),
            });
            setBranchProducts(prev => Array.isArray(prev) ? prev.map(p =>
                p.productId === productId ? { ...p, isAvailable: !currentlyAvailable } : p
            ) : []);
        } catch { }
        setSavingId(null);
    };

    const handlePriceOverride = async (productId: string, isAvailable: boolean, newPrice: string) => {
        const price = newPrice === '' ? null : parseFloat(newPrice);
        setSavingId(productId);
        try {
            await fetchWithAuth(`/retail/products/branch/${selectedBranchId}/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ isAvailable, priceOverride: price }),
            });
            setBranchProducts(prev => Array.isArray(prev) ? prev.map(p =>
                p.productId === productId ? { ...p, priceOverride: price } : p
            ) : []);
        } catch { }
        setSavingId(null);
    };

    const handleResetOverride = async (productId: string) => {
        setSavingId(productId);
        try {
            await fetchWithAuth(`/retail/products/branch/${selectedBranchId}/${productId}`, {
                method: 'DELETE'
            });
            setBranchProducts(prev => Array.isArray(prev) ? prev.map(p =>
                p.productId === productId ? { ...p, isAvailable: true, priceOverride: null } : p
            ) : []);
        } catch { }
        setSavingId(null);
    };

    // --- Product CRUD ---
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...productForm,
                price: parseFloat(productForm.price),
                costPrice: parseFloat(productForm.costPrice || '0'),
                variants: Array.isArray(variants) ? variants.map(v => ({ ...v, price: parseFloat(v.price), costPrice: parseFloat(v.costPrice || '0') })) : [],
                categoryId: productForm.categoryId || ''
            };

            if (Array.isArray(recipeComponents) && recipeComponents.length > 0) {
                (payload as any).recipeComponents = recipeComponents.map(rc => ({ 
                    ingredientId: rc.ingredientId, 
                    quantity: Number(rc.quantity), 
                    unit: rc.unit || rc.ingredientUnit || 'unit'
                }));
            }

            if (Array.isArray(productModifiers) && productModifiers.length > 0 && !editingProduct) {
                (payload as any).modifiers = Array.isArray(productModifiers) ? productModifiers.map(m => ({
                    name: m.name,
                    required: m.required,
                    multiSelect: m.multiSelect,
                    options: Array.isArray(m.options) ? m.options.map((o: any) => ({ name: o.name, priceAdjust: o.priceAdjust })) : []
                })) : [];
            }

            if (activeFormType === 'combo') {
                payload.productType = 'COMBO';
            }

            if (editingProduct) {
                const res = await fetchWithAuth(`/retail/products/${editingProduct.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
                if (!res.ok) throw new Error(`Failed to update product: ${res.status} ${await res.text()}`);
            } else {
                const res = await fetchWithAuth(`/retail/products`, { method: 'POST', body: JSON.stringify(payload) });
                if (!res.ok) throw new Error(`Failed to create product: ${res.status} ${await res.text()}`);
            }
            setActiveFormType(null);
            setEditingProduct(null);
            setProductForm({ name: '', nameAr: '', price: '', costPrice: '', description: '', descriptionAr: '', sku: '', categoryId: '', isSellable: true, productType: 'STANDARD', defaultStationId: '', unit: 'unit', imageUrl: '' });
            setVariants([]);
            setRecipeComponents([]);
            setProductModifiers([]);
            fetchData();
        } catch (err) {
            console.error("DEBUG: Save Product failed:", err);
            showAlert({ title: "Error", message: "Failed to save product. Please try again.", variant: 'DANGER' });
        }
    };

    const handleExportProducts = async () => {
        try {
            const res = await fetchWithAuth(`/import/export/products`);
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export error:', err);
            showAlert({ title: "Error", message: "Failed to export products.", variant: 'DANGER' });
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const item = items?.find(i => i.id === id);
        showConfirm({
            title: t('delete_product_title'),
            message: t('delete_product_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                const res = await fetchWithAuth(`/retail/products/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setOpenMenu(null);
                    fetchData();
                    showAlert({ title: t('saved'), message: t('delete'), variant: 'INFO' });
                } else {
                    showAlert({ title: t('delete'), message: t('operation_failed'), variant: 'DANGER' });
                }
            }
        });
    };

    const openEditProduct = (product: any) => {
        try {
            console.log("Editing product:", product);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Fallback for custom scroll containers
        const scrollTarget = document.querySelector('main') || document.querySelector('.overflow-y-auto');
        if (scrollTarget) scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });

        setActiveFormType(product.productType === 'COMBO' ? 'combo' : 'product');
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            nameAr: product.nameAr || '',
            price: product.price ? String(product.price) : '0.00',
            costPrice: product.costPrice ? String(product.costPrice) : '0.00',
            description: product.description || '',
            descriptionAr: product.descriptionAr || '',
            sku: product.sku || '',
            categoryId: product.categoryId || '',
            isSellable: product.isSellable ?? true,
            productType: product.productType || 'STANDARD',
            defaultStationId: product.defaultStationId || '',
            unit: product.unit || 'unit',
            imageUrl: product.imageUrl || ''
        });
        setVariants(Array.isArray(product?.variants) ? product.variants.map((v: any) => ({ name: v.name, price: String(v.price), costPrice: String(v.costPrice || '0'), sku: v.sku || '' })) : []);

        const mappedRecipe = Array.isArray(product?.recipeComponents) ? product.recipeComponents.map((rc: any) => ({
            ingredientId: rc.ingredientId,
            variantId: rc.variantId,
            quantity: Number(rc.quantity),
            unit: rc.unit || rc.ingredient?.unit || 'unit',
            ingredientUnit: rc.ingredient?.unit || 'unit',
            name: rc.ingredient?.name || 'Unknown',
            costPrice: Number(rc.ingredient?.costPrice || 0),
        })) : [];
        setRecipeComponents(mappedRecipe);
        fetchModifiers(product.id);
        } catch (err) {
            console.error("Error opening product for edit:", err);
            showAlert({ title: "Error", message: "Failed to open product edit form. Check console for details.", variant: 'DANGER' });
        }
    };

    const fetchModifiers = async (productId: string) => {
        try {
            const res = await fetchWithAuth(`/retail/products/${productId}/modifiers`);
            if (res.ok) {
                const result = await res.json();
                const d = result.data !== undefined ? result.data : result;
                setProductModifiers(Array.isArray(d) ? d : []);
            }
        } catch { }
    };

    const handleSaveModifierGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) {
            // Creation mode: update local state
            if (editingModifierGroup) {
                setProductModifiers(prev => (Array.isArray(prev) ? prev : []).map(m => m.id === editingModifierGroup.id ? { ...m, ...modifierGroupForm } : m));
            } else {
                setProductModifiers(prev => [...prev, { ...modifierGroupForm, id: `local-${Date.now()}`, options: [] }]);
            }
            setModifierFormOpen(false);
            setEditingModifierGroup(null);
            setModifierGroupForm({ name: '', required: false, multiSelect: false });
            return;
        }

        const endpoint = editingModifierGroup
            ? `/retail/products/${editingProduct.id}/modifiers/groups/${editingModifierGroup.id}`
            : `/retail/products/${editingProduct.id}/modifiers/groups`;
        const method = editingModifierGroup ? 'PATCH' : 'POST';

        const res = await fetchWithAuth(endpoint, {
            method,
            body: JSON.stringify(modifierGroupForm)
        });
        if (res.ok) {
            setModifierFormOpen(false);
            setEditingModifierGroup(null);
            setModifierGroupForm({ name: '', required: false, multiSelect: false });
            fetchModifiers(editingProduct.id);
        }
    };

    const handleDeleteModifierGroup = async (groupId: string) => {
        const group = productModifiers.find(m => m.id === groupId);
        showConfirm({
            title: t('delete_modifier_group'),
            message: t('delete_modifier_group_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                if (!editingProduct) {
                    setProductModifiers(prev => prev.filter(m => m.id !== groupId));
                } else {
                    const res = await fetchWithAuth(`/retail/products/${editingProduct.id}/modifiers/groups/${groupId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) fetchModifiers(editingProduct.id);
                }
            }
        });
    };

    const handleAddModifierOption = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!optionFormGroupId || !optionForm.name) return;

        if (!editingProduct) {
            setProductModifiers(prev => Array.isArray(prev) ? prev.map(m => {
                if (m.id === optionFormGroupId) {
                    return { ...m, options: [...(m.options || []), { id: `local-opt-${Date.now()}`, name: optionForm.name, priceAdjust: parseFloat(optionForm.priceAdjust || '0') }] };
                }
                return m;
            }) : []);
            setOptionFormOpen(false);
            setOptionFormGroupId(null);
            setOptionForm({ name: '', priceAdjust: '' });
            return;
        }

        const res = await fetchWithAuth(`/retail/products/${editingProduct.id}/modifiers/groups/${optionFormGroupId}/options`, {
            method: 'POST',
            body: JSON.stringify({ name: optionForm.name, priceAdjust: parseFloat(optionForm.priceAdjust || '0') })
        });
        if (res.ok) {
            setOptionFormOpen(false);
            setOptionFormGroupId(null);
            setOptionForm({ name: '', priceAdjust: '' });
            fetchModifiers(editingProduct.id);
        }
    };

    const handleDeleteModifierOption = async (groupId: string, optionId: string) => {
        const group = productModifiers.find(m => m.id === groupId);
        const option = group?.options?.find((o: any) => o.id === optionId);

        showConfirm({
            title: t('remove_option'),
            message: t('remove_option_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                if (!editingProduct) {
                    setProductModifiers(prev => Array.isArray(prev) ? prev.map(m => {
                        if (m.id === groupId) {
                            return { ...m, options: m.options?.filter((o: any) => o.id !== optionId) };
                        }
                        return m;
                    }) : []);
                } else {
                    const res = await fetchWithAuth(`/retail/products/${editingProduct.id}/modifiers/groups/${groupId}/options/${optionId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) fetchModifiers(editingProduct.id);
                }
            }
        });
    };

    // --- Category CRUD ---
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchWithAuth(`/retail/categories`, { method: 'POST', body: JSON.stringify(categoryForm) });
        setCategoryForm({ name: '', nameAr: '', description: '', descriptionAr: '', defaultStationId: '', imageUrl: '' });
        setActiveFormType(null);
        fetchData();
    };

    const handleUpdateCategory = async (id: string, payload: any) => {
        await fetchWithAuth(`/retail/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setEditingCategory(null);
        fetchData();
    };

    const handleDeleteCategory = async (id: string) => {
        const cat = categories.find(c => c.id === id);
        showConfirm({
            title: t('delete_category'),
            message: t('delete_category_msg'),
            variant: 'DANGER',
            onConfirm: async () => {
                const res = await fetchWithAuth(`/retail/categories/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    fetchData();
                    showAlert({ title: t('saved'), message: t('delete'), variant: 'INFO' });
                } else {
                    showAlert({ title: t('delete'), message: t('operation_failed'), variant: 'DANGER' });
                }
            }
        });
    };

    const addVariant = () => setVariants([...variants, { name: '', price: '0.00', costPrice: '0.00', sku: '' }]);
    const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
    const updateVariant = (i: number, field: string, val: string) => {
        const v = [...variants]; v[i] = { ...v[i], [field]: val }; setVariants(v);
    };

    const recalculateRecipeTotals = (components: any[]) => {
        // Calculate total cost for ALL product types with ingredients
        let totalCost = 0;
        let totalPrice = 0;
        const isCombo = productForm.productType === 'COMBO' || activeFormType === 'combo';

        components.forEach(rc => {
            const matchedItem = items?.find(i => i.id === rc.ingredientId);
            if (matchedItem) {
                if (rc.variantId) {
                    const variant = matchedItem.variants?.find((v: any) => v.id === rc.variantId);
                    if (variant) {
                        totalCost += parseFloat(variant.costPrice || '0') * rc.quantity;
                        totalPrice += parseFloat(variant.price || '0') * rc.quantity;
                    }
                } else {
                    totalCost += parseFloat(matchedItem.costPrice || '0') * rc.quantity;
                    if (isCombo) totalPrice += parseFloat(matchedItem.price || '0') * rc.quantity;
                }
            }
        });

        setProductForm(prev => ({
            ...prev,
            costPrice: (isNaN(totalCost) ? 0 : totalCost).toFixed(2),
            ...(isCombo && { price: (isNaN(totalPrice) ? 0 : totalPrice).toFixed(2) })
        }));
    };

    const handleAddComboIngredient = (filteredItem: any, variant?: any) => {
        if (!recipeComponents.find(rc => (variant ? rc.variantId === variant.id : rc.ingredientId === filteredItem.id && !rc.variantId))) {
            const ingredientUnit = filteredItem.unit || 'unit';
            const newComps = [
                ...recipeComponents,
                {
                    ingredientId: filteredItem.id,
                    variantId: variant?.id || null,
                    name: variant ? `${filteredItem.name} (${variant.name})` : filteredItem.name,
                    quantity: 1,
                    unit: ingredientUnit,
                    ingredientUnit,
                    costPrice: parseFloat(filteredItem.costPrice || '0'),
                }
            ];
            setRecipeComponents(newComps);
            recalculateRecipeTotals(newComps);
        }
        setSearchComponentQuery('');
    };

    const handleUpdateComboQty = (index: number, newQty: number) => {
        const updated = [...recipeComponents];
        updated[index].quantity = newQty;
        setRecipeComponents(updated);
        recalculateRecipeTotals(updated);
    };

    const handleUpdateIngredientUnit = (index: number, newUnit: string) => {
        const updated = [...recipeComponents];
        updated[index].unit = newUnit;
        setRecipeComponents(updated);
    };

    const handleRemoveComboIngredient = (index: number) => {
        const updated = recipeComponents.filter((_, idx) => idx !== index);
        setRecipeComponents(updated);
        recalculateRecipeTotals(updated);
    };

    return (
        <div className="text-foreground" onClick={() => openMenu && setOpenMenu(null)} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex justify-between items-end mb-8 flex-wrap gap-4 ${isRTL ? 'text-right' : ''}`}>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('catalog_management')}</h1>
                    <p className="text-muted-foreground text-lg">{t('catalog_subtitle')}</p>
                </div>
                <div className={`flex items-center gap-3`}>
                    {tab === 'products' ? (
                        <>
                            <button onClick={() => { setActiveFormType('product'); setEditingProduct(null); setProductForm({ name: '', nameAr: '', price: '0', costPrice: '', description: '', descriptionAr: '', sku: '', categoryId: '', isSellable: true, productType: 'STANDARD', defaultStationId: '', unit: 'unit', imageUrl: '' }); setVariants([]); setRecipeComponents([]); }}
                                className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                                <Plus className="h-4 w-4" /> {t('new_product')}
                            </button>
                            <button onClick={() => { setActiveFormType('combo'); setEditingProduct(null); setProductForm({ name: '', nameAr: '', price: '0.00', costPrice: '0.00', description: '', descriptionAr: '', sku: '', categoryId: '', isSellable: true, productType: 'COMBO', defaultStationId: '', unit: 'unit', imageUrl: '' }); setVariants([]); setRecipeComponents([]); }}
                                className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                                <Layers className="h-4 w-4" /> {t('new_combo')}
                            </button>
                            <button onClick={() => setImportModalOpen(true)}
                                className="flex items-center gap-2 bg-muted hover:bg-muted-foreground text-slate-300 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm border border-border">
                                <Download className="h-4 w-4" /> {t('import') || 'Import'}
                            </button>
                            <button onClick={handleExportProducts}
                                className="flex items-center gap-2 bg-muted hover:bg-muted-foreground text-slate-300 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm border border-border">
                                <Download className="h-4 w-4 rotate-180" /> {t('export') || 'Export'}
                            </button>
                        </>
                    ) : tab === 'categories' ? (
                        <button onClick={() => { setActiveFormType('category'); setEditingCategory(null); setCategoryForm({ name: '', nameAr: '', description: '', descriptionAr: '', defaultStationId: '', imageUrl: '' }); }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                            <Plus className="h-4 w-4" /> {t('new_category')}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border pb-px">
                {[
                    { id: 'products', label: t('catalog'), Icon: Package },
                    { id: 'categories', label: t('categories'), Icon: Layers },
                    { id: 'branch', label: t('settings'), Icon: GitBranch },
                ].map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => { setTab(id as any); setActiveFormType(null); }} className={`px-4 py-2.5 font-medium text-sm rounded-t-lg flex items-center gap-2 border-b-2 transition-colors ${tab === id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-slate-300 hover:bg-muted/50'}`}>
                        <Icon className="h-4 w-4" />{label}
                    </button>
                ))}
            </div>

            {/* Standard Product Form */}
            {activeFormType === 'product' && tab === 'products' && (
                <div className="mb-8 p-6 bg-card border border-border rounded-xl border-t-4 border-t-success-500">
                    <h3 className="text-lg font-semibold text-white mb-4">{editingProduct ? `${t('editing_product')}: ${editingProduct.name}` : t('add_new_product')}</h3>
                    <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('name_en')}</label>
                                <input required placeholder="Product Name (EN)" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                            </div>
                            <div className="space-y-1" dir="rtl">
                                <label className="text-xs text-muted-foreground mr-1">{t('name_ar')}</label>
                                <input placeholder="الاسم (عربي)" value={productForm.nameAr} onChange={e => setProductForm({ ...productForm, nameAr: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary text-right font-arabic" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('sku')}</label>
                                <input placeholder="SKU" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('sell_price')}</label>
                                <input required type="number" step="0.01" placeholder="Sell Price" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('cost_price')}</label>
                                <input required type="number" step="0.01" placeholder="Cost Price" value={productForm.costPrice} onChange={e => setProductForm({ ...productForm, costPrice: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('category')}</label>
                                <select required value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                    <option value="" disabled>Select Category...</option>
                                    {(() => {
                                        const list = Array.isArray(categories) ? categories : [];
                                        return list.filter(c => c && c.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>);
                                    })()}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('product_type')}</label>
                                <select value={productForm.productType} onChange={e => setProductForm({ ...productForm, productType: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                    <option value="STANDARD">Standard Product</option>
                                    <option value="RAW_MATERIAL">Raw Material / Ingredient</option>
                                </select>
                            </div>

                            {/* Unit Picker — only shown for raw materials */}
                            {productForm.productType === 'RAW_MATERIAL' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-muted-foreground ml-1">📦 Unit (Cost is per this unit)</label>
                                    <select value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                        <option value="unit">unit (each)</option>
                                        <option value="kg">kg (kilogram)</option>
                                        <option value="g">g (gram)</option>
                                        <option value="L">L (litre)</option>
                                        <option value="mL">mL (millilitre)</option>
                                        <option value="slice">slice</option>
                                        <option value="piece">piece</option>
                                        <option value="portion">portion</option>
                                    </select>
                                    <p className="text-xs text-slate-600 ml-1 mt-0.5">e.g. if cost = 20 and unit = kg, then 0.25 kg used in a recipe costs 5.00</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground ml-1">{t('kds_station')}</label>
                                <select value={productForm.defaultStationId} onChange={e => setProductForm({ ...productForm, defaultStationId: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                    <option value="">No Default Station</option>
                                    {(() => {
                                        const list = Array.isArray(stations) ? stations : [];
                                        if (list.length === 0) return <option disabled value="">No stations found (check Settings &gt; KDS)</option>;
                                        return list.filter(s => s && s.id).map((s: any) => <option key={s.id} value={s.id}>{s.name} KDS</option>);
                                    })()}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-2 mt-5 col-span-2">
                                <input type="checkbox" id="isSellableProduct" checked={productForm.isSellable} onChange={e => setProductForm({ ...productForm, isSellable: e.target.checked })} className="w-4 h-4 accent-success-500" />
                                <label htmlFor="isSellableProduct" className="text-sm text-slate-300 cursor-pointer">{t('show_in_pos')}</label>
                            </div>

                            <textarea placeholder={`${t('description')} (EN)`} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={2} className="col-span-1 bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary resize-none ltr-text" />
                            <textarea placeholder={`${t('description_ar')}`} value={productForm.descriptionAr} onChange={e => setProductForm({ ...productForm, descriptionAr: e.target.value })} rows={2} dir="rtl" className="col-span-1 bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary resize-none text-right font-arabic" />
                            <div className="space-y-1 col-span-2">
                                <label className="text-xs text-muted-foreground ml-1">Product Image URL</label>
                                <input placeholder="https://example.com/image.jpg" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                            </div>
                        </div>

                        {productForm.productType === 'STANDARD' && (
                            <>
                                <div className="border-t border-border pt-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-warning-500" />
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('product_variations')}</h4>
                                        </div>
                                        <button type="button" onClick={addVariant} className="text-xs bg-muted hover:bg-muted-foreground text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                                            <Plus className="h-3 w-3" /> {t('add_size_flavor')}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(() => {
                                            const list = Array.isArray(variants) ? variants : [];
                                            if (list.length === 0) return <p className={`text-xs text-slate-600 italic ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('no_variants_defined')}</p>;
                                            return list.map((v, i) => (
                                                <div key={i} className="flex gap-3 items-center bg-background/50 p-2 rounded-lg border border-border/50">
                                                    <input required placeholder="Name (e.g. Large)" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white flex-1 outline-none focus:border-warning-500" />
                                                    <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2">
                                                        <span className="text-muted-foreground text-[10px] uppercase font-bold">{t('price')}</span>
                                                        <input required type="number" step="0.01" placeholder="Price" value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)} className="bg-transparent border-none py-1.5 text-sm text-white w-20 outline-none" />
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2">
                                                        <span className="text-muted-foreground text-[10px] uppercase font-bold">{t('cost')}</span>
                                                        <input required type="number" step="0.01" placeholder="Cost" value={v.costPrice} onChange={e => updateVariant(i, 'costPrice', e.target.value)} className="bg-transparent border-none py-1.5 text-sm text-white w-20 outline-none" />
                                                    </div>
                                                    <input placeholder={t('sku_override')} value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white w-24 outline-none focus:border-warning-500" />
                                                    <button type="button" onClick={() => removeVariant(i)} className="text-muted-foreground hover:text-error-400 p-1.5 transition-colors"><X className="h-5 w-5" /></button>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>

                                {/* Recipe / Ingredients Section for Standard Products */}
                                <div className="border-t border-border pt-5 mt-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-primary" />
                                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('materials_ingredients')}</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {(() => {
                                            const list = Array.isArray(recipeComponents) ? recipeComponents : [];
                                            if (list.length === 0) return <p className={`text-xs text-slate-600 italic ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('no_materials_linked')}</p>;
                                            return list.map((rc, i) => {
                                                const costContrib = (rc.costPrice || 0) * rc.quantity;
                                                return (
                                                    <div key={i} className="flex flex-wrap gap-2 items-center bg-background/50 p-2 rounded-lg border border-border/50">
                                                        <span className={`flex-1 min-w-[100px] text-sm text-slate-300 ${isRTL ? 'pr-2' : 'pl-2'}`}>{rc.name}</span>
                                                        {/* Quantity input */}
                                                        <div className="flex items-center gap-1 bg-background border border-border rounded-md px-2">
                                                            <span className="text-muted-foreground text-[10px] uppercase font-bold">{t('qty')}</span>
                                                            <input type="number" min="0.001" step="0.001" value={rc.quantity} onChange={e => handleUpdateComboQty(i, Number(e.target.value))} className="bg-transparent border-none py-1 text-sm text-white w-20 text-center outline-none" />
                                                        </div>
                                                        {/* Unit selector */}
                                                        <select value={rc.unit || rc.ingredientUnit || 'unit'} onChange={e => handleUpdateIngredientUnit(i, e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-xs text-primary-300 outline-none appearance-none focus:border-primary">
                                                            {['unit','kg','g','L','mL','slice','piece','portion'].map(u => <option key={u} value={u}>{u}</option>)}
                                                        </select>
                                                        {/* Cost contribution chip */}
                                                        <span className="text-[11px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md whitespace-nowrap">
                                                            = {costContrib.toFixed(2)} EGP
                                                        </span>
                                                        <button type="button" onClick={() => handleRemoveComboIngredient(i)} className="text-muted-foreground hover:text-error-400 p-1.5 transition-colors"><X className="h-4 w-4" /></button>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <div className="relative">
                                        <Plus className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                                        <input type="text" placeholder={t('search')} value={searchComponentQuery} onChange={e => setSearchComponentQuery(e.target.value)} className={`w-full bg-background/50 border border-border rounded-lg py-2 text-sm text-white outline-none focus:border-primary ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`} />
                                        {searchComponentQuery && (
                                            <div className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-muted border border-slate-700 rounded-lg shadow-xl z-20">
                                                {(() => {
                                                    const list = Array.isArray(items) ? items : [];
                                                    const filtered = list.filter(item => item && item.id !== editingProduct?.id && item.productType !== 'COMBO' && (item.name?.toLowerCase() || '').includes(searchComponentQuery.toLowerCase()));
                                                    return filtered.map(filteredItem => (
                                                        <button key={filteredItem.id} type="button" onClick={() => handleAddComboIngredient(filteredItem)} className={`w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-muted-foreground transition-colors ${isRTL ? 'text-right' : 'text-left'}`}>
                                                            <span>{filteredItem.name}</span>
                                                            <span className="text-muted-foreground">{Number(filteredItem.costPrice || 0).toFixed(2)}/{filteredItem.unit || 'unit'}</span>
                                                        </button>
                                                    ));
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-4 mt-5">
                                    <div className="flex items-center gap-2">
                                        <Plus className="h-4 w-4 text-primary" />
                                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('addons_modifiers')}</h4>
                                    </div>
                                    <button type="button" onClick={() => { setModifierFormOpen(true); setEditingModifierGroup(null); setModifierGroupForm({ name: '', required: false, multiSelect: false }); }} className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors border border-success-600/20">
                                        <Plus className="h-3 w-3" /> {t('new_modifier_group')}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {(() => {
                                        const list = Array.isArray(productModifiers) ? productModifiers : [];
                                        if (list.length === 0) {
                                            return <div className="text-center py-6 bg-background/20 rounded-xl border border-dashed border-border text-muted-foreground text-sm">{t('no_modifiers_yet')}</div>;
                                        }
                                        return list.filter(g => g && g.id).map((group) => (
                                            <div key={group.id} className="bg-background/30 border border-border rounded-xl p-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-foreground">{group.name}</span>
                                                            {group.required && <span className="text-[10px] bg-error-500/10 text-error-500 px-2 py-0.5 rounded-full uppercase font-bold">Required</span>}
                                                            {group.multiSelect && <span className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full uppercase font-bold">Multi</span>}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1">{group.options?.length || 0} {t('options_available')}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button type="button" onClick={() => { setEditingModifierGroup(group); setModifierGroupForm({ name: group.name, required: group.required, multiSelect: group.multiSelect }); setModifierFormOpen(true); }} className="p-1.5 text-muted-foreground hover:text-white hover:bg-muted rounded-md transition-all"><Pencil className="h-4 w-4" /></button>
                                                        <button type="button" onClick={() => handleDeleteModifierGroup(group.id)} className="p-1.5 text-muted-foreground hover:text-error-400 hover:bg-error-500/10 rounded-md transition-all"><Trash2 className="h-4 w-4" /></button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {(() => {
                                                        const options = Array.isArray(group.options) ? group.options : [];
                                                        return options.filter((o: any) => o && o.id).map((opt: any) => (
                                                            <div key={opt.id} className="group flex items-center justify-between bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm">
                                                                <span className="text-slate-300">{opt.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    {parseFloat(opt.priceAdjust) > 0 && <span className="text-primary text-xs font-mono">+${parseFloat(opt.priceAdjust).toFixed(2)}</span>}
                                                                    <button type="button" onClick={() => handleDeleteModifierOption(group.id, opt.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-error-400 transition-all"><X className="h-3 w-3" /></button>
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                    <button type="button" onClick={() => { setOptionFormGroupId(group.id); setOptionForm({ name: '', priceAdjust: '' }); setOptionFormOpen(true); }} className="flex items-center justify-center gap-1.5 border border-dashed border-slate-700 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-slate-300 hover:border-slate-500 transition-all bg-muted/5">
                                                        <Plus className="h-3.5 w-3.5" /> {t('add_option')}
                                                    </button>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
                            <button type="button" onClick={() => { setActiveFormType(null); setEditingProduct(null); }} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">{t('cancel')}</button>
                            <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors">
                                {t('save')}
                            </button>
                        </div>
                    </form>

                    {/* Modifier Group Modal */}
                    {modifierFormOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                            <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-border">
                                    <h3 className="text-lg font-bold text-white">{editingModifierGroup ? 'Edit Modifier Group' : 'New Modifier Group'}</h3>
                                    <p className="text-muted-foreground text-xs mt-1">Groups help categorize add-ons like "Extras" or "Crust Type".</p>
                                </div>
                                <form onSubmit={handleSaveModifierGroup} className="p-6 space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Group Name</label>
                                        <input required placeholder="e.g. Extra Toppings" value={modifierGroupForm.name} onChange={e => setModifierGroupForm({ ...modifierGroupForm, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all font-medium" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button type="button" onClick={() => setModifierGroupForm({ ...modifierGroupForm, required: !modifierGroupForm.required })} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${modifierGroupForm.required ? 'bg-error-500/10 border-error-500/50 text-error-500' : 'bg-background border-border text-muted-foreground'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${modifierGroupForm.required ? 'border-error-500 bg-error-500' : 'border-slate-700'}`}>
                                                {modifierGroupForm.required && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <span className="text-sm font-bold">Required</span>
                                        </button>
                                        <button type="button" onClick={() => setModifierGroupForm({ ...modifierGroupForm, multiSelect: !modifierGroupForm.multiSelect })} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${modifierGroupForm.multiSelect ? 'bg-primary-500/10 border-primary-500/50 text-primary-400' : 'bg-background border-border text-muted-foreground'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${modifierGroupForm.multiSelect ? 'border-primary-500 bg-primary-500' : 'border-slate-700'}`}>
                                                {modifierGroupForm.multiSelect && <Check className="h-3 w-3 text-white" />}
                                            </div>
                                            <span className="text-sm font-bold">Multi-select</span>
                                        </button>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setModifierFormOpen(false)} className="flex-1 px-4 py-3 text-muted-foreground hover:text-white transition-colors font-medium">Cancel</button>
                                        <button type="submit" className="flex-1 bg-primary hover:bg-primary text-white rounded-xl py-3 font-bold shadow-lg shadow-success-600/20 transition-all">
                                            {editingModifierGroup ? 'Update' : 'Create Group'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modifier Option Modal */}
                    {optionFormOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                            <div className="bg-card border border-border rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                                <div className="p-6 border-b border-border">
                                    <h3 className="text-lg font-bold text-white">Add Option</h3>
                                    <p className="text-muted-foreground text-xs mt-1">Add a specific choice to this modifier group.</p>
                                </div>
                                <form onSubmit={handleAddModifierOption} className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Option Name</label>
                                        <input autoFocus required placeholder="e.g. Extra Cheese" value={optionForm.name} onChange={e => setOptionForm({ ...optionForm, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary transition-all font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Additional Price (POS)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                                            <input type="number" step="0.01" placeholder="0.00" value={optionForm.priceAdjust} onChange={e => setOptionForm({ ...optionForm, priceAdjust: e.target.value })} className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-3 text-white outline-none focus:border-primary transition-all font-mono" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="button" onClick={() => setOptionFormOpen(false)} className="flex-1 px-4 py-3 text-muted-foreground hover:text-white transition-colors font-medium">Cancel</button>
                                        <button type="submit" className="flex-1 bg-primary hover:bg-primary text-white rounded-xl py-3 font-bold shadow-lg shadow-primary-600/20 transition-all">
                                            Save Option
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )
            }

            {/* Combo Product Form */}
            {
                activeFormType === 'combo' && tab === 'products' && (
                    <div className="mb-8 p-6 bg-card border border-border rounded-xl border-t-4 border-t-primary-500">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" /> {editingProduct ? `Editing Combo: ${editingProduct.name}` : 'Create New Combo'}
                        </h3>
                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input required placeholder="Combo Name (e.g. Burger Meal)" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                                <input placeholder="SKU" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-primary/80 ml-1 font-medium text-warning-400">Sell Price (Auto-calculated, Editable)</label>
                                    <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="bg-background border border-warning-500/50 rounded-lg px-4 py-2 text-warning-200 outline-none focus:border-warning-400 font-bold transition-colors" />
                                </div>

                                <div className="flex flex-col gap-1 relative">
                                    <label className="text-xs text-muted-foreground ml-1 font-medium">Calculated Cost (Auto)</label>
                                    <input disabled type="number" step="0.01" value={productForm.costPrice} className="bg-card border border-slate-700/50 rounded-lg px-4 py-2 text-muted-foreground outline-none cursor-not-allowed" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-primary/80 ml-1 font-medium">{t('category')}</label>
                                    <select required value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                        <option value="" disabled>Select Category...</option>
                                        {(() => {
                                            const list = Array.isArray(categories) ? categories : [];
                                            return list.filter(c => c && c.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>);
                                        })()}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-primary/80 ml-1 font-medium text-primary">{t('kds_station')}</label>
                                    <select value={productForm.defaultStationId} onChange={e => setProductForm({ ...productForm, defaultStationId: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                        <option value="">No Default Station</option>
                                        {(() => {
                                            const list = Array.isArray(stations) ? stations : [];
                                            if (list.length === 0) return <option disabled value="">No stations found (check Settings &gt; KDS)</option>;
                                            return list.filter(s => s && s.id).map((s: any) => <option key={s.id} value={s.id}>{s.name} KDS</option>);
                                        })()}
                                    </select>
                                </div>

                                <textarea placeholder="Description (optional)" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={2} className="col-span-2 bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary resize-none" />
                                <div className="space-y-1 col-span-2">
                                    <label className="text-xs text-primary/80 ml-1 font-medium">Combo Image URL</label>
                                    <input placeholder="https://example.com/combo-image.jpg" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                                </div>
                            </div>

                            <div className="border-t border-border pt-5 mt-4">
                                <h4 className="text-sm font-medium text-primary flex items-center gap-2 mb-4"><Package className="w-4 h-4" /> Combo Components</h4>
                                <div className="space-y-3 mb-5">
                                    {(() => {
                                        const list = Array.isArray(recipeComponents) ? recipeComponents : [];
                                        if (list.length === 0) {
                                            return <div className="text-center py-6 bg-background rounded-lg border border-dashed border-slate-700 text-muted-foreground text-sm">Search and add products to build this combo.</div>;
                                        }
                                        return list.map((rc, i) => (
                                            <div key={i} className="flex gap-3 items-center bg-background p-2.5 rounded-lg border border-border">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm text-foreground pl-2">{rc.name}</div>
                                                    <div className="flex gap-4 pl-2 mt-0.5">
                                                        <span className="text-[10px] text-primary font-mono">
                                                            Price: ${(() => {
                                                                const it = items?.find(ii => ii.id === rc.ingredientId);
                                                                if (rc.variantId) return it?.variants?.find((v: any) => v.id === rc.variantId)?.price || '0.00';
                                                                return it?.price || '0.00';
                                                            })()}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            Cost: ${(() => {
                                                                const it = items?.find(ii => ii.id === rc.ingredientId);
                                                                if (rc.variantId) return it?.variants?.find((v: any) => v.id === rc.variantId)?.costPrice || '0.00';
                                                                return it?.costPrice || '0.00';
                                                            })()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-md border border-slate-700">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Qty:</span>
                                                    <input type="number" min="1" value={rc.quantity} onChange={e => handleUpdateComboQty(i, Number(e.target.value))} className="bg-transparent border-none text-white w-12 text-center outline-none focus:ring-0 text-sm font-bold" />
                                                </div>
                                                <button type="button" onClick={() => handleRemoveComboIngredient(i)} className="text-muted-foreground hover:text-error-400 p-2 transition-colors rounded hover:bg-error-500/10"><X className="h-4 w-4" /></button>
                                            </div>
                                        ));
                                    })()}
                                </div>
                                <div className="relative">
                                    <input type="text" placeholder="Search standard products or raw materials to add..." value={searchComponentQuery} onChange={e => setSearchComponentQuery(e.target.value)} className="w-full bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-primary transition-colors placeholder-primary-400/50" />
                                    {searchComponentQuery && (
                                        <div className="absolute top-full left-0 right-0 mt-2 max-h-56 overflow-y-auto bg-muted border border-slate-700 rounded-xl shadow-2xl z-10 divide-y divide-slate-700/50">
                                            {(() => {
                                                const list = Array.isArray(items) ? items : [];
                                                const filtered = list.filter(item => item && item.id !== editingProduct?.id && item.productType !== 'COMBO' && (item.name?.toLowerCase() || '').includes(searchComponentQuery.toLowerCase()));
                                                return filtered.map(filteredItem => (
                                                    <div key={filteredItem.id} className="border-b border-slate-700/50 last:border-0">
                                                        {filteredItem.variants && Array.isArray(filteredItem.variants) && filteredItem.variants.length > 0 ? (
                                                            <div className="p-3 bg-primary/5">
                                                                <div className="flex justify-between items-center mb-2 px-1">
                                                                    <span className="text-xs font-bold text-primary-300 uppercase tracking-wider">{filteredItem.name}</span>
                                                                    <span className="text-[10px] text-muted-foreground italic">Select variant</span>
                                                                </div>
                                                                 <div className="grid grid-cols-2 gap-2">
                                                                     {(() => {
                                                                         const vList = Array.isArray(filteredItem.variants) ? filteredItem.variants : [];
                                                                         return vList.filter((v: any) => v && v.id).map((v: any) => (
                                                                             <button key={v.id} type="button" onClick={() => handleAddComboIngredient(filteredItem, v)} className="flex flex-col text-left px-3 py-2 bg-card border border-slate-700 rounded-lg hover:bg-primary hover:border-primary group transition-all">
                                                                                 <span className="text-xs font-medium text-foreground group-hover:text-white">{v.name}</span>
                                                                                 <div className="flex justify-between mt-1">
                                                                                     <span className="text-[10px] text-primary group-hover:text-success-200">${v.price || '0.00'}</span>
                                                                                     <span className="text-[10px] text-muted-foreground group-hover:text-primary-200">${v.costPrice || '0.00'}</span>
                                                                                 </div>
                                                                             </button>
                                                                         ));
                                                                     })()}
                                                                 </div>
                                                            </div>
                                                        ) : (
                                                            <button type="button" onClick={() => handleAddComboIngredient(filteredItem)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-primary hover:text-white transition-colors group">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{filteredItem.name}</span>
                                                                    {Array.isArray(filteredItem.modifiers) && filteredItem.modifiers.length > 0 && <span className="text-[10px] text-primary group-hover:text-primary-200 flex items-center gap-1 mt-0.5"><Check className="w-2.5 h-2.5" /> Has Modifiers</span>}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs font-bold text-primary group-hover:text-white">${filteredItem.price || '0.00'}</div>
                                                                    <div className="text-[10px] text-muted-foreground group-hover:text-primary-200">Cost: ${filteredItem.costPrice || '0.00'}</div>
                                                                </div>
                                                            </button>
                                                        )}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                                <button type="button" onClick={() => { setActiveFormType(null); setEditingProduct(null); }} className="px-5 py-2.5 text-muted-foreground hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-bold transition-colors">
                                    {editingProduct ? 'Update Combo' : 'Save Combo'}
                                </button>
                            </div>
                        </form>
                    </div >
                )
            }

            {/* Category Form */}
            {
                activeFormType === 'category' && tab === 'categories' && (
                    <div className="mb-8 p-6 bg-card border border-border rounded-xl">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('add_new_category')}</h3>
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground ml-1">{t('name_en')}</label>
                                    <input required placeholder="Category Name (EN)" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1" dir="rtl">
                                    <label className="text-xs text-muted-foreground mr-1">{t('name_ar')}</label>
                                    <input placeholder="الاسم (عربي)" value={categoryForm.nameAr} onChange={e => setCategoryForm({ ...categoryForm, nameAr: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary text-right font-arabic" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground ml-1">{t('description')} (EN)</label>
                                    <input placeholder="Description (EN)" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-xs text-muted-foreground ml-1">Default KDS Station</label>
                                    <select value={categoryForm.defaultStationId} onChange={e => setCategoryForm({ ...categoryForm, defaultStationId: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary">
                                        <option value="">{t('select_kds_station')}</option>
                                        {(Array.isArray(stations) ? stations : []).map((s: any) => <option key={s.id} value={s.id}>{s.name} KDS</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <label className="text-xs text-muted-foreground ml-1">Category Image URL</label>
                                    <input placeholder="https://example.com/category.jpg" value={categoryForm.imageUrl} onChange={e => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveFormType(null)} className="px-4 py-2 text-muted-foreground hover:text-white transition-colors">{t('cancel')}</button>
                                <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary text-white rounded-lg font-medium transition-colors">{t('save')}</button>
                            </div>
                        </form>
                    </div>
                )
            }

            {/* Products Table */}
            {
                tab === 'products' && (
                    <div className="rounded-xl border border-border bg-card/50 overflow-visible">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-card [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
                                <tr>
                                    <th className={`py-4 px-6 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('product')}</th>
                                    <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('pos_visibility')}</th>
                                    <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('sell_price')}</th>
                                    <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('cost_price')}</th>
                                    <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('category')}</th>
                                    <th className="py-4 pr-6 text-right"><span className="sr-only">{t('actions')}</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card/20">
                                {loading ? <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
                                    : (!Array.isArray(items) || items.length === 0) ? <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No products yet. Click "New Product" to add one.</td></tr>
                                        : (Array.isArray(items) ? items : []).map(item => (
                                            <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-4 pl-6 pr-3">
                                                    <div className="font-medium text-foreground">{item.name}</div>
                                                    {item.sku && <div className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku}</div>}
                                                </td>
                                                <td className="px-3 py-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {item.isSellable !== false ? (
                                                            <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit uppercase font-bold">Visible</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-slate-700 w-fit uppercase font-bold">Internal</span>
                                                        )}
                                                        {item.productType === 'COMBO' && (
                                                            <span className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit uppercase font-bold">Combo</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-primary font-bold">${(parseFloat(item.price) || 0).toFixed(2)}</td>
                                                <td className="px-3 py-4 text-muted-foreground font-medium">${item.costPrice || '0.00'}</td>
                                                <td className="px-3 py-4 text-sm text-muted-foreground">{(language === 'ar' && item.category?.nameAr) ? item.category.nameAr : (item.category?.name || 'Uncategorized')}</td>
                                                <td className="py-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => { setPrintingProduct(item); setPrintModalOpen(true); }} title="Print Barcode" className="text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                                            <Printer className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => openEditProduct(item)} title="Edit Product" className="text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-primary/10 transition-colors">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => handleDeleteProduct(item.id)} title="Delete Product" className="text-muted-foreground hover:text-error-400 p-2 rounded-lg hover:bg-error-500/10 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* Categories Table */}
            {
                tab === 'categories' && (
                    <div className="rounded-xl border border-border bg-card/50 overflow-visible">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-card [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
                                <tr>
                                    <th className={`py-4 px-6 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('category')}</th>
                                    <th className="py-4 pr-6 text-right"><span className="sr-only">{t('actions')}</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card/20">
                                {loading ? <tr><td colSpan={2} className="py-12 text-center text-muted-foreground">Loading...</td></tr>
                                    : categories.length === 0 ? <tr><td colSpan={2} className="py-12 text-center text-muted-foreground">No categories yet.</td></tr>
                                        : Array.isArray(categories) && categories.map(cat => (
                                            <tr key={cat.id} className="hover:bg-muted/40 transition-colors">
                                                <td className="py-3 pl-6 pr-3">
                                                    {editingCategory === cat.id ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="grid grid-cols-3 gap-2 flex-1">
                                                                <input autoFocus value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="bg-background border border-primary rounded-lg px-3 py-1.5 text-white outline-none text-sm" placeholder="Name (EN)" />
                                                                <input value={categoryForm.nameAr} onChange={e => setCategoryForm({ ...categoryForm, nameAr: e.target.value })} className="bg-background border border-primary rounded-lg px-3 py-1.5 text-white outline-none text-sm text-right font-arabic" dir="rtl" placeholder="الاسم (عربي)" />
                                                                <select value={categoryForm.defaultStationId} onChange={e => setCategoryForm({ ...categoryForm, defaultStationId: e.target.value })} className="bg-background border border-primary rounded-lg px-3 py-1.5 text-white outline-none text-sm appearance-none">
                                                                    <option value="">No Station</option>
                                                                    {Array.isArray(stations) && stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                                </select>
                                                                <input value={categoryForm.imageUrl} onChange={e => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })} className="col-span-3 bg-background border border-primary rounded-lg px-3 py-1.5 text-white outline-none text-sm" placeholder="Image URL" title="Category Image URL" />
                                                            </div>
                                                            <button onClick={() => handleUpdateCategory(cat.id, categoryForm)} className="text-primary hover:text-success-300 p-1"><Check className="h-5 w-5" /></button>
                                                            <button onClick={() => setEditingCategory(null)} className="text-muted-foreground hover:text-white p-1"><X className="h-5 w-5" /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <Layers className="h-5 w-5 text-muted-foreground" />
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-foreground">{cat.name}</span>
                                                                {cat.nameAr && <span className="text-sm text-muted-foreground font-arabic" dir="rtl">{cat.nameAr}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 pr-6 flex items-center justify-end gap-2">
                                                    <button onClick={() => { setEditingCategory(cat.id); setCategoryForm({ name: cat.name, nameAr: cat.nameAr || '', description: cat.description || '', descriptionAr: cat.descriptionAr || '', defaultStationId: cat.defaultStationId || '', imageUrl: cat.imageUrl || '' }); }} className="text-muted-foreground hover:text-white p-2 rounded-lg hover:bg-muted transition-colors">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-muted-foreground hover:text-error-400 p-2 rounded-lg hover:bg-error-500/10 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {/* Branch Settings Tab */}
            {
                tab === 'branch' && (
                    <div>
                        {/* Branch Selector */}
                        <div className="mb-6 flex items-center gap-4 p-4 bg-card border border-border rounded-xl">
                            <GitBranch className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">{t('manage_visibility')}</p>
                                <select
                                    value={selectedBranchId}
                                    onChange={e => setSelectedBranchId(e.target.value)}
                                    className="bg-background border border-slate-700 rounded-lg px-4 py-2 text-white appearance-none outline-none focus:border-primary w-full max-w-xs"
                                >
                                    {Array.isArray(branches) && branches.map(b => <option key={b.id} value={b.id}>{language === 'ar' && b.nameAr ? b.nameAr : b.name}</option>)}
                                </select>
                            </div>
                            <div className="text-right text-xs text-muted-foreground leading-relaxed">
                                <p>🟢 <span className="text-slate-300">{t('available_pos_desc')}</span></p>
                                <p>🔴 <span className="text-slate-300">{t('hidden_pos_desc')}</span></p>
                                <p>💰 {t('price_override_desc')}</p>
                            </div>
                        </div>

                        {/* Product Override List */}
                        <div className="rounded-xl border border-border bg-card/50 overflow-visible">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-card [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
                                    <tr>
                                        <th className={`py-4 px-6 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('product')}</th>
                                        <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('category')}</th>
                                        <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('price')}</th>
                                        <th className={`px-3 py-4 text-xs font-semibold uppercase text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('price_override')}</th>
                                        <th className="px-3 py-4 text-center text-xs font-semibold uppercase text-muted-foreground">{t('is_available')}</th>
                                        <th className="px-3 py-4 text-center text-xs font-semibold uppercase text-muted-foreground">{t('reset')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card/20">
                                    {branchLoading ? (
                                        <tr><td colSpan={6} className="py-12 text-center text-muted-foreground animate-pulse">{t('loading_branch_settings')}</td></tr>
                                    ) : (!Array.isArray(branchProducts) || branchProducts.length === 0) ? (
                                        <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">{t('no_products_found_add')}</td></tr>
                                    ) : (Array.isArray(branchProducts) ? branchProducts : []).map(p => (
                                        <tr key={p.productId} className={`transition-colors ${!p.isAvailable ? 'bg-error-500/5 border-l-2 border-l-error-500/30' : 'hover:bg-muted/30'}`}>
                                            <td className="py-4 pl-6 pr-3">
                                                <div className={`font-medium ${!p.isAvailable ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{language === 'ar' && p.nameAr ? p.nameAr : p.name}</div>
                                                <div className="text-xs text-slate-600 uppercase font-bold mt-0.5">{p.productType}</div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-muted-foreground">{(language === 'ar' && p.category?.nameAr) ? p.category.nameAr : (p.category?.name || '—')}</td>
                                            <td className="px-3 py-4 text-muted-foreground font-mono">${(parseFloat(p.basePrice) || 0).toFixed(2)}</td>
                                            <td className="px-3 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder={(parseFloat(p.basePrice) || 0).toFixed(2)}
                                                        defaultValue={p.priceOverride !== null ? (parseFloat(p.priceOverride) || 0).toFixed(2) : ''}
                                                        disabled={!p.isAvailable || savingId === p.productId}
                                                        onBlur={e => {
                                                            const val = e.target.value;
                                                            if (val !== String(p.priceOverride ?? '')) {
                                                                handlePriceOverride(p.productId, p.isAvailable, val);
                                                            }
                                                        }}
                                                        className="w-28 bg-background border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-warning-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    />
                                                    {p.priceOverride !== null && (
                                                        <span className="text-[10px] font-bold text-warning-400 bg-warning-500/10 px-2 py-0.5 rounded-full uppercase">OVERRIDE</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                <button
                                                    onClick={() => handleBranchToggle(p.productId, p.isAvailable, p.priceOverride)}
                                                    disabled={savingId === p.productId}
                                                    className="transition-all disabled:opacity-50"
                                                >
                                                    {p.isAvailable ? (
                                                        <ToggleRight className="w-9 h-9 text-primary hover:text-success-300" />
                                                    ) : (
                                                        <ToggleLeft className="w-9 h-9 text-slate-600 hover:text-muted-foreground" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                {(p.priceOverride !== null || !p.isAvailable) ? (
                                                    <button
                                                        onClick={() => handleResetOverride(p.productId)}
                                                        disabled={savingId === p.productId}
                                                        title="Reset to global defaults"
                                                        className="p-2 rounded-lg text-muted-foreground hover:text-warning-400 hover:bg-warning-500/10 transition-colors disabled:opacity-50"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-700">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
            {/* Import Modal */}
            <ImportProductsModal
                isOpen={importModalOpen}
                onClose={() => setImportModalOpen(false)}
                onSuccess={fetchData}
                t={t}
            />

            <PrintBarcodeModal
                isOpen={printModalOpen}
                onClose={() => setPrintModalOpen(false)}
                product={printingProduct}
                currency="EGP"
            />
        </div >
    );
}
