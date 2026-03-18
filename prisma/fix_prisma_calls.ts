import fs from 'fs';
import path from 'path';

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
    const fullPath = path.join(basePath, relPath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace (this.prisma as any).modelCall with (this.prisma.client as any).modelCall
    // Regex targets strings like (this.prisma as any).table.create
    content = content.replace(/\(this\.prisma as any\)\.(\w+)/g, '(this.prisma.client as any).$1');

    // Also handle cases where there might not be "as any" (if I missed any)
    // Be careful not to replace "this.prisma.client" itself
    content = content.replace(/this\.prisma(\.client)?\.(\w+)\.(create|update|delete|find|count)/g, (match, client, model, operation) => {
        if (client) return match;
        return `this.prisma.client.${model}.${operation}`;
    });

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${relPath}`);
});
