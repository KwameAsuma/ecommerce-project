const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

// Define routes
router.get('/:userId', financeController.getFinances);
router.post('/:userId/withdraw', financeController.withdrawFunds);

module.exports = router;
