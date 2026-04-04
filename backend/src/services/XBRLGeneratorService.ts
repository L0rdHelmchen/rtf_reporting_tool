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
      console.log(`Generating XBRL instance for form ${formId}, formData keys: ${Object.keys(formData || {}).join(', ')}`);

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

    // Base instant context
    contexts.push({
      id: `instant_${options.reportingPeriod}`,
      entity: {
        identifier: {
          scheme: options.entityIdentifierScheme,
          value: options.entityIdentifier
        }
      },
      period: { instant: options.reportingPeriod }
    });

    // Duration context if period start/end are provided
    if (options.reportingPeriodStart && options.reportingPeriodEnd) {
      contexts.push({
        id: `duration_${options.reportingPeriod}`,
        entity: {
          identifier: {
            scheme: options.entityIdentifierScheme,
            value: options.entityIdentifier
          }
        },
        period: {
          startDate: options.reportingPeriodStart,
          endDate: options.reportingPeriodEnd
        }
      });
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
    const contextRef = contexts[0].id;

    for (const section of formDefinition.sections || []) {
      for (const field of section.fields || []) {
        const fieldValue = formData[field.name];
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') continue;

        const convertedValue = this.convertFieldValue(field, fieldValue);
        const isNumeric = ['mi1', 'pi2', 'ii3'].includes(field.dataType);

        facts.push({
          concept: field.name,
          contextRef,
          value: convertedValue,
          unitRef: isNumeric ? this.getUnitRef(field.dataType, options.currency) : undefined,
          decimals: isNumeric && options.decimals !== undefined ? options.decimals.toString() : undefined
        });
      }
    }

    console.log(`Generated ${facts.length} XBRL facts`);
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
   * Build the complete XBRL instance document as a well-formed XML string.
   * Uses direct string construction to avoid libxmljs2 namespace API quirks.
   */
  private async buildXBRLDocument(
    formDefinition: FormDefinition,
    contexts: XBRLContext[],
    facts: XBRLFact[],
    options: XBRLInstanceOptions
  ): Promise<string> {
    const x = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const lines: string[] = [];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<xbrli:xbrl');
    lines.push('  xmlns:xbrli="http://www.xbrl.org/2003/instance"');
    lines.push('  xmlns:link="http://www.xbrl.org/2003/linkbase"');
    lines.push('  xmlns:xlink="http://www.w3.org/1999/xlink"');
    lines.push('  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
    lines.push('  xmlns:rtf="http://www.bundesbank.de/xbrl/rtf"');
    lines.push('  xmlns:iso4217="http://www.xbrl.org/2003/iso4217">');
    lines.push('');
    lines.push(`  <link:schemaRef xlink:type="simple" xlink:href="${x(options.schemaRef)}"/>`);

    // Contexts
    for (const context of contexts) {
      const entity = context.entity.identifier as any;
      const scheme = entity?.scheme ?? '';
      const identifierValue = entity?.value ?? entity ?? '';
      lines.push('');
      lines.push(`  <xbrli:context id="${x(context.id)}">`);
      lines.push('    <xbrli:entity>');
      lines.push(`      <xbrli:identifier scheme="${x(scheme)}">${x(String(identifierValue))}</xbrli:identifier>`);
      lines.push('    </xbrli:entity>');
      lines.push('    <xbrli:period>');
      if (context.period.instant) {
        lines.push(`      <xbrli:instant>${x(context.period.instant)}</xbrli:instant>`);
      } else if (context.period.startDate && context.period.endDate) {
        lines.push(`      <xbrli:startDate>${x(context.period.startDate)}</xbrli:startDate>`);
        lines.push(`      <xbrli:endDate>${x(context.period.endDate)}</xbrli:endDate>`);
      }
      lines.push('    </xbrli:period>');
      lines.push('  </xbrli:context>');
    }

    // Units (only for facts that have a unitRef)
    const units = new Set<string>();
    for (const fact of facts) {
      if (fact.unitRef) units.add(fact.unitRef);
    }
    for (const unit of units) {
      lines.push('');
      lines.push(`  <xbrli:unit id="${x(unit)}">`);
      if (unit === 'pure') {
        lines.push('    <xbrli:measure>xbrli:pure</xbrli:measure>');
      } else {
        lines.push(`    <xbrli:measure>iso4217:${x(unit)}</xbrli:measure>`);
      }
      lines.push('  </xbrli:unit>');
    }

    // Facts
    lines.push('');
    for (const fact of facts) {
      let attrs = `contextRef="${x(fact.contextRef)}"`;
      if (fact.unitRef) attrs += ` unitRef="${x(fact.unitRef)}"`;
      if (fact.decimals !== undefined) attrs += ` decimals="${x(String(fact.decimals))}"`;
      const val = x(String(fact.value));
      lines.push(`  <rtf:${fact.concept} ${attrs}>${val}</rtf:${fact.concept}>`);
    }

    lines.push('');
    lines.push('</xbrli:xbrl>');

    return lines.join('\n');
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
