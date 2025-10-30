// Working Mock Firebase Authentication
console.log('Loading Firebase mock authentication...');

const mockAuth = {
  currentUser: null,
  authStateCallbacks: [],
  
  onAuthStateChanged: function(callback) {
    this.authStateCallbacks.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    return () => {
      this.authStateCallbacks = this.authStateCallbacks.filter(cb => cb !== callback);
    };
  },
  
  signInWithEmailAndPassword: function(email, password) {
    return new Promise((resolve, reject) => {
      console.log('Mock login attempt:', email);
      
      if (!email || !password) {
        reject(new Error('Email and password are required'));
        return;
      }
      
      if (password.length < 6) {
        reject(new Error('Password should be at least 6 characters'));
        return;
      }
      
      // Simulate API delay
      setTimeout(() => {
        this.currentUser = { 
          email: email, 
          uid: 'mock-user-' + Date.now(),
          getIdToken: () => Promise.resolve('mock-token-' + Date.now())
        };
        
        // Notify all auth state callbacks
        this.authStateCallbacks.forEach(callback => callback(this.currentUser));
        
        console.log('Mock login successful:', email);
        resolve({ user: this.currentUser });
      }, 1000);
    });
  },
  
  createUserWithEmailAndPassword: function(email, password) {
    return new Promise((resolve, reject) => {
      console.log('Mock signup attempt:', email);
      
      if (!email || !password) {
        reject(new Error('Email and password are required'));
        return;
      }
      
      if (password.length < 6) {
        reject(new Error('Password should be at least 6 characters'));
        return;
      }
      
      if (!email.includes('@')) {
        reject(new Error('Invalid email address'));
        return;
      }
      
      // Simulate API delay
      setTimeout(() => {
        this.currentUser = { 
          email: email, 
          uid: 'mock-user-' + Date.now(),
          getIdToken: () => Promise.resolve('mock-token-' + Date.now())
        };
        
        // Notify all auth state callbacks
        this.authStateCallbacks.forEach(callback => callback(this.currentUser));
        
        console.log('Mock signup successful:', email);
        resolve({ user: this.currentUser });
      }, 1000);
    });
  },
  
  signOut: function() {
    return new Promise((resolve) => {
      console.log('Mock logout');
      this.currentUser = null;
      
      // Notify all auth state callbacks
      this.authStateCallbacks.forEach(callback => callback(null));
      
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
};

// Global auth object
const auth = mockAuth;

console.log('Mock authentication loaded successfully');

// Initialize UI after page load
setTimeout(() => {
  console.log('Initializing auth UI...');
  if (typeof updateUI === 'function') {
    updateUI();
  }
}, 100);