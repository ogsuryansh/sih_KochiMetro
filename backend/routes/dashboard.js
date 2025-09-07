const express = require('express');
const { getFleetSummary, getAllTrains } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/summary', getFleetSummary);

router.get('/trains', getAllTrains);

module.exports = router;
