// RTF Reporting Tool - Institution Routes
import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../lib/database';
import { logger } from '../lib/logger';

export default async function institutionRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.addHook('preHandler', (fastify as any).authenticate);

  /**
   * GET /institutions/:id — fetch institution master data
   */
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    // Only allow access to own institution (unless admin)
    if (user.role !== 'admin' && user.institutionId !== id) {
      return reply.code(403).send({ success: false, message: 'Access denied' });
    }

    try {
      const result = await db.queryAs(user.id,
        `SELECT id, name, bik, institute_type, exemption_category,
                parent_institution_id, is_consolidated_reporting, accounting_standard,
                address_street, address_city, address_postal_code, address_country,
                contact_person, contact_email, contact_phone, active, created_at, updated_at
         FROM institutions WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'Institution not found' });
      }

      const row = result.rows[0];
      return reply.send({
        success: true,
        data: {
          id: row.id,
          name: row.name,
          bik: row.bik,
          instituteType: row.institute_type,
          exemptionCategory: row.exemption_category,
          parentInstitutionId: row.parent_institution_id,
          isConsolidatedReporting: row.is_consolidated_reporting === true,
          accountingStandard: row.accounting_standard ?? 'hgb',
          addressStreet: row.address_street,
          addressCity: row.address_city,
          addressPostalCode: row.address_postal_code,
          addressCountry: row.address_country,
          contactPerson: row.contact_person,
          contactEmail: row.contact_email,
          contactPhone: row.contact_phone,
          active: row.active,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });
    } catch (error) {
      logger.error('Error fetching institution', { error });
      return reply.code(500).send({ success: false, message: 'Failed to fetch institution' });
    }
  });

  /**
   * PUT /institutions/:id — update institution master data
   */
  fastify.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const user = (request as any).user;

    if (user.role !== 'admin' && user.institutionId !== id) {
      return reply.code(403).send({ success: false, message: 'Access denied' });
    }

    const body = request.body as {
      name?: string;
      isConsolidatedReporting?: boolean;
      accountingStandard?: 'hgb' | 'ifrs' | 'hgb_and_ifrs';
      addressStreet?: string;
      addressCity?: string;
      addressPostalCode?: string;
      addressCountry?: string;
      contactPerson?: string;
      contactEmail?: string;
      contactPhone?: string;
    };

    const allowed: Record<string, string> = {
      name: 'name',
      isConsolidatedReporting: 'is_consolidated_reporting',
      accountingStandard: 'accounting_standard',
      addressStreet: 'address_street',
      addressCity: 'address_city',
      addressPostalCode: 'address_postal_code',
      addressCountry: 'address_country',
      contactPerson: 'contact_person',
      contactEmail: 'contact_email',
      contactPhone: 'contact_phone'
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [jsKey, dbCol] of Object.entries(allowed)) {
      if ((body as any)[jsKey] !== undefined) {
        setClauses.push(`${dbCol} = $${idx++}`);
        values.push((body as any)[jsKey]);
      }
    }

    if (setClauses.length === 0) {
      return reply.code(400).send({ success: false, message: 'No updatable fields provided' });
    }

    values.push(id);

    try {
      const result = await db.queryAs(user.id,
        `UPDATE institutions SET ${setClauses.join(', ')}, updated_at = NOW()
         WHERE id = $${idx} RETURNING id, name, is_consolidated_reporting, accounting_standard, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'Institution not found' });
      }

      const row = result.rows[0];
      logger.info('Institution updated', { institutionId: id, updatedBy: user.id });

      return reply.send({
        success: true,
        message: 'Institution updated successfully',
        data: {
          id: row.id,
          name: row.name,
          isConsolidatedReporting: row.is_consolidated_reporting === true,
          accountingStandard: row.accounting_standard ?? 'hgb',
          updatedAt: row.updated_at
        }
      });
    } catch (error) {
      logger.error('Error updating institution', { error });
      return reply.code(500).send({ success: false, message: 'Failed to update institution' });
    }
  });
}
