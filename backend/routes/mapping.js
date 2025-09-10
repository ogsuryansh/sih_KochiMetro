const express = require('express');
const { previewFile, applyMapping, getFieldTypes } = require('../controllers/mappingController');

const router = express.Router();

// Get field types and their descriptions
router.get('/field-types', getFieldTypes);

// Preview file and suggest mappings
router.post('/preview', previewFile);

// Apply custom field mapping
router.post('/apply', applyMapping);

module.exports = router;
