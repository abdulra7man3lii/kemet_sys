const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/whatsappController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/rbacMiddleware');

// Webhook (Public endpoints for Meta)
router.get('/webhook', verifyWebhook);
router.post('/webhook', handleWebhook);

router.use(protect);

// Account Management (CEO/SuperAdmin only for modification)
router.get('/accounts', getAccounts);
router.post('/accounts', restrictTo('ORG_ADMIN', 'SUPER_ADMIN'), createAccount);
router.post('/accounts/:id/test', restrictTo('ORG_ADMIN', 'SUPER_ADMIN'), testAccountConnection);
router.post('/accounts/:id/sync', restrictTo('ORG_ADMIN', 'SUPER_ADMIN'), syncTemplates);
router.delete('/accounts/:id', restrictTo('ORG_ADMIN', 'SUPER_ADMIN'), deleteAccount);

// Template Management
router.get('/templates', getTemplates);
router.get('/templates/valid', getValidTemplates);
router.post('/templates', restrictTo('ORG_ADMIN', 'SUPER_ADMIN'), createTemplate);

// Campaign Management (Wizard)
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.post('/campaigns/:campaignId/send', sendBroadcast);
router.post('/campaigns/:campaignId/recovery', recoverFailedContacts);
router.delete('/campaigns/:campaignId', restrictTo('ORG_ADMIN', 'SUPER_ADMIN'), deleteCampaign);


module.exports = router;
