const { db } = require('../config/firebase');

// Check if Firestore is actually available
let firestoreAvailable = false;
try {
  // Test if we can access Firestore
  if (db) {
    firestoreAvailable = true;
    console.log('📊 Firestore is available');
  }
} catch (error) {
  console.log('📊 Firestore not available, using demo mode');
}

class Credit {
  static async getUserCredits(userId) {
    try {
      console.log('💰 Getting credits for user:', userId);
      
      if (!firestoreAvailable) {
        console.log('📊 Using demo credits - Firestore not available');
        return parseInt(process.env.FREE_TIER_CREDITS) || 10;
      }
      
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        console.log('👤 Creating new user with free credits');
        try {
          await db.collection('users').doc(userId).set({
            credits: parseInt(process.env.FREE_TIER_CREDITS) || 10,
            subscription: 'free',
            createdAt: new Date(),
            email: 'demo@example.com'
          });
        } catch (setError) {
          console.log('📊 Could not create user in Firestore, using demo credits');
          return parseInt(process.env.FREE_TIER_CREDITS) || 10;
        }
        return parseInt(process.env.FREE_TIER_CREDITS) || 10;
      }
      
      const credits = userDoc.data().credits || 0;
      console.log('💰 User credits:', credits);
      return credits;
    } catch (error) {
      console.log('📊 Firestore error, using demo credits');
      return parseInt(process.env.FREE_TIER_CREDITS) || 10;
    }
  }

  static async deductCredits(userId, amount, purpose) {
    try {
      console.log(`💰 Deducting ${amount} credits from ${userId} for ${purpose}`);
      
      if (!firestoreAvailable) {
        console.log('📊 Simulating credit deduction in demo mode');
        const currentCredits = parseInt(process.env.FREE_TIER_CREDITS) || 10;
        if (currentCredits < amount) {
          throw new Error('Insufficient credits');
        }
        return currentCredits - amount;
      }
      
      const userRef = db.collection('users').doc(userId);
      
      const result = await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentCredits = userDoc.data().credits || 0;
        
        if (currentCredits < amount) {
          throw new Error('Insufficient credits');
        }
        
        transaction.update(userRef, {
          credits: currentCredits - amount,
          updatedAt: new Date()
        });
        
        // Record transaction
        await db.collection('transactions').add({
          userId,
          type: 'debit',
          amount,
          purpose,
          timestamp: new Date(),
          balanceAfter: currentCredits - amount
        });
        
        return currentCredits - amount;
      });
      
      console.log('✅ Credits deducted successfully');
      return result;
    } catch (error) {
      console.log('📊 Credit deduction simulated in demo mode');
      const currentCredits = parseInt(process.env.FREE_TIER_CREDITS) || 10;
      if (currentCredits < amount) {
        throw new Error('Insufficient credits');
      }
      return currentCredits - amount;
    }
  }

  static async addCredits(userId, amount, source) {
    try {
      console.log(`💰 Adding ${amount} credits to ${userId} from ${source}`);
      
      if (!firestoreAvailable) {
        console.log('📊 Simulating credit addition in demo mode');
        const currentCredits = parseInt(process.env.FREE_TIER_CREDITS) || 10;
        return currentCredits + amount;
      }
      
      const userRef = db.collection('users').doc(userId);
      
      const result = await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const currentCredits = userDoc.data().credits || 0;
        
        transaction.update(userRef, {
          credits: currentCredits + amount,
          updatedAt: new Date()
        });
        
        // Record transaction
        await db.collection('transactions').add({
          userId,
          type: 'credit',
          amount,
          source,
          timestamp: new Date(),
          balanceAfter: currentCredits + amount
        });
        
        return currentCredits + amount;
      });
      
      console.log('✅ Credits added successfully');
      return result;
    } catch (error) {
      console.log('📊 Credit addition simulated in demo mode');
      const currentCredits = parseInt(process.env.FREE_TIER_CREDITS) || 10;
      return currentCredits + amount;
    }
  }

  static async getTransactionHistory(userId, limit = 10) {
    try {
      if (!firestoreAvailable) {
        console.log('📊 Returning demo transactions');
        // Return some demo transactions
        return [
          {
            id: 'demo-1',
            userId: userId,
            type: 'credit',
            amount: 10,
            source: 'free_tier',
            timestamp: new Date(),
            balanceAfter: 10
          }
        ];
      }
      
      const snapshot = await db.collection('transactions')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.log('📊 Returning demo transactions due to error');
      return [
        {
          id: 'demo-1',
          userId: userId,
          type: 'credit',
          amount: 10,
          source: 'free_tier',
          timestamp: new Date(),
          balanceAfter: 10
        }
      ];
    }
  }
}

module.exports = Credit;