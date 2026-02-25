// RTF Reporting Tool - Configuration
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Configuration schema for validation
const ConfigSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().default(3001),
  API_HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_SESSION_PREFIX: z.string().default('rtf:session:'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:3000'),

  // File Upload
  UPLOAD_MAX_FILE_SIZE: z.coerce.number().default(52428800), // 50MB
  UPLOAD_ALLOWED_TYPES: z.string().default('application/xml,text/xml,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),

  // XBRL
  XBRL_SCHEMA_BASE_PATH: z.string().default('../RTF_Validierungsdateien'),
  XBRL_VALIDATE_ON_SUBMIT: z.coerce.boolean().default(true),
  XBRL_NAMESPACE_RTF: z.string().default('http://www.bundesbank.de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RATE_LIMIT_TIME_WINDOW: z.coerce.number().default(900000), // 15 minutes

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_ADDRESS: z.string().email().default('noreply@rtf-tool.local'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  SESSION_SECURE: z.coerce.boolean().default(false),
  SESSION_HTTP_ONLY: z.coerce.boolean().default(true),
  SESSION_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),

  // Feature Flags
  FEATURE_XBRL_VALIDATION: z.coerce.boolean().default(true),
  FEATURE_EMAIL_NOTIFICATIONS: z.coerce.boolean().default(false),
  FEATURE_AUDIT_LOGGING: z.coerce.boolean().default(true)
});

// Validate and parse configuration
let parsedConfig: z.infer<typeof ConfigSchema>;

try {
  parsedConfig = ConfigSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment configuration:', error);
  process.exit(1);
}

export const appConfig = parsedConfig;

// Database connection configuration
export const dbConfig = {
  connectionString: appConfig.DATABASE_URL,
  pool: {
    min: appConfig.DATABASE_POOL_MIN,
    max: appConfig.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  ssl: appConfig.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Redis connection configuration
export const redisConfig = {
  url: appConfig.REDIS_URL,
  prefix: appConfig.REDIS_SESSION_PREFIX,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null
};

// JWT configuration
export const jwtConfig = {
  secret: appConfig.JWT_SECRET,
  expiresIn: appConfig.JWT_EXPIRES_IN,
  refreshExpiresIn: appConfig.JWT_REFRESH_EXPIRES_IN,
  issuer: 'rtf-reporting-tool',
  audience: 'rtf-users'
};

// XBRL configuration
export const xbrlConfig = {
  schemaBasePath: appConfig.XBRL_SCHEMA_BASE_PATH,
  validateOnSubmit: appConfig.XBRL_VALIDATE_ON_SUBMIT,
  namespaceRTF: appConfig.XBRL_NAMESPACE_RTF,
  taxonomyVersion: '2023-12',
  supportedVersions: ['2023-12', '2022-12'] // Backward compatibility
};

// Server configuration
export const serverConfig = {
  host: appConfig.API_HOST,
  port: appConfig.API_PORT,
  logger: {
    level: appConfig.LOG_LEVEL,
    serializers: appConfig.LOG_FORMAT === 'json' ? undefined : {
      req: (req: any) => ({
        method: req.method,
        url: req.url,
        headers: req.headers
      })
    }
  },
  trustProxy: appConfig.NODE_ENV === 'production',
  disableRequestLogging: appConfig.NODE_ENV === 'test'
};

// CORS configuration
export const corsConfig = {
  origin: appConfig.NODE_ENV === 'development'
    ? [appConfig.CORS_ORIGIN, 'http://localhost:3000']
    : [appConfig.CORS_ORIGIN],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Rate limiting configuration
export const rateLimitConfig = {
  max: appConfig.RATE_LIMIT_MAX_REQUESTS,
  timeWindow: appConfig.RATE_LIMIT_TIME_WINDOW,
  skipSuccessfulRequests: false,
  skipOnError: true,
  keyGenerator: (req: any) => {
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }
};

// File upload configuration
export const uploadConfig = {
  limits: {
    fileSize: appConfig.UPLOAD_MAX_FILE_SIZE,
    files: 10,
    parts: 100
  },
  allowedTypes: appConfig.UPLOAD_ALLOWED_TYPES.split(',').map(type => type.trim())
};

// Email configuration
export const emailConfig = {
  enabled: appConfig.FEATURE_EMAIL_NOTIFICATIONS && !!appConfig.SMTP_HOST,
  smtp: {
    host: appConfig.SMTP_HOST,
    port: appConfig.SMTP_PORT,
    secure: appConfig.SMTP_PORT === 465,
    auth: appConfig.SMTP_USER && appConfig.SMTP_PASS ? {
      user: appConfig.SMTP_USER,
      pass: appConfig.SMTP_PASS
    } : undefined
  },
  from: appConfig.SMTP_FROM_ADDRESS
};

// Security configuration
export const securityConfig = {
  bcryptRounds: appConfig.BCRYPT_ROUNDS,
  session: {
    secure: appConfig.SESSION_SECURE,
    httpOnly: appConfig.SESSION_HTTP_ONLY,
    sameSite: appConfig.SESSION_SAME_SITE
  }
};

// Feature flags
export const features = {
  xbrlValidation: appConfig.FEATURE_XBRL_VALIDATION,
  emailNotifications: appConfig.FEATURE_EMAIL_NOTIFICATIONS,
  auditLogging: appConfig.FEATURE_AUDIT_LOGGING
};

// Export environment
export const isDevelopment = appConfig.NODE_ENV === 'development';
export const isProduction = appConfig.NODE_ENV === 'production';
export const isTest = appConfig.NODE_ENV === 'test';