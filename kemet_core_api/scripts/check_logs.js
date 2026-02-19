const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.whatsAppMessageLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            campaign: true,
            account: true,
            recipient: true
        }
    });

    console.log(JSON.stringify(logs, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
        , 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
