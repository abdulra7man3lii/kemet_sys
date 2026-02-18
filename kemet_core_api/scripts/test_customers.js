const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('Testing getCustomers logic...');

    // Mock req.user
    const mockUser = {
        id: 1, // Change as needed
        organizationId: 1,
        role: 'EMPLOYEE'
    };

    const where = { organizationId: mockUser.organizationId };

    if (mockUser.role === 'EMPLOYEE') {
        where.OR = [
            { createdById: mockUser.id },
            { handlers: { some: { id: mockUser.id } } }
        ];
    }

    try {
        const customers = await prisma.customer.findMany({
            where,
            include: {
                createdBy: { select: { name: true, email: true } },
                handlers: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        console.log('Successfully fetched customers:', customers.length);
    } catch (error) {
        console.error('Prisma Error in getCustomers:', error.message);
    }

    console.log('Testing getStats logic...');
    try {
        const isEmployee = mockUser.role === 'EMPLOYEE';
        const totalLeads = await prisma.customer.count({
            where: {
                organizationId: mockUser.organizationId,
                ...(isEmployee ? {
                    OR: [
                        { createdById: mockUser.id },
                        { handlers: { some: { id: mockUser.id } } }
                    ]
                } : {})
            }
        });
        console.log('Successfully fetched stats. Total leads:', totalLeads);
    } catch (error) {
        console.error('Prisma Error in getStats:', error.message);
    }
}

test().finally(() => prisma.$disconnect());
