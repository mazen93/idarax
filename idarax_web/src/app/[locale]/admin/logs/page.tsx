'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Server, Search, Filter, Clock, User as UserIcon, Shield } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface AuditLog {
  id: string;
  tenantId: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  meta: any;
  ipAddress: string | null;
  createdAt: string;
}

export default function SystemLogsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isRtl = locale === 'ar';
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Authorization': `Bearer ${token}` };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/audit-logs`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    (log.userEmail && log.userEmail.toLowerCase().includes(search.toLowerCase())) ||
    (log.tenantId && log.tenantId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`p-10 text-slate-200 ${isRtl ? 'rtl text-right' : 'ltr text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            {isRtl ? 'سجلات النظام' : 'System Audit Logs'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-medium">
            {isRtl 
              ? 'تتبع جميع الإجراءات الهامة عبر المنصة. عرض التفاصيل التقنية وسجلات الأمان.'
              : 'Track all significant actions across the platform. View technical details and security logs.'
            }
          </p>
        </div>
        <div className="relative w-full md:w-96">
            <div className={`pointer-events-none absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center`}>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input 
              type="text" 
              placeholder={isRtl ? 'بحث في السجلات...' : 'Search logs...'} 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className={`block w-full rounded-2xl border-0 py-3 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-card text-white ring-1 ring-inset ring-white/5 placeholder:text-muted-foreground focus:ring-2 focus:ring-primary-500 sm:text-sm`} 
            />
        </div>
      </div>

      <div className="bg-card/50 border border-border rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 font-black text-muted-foreground uppercase tracking-widest text-[10px] text-left">{isRtl ? 'الوقت' : 'Timestamp'}</th>
                <th className="px-6 py-4 font-black text-muted-foreground uppercase tracking-widest text-[10px] text-left">{isRtl ? 'الإجراء' : 'Action'}</th>
                <th className="px-6 py-4 font-black text-muted-foreground uppercase tracking-widest text-[10px] text-left">{isRtl ? 'المستخدم' : 'User'}</th>
                <th className="px-6 py-4 font-black text-muted-foreground uppercase tracking-widest text-[10px] text-left">{isRtl ? 'المستأجر' : 'Tenant'}</th>
                <th className="px-6 py-4 font-black text-muted-foreground uppercase tracking-widest text-[10px] text-left">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-6 bg-white/5 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-600 font-medium">
                    {isRtl ? 'لا توجد سجلات مطابقة.' : 'No audit logs found matching your criteria.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 text-primary/50" />
                        <span className="font-medium whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black text-[10px] uppercase border border-primary/20 group-hover:bg-primary transition-all group-hover:text-white">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-slate-300 font-bold">{log.userEmail || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-muted-foreground font-mono text-[11px] bg-white/5 px-2 py-1 rounded-md">
                        {log.tenantId.slice(0, 12)}...
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-600 font-mono text-[11px]">{log.ipAddress || '—'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
