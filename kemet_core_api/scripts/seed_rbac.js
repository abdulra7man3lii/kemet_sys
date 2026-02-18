const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting RBAC Seed ---');

    // 1. Initial Permissions
    const permissions = [
        { action: 'manage', subject: 'customers', description: 'Full access to customer data' },
        { action: 'view', subject: 'customers', description: 'Read-only access to customers' },
        { action: 'manage', subject: 'team', description: 'Manage employee accounts and roles' },
        { action: 'view', subject: 'finance', description: 'Access to financial records' },
        { action: 'manage', subject: 'marketing', description: 'Full access to marketing modules' },
        { action: 'manage', subject: 'settings', description: 'Modify organization settings' },
    ];

    for (const p of permissions) {
        await prisma.permission.upsert({
            where: { action_subject: { action: p.action, subject: p.subject } },
            update: {},
            create: p,
        });
    }
    console.log('✅ Permissions seeded.');

    // 2. Default Global Roles
    const globalRoles = [
        { name: 'SUPER_ADMIN', description: 'Platform owner with total control', isGlobal: true },
        { name: 'ORG_ADMIN', description: 'Organization owner', isGlobal: true },
        { name: 'EMPLOYEE', description: 'Standard staff member', isGlobal: true },
    ];

    for (const r of globalRoles) {
        const existing = await prisma.role.findFirst({
            where: { name: r.name, isGlobal: true, organizationId: null }
        });

        if (!existing) {
            await prisma.role.create({ data: r });
        }
    }
    console.log('✅ Global roles seeded.');

    // 3. Link default permissions to ORG_ADMIN (Global)
    const orgAdmin = await prisma.role.findFirst({ where: { name: 'ORG_ADMIN', isGlobal: true } });
    const allPermissions = await prisma.permission.findMany();

    await prisma.role.update({
        where: { id: orgAdmin.id },
        data: {
            permissions: {
                connect: allPermissions.map(p => ({ id: p.id }))
            }
        }
    });
    console.log('✅ Permissions linked to ORG_ADMIN.');

    console.log('--- RBAC Seed Complete ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
