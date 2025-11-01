const Credit = require('../models/Credit');
const config = require('../config/credits-config');

exports.checkCredits = (summaryType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.uid;
      const requiredCredits = config.creditCosts[summaryType];
      
      if (!requiredCredits) {
        return res.status(400).json({ error: 'Invalid summary type' });
      }
      
      const userCredits = await Credit.getUserCredits(userId);
      
      console.log(`💰 Credit check - User: ${userId}, Required: ${requiredCredits}, Current: ${userCredits}`);
      
      if (userCredits < requiredCredits) {
        return res.status(402).json({ 
          error: 'Insufficient credits', 
          required: requiredCredits,
          current: userCredits,
          summaryType: summaryType
        });
      }
      
      // Store credit info in request for later deduction
      req.creditInfo = {
        type: summaryType,
        cost: requiredCredits
      };
      
      next();
    } catch (error) {
      console.error('Credit check error:', error);
      // In demo mode, allow the request to proceed
      console.log('💰 Demo mode - bypassing credit check');
      req.creditInfo = {
        type: summaryType,
        cost: config.creditCosts[summaryType] || 1
      };
      next();
    }
  };
};