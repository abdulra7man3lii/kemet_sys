const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log('--- REVERTING ROLES ---');

    // 1. Find global roles
    const roles = await prisma.role.findMany({
        where: { isGlobal: true }
    });

    const orgAdminRole = roles.find(r => r.name === 'ORG_ADMIN');
    const employeeRole = roles.find(r => r.name === 'EMPLOYEE');

    if (!orgAdminRole || !employeeRole) {
        throw new Error('Global roles (ORG_ADMIN or EMPLOYEE) not found. Please run seed_rbac.js first.');
    }

    // 2. Find and update CEO (assuming based on email or name)
    const ceo = await prisma.user.findFirst({
        where: {
            OR: [
                { name: { contains: 'CEO', mode: 'insensitive' } },
                { name: { contains: 'Abdulrahman', mode: 'insensitive' } }
            ]
        }
    });

    if (ceo) {
        await prisma.user.update({
            where: { id: ceo.id },
            data: { roleId: orgAdminRole.id }
        });
        console.log(`✅ CEO (${ceo.email}) reverted to ORG_ADMIN.`);
    } else {
        console.log('⚠️ CEO account not found by name.');
    }

    // 3. Find and update Agent
    const agent = await prisma.user.findFirst({
        where: {
            OR: [
                { name: { contains: 'Agent', mode: 'insensitive' } },
                { email: { contains: 'agent', mode: 'insensitive' } }
            ]
        }
    });

    if (agent) {
        await prisma.user.update({
            where: { id: agent.id },
            data: { roleId: employeeRole.id }
        });
        console.log(`✅ Agent (${agent.email}) reverted to EMPLOYEE.`);
    } else {
        console.log('⚠️ Agent account not found by name/email.');
    }

    console.log('--- REVERT COMPLETE ---');
}

run()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
