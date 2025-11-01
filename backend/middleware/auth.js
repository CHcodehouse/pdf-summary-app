const { admin } = require('../config/firebase');

const authenticateFirebase = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      // For development, create a mock user if no token
      req.user = { 
        uid: 'demo-user-' + Date.now(),
        email: 'demo@example.com'
      };
      console.log('👤 Using demo user:', req.user.uid);
      return next();
    }

    // Try to verify token, but fallback to demo user if it fails
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      console.log('👤 Authenticated user:', req.user.uid);
    } catch (authError) {
      console.log('⚠️  Auth failed, using demo user:', authError.message);
      req.user = { 
        uid: 'demo-user-' + Date.now(),
        email: 'demo@example.com'
      };
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // For development, continue with mock user
    req.user = { 
      uid: 'demo-user-' + Date.now(),
      email: 'demo@example.com'
    };
    next();
  }
};

module.exports = { authenticateFirebase };