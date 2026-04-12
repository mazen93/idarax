export const PERMISSION_MODULES = [
    {
        module: 'ORDERS',
        label: 'Orders',
        icon: 'ShoppingBag',
        color: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
        actions: [
            { value: 'ORDERS:VIEW', label: 'View Orders' },
            { value: 'ORDERS:CREATE', label: 'Create Orders' },
            { value: 'ORDERS:CANCEL', label: 'Cancel Orders' },
            { value: 'ORDERS:REFUND', label: 'Refund Orders' },
            { value: 'ORDERS:VIEW_ALL', label: 'View All Branch Orders' },
        ]
    },
    {
        module: 'POS',
        label: 'Point of Sale',
        icon: 'Monitor',
        color: 'text-primary bg-primary/10 border-primary/20',
        actions: [
            { value: 'POS:ACCESS', label: 'Access POS Terminal' },
            { value: 'POS:APPLY_DISCOUNT', label: 'Apply Discounts' },
            { value: 'POS:OVERRIDE_PRICE', label: 'Override Prices' },
        ]
    },
    {
        module: 'TABLES',
        label: 'Tables & Reservations',
        icon: 'LayoutGrid',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        actions: [
            { value: 'TABLES:VIEW', label: 'View Tables' },
            { value: 'TABLES:MANAGE', label: 'Manage Tables' },
            { value: 'TABLES:MERGE', label: 'Merge Tables' },
            { value: 'TABLES:TRANSFER', label: 'Transfer Tables' },
        ]
    },
    {
        module: 'CUSTOMERS',
        label: 'Customers',
        icon: 'Users',
        color: 'text-primary bg-primary/10 border-primary/20',
        actions: [
            { value: 'CUSTOMERS:VIEW', label: 'View Customers' },
            { value: 'CUSTOMERS:CREATE', label: 'Create Customers' },
            { value: 'CUSTOMERS:EDIT', label: 'Edit Customers' },
            { value: 'CUSTOMERS:DELETE', label: 'Delete Customers' },
        ]
    },
    {
        module: 'CATALOG',
        label: 'Catalog & Menu',
        icon: 'BookOpen',
        color: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
        actions: [
            { value: 'CATALOG:VIEW', label: 'View Catalog' },
            { value: 'CATALOG:CREATE', label: 'Create Items' },
            { value: 'CATALOG:EDIT', label: 'Edit Items' },
            { value: 'CATALOG:DELETE', label: 'Delete Items' },
        ]
    },
    {
        module: 'INVENTORY',
        label: 'Inventory',
        icon: 'Package',
        color: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
        actions: [
            { value: 'INVENTORY:VIEW', label: 'View Inventory' },
            { value: 'INVENTORY:CREATE', label: 'Create Stock' },
            { value: 'INVENTORY:ADJUST', label: 'Adjust Stock' },
            { value: 'INVENTORY:TRANSFER', label: 'Transfer Stock' },
        ]
    },
    {
        module: 'REPORTS',
        label: 'Reports & Analytics',
        icon: 'BarChart2',
        color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
        actions: [
            { value: 'REPORTS:VIEW_DAILY', label: 'View Daily Reports' },
            { value: 'REPORTS:VIEW_ALL', label: 'View All Reports' },
            { value: 'REPORTS:EXPORT', label: 'Export Data' },
        ]
    },
    {
        module: 'CASH_DRAWER',
        label: 'Cash Drawer',
        icon: 'Banknote',
        color: 'text-warning-400 bg-warning-500/10 border-warning-500/20',
        actions: [
            { value: 'CASH_DRAWER:OPEN', label: 'Open Drawer' },
            { value: 'CASH_DRAWER:CLOSE', label: 'Close Drawer' },
            { value: 'CASH_DRAWER:CASH_IN', label: 'Cash In' },
            { value: 'CASH_DRAWER:CASH_OUT', label: 'Cash Out' },
            { value: 'CASH_DRAWER:VIEW_SUMMARY', label: 'View Summary' },
        ]
    },
    {
        module: 'STAFF_MANAGEMENT',
        label: 'Staff Management',
        icon: 'UserCog',
        color: 'text-error-400 bg-error-500/10 border-error-500/20',
        actions: [
            { value: 'STAFF_MANAGEMENT:VIEW', label: 'View Staff' },
            { value: 'STAFF_MANAGEMENT:CREATE', label: 'Create Staff' },
            { value: 'STAFF_MANAGEMENT:EDIT', label: 'Edit Staff' },
            { value: 'STAFF_MANAGEMENT:DELETE', label: 'Delete Staff' },
            { value: 'STAFF_MANAGEMENT:ASSIGN_ROLES', label: 'Assign Roles' },
            { value: 'STAFF_MANAGEMENT:EDIT_STATUS', label: 'Edit Staff Status' },
        ]
    },
    {
        module: 'SETTINGS',
        label: 'Settings',
        icon: 'Settings',
        color: 'text-muted-foreground bg-slate-500/10 border-slate-500/20',
        actions: [
            { value: 'SETTINGS:VIEW', label: 'View Settings' },
            { value: 'SETTINGS:EDIT', label: 'Edit Settings' },
        ]
    },
    {
        module: 'OFFERS',
        label: 'Offers & Promos',
        icon: 'Tag',
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
        actions: [
            { value: 'OFFERS:VIEW', label: 'View Offers' },
            { value: 'OFFERS:CREATE', label: 'Create Offers' },
            { value: 'OFFERS:EDIT', label: 'Edit Offers' },
            { value: 'OFFERS:DELETE', label: 'Delete Offers' },
        ]
    },
    {
        module: 'KDS',
        label: 'Kitchen Display',
        icon: 'MonitorPlay',
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        actions: [
            { value: 'KDS:ACCESS', label: 'Access KDS' },
        ]
    },
    {
        module: 'DASHBOARD',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        color: 'text-primary bg-primary/10 border-primary/20',
        actions: [
            { value: 'DASHBOARD:VIEW', label: 'View Live Metrics' },
        ]
    }
];
