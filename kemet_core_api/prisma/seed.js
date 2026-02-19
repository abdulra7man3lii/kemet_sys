const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding core roles...');

    const roles = [
        { name: 'SUPER_ADMIN', description: 'Platform level administrator', isGlobal: true },
        { name: 'ORG_ADMIN', description: 'Organization owner/manager', isGlobal: true },
        { name: 'EMPLOYEE', description: 'Standard organization member', isGlobal: true },
    ];

    for (const roleData of roles) {
        const existing = await prisma.role.findFirst({
            where: { name: roleData.name, organizationId: null }
        });
        if (!existing) {
            await prisma.role.create({
                data: { ...roleData, organizationId: null }
            });
            console.log(`Created role: ${roleData.name}`);
        } else {
            console.log(`Role ${roleData.name} already exists.`);
        }
    }

    console.log('Seeding core plans...');
    const plans = [
        { name: 'BASIC', description: 'Starter plan', price: 0, userLimit: 5, storageLimit: 100, features: ['ROLE_MANAGER'] },
        { name: 'PRO', description: 'Professional plan', price: 99, userLimit: 20, storageLimit: 1024, features: ['ROLE_MANAGER', 'DRIVE', 'CALENDAR', 'TASKS'] },
        { name: 'ENTERPRISE', description: 'Enterprise plan', price: 499, userLimit: 999, storageLimit: 10240, features: ['ROLE_MANAGER', 'DRIVE', 'CALENDAR', 'TASKS', 'AI_INSIGHTS'] },
    ];

    for (const planData of plans) {
        const existing = await prisma.plan.findUnique({
            where: { name: planData.name }
        });
        if (!existing) {
            await prisma.plan.create({ data: planData });
            console.log(`Created plan: ${planData.name}`);
        } else {
            await prisma.plan.update({
                where: { name: planData.name },
                data: planData
            });
            console.log(`Updated plan: ${planData.name}`);
        }
    }

    console.log('Seed completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
