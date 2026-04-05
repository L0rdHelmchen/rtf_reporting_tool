// RTF Reporting Tool - User Routes
import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { db } from '../lib/database';
import { logger } from '../lib/logger';

const VALID_ROLES = ['admin', 'compliance_officer', 'risk_manager', 'data_entry', 'reviewer', 'viewer'];

export default async function userRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.addHook('preHandler', (fastify as any).authenticate);

  /**
   * GET /users — list all users for own institution
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    try {
      const result = await db.queryAs(user.id,
        `SELECT id, username, email, first_name, last_name, role, is_active, last_login, created_at, updated_at
         FROM users
         WHERE institution_id = $1
         ORDER BY last_name, first_name`,
        [user.institutionId]
      );
      return reply.send({ success: true, data: { users: result.rows.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        isActive: row.is_active,
        lastLogin: row.last_login,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })) } });
    } catch (error) {
      logger.error('Error listing users', { error });
      return reply.code(500).send({ success: false, message: 'Failed to list users' });
    }
  });

  /**
   * POST /users — create user for own institution
   */
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;

    if (user.role !== 'admin' && user.role !== 'compliance_officer') {
      return reply.code(403).send({ success: false, message: 'Insufficient permissions' });
    }

    const body = request.body as {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      password: string;
    };

    if (!body.username || !body.email || !body.firstName || !body.lastName || !body.role || !body.password) {
      return reply.code(400).send({ success: false, message: 'All fields are required' });
    }

    if (!VALID_ROLES.includes(body.role)) {
      return reply.code(400).send({ success: false, message: `Invalid role. Valid: ${VALID_ROLES.join(', ')}` });
    }

    if (body.password.length < 8) {
      return reply.code(400).send({ success: false, message: 'Password must be at least 8 characters' });
    }

    try {
      const passwordHash = await bcrypt.hash(body.password, 12);
      const result = await db.queryAs(user.id,
        `INSERT INTO users (institution_id, username, email, first_name, last_name, role, password_hash, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING id, username, email, first_name, last_name, role, is_active, created_at`,
        [user.institutionId, body.username, body.email, body.firstName, body.lastName, body.role, passwordHash]
      );
      const row = result.rows[0];
      logger.info('User created', { newUserId: row.id, createdBy: user.id });
      return reply.code(201).send({ success: true, data: {
        id: row.id, username: row.username, email: row.email,
        firstName: row.first_name, lastName: row.last_name,
        role: row.role, isActive: row.is_active, createdAt: row.created_at
      }});
    } catch (error: any) {
      if (error.code === '23505') {
        const field = error.constraint?.includes('email') ? 'E-Mail' : 'Benutzername';
        return reply.code(409).send({ success: false, message: `${field} wird bereits verwendet` });
      }
      logger.error('Error creating user', { error });
      return reply.code(500).send({ success: false, message: 'Failed to create user' });
    }
  });

  /**
   * PUT /users/:id — update role or active status
   */
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    if (user.role !== 'admin' && user.role !== 'compliance_officer') {
      return reply.code(403).send({ success: false, message: 'Insufficient permissions' });
    }

    // Prevent self-demotion
    if (id === user.id) {
      return reply.code(400).send({ success: false, message: 'Eigenes Konto kann nicht bearbeitet werden' });
    }

    const body = request.body as { role?: string; isActive?: boolean; firstName?: string; lastName?: string; email?: string };
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role)) {
        return reply.code(400).send({ success: false, message: 'Invalid role' });
      }
      setClauses.push(`role = $${idx++}`); values.push(body.role);
    }
    if (body.isActive !== undefined) { setClauses.push(`is_active = $${idx++}`); values.push(body.isActive); }
    if (body.firstName !== undefined) { setClauses.push(`first_name = $${idx++}`); values.push(body.firstName); }
    if (body.lastName !== undefined) { setClauses.push(`last_name = $${idx++}`); values.push(body.lastName); }
    if (body.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(body.email); }

    if (setClauses.length === 0) {
      return reply.code(400).send({ success: false, message: 'No fields to update' });
    }
    values.push(user.institutionId, id);

    try {
      const result = await db.queryAs(user.id,
        `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW()
         WHERE institution_id = $${idx} AND id = $${idx + 1}
         RETURNING id, username, email, first_name, last_name, role, is_active, updated_at`,
        values
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User not found' });
      }
      const row = result.rows[0];
      logger.info('User updated', { targetUserId: id, updatedBy: user.id });
      return reply.send({ success: true, data: {
        id: row.id, username: row.username, email: row.email,
        firstName: row.first_name, lastName: row.last_name,
        role: row.role, isActive: row.is_active, updatedAt: row.updated_at
      }});
    } catch (error: any) {
      if (error.code === '23505') {
        return reply.code(409).send({ success: false, message: 'E-Mail wird bereits verwendet' });
      }
      logger.error('Error updating user', { error });
      return reply.code(500).send({ success: false, message: 'Failed to update user' });
    }
  });

  /**
   * DELETE /users/:id — deactivate (soft-delete)
   */
  fastify.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    if (user.role !== 'admin') {
      return reply.code(403).send({ success: false, message: 'Nur Administratoren können Benutzer deaktivieren' });
    }
    if (id === user.id) {
      return reply.code(400).send({ success: false, message: 'Eigenes Konto kann nicht deaktiviert werden' });
    }

    try {
      const result = await db.queryAs(user.id,
        `UPDATE users SET is_active = false, updated_at = NOW()
         WHERE institution_id = $1 AND id = $2
         RETURNING id`,
        [user.institutionId, id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User not found' });
      }
      logger.info('User deactivated', { targetUserId: id, deactivatedBy: user.id });
      return reply.send({ success: true, message: 'Benutzer deaktiviert' });
    } catch (error) {
      logger.error('Error deactivating user', { error });
      return reply.code(500).send({ success: false, message: 'Failed to deactivate user' });
    }
  });

  /**
   * POST /users/:id/reset-password — set new password
   */
  fastify.post('/:id/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { id } = request.params as { id: string };

    if (user.role !== 'admin' && user.role !== 'compliance_officer') {
      return reply.code(403).send({ success: false, message: 'Insufficient permissions' });
    }

    const { password } = request.body as { password: string };
    if (!password || password.length < 8) {
      return reply.code(400).send({ success: false, message: 'Passwort muss mindestens 8 Zeichen haben' });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const result = await db.queryAs(user.id,
        `UPDATE users SET password_hash = $1, updated_at = NOW()
         WHERE institution_id = $2 AND id = $3 RETURNING id`,
        [passwordHash, user.institutionId, id]
      );
      if (result.rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'User not found' });
      }
      logger.info('Password reset', { targetUserId: id, resetBy: user.id });
      return reply.send({ success: true, message: 'Passwort zurückgesetzt' });
    } catch (error) {
      logger.error('Error resetting password', { error });
      return reply.code(500).send({ success: false, message: 'Failed to reset password' });
    }
  });
}
