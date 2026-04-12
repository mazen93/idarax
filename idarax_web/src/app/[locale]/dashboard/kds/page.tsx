'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle2, ArrowRight, ChefHat, MapPin, User, Server } from 'lucide-react';
import { getHeaders } from '@/utils/auth';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { useLanguage } from '@/components/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function getTimeElapsed(createdAt: string) {
    const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return { label: `${m}m ${s}s`, urgent: m >= 10 };
}

export default function KDSPage() {
    const { t } = useLanguage();
    const [stations, setStations] = useState<any[]>([]);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [, setTick] = useState(0);

    // Status flow: PENDING → PREPARING → READY → SERVED
    const STATUS_FLOW: Record<string, { next: string; label: string; color: string; btnColor: string }> = {
        PENDING: { next: 'PREPARING', label: t('start_cooking'), color: 'bg-warning-500/10 border-warning-500/40 text-warning-400', btnColor: 'bg-warning-500 hover:bg-warning-400 text-white' },
        PREPARING: { next: 'READY', label: t('mark_ready'), color: 'bg-primary-500/10 border-primary-500/40 text-primary-400', btnColor: 'bg-primary-500 hover:bg-primary-400 text-white' },
        READY: { next: 'SERVED', label: t('complete_item') || 'Complete Item', color: 'bg-primary/10 border-primary/40 text-primary', btnColor: 'bg-primary hover:bg-primary text-white' },
    };

    const fetchStations = useCallback(async () => {
        try {
            const res = await fetchWithAuth(`/restaurant/kds/stations`);
            if (res.ok) {
                const data = await res.json();
                const stationsList = Array.isArray(data) ? data : (data.data || []);
                setStations(stationsList);
                if (stationsList.length > 0 && !selectedStationId) {
                    setSelectedStationId(stationsList[0].id);
                }
            }
        } catch { }
    }, [selectedStationId]);

    const fetchItems = useCallback(async () => {
        if (!selectedStationId) return;
        try {
            const res = await fetchWithAuth(`/restaurant/kds/stations/${selectedStationId}/items`);
            if (res.ok) {
                const result = await res.json();
                setItems(result.data || (Array.isArray(result) ? result : []));
            }
        } catch { }
        setLoading(false);
    }, [selectedStationId]);

    useEffect(() => {
        fetchStations();
    }, [fetchStations]);

    useEffect(() => {
        if (!selectedStationId) return;
        fetchItems();
        const dataInterval = setInterval(fetchItems, 5000);
        const clockInterval = setInterval(() => setTick(tick => tick + 1), 1000);
        return () => { clearInterval(dataInterval); clearInterval(clockInterval); };
    }, [fetchItems, selectedStationId]);

    const advanceStatus = async (itemId: string, nextStatus: string) => {
        setUpdating(itemId);
        try {
            await fetchWithAuth(`/restaurant/kds/items/${itemId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: nextStatus }),
            });
            await fetchItems();
        } catch { }
        setUpdating(null);
    };

    // Group items by order to display as tickets
    const tickets = (Array.isArray(items) ? items : []).reduce((acc: any[], item) => {
        const existing = acc.find(t => t.id === item.orderId);
        if (existing) {
            existing.items.push(item);
        } else {
            acc.push({
                ...item.order,
                id: item.orderId,
                items: [item]
            });
        }
        return acc;
    }, []);

    const sortedTickets = tickets.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
        <div className="text-foreground min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{t('kds_title')}</h1>
                    <p className="text-muted-foreground text-lg">{t('kds_subtitle')}</p>
                </div>
                
                <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                    {/* Station Selector */}
                    <div className="flex flex-wrap gap-2">
                        {Array.isArray(stations) && stations.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedStationId(s.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedStationId === s.id ? 'bg-primary border-success-400 text-white shadow-lg' : 'bg-card border-border text-muted-foreground hover:border-slate-500'}`}
                            >
                                <Server className="h-4 w-4" />
                                {s.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {[['PENDING', 'amber'], ['PREPARING', 'blue'], ['READY', 'emerald']].map(([s, c]) => (
                                <span key={s} className="flex items-center gap-1.5">
                                    <span className={`h-2 w-2 rounded-full bg-${c}-400`} />
                                    {s}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 bg-card border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Live · {items.length} {t('items_count') || 'Items'}
                        </div>
                    </div>
                </div>
            </div>

            {!selectedStationId ? (
                <div className="flex flex-col items-center justify-center p-20 text-muted-foreground bg-card border border-border border-dashed rounded-xl">
                    <Server className="h-16 w-16 mb-4 opacity-40" />
                    <p className="text-xl font-medium">{t('select_station') || 'Select a Kitchen Station'}</p>
                    <p className="mt-2 text-sm">{t('select_station_help') || 'Assign products to stations in the Products menu to see them here.'}</p>
                </div>
            ) : loading && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
                    <ChefHat className="h-12 w-12 mb-4 opacity-40" />
                    <p className="text-lg">{t('connecting_kds')}</p>
                </div>
            ) : sortedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-muted-foreground bg-card border border-border border-dashed rounded-xl">
                    <CheckCircle2 className="h-16 w-16 mb-4 text-primary/50" />
                    <p className="text-xl font-medium">{t('all_caught_up')}</p>
                    <p className="mt-2 text-sm">{t('no_active_tickets')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.isArray(sortedTickets) && sortedTickets.map(ticket => (
                        <div key={ticket.id} className="flex flex-col rounded-2xl border-2 border-slate-700 bg-card overflow-hidden shadow-lg transition-all">
                            {/* Ticket Header */}
                            <div className="px-5 py-4 flex justify-between items-center border-b border-slate-700 bg-card/50">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider opacity-60">{t('order')}</p>
                                    <p className="text-2xl font-black tracking-tight">#{ticket.id.substring(0, 6).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1.5 font-bold text-sm px-2.5 py-1 rounded-lg bg-black/20 text-primary">
                                        <Clock className="h-4 w-4" />
                                        {getTimeElapsed(ticket.createdAt).label}
                                    </div>
                                    <div className="text-xs mt-1 opacity-60">
                                        {ticket.orderType || 'IN_STORE'}
                                    </div>
                                </div>
                            </div>

                            {/* Context bar */}
                            <div className="px-5 py-2 bg-background/40 flex items-center gap-4 text-xs text-muted-foreground border-b border-black/20">
                                {ticket.table ? (
                                    <span className="flex items-center gap-1 font-bold text-white"><MapPin className="h-3 w-3" /> Table #{ticket.table.number}</span>
                                ) : (
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {ticket.orderType}</span>
                                )}
                                {ticket.customer && (
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ticket.customer.name}</span>
                                )}
                            </div>

                            {/* Items grouped by Course */}
                            <div className="p-5 flex-1 bg-background/20 overflow-y-auto space-y-6">
                                {(() => {
                                    const grouped = (ticket.items || []).reduce((acc: any, item: any) => {
                                        const course = item.courseName || t('standard') || 'Standard';
                                        if (!acc[course]) acc[course] = [];
                                        acc[course].push(item);
                                        return acc;
                                    }, {});

                                    return Object.entries(grouped).map(([course, courseItems]: [string, any]) => (
                                        <div key={course} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-muted" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-card px-2 py-0.5 rounded border border-border">
                                                    {course}
                                                </span>
                                                <div className="h-px flex-1 bg-muted" />
                                            </div>
                                            
                                            {courseItems.map((item: any) => {
                                                const flow = STATUS_FLOW[item.status];
                                                const isUpdating = updating === item.id;
                                                
                                                return (
                                                    <div key={item.id} className={`p-4 rounded-xl border-2 transition-all ${flow?.color || 'bg-card/40 border-border'}`}>
                                                        <div className="flex items-start gap-3">
                                                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-card border border-slate-700 font-black text-lg text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-lg text-foreground leading-tight">
                                                                    {item.product?.name || 'Unknown Item'}
                                                                    {item.variant?.name && (
                                                                        <span className="ml-2 text-[10px] text-primary-400 uppercase font-black tracking-widest bg-primary-500/10 px-1.5 py-0.5 rounded border border-primary-500/20">
                                                                            {item.variant.name}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                
                                                                {item.note && (
                                                                    <p className="text-xs text-error-400 mt-1 font-bold italic">Note: {item.note}</p>
                                                                )}

                                                                {/* Modifiers */}
                                                                {item.modifiers && item.modifiers.length > 0 && (
                                                                    <div className="mt-2 space-y-0.5">
                                                                        {item.modifiers.map((m: any) => (
                                                                            <div key={m.id} className="text-[11px] text-warning-500 font-bold flex items-center gap-1">
                                                                                <span className="opacity-70">{m.option.modifier.name}:</span>
                                                                                <span>{m.option.name}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Recipe / Ingredients */}
                                                                {item.product?.recipeComponents && item.product.recipeComponents.length > 0 && (
                                                                    <div className="mt-3 pt-2 border-t border-border/50">
                                                                        <p className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                                                                            <ChefHat className="h-2.5 w-2.5" /> {t('recipe') || 'Recipe'}
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {item.product.recipeComponents.map((rc: any, i: number) => (
                                                                                <span key={i} className="text-[10px] bg-card/60 text-muted-foreground px-1.5 py-0.5 rounded border border-border/50">
                                                                                    <span className="font-bold text-slate-200 mr-1">{Number(rc.quantity)} {rc.unit}</span>
                                                                                    {rc.ingredient.name}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="mt-4">
                                                                    {flow ? (
                                                                        <button
                                                                            onClick={() => advanceStatus(item.id, flow.next)}
                                                                            disabled={isUpdating}
                                                                            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs tracking-wide transition-colors ${flow.btnColor}`}
                                                                        >
                                                                            {isUpdating ? <span className="animate-pulse">...</span> : <>{flow.label} <ArrowRight className="h-3 w-3" /></>}
                                                                        </button>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 text-primary text-xs font-bold">
                                                                            <CheckCircle2 className="h-4 w-4" /> {t('completed')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ));
                                })()}
                            </div>

                            {ticket.note && (
                                <div className="p-4 bg-warning-500/5 border-t border-warning-500/10 text-xs text-warning-300">
                                    📝 {ticket.note}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
