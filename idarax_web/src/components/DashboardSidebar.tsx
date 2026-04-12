'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes';
import { hasFeature } from '@/utils/auth';
import { useUpgradeModal } from '@/components/UpgradeModal';
import { 
    LayoutDashboard, ShoppingBag, ListOrdered, MonitorPlay, Users, Settings, 
    LogOut, ShoppingCart, Package, BarChart3, Grid3X3, CalendarDays, 
    ChefHat, Tag, Clock, Landmark, ChevronDown, Sun, Moon, 
    Languages, UserCircle, Shield, Megaphone, CreditCard, Lock
} from 'lucide-react';
import BranchSelector from './BranchSelector';
import ShiftClock from './ShiftClock';
import DrawerWidget from './DrawerWidget';
import NotificationBell from './NotificationBell';

const CASHIER_ALLOWED_PATHS = [
    '/dashboard',
    '/dashboard/pos',
    '/dashboard/orders',
    '/dashboard/tables',
    '/dashboard/reservations',
    '/dashboard/kds',
];

const getRoleLabels = (t: any) => ({
    SUPER_ADMIN: { label: t('super_admin'), color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
    ADMIN: { label: t('admin'), color: 'text-error-400 bg-error-500/10 border-error-500/30' },
    MANAGER: { label: t('manager'), color: 'text-warning-400 bg-warning-500/10 border-warning-500/30' },
    CASHIER: { label: t('cashier'), color: 'text-primary bg-primary/10 border-primary/30' },
    STAFF: { label: t('staff'), color: 'text-primary-400 bg-primary-500/10 border-primary-500/30' },
});

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'];

interface MenuItem {
    name: string;
    icon: any;
    href?: string;
    permission?: string;
    feature?: string;
    requiredPlan?: 'Professional' | 'Enterprise';
    featureDescription?: string;
    featureIcon?: string;
    subItems?: MenuItem[];
}

export default function DashboardSidebar() {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { theme, setTheme } = useTheme();
    const { openUpgradeModal } = useUpgradeModal();
    
    const isRTL = locale === 'ar';
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [mounted, setMounted] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [userFeatures, setUserFeatures] = useState<string[]>([]);
    const [tenantType, setTenantType] = useState<string>('RESTAURANT');

    const syncFromStorage = useCallback(() => {
        if (typeof window === 'undefined') return;

        const role = (localStorage.getItem('user_role') || '').trim();
        const lowerRole = role.toLowerCase();
        const sanitizedRole = (lowerRole === 'undefined' || lowerRole === 'null' || !role) ? '' : role;
        
        const name = (localStorage.getItem('user_name') || '').trim();
        const lowerName = name.toLowerCase();
        const sanitizedName = (lowerName === 'undefined' || lowerName === 'null' || !name) ? '' : name;

        setUserRole(sanitizedRole);
        setUserName(sanitizedName);

        try {
            const rawPerms = localStorage.getItem('user_permissions');
            if (rawPerms) {
                const parsed = JSON.parse(rawPerms);
                const perms = Array.isArray(parsed)
                    ? parsed.map((p: any) => typeof p === 'string' ? p : p.action)
                    : [];
                setUserPermissions(perms);
            } else {
                setUserPermissions([]);
            }
        } catch (e) {
            setUserPermissions([]);
        }
        try {
            const rawFeatures = localStorage.getItem('user_features');
            if (rawFeatures) {
                const parsedFeatures = JSON.parse(rawFeatures);
                setUserFeatures(Array.isArray(parsedFeatures) ? parsedFeatures : []);
            } else {
                setUserFeatures([]);
            }
        } catch (e) {
            setUserFeatures([]);
        }
        const type = localStorage.getItem('tenant_type') || 'RESTAURANT';
        setTenantType(type);
    }, []);

    useEffect(() => {
        setMounted(true);
        syncFromStorage();

        window.addEventListener('storage', syncFromStorage);
        window.addEventListener('localStorageChanged', syncFromStorage);
        
        return () => {
            window.removeEventListener('storage', syncFromStorage);
            window.removeEventListener('localStorageChanged', syncFromStorage);
        };
    }, [syncFromStorage]);

    const allMenuItems = useMemo((): MenuItem[] => [
        { name: t('dashboard'), icon: LayoutDashboard, href: '/dashboard' },
        { name: t('pos'), icon: ShoppingCart, href: '/dashboard/pos', permission: 'POS' },
        { name: t('live_orders'), icon: ListOrdered, href: '/dashboard/orders', permission: 'ORDERS' },
        {
            name: t('tables'),
            icon: Grid3X3,
            permission: 'TABLES',
            feature: 'RESTAURANT',
            requiredPlan: 'Professional',
            featureDescription: 'Manage dine-in tables, assign orders, and view live table status.',
            featureIcon: '🪑',
            subItems: [
                { name: t('table_layout'), icon: Grid3X3, href: '/dashboard/tables', permission: 'TABLES', feature: 'RESTAURANT', requiredPlan: 'Professional', featureDescription: 'Manage dine-in tables.', featureIcon: '🪑' },
                { name: t('reservations'), icon: CalendarDays, href: '/dashboard/reservations', permission: 'TABLES', feature: 'RESTAURANT', requiredPlan: 'Professional', featureDescription: 'Accept and manage table reservations.', featureIcon: '📅' },
            ]
        },
        { name: t('kds'), icon: MonitorPlay, href: '/dashboard/kds', permission: 'KDS', feature: 'RESTAURANT', requiredPlan: 'Professional', featureDescription: 'Real-time kitchen display showing live orders for kitchen staff.', featureIcon: '🍽️' },
        { name: t('catalog'), icon: ShoppingBag, href: '/dashboard/products', permission: 'CATALOG' },
        { name: t('menus'), icon: Clock, href: '/dashboard/menus', permission: 'CATALOG' },
        {
            name: t('inventory'),
            icon: Package,
            permission: 'INVENTORY',
            feature: 'INVENTORY',
            requiredPlan: 'Professional',
            featureDescription: 'Track stock levels, ingredients, and cost of goods.',
            featureIcon: '📦',
            subItems: [
                { name: t('inventory_list'), icon: Package, href: '/dashboard/inventory', permission: 'INVENTORY', feature: 'INVENTORY', requiredPlan: 'Professional', featureDescription: 'Track stock levels.', featureIcon: '📦' },
                { name: t('barcode_labels'), icon: Tag, href: '/dashboard/inventory/labels', permission: 'INVENTORY', feature: 'INVENTORY', requiredPlan: 'Professional', featureDescription: 'Generate and print barcodes.', featureIcon: '🏷️' },
                { name: t('recipes_bom'), icon: ChefHat, href: '/dashboard/recipes', permission: 'INVENTORY', feature: 'INVENTORY', requiredPlan: 'Professional', featureDescription: 'Build recipes with ingredient costs.', featureIcon: '👨‍🍳' },
            ]
        },
        { name: t('promotions'), icon: Tag, href: '/dashboard/offers', permission: 'OFFERS' },
        { name: t('customer_crm'), icon: Users, href: '/dashboard/customers', permission: 'CUSTOMERS', feature: 'CRM', requiredPlan: 'Professional', featureDescription: 'Manage customers, loyalty points, and purchase history.', featureIcon: '👥' },
        {
            name: t('staff_management'),
            icon: Users,
            permission: 'STAFF_MANAGEMENT',
            subItems: [
                { name: t('staff_list'), icon: Users, href: '/dashboard/staff', permission: 'STAFF_MANAGEMENT' },
                { name: t('shift_reports'), icon: Clock, href: '/dashboard/staff/shifts', permission: 'STAFF_MANAGEMENT' },
                { name: t('cash_drawer'), icon: Landmark, href: '/dashboard/staff/drawer', permission: 'CASH_DRAWER' },
            ]
        },
        { name: t('marketing'), icon: Megaphone, href: '/dashboard/marketing', permission: 'WIN_BACK_MARKETING', feature: 'MARKETING', requiredPlan: 'Enterprise', featureDescription: 'Run automated win-back campaigns, referrals, and birthday rewards.', featureIcon: '📣' },
        { name: t('reports'), icon: BarChart3, href: '/dashboard/reports', permission: 'REPORTS' },
        { name: t('settings'), icon: Settings, href: '/dashboard/settings', permission: 'SETTINGS' },
        { name: t('billing'), icon: CreditCard, href: '/dashboard/billing', permission: 'SETTINGS' },
    ], [t]);

    const isItemLocked = useCallback((item: MenuItem): boolean => {
        if (!item.feature) return false;
        return !hasFeature(item.feature);
    }, []);

    const canShowItem = useCallback((item: MenuItem): boolean => {
        // Vertical filtering: Hide restaurant-specific items for retail
        if (tenantType === 'RETAIL' && item.feature === 'RESTAURANT') return false;

        // Dashboard is accessible to everyone
        if (item.href === '/dashboard' && !item.permission) return true;

        // Locked (gated) items are SHOWN but in locked state (they trigger upgrade modal)
        // so we don't hide them, just check role/permission access

        const roleUpper = (userRole || '').toUpperCase().replace(/\s/g, '_');
        
        // Admin roles always have full access
        if (ADMIN_ROLES.includes(roleUpper) || roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN') return true;

        // Legacy fallback for specific cashier paths
        const matchesLegacy = roleUpper.includes('CASHIER') || roleUpper.includes('STAFF') || roleUpper.includes('MANAGER');
        
        if (matchesLegacy && !roleUpper.includes('MANAGER') && !ADMIN_ROLES.includes(roleUpper)) {
            if (item.href && CASHIER_ALLOWED_PATHS.includes(item.href)) return true;
            if (item.subItems) return item.subItems.some(sub => sub.href && CASHIER_ALLOWED_PATHS.includes(sub.href));
            return false;
        }

        if (item.href && CASHIER_ALLOWED_PATHS.includes(item.href) && matchesLegacy) return true;

        if (item.permission) {
            const hasAccess = userPermissions.some(p => {
                const pStr = String(p).toUpperCase();
                const target = item.permission?.toUpperCase() || '';
                return pStr === target || pStr === `MODULE:${target}` || pStr.startsWith(`${target}:`);
            });
            if (hasAccess) return true;
        }

        if (item.subItems) return item.subItems.some(sub => canShowItem(sub));

        return false;
    }, [userRole, userPermissions, tenantType]);

    const handleLockedItemClick = useCallback((item: MenuItem) => {
        openUpgradeModal({
            featureName: item.name,
            featureDescription: item.featureDescription || `Upgrade your plan to unlock ${item.name}.`,
            requiredPlan: item.requiredPlan || 'Professional',
            icon: item.featureIcon,
        });
    }, [openUpgradeModal]);

    const menuItems = useMemo(() => allMenuItems.filter(canShowItem), [allMenuItems, canShowItem]);

    useEffect(() => {
        const newOpenSections: Record<string, boolean> = { ...openSections };
        menuItems.forEach(item => {
            if (item.subItems) {
                const isActive = item.subItems.some((sub: MenuItem) => pathname === sub.href || (sub.href && pathname.startsWith(sub.href)));
                if (isActive) {
                    newOpenSections[item.name] = true;
                }
            }
        });
        setOpenSections(newOpenSections);
    }, [pathname, mounted, menuItems.length]);

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('tenant_id');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        
        const role = (userRole || '').toUpperCase();
        const isStaff = !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role);
        window.location.href = isStaff ? '/staff-login' : '/login';
    };

    const toggleSection = (name: string) => {
        setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
    };

    if (!mounted) return null;
    
    const roleKey = userRole.toUpperCase();
    const roleLabels = getRoleLabels(t);
    const roleInfo = roleLabels[roleKey as keyof typeof roleLabels] || (userRole ? { label: userRole, color: 'text-muted-foreground bg-slate-500/10 border-slate-500/30' } : { label: t('staff'), color: 'text-muted-foreground bg-slate-500/10 border-slate-500/30' });

    return (
        <div className={`flex h-screen w-64 flex-col bg-background border-r border-border ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex h-20 items-center px-6 border-b border-border">
                <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
                        {userName ? userName.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight truncate">
                            {userName || (mounted ? t('tenant_hub') : '...')}
                        </h1>
                        <p className="text-xs text-muted-foreground truncate font-medium">
                            {userRole || (mounted ? t('all') : '...')}
                        </p>
                    </div>
                    <NotificationBell />
                </div>
            </div>
            
            <BranchSelector />
            
            <div className="px-4 py-2 space-y-2">
                <ShiftClock />
                <DrawerWidget />
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1 p-4 custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const locked = isItemLocked(item);
                    const isParentActive = item.subItems?.some((sub: MenuItem) => pathname === sub.href || (sub.href && pathname.startsWith(sub.href)));
                    const isActive = item.href ? (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) : isParentActive;
                    const isOpen = openSections[item.name];

                    if (item.subItems) {
                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    onClick={() => locked ? handleLockedItemClick(item) : toggleSection(item.name)}
                                    className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                                        locked
                                            ? 'text-zinc-600 hover:bg-muted/50'
                                            : isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-5 w-5 ${locked ? 'text-zinc-700' : isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={locked ? 'text-zinc-600' : ''}>{item.name}</span>
                                    </div>
                                    {locked ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-muted border border-zinc-700 rounded-full px-2 py-0.5">
                                            <Lock className="h-2.5 w-2.5" />{item.requiredPlan || 'Pro'}
                                        </span>
                                    ) : (
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    )}
                                </button>
                                {!locked && isOpen && (
                                    <div className={`${isRTL ? 'mr-4 border-r pr-4 pl-0' : 'ml-4 border-l pl-4'} space-y-1 border-border mt-1`}>
                                        {item.subItems.map((subItem: MenuItem) => {
                                            const SubIcon = subItem.icon;
                                            const subLocked = isItemLocked(subItem);
                                            const isSubActive = pathname === subItem.href || (subItem.href && pathname.startsWith(subItem.href));
                                            if (subLocked) {
                                                return (
                                                    <button
                                                        key={subItem.name}
                                                        onClick={() => handleLockedItemClick(subItem)}
                                                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-muted/50 transition-all"
                                                    >
                                                        <SubIcon className="h-4 w-4 text-zinc-700" />
                                                        {subItem.name}
                                                        <Lock className="h-3 w-3 ml-auto text-zinc-700" />
                                                    </button>
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={subItem.name}
                                                    href={subItem.href!}
                                                    className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-all ${isSubActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                    }`}
                                                >
                                                    <SubIcon className={`h-4 w-4 ${isSubActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    {subItem.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href!}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-3">
                {userRole && (
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 rounded-xl border border-border">
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{userName || t('staff_member')}</p>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${roleInfo.color}`}>
                                <Shield className="h-2.5 w-2.5" />
                                {roleInfo.label}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-muted p-2 text-[10px] font-black text-foreground hover:bg-accent transition-colors border border-border uppercase tracking-widest"
                        title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                    >
                        {theme === 'dark' ? <Sun className="h-4 w-4 text-warning-500" /> : <Moon className="h-4 w-4 text-primary" />}
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                    <button
                        onClick={() => {
                            const nextLocale = locale === 'en' ? 'ar' : 'en';
                            router.replace(pathname, { locale: nextLocale });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-muted p-2 text-[10px] font-black text-foreground hover:bg-accent transition-colors border border-border uppercase tracking-widest"
                    >
                        <Languages className="h-4 w-4 text-primary" />
                        {locale === 'en' ? 'AR' : 'EN'}
                    </button>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-error-500/10 hover:text-error-400 group"
                >
                    <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-error-400 transition-colors" />
                    {mounted ? t('sign_out') : 'Sign Out'}
                </button>
            </div>
        </div>
    );
}
