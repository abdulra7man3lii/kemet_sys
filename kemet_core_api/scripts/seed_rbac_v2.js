const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING RBAC SEED V2 ---');

    // 1. Create Plans
    const basicPlan = await prisma.plan.upsert({
        where: { name: 'BASIC' },
        update: {},
        create: {
            name: 'BASIC',
            description: 'Standard access for small teams.',
            price: 49,
            userLimit: 3,
            features: ['CRM_CORE']
        }
    });

    const proPlan = await prisma.plan.upsert({
        where: { name: 'PRO' },
        update: {},
        create: {
            name: 'PRO',
            description: 'Advanced features and role management.',
            price: 149,
            userLimit: 10,
            features: ['CRM_CORE', 'ROLE_MANAGER', 'FINANCE_HUB', 'DATA_LAUNDRY']
        }
    });

    const enterprisePlan = await prisma.plan.upsert({
        where: { name: 'ENTERPRISE' },
        update: {},
        create: {
            name: 'ENTERPRISE',
            description: 'Unlimited access and marketing automation.',
            price: 499,
            userLimit: 100,
            features: ['CRM_CORE', 'ROLE_MANAGER', 'FINANCE_HUB', 'DATA_LAUNDRY', 'MARKETING_WA', 'MARKETING_EMAIL']
        }
    });

    console.log('Plans created.');

    // 2. Create Permissions
    const permissions = [
        { action: 'manage', subject: 'all', description: 'Total system access' },
        { action: 'manage', subject: 'org', description: 'Manage organization settings and team' },
        { action: 'manage', subject: 'roles', description: 'Create and assign roles' },
        { action: 'manage', subject: 'leads', description: 'Full lead management' },
        { action: 'read', subject: 'leads', description: 'View assigned leads only' },
        { action: 'manage', subject: 'finance', description: 'Access financial records' },
        { action: 'manage', subject: 'laundry', description: 'Use data cleaning tools' },
    ];

    const dbPermissions = {};
    for (const p of permissions) {
        dbPermissions[p.subject] = await prisma.permission.upsert({
            where: { action_subject: { action: p.action, subject: p.subject } },
            update: {},
            create: p
        });
    }
    console.log('Permissions created.');

    // 3. Create Global Roles (Helper to avoid null index issues in some Prisma versions)
    async function upsertGlobalRole(name, description, permissionIds) {
        let role = await prisma.role.findFirst({
            where: { name, organizationId: null }
        });

        if (role) {
            role = await prisma.role.update({
                where: { id: role.id },
                data: {
                    description,
                    permissions: { set: permissionIds.map(id => ({ id })) }
                }
            });
        } else {
            role = await prisma.role.create({
                data: {
                    name,
                    description,
                    isGlobal: true,
                    permissions: { connect: permissionIds.map(id => ({ id })) }
                }
            });
        }
        return role;
    }

    const superAdminRole = await upsertGlobalRole('SUPER_ADMIN', 'Platform Master', [dbPermissions['all'].id]);
    const orgAdminRole = await upsertGlobalRole('ORG_ADMIN', 'Organization CEO', [
        dbPermissions['org'].id,
        dbPermissions['leads'].id,
        dbPermissions['roles'].id,
        dbPermissions['finance'].id,
        dbPermissions['laundry'].id,
    ]);
    const employeeRole = await upsertGlobalRole('EMPLOYEE', 'Standard Agent', [dbPermissions['leads'].id]);

    console.log('Global Roles created.');

    // 4. Create Organizations and Subscriptions
    const kemetOrg = await prisma.organization.create({
        data: {
            name: 'KEMET HQ',
            subscription: {
                create: {
                    planId: enterprisePlan.id,
                    status: 'ACTIVE'
                }
            }
        }
    });

    const acmeOrg = await prisma.organization.create({
        data: {
            name: 'Acme Corp',
            subscription: {
                create: {
                    planId: proPlan.id,
                    status: 'ACTIVE'
                }
            }
        }
    });

    console.log('Organizations and Subscriptions created.');

    // 5. Create Test Users
    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('kemet123', salt);

    await prisma.user.create({
        data: {
            email: 'admin@kemet.sys',
            name: 'System Admin',
            password: commonPassword,
            roleId: superAdminRole.id,
            organizationId: kemetOrg.id
        }
    });

    await prisma.user.create({
        data: {
            email: 'ceo@acme.corp',
            name: 'Acme CEO',
            password: commonPassword,
            roleId: orgAdminRole.id,
            organizationId: acmeOrg.id
        }
    });

    await prisma.user.create({
        data: {
            email: 'agent@acme.corp',
            name: 'Acme Agent',
            password: commonPassword,
            roleId: employeeRole.id,
            organizationId: acmeOrg.id
        }
    });

    console.log('Test Users created.');
    console.log('--- SEEDING COMPLETE ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
