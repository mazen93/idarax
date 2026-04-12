'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

export interface AppNotification {
  id: string;
  type: 'ORDER_READY' | 'LOW_STOCK' | 'ORDER_CANCELLED' | 'ORDER_VOIDED' | 'MANAGER_ALERT';
  title: string;
  message: string;
  isRead: boolean;
  branchId?: string;
  meta?: Record<string, any>;
  createdAt: string;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  markRead: async () => {},
  markAllRead: async () => {},
  removeNotification: async () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const getHeaders = () => {
    const token = Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
    const tenantId = Cookies.get('tenant_id') || (typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : '');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
    };
  };

  // Fetch persisted notifications on mount
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/notifications`, { headers: getHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      // Handle both {data:[]} and [] response shapes
      const list: AppNotification[] = Array.isArray(data) ? data : data?.data ?? [];
      setNotifications(list);
    } catch {
      // silently fail; user can still see live WS events
    }
  }, [apiBase]);

  // Connect WebSocket once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    fetchNotifications();

    const tenantId = Cookies.get('tenant_id') || localStorage.getItem('tenant_id') || '';
    const token = Cookies.get('token') || localStorage.getItem('token') || '';
    const backendUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    const socket = io(`${backendUrl}/notifications`, {
      extraHeaders: {
        'x-tenant-id': tenantId,
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      transports: ['websocket', 'polling'],
    });

    socket.on('notification', (notification: AppNotification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const markRead = useCallback(async (ids: string[]) => {
    try {
      await fetch(`${apiBase}/notifications/read`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
    } catch {}
  }, [apiBase]);

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${apiBase}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }, [apiBase]);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await fetch(`${apiBase}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  }, [apiBase]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
