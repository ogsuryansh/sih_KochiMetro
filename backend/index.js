const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Dynamic and Production Ready
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin, allowing request');
      return callback(null, true);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode - allowing all origins');
      return callback(null, true);
    }
    
    // Add development URLs only in development mode
    const developmentOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ];
    
    // Dynamic CORS configuration
    const allowedOrigins = [
      // Add development origins only in development mode
      ...(process.env.NODE_ENV !== 'production' ? developmentOrigins : []),
      // Add frontend URL from environment variable
      process.env.FRONTEND_URL,
      // Add common Netlify and Vercel patterns
      /^https:\/\/.*\.netlify\.app$/,
      /^https:\/\/.*\.vercel\.app$/,
      // Add any additional origins from environment
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    
    // Allow local network origins
    const isLocalNetwork = /^(http:\/\/)?(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed || isLocalNetwork) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const uploadRoutes = require('./routes/upload');
const mappingRoutes = require('./routes/mapping');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mapping', mappingRoutes);

// Root endpoint for debugging
app.get('/', (req, res) => {
  res.json({ 
    message: 'SIH Kochi Metro Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      ai: '/api/ai',
      upload: '/api/upload',
      mapping: '/api/mapping'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    allowedOrigins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : 'dynamic',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Add a simple test endpoint for CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Catch-all handler for undefined routes (must be last)
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accessible from other devices at: http://YOUR_IP_ADDRESS:${PORT}`);
  console.log('To find your IP address, run: ipconfig (Windows) or ifconfig (Mac/Linux)');
});

