// Stripe configuration
const STRIPE_CONFIG = {
    publicKey: 'pk_test_your_public_key_here',
    basicPriceId: 'price_basic_monthly',
    proPriceId: 'price_pro_monthly',
    enterprisePriceId: 'price_enterprise_monthly'
};

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
    BASIC: {
        name: 'Basic',
        price: 9.99,
        credits: 10,
        features: ['10 PDF summaries per month', 'Basic summary types', 'Email support']
    },
    PRO: {
        name: 'Pro',
        price: 19.99,
        credits: 30,
        features: ['30 PDF summaries per month', 'All summary types', 'Priority support', 'Export options']
    },
    ENTERPRISE: {
        name: 'Enterprise',
        price: 49.99,
        credits: 100,
        features: ['100 PDF summaries per month', 'All summary types', 'Priority support', 'Advanced export options', 'Custom templates']
    }
};