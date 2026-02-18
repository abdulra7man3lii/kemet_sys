const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DATABASE DIAGNOSTIC ---');
    const users = await prisma.user.findMany({
        include: { organization: true }
    });

    users.forEach(u => {
        console.log(`User: ${u.email} | Role: ${u.role} | Org: ${u.organization?.name} (ID: ${u.organizationId})`);
    });

    const leads = await prisma.customer.findMany({
        select: { id: true, name: true, organizationId: true, handlers: { select: { email: true } } }
    });

    console.log('\n--- LEAD ASSIGNMENTS ---');
    leads.forEach(l => {
        const handlers = l.handlers.map(h => h.email).join(', ');
        console.log(`Lead: ${l.name} | Org: ${l.organizationId} | Handlers: [${handlers}]`);
    });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
