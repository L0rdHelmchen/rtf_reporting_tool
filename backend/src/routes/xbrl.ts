/**
 * RTF Reporting Tool - XBRL Routes
 *
 * API endpoints for XBRL generation, validation, and management
 */

import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { XBRLSchemaParser } from '../services/XBRLSchemaParser';
import { XBRLGeneratorService, XBRLInstanceOptions } from '../services/XBRLGeneratorService';
import { XBRLValidationService, ValidationContext } from '../services/XBRLValidationService';

// Initialize services
const RTF_BASE_PATH = path.join(__dirname, '../../../../RTF_Validierungsdateien');
const schemaParser = new XBRLSchemaParser(RTF_BASE_PATH);
const generatorService = new XBRLGeneratorService(schemaParser, RTF_BASE_PATH);
const validationService = new XBRLValidationService(schemaParser, RTF_BASE_PATH);

// Request/Response schemas
const generateXBRLSchema = {
  body: {
    type: 'object',
    required: ['formId', 'formData', 'options'],
    properties: {
      formId: { type: 'string' },
      formData: { type: 'object' },
      options: {
        type: 'object',
        required: ['schemaRef', 'entityIdentifier', 'entityIdentifierScheme', 'reportingPeriod', 'currency'],
        properties: {
          schemaRef: { type: 'string' },
          entityIdentifier: { type: 'string' },
          entityIdentifierScheme: { type: 'string' },
          reportingPeriod: { type: 'string' },
          reportingPeriodStart: { type: 'string' },
          reportingPeriodEnd: { type: 'string' },
          currency: { type: 'string' },
          decimals: { type: 'number' },
          language: { type: 'string' }
        }
      }
    }
  }
};

const validateFormSchema = {
  body: {
    type: 'object',
    required: ['formId', 'formData', 'context'],
    properties: {
      formId: { type: 'string' },
      formData: { type: 'object' },
      context: {
        type: 'object',
        required: ['formId', 'reportingPeriod'],
        properties: {
          formId: { type: 'string' },
          reportingPeriod: { type: 'string' },
          entityType: { type: 'string' },
          institutionSize: { type: 'string', enum: ['large', 'medium', 'small'] },
          consolidationType: { type: 'string', enum: ['individual', 'consolidated'] }
        }
      }
    }
  }
};

const validateXBRLSchema = {
  body: {
    type: 'object',
    required: ['xbrlContent'],
    properties: {
      xbrlContent: { type: 'string' },
      schemaPath: { type: 'string' }
    }
  }
};

