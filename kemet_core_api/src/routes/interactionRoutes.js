const express = require('express');
const {
    createInteraction,
    getInteractionsByCustomer,
    deleteInteraction,
} = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All interaction routes are protected

router.post('/', createInteraction);
router.get('/customer/:id', getInteractionsByCustomer);
router.delete('/:id', deleteInteraction);

module.exports = router;
