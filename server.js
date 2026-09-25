const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { i18next, middleware: i18nMiddleware } = require('./config/i18n');
const connectDB = require('./config/database');

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = 
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production';
    if (isAllowed) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept-Language', 'lang']
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { status: 'fail', message: 'Too many requests, please try again later' }
});
app.use('/api', globalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// In-line sanitization middleware compatible with Express 5
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  if (req.query) sanitize(req.query);
  next();
});

app.use(hpp({ whitelist: ['category', 'status', 'featured'] }));

app.use(i18nMiddleware.handle(i18next));

connectDB();

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: req.t('general.success'),
    apiVersion: '2.0.0',
    supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'en,ar').split(','),
    endpoints: {
      health: '/api/health',
      admin: '/api/admin',
      categories: '/api/categories',
      projects: '/api/projects',
      enquiries: '/api/enquiries',
      quotes: '/api/quotes'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    language: req.language,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));

app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

app.use(require('./middleware/error'));

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Multilingual support: EN | AR`);
  });
}

module.exports = app;