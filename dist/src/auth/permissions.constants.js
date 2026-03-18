"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleDefaultPermissions = exports.AllActions = exports.Actions = void 0;
exports.Actions = {
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
};
exports.AllActions = Object.values(exports.Actions).flatMap((module) => Object.values(module));
exports.RoleDefaultPermissions = {
    CASHIER: [
        exports.Actions.ORDERS.VIEW,
        exports.Actions.ORDERS.CREATE,
        exports.Actions.POS.ACCESS,
        exports.Actions.TABLES.VIEW,
        exports.Actions.CUSTOMERS.VIEW,
        exports.Actions.CUSTOMERS.CREATE,
        exports.Actions.CASH_DRAWER.OPEN,
        exports.Actions.CASH_DRAWER.CLOSE,
        exports.Actions.CASH_DRAWER.CASH_IN,
        exports.Actions.CASH_DRAWER.CASH_OUT,
        exports.Actions.REPORTS.VIEW_DAILY,
        exports.Actions.KDS.ACCESS,
    ],
    STAFF: [
        exports.Actions.ORDERS.VIEW,
        exports.Actions.ORDERS.CREATE,
        exports.Actions.ORDERS.CANCEL,
        exports.Actions.POS.ACCESS,
        exports.Actions.POS.APPLY_DISCOUNT,
        exports.Actions.TABLES.VIEW,
        exports.Actions.TABLES.MANAGE,
        exports.Actions.CUSTOMERS.VIEW,
        exports.Actions.CUSTOMERS.CREATE,
        exports.Actions.CUSTOMERS.EDIT,
        exports.Actions.CATALOG.VIEW,
        exports.Actions.OFFERS.VIEW,
        exports.Actions.CASH_DRAWER.OPEN,
        exports.Actions.CASH_DRAWER.CLOSE,
        exports.Actions.CASH_DRAWER.CASH_IN,
        exports.Actions.CASH_DRAWER.CASH_OUT,
        exports.Actions.REPORTS.VIEW_DAILY,
        exports.Actions.KDS.ACCESS,
    ],
    MANAGER: exports.AllActions.filter((a) => a !== exports.Actions.SETTINGS.EDIT),
    ADMIN: [...exports.AllActions],
    SUPER_ADMIN: [...exports.AllActions],
};
//# sourceMappingURL=permissions.constants.js.map