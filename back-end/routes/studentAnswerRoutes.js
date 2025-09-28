const express = require('express');
const router = express.Router();

const {
  getStudentAnswers,
  getUploadHistoryByFaculty
} = require('../controllers/studentAnswerController');

// ✅ FIRST define the specific route
router.get('/history/by-faculty', getUploadHistoryByFaculty);

// ✅ THEN the dynamic route
router.get('/:rollNumber', getStudentAnswers);

module.exports = router;
