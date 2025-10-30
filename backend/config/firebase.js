const admin = require('firebase-admin');
require('dotenv').config();

// For development without service account
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

module.exports = { admin, db };