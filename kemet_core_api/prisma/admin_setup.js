const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting total database cleanup...');

    // Delete in order to respect FK constraints
    console.log('Deleting logs and campaigns...');
    await prisma.whatsAppMessageLog.deleteMany();
    await prisma.whatsAppCampaign.deleteMany();
    await prisma.whatsAppTemplate.deleteMany();
    await prisma.whatsAppAccount.deleteMany();

    console.log('Deleting customer related data...');
    await prisma.interaction.deleteMany();
    await prisma.internalNote.deleteMany();
    await prisma.task.deleteMany();
    await prisma.event.deleteMany();
    await prisma.file.deleteMany();
    await prisma.folder.deleteMany();
    await prisma.financeRecord.deleteMany();
    await prisma.importJob.deleteMany();

    console.log('Deleting laundry contacts and lists...');
    await prisma.laundryContact.deleteMany();
    await prisma.contactList.deleteMany();

    console.log('Deleting customers and users...');
    await prisma.customer.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.user.deleteMany();

    console.log('Deleting roles...');
    await prisma.role.deleteMany();

    console.log('Deleting subscriptions, plans and organizations...');
    await prisma.subscription.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.organization.deleteMany();

    console.log('Database cleaned. Starting seeding...');

    // 1. Create Core Plans
    console.log('Seeding core plans...');
    const enterprisePlan = await prisma.plan.create({
        data: {
            name: 'ENTERPRISE',
            description: 'Full featured enterprise plan',
            price: 499,
            userLimit: 1000,
            storageLimit: 10240, // 10GB
            features: ['ROLE_MANAGER', 'DRIVE', 'CALENDAR', 'TASKS', 'AI_INSIGHTS', 'WHATSAPP_CAMPAIGNS']
        }
    });

    // 2. Create Global Roles
    console.log('Seeding global roles...');
    const superAdminRole = await prisma.role.create({
        data: {
            name: 'SUPER_ADMIN',
            description: 'Platform Level Administrator',
            isGlobal: true
        }
    });

    await prisma.role.create({
        data: {
            name: 'ORG_ADMIN',
            description: 'Organization Owner',
            isGlobal: true
        }
    });

    // 3. Create Primary Organization
    console.log('Creating KEMET GLOBAL organization...');
    const org = await prisma.organization.create({
        data: {
            name: 'KEMET GLOBAL',
        }
    });

    // 4. Create Subscription
    await prisma.subscription.create({
        data: {
            organizationId: org.id,
            planId: enterprisePlan.id,
            status: 'ACTIVE'
        }
    });

    // 5. Create Super Admin User
    console.log('Creating Super Admin user...');
    const hashedPassword = await bcrypt.hash('7650@Rahman', 10);

    const user = await prisma.user.create({
        data: {
            email: 'abdulrahman@kemetads.ae',
            password: hashedPassword,
            name: 'Abdulrahman Ali',
            organizationId: org.id,
            roleId: superAdminRole.id
        }
    });

    console.log('Setup finished successfully!');
    console.log('Organization: KEMET GLOBAL');
    console.log('Super Admin: abdulrahman@kemetads.ae');
    console.log('Password: (the one you specified)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