export default async function xbrlRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Initialize services on server start
  fastify.addHook('onReady', async () => {
    try {
      console.log('Initializing XBRL Schema Parser...');
      await schemaParser.parseRTFTaxonomy();
      console.log('XBRL Schema Parser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize XBRL Schema Parser:', error);
      throw error;
    }
  });

  /**
   * Generate XBRL instance document from form data
   */
  fastify.post('/generate', {
    schema: generateXBRLSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { formId, formData, options } = request.body as {
          formId: string;
          formData: Record<string, any>;
          options: XBRLInstanceOptions;
        };

        console.log(`Generating XBRL for form ${formId}`);

        const result = await generatorService.generateXBRLInstance(formId, formData, options);

        if (!result.success) {
          return reply.code(400).send({
            success: false,
            message: 'XBRL generation failed',
            errors: result.errors
          });
        }

        return reply.send({
          success: true,
          message: 'XBRL generated successfully',
          data: {
            fileName: result.fileName,
            xbrlDocument: result.xbrlDocument,
            warnings: result.warnings
          }
        });

      } catch (error) {
        console.error('XBRL generation error:', error);
        return reply.code(500).send({
          success: false,
          message: 'Internal server error during XBRL generation',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Validate form data against business rules and schema
   */
  fastify.post('/validate-form', {
    schema: validateFormSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { formId, formData, context } = request.body as {
          formId: string;
          formData: Record<string, any>;
          context: ValidationContext;
        };

        console.log(`Validating form data for ${formId}`);

        const result = await validationService.validateFormData(formId, formData, context);

        return reply.send({
          success: result.isValid,
          message: result.isValid ? 'Form data is valid' : 'Form data validation failed',
          data: {
            isValid: result.isValid,
            errors: result.errors,
            warnings: result.warnings,
            infos: result.infos,
            summary: result.summary
          }
        });

      } catch (error) {
        console.error('Form validation error:', error);
        return reply.code(500).send({
          success: false,
          message: 'Internal server error during form validation',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Validate XBRL document structure and content
   */
  fastify.post('/validate-xbrl', {
    schema: validateXBRLSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { xbrlContent, schemaPath } = request.body as {
          xbrlContent: string;
          schemaPath?: string;
        };

        console.log('Validating XBRL document');

        const result = await validationService.validateXBRLDocument(xbrlContent);

        return reply.send({
          success: result.isValid,
          message: result.isValid ? 'XBRL document is valid' : 'XBRL document validation failed',
          data: {
            isValid: result.isValid,
            errors: result.errors,
            warnings: result.warnings,
            infos: result.infos,
            summary: result.summary
          }
        });

      } catch (error) {
        console.error('XBRL validation error:', error);
        return reply.code(500).send({
          success: false,
          message: 'Internal server error during XBRL validation',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  /**
   * Get form definition with XBRL structure
   */
  fastify.get('/forms/:formId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };

      const formDefinition = await schemaParser.getFormDefinition(formId);

      if (!formDefinition) {
        return reply.code(404).send({
          success: false,
          message: `Form definition not found: ${formId}`
        });
      }

      const statistics = await generatorService.getFormStatistics(formId);

      return reply.send({
        success: true,
        data: {
          formDefinition,
          statistics
        }
      });

    } catch (error) {
      console.error('Error retrieving form definition:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error retrieving form definition',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get available forms from taxonomy
   */
  fastify.get('/forms', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const forms = await schemaParser.getAvailableForms();

      return reply.send({
        success: true,
        data: {
          forms: forms.map(form => ({
            formId: form.formId,
            name: form.name,
            version: form.version,
            namespace: form.namespace,
            roleUri: form.roleUri,
            sectionCount: form.sections?.length || 0
          }))
        }
      });

    } catch (error) {
      console.error('Error retrieving forms list:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error retrieving forms list',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get validation rules summary for a form
   */
  fastify.get('/forms/:formId/validation-rules', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId } = request.params as { formId: string };

      const summary = await validationService.getValidationSummary(formId);

      return reply.send({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('Error retrieving validation rules:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error retrieving validation rules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Download generated XBRL file
   */
  fastify.post('/export', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { formId, formData, options, format } = request.body as {
        formId: string;
        formData: Record<string, any>;
        options: XBRLInstanceOptions;
        format: 'xbrl' | 'xml';
      };

      const result = await generatorService.generateXBRLInstance(formId, formData, options);

      if (!result.success || !result.xbrlDocument) {
        return reply.code(400).send({
          success: false,
          message: 'Failed to generate XBRL for export',
          errors: result.errors
        });
      }

      const contentType = format === 'xbrl' ? 'application/xml' : 'text/xml';
      const fileName = result.fileName || `${formId}_${options.reportingPeriod}.${format}`;

      return reply
        .header('Content-Type', contentType)
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(result.xbrlDocument);

    } catch (error) {
      console.error('XBRL export error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error during XBRL export',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Batch generate XBRL instances
   */
  fastify.post('/batch-generate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { requests } = request.body as {
        requests: Array<{
          formId: string;
          formData: Record<string, any>;
          options: XBRLInstanceOptions;
        }>;
      };

      if (!requests || requests.length === 0) {
        return reply.code(400).send({
          success: false,
          message: 'No generation requests provided'
        });
      }

      console.log(`Processing batch generation for ${requests.length} forms`);

      const results = await generatorService.batchGenerateXBRL(requests);

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;

      return reply.send({
        success: errorCount === 0,
        message: `Batch generation completed: ${successCount} successful, ${errorCount} failed`,
        data: {
          results,
          summary: {
            total: results.length,
            successful: successCount,
            failed: errorCount
          }
        }
      });

    } catch (error) {
      console.error('Batch generation error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error during batch generation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Get XBRL taxonomy information
   */
  fastify.get('/taxonomy/info', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const info = {
        version: '2023-12',
        namespace: 'http://www.bundesbank.de/xbrl/rtf',
        basePath: RTF_BASE_PATH,
        initialized: true,
        taxonomyDate: '2023-12-31'
      };

      return reply.send({
        success: true,
        data: info
      });

    } catch (error) {
      console.error('Error retrieving taxonomy info:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error retrieving taxonomy info',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Health check for XBRL services
   */
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Test basic service functionality
      const forms = await schemaParser.getAvailableForms();
      const formsCount = forms.length;

      return reply.send({
        success: true,
        message: 'XBRL services are healthy',
        data: {
          schemaParserInitialized: true,
          availableForms: formsCount,
          servicesRunning: [
            'XBRLSchemaParser',
            'XBRLGeneratorService',
            'XBRLValidationService'
          ]
        }
      });

    } catch (error) {
      console.error('XBRL health check failed:', error);
      return reply.code(503).send({
        success: false,
        message: 'XBRL services unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}