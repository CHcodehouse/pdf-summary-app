const admin = require('firebase-admin');
require('dotenv').config();

// For development - use Firestore emulator or simple initialization
if (!admin.apps.length) {
  try {
    console.log('🔐 Initializing Firebase...');
    
    // Check if we're in development mode and use emulator if available
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode - using simplified Firebase setup');
      
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'pdf-summary-demo',
      });
      
      // Use Firestore emulator if available, otherwise use regular Firestore
      const db = admin.firestore();
      
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        db.settings({
          host: process.env.FIRESTORE_EMULATOR_HOST,
          ssl: false
        });
        console.log('📊 Using Firestore emulator');
      } else {
        console.log('📊 Using Cloud Firestore (no emulator)');
      }
      
    } else {
      // Production initialization
      if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
        console.log('✅ Firebase initialized with service account');
      } else {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log('⚠️ Firebase initialized without service account');
      }
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    // Ultimate fallback
    admin.initializeApp({
      projectId: 'pdf-summary-demo-' + Date.now(),
    });
    console.log('🔧 Using ultimate fallback Firebase setup');
  }
}

const db = admin.firestore();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true
});

console.log('📊 Firestore database ready');

module.exports = { admin, db };