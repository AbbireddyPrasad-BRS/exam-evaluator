const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { processUpload } = require('../controllers/uploadController');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Correct route with multer and handler
router.post('/', upload.single('pdf'), processUpload);

module.exports = router;
