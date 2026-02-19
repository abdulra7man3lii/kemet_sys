const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const WhatsAppService = require('../src/services/whatsappService');

async function main() {
    // Find account with a real token (long one)
    const account = await prisma.whatsAppAccount.findFirst({
        where: { apiKey: { startsWith: 'EAAM' }, NOT: { apiKey: { startsWith: 'EAAM_MOCK' } } }
    });

    if (!account) {
        console.log('No real account (with EAAM... token) found');
        return;
    }

    console.log('Using account:', account.displayName, account.phoneNumber);
    console.log('Token Length:', account.apiKey.length);

    const service = new WhatsAppService(account);

    // Try sending to the recipient found in logs
    const recipient = '+971562104506';
    console.log('Target Recipient:', recipient);

    const result = await service.sendTemplateMessage(
        recipient,
        'hello_world',
        'en_US',
        []
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
