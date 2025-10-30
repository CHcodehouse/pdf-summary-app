let currentUser = null;

console.log('Auth script loaded');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up auth...');
  setupAuth();
});

function setupAuth() {
  // Set up auth state listener
  auth.onAuthStateChanged((user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    currentUser = user;
    updateUI();
  });
}

function updateUI() {
  console.log('Updating UI, current user:', currentUser);
  
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userEmail = document.getElementById('user-email');
  const uploadSection = document.getElementById('upload-section');
  const usageInfo = document.getElementById('usage-info');

  if (currentUser) {
    console.log('User is logged in, showing upload section');
    if (authButtons) authButtons.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userEmail) userEmail.textContent = currentUser.email;
    if (uploadSection) uploadSection.classList.remove('hidden');
    checkUsage();
  } else {
    console.log('No user, showing login button');
    if (authButtons) authButtons.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (uploadSection) uploadSection.classList.add('hidden');
    if (usageInfo) usageInfo.classList.add('hidden');
  }
}

function showLogin() {
  console.log('Show login modal');
  document.getElementById('auth-modal').classList.remove('hidden');
}

function hideAuthModal() {
  console.log('Hide login modal');
  document.getElementById('auth-modal').classList.add('hidden');
  // Clear form fields
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log('Login attempt:', email);

  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('Login successful');
    hideAuthModal();
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed: ' + error.message);
  }
}

async function signup() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log('Signup attempt:', email);

  if (!email || !password) {
    alert('Please enter both email and password');
    return;
  }

  if (password.length < 6) {
    alert('Password should be at least 6 characters');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('Signup successful');
    alert('Account created successfully!');
    hideAuthModal();
  } catch (error) {
    console.error('Signup error:', error);
    alert('Signup failed: ' + error.message);
  }
}

async function logout() {
  console.log('Logout attempt');
  try {
    await auth.signOut();
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

async function checkUsage() {
  if (!currentUser) return;
  
  const usageInfo = document.getElementById('usage-info');
  const usageText = document.getElementById('usage-text');
  
  if (usageInfo && usageText) {
    usageText.textContent = 'You can upload up to 3 PDFs per day.';
    usageInfo.classList.remove('hidden');
  }
}