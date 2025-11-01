const Credit = require('../models/Credit');
const config = require('../config/credits-config');

exports.getUserCredits = async (req, res) => {
  try {
    const userId = req.user.uid;
    const credits = await Credit.getUserCredits(userId);
    
    console.log(`💰 Getting credits for user: ${userId}, Balance: ${credits}`);
    
    res.json({ 
      credits,
      userId 
    });
  } catch (error) {
    console.error('Error getting user credits:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.purchaseCredits = async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user.uid;
    
    const package = config.subscriptionPlans[packageId];
    if (!package) {
      return res.status(400).json({ error: 'Invalid package' });
    }
    
    console.log(`🛒 Credit purchase - User: ${userId}, Package: ${packageId}, Credits: ${package.credits}`);
    
    // In a real implementation, you'd integrate with Stripe/PayPal here
    // For now, we'll simulate successful payment
    const newBalance = await Credit.addCredits(userId, package.credits, 'purchase');
    
    res.json({ 
      success: true, 
      creditsAdded: package.credits,
      newBalance: newBalance,
      package: packageId
    });
    
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const transactions = await Credit.getTransactionHistory(userId);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: error.message });
  }
};

// Free credits for new users
exports.addFreeCredits = async (req, res) => {
  try {
    const userId = req.user.uid;
    const freeCredits = config.freeTierCredits;
    
    const newBalance = await Credit.addCredits(userId, freeCredits, 'free_tier');
    
    res.json({ 
      success: true, 
      creditsAdded: freeCredits,
      newBalance: newBalance,
      message: 'Free credits added successfully'
    });
  } catch (error) {
    console.error('Error adding free credits:', error);
    res.status(500).json({ error: error.message });
  }
};