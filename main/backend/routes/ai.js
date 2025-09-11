const express = require('express');
const { runAIOptimization, runPlanning } = require('../controllers/aiController');

const router = express.Router();

router.post('/optimize', runAIOptimization);
router.post('/plan/run', runPlanning);

module.exports = router;
