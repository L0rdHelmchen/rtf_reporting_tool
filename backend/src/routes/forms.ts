/**
 * RTF Reporting Tool - Form Routes
 *
 * API endpoints for form management with XBRL integration
 */

import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import { XBRLSchemaParser } from '../services/XBRLSchemaParser';
import { XBRLGeneratorService } from '../services/XBRLGeneratorService';
import { XBRLValidationService, ValidationContext } from '../services/XBRLValidationService';
import { FormStatus } from '@rtf-tool/shared';

// Initialize XBRL services
const RTF_BASE_PATH = path.join(__dirname, '../../../../RTF_Validierungsdateien');
const schemaParser = new XBRLSchemaParser(RTF_BASE_PATH);
const generatorService = new XBRLGeneratorService(schemaParser, RTF_BASE_PATH);
const validationService = new XBRLValidationService(schemaParser, RTF_BASE_PATH);

// Mock data store (in production, this would be a database)
const formInstances = new Map<string, any>();

export default async function formRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Ensure XBRL services are initialized
  fastify.addHook('onReady', async () => {
    if (!schemaParser) {
      console.log('Initializing XBRL Schema Parser for forms...');
      await schemaParser.parseRTFTaxonomy();
    }
  });

  /**
   * Get all available forms from XBRL taxonomy
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const forms = await schemaParser.getAvailableForms();

      const formsWithMetadata = await Promise.all(
        forms.map(async (form) => {
          const statistics = await generatorService.getFormStatistics(form.formId);
          const validationSummary = await validationService.getValidationSummary(form.formId);

          return {
            formId: form.formId,
            code: form.formId,
            name: form.name,
            version: form.version,
            namespace: form.namespace,
            description: `RTF Form ${form.formId} - ${form.name}`,
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
            category: this.getFormCategory(form.formId),
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
          categories: this.getFormCategories(formsWithMetadata)
        }
      });

    } catch (error) {
      console.error('Error retrieving forms:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve forms',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get specific form definition with XBRL structure
   */
  fastify.get('/:formId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };

      const formDefinition = await schemaParser.getFormDefinition(formId);
      if (!formDefinition) {
        return reply.code(404).send({
          success: false,
          message: `Form not found: ${formId}`
        });
      }

      const statistics = await generatorService.getFormStatistics(formId);
      const validationSummary = await validationService.getValidationSummary(formId);

      // Get any existing instances for this form (mock data)
      const instances = Array.from(formInstances.entries())
        .filter(([key]) => key.startsWith(`${formId}_`))
        .map(([key, instance]) => ({
          instanceId: key,
          reportingPeriod: instance.reportingPeriod,
          status: instance.status,
          createdAt: instance.createdAt,
          updatedAt: instance.updatedAt,
          submittedAt: instance.submittedAt
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
            category: this.getFormCategory(formId),
            complexity: this.getFormComplexity(statistics),
            estimatedTime: this.getEstimatedCompletionTime(statistics)
          }
        }
      });

    } catch (error) {
      console.error('Error retrieving form definition:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve form definition',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Create or update form instance
   */
  fastify.post('/:formId/instance', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };
      const { reportingPeriod, data, status } = request.body as {
        reportingPeriod: string;
        data: Record<string, any>;
        status?: FormStatus;
      };

      const instanceKey = `${formId}_${reportingPeriod}`;

      // Validate form data
      const validationContext: ValidationContext = {
        formId,
        reportingPeriod,
        entityType: 'credit_institution',
        institutionSize: 'large',
        consolidationType: 'individual'
      };

      const validationResult = await validationService.validateFormData(
        formId,
        data,
        validationContext
      );

      // Save instance (mock implementation)
      const now = new Date().toISOString();
      const existingInstance = formInstances.get(instanceKey);

      const instance = {
        instanceId: instanceKey,
        formDefinitionId: formId,
        reportingPeriod,
        data,
        status: status || 'draft',
        createdAt: existingInstance?.createdAt || now,
        updatedAt: now,
        submittedAt: status === 'submitted' ? now : existingInstance?.submittedAt,
        validatedAt: validationResult.isValid ? now : undefined,
        validationResult
      };

      formInstances.set(instanceKey, instance);

      return reply.send({
        success: true,
        message: 'Form instance saved successfully',
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
      console.error('Error saving form instance:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to save form instance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get form instance data
   */
  fastify.get('/:formId/instance/:reportingPeriod', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId, reportingPeriod } = request.params as {
        formId: string;
        reportingPeriod: string;
      };

      const instanceKey = `${formId}_${reportingPeriod}`;
      const instance = formInstances.get(instanceKey);

      if (!instance) {
        return reply.code(404).send({
          success: false,
          message: `Form instance not found: ${formId} for period ${reportingPeriod}`
        });
      }

      return reply.send({
        success: true,
        message: 'Form instance retrieved successfully',
        data: { instance }
      });

    } catch (error) {
      console.error('Error retrieving form instance:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to retrieve form instance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Validate form instance
   */
  fastify.post('/:formId/instance/:reportingPeriod/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId, reportingPeriod } = request.params as {
        formId: string;
        reportingPeriod: string;
      };

      const { data, context } = request.body as {
        data?: Record<string, any>;
        context?: Partial<ValidationContext>;
      };

      const instanceKey = `${formId}_${reportingPeriod}`;
      const instance = formInstances.get(instanceKey);

      const formData = data || instance?.data || {};

      const validationContext: ValidationContext = {
        formId,
        reportingPeriod,
        entityType: context?.entityType || 'credit_institution',
        institutionSize: context?.institutionSize || 'large',
        consolidationType: context?.consolidationType || 'individual'
      };

      const result = await validationService.validateFormData(
        formId,
        formData,
        validationContext
      );

      // Update instance with validation result if it exists
      if (instance) {
        instance.validationResult = result;
        instance.validatedAt = new Date().toISOString();
        formInstances.set(instanceKey, instance);
      }

      return reply.send({
        success: true,
        message: 'Form validation completed',
        data: {
          validation: result,
          summary: {
            isValid: result.isValid,
            errorCount: result.errors.length,
            warningCount: result.warnings.length,
            infoCount: result.infos.length,
            rulesApplied: result.summary.totalRules,
            rulesPassed: result.summary.passedRules,
            rulesFailed: result.summary.failedRules
          }
        }
      });

    } catch (error) {
      console.error('Error validating form instance:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to validate form instance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Export form instance as XBRL
   */
  fastify.post('/:formId/instance/:reportingPeriod/export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId, reportingPeriod } = request.params as {
        formId: string;
        reportingPeriod: string;
      };

      const { format, options } = request.body as {
        format: 'xbrl' | 'xml' | 'pdf' | 'excel';
        options?: any;
      };

      const instanceKey = `${formId}_${reportingPeriod}`;
      const instance = formInstances.get(instanceKey);

      if (!instance) {
        return reply.code(404).send({
          success: false,
          message: `Form instance not found: ${formId} for period ${reportingPeriod}`
        });
      }

      if (format === 'xbrl' || format === 'xml') {
        // Generate XBRL document
        const xbrlOptions = {
          schemaRef: 'rtf-2023-12.xsd',
          entityIdentifier: 'DE123456789',
          entityIdentifierScheme: 'http://www.bundesbank.de',
          reportingPeriod,
          currency: 'EUR',
          decimals: 0,
          language: 'de',
          ...options
        };

        const result = await generatorService.generateXBRLInstance(
          formId,
          instance.data,
          xbrlOptions
        );

        if (!result.success) {
          return reply.code(400).send({
            success: false,
            message: 'Failed to generate XBRL document',
            errors: result.errors
          });
        }

        const fileName = result.fileName || `${formId}_${reportingPeriod}.xbrl`;
        const contentType = format === 'xbrl' ? 'application/xml' : 'text/xml';

        return reply
          .header('Content-Type', contentType)
          .header('Content-Disposition', `attachment; filename="${fileName}"`)
          .send(result.xbrlDocument);

      } else {
        // For PDF/Excel export, return a mock response
        return reply.send({
          success: true,
          message: `${format.toUpperCase()} export feature coming soon`,
          data: {
            format,
            formId,
            reportingPeriod,
            downloadUrl: `/api/forms/${formId}/instance/${reportingPeriod}/download/${format}`
          }
        });
      }

    } catch (error) {
      console.error('Error exporting form instance:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to export form instance',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Helper methods
   */
  const getFormCategory = (formId: string): string => {
    if (formId.startsWith('GRP')) return 'Group Information';
    if (formId.startsWith('RSK')) return 'Risk Information';
    if (formId.startsWith('RDP')) return 'Risk Covering Potential';
    if (formId.startsWith('ILAAP')) return 'Liquidity Assessment';
    if (formId.startsWith('KPL')) return 'Capital Planning';
    return 'Other';
  };

  const getFormCategories = (forms: any[]): Record<string, number> => {
    const categories: Record<string, number> = {};
    for (const form of forms) {
      const category = form.category;
      categories[category] = (categories[category] || 0) + 1;
    }
    return categories;
  };

  const getFormComplexity = (statistics: any): 'low' | 'medium' | 'high' => {
    const { totalFields, dimensionalFields, requiredFields } = statistics;

    if (totalFields < 20 && dimensionalFields < 5) return 'low';
    if (totalFields < 50 && dimensionalFields < 15) return 'medium';
    return 'high';
  };

  const getEstimatedCompletionTime = (statistics: any): string => {
    const { totalFields, requiredFields, dimensionalFields } = statistics;

    const baseTime = requiredFields * 2; // 2 minutes per required field
    const dimensionalTime = dimensionalFields * 3; // 3 minutes per dimensional field
    const optionalTime = (totalFields - requiredFields) * 0.5; // 30 seconds per optional field

    const totalMinutes = Math.ceil(baseTime + dimensionalTime + optionalTime);

    if (totalMinutes < 60) return `${totalMinutes} minutes`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minutes` : ''}`;
  };

  // Attach helper methods to the instance for access
  (this as any).getFormCategory = getFormCategory;
  (this as any).getFormCategories = getFormCategories;
  (this as any).getFormComplexity = getFormComplexity;
  (this as any).getEstimatedCompletionTime = getEstimatedCompletionTime;
}