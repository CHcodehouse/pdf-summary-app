const { admin } = require('../config/firebase');

const authenticateFirebase = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      // For development, create a mock user if no token
      req.user = { uid: 'demo-user-' + Date.now() };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // For development, continue with mock user
    req.user = { uid: 'demo-user-' + Date.now() };
    next();
  }
};

module.exports = { authenticateFirebase };