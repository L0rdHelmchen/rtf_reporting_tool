// RTF Reporting Tool - Health Check Routes
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { db } from '../lib/database';
import { logger } from '../lib/logger';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      details?: any;
    };
    memory: {
      status: 'healthy' | 'unhealthy';
      details: {
        used: string;
        total: string;
        percentage: number;
      };
    };
  };
}

export default async function healthRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Basic health check - returns 200 if service is running
  fastify.get('/ping', {
    schema: {
      tags: ['Health'],
      summary: 'Basic health check',
      description: 'Returns pong if service is running',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async () => {
    return {
      message: 'pong',
      timestamp: new Date().toISOString()
    };
  });

  // Detailed health check - includes database and system checks
  fastify.get('/check', {
    schema: {
      tags: ['Health'],
      summary: 'Comprehensive health check',
      description: 'Returns detailed system health status including database connectivity',
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
            timestamp: { type: 'string' },
            version: { type: 'string' },
            environment: { type: 'string' },
            uptime: { type: 'number' },
            checks: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                    details: { type: 'object' }
                  }
                },
                memory: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'unhealthy'] },
                    details: {
                      type: 'object',
                      properties: {
                        used: { type: 'string' },
                        total: { type: 'string' },
                        percentage: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            checks: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const startTime = Date.now();

    try {
      // Check database health
      const dbHealth = await db.healthCheck();

      // Check memory usage
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal + memUsage.external + memUsage.arrayBuffers;
      const usedMem = memUsage.heapUsed;
      const memPercentage = (usedMem / totalMem) * 100;

      const memoryHealth = {
        status: memPercentage > 90 ? 'unhealthy' as const : 'healthy' as const,
        details: {
          used: `${Math.round(usedMem / 1024 / 1024)}MB`,
          total: `${Math.round(totalMem / 1024 / 1024)}MB`,
          percentage: Math.round(memPercentage * 100) / 100
        }
      };

      // Determine overall status
      let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

      if (dbHealth.status === 'unhealthy' || memoryHealth.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (dbHealth.status === 'unhealthy' || memoryHealth.status === 'unhealthy') {
        overallStatus = 'degraded';
      }

      const response: HealthCheckResponse = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        checks: {
          database: {
            status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
            details: dbHealth.details
          },
          memory: memoryHealth
        }
      };

      const checkDuration = Date.now() - startTime;

      logger.debug('Health check completed', {
        status: overallStatus,
        duration: `${checkDuration}ms`,
        database: dbHealth.status,
        memory: memoryHealth.status
      });

      if (overallStatus === 'unhealthy') {
        reply.status(503);
      }

      return response;

    } catch (error) {
      const errorResponse = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor(process.uptime()),
        checks: {
          database: {
            status: 'unhealthy' as const,
            details: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          },
          memory: {
            status: 'healthy' as const,
            details: {
              used: 'N/A',
              total: 'N/A',
              percentage: 0
            }
          }
        }
      };

      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${Date.now() - startTime}ms`
      });

      reply.status(503);
      return errorResponse;
    }
  });

  // Readiness check - for Kubernetes readiness probe
  fastify.get('/ready', {
    schema: {
      tags: ['Health'],
      summary: 'Readiness check',
      description: 'Returns 200 when service is ready to accept traffic (database connected)',
      response: {
        200: {
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
            timestamp: { type: 'string' }
          }
        },
        503: {
          type: 'object',
          properties: {
            ready: { type: 'boolean' },
            timestamp: { type: 'string' },
            reason: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      if (!db.isHealthy) {
        reply.status(503);
        return {
          ready: false,
          timestamp: new Date().toISOString(),
          reason: 'Database not connected'
        };
      }

      return {
        ready: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      reply.status(503);
      return {
        ready: false,
        timestamp: new Date().toISOString(),
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Liveness check - for Kubernetes liveness probe
  fastify.get('/live', {
    schema: {
      tags: ['Health'],
      summary: 'Liveness check',
      description: 'Returns 200 if service process is alive',
      response: {
        200: {
          type: 'object',
          properties: {
            alive: { type: 'boolean' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' }
          }
        }
      }
    }
  }, async () => {
    return {
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    };
  });
}