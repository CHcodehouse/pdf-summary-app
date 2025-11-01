// Database initialization script
const { db } = require('../config/firebase');

async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Create credit packages collection
    const packages = [
      { id: 'FREE', name: 'Free Tier', credits: 10, price: 0, active: true },
      { id: 'BASIC', name: 'Basic', credits: 100, price: 9.99, active: true },
      { id: 'PRO', name: 'Pro', credits: 500, price: 29.99, active: true },
      { id: 'ENTERPRISE', name: 'Enterprise', credits: 2000, price: 99.99, active: true }
    ];

    for (const pkg of packages) {
      await db.collection('credit_packages').doc(pkg.id).set(pkg);
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

initializeDatabase();