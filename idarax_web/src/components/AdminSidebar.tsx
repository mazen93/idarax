'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Globe, Settings, LogOut, Users, Server, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';

const getMenuItems = (locale: string) => [
    { name: locale === 'ar' ? 'نظرة عامة' : 'Overview', icon: Home, href: `/${locale}/admin` },
    { name: locale === 'ar' ? 'المستأجرين والفواتير' : 'Tenants & Billing', icon: Users, href: `/${locale}/admin/tenants` },
    { name: locale === 'ar' ? 'إدارة محتوى الموقع' : 'Landing Page CMS', icon: Globe, href: `/${locale}/admin/cms` },
    { name: locale === 'ar' ? 'بريد التواصل' : 'Contact Inbox', icon: Mail, href: `/${locale}/admin/contact-inbox` },
    { name: locale === 'ar' ? 'سجلات النظام' : 'System Logs', icon: Server, href: `/${locale}/admin/logs` },
    { name: locale === 'ar' ? 'الإعدادات العامة' : 'Global Settings', icon: Settings, href: `/${locale}/admin/settings` },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const params = useParams();
    const locale = (params?.locale as string) || 'en';
    const isRtl = locale === 'ar';
    const menuItems = getMenuItems(locale);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('tenant_id');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className={`flex h-screen w-64 flex-col bg-[#0b132b] text-slate-300 border-r border-border ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex h-20 items-center px-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
                        S
                    </div>
                    <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                        {locale === 'ar' ? 'لوحة المشرف' : 'Superadmin'}
                    </h1>
                </div>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // Check if current path matches item.href context
                    const isActive = pathname === item.href || (item.href !== `/${locale}/admin` && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-slate-200'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-error-500/10 hover:text-error-400"
                >
                    <LogOut className={`h-5 w-5 text-muted-foreground group-hover:text-error-400 ${isRtl ? 'rotate-180' : ''}`} />
                    {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
            </div>
        </div>
    );
}
