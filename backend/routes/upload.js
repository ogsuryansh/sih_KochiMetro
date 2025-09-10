const express = require('express');
const { upload, uploadFile, getUploadInfo } = require('../controllers/uploadController');

const router = express.Router();

// Get upload information and supported formats
router.get('/info', getUploadInfo);

// Upload file endpoint
router.post('/trains', upload.single('file'), uploadFile);

module.exports = router;
