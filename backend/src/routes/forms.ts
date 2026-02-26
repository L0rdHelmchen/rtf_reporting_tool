/**
 * RTF Reporting Tool - Form Routes
 *
 * API endpoints for form management with XBRL integration.
 * Form instance data is persisted in the form_instances table.
 */

import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { XBRLSchemaParser } from '../services/XBRLSchemaParser';
import { XBRLGeneratorService } from '../services/XBRLGeneratorService';
import { XBRLValidationService } from '../services/XBRLValidationService';
import { FormStatus } from '@rtf-tool/shared';
import { db } from '../lib/database';
import { logger } from '../lib/logger';

// Initialize XBRL services (singletons, shared across requests)
const RTF_BASE_PATH = path.join(__dirname, '../../..');
const schemaParser = new XBRLSchemaParser(RTF_BASE_PATH);
const generatorService = new XBRLGeneratorService(schemaParser, RTF_BASE_PATH);
const validationService = new XBRLValidationService(schemaParser, RTF_BASE_PATH);

export default async function formRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Require authentication for all form routes
  fastify.addHook('preHandler', (fastify as any).authenticate);

  // Ensure XBRL services are initialized once on server start
  fastify.addHook('onReady', async () => {
    try {
      logger.info('Initializing XBRL Schema Parser for forms...');
      await schemaParser.parseRTFTaxonomy();
      logger.info('XBRL Schema Parser ready');
    } catch (error) {
      logger.warn('XBRL taxonomy not available, forms API will return empty results');
    }
  });

  /**
   * GET / — list all available form definitions from XBRL taxonomy
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as {
        category?: string;
        search?: string;
        page?: string;
        limit?: string;
      };

      let forms = [...schemaParser.getForms().values()];

      // Filter by category (e.g. GRP, RSK, RDP, ILAAP, KPL, OTHER)
      if (query.category) {
        const cat = query.category.toUpperCase();
        forms = forms.filter(f => getFormCategory(f.code) === cat);
      }

      // Filter by search term (code or name)
      if (query.search) {
        const term = query.search.toLowerCase();
        forms = forms.filter(
          f => f.code.toLowerCase().includes(term) || f.name.toLowerCase().includes(term)
        );
      }

      const formsWithMetadata = await Promise.all(
        forms.map(async (form: import('../services/XBRLSchemaParser').FormDefinition) => {
          const statistics = await generatorService.getFormStatistics(form.id);
          const validationSummary = await validationService.getValidationSummary(form.id);

          return {
            formId: form.id,
            code: form.code,
            name: form.name,
            version: form.version,
            namespace: form.namespace,
            description: `RTF Form ${form.code} - ${form.name}`,
            sections: form.sections?.length || 0,
            totalFields: statistics.totalFields,
            requiredFields: statistics.requiredFields,
            dimensionalFields: statistics.dimensionalFields,
            dataTypes: statistics.dataTypes,
            validationRules: {
              total: validationSummary.applicableRules,
              critical: validationSummary.criticalRules,
              warnings: validationSummary.warningRules,
              categories: validationSummary.categories
            },
            category: getFormCategory(form.code),
            lastModified: '2023-12-31T00:00:00Z',
            isActive: true
          };
        })
      );

      return reply.send({
        success: true,
        message: 'Forms retrieved successfully',
        data: {
          forms: formsWithMetadata,
          totalCount: formsWithMetadata.length,
          categories: getFormCategories(formsWithMetadata)
        }
      });

    } catch (error) {
      logger.error('Error retrieving forms', { error });
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve forms'
      });
    }
  });

  /**
   * GET /:formId — form definition with XBRL structure + existing DB instances
   */
  fastify.get('/:formId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const user = (request as any).user;

      const formDefinition = schemaParser.getFormDefinition(formId);
      if (!formDefinition) {
        return reply.code(404).send({ success: false, message: `Form not found: ${formId}` });
      }

      const statistics = await generatorService.getFormStatistics(formId);
      const validationSummary = await validationService.getValidationSummary(formId);

      // Fetch existing DB instances for this user's institution
      const instancesResult = await db.queryAs(
        user.id,
        `SELECT id, reporting_period, status, created_at, updated_at, submitted_at
         FROM form_instances
         WHERE institution_id = $1 AND form_code = $2
         ORDER BY reporting_period DESC`,
        [user.institutionId, formId]
      );

      const instances = instancesResult.rows.map(row => ({
        instanceId: row.id,
        reportingPeriod: row.reporting_period,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        submittedAt: row.submitted_at
      }));

      return reply.send({
        success: true,
        message: 'Form definition retrieved successfully',
        data: {
          formDefinition,
          statistics,
          validationSummary,
          instances,
          metadata: {
            category: getFormCategory(formId),
            complexity: getFormComplexity(statistics),
            estimatedTime: getEstimatedCompletionTime(statistics)
          }
        }
      });

    } catch (error) {
      logger.error('Error retrieving form definition', { error });
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve form definition'
      });
    }
  });

  /**
   * GET /:formId/instance?reportingPeriod=YYYY-MM-DD — fetch saved instance from DB
   */
  fastify.get('/:formId/instance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const { reportingPeriod } = request.query as { reportingPeriod?: string };
      const user = (request as any).user;

      if (!reportingPeriod) {
        return reply.code(400).send({ success: false, message: 'reportingPeriod query param required' });
      }

      const result = await db.queryAs(
        user.id,
        `SELECT id, form_code, reporting_period, status, form_data,
                validation_errors, created_at, updated_at, submitted_at
         FROM form_instances
         WHERE institution_id = $1 AND form_code = $2 AND reporting_period = $3`,
        [user.institutionId, formId, reportingPeriod]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({
          success: false,
          message: `Form instance not found: ${formId} for period ${reportingPeriod}`
        });
      }

      const row = result.rows[0];
      return reply.send({
        instanceId: row.id,
        formDefinitionId: row.form_code,
        reportingPeriod: row.reporting_period,
        data: row.form_data,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        submittedAt: row.submitted_at,
        validationErrors: row.validation_errors
      });

    } catch (error) {
      logger.error('Error retrieving form instance', { error });
      return reply.code(500).send({ success: false, message: 'Failed to retrieve form instance' });
    }
  });

  /**
   * POST /:formId/instance — create new form instance in DB
   */
  fastify.post('/:formId/instance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const { reportingPeriod, data = {} } = request.body as {
        reportingPeriod: string;
        data?: Record<string, any>;
      };
      const user = (request as any).user;

      const validationResult = await validationService.validateFormData(
        formId, data,
        { formId, reportingPeriod, entityType: 'credit_institution', institutionSize: 'large', consolidationType: 'individual' }
      );

      const row = await db.transactionAs(user.id, async (client) => {
        const insertResult = await client.query(
          `INSERT INTO form_instances
             (institution_id, form_code, reporting_period, status, form_data, validation_errors, created_by, updated_by)
           VALUES ($1, $2, $3, 'draft', $4, $5, $6, $6)
           RETURNING id, reporting_period, status, form_data, created_at, updated_at`,
          [user.institutionId, formId, reportingPeriod,
           JSON.stringify(data), JSON.stringify(validationResult.errors), user.id]
        );
        const r = insertResult.rows[0];
        await client.query(
          `INSERT INTO form_instance_history (form_instance_id, changed_by, change_type, new_data)
           VALUES ($1, $2, 'created', $3)`,
          [r.id, user.id, JSON.stringify(data)]
        );
        return r;
      });

      const instance = {
        instanceId: row.id,
        formDefinitionId: formId,
        reportingPeriod: row.reporting_period,
        data: row.form_data,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      return reply.send({
        success: true,
        message: 'Form instance created successfully',
        data: {
          instance,
          validation: {
            isValid: validationResult.isValid,
            hasErrors: validationResult.errors.length > 0,
            hasWarnings: validationResult.warnings.length > 0,
            errorCount: validationResult.errors.length,
            warningCount: validationResult.warnings.length
          }
        }
      });

    } catch (error: any) {
      if (error.code === '23505') {
        return reply.code(409).send({
          success: false,
          message: 'Form instance already exists for this period. Use PUT to update.'
        });
      }
      logger.error('Error creating form instance', { error });
      return reply.code(500).send({ success: false, message: 'Failed to create form instance' });
    }
  });

  /**
   * PUT /:formId/instance — update existing form instance in DB
   */
  fastify.put('/:formId/instance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const { reportingPeriod, data, status } = request.body as {
        reportingPeriod: string;
        data: Record<string, any>;
        status?: FormStatus;
      };
      const user = (request as any).user;

      const validationResult = await validationService.validateFormData(
        formId, data,
        { formId, reportingPeriod, entityType: 'credit_institution', institutionSize: 'large', consolidationType: 'individual' }
      );

      const row = await db.transactionAs(user.id, async (client) => {
        const prevResult = await client.query(
          `SELECT id, form_data FROM form_instances
           WHERE institution_id = $1 AND form_code = $2 AND reporting_period = $3`,
          [user.institutionId, formId, reportingPeriod]
        );
        if (prevResult.rows.length === 0) return null;

        const prev = prevResult.rows[0];

        const updateResult = await client.query(
          `UPDATE form_instances
           SET form_data = $1,
               status = COALESCE($2::form_status_enum, status),
               validation_errors = $3,
               updated_by = $4,
               updated_at = NOW(),
               version_number = version_number + 1
           WHERE institution_id = $5 AND form_code = $6 AND reporting_period = $7
           RETURNING id, reporting_period, status, form_data, created_at, updated_at`,
          [JSON.stringify(data), status || null, JSON.stringify(validationResult.errors),
           user.id, user.institutionId, formId, reportingPeriod]
        );
        const r = updateResult.rows[0];

        await client.query(
          `INSERT INTO form_instance_history (form_instance_id, changed_by, change_type, previous_data, new_data)
           VALUES ($1, $2, 'updated', $3, $4)`,
          [r.id, user.id, JSON.stringify(prev.form_data), JSON.stringify(data)]
        );
        return r;
      });

      if (!row) {
        return reply.code(404).send({
          success: false,
          message: `Form instance not found: ${formId} for period ${reportingPeriod}`
        });
      }

      const instance = {
        instanceId: row.id,
        formDefinitionId: formId,
        reportingPeriod: row.reporting_period,
        data: row.form_data,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      return reply.send({
        success: true,
        message: 'Form instance updated successfully',
        data: {
          instance,
          validation: {
            isValid: validationResult.isValid,
            hasErrors: validationResult.errors.length > 0,
            hasWarnings: validationResult.warnings.length > 0,
            errorCount: validationResult.errors.length,
            warningCount: validationResult.warnings.length
          }
        }
      });

    } catch (error) {
      logger.error('Error updating form instance', { error });
      return reply.code(500).send({ success: false, message: 'Failed to update form instance' });
    }
  });

  /**
   * POST /:formId/validate — validate form data, save validation_errors to DB if instance exists
   */
  fastify.post('/:formId/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const { reportingPeriod, data } = request.body as {
        reportingPeriod: string;
        data: Record<string, any>;
      };
      const user = (request as any).user;

      const result = await validationService.validateFormData(
        formId, data,
        { formId, reportingPeriod, entityType: 'credit_institution', institutionSize: 'large', consolidationType: 'individual' }
      );

      // Persist validation errors if instance exists (best-effort)
      await db.queryAs(
        user.id,
        `UPDATE form_instances
         SET validation_errors = $1, updated_at = NOW()
         WHERE institution_id = $2 AND form_code = $3 AND reporting_period = $4`,
        [JSON.stringify(result.errors), user.institutionId, formId, reportingPeriod]
      );

      return reply.send({
        success: result.isValid,
        message: result.isValid ? 'Form data is valid' : 'Form data validation failed',
        data: {
          isValid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          errorCount: result.errors.length,
          warningCount: result.warnings.length
        }
      });

    } catch (error) {
      logger.error('Error validating form', { error });
      return reply.code(500).send({ success: false, message: 'Failed to validate form data' });
    }
  });

  /**
   * POST /:formId/submit — submit form for review
   */
  fastify.post('/:formId/submit', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const { reportingPeriod } = request.body as { reportingPeriod: string };
      const user = (request as any).user;

      const row = await db.transactionAs(user.id, async (client) => {
        const updateResult = await client.query(
          `UPDATE form_instances
           SET status = 'submitted',
               submitted_at = NOW(),
               updated_by = $1,
               updated_at = NOW()
           WHERE institution_id = $2 AND form_code = $3 AND reporting_period = $4
             AND status IN ('draft', 'in_review')
           RETURNING id, reporting_period, status, form_data, created_at, updated_at, submitted_at`,
          [user.id, user.institutionId, formId, reportingPeriod]
        );
        if (updateResult.rows.length === 0) return null;

        const r = updateResult.rows[0];
        await client.query(
          `INSERT INTO form_instance_history (form_instance_id, changed_by, change_type)
           VALUES ($1, $2, 'submitted')`,
          [r.id, user.id]
        );
        return r;
      });

      if (!row) {
        return reply.code(404).send({
          success: false,
          message: 'Form instance not found or already submitted'
        });
      }

      return reply.send({
        success: true,
        message: 'Form submitted successfully',
        data: {
          instanceId: row.id,
          formDefinitionId: formId,
          reportingPeriod: row.reporting_period,
          data: row.form_data,
          status: row.status,
          submittedAt: row.submitted_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }
      });

    } catch (error) {
      logger.error('Error submitting form', { error });
      return reply.code(500).send({ success: false, message: 'Failed to submit form' });
    }
  });

  /**
   * POST /:formId/instance/:reportingPeriod/export — export as XBRL
   */
  fastify.post('/:formId/instance/:reportingPeriod/export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId, reportingPeriod } = request.params as { formId: string; reportingPeriod: string };
      const { options } = request.body as { format?: string; options?: any };
      const user = (request as any).user;

      const result = await db.queryAs(
        user.id,
        `SELECT form_data FROM form_instances
         WHERE institution_id = $1 AND form_code = $2 AND reporting_period = $3`,
        [user.institutionId, formId, reportingPeriod]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ success: false, message: 'Form instance not found' });
      }

      const formData = result.rows[0].form_data;

      const xbrlOptions = {
        schemaRef: 'rtf-2023-12.xsd',
        entityIdentifier: user.institutionId,
        entityIdentifierScheme: 'http://www.bundesbank.de',
        reportingPeriod,
        currency: 'EUR',
        decimals: 0,
        language: 'de',
        ...options
      };

      const xbrlResult = await generatorService.generateXBRLInstance(formId, formData, xbrlOptions);

      if (!xbrlResult.success || !xbrlResult.xbrlDocument) {
        return reply.code(400).send({ success: false, message: 'Failed to generate XBRL', errors: xbrlResult.errors });
      }

      const fileName = xbrlResult.fileName || `${formId}_${reportingPeriod}.xbrl`;
      return reply
        .header('Content-Type', 'application/xml')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(xbrlResult.xbrlDocument);

    } catch (error) {
      logger.error('Error exporting form', { error });
      return reply.code(500).send({ success: false, message: 'Failed to export form' });
    }
  });

  // ── Helper methods ───────────────────────────────────────────────────────

  const getFormCategory = (formId: string): string => {
    const code = formId.toUpperCase();
    if (code.startsWith('GRP') || code.includes('GRP')) return 'GRP';
    if (code.startsWith('RSK') || code.includes('RSK')) return 'RSK';
    if (code.startsWith('RDP') || code.includes('RDP')) return 'RDP';
    if (code.startsWith('ILAAP') || code.includes('ILAAP')) return 'ILAAP';
    if (code.startsWith('KPL') || code.includes('KPL')) return 'KPL';
    return 'OTHER';
  };

  const getFormCategories = (forms: any[]): Record<string, number> => {
    const categories: Record<string, number> = {};
    for (const form of forms) {
      categories[form.category] = (categories[form.category] || 0) + 1;
    }
    return categories;
  };

  const getFormComplexity = (statistics: any): 'low' | 'medium' | 'high' => {
    const { totalFields, dimensionalFields } = statistics;
    if (totalFields < 20 && dimensionalFields < 5) return 'low';
    if (totalFields < 50 && dimensionalFields < 15) return 'medium';
    return 'high';
  };

  const getEstimatedCompletionTime = (statistics: any): string => {
    const { totalFields, requiredFields, dimensionalFields } = statistics;
    const totalMinutes = Math.ceil(requiredFields * 2 + dimensionalFields * 3 + (totalFields - requiredFields) * 0.5);
    if (totalMinutes < 60) return `${totalMinutes} minutes`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minutes` : ''}`;
  };
}
