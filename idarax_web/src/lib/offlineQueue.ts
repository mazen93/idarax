const QUEUE_KEY = 'idarax_offline_order_queue';

export interface QueuedOrder {
    id: string;          // local temp id
    queuedAt: string;    // ISO timestamp
    payload: Record<string, unknown>;
    displayMetadata?: Record<string, any>;
}

/** Push an order payload onto the queue */
export function enqueue(payload: Record<string, unknown>, displayMetadata?: Record<string, any>): QueuedOrder {
    const entry: QueuedOrder = {
        id: `LOCAL-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        queuedAt: new Date().toISOString(),
        payload,
        displayMetadata,
    };
    const current = getQueue();
    current.push(entry);
    _save(current);
    return entry;
}

/** Return all queued orders */
export function getQueue(): QueuedOrder[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
        return [];
    }
}

/** How many orders are waiting */
export function queueLength(): number {
    return getQueue().length;
}

/**
 * Attempt to flush the queue by POSTing each entry to the backend.
 * Returns the number of successfully synced orders.
 */
export async function flush(
    postFn: (url: string, data: unknown) => Promise<unknown>,
    onProgress?: (synced: number, total: number) => void
): Promise<number> {
    const queue = getQueue();
    if (queue.length === 0) return 0;

    let synced = 0;
    const remaining: QueuedOrder[] = [];

    for (const entry of queue) {
        try {
            await postFn('/orders/direct', entry.payload);
            synced++;
            onProgress?.(synced, queue.length);
        } catch {
            // Keep failed entries for next flush attempt
            remaining.push(entry);
        }
    }

    _save(remaining);
    return synced;
}

/** Remove a specific entry (e.g. after manual dismiss) */
export function remove(id: string): void {
    _save(getQueue().filter(e => e.id !== id));
}

/** Clear all queued entries */
export function clearQueue(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(QUEUE_KEY);
}

function _save(entries: QueuedOrder[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
}
