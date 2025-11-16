// Netlify Function to cancel subscription
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { subscriptionId } = JSON.parse(event.body);

    if (!subscriptionId) {
      throw new Error('Subscription ID is required');
    }

    // Cancel the subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return {
      statusCode: 200,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({
        success: true,
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status,
          cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
          currentPeriodEnd: canceledSubscription.current_period_end
        }
      })
    };

  } catch (error) {
    console.error('Cancel subscription failed:', error);
    return {
      statusCode: 400,
      headers: {'Access-Control-Allow-Origin': '*'},
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};