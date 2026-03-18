import os
import glob
import re

files = glob.glob('src/**/*module.ts', recursive=True)
for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Skip PrismaModule itself and modules that already have imports
    if 'prisma.module.ts' in file or 'app.module.ts' in file or 'cms.module.ts' in file:
        continue

    # Need standard PrismaModule and TenantModule imports
    imports_to_add = "import { PrismaModule } from '" + os.path.relpath('src/prisma/prisma.module.ts', os.path.dirname(file)).replace('.ts', '') + "';\n"
    imports_to_add += "import { TenantModule } from '" + os.path.relpath('src/tenant/tenant.module.ts', os.path.dirname(file)).replace('.ts', '') + "';\n"

    # Inject imports at the top if not exist
    if 'PrismaModule' not in content:
        content = imports_to_add + content
    
    # Add to @Module imports array
    match = re.search(r'@Module\(\s*\{', content)
    if match and 'PrismaModule' not in content[match.end():]:
        has_imports = re.search(r'imports:\s*\[', content)
        if has_imports:
            content = re.sub(r'(imports:\s*\[)', r'\1PrismaModule, TenantModule, ', content)
        else:
            content = re.sub(r'(@Module\(\s*\{)', r'\1\n  imports: [PrismaModule, TenantModule],', content)

    with open(file, 'w') as f:
        f.write(content)
print("Modules patched!")
