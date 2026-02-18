const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new interaction
const createInteraction = async (req, res) => {
    const { type, notes, date, customerId } = req.body;
    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    try {
        const interaction = await prisma.interaction.create({
            data: {
                type,
                notes,
                date: date ? new Date(date) : new Date(),
                customerId: parseInt(customerId),
                userId: userId,
                organizationId,
            },
        });
        res.status(201).json(interaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all interactions for a specific customer
const getInteractionsByCustomer = async (req, res) => {
    const { id } = req.params; // Customer ID
    const organizationId = req.user.organizationId;

    try {
        const isEmployee = req.user.role === 'EMPLOYEE';

        const interactions = await prisma.interaction.findMany({
            where: {
                customerId: parseInt(id),
                organizationId: organizationId,
                ...(isEmployee ? { customer: { handlers: { some: { id: req.user.id } } } } : {})
            },
            include: {
                user: { select: { name: true, email: true } },
            },
            orderBy: { date: 'desc' },
        });
        res.json(interactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an interaction
const deleteInteraction = async (req, res) => {
    const { id } = req.params;
    const organizationId = req.user.organizationId;
    const userId = req.user.id;

    try {
        const interaction = await prisma.interaction.findFirst({
            where: { id: parseInt(id), organizationId }
        });

        if (!interaction) {
            return res.status(404).json({ error: 'Interaction not found' });
        }

        const isAdmin = req.user.role === 'ORG_ADMIN' || req.user.role === 'SUPER_ADMIN';
        if (interaction.userId !== userId && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this interaction' });
        }

        await prisma.interaction.delete({
            where: { id: parseInt(id), organizationId },
        });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createInteraction,
    getInteractionsByCustomer,
    deleteInteraction,
};
