const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting total database cleanup...');

    const safelyDelete = async (model) => {
        try {
            await model.deleteMany();
        } catch (e) {
            if (e.code === 'P2021') {
                console.log(`Table for ${model.name || 'model'} does not exist, skipping...`);
            } else {
                console.log(`Error deleting from ${model.name || 'model'}:`, e.message);
                // Continue anyway for now
            }
        }
    };

    // Delete in order to respect FK constraints
    console.log('Deleting logs and campaigns...');
    await safelyDelete(prisma.whatsAppMessageLog);
    await safelyDelete(prisma.whatsAppCampaign);
    await safelyDelete(prisma.whatsAppTemplate);
    await safelyDelete(prisma.whatsAppAccount);

    console.log('Deleting customer related data...');
    await safelyDelete(prisma.interaction);
    await safelyDelete(prisma.internalNote);
    await safelyDelete(prisma.task);
    await safelyDelete(prisma.event);
    await safelyDelete(prisma.file);
    await safelyDelete(prisma.folder);
    await safelyDelete(prisma.financeRecord);
    await safelyDelete(prisma.importJob);

    console.log('Deleting laundry contacts and lists...');
    await safelyDelete(prisma.laundryContact);
    await safelyDelete(prisma.contactList);

    console.log('Deleting customers and users...');
    await safelyDelete(prisma.customer);
    await safelyDelete(prisma.permission);
    await safelyDelete(prisma.user);

    console.log('Deleting roles...');
    await safelyDelete(prisma.role);

    console.log('Deleting subscriptions, plans and organizations...');
    await safelyDelete(prisma.subscription);
    await safelyDelete(prisma.plan);
    await safelyDelete(prisma.organization);

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
