const Stripe = require('stripe');

exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const { priceId, mode = 'payment' } = JSON.parse(event.body); // Default to one-time payment
        
        // Get user from Firebase token
        const user = context.clientContext?.user;
        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        // Create checkout session (one-time payment)
        const session = await stripe.checkout.sessions.create({
            mode: mode, // 'payment' for one-time, 'subscription' for recurring
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL}/credits`,
            client_reference_id: user.sub,
            metadata: {
                user_id: user.sub,
                payment_type: mode
            }
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ sessionId: session.id })
        };
    } catch (error) {
        console.error('Error creating payment:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};