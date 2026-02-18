const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all available roles for the current organization.
 * Includes global roles and organization-specific roles.
 */
const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            where: {
                OR: [
                    {
                        isGlobal: true,
                        // If not a SUPER_ADMIN, don't show the SUPER_ADMIN role
                        ...(req.user.role !== 'SUPER_ADMIN' ? { NOT: { name: 'SUPER_ADMIN' } } : {})
                    },
                    { organizationId: req.user.organizationId }
                ]
            },
            include: {
                permissions: true,
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new custom role for the organization.
 */
const createRole = async (req, res) => {
    const { name, description, permissionIds } = req.body;

    try {
        // Prevent creating a role with a global role name
        const globalRole = await prisma.role.findFirst({
            where: { name, isGlobal: true }
        });

        if (globalRole) {
            return res.status(400).json({ message: 'Cannot use a system-reserved role name.' });
        }

        const role = await prisma.role.create({
            data: {
                name,
                description,
                organizationId: req.user.organizationId,
                isGlobal: false,
                permissions: {
                    connect: permissionIds.map(id => ({ id }))
                }
            },
            include: { permissions: true }
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update an existing custom role.
 */
const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;

    try {
        const roleId = parseInt(id);
        const existingRole = await prisma.role.findUnique({
            where: { id: roleId }
        });

        if (!existingRole) {
            return res.status(404).json({ message: 'Role not found.' });
        }

        if (existingRole.isGlobal || existingRole.organizationId !== req.user.organizationId) {
            return res.status(403).json({ message: 'Cannot modify global or unauthorized roles.' });
        }

        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: {
                name,
                description,
                permissions: {
                    set: permissionIds.map(id => ({ id }))
                }
            },
            include: { permissions: true }
        });

        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a custom role.
 */
const deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const roleId = parseInt(id);
        const existingRole = await prisma.role.findUnique({
            where: { id: roleId },
            include: { _count: { select: { users: true } } }
        });

        if (!existingRole) {
            return res.status(404).json({ message: 'Role not found.' });
        }

        if (existingRole.isGlobal || existingRole.organizationId !== req.user.organizationId) {
            return res.status(403).json({ message: 'Cannot delete global or unauthorized roles.' });
        }

        if (existingRole._count.users > 0) {
            return res.status(400).json({ message: 'Cannot delete a role that is currently assigned to users.' });
        }

        await prisma.role.delete({
            where: { id: roleId }
        });

        res.json({ message: 'Role deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all available system permissions.
 */
const getPermissions = async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: [
                { subject: 'asc' },
                { action: 'asc' }
            ]
        });
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Change a user's role.
 */
const updateUserRole = async (req, res) => {
    const { userId, roleId } = req.body;

    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!targetUser || targetUser.organizationId !== req.user.organizationId) {
            return res.status(404).json({ message: 'User not found in your organization.' });
        }

        // Security check: Non-SUPER_ADMINS cannot modify a user who is already a SUPER_ADMIN
        const targetUserRole = await prisma.role.findUnique({ where: { id: targetUser.roleId } });
        if (targetUserRole.name === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Unauthorized: Cannot modify a platform-level administrator.' });
        }

        const targetRole = await prisma.role.findUnique({
            where: { id: parseInt(roleId) }
        });

        if (!targetRole) {
            return res.status(404).json({ message: 'Role not found.' });
        }

        // Security check: Non-SUPER_ADMINS cannot assign the SUPER_ADMIN role
        if (targetRole.name === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Unauthorized: Cannot assign platform-level administrator role.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: targetUser.id },
            data: { roleId: targetRole.id },
            include: { role: true }
        });

        res.json({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role.name,
            roleId: updatedUser.roleId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    getPermissions,
    updateUserRole
};
