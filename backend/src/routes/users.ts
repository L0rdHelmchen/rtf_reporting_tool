// RTF Reporting Tool - User Routes (Placeholder)
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function userRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Get users for institution
  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async () => {
    return { message: 'Users endpoint - Coming soon' };
  });

  // Create new user
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async () => {
    return { message: 'Create user endpoint - Coming soon' };
  });
}