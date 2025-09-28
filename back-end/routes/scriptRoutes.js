const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const scriptController = require('../controllers/scriptController');

// Multer for PDF upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Route
router.post('/upload', upload.single('file'), scriptController.processUploadScript);

module.exports = router;
