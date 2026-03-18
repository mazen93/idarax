export enum Permission {
    // Order Permissions
    CREATE_ORDER = 'CREATE_ORDER',
    DELETE_ORDER = 'DELETE_ORDER',
    REFUND_ORDER = 'REFUND_ORDER',

    // Table Permissions
    MANAGE_TABLES = 'MANAGE_TABLES',

    // Inventory Permissions
    ADJUST_STOCK = 'ADJUST_STOCK',
    MANAGE_WAREHOUSES = 'MANAGE_WAREHOUSES',

    // CRM Permissions
    MANAGE_CUSTOMERS = 'MANAGE_CUSTOMERS',

    // Analytics
    VIEW_REPORTS = 'VIEW_REPORTS',
}
