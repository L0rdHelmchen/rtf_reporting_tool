/**
 * RTF Reporting Tool - XBRL Generator Service
 *
 * This service converts form data into compliant XBRL instance documents
 * following Deutsche Bundesbank RTF taxonomy standards.
 */

import libxmljs from 'libxmljs2';
import { XBRLSchemaParser, FormDefinition, XBRLContext, XBRLFact } from './XBRLSchemaParser';
import { FormStatus } from '@rtf-tool/shared';
import { DateTime } from 'luxon';
import path from 'path';
import fs from 'fs/promises';

export interface XBRLInstanceOptions {
  schemaRef: string;
  entityIdentifier: string;
  entityIdentifierScheme: string;
  reportingPeriod: string;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  currency: string;
  decimals?: number;
  language?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  context?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface XBRLGenerationResult {
  success: boolean;
  xbrlDocument?: string;
  fileName?: string;
  errors?: ValidationError[];
  warnings?: ValidationError[];
}

export class XBRLGeneratorService {
  private schemaParser: XBRLSchemaParser;
  private rtfBasePath: string;

  constructor(schemaParser: XBRLSchemaParser, rtfBasePath: string) {
    this.schemaParser = schemaParser;
    this.rtfBasePath = rtfBasePath;
  }

  /**
   * Generate complete XBRL instance document from form data
   */
  async generateXBRLInstance(
    formId: string,
    formData: Record<string, any>,
    options: XBRLInstanceOptions
  ): Promise<XBRLGenerationResult> {
    try {
      console.log(`Generating XBRL instance for form ${formId}`);

      // Get form definition
      const formDefinition = await this.schemaParser.getFormDefinition(formId);
      if (!formDefinition) {
        return {
          success: false,
          errors: [{
            code: 'FORM_NOT_FOUND',
            message: `Form definition not found: ${formId}`,
            severity: 'error'
          }]
        };
      }

      // Validate form data — collect warnings but don't block export
      const validationResult = this.schemaParser.validateFormData(formId, formData);
      const validationWarnings: ValidationError[] = validationResult.errors.map(e => ({
        code: 'VALIDATION_WARNING' as const,
        message: `${e.field}: ${e.message}`,
        severity: 'warning' as const
      }));

      // Generate XBRL contexts
      const contexts = await this.generateXBRLContexts(formDefinition, formData, options);

      // Generate XBRL facts
      const facts = await this.generateXBRLFacts(formDefinition, formData, contexts, options);

      // Build the XBRL document
      const xbrlDocument = await this.buildXBRLDocument(
        formDefinition,
        contexts,
        facts,
        options
      );

      // Generate filename
      const fileName = this.generateFileName(formId, options.reportingPeriod);

      return {
        success: true,
        xbrlDocument,
        fileName,
        warnings: validationWarnings
      };

    } catch (error) {
      console.error('Error generating XBRL instance:', error);
      return {
        success: false,
        errors: [{
          code: 'GENERATION_ERROR',
          message: `Failed to generate XBRL: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error'
        }]
      };
    }
  }

  /**
   * Generate XBRL contexts for the instance document
   */
  private async generateXBRLContexts(
    formDefinition: FormDefinition,
    formData: Record<string, any>,
    options: XBRLInstanceOptions
  ): Promise<XBRLContext[]> {
    const contexts: XBRLContext[] = [];

    // Create base context for instant facts
    const instantContext: XBRLContext = {
      id: `instant_${options.reportingPeriod}`,
      entity: {
        identifier: options.entityIdentifier,
        scheme: options.entityIdentifierScheme
      },
      period: {
        instant: options.reportingPeriod
      }
    };
    contexts.push(instantContext);

    // Create duration context if period dates are provided
    if (options.reportingPeriodStart && options.reportingPeriodEnd) {
      const durationContext: XBRLContext = {
        id: `duration_${options.reportingPeriod}`,
        entity: {
          identifier: options.entityIdentifier,
          scheme: options.entityIdentifierScheme
        },
        period: {
          startDate: options.reportingPeriodStart,
          endDate: options.reportingPeriodEnd
        }
      };
      contexts.push(durationContext);
    }

    // Generate dimensional contexts based on form structure
    for (const section of formDefinition.sections || []) {
      for (const field of section.fields || []) {
        if (field.dimensions && field.dimensions.length > 0) {
          // Create context with dimensional information
          const dimensionalContext: XBRLContext = {
            id: `${field.concept}_${options.reportingPeriod}`,
            entity: {
              identifier: options.entityIdentifier,
              scheme: options.entityIdentifierScheme
            },
            period: {
              instant: options.reportingPeriod
            },
            scenario: {
              explicitMembers: new Map()
            }
          };

          // Add dimensional members
          for (const dimension of field.dimensions) {
            if (formData[dimension]) {
              dimensionalContext.scenario!.explicitMembers!.set(dimension, formData[dimension]);
            }
          }

          contexts.push(dimensionalContext);
        }
      }
    }

    return contexts;
  }

  /**
   * Generate XBRL facts from form data
   */
  private async generateXBRLFacts(
    formDefinition: FormDefinition,
    formData: Record<string, any>,
    contexts: XBRLContext[],
    options: XBRLInstanceOptions
  ): Promise<XBRLFact[]> {
    const facts: XBRLFact[] = [];

    for (const section of formDefinition.sections || []) {
      for (const field of section.fields || []) {
        const fieldValue = formData[field.concept];

        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          // Find appropriate context
          let contextRef = contexts[0].id; // Default to first context

          if (field.dimensions && field.dimensions.length > 0) {
            const dimensionalContext = contexts.find(ctx =>
              ctx.id === `${field.concept}_${options.reportingPeriod}`
            );
            if (dimensionalContext) {
              contextRef = dimensionalContext.id;
            }
          }

          // Convert value based on field type
          const convertedValue = this.convertFieldValue(field, fieldValue);

          const fact: XBRLFact = {
            concept: field.concept,
            contextRef,
            value: convertedValue,
            unitRef: this.getUnitRef(field.dataType, options.currency),
            decimals: options.decimals !== undefined ? options.decimals.toString() : undefined
          };

          facts.push(fact);
        }
      }
    }

    return facts;
  }

  /**
   * Convert field value to XBRL-appropriate format
   */
  private convertFieldValue(field: any, value: any): string {
    switch (field.dataType) {
      case 'mi1': // Monetary
        return typeof value === 'number' ? value.toString() : value;
      case 'pi2': // Percentage
        return typeof value === 'number' ? (value / 100).toString() : value;
      case 'ii3': // Integer
        return typeof value === 'number' ? Math.floor(value).toString() : value;
      case 'di5': // Date
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return value;
      case 'bi7': // Boolean
        return typeof value === 'boolean' ? value.toString() : value;
      default:
        return value.toString();
    }
  }

  /**
   * Get unit reference for a data type
   */
  private getUnitRef(dataType: string, currency: string): string | undefined {
    switch (dataType) {
      case 'mi1': // Monetary
        return `${currency}`;
      case 'pi2': // Percentage
        return 'pure';
      default:
        return undefined;
    }
  }

  /**
   * Build the complete XBRL document
   */
  private async buildXBRLDocument(
    formDefinition: FormDefinition,
    contexts: XBRLContext[],
    facts: XBRLFact[],
    options: XBRLInstanceOptions
  ): Promise<string> {
    // Create XML document
    const doc = new libxmljs.Document();

    // Create root element with namespaces
    const xbrl = doc.node('xbrl');
    xbrl.namespace('http://www.xbrl.org/2003/instance', null);
    xbrl.namespace('http://www.xbrl.org/2003/linkbase', 'link');
    xbrl.namespace('http://www.w3.org/1999/xlink', 'xlink');
    xbrl.namespace('http://www.w3.org/2001/XMLSchema-instance', 'xsi');
    xbrl.namespace('http://www.bundesbank.de/xbrl/rtf', 'rtf');

    // Add schema reference
    const schemaLocation = xbrl.node('schemaRef');
    schemaLocation.namespace('http://www.xbrl.org/2003/linkbase', 'link');
    schemaLocation.attr({
      'xlink:type': 'simple',
      'xlink:href': options.schemaRef
    });

    // Add contexts
    for (const context of contexts) {
      const contextNode = xbrl.node('context');
      contextNode.attr('id', context.id);

      // Entity
      const entityNode = contextNode.node('entity');
      const identifierNode = entityNode.node('identifier');
      identifierNode.attr('scheme', context.entity.scheme);
      identifierNode.text(context.entity.identifier);

      // Scenario (for dimensional data)
      if (context.scenario && context.scenario.explicitMembers) {
        const scenarioNode = contextNode.node('scenario');
        for (const [dimension, member] of context.scenario.explicitMembers) {
          const explicitMemberNode = scenarioNode.node('explicitMember');
          explicitMemberNode.attr('dimension', dimension);
          explicitMemberNode.text(member);
        }
      }

      // Period
      const periodNode = contextNode.node('period');
      if (context.period.instant) {
        periodNode.node('instant').text(context.period.instant);
      } else if (context.period.startDate && context.period.endDate) {
        periodNode.node('startDate').text(context.period.startDate);
        periodNode.node('endDate').text(context.period.endDate);
      }
    }

    // Add units
    const units = new Set<string>();
    for (const fact of facts) {
      if (fact.unitRef) {
        units.add(fact.unitRef);
      }
    }

    for (const unit of units) {
      const unitNode = xbrl.node('unit');
      unitNode.attr('id', unit);
      if (unit === 'pure') {
        unitNode.node('measure').text('xbrli:pure');
      } else {
        unitNode.node('measure').text(`iso4217:${unit}`);
      }
    }

    // Add facts
    for (const fact of facts) {
      const factNode = xbrl.node(fact.concept.replace(':', '_'));
      factNode.namespace('http://www.bundesbank.de/xbrl/rtf', 'rtf');
      factNode.attr('contextRef', fact.contextRef);

      if (fact.unitRef) {
        factNode.attr('unitRef', fact.unitRef);
      }

      if (fact.decimals !== undefined) {
        factNode.attr('decimals', fact.decimals);
      }

      factNode.text(fact.value);
    }

    return doc.toString();
  }

  /**
   * Generate filename for XBRL instance
   */
  private generateFileName(formId: string, reportingPeriod: string): string {
    const timestamp = DateTime.now().toFormat('yyyyLLddHHmmss');
    return `${formId}_${reportingPeriod}_${timestamp}.xbrl`;
  }

  /**
   * Validate XBRL instance against schema
   */
  async validateXBRLInstance(xbrlContent: string, schemaPath?: string): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Parse the XBRL document
      const doc = libxmljs.parseXml(xbrlContent);

      // Basic structure validation
      const root = doc.root();
      if (!root || root.name() !== 'xbrl') {
        errors.push({
          code: 'INVALID_ROOT',
          message: 'XBRL document must have xbrl root element',
          severity: 'error'
        });
        return errors;
      }

      // Check for required namespaces
      const requiredNamespaces = [
        'http://www.xbrl.org/2003/instance',
        'http://www.bundesbank.de/xbrl/rtf'
      ];

      for (const ns of requiredNamespaces) {
        const nsNodes = doc.find(`//*[namespace-uri()='${ns}']`);
        if (nsNodes.length === 0) {
          errors.push({
            code: 'MISSING_NAMESPACE',
            message: `Required namespace not found: ${ns}`,
            severity: 'error'
          });
        }
      }

      // Validate contexts
      const contexts = doc.find('//xbrli:context', { xbrli: 'http://www.xbrl.org/2003/instance' });
      if (contexts.length === 0) {
        errors.push({
          code: 'NO_CONTEXTS',
          message: 'XBRL document must contain at least one context',
          severity: 'error'
        });
      }

      // Validate facts
      const facts = doc.find('//rtf:*[@contextRef]', { rtf: 'http://www.bundesbank.de/xbrl/rtf' });
      if (facts.length === 0) {
        errors.push({
          code: 'NO_FACTS',
          message: 'XBRL document must contain at least one fact',
          severity: 'warning'
        });
      }

      // Validate context references
      const contextIds = new Set<string>();
      for (const context of contexts) {
        const id = (context as any).attr('id')?.value();
        if (id) {
          contextIds.add(id);
        }
      }

      for (const fact of facts) {
        const contextRef = (fact as any).attr('contextRef')?.value();
        if (contextRef && !contextIds.has(contextRef)) {
          errors.push({
            code: 'INVALID_CONTEXT_REF',
            message: `Context reference not found: ${contextRef}`,
            path: fact.name(),
            severity: 'error'
          });
        }
      }

    } catch (error) {
      errors.push({
        code: 'XML_PARSE_ERROR',
        message: `Failed to parse XBRL document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return errors;
  }

  /**
   * Export XBRL instance to file
   */
  async exportToFile(xbrlContent: string, fileName: string, outputDir: string): Promise<string> {
    const fullPath = path.join(outputDir, fileName);
    await fs.writeFile(fullPath, xbrlContent, 'utf-8');
    return fullPath;
  }

  /**
   * Batch generate XBRL instances for multiple forms
   */
  async batchGenerateXBRL(
    requests: Array<{
      formId: string;
      formData: Record<string, any>;
      options: XBRLInstanceOptions;
    }>
  ): Promise<XBRLGenerationResult[]> {
    const results: XBRLGenerationResult[] = [];

    for (const request of requests) {
      const result = await this.generateXBRLInstance(
        request.formId,
        request.formData,
        request.options
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get form statistics for monitoring
   */
  async getFormStatistics(formId: string): Promise<{
    totalFields: number;
    requiredFields: number;
    dimensionalFields: number;
    dataTypes: Record<string, number>;
  }> {
    const formDefinition = await this.schemaParser.getFormDefinition(formId);
    if (!formDefinition) {
      return {
        totalFields: 0,
        requiredFields: 0,
        dimensionalFields: 0,
        dataTypes: {}
      };
    }

    let totalFields = 0;
    let requiredFields = 0;
    let dimensionalFields = 0;
    const dataTypes: Record<string, number> = {};

    for (const section of formDefinition.sections || []) {
      for (const field of section.fields || []) {
        totalFields++;

        if (field.required) {
          requiredFields++;
        }

        if (field.dimensions && field.dimensions.length > 0) {
          dimensionalFields++;
        }

        const dataType = field.dataType || 'unknown';
        dataTypes[dataType] = (dataTypes[dataType] || 0) + 1;
      }
    }

    return {
      totalFields,
      requiredFields,
      dimensionalFields,
      dataTypes
    };
  }
}