require('dotenv').config();

module.exports = {
  creditCosts: {
    SUMMARY_BASIC: parseInt(process.env.CREDIT_COST_BASIC) || 1,
    SUMMARY_DETAILED: parseInt(process.env.CREDIT_COST_DETAILED) || 2,
    SUMMARY_BULLET: parseInt(process.env.CREDIT_COST_BULLET) || 1,
    SUMMARY_CUSTOM: parseInt(process.env.CREDIT_COST_CUSTOM) || 3
  },
  subscriptionPlans: {
    FREE: { 
      credits: parseInt(process.env.FREE_TIER_CREDITS) || 10, 
      price: 0 
    },
    BASIC: { 
      credits: 100, 
      price: 9.99 
    },
    PRO: { 
      credits: 500, 
      price: 29.99 
    },
    ENTERPRISE: { 
      credits: 2000, 
      price: 99.99 
    }
  },
  freeTierCredits: parseInt(process.env.FREE_TIER_CREDITS) || 10
};