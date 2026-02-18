const express = require('express');
const router = express.Router();
const multer = require('multer');
const { previewImport, processImport } = require('../controllers/importController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/rbacMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Protect all import routes
router.use(protect);
router.use(restrictTo('ORG_ADMIN', 'SUPER_ADMIN'));

router.post('/preview', upload.single('file'), previewImport);
router.post('/process', upload.single('file'), processImport);

module.exports = router;
