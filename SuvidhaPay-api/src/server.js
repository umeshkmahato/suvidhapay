import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import config from './config/index.js';
import apiRoutes from './routes/index.js';
import getOpenAPISpec from './docs/openapi.js';
import {
  getScalarHTML,
  getScalarJavaScript,
  scalarContentSecurityPolicy,
} from './docs/scalar.js';

const app = express();

const allowedOrigins = new Set(
  String(config.server.frontendUrl)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

allowedOrigins.forEach((origin) => {
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1';
      allowedOrigins.add(url.origin);
    } else if (url.hostname === '127.0.0.1') {
      url.hostname = 'localhost';
      allowedOrigins.add(url.origin);
    }
  } catch {
    // Ignore malformed configured origins and keep the raw value.
  }
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
if (config.server.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation (OpenAPI & Scalar)
if (config.docs.enabled) {
  // OpenAPI JSON specification endpoint
  app.get('/openapi.json', (req, res) => {
    res.json(getOpenAPISpec());
  });

  app.get('/docs/scalar.js', (req, res) => {
    res.type('application/javascript');
    res.send(getScalarJavaScript());
  });

  // Scalar API Reference UI
  app.get('/docs', async (req, res, next) => {
    try {
      const openApiSpec = getOpenAPISpec();

      res.set('Content-Security-Policy', scalarContentSecurityPolicy);
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Referrer-Policy', 'no-referrer');
      res.type('text/html; charset=utf-8');
      res.send(await getScalarHTML(openApiSpec));
    } catch (error) {
      next(error);
    }
  });
}

// Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.server.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export default app;
