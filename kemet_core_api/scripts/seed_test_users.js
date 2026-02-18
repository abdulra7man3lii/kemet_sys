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

    // 3. Create SUPER_ADMIN
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@kemet.sys' },
        update: { role: 'SUPER_ADMIN', password },
        create: {
            name: 'Kemet Admin',
            email: 'admin@kemet.sys',
            password,
            role: 'SUPER_ADMIN',
            organizationId: systemHQ.id
        }
    });
    console.log('OK: admin@kemet.sys (SUPER_ADMIN)');

    // 4. Create ORG_ADMIN
    const orgAdmin = await prisma.user.upsert({
        where: { email: 'ceo@acme.corp' },
        update: { role: 'ORG_ADMIN', password },
        create: {
            name: 'Acme CEO',
            email: 'ceo@acme.corp',
            password,
            role: 'ORG_ADMIN',
            organizationId: acmeCorp.id
        }
    });
    console.log('OK: ceo@acme.corp (ORG_ADMIN)');

    // 5. Create EMPLOYEE
    const employee = await prisma.user.upsert({
        where: { email: 'agent@acme.corp' },
        update: { role: 'EMPLOYEE', password },
        create: {
            name: 'Acme Agent',
            email: 'agent@acme.corp',
            password,
            role: 'EMPLOYEE',
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
