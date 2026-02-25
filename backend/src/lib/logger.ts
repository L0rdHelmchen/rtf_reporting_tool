// RTF Reporting Tool - Logger Configuration
import winston from 'winston';
import { appConfig } from '../config';

// Custom log format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  appConfig.LOG_FORMAT === 'json'
    ? winston.format.json()
    : winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
);

// Create logger instance
export const logger = winston.createLogger({
  level: appConfig.LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'rtf-reporting-tool',
    version: process.env.npm_package_version || '1.0.0',
    environment: appConfig.NODE_ENV
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      )
    })
  ],
  // Handle uncaught exceptions and unhandled rejections
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      )
    })
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      )
    })
  ]
});

// Add file transports in production
if (appConfig.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Audit logger for compliance requirements
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.label({ label: 'AUDIT' })
  ),
  transports: [
    new winston.transports.Console(),
    ...(appConfig.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/audit.log',
            maxsize: 10485760, // 10MB
            maxFiles: 10
          })
        ]
      : [])
  ]
});

// Structured logging helpers
export const loggers = {
  // Authentication events
  auth: {
    login: (userId: string, institutionId: string, success: boolean, ip?: string) => {
      auditLogger.info('User login attempt', {
        event: 'auth.login',
        userId,
        institutionId,
        success,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    logout: (userId: string, institutionId: string) => {
      auditLogger.info('User logout', {
        event: 'auth.logout',
        userId,
        institutionId,
        timestamp: new Date().toISOString()
      });
    },
    tokenRefresh: (userId: string, institutionId: string) => {
      auditLogger.info('Token refresh', {
        event: 'auth.token_refresh',
        userId,
        institutionId,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Form operations
  form: {
    create: (userId: string, institutionId: string, formId: string, formCode: string) => {
      auditLogger.info('Form instance created', {
        event: 'form.create',
        userId,
        institutionId,
        formId,
        formCode,
        timestamp: new Date().toISOString()
      });
    },
    update: (userId: string, institutionId: string, formId: string, formCode: string, fieldsChanged?: string[]) => {
      auditLogger.info('Form instance updated', {
        event: 'form.update',
        userId,
        institutionId,
        formId,
        formCode,
        fieldsChanged,
        timestamp: new Date().toISOString()
      });
    },
    submit: (userId: string, institutionId: string, formId: string, formCode: string, reportingPeriod: string) => {
      auditLogger.info('Form instance submitted', {
        event: 'form.submit',
        userId,
        institutionId,
        formId,
        formCode,
        reportingPeriod,
        timestamp: new Date().toISOString()
      });
    },
    approve: (userId: string, institutionId: string, formId: string, formCode: string, reviewerId: string) => {
      auditLogger.info('Form instance approved', {
        event: 'form.approve',
        userId,
        institutionId,
        formId,
        formCode,
        reviewerId,
        timestamp: new Date().toISOString()
      });
    },
    reject: (userId: string, institutionId: string, formId: string, formCode: string, reviewerId: string, reason?: string) => {
      auditLogger.info('Form instance rejected', {
        event: 'form.reject',
        userId,
        institutionId,
        formId,
        formCode,
        reviewerId,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  },

  // XBRL operations
  xbrl: {
    generate: (userId: string, institutionId: string, formIds: string[], success: boolean, fileName?: string) => {
      auditLogger.info('XBRL document generation', {
        event: 'xbrl.generate',
        userId,
        institutionId,
        formIds,
        success,
        fileName,
        timestamp: new Date().toISOString()
      });
    },
    validate: (userId: string, institutionId: string, fileName: string, success: boolean, errors?: number) => {
      auditLogger.info('XBRL document validation', {
        event: 'xbrl.validate',
        userId,
        institutionId,
        fileName,
        success,
        errors,
        timestamp: new Date().toISOString()
      });
    },
    export: (userId: string, institutionId: string, fileName: string, fileSize: number) => {
      auditLogger.info('XBRL document export', {
        event: 'xbrl.export',
        userId,
        institutionId,
        fileName,
        fileSize,
        timestamp: new Date().toISOString()
      });
    }
  },

  // System operations
  system: {
    startup: (version: string, environment: string) => {
      logger.info('🚀 RTF Reporting Tool starting up', {
        version,
        environment,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      });
    },
    shutdown: (reason: string) => {
      logger.info('🛑 RTF Reporting Tool shutting down', { reason });
    },
    error: (error: Error, context?: Record<string, any>) => {
      logger.error('System error occurred', {
        error: error.message,
        stack: error.stack,
        ...context
      });
    },
    healthCheck: (component: string, status: 'healthy' | 'unhealthy', details?: any) => {
      logger.info('Health check completed', {
        component,
        status,
        details
      });
    }
  },

  // Data access operations
  data: {
    schemaLoad: (schemaPath: string, formsLoaded: number, success: boolean) => {
      logger.info('XBRL schema loading completed', {
        schemaPath,
        formsLoaded,
        success,
        timestamp: new Date().toISOString()
      });
    },
    migration: (migrationName: string, direction: 'up' | 'down', success: boolean) => {
      auditLogger.info('Database migration executed', {
        event: 'data.migration',
        migrationName,
        direction,
        success,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Performance monitoring helpers
export const performanceLogger = {
  startTimer: (label: string): (() => void) => {
    const start = process.hrtime.bigint();
    return () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      logger.debug('Performance metric', {
        label,
        duration: `${duration.toFixed(2)}ms`
      });
    };
  },

  logSlowQuery: (query: string, duration: number, threshold = 1000) => {
    if (duration > threshold) {
      logger.warn('Slow database query detected', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        duration: `${duration}ms`,
        threshold: `${threshold}ms`
      });
    }
  }
};

// Error helpers
export const errorLogger = {
  logApiError: (req: any, error: Error, statusCode?: number) => {
    logger.error('API Error', {
      method: req.method,
      url: req.url,
      statusCode,
      error: error.message,
      stack: error.stack,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  },

  logValidationError: (formCode: string, errors: any[], userId?: string) => {
    logger.warn('Form validation failed', {
      formCode,
      errorCount: errors.length,
      errors: errors.slice(0, 10), // Log first 10 errors
      userId
    });
  }
};

export default logger;