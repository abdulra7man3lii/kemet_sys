const express = require('express');
const {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    assignHandler,
    unassignHandler,
    getStats,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All customer routes are protected

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/stats', getStats);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);
router.post('/:id/assign', assignHandler);
router.post('/:id/unassign', unassignHandler);

module.exports = router;

module.exports = router;
