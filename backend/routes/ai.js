const express = require('express');
const { runAIOptimization } = require('../controllers/aiController');

const router = express.Router();

router.post('/optimize', runAIOptimization);

module.exports = router;
