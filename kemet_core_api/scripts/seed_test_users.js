const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('kemet123', 10);

    console.log('--- SEEDING SYSTEM ORGANIZATIONS ---');

    // 1. Create System HQ for Super Admins
    const systemHQ = await prisma.organization.upsert({
        where: { id: 1 },
        update: { name: 'KEMET HQ' },
        create: {
            name: 'KEMET HQ'
        }
    });

    // 2. Create Acme Corp for Client testing
    const acmeCorp = await prisma.organization.upsert({
        where: { id: 2 },
        update: { name: 'Acme Corp' },
        create: {
            name: 'Acme Corp'
        }
    });

    console.log('--- SEEDING TEST USERS ---');

    // Fetch Global Roles
    const superAdminRole = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN', isGlobal: true } });
    const orgAdminRole = await prisma.role.findFirst({ where: { name: 'ORG_ADMIN', isGlobal: true } });
    const employeeRole = await prisma.role.findFirst({ where: { name: 'EMPLOYEE', isGlobal: true } });

    // 3. Create SUPER_ADMIN
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@kemet.sys' },
        update: { roleId: superAdminRole.id, password },
        create: {
            name: 'Kemet Admin',
            email: 'admin@kemet.sys',
            password,
            roleId: superAdminRole.id,
            organizationId: systemHQ.id
        }
    });
    console.log('OK: admin@kemet.sys (SUPER_ADMIN)');

    // 4. Create ORG_ADMIN
    const orgAdmin = await prisma.user.upsert({
        where: { email: 'ceo@acme.corp' },
        update: { roleId: orgAdminRole.id, password },
        create: {
            name: 'Acme CEO',
            email: 'ceo@acme.corp',
            password,
            roleId: orgAdminRole.id,
            organizationId: acmeCorp.id
        }
    });
    console.log('OK: ceo@acme.corp (ORG_ADMIN)');

    // 5. Create EMPLOYEE
    const employee = await prisma.user.upsert({
        where: { email: 'agent@acme.corp' },
        update: { roleId: employeeRole.id, password },
        create: {
            name: 'Acme Agent',
            email: 'agent@acme.corp',
            password,
            roleId: employeeRole.id,
            organizationId: acmeCorp.id
        }
    });
    console.log('OK: agent@acme.corp (EMPLOYEE)');

    console.log('------------------------------');
    console.log('SEEDING COMPLETE');
    console.log('Password for all users: kemet123');
    console.log('------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
