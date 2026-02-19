const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const WhatsAppService = require('../services/whatsappService');

/**
 * Test a specific WhatsApp account connection (CEO/Admin only)
 */
const testAccountConnection = async (req, res) => {
    const { id } = req.params;
    try {
        const account = await prisma.whatsAppAccount.findUnique({
            where: { id: parseInt(id), organizationId: req.user.organizationId }
        });

        if (!account) return res.status(404).json({ message: 'Account not found' });

        const service = new WhatsAppService(account);
        const result = await service.testConnection();

        if (result.success) {
            res.json({ message: 'Connection successful', details: result.data });
        } else {
            res.status(400).json({ message: 'Connection failed', error: result.error });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get all accounts for the organization
 */
const getAccounts = async (req, res) => {
    try {
        const accounts = await prisma.whatsAppAccount.findMany({
            where: { organizationId: req.user.organizationId }
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new account (CEO only)
 */
const createAccount = async (req, res) => {
    const { phoneNumber, displayName, apiKey, phoneId, businessAccountId } = req.body;
    try {
        const account = await prisma.whatsAppAccount.create({
            data: {
                phoneNumber,
                displayName,
                apiKey,
                phoneId,
                businessAccountId,
                organizationId: req.user.organizationId
            }
        });
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Delete an account (CEO only)
 */
const deleteAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const account = await prisma.whatsAppAccount.findUnique({
            where: { id: parseInt(id), organizationId: req.user.organizationId }
        });
        if (!account) return res.status(404).json({ message: 'Account not found' });

        // Disconnect from campaigns first
        await prisma.whatsAppAccount.update({
            where: { id: parseInt(id) },
            data: { campaigns: { set: [] } }
        });

        // Delete related logs to avoid FK constraint errors
        await prisma.whatsAppMessageLog.deleteMany({
            where: { accountId: parseInt(id) }
        });

        await prisma.whatsAppAccount.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Webhook verification (GET)
 */
const verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WH_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

/**
 * Handle Webhook notifications (POST)
 */
const handleWebhook = async (req, res) => {
    const body = req.body;

    if (body.object) {
        // Handle Message Status Updates (Sent, Delivered, Read, Failed)
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.statuses &&
            body.entry[0].changes[0].value.statuses[0]
        ) {
            const statusData = body.entry[0].changes[0].value.statuses[0];
            const metaMessageId = statusData.id;
            const status = statusData.status.toUpperCase(); // SENT, DELIVERED, READ, FAILED

            try {
                // Update message log
                await prisma.whatsAppMessageLog.updateMany({
                    where: { metaMessageId: metaMessageId },
                    data: {
                        status: status,
                        errorCode: statusData.errors ? statusData.errors[0].code.toString() : null,
                        errorMessage: statusData.errors ? statusData.errors[0].message : null
                    }
                });
            } catch (error) {
                console.error('Error updating webhook status:', error);
            }
        }

        // Handle Incoming Messages / Replies (New Leads)
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0] &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const value = body.entry[0].changes[0].value;
            const message = value.messages[0];
            const contactProfile = value.contacts ? value.contacts[0] : null;
            const from = message.from;
            const profileName = contactProfile?.profile?.name || 'WhatsApp Contact';
            const recipientPhoneId = value.metadata.phone_number_id;

            try {
                // 1. Identify Organization and CEO (ORG_ADMIN)
                const account = await prisma.whatsAppAccount.findFirst({
                    where: { phoneId: recipientPhoneId },
                    include: { organization: { include: { users: { where: { roleId: 2 } } } } }
                });

                if (account) {
                    const orgId = account.organizationId;
                    const ceo = account.organization.users[0]; // The first ORG_ADMIN found

                    // 1.5. Check for Opt-Out Keywords (e.g., STOP, UNSUBSCRIBE)
                    let isOptOut = false;
                    const stopKeywords = ['STOP', 'UNSUBSCRIBE', 'REMOVE', 'CANCEL', 'إلغاء'];
                    const incomingText = message.type === 'text' ? message.text.body?.trim().toUpperCase() : '';

                    if (stopKeywords.includes(incomingText)) {
                        isOptOut = true;
                    }

                    if (isOptOut) {
                        console.log(`[WhatsApp Webhook] Opt-out detected from ${from}`);
                        // Update ALL LaundryContacts for this phone in this Org
                        await prisma.laundryContact.updateMany({
                            where: {
                                OR: [{ phone: from }, { phone: `+${from}` }],
                                list: { organizationId: orgId }
                            },
                            data: {
                                isValid: false,
                                duplicateInfo: `User Opt-out at ${new Date().toISOString()}`
                            }
                        });

                        // Send confirmation message
                        const service = new WhatsAppService(account);
                        await service.sendTemplateMessage(
                            from,
                            'opt_out_confirmation', // Assuming a template named this exists, or use plain text if within 24h
                            'en_US',
                            [],
                            {}
                        ).catch(err => console.error('Failed to send opt-out confirmation:', err.message));
                        // Note: If no template, we can also send a plain text message since they just messaged us
                    }

                    // 2. Lookup Laundry Contact for data enrichment (handle both + and non-+ formats)
                    const laundryContact = await prisma.laundryContact.findFirst({
                        where: {
                            OR: [
                                { phone: from },
                                { phone: `+${from}` }
                            ],
                            list: { organizationId: orgId }
                        }
                    });

                    // 3. Create or Refresh Lead (Customer) - Prioritize phone matching
                    const leadName = laundryContact?.name || profileName;

                    // Look for existing lead by phone ONLY
                    let lead = await prisma.customer.findFirst({
                        where: {
                            OR: [{ phone: from }, { phone: `+${from}` }],
                            organizationId: orgId
                        }
                    });

                    // Only look by email if phone match failed AND we have a proper laundry email
                    // BUT: If the found lead already has a DIFFERENT phone number, do NOT merge.
                    if (!lead && laundryContact?.email) {
                        const emailLead = await prisma.customer.findUnique({ where: { email: laundryContact.email } });
                        if (emailLead && (!emailLead.phone || emailLead.phone === from || emailLead.phone === `+${from}`)) {
                            lead = emailLead;
                        }
                    }

                    if (lead) {
                        lead = await prisma.customer.update({
                            where: { id: lead.id },
                            data: {
                                name: leadName,
                                phone: from,
                                status: 'LEAD'
                            }
                        });
                    } else {
                        // Create new lead with a system-unique email if laundry email is taken or missing
                        let finalEmail = laundryContact?.email || `${from}@whatsapp.com`;

                        // Verify email uniqueness before creation
                        const emailExists = await prisma.customer.findUnique({ where: { email: finalEmail } });
                        if (emailExists) {
                            finalEmail = `${from}.system@whatsapp.com`; // Force uniqueness
                        }

                        lead = await prisma.customer.create({
                            data: {
                                name: leadName,
                                email: finalEmail,
                                phone: from,
                                status: 'LEAD',
                                organizationId: orgId,
                                createdById: ceo?.id || 1,
                            }
                        });
                    }

                    // 4. Ensure CEO is assigned as handler
                    if (ceo) {
                        await prisma.customer.update({
                            where: { id: lead.id },
                            data: {
                                handlers: {
                                    connect: { id: ceo.id }
                                }
                            }
                        });
                    }

                    // 5. Log Interaction detail
                    let content = '';
                    if (message.type === 'text') content = message.text.body;
                    else if (message.type === 'button') content = `Button: ${message.button.text}`;
                    else content = `Incoming ${message.type}`;

                    await prisma.interaction.create({
                        data: {
                            type: 'REPLY',
                            notes: `WA: ${content}`,
                            customerId: lead.id,
                            organizationId: orgId,
                            userId: ceo?.id || 1
                        }
                    });

                    console.log(`[WhatsApp Webhook] Automated Lead created/updated for ${from} (Org: ${orgId})`);
                }
            } catch (error) {
                console.error('Error processing incoming WhatsApp lead:', error);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
};

/**
 * Sync templates from Meta for a specific account
 */
const syncTemplates = async (req, res) => {
    const { id } = req.params;
    try {
        const account = await prisma.whatsAppAccount.findUnique({
            where: { id: parseInt(id), organizationId: req.user.organizationId }
        });

        if (!account) return res.status(404).json({ message: 'Account not found' });

        const service = new WhatsAppService(account);
        const { success, data: templates } = await service.getTemplates();
        console.log('Fetched', templates?.length || 0, 'templates from Meta');
        if (!success) {
            return res.status(500).json({ message: 'Failed to fetch templates from Meta' });
        }
        // Save templates to our DB
        const savedTemplates = [];
        for (const metaTemp of templates) {
            const saved = await prisma.whatsAppTemplate.upsert({
                where: {
                    id: (await prisma.whatsAppTemplate.findFirst({
                        where: { name: metaTemp.name, organizationId: req.user.organizationId }
                    }))?.id || 0
                },
                update: {
                    components: metaTemp.components,
                    category: metaTemp.category,
                    language: metaTemp.language,
                    accounts: {
                        connect: { id: account.id }
                    }
                },
                create: {
                    name: metaTemp.name,
                    components: metaTemp.components,
                    category: metaTemp.category,
                    language: metaTemp.language,
                    organizationId: req.user.organizationId,
                    accounts: {
                        connect: { id: account.id }
                    }
                }
            });
            savedTemplates.push(saved);
        }

        res.json({ message: 'Templates synced successfully', count: savedTemplates.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get templates for the organization
 */
const getTemplates = async (req, res) => {
    try {
        const templates = await prisma.whatsAppTemplate.findMany({
            where: { organizationId: req.user.organizationId },
            include: { accounts: { select: { id: true } } }
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a template
 */
const createTemplate = async (req, res) => {
    const { name, language, category, components } = req.body;
    try {
        const template = await prisma.whatsAppTemplate.create({
            data: {
                name,
                language,
                category,
                components,
                organizationId: req.user.organizationId
            }
        });
        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Create a campaign (Wizard)
 */
const createCampaign = async (req, res) => {
    const { name, listId, senderAccountIds, templateId, batchSettings } = req.body;
    try {
        const campaign = await prisma.whatsAppCampaign.create({
            data: {
                name,
                listId: parseInt(listId),
                organizationId: req.user.organizationId,
                createdById: req.user.id,
                templateId: parseInt(templateId),
                batchSettings,
                senderAccounts: {
                    connect: senderAccountIds.map(id => ({ id: parseInt(id) }))
                }
            }
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Get campaigns
 */
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.whatsAppCampaign.findMany({
            where: { organizationId: req.user.organizationId },
            include: {
                list: {
                    select: {
                        name: true,
                        _count: { select: { contacts: { where: { isValid: true } } } }
                    }
                },
                senderAccounts: { select: { phoneNumber: true, displayName: true } },
                template: { select: { name: true, language: true } },
                logs: {
                    select: { status: true, errorMessage: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Post-process to aggregate stats for the frontend
        const campaignsWithStats = campaigns.map(camp => {
            const stats = {
                SENT: 0,
                DELIVERED: 0,
                READ: 0,
                FAILED: 0
            };
            const errors = new Set();

            camp.logs.forEach(log => {
                if (stats[log.status] !== undefined) {
                    stats[log.status]++;
                }
                if (log.status === 'FAILED' && log.errorMessage) {
                    errors.add(log.errorMessage);
                }
            });

            return {
                ...camp,
                totalRecipients: camp.list?._count?.contacts || 0,
                stats,
                errorList: Array.from(errors),
                logs: undefined // Remove logs to keep payload small
            };
        });

        res.json(campaignsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get templates that are valid for all selected accounts (Stubbed for now)
 * In a real scenario, this would check the Meta API for each account
 */
const getValidTemplates = async (req, res) => {
    const { accountIds } = req.query;
    try {
        // For now, return all templates for this org
        const templates = await prisma.whatsAppTemplate.findMany({
            where: { organizationId: req.user.organizationId }
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Execute broadcast (Simulation for now)
 */
const sendBroadcast = async (req, res) => {
    const { campaignId } = req.params;
    try {
        const campaign = await prisma.whatsAppCampaign.findUnique({
            where: { id: parseInt(campaignId) },
            include: {
                list: { include: { contacts: { where: { isValid: true } } } },
                senderAccounts: true,
                template: true  // include the linked template
            }
        });

        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        const contacts = campaign.list.contacts;
        const accounts = campaign.senderAccounts;
        const batchSettings = campaign.batchSettings || { batchMode: 'INSTANT' };

        // Resolve template name and language from the linked template
        const templateName = campaign.template?.name || campaign.templateName;
        const templateLanguage = campaign.template?.language || 'en_US';

        if (!templateName) {
            return res.status(400).json({ message: 'Campaign has no template assigned. Please select a template before sending.' });
        }

        // Mark campaign as sending
        await prisma.whatsAppCampaign.update({
            where: { id: campaign.id },
            data: { status: 'SENDING', startedAt: new Date() }
        });

        // Helper to convert relative URLs to public ones for Meta
        const makePublicUrl = (url) => {
            if (!url) return url;
            if (url.startsWith('http')) return url;
            const baseUrl = process.env.BASE_URL || (process.env.NGROK_DOMAIN ? `https://${process.env.NGROK_DOMAIN}` : null);
            if (!baseUrl) return url;
            return `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
        };

        // Prepare overrides from batchSettings
        const overrides = {
            headerImageUrl: makePublicUrl(batchSettings.headerImageUrl),
            headerVideoUrl: makePublicUrl(batchSettings.headerVideoUrl),
            headerDocUrl: makePublicUrl(batchSettings.headerDocUrl),
            bodyParams: batchSettings.bodyParams || []
        };

        // Send messages
        for (const contact of contacts) {
            const account = accounts[Math.floor(Math.random() * accounts.length)];
            const service = new WhatsAppService(account);

            const result = await service.sendTemplateMessage(
                contact.phone,
                templateName,
                templateLanguage,
                campaign.template?.components || [],  // Pass stored components for header/buttons
                overrides // Pass mapped overrides here
            );

            await prisma.whatsAppMessageLog.create({
                data: {
                    campaignId: campaign.id,
                    accountId: account.id,
                    recipientId: contact.id,
                    status: result.success ? 'SENT' : 'FAILED',
                    metaMessageId: result.success ? result.messageId : null,
                    errorMessage: result.success ? null : result.error
                }
            });
        }

        // Mark as completed
        await prisma.whatsAppCampaign.update({
            where: { id: campaign.id },
            data: { status: 'COMPLETED', completedAt: new Date() }
        });

        res.json({ message: 'Broadcast initiated', recipientCount: contacts.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Recover failed contacts from a campaign into a new list
 */
const recoverFailedContacts = async (req, res) => {
    const { campaignId } = req.params;
    try {
        const campaign = await prisma.whatsAppCampaign.findUnique({
            where: { id: parseInt(campaignId), organizationId: req.user.organizationId },
            include: { logs: { where: { status: 'FAILED' }, include: { recipient: true } } }
        });

        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        const failedLogs = campaign.logs;
        if (failedLogs.length === 0) {
            return res.status(400).json({ message: 'No failed contacts found for this campaign' });
        }

        // 1. Create a new list
        const newList = await prisma.contactList.create({
            data: {
                name: `Recovered: ${campaign.name} (${new Date().toLocaleDateString()})`,
                organizationId: req.user.organizationId,
                createdById: req.user.id
            }
        });

        // 2. Clone contacts into the new list
        const contactData = failedLogs.map(log => ({
            name: log.recipient.name,
            phone: log.recipient.phone,
            email: log.recipient.email,
            language: log.recipient.language,
            city: log.recipient.city,
            listId: newList.id
        }));

        await prisma.laundryContact.createMany({
            data: contactData
        });

        res.json({
            message: 'Failed contacts recovered successfully',
            newListId: newList.id,
            count: contactData.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete a campaign and its logs (CEO/Admin only)
 */
const deleteCampaign = async (req, res) => {
    const { campaignId } = req.params;
    try {
        const campaign = await prisma.whatsAppCampaign.findUnique({
            where: { id: parseInt(campaignId), organizationId: req.user.organizationId }
        });

        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Delete logs first to avoid FK constraints
        await prisma.whatsAppMessageLog.deleteMany({
            where: { campaignId: parseInt(campaignId) }
        });

        await prisma.whatsAppCampaign.delete({
            where: { id: parseInt(campaignId) }
        });

        res.json({ message: 'Campaign and associated logs deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAccounts,
    createAccount,
    deleteAccount,
    testAccountConnection,
    verifyWebhook,
    handleWebhook,
    syncTemplates,
    getTemplates,
    createTemplate,
    createCampaign,
    getCampaigns,
    getValidTemplates,
    sendBroadcast,
    recoverFailedContacts,
    deleteCampaign
};
