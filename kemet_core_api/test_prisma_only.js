const { PrismaClient } = require('@prisma/client');

console.log('Instantiating PrismaClient...');
try {
    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated successfully.');

    async function main() {
        await prisma.$connect();
        console.log('Connected to database.');
        await prisma.$disconnect();
    }

    main().catch(e => {
        console.error('Connection error:', e);
        process.exit(1);
    });

} catch (error) {
    console.error('Instantiation Error:', error);
}
