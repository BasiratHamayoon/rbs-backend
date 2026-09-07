const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'http://localhost:3002',  
  'https://yourdomain.com', 
  'https://www.yourdomain.com',
  process.env.CLIENT_URL
].filter(Boolean);

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Root Route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'RBS Backend API is up and running!',
    endpoints: {
      health: '/api/health',
      admin: '/api/admin',
      projects: '/api/projects',
      enquiries: '/api/enquiries',
      quotes: '/api/quotes'
    }
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running successfully',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));

// Error Handling Middleware
app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;