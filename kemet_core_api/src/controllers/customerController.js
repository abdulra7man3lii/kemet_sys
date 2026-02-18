const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new customer
const createCustomer = async (req, res) => {
    const { name, email, phone, company, status } = req.body;
    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    try {
        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                company,
                status: status || 'LEAD',
                organizationId,
                createdById: userId,
            },
        });
        res.status(201).json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all customers
const getCustomers = async (req, res) => {
    const { status, handlerId, search } = req.query;
    const organizationId = req.user.organizationId;
    const userId = parseInt(req.user.id);

    try {
        const where = { organizationId };

        // 1. Status Filter
        if (status && status !== 'all') {
            where.status = status;
        }

        // 2. Role-based / Handler Isolation
        if (req.user.role === 'EMPLOYEE') {
            // Logic: Leads I created OR leads I'm assigned to
            where.OR = [
                { createdById: userId },
                { handlers: { some: { id: userId } } }
            ];
        } else if (handlerId) {
            const hId = handlerId === 'me' ? userId : parseInt(handlerId);
            where.handlers = { some: { id: hId } };
        }

        // 3. Search Filter
        if (search) {
            // If we already have an OR for Employee, we need to wrap everything in AND
            // so we don't conflict with top-level keys.
            const searchCondition = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { company: { contains: search, mode: 'insensitive' } },
                ]
            };

            // If where.OR already exists, we must handle multiple ORs carefully in Prisma
            // The cleanest way is to use AND array
            if (where.OR) {
                const isolationOR = where.OR;
                delete where.OR;
                where.AND = [
                    { OR: isolationOR },
                    searchCondition
                ];
            } else {
                where.AND = [searchCondition];
            }
        }

        const customers = await prisma.customer.findMany({
            where,
            include: {
                createdBy: { select: { name: true, email: true } },
                handlers: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(customers);
    } catch (error) {
        console.error('getCustomers Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single customer by ID
const getCustomerById = async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const isEmployee = req.user.role === 'EMPLOYEE';

    try {
        const customer = await prisma.customer.findFirst({
            where: {
                id: parseInt(id),
                organizationId: organizationId,
                ...(isEmployee ? {
                    OR: [
                        { createdById: req.user.id },
                        { handlers: { some: { id: req.user.id } } }
                    ]
                } : {})
            },
            include: {
                createdBy: { select: { name: true, email: true } },
                handlers: { select: { id: true, name: true, email: true } },
                interactions: {
                    include: {
                        user: { select: { name: true, email: true } }
                    },
                    orderBy: { date: 'desc' }
                },
            },
        });

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a customer
const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, company, status } = req.body;
    const organizationId = req.user.organizationId;
    const isEmployee = req.user.role === 'EMPLOYEE';

    try {
        // Check access first
        const customerCheck = await prisma.customer.findFirst({
            where: {
                id: parseInt(id),
                organizationId,
                ...(isEmployee ? {
                    OR: [
                        { createdById: req.user.id },
                        { handlers: { some: { id: req.user.id } } }
                    ]
                } : {})
            }
        });

        if (!customerCheck) {
            return res.status(404).json({ message: 'Customer not found or access denied' });
        }

        const customer = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: { name, email, phone, company, status },
        });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a customer
const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Only admins can delete customers
    if (req.user.role !== 'ORG_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Not authorized to delete customers' });
    }

    try {
        // Safe check for organization ownership
        const customer = await prisma.customer.findFirst({
            where: { id: parseInt(id), organizationId }
        });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        await prisma.customer.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Assign a handler to a customer
const assignHandler = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const organizationId = req.user.organizationId;

    try {
        const customer = await prisma.customer.update({
            where: {
                id: parseInt(id),
                organizationId: organizationId,
            },
            data: {
                handlers: {
                    connect: { id: parseInt(userId) }
                }
            },
            include: {
                handlers: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Unassign a handler
const unassignHandler = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const organizationId = req.user.organizationId;

    try {
        const customer = await prisma.customer.update({
            where: {
                id: parseInt(id),
                organizationId: organizationId,
            },
            data: {
                handlers: {
                    disconnect: { id: parseInt(userId) }
                }
            },
            include: {
                handlers: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(customer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get customer statistics
const getStats = async (req, res) => {
    const organizationId = req.user.organizationId;

    try {
        const isEmployee = req.user.role === 'EMPLOYEE';

        const totalLeads = await prisma.customer.count({
            where: {
                organizationId,
                ...(isEmployee ? {
                    OR: [
                        { createdById: req.user.id },
                        { handlers: { some: { id: req.user.id } } }
                    ]
                } : {})
            }
        });

        const myLeads = await prisma.customer.count({
            where: {
                organizationId,
                OR: [
                    { createdById: req.user.id },
                    { handlers: { some: { id: req.user.id } } }
                ]
            }
        });

        const customersCount = await prisma.customer.count({
            where: {
                organizationId,
                status: 'CUSTOMER',
                ...(isEmployee ? {
                    OR: [
                        { createdById: req.user.id },
                        { handlers: { some: { id: req.user.id } } }
                    ]
                } : {})
            }
        });

        res.json({
            totalLeads,
            myLeads,
            customersCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    assignHandler,
    unassignHandler,
    getStats,
};
