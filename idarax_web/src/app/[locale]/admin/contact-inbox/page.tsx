'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactInboxPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cms/admin/contact-messages`, { headers });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : (data.data ?? []));
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (msg: ContactMessage) => {
    if (!msg.isRead) {
      await fetch(`${API_URL}/cms/admin/contact-messages/${msg.id}/read`, {
        method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
      });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
    setSelected(msg);
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`${API_URL}/cms/admin/contact-messages/${id}`, { method: 'DELETE', headers });
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const displayed = filter === 'unread' ? messages.filter(m => !m.isRead) : messages;
  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>📬 Contact Inbox</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Messages submitted via the landing page contact form.</p>
          </div>
          {unreadCount > 0 && (
            <span style={{ padding: '6px 16px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: 'var(--error)', fontWeight: 700, fontSize: 14, border: '1px solid rgba(239,68,68,0.3)' }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: filter === f ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#fff' : '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {f === 'all' ? `All (${messages.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Message list */}
        <div style={{ width: 340, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', flexShrink: 0 }}>
          {loading ? (
            <p style={{ padding: 24, color: '#475569', fontSize: 14 }}>Loading...</p>
          ) : displayed.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p style={{ color: '#475569', fontSize: 14 }}>No messages yet.</p>
            </div>
          ) : (
            displayed.map(msg => (
              <div
                key={msg.id}
                onClick={() => markRead(msg)}
                style={{
                  padding: '18px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  background: selected?.id === msg.id ? 'rgba(124,58,237,0.1)' : (msg.isRead ? 'transparent' : 'rgba(124,58,237,0.05)'),
                  borderLeft: selected?.id === msg.id ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {!msg.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></span>}
                  <span style={{ fontWeight: msg.isRead ? 500 : 700, color: '#e2e8f0', fontSize: 14, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.name}</span>
                  <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Message detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {selected ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontWeight: 800, color: '#f1f5f9', margin: '0 0 4px', fontSize: 22 }}>{selected.name}</h2>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>✉️ {selected.email}</a>
                    {selected.phone && <a href={`tel:${selected.phone}`} style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none' }}>📞 {selected.phone}</a>}
                  </div>
                  <p style={{ color: '#475569', fontSize: 12, marginTop: 8 }}>{new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`mailto:${selected.email}`} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Reply</a>
                  <button onClick={() => deleteMessage(selected.id)} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: 13 }}>Delete</button>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                <p style={{ color: '#cbd5e1', fontSize: 16, lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              </div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
              <p style={{ fontSize: 64 }}>📧</p>
              <p style={{ color: '#64748b', fontSize: 16 }}>Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
