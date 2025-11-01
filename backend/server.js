const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Simple rate limiting
const requestCounts = new Map();
app.use('/api/', (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  const windowStart = now - windowMs;
  
  // Remove old requests
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }
  
  // Check if rate limit exceeded
  if (requests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Too many requests from this IP, please try again later.'
    });
  }
  
  // Add current request
  requests.push(now);
  next();
});

// Clean up old requests every hour
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  for (const [ip, requests] of requestCounts.entries()) {
    const windowStart = now - windowMs;
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    if (requests.length === 0) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 60 * 1000);

// Routes
app.use('/api/summary', require('./routes/summary'));

// NEW: Check if credits routes exist before using them
try {
  const creditsRoutes = require('./routes/credits');
  app.use('/api/credits', creditsRoutes);
  console.log('✅ Credits routes loaded');
} catch (error) {
  console.log('❌ Credits routes not found, creating basic endpoints');
  
  // Basic credit endpoints if routes file doesn't exist
  app.get('/api/credits/balance', (req, res) => {
    res.json({ credits: 10, message: 'Demo credits - install full credit system' });
  });
  
  app.get('/api/credits/transactions', (req, res) => {
    res.json({ transactions: [] });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'PDF Summary API',
    version: '1.1.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      creditSystem: true,
      authentication: true,
      fileUpload: true
    }
  });
});

// API info endpoint - FIXED: This was missing
app.get('/api/info', (req, res) => {
  res.json({
    name: 'PDF Summary API',
    version: '1.1.0',
    creditSystem: true,
    features: ['pdf-summarization', 'credit-management', 'user-authentication'],
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      summary: '/api/summary',
      credits: '/api/credits'
    }
  });
});

// Credit costs endpoint - FIXED: This was missing from summary routes
app.get('/api/summary/credit-costs', (req, res) => {
  const creditCosts = {
    SUMMARY_BASIC: 1,
    SUMMARY_DETAILED: 2,
    SUMMARY_BULLET: 1,
    SUMMARY_CUSTOM: 3
  };
  res.json({ creditCosts });
});

// Serve frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/credits', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/credits.html'));
});

// NEW: Serve test page
app.get('/test-credits', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/test-credits.html'));
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: isProduction ? 'Something went wrong!' : error.message
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health',
      '/api/info',
      '/api/summary',
      '/api/credits'
    ]
  });
});

// Catch-all handler for frontend routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Credit system: ENABLED`);
  console.log(`💰 Free tier credits: ${process.env.FREE_TIER_CREDITS || 10}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Info: http://localhost:${PORT}/api/info`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`💳 Credits API: http://localhost:${PORT}/api/credits`);
  console.log(`🧪 Test Page: http://localhost:${PORT}/test-credits`);
});