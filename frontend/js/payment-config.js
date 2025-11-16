// Stripe configuration
const STRIPE_CONFIG = {
    publicKey: 'pk_test_51SU9zXBtQSWTV3pU8B9c853rpX93LNqOphj4uQL1SISn9Mg84XeUiz0TRaleZ5qRwAlokfnIaax8NramWVyFJPz600IiUQCpVh',
    
    // One-time credit packs (matches your UI)
    creditPacks: {
        PACK_10: {
            name: '10 Credits Pack',
            price: 2.00, // $2.00
            credits: 10,
            priceId: 'price_1SUAk0BtQSWTV3pU3oqhPxFM', // Your existing price ID
            description: 'Perfect for occasional use',
            perCredit: 0.20
        },
        PACK_50: {
            name: '50 Credits Pack',
            price: 8.00, // $8.00
            credits: 50,
            priceId: 'price_1SUAlUBtQSWTV3pU0SxYWQwI', // Your existing price ID
            description: 'Most popular choice',
            perCredit: 0.16
        },
        PACK_100: {
            name: '100 Credits Pack',
            price: 14.00, // $14.00
            credits: 100,
            priceId: 'price_1SUAm3BtQSWTV3pUy6UtuOpD', // Your existing price ID
            description: 'Best value for heavy users',
            perCredit: 0.14
        }
    }
};

// Credit packs configuration (for your UI)
const CREDIT_PACKS = {
    PACK_10: {
        name: '10 Credits',
        price: 2.00,
        credits: 10,
        description: 'Perfect for occasional use',
        perCredit: '$0.20 per credit',
        priceId: 'price_1SUAk0BtQSWTV3pU3oqhPxFM'
    },
    PACK_50: {
        name: '50 Credits',
        price: 8.00,
        credits: 50,
        description: 'Most popular choice',
        perCredit: '$0.16 per credit',
        priceId: 'price_1SUAlUBtQSWTV3pU0SxYWQwI'
    },
    PACK_100: {
        name: '100 Credits',
        price: 14.00,
        credits: 100,
        description: 'Best value for heavy users',
        perCredit: '$0.14 per credit',
        priceId: 'price_1SUAm3BtQSWTV3pUy6UtuOpD'
    }
};

// Utility functions
const PaymentConfig = {
    // Get credit pack by price ID
    getCreditPackByPriceId(priceId) {
        return Object.values(CREDIT_PACKS).find(pack => pack.priceId === priceId);
    },

    // Get credit pack by name
    getCreditPackByName(packName) {
        return CREDIT_PACKS[packName.toUpperCase()];
    },

    // Get all credit packs as array
    getAllCreditPacks() {
        return Object.values(CREDIT_PACKS);
    },

    // Check if Stripe is configured
    isStripeConfigured() {
        return STRIPE_CONFIG.publicKey && STRIPE_CONFIG.publicKey.startsWith('pk_test');
    },

    // Validate price ID
    isValidPriceId(priceId) {
        return Object.values(CREDIT_PACKS).some(pack => pack.priceId === priceId);
    },

    // Get credits from price ID
    getCreditsFromPriceId(priceId) {
        const pack = this.getCreditPackByPriceId(priceId);
        return pack ? pack.credits : 0;
    }
};

// Update subscription manager to handle one-time payments
if (typeof subscriptionManager !== 'undefined') {
    subscriptionManager.createOneTimePayment = async function(priceId) {
        if (!this.currentUser || !this.stripe) {
            throw new Error('User not authenticated or Stripe not loaded');
        }

        try {
            const idToken = await this.currentUser.getIdToken();
            
            const response = await fetch('/.netlify/functions/create-subscription', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    priceId,
                    mode: 'payment' // One-time payment instead of subscription
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment creation failed');
            }

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: data.sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            throw error;
        }
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STRIPE_CONFIG, CREDIT_PACKS, PaymentConfig };
}