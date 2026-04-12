'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import PublicMenu from '@/components/public/PublicMenu';
import StorefrontHeader from '@/components/public/StorefrontHeader';
import StorefrontHero from '@/components/public/StorefrontHero';
import BranchSelector from '@/components/public/BranchSelector';
import { Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function TenantPublicPage() {
    const params = useParams();
    const tenantId = params.tenantId as string;
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');

    const [tenant, setTenant] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [menu, setMenu] = useState<any[]>([]);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTableOrder = async () => {
        if (!tableId) return;
        try {
            console.log('Fetching active order for table:', tableId);
            const tableOrderData = await fetch(`${API_URL}/public/table/${tableId}/order`).then(res => res.json());
            const orderData = tableOrderData?.data;
            if (orderData) {
                setActiveOrder(orderData);
            }
        } catch (err) {
            console.error('Failed to fetch table details', err);
        }
    };

    useEffect(() => {
        if (!tenantId) return;

        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [tRes, bRes] = await Promise.all([
                    fetch(`${API_URL}/public/tenant/${tenantId}`),
                    fetch(`${API_URL}/public/tenant/${tenantId}/branches`),
                ]);

                if (!tRes.ok) throw new Error('Restaurant not found');

                const tResJson = await tRes.json();
                const tenantData = tResJson?.data || tResJson;
                
                const bResJson = await bRes.json();
                const branchesData = bResJson?.data || (Array.isArray(bResJson) ? bResJson : []);

                if (!tenantData || !tenantData.name) throw new Error('Restaurant not found');
                setTenant(tenantData);
                const validBranches = Array.isArray(branchesData) ? branchesData : [];
                setBranches(validBranches);

                // Table-specific logic: Auto-select branch and fetch active order
                if (tableId) {
                    try {
                        const tableDetailsData = await fetch(`${API_URL}/public/table/${tableId}`).then(res => res.json());
                        if (tableDetailsData?.data?.branchId) {
                            setSelectedBranchId(tableDetailsData.data.branchId);
                        }
                        await fetchTableOrder();
                    } catch (err) {
                        console.error('Failed to fetch table details', err);
                    }
                } else if (validBranches.length === 1) {
                    setSelectedBranchId(validBranches[0].id);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load restaurant profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [tenantId]);

    // Fetch menu - either branch-specific or global
    useEffect(() => {
        if (!tenantId) return;
        
        // If there's only one branch, ensure it's selected to enable ordering
        if (!selectedBranchId && branches.length === 1) {
            setSelectedBranchId(branches[0].id);
            return; // Effect will re-run with selectedBranchId
        }

        const fetchMenuData = async () => {
            try {
                setLoading(true);
                const query = selectedBranchId ? `?branchId=${selectedBranchId}` : '';
                const mRes = await fetch(`${API_URL}/public/menu/${tenantId}${query}`);
                
                if (!mRes.ok) throw new Error('Failed to load menu.');

                const menuDataRaw = await mRes.json();
                const menuData = menuDataRaw?.data?.categories || menuDataRaw?.categories || [];
                setMenu(menuData);
            } catch (err: any) {
                console.error('Menu fetch error:', err);
                setError(err.message || 'Failed to load menu.');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, [tenantId, selectedBranchId, branches.length]);

    if (loading && !tenant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <div className="animate-pulse text-muted-foreground font-medium">Loading storefront...</div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-muted-foreground p-6 text-center">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-lg mb-8">{error || 'This restaurant is not registered with Idarax.'}</p>
                <a href="/" className="px-6 py-3 bg-primary hover:bg-primary text-white rounded-xl font-bold transition-colors">Back to Idarax</a>
            </div>
        );
    }

    // Dynamic Theming: Set primary color variable based on tenant ID (or future database setting)
    // For now, we'll use a default indigo if not provided by backend.
    const primaryColor = '#4f46e5';

    return (
        <div
            className="min-h-screen bg-[#0a0a0b] text-slate-200"
            style={{ '--tenant-primary': primaryColor } as React.CSSProperties}
        >
            <StorefrontHeader
                tenant={tenant}
                onOrderClick={() => {
                    const el = document.getElementById(selectedBranchId ? 'menu' : 'branches');
                    el?.scrollIntoView({ behavior: 'smooth' });
                }}
            />

            <StorefrontHero tenant={tenant} />

            {!selectedBranchId ? (
                // Landing state: Need to select a branch
                <BranchSelector
                    tenant={tenant}
                    branches={branches}
                    onSelectBranch={setSelectedBranchId}
                />
            ) : (
                // Menu state: Branch selected
                <div id="menu" className="animate-in fade-in duration-500 pt-8 border-t border-border bg-[#0a0a0b]">
                    <div className="max-w-7xl mx-auto px-4 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Ordering from:</span>
                            <span className="text-sm font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                                {branches.find(b => b.id === selectedBranchId)?.name}
                            </span>
                        </div>
                        {branches.length > 1 && (
                            <button
                                onClick={() => setSelectedBranchId(null)}
                                className="text-sm font-medium text-[var(--tenant-primary)] hover:text-white transition-colors"
                            >
                                Change Location
                            </button>
                        )}
                    </div>
                    {loading ? (
                        <div className="py-32 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--tenant-primary)]" /></div>
                    ) : (
                        <PublicMenu 
                            tenant={tenant} 
                            categories={menu} 
                            branch={branches.find(b => b.id === selectedBranchId)}
                            branchId={selectedBranchId} 
                            tableId={tableId}
                            activeOrder={activeOrder}
                            onOrderSuccess={fetchTableOrder}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
