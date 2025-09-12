const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Production Ready
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
    
    // Production: Allow specific domains
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'https://mainkochimetro.netlify.app',
      'https://mainkochimetro.netlify.app/',
      'https://playful-khapse-1b40b2.netlify.app',
      'https://playful-khapse-1b40b2.netlify.app/',
      // Add your production frontend domains here
      'https://your-frontend-domain.netlify.app',
      'https://your-frontend-domain.vercel.app',
      'https://sihkochimetro.vercel.app',
      'https://sihkochimetro.vercel.app/'
    ];
    
    // Allow local network origins
    const isLocalNetwork = /^(http:\/\/)?(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin);
    
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalNetwork) {
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

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
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

