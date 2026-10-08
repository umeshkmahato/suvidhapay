import './env.js';

export default {
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'suvidhapay',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key',
    expiresIn: process.env.JWT_EXPIRY || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '30d',
  },
  server: {
    port: Number.parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || './logs',
  },
  docs: {
    enabled: process.env.ENABLE_API_DOCS === 'true',
    baseUrl: process.env.API_BASE_URL || `http://localhost:${Number.parseInt(process.env.PORT, 10) || 3001}`,
  },
};
