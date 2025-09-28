const express = require('express');
const router = express.Router();
const { evaluateAnswers } = require('../controllers/evaluateController');

// ✅ Define POST /api/evaluate (not /evaluate/evaluate)
router.post('/', evaluateAnswers);

module.exports = router;
