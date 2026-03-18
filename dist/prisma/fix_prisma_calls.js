"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const filesToFix = [
    'src/order/order.service.ts',
    'src/restaurant/table/table.service.ts',
    'src/restaurant/table/section/table-section.service.ts',
    'src/restaurant/reservation/reservation.service.ts',
    'src/retail/inventory/inventory.service.ts',
    'src/staff/drawer.service.ts',
    'src/restaurant/kds/kds.service.ts',
    'src/user/user.service.ts',
    'src/staff/shift.service.ts'
];
const basePath = '/Users/mohamedmazen/Desktop/node_projects/idarax';
filesToFix.forEach(relPath => {
    const fullPath = path_1.default.join(basePath, relPath);
    if (!fs_1.default.existsSync(fullPath))
        return;
    let content = fs_1.default.readFileSync(fullPath, 'utf8');
    content = content.replace(/\(this\.prisma as any\)\.(\w+)/g, '(this.prisma.client as any).$1');
    content = content.replace(/this\.prisma(\.client)?\.(\w+)\.(create|update|delete|find|count)/g, (match, client, model, operation) => {
        if (client)
            return match;
        return `this.prisma.client.${model}.${operation}`;
    });
    fs_1.default.writeFileSync(fullPath, content);
    console.log(`Fixed: ${relPath}`);
});
//# sourceMappingURL=fix_prisma_calls.js.map