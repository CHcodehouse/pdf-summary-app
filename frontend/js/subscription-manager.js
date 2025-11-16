class SubscriptionManager {
    constructor() {
        this.stripe = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Wait for Firebase auth
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    this.loadStripe();
                    this.loadUserSubscription();
                } else {
                    this.currentUser = null;
                }
            });
        }
    }

    async loadStripe() {
        if (!window.Stripe) {
            await this.loadStripeJS();
        }
        if (STRIPE_CONFIG && STRIPE_CONFIG.publicKey) {
            this.stripe = Stripe(STRIPE_CONFIG.publicKey);
        }
    }

    loadStripeJS() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadUserSubscription() {
        if (!this.currentUser) return;

        try {
            const idToken = await this.currentUser.getIdToken();
            const response = await fetch('/.netlify/functions/get-subscription', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const subscription = await response.json();
                this.updateUIWithSubscription(subscription);
            }
        } catch (error) {
            console.error('Error loading subscription:', error);
        }
    }

    async createSubscription(priceId) {
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
                body: JSON.stringify({ priceId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Subscription creation failed');
            }

            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: data.sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            throw error;
        }
    }

    updateUIWithSubscription(subscription) {
        // Update UI based on subscription status
        const subscriptionElement = document.getElementById('subscription-status');
        const upgradeButton = document.getElementById('upgrade-button');
        
        if (subscription && subscription.status === 'active') {
            if (subscriptionElement) {
                subscriptionElement.textContent = `Active (${subscription.plan?.name || 'Pro'})`;
            }
            if (upgradeButton) {
                upgradeButton.textContent = 'Manage Subscription';
            }
        } else {
            if (subscriptionElement) {
                subscriptionElement.textContent = 'Free Plan';
            }
            if (upgradeButton) {
                upgradeButton.textContent = 'Upgrade';
            }
        }
    }
}

// Initialize subscription manager
const subscriptionManager = new SubscriptionManager();