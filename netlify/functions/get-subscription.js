const Stripe = require('stripe');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const user = context.clientContext?.user;
        
        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        // For now, return a free plan - you can implement Stripe customer lookup later
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                status: 'free', 
                plan: 'Free',
                credits: 3
            })
        };
    } catch (error) {
        console.error('Error getting subscription:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};