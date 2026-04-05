// RTF Reporting Tool - Authentication Routes
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import bcrypt from 'bcryptjs';
import { LoginRequest, LoginResponse, schemas } from '@rtf-tool/shared';
import { db } from '../lib/database';
import { logger, loggers } from '../lib/logger';
import { jwtConfig } from '../config';

export default async function authRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Login endpoint
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'User login',
      description: 'Authenticate user with username/email and password',
      body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            description: 'Username or email address',
            minLength: 3,
            maxLength: 100
          },
          password: {
            type: 'string',
            description: 'User password',
            minLength: 6,
            maxLength: 128
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                institutionId: { type: 'string' }
              }
            },
            institution: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                bik: { type: 'string' },
                instituteType: { type: 'string' },
                isConsolidatedReporting: { type: 'boolean' },
                accountingStandard: { type: 'string' }
              }
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Validate request body
      const loginData = LoginRequest.parse(request.body);

      // Query user by username or email
      const userQuery = `
        SELECT
          u.id,
          u.institution_id,
          u.username,
          u.email,
          u.password_hash,
          u.first_name,
          u.last_name,
          u.role,
          u.is_active,
          i.id as inst_id,
          i.name as inst_name,
          i.bik as inst_bik,
          i.institute_type as inst_type,
          i.is_consolidated_reporting as inst_consolidated,
          i.accounting_standard as inst_accounting_standard,
          i.active as inst_active
        FROM users u
        JOIN institutions i ON u.institution_id = i.id
        WHERE (u.username = $1 OR u.email = $1)
          AND u.is_active = true
          AND i.active = true
      `;

      const userResult = await db.query(userQuery, [loginData.username]);

      if (userResult.rows.length === 0) {
        // Log failed login attempt
        loggers.auth.login('unknown', 'unknown', false, request.ip);

        reply.status(401);
        return {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        };
      }

      const userRow = userResult.rows[0];

      // Verify password
      const passwordValid = await bcrypt.compare(loginData.password, userRow.password_hash);

      if (!passwordValid) {
        // Log failed login attempt
        loggers.auth.login(userRow.id, userRow.institution_id, false, request.ip);

        reply.status(401);
        return {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        };
      }

      // Update last login
      await db.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1',
        [userRow.id]
      );

      // Create JWT tokens
      const tokenPayload = {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        role: userRow.role,
        institutionId: userRow.institution_id
      };

      const accessToken = fastify.jwt.sign(
        tokenPayload,
        { expiresIn: jwtConfig.expiresIn }
      );

      const refreshToken = fastify.jwt.sign(
        { id: userRow.id, type: 'refresh' },
        { expiresIn: jwtConfig.refreshExpiresIn }
      );

      // Prepare response
      const response: LoginResponse = {
        user: {
          id: userRow.id,
          institutionId: userRow.institution_id,
          username: userRow.username,
          email: userRow.email,
          firstName: userRow.first_name,
          lastName: userRow.last_name,
          role: userRow.role,
          isActive: userRow.is_active,
          lastLogin: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        institution: {
          id: userRow.inst_id,
          name: userRow.inst_name,
          bik: userRow.inst_bik,
          instituteType: userRow.inst_type,
          exemptionCategory: 'none',
          isConsolidatedReporting: userRow.inst_consolidated === true || userRow.inst_consolidated === 't',
          accountingStandard: userRow.inst_accounting_standard ?? 'hgb',
          addressCountry: 'DE',
          active: userRow.inst_active,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        accessToken,
        refreshToken,
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      };

      // Log successful login
      loggers.auth.login(userRow.id, userRow.institution_id, true, request.ip);

      logger.info('User login successful', {
        userId: userRow.id,
        username: userRow.username,
        institutionId: userRow.institution_id,
        ip: request.ip
      });

      return response;

    } catch (error) {
      logger.error('Login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.ip
      });

      if (error instanceof Error && error.name === 'ZodError') {
        reply.status(400);
        return {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request format'
          }
        };
      }

      reply.status(500);
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during login'
        }
      };
    }
  });

  // Refresh token endpoint
  fastify.post('/refresh', {
    schema: {
      tags: ['Authentication'],
      summary: 'Refresh access token',
      description: 'Get a new access token using refresh token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            expiresIn: { type: 'number' }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      // Verify refresh token
      const decoded = fastify.jwt.verify(refreshToken) as any;

      if (decoded.type !== 'refresh') {
        reply.status(401);
        return {
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid refresh token'
          }
        };
      }

      // Get user info for new token
      const userQuery = `
        SELECT id, username, email, role, institution_id, is_active
        FROM users
        WHERE id = $1 AND is_active = true
      `;

      const userResult = await db.query(userQuery, [decoded.id]);

      if (userResult.rows.length === 0) {
        reply.status(401);
        return {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found or inactive'
          }
        };
      }

      const user = userResult.rows[0];

      // Generate new access token
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        institutionId: user.institution_id
      };

      const accessToken = fastify.jwt.sign(
        tokenPayload,
        { expiresIn: jwtConfig.expiresIn }
      );

      // Log token refresh
      loggers.auth.tokenRefresh(user.id, user.institution_id);

      logger.debug('Token refresh successful', {
        userId: user.id,
        username: user.username
      });

      return {
        accessToken,
        expiresIn: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      };

    } catch (error) {
      logger.error('Token refresh error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      reply.status(401);
      return {
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired refresh token'
        }
      };
    }
  });

  // Logout endpoint
  fastify.post('/logout', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'User logout',
      description: 'Logout user and invalidate tokens',
      security: [{ Bearer: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const user = (request as any).user;

      // Log logout
      loggers.auth.logout(user.id, user.institutionId);

      logger.info('User logout', {
        userId: user.id,
        username: user.username,
        institutionId: user.institutionId
      });

      return {
        message: 'Logout successful'
      };

    } catch (error) {
      logger.error('Logout error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        message: 'Logout completed'
      };
    }
  });

  // Get current user info
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Authentication'],
      summary: 'Get current user',
      description: 'Get current authenticated user information',
      security: [{ Bearer: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                role: { type: 'string' },
                institutionId: { type: 'string' }
              }
            },
            institution: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                bik: { type: 'string' },
                instituteType: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request) => {
    const user = (request as any).user;

    // Get detailed user and institution info
    const query = `
      SELECT
        u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.institution_id,
        i.name as inst_name, i.bik as inst_bik, i.institute_type as inst_type
      FROM users u
      JOIN institutions i ON u.institution_id = i.id
      WHERE u.id = $1
    `;

    const result = await db.query(query, [user.id]);
    const userData = result.rows[0];

    return {
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        institutionId: userData.institution_id
      },
      institution: {
        id: userData.institution_id,
        name: userData.inst_name,
        bik: userData.inst_bik,
        instituteType: userData.inst_type
      }
    };
  });
}