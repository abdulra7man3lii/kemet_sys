const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const prisma = new PrismaClient();

const registerUser = async (req, res) => {
    const { name, email, password, companyName } = req.body;

    try {
        if (!companyName) {
            return res.status(400).json({ message: 'Company name is required for registration' });
        }

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Organization and User in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: { name: companyName },
            });

            // Find the ORG_ADMIN role
            const orgAdminRole = await tx.role.findFirst({
                where: { name: 'ORG_ADMIN', isGlobal: true }
            });

            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    organizationId: organization.id,
                    roleId: orgAdminRole.id,
                },
                include: { role: true }
            });

            return { user, organization };
        });

        res.status(201).json({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role.name,
            organizationId: result.organization.id,
            organizationName: result.organization.name,
            token: generateToken(result.user.id, result.organization.id, result.user.role.name),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                organization: true,
                role: true
            },
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                organizationId: user.organizationId,
                organizationName: user.organization.name,
                token: generateToken(user.id, user.organizationId, user.role.name),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { organizationId: req.user.organizationId },
            include: { role: true }
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            roleId: user.roleId
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUsers };
