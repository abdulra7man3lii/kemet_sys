const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding WhatsApp assets...');

    // 1. Create WhatsApp Accounts for Org 1
    const account1 = await prisma.whatsAppAccount.upsert({
        where: { phoneNumber: '+971501111111' },
        update: {},
        create: {
            phoneNumber: '+971501111111',
            displayName: 'Direct Sales - Line 1',
            apiKey: 'EAAM_MOCK_TOKEN_1',
            phoneId: '1092837465',
            businessAccountId: '5647382910',
            organizationId: 1,
            isActive: true
        }
    });

    const account2 = await prisma.whatsAppAccount.upsert({
        where: { phoneNumber: '+971502222222' },
        update: {},
        create: {
            phoneNumber: '+971502222222',
            displayName: 'Customer Support - Line 2',
            apiKey: 'EAAM_MOCK_TOKEN_2',
            phoneId: '1092837466',
            businessAccountId: '5647382910',
            organizationId: 1,
            isActive: true
        }
    });

    // 2. Create templates for Org 1
    const templates = [
        {
            name: 'welcome_package',
            language: 'en_US',
            category: 'MARKETING',
            components: {
                header: { type: 'IMAGE', text: 'Welcome Image' },
                body: 'Hello {{1}}, welcome to KEMET. We are excited to have you in {{2}}!',
                buttons: [{ type: 'QUICK_REPLY', text: 'Interested' }]
            },
            organizationId: 1
        },
        {
            name: 'property_listing_update',
            language: 'en_US',
            category: 'MARKETING',
            components: {
                header: { type: 'TEXT', text: 'New Listing Alert' },
                body: 'Hi {{1}}, check out this new property in {{2}} at a special price!',
                buttons: [{ type: 'URL', text: 'View Details', url: 'https://kemet.ae/listing' }]
            },
            organizationId: 1
        },
        {
            name: 'system_notification',
            language: 'en_US',
            category: 'UTILITY',
            components: {
                body: 'Your account status in KEMET System has been updated.',
            },
            organizationId: 1
        }
    ];

    for (const temp of templates) {
        await prisma.whatsAppTemplate.upsert({
            where: {
                id: (await prisma.whatsAppTemplate.findFirst({ where: { name: temp.name, organizationId: 1 } }))?.id || 0
            },
            update: temp,
            create: temp
        });
    }

    console.log('WhatsApp seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
