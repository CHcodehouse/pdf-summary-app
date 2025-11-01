const express = require('express');
const multer = require('multer');
const { authenticateFirebase } = require('../middleware/auth');
const { summarizePDF } = require('../controllers/summaryController');
const { checkCredits } = require('../middleware/creditCheck');

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

// Credit-based summarize routes with different credit costs
router.post('/summarize/basic', authenticateFirebase, upload.single('pdf'), checkCredits('SUMMARY_BASIC'), summarizePDF, handleMulterError);
router.post('/summarize/detailed', authenticateFirebase, upload.single('pdf'), checkCredits('SUMMARY_DETAILED'), summarizePDF, handleMulterError);
router.post('/summarize/bullet', authenticateFirebase, upload.single('pdf'), checkCredits('SUMMARY_BULLET'), summarizePDF, handleMulterError);
router.post('/summarize/custom', authenticateFirebase, upload.single('pdf'), checkCredits('SUMMARY_CUSTOM'), summarizePDF, handleMulterError);

// Keep legacy route for backward compatibility (uses basic credits)
router.post('/summarize', authenticateFirebase, upload.single('pdf'), checkCredits('SUMMARY_BASIC'), summarizePDF, handleMulterError);

// Get credit costs for different summary types
router.get('/credit-costs', authenticateFirebase, (req, res) => {
  const config = require('../config/credits-config');
  res.json({ creditCosts: config.creditCosts });
});

// Usage route to include credits
router.get('/usage', authenticateFirebase, async (req, res) => {
  try {
    let credits = 10;
    let subscription = 'free';
    
    // Try to get credits, but fallback to demo if it fails
    try {
      const Credit = require('../models/Credit');
      credits = await Credit.getUserCredits(req.user.uid);
      
      // Get user data for subscription info
      const { db } = require('../config/firebase');
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      if (userDoc.exists) {
        subscription = userDoc.data().subscription || 'free';
      }
    } catch (error) {
      console.log('Usage endpoint using demo data');
      // Use demo data if Credit system fails
    }
    
    res.json({
      credits: credits,
      subscription: subscription,
      summariesToday: 0,
      limit: 'credit_based'
    });
  } catch (error) {
    console.error('Usage error:', error);
    res.json({
      credits: 10,
      subscription: 'free', 
      summariesToday: 0,
      limit: 3
    });
  }
});

module.exports = router;