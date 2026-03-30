export const Actions = {
    ORDERS: {
        VIEW: 'ORDERS:VIEW',
        CREATE: 'ORDERS:CREATE',
        CANCEL: 'ORDERS:CANCEL',
        REFUND: 'ORDERS:REFUND',
        VIEW_ALL: 'ORDERS:VIEW_ALL',
    },
    POS: {
        ACCESS: 'POS:ACCESS',
        APPLY_DISCOUNT: 'POS:APPLY_DISCOUNT',
        OVERRIDE_PRICE: 'POS:OVERRIDE_PRICE',
    },
    TABLES: {
        VIEW: 'TABLES:VIEW',
        MANAGE: 'TABLES:MANAGE',
        MERGE: 'TABLES:MERGE',
        TRANSFER: 'TABLES:TRANSFER',
    },
    CUSTOMERS: {
        VIEW: 'CUSTOMERS:VIEW',
        CREATE: 'CUSTOMERS:CREATE',
        EDIT: 'CUSTOMERS:EDIT',
        DELETE: 'CUSTOMERS:DELETE',
    },
    CATALOG: {
        VIEW: 'CATALOG:VIEW',
        CREATE: 'CATALOG:CREATE',
        EDIT: 'CATALOG:EDIT',
        DELETE: 'CATALOG:DELETE',
    },
    INVENTORY: {
        VIEW: 'INVENTORY:VIEW',
        CREATE: 'INVENTORY:CREATE',
        ADJUST: 'INVENTORY:ADJUST',
        TRANSFER: 'INVENTORY:TRANSFER',
    },
    REPORTS: {
        VIEW_DAILY: 'REPORTS:VIEW_DAILY',
        VIEW_ALL: 'REPORTS:VIEW_ALL',
        EXPORT: 'REPORTS:EXPORT',
    },
    CASH_DRAWER: {
        OPEN: 'CASH_DRAWER:OPEN',
        CLOSE: 'CASH_DRAWER:CLOSE',
        CASH_IN: 'CASH_DRAWER:CASH_IN',
        CASH_OUT: 'CASH_DRAWER:CASH_OUT',
        VIEW_SUMMARY: 'CASH_DRAWER:VIEW_SUMMARY',
    },
    STAFF_MANAGEMENT: {
        VIEW: 'STAFF_MANAGEMENT:VIEW',
        CREATE: 'STAFF_MANAGEMENT:CREATE',
        EDIT: 'STAFF_MANAGEMENT:EDIT',
        DELETE: 'STAFF_MANAGEMENT:DELETE',
        ASSIGN_ROLES: 'STAFF_MANAGEMENT:ASSIGN_ROLES',
        EDIT_STATUS: 'STAFF_MANAGEMENT:EDIT_STATUS',
    },
    SETTINGS: {
        VIEW: 'SETTINGS:VIEW',
        EDIT: 'SETTINGS:EDIT',
    },
    OFFERS: {
        VIEW: 'OFFERS:VIEW',
        CREATE: 'OFFERS:CREATE',
        EDIT: 'OFFERS:EDIT',
        DELETE: 'OFFERS:DELETE',
    },
    KDS: {
        ACCESS: 'KDS:ACCESS',
    },
    DASHBOARD: {
        VIEW: 'DASHBOARD:VIEW',
    },
    STAFF_SCHEDULE: {
        VIEW: 'STAFF_SCHEDULE:VIEW',
        MANAGE: 'STAFF_SCHEDULE:MANAGE',
    },
    ATTENDANCE: {
        VIEW: 'ATTENDANCE:VIEW',
        CHECK_IN: 'ATTENDANCE:CHECK_IN',
        CHECK_OUT: 'ATTENDANCE:CHECK_OUT',
        MANAGE: 'ATTENDANCE:MANAGE',
    },
};

export type ActionType = string;

// Flattened list of all actions
export const AllActions = Object.values(Actions).flatMap((module) =>
    Object.values(module),
);

export const RoleDefaultPermissions: Record<string, string[]> = {
    CASHIER: [
        Actions.ORDERS.VIEW,
        Actions.ORDERS.CREATE,
        Actions.POS.ACCESS,
        Actions.TABLES.VIEW,
        Actions.CUSTOMERS.VIEW,
        Actions.CUSTOMERS.CREATE,
        Actions.CASH_DRAWER.OPEN,
        Actions.CASH_DRAWER.CLOSE,
        Actions.CASH_DRAWER.CASH_IN,
        Actions.CASH_DRAWER.CASH_OUT,
        Actions.REPORTS.VIEW_DAILY,
        Actions.KDS.ACCESS,
    ],
    STAFF: [
        Actions.ORDERS.VIEW,
        Actions.ORDERS.CREATE,
        Actions.ORDERS.CANCEL,
        Actions.POS.ACCESS,
        Actions.POS.APPLY_DISCOUNT,
        Actions.TABLES.VIEW,
        Actions.TABLES.MANAGE,
        Actions.CUSTOMERS.VIEW,
        Actions.CUSTOMERS.CREATE,
        Actions.CUSTOMERS.EDIT,
        Actions.CATALOG.VIEW,
        Actions.OFFERS.VIEW,
        Actions.CASH_DRAWER.OPEN,
        Actions.CASH_DRAWER.CLOSE,
        Actions.CASH_DRAWER.CASH_IN,
        Actions.CASH_DRAWER.CASH_OUT,
        Actions.REPORTS.VIEW_DAILY,
        Actions.KDS.ACCESS,
    ],
    MANAGER: AllActions.filter((a) => a !== Actions.SETTINGS.EDIT),
    ADMIN: [...AllActions],
    SUPER_ADMIN: [...AllActions],
};
