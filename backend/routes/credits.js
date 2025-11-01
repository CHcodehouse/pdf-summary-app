const express = require('express');
const router = express.Router();
const { authenticateFirebase } = require('../middleware/auth');

// Basic credit endpoints with better demo handling
router.get('/balance', authenticateFirebase, async (req, res) => {
  try {
    const Credit = require('../models/Credit');
    const credits = await Credit.getUserCredits(req.user.uid);
    res.json({ 
      credits, 
      userId: req.user.uid,
      message: credits === 10 ? 'Using demo credits (10 free credits)' : 'Credits loaded successfully'
    });
  } catch (error) {
    console.log('Balance endpoint using fallback credits');
    res.json({ 
      credits: 10, 
      userId: req.user.uid, 
      message: 'Using fallback demo credits' 
    });
  }
});

router.post('/purchase', authenticateFirebase, async (req, res) => {
  try {
    const { packageId } = req.body;
    const packages = {
      FREE: { credits: 10, price: 0 },
      BASIC: { credits: 100, price: 9.99 },
      PRO: { credits: 500, price: 29.99 },
      ENTERPRISE: { credits: 2000, price: 99.99 }
    };
    
    const package = packages[packageId];
    if (!package) {
      return res.status(400).json({ error: 'Invalid package' });
    }
    
    const Credit = require('../models/Credit');
    const newBalance = await Credit.addCredits(req.user.uid, package.credits, 'purchase');
    
    res.json({ 
      success: true, 
      creditsAdded: package.credits,
      newBalance: newBalance,
      package: packageId,
      message: newBalance > 1000 ? 'Demo purchase - credits simulated' : 'Credits added successfully'
    });
    
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Purchase failed'
    });
  }
});

router.get('/transactions', authenticateFirebase, async (req, res) => {
  try {
    const Credit = require('../models/Credit');
    const transactions = await Credit.getTransactionHistory(req.user.uid);
    
    res.json({ 
      transactions,
      message: transactions.length > 0 ? 'Transactions loaded' : 'No transactions yet'
    });
    
  } catch (error) {
    console.error('Transactions error:', error);
    res.json({ 
      transactions: [],
      message: 'Using demo transaction data'
    });
  }
});

router.post('/free', authenticateFirebase, async (req, res) => {
  try {
    const freeCredits = parseInt(process.env.FREE_TIER_CREDITS) || 10;
    const Credit = require('../models/Credit');
    const newBalance = await Credit.addCredits(req.user.uid, freeCredits, 'free_tier');
    
    res.json({ 
      success: true, 
      creditsAdded: freeCredits,
      newBalance: newBalance,
      message: 'Free credits added successfully'
    });
    
  } catch (error) {
    console.error('Free credits error:', error);
    res.status(500).json({ 
      error: error.message,
      message: 'Failed to add free credits'
    });
  }
});

module.exports = router;