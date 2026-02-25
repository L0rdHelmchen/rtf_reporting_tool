// RTF Reporting Tool - Main Server
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { serverConfig, corsConfig, rateLimitConfig, jwtConfig, uploadConfig, isProduction } from './config';
import { logger, loggers } from './lib/logger';
import { db } from './lib/database';

// Import route handlers
import authRoutes from './routes/auth';
import formRoutes from './routes/forms';
import xbrlRoutes from './routes/xbrl';
import institutionRoutes from './routes/institutions';
import userRoutes from './routes/users';
import healthRoutes from './routes/health';

// Create Fastify instance
const server = Fastify({
  logger: serverConfig.logger,
  trustProxy: serverConfig.trustProxy,
  disableRequestLogging: serverConfig.disableRequestLogging
});

// Global error handler
server.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  const errorMessage = error.message || 'Internal Server Error';

  // Log error
  logger.error('Request error', {
    method: request.method,
    url: request.url,
    statusCode,
    error: errorMessage,
    stack: error.stack,
    userAgent: request.headers['user-agent'],
    ip: request.ip
  });

  // Send appropriate response
  reply.status(statusCode).send({
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: isProduction ? 'Internal Server Error' : errorMessage,
      statusCode,
      timestamp: new Date().toISOString()
    }
  });
});

// Not found handler
server.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      statusCode: 404,
      timestamp: new Date().toISOString()
    }
  });
});

async function buildServer() {
  try {
    // Security middleware
    await server.register(helmet, {
      contentSecurityPolicy: false // Allow Swagger UI
    });

    // CORS middleware
    await server.register(cors, corsConfig);

    // Rate limiting
    await server.register(rateLimit, rateLimitConfig);

    // File upload support
    await server.register(multipart, {
      limits: uploadConfig.limits,
      attachFieldsToBody: true
    });

    // JWT authentication
    await server.register(jwt, {
      secret: jwtConfig.secret,
      sign: {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
        expiresIn: jwtConfig.expiresIn
      },
      verify: {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      }
    });

    // Swagger documentation (only in development)
    if (!isProduction) {
      await server.register(swagger, {
        swagger: {
          info: {
            title: 'RTF Reporting Tool API',
            description: 'Deutsche Bundesbank RTF (Risk-Bearing Capacity) Reporting API',
            version: '1.0.0'
          },
          host: `${serverConfig.host}:${serverConfig.port}`,
          schemes: ['http', 'https'],
          consumes: ['application/json', 'multipart/form-data'],
          produces: ['application/json', 'application/xml'],
          securityDefinitions: {
            Bearer: {
              type: 'apiKey',
              name: 'Authorization',
              in: 'header',
              description: 'JWT token for authentication'
            }
          }
        }
      });

      await server.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
          docExpansion: 'list',
          deepLinking: false
        }
      });
    }

    // Authentication middleware
    server.decorate('authenticate', async (request: any, reply: any) => {
      try {
        const token = await request.jwtVerify();
        request.user = token;
      } catch (err) {
        reply.status(401).send({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing authentication token',
            statusCode: 401,
            timestamp: new Date().toISOString()
          }
        });
      }
    });

    // User context middleware (for database RLS)
    server.addHook('preHandler', async (request: any) => {
      if (request.user?.id) {
        // Set user context for Row Level Security
        const client = await db.getClient();
        try {
          await db.setUserContext(client, request.user.id);
        } finally {
          client.release();
        }
      }
    });

    // Request logging middleware
    server.addHook('onRequest', async (request) => {
      logger.debug('Incoming request', {
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip
      });
    });

    // Response time middleware
    server.addHook('onResponse', async (request, reply) => {
      const responseTime = reply.getResponseTime();
      logger.debug('Request completed', {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: `${responseTime.toFixed(2)}ms`
      });
    });

    // Register routes
    await server.register(healthRoutes, { prefix: '/health' });
    await server.register(authRoutes, { prefix: '/api/v1/auth' });
    await server.register(formRoutes, { prefix: '/api/v1/forms' });
    await server.register(xbrlRoutes, { prefix: '/api/v1/xbrl' });
    await server.register(institutionRoutes, { prefix: '/api/v1/institutions' });
    await server.register(userRoutes, { prefix: '/api/v1/users' });

    // Root endpoint
    server.get('/', async () => {
      return {
        name: 'RTF Reporting Tool API',
        version: '1.0.0',
        description: 'Deutsche Bundesbank RTF (Risk-Bearing Capacity) Reporting API',
        environment: serverConfig.logger.level,
        timestamp: new Date().toISOString(),
        docs: isProduction ? undefined : `http://${serverConfig.host}:${serverConfig.port}/docs`
      };
    });

    return server;
  } catch (error) {
    logger.error('Error building server', error);
    throw error;
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  loggers.system.shutdown(`Received ${signal}`);

  try {
    // Close server
    await server.close();
    logger.info('✅ Server closed successfully');

    // Close database connection
    await db.disconnect();

    // Exit process
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown', error);
    process.exit(1);
  }
}

// Start server
async function start() {
  try {
    // Log startup
    loggers.system.startup('1.0.0', process.env.NODE_ENV || 'development');

    // Connect to database
    await db.connect();

    // Build and start server
    const app = await buildServer();
    await app.listen({
      host: serverConfig.host,
      port: serverConfig.port
    });

    logger.info(`🚀 RTF Reporting Tool API is running on http://${serverConfig.host}:${serverConfig.port}`);

    if (!isProduction) {
      logger.info(`📚 API Documentation available at http://${serverConfig.host}:${serverConfig.port}/docs`);
    }

  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
if (require.main === module) {
  start();
}

export { buildServer, server };
export default server;