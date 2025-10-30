const express = require('express');
const multer = require('multer');
const { authenticateFirebase } = require('../middleware/auth');
const { summarizePDF } = require('../controllers/summaryController');

const router = express.Router();

// Multer configuration with better error handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Error handling for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  res.status(400).json({ error: error.message });
};

router.post('/summarize', authenticateFirebase, upload.single('pdf'), summarizePDF, handleMulterError);

// Usage route
router.get('/usage', authenticateFirebase, async (req, res) => {
  try {
    res.json({
      summariesToday: 0,
      subscription: 'free',
      limit: 3
    });
  } catch (error) {
    console.error('Usage error:', error);
    res.json({
      summariesToday: 0,
      subscription: 'free', 
      limit: 3
    });
  }
});

module.exports = router;