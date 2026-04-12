'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Package, ShoppingBag, XCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { useNotifications, AppNotification } from './NotificationsContext';

const TYPE_CONFIG: Record<
  AppNotification['type'],
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  ORDER_READY:      { icon: CheckCheck,    color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  LOW_STOCK:        { icon: Package,       color: 'text-warning-400',   bg: 'bg-warning-500/10',   border: 'border-warning-500/30'   },
  ORDER_CANCELLED:  { icon: XCircle,       color: 'text-error-400',     bg: 'bg-error-500/10',     border: 'border-error-500/30'     },
  ORDER_VOIDED:     { icon: AlertTriangle, color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30'  },
  MANAGER_ALERT:    { icon: Info,          color: 'text-primary-400',     bg: 'bg-primary-500/10',     border: 'border-primary-500/30'     },
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useNotifications();

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleItemClick = (n: AppNotification) => {
    if (!n.isRead) markRead([n.id]);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-muted border border-border hover:bg-accent transition-colors"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[9px] font-black text-white leading-none animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-[100] w-[320px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500/15 text-error-400 text-[10px] font-black px-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck className="h-3 w-3" />
                  All
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Bell className="h-8 w-8 opacity-30" />
                <p className="text-xs font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.MANAGER_ALERT;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group
                      ${n.isRead ? 'opacity-60 hover:opacity-100 hover:bg-muted/40' : 'bg-muted/20 hover:bg-muted/50'}`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{n.message}</p>
                      {!n.isRead && (
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 rounded p-0.5 text-muted-foreground hover:text-error-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
