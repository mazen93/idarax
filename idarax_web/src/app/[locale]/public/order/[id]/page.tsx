'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import PublicMenu from '@/components/public/PublicMenu';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function PublicOrderPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const tableId = params.id as string;
    const tenantId = searchParams.get('tenant');

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId || !tableId) return;

        const fetchData = async () => {
            try {
                // 1. Fetch public menu
                const menuRes = await fetch(`${API_URL}/public/menu/${tenantId}`);
                const menuData = await menuRes.json();
                const menuResult = menuData?.data;
                
                if (menuRes.ok && menuResult) {
                    // Standardize: handle both old array and new object formats
                    const categories = Array.isArray(menuResult) ? menuResult : menuResult.categories;
                    const tenant = Array.isArray(menuResult) ? menuResult[0]?.tenant : menuResult.tenant;
                    
                    // 2. Check for active order on this table
                    const orderRes = await fetch(`${API_URL}/public/table/${tableId}/order`);
                    const orderData = await orderRes.json();
                    const activeOrder = orderData?.data || null;

                    setData({ tenant, categories, activeOrder });
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantId, tableId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="flex gap-2">
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">Oops!</h1>
                    <p className="text-muted-foreground">We couldn't load the menu. Please scan the QR code again.</p>
                </div>
            </div>
        );
    }

    return (
        <PublicMenu 
            tenant={data.tenant} 
            categories={data.categories} 
            branchId={data.tenant.branches?.[0]?.id} 
            tableId={tableId} 
            activeOrder={data.activeOrder}
        />
    );
}
