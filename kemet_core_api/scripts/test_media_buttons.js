const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const WhatsAppService = require('../src/services/whatsappService');

async function main() {
    // Find account with a real token
    const account = await prisma.whatsAppAccount.findFirst({
        where: { apiKey: { startsWith: 'EAAM' }, NOT: { apiKey: { startsWith: 'EAAM_MOCK' } } }
    });

    if (!account) {
        console.log('No real account found');
        return;
    }

    console.log('Using account:', account.displayName, account.phoneNumber);

    const template = await prisma.whatsAppTemplate.findFirst({
        where: { name: 'rixos_en', organizationId: account.organizationId }
    });

    if (!template) {
        console.log('Template rixos_en not found');
        return;
    }

    const service = new WhatsAppService(account);
    const recipient = '+971562104506'; // Recipient from previous logs

    const overrides = {
        headerImageUrl: 'https://jose-foveate-accurately.ngrok-free.dev/uploads/1771456379254-marketing_img.jpg',
        bodyParams: ['Guest'],
        buttonParams: [
            { index: 0, payload: 'CONFIRM_STAY' },
            { index: 1, text: 'guest/123' }
        ]
    };

    console.log('Target Recipient:', recipient);
    const result = await service.sendTemplateMessage(
        recipient,
        template.name,
        template.language,
        template.components,
        overrides
    );

    console.log('Result:', JSON.stringify(result, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
