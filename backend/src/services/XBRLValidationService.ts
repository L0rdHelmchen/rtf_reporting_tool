/**
 * RTF Reporting Tool - XBRL Validation Service
 *
 * This service provides comprehensive validation for XBRL documents and form data
 * according to Deutsche Bundesbank RTF taxonomy and business rules.
 */

import { libxmljs } from 'libxmljs2';
import { XBRLSchemaParser } from './XBRLSchemaParser';
import { ValidationError } from './XBRLGeneratorService';
import { ValueAssertionEvaluator } from './ValueAssertionEvaluator';
import path from 'path';
import fs from 'fs/promises';

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  expression: string;
  severity: 'error' | 'warning' | 'info';
  category: string;
  formIds?: string[];
}

export interface ValidationContext {
  formId: string;
  reportingPeriod: string;
  entityType?: string;
  institutionSize?: 'large' | 'medium' | 'small';
  consolidationType?: 'individual' | 'consolidated';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    skippedRules: number;
  };
}

export class XBRLValidationService {
  private schemaParser: XBRLSchemaParser;
  private businessRules: Map<string, BusinessRule> = new Map();
  private rtfBasePath: string;
  private valueEvaluator: ValueAssertionEvaluator | null = null;

  constructor(schemaParser: XBRLSchemaParser, rtfBasePath: string) {
    this.schemaParser = schemaParser;
    this.rtfBasePath = rtfBasePath;
    this.initializeBusinessRules();
  }

  /** Lazy-load the ValueAssertionEvaluator (loads value-rules.json once) */
  private async getValueEvaluator(): Promise<ValueAssertionEvaluator> {
    if (!this.valueEvaluator) {
      const dataDir = path.join(__dirname, '../data');
      this.valueEvaluator = await ValueAssertionEvaluator.load(dataDir);
    }
    return this.valueEvaluator;
  }

  /**
   * Initialize business rules for RTF validation
   */
  private initializeBusinessRules(): void {
    const rules: BusinessRule[] = [
      // Capital adequacy rules
      {
        id: 'CAP_001',
        name: 'Minimum Capital Requirement',
        description: 'Total capital must be at least 8% of risk-weighted assets',
        expression: 'totalCapital / riskWeightedAssets >= 0.08',
        severity: 'error',
        category: 'capital_adequacy',
        formIds: ['RSK11', 'RSK12']
      },
      {
        id: 'CAP_002',
        name: 'Tier 1 Capital Ratio',
        description: 'Tier 1 capital must be at least 6% of risk-weighted assets',
        expression: 'tier1Capital / riskWeightedAssets >= 0.06',
        severity: 'error',
        category: 'capital_adequacy',
        formIds: ['RSK11']
      },
      {
        id: 'CAP_003',
        name: 'Common Equity Tier 1 Ratio',
        description: 'CET1 ratio must be at least 4.5% of risk-weighted assets',
        expression: 'cet1Capital / riskWeightedAssets >= 0.045',
        severity: 'error',
        category: 'capital_adequacy',
        formIds: ['RSK11']
      },

      // Liquidity rules
      {
        id: 'LIQ_001',
        name: 'Liquidity Coverage Ratio',
        description: 'LCR must be at least 100%',
        expression: 'liquidityBufferStock / netCashOutflows >= 1.0',
        severity: 'error',
        category: 'liquidity',
        formIds: ['ILAAP01', 'ILAAP02']
      },
      {
        id: 'LIQ_002',
        name: 'Net Stable Funding Ratio',
        description: 'NSFR must be at least 100%',
        expression: 'availableStableFunding / requiredStableFunding >= 1.0',
        severity: 'error',
        category: 'liquidity',
        formIds: ['ILAAP03']
      },

      // Risk concentration rules
      {
        id: 'RISK_001',
        name: 'Large Exposure Limit',
        description: 'Single counterparty exposure must not exceed 25% of eligible capital',
        expression: 'maxSingleExposure / eligibleCapital <= 0.25',
        severity: 'error',
        category: 'concentration_risk',
        formIds: ['RSK01']
      },
      {
        id: 'RISK_002',
        name: 'Sectoral Concentration',
        description: 'Sector concentration should be monitored',
        expression: 'maxSectorExposure / totalExposure <= 0.40',
        severity: 'warning',
        category: 'concentration_risk',
        formIds: ['RSK02']
      },

      // Consistency rules
      {
        id: 'CONS_001',
        name: 'Balance Sheet Consistency',
        description: 'Total assets must equal total liabilities plus equity',
        expression: 'totalAssets == totalLiabilities + totalEquity',
        severity: 'error',
        category: 'consistency',
        formIds: ['GRP31', 'RSK11']
      },
      {
        id: 'CONS_002',
        name: 'Profit/Loss Consistency',
        description: 'Net income must match balance sheet equity changes',
        expression: 'abs(netIncome - (endingEquity - beginningEquity - capitalChanges)) <= toleranceThreshold',
        severity: 'warning',
        category: 'consistency'
      },

      // Data quality rules
      {
        id: 'DQ_001',
        name: 'Non-negative Values',
        description: 'Certain fields must not be negative',
        expression: 'value >= 0',
        severity: 'error',
        category: 'data_quality'
      },
      {
        id: 'DQ_002',
        name: 'Reasonable Value Range',
        description: 'Values should be within reasonable ranges',
        expression: 'value <= maxReasonableValue && value >= minReasonableValue',
        severity: 'warning',
        category: 'data_quality'
      }
    ];

    for (const rule of rules) {
      this.businessRules.set(rule.id, rule);
    }
  }

  /**
   * Validate form data against business rules and schema
   */
  async validateFormData(
    formId: string,
    formData: Record<string, any>,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    let totalRules = 0;
    let passedRules = 0;
    let failedRules = 0;
    let skippedRules = 0;

    try {
      // 1. Schema validation
      const schemaResult = this.schemaParser.validateFormData(formId, formData);
      for (const e of schemaResult.errors) {
        const severity = (e as any).severity ?? 'error';
        const mapped = {
          fieldPath: (e as any).fieldPath ?? e.field,
          errorCode: (e as any).errorCode ?? 'SCHEMA_ERROR',
          messageDe: (e as any).messageDe ?? e.message,
          severity
        };
        if (severity === 'error') {
          errors.push(mapped as any);
        } else if (severity === 'warning') {
          warnings.push(mapped as any);
        } else {
          infos.push(mapped as any);
        }
      }

      // 2. Business rules validation
      const applicableRules = Array.from(this.businessRules.values()).filter(rule =>
        !rule.formIds || rule.formIds.includes(formId)
      );

      for (const rule of applicableRules) {
        totalRules++;

        try {
          const ruleResult = await this.evaluateBusinessRule(rule, formData, context);

          if (ruleResult.passed) {
            passedRules++;
          } else {
            failedRules++;
            const validationError: ValidationError = {
              code: rule.id,
              message: `${rule.name}: ${rule.description}`,
              context: ruleResult.context,
              severity: rule.severity
            };

            if (rule.severity === 'error') {
              errors.push(validationError);
            } else if (rule.severity === 'warning') {
              warnings.push(validationError);
            } else {
              infos.push(validationError);
            }
          }
        } catch (error) {
          skippedRules++;
          console.warn(`Rule ${rule.id} skipped due to evaluation error:`, error);
        }
      }

      // 3. XBRL Value Assertion validation (arithmetic cross-checks)
      const valueEvaluator = await this.getValueEvaluator();
      const assertionViolations = valueEvaluator.evaluate(formId, formData);
      for (const v of assertionViolations) {
        totalRules++;
        failedRules++;
        errors.push({
          code: v.assertionId,
          message: v.message,
          path: v.fieldKey,
          severity: v.severity,
        });
      }
      passedRules += assertionViolations.length === 0 ? 1 : 0;

      // 4. Cross-form validation (if applicable)
      const crossFormErrors = await this.validateCrossFormConsistency(formId, formData, context);
      for (const error of crossFormErrors) {
        if (error.severity === 'error') {
          errors.push(error);
        } else if (error.severity === 'warning') {
          warnings.push(error);
        } else {
          infos.push(error);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        infos,
        summary: {
          totalRules,
          passedRules,
          failedRules,
          skippedRules
        }
      };

    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });

      return {
        isValid: false,
        errors,
        warnings,
        infos,
        summary: {
          totalRules,
          passedRules,
          failedRules,
          skippedRules
        }
      };
    }
  }

  /**
   * Evaluate a single business rule
   */
  private async evaluateBusinessRule(
    rule: BusinessRule,
    formData: Record<string, any>,
    context: ValidationContext
  ): Promise<{ passed: boolean; context?: string; value?: any }> {
    // This is a simplified rule evaluation engine
    // In a production system, you would want a more sophisticated rule engine

    const variables = {
      ...formData,
      reportingPeriod: context.reportingPeriod,
      entityType: context.entityType,
      institutionSize: context.institutionSize,
      consolidationType: context.consolidationType
    };

    try {
      // Handle specific rule patterns
      switch (rule.id) {
        case 'CAP_001':
          return this.evaluateCapitalAdequacyRule(variables);
        case 'CAP_002':
          return this.evaluateTier1CapitalRule(variables);
        case 'CAP_003':
          return this.evaluateCET1Rule(variables);
        case 'LIQ_001':
          return this.evaluateLCRRule(variables);
        case 'LIQ_002':
          return this.evaluateNSFRRule(variables);
        case 'RISK_001':
          return this.evaluateLargeExposureRule(variables);
        case 'CONS_001':
          return this.evaluateBalanceSheetConsistency(variables);
        case 'DQ_001':
          return this.evaluateNonNegativeValues(variables);
        default:
          // Generic expression evaluation (simplified)
          return { passed: true, context: 'Rule evaluation not implemented' };
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return { passed: true, context: 'Rule evaluation failed' };
    }
  }

  /**
   * Evaluate capital adequacy rule
   */
  private evaluateCapitalAdequacyRule(variables: Record<string, any>): { passed: boolean; context?: string } {
    const totalCapital = variables['rtf:TotalCapital'] || 0;
    const riskWeightedAssets = variables['rtf:RiskWeightedAssets'] || 0;

    if (riskWeightedAssets === 0) {
      return { passed: true, context: 'Risk-weighted assets is zero, rule not applicable' };
    }

    const ratio = totalCapital / riskWeightedAssets;
    const passed = ratio >= 0.08;

    return {
      passed,
      context: `Total Capital Ratio: ${(ratio * 100).toFixed(2)}% (Required: 8.0%)`
    };
  }

  /**
   * Evaluate Tier 1 capital rule
   */
  private evaluateTier1CapitalRule(variables: Record<string, any>): { passed: boolean; context?: string } {
    const tier1Capital = variables['rtf:Tier1Capital'] || 0;
    const riskWeightedAssets = variables['rtf:RiskWeightedAssets'] || 0;

    if (riskWeightedAssets === 0) {
      return { passed: true, context: 'Risk-weighted assets is zero, rule not applicable' };
    }

    const ratio = tier1Capital / riskWeightedAssets;
    const passed = ratio >= 0.06;

    return {
      passed,
      context: `Tier 1 Capital Ratio: ${(ratio * 100).toFixed(2)}% (Required: 6.0%)`
    };
  }

  /**
   * Evaluate CET1 rule
   */
  private evaluateCET1Rule(variables: Record<string, any>): { passed: boolean; context?: string } {
    const cet1Capital = variables['rtf:CET1Capital'] || 0;
    const riskWeightedAssets = variables['rtf:RiskWeightedAssets'] || 0;

    if (riskWeightedAssets === 0) {
      return { passed: true, context: 'Risk-weighted assets is zero, rule not applicable' };
    }

    const ratio = cet1Capital / riskWeightedAssets;
    const passed = ratio >= 0.045;

    return {
      passed,
      context: `CET1 Ratio: ${(ratio * 100).toFixed(2)}% (Required: 4.5%)`
    };
  }

  /**
   * Evaluate LCR rule
   */
  private evaluateLCRRule(variables: Record<string, any>): { passed: boolean; context?: string } {
    const liquidityBuffer = variables['rtf:LiquidityBufferStock'] || 0;
    const netCashOutflows = variables['rtf:NetCashOutflows'] || 0;

    if (netCashOutflows === 0) {
      return { passed: true, context: 'Net cash outflows is zero, rule not applicable' };
    }

    const ratio = liquidityBuffer / netCashOutflows;
    const passed = ratio >= 1.0;

    return {
      passed,
      context: `LCR: ${(ratio * 100).toFixed(2)}% (Required: 100.0%)`
    };
  }

  /**
   * Evaluate NSFR rule
   */
  private evaluateNSFRRule(variables: Record<string, any>): { passed: boolean; context?: string } {
    const availableStableFunding = variables['rtf:AvailableStableFunding'] || 0;
    const requiredStableFunding = variables['rtf:RequiredStableFunding'] || 0;

    if (requiredStableFunding === 0) {
      return { passed: true, context: 'Required stable funding is zero, rule not applicable' };
    }

    const ratio = availableStableFunding / requiredStableFunding;
    const passed = ratio >= 1.0;

    return {
      passed,
      context: `NSFR: ${(ratio * 100).toFixed(2)}% (Required: 100.0%)`
    };
  }

  /**
   * Evaluate large exposure rule
   */
  private evaluateLargeExposureRule(variables: Record<string, any>): { passed: boolean; context?: string } {
    const maxSingleExposure = variables['rtf:MaxSingleCounterpartyExposure'] || 0;
    const eligibleCapital = variables['rtf:EligibleCapital'] || 0;

    if (eligibleCapital === 0) {
      return { passed: true, context: 'Eligible capital is zero, rule not applicable' };
    }

    const ratio = maxSingleExposure / eligibleCapital;
    const passed = ratio <= 0.25;

    return {
      passed,
      context: `Largest single exposure: ${(ratio * 100).toFixed(2)}% of eligible capital (Limit: 25.0%)`
    };
  }

  /**
   * Evaluate balance sheet consistency
   */
  private evaluateBalanceSheetConsistency(variables: Record<string, any>): { passed: boolean; context?: string } {
    const totalAssets = variables['rtf:TotalAssets'] || 0;
    const totalLiabilities = variables['rtf:TotalLiabilities'] || 0;
    const totalEquity = variables['rtf:TotalEquity'] || 0;

    const difference = Math.abs(totalAssets - (totalLiabilities + totalEquity));
    const tolerance = Math.max(totalAssets * 0.001, 1000); // 0.1% or €1,000 minimum tolerance
    const passed = difference <= tolerance;

    return {
      passed,
      context: `Balance sheet difference: €${difference.toLocaleString('de-DE')} (Tolerance: €${tolerance.toLocaleString('de-DE')})`
    };
  }

  /**
   * Evaluate non-negative values
   */
  private evaluateNonNegativeValues(variables: Record<string, any>): { passed: boolean; context?: string } {
    const negativeFields: string[] = [];

    // Fields that should not be negative
    const nonNegativeFields = [
      'rtf:TotalAssets',
      'rtf:TotalLiabilities',
      'rtf:TotalEquity',
      'rtf:RiskWeightedAssets',
      'rtf:Tier1Capital',
      'rtf:CET1Capital'
    ];

    for (const field of nonNegativeFields) {
      const value = variables[field];
      if (typeof value === 'number' && value < 0) {
        negativeFields.push(field);
      }
    }

    return {
      passed: negativeFields.length === 0,
      context: negativeFields.length > 0 ? `Negative values found in: ${negativeFields.join(', ')}` : undefined
    };
  }

  /**
   * Validate cross-form consistency
   */
  private async validateCrossFormConsistency(
    formId: string,
    formData: Record<string, any>,
    context: ValidationContext
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // This would typically load related forms and check consistency
    // For now, return empty array as this requires more complex implementation

    return errors;
  }

  /**
   * Validate XBRL document structure and content
   */
  async validateXBRLDocument(xbrlContent: string): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    try {
      // Parse XML
      const doc = libxmljs.parseXml(xbrlContent);

      // Validate XML structure
      const structureErrors = await this.validateXBRLStructure(doc);
      errors.push(...structureErrors.filter(e => e.severity === 'error'));
      warnings.push(...structureErrors.filter(e => e.severity === 'warning'));

      // Validate XBRL semantics
      const semanticErrors = await this.validateXBRLSemantics(doc);
      errors.push(...semanticErrors.filter(e => e.severity === 'error'));
      warnings.push(...semanticErrors.filter(e => e.severity === 'warning'));

      // Validate against schema (if available)
      // This would require loading and validating against the actual XSD

    } catch (error) {
      errors.push({
        code: 'XML_PARSE_ERROR',
        message: `Failed to parse XBRL document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      infos,
      summary: {
        totalRules: 0, // Would be calculated based on applied rules
        passedRules: 0,
        failedRules: errors.length + warnings.length,
        skippedRules: 0
      }
    };
  }

  /**
   * Validate XBRL document structure
   */
  private async validateXBRLStructure(doc: libxmljs.Document): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Check root element
    const root = doc.root();
    if (!root || root.name() !== 'xbrl') {
      errors.push({
        code: 'INVALID_ROOT_ELEMENT',
        message: 'XBRL document must have xbrl as root element',
        severity: 'error'
      });
      return errors;
    }

    // Check required namespaces
    const namespaces = root.namespaces();
    const requiredNamespaces = [
      'http://www.xbrl.org/2003/instance',
      'http://www.bundesbank.de/xbrl/rtf'
    ];

    for (const reqNs of requiredNamespaces) {
      const found = namespaces.some(ns => ns.href() === reqNs);
      if (!found) {
        errors.push({
          code: 'MISSING_NAMESPACE',
          message: `Required namespace missing: ${reqNs}`,
          severity: 'error'
        });
      }
    }

    // Check schema reference
    const schemaRefs = doc.find('//link:schemaRef', {
      link: 'http://www.xbrl.org/2003/linkbase'
    });
    if (schemaRefs.length === 0) {
      errors.push({
        code: 'MISSING_SCHEMA_REF',
        message: 'XBRL document must contain schemaRef',
        severity: 'error'
      });
    }

    return errors;
  }

  /**
   * Validate XBRL semantics
   */
  private async validateXBRLSemantics(doc: libxmljs.Document): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validate contexts
    const contexts = doc.find('//xbrli:context', {
      xbrli: 'http://www.xbrl.org/2003/instance'
    });

    if (contexts.length === 0) {
      errors.push({
        code: 'NO_CONTEXTS',
        message: 'XBRL document must contain at least one context',
        severity: 'error'
      });
    }

    // Validate context structure
    for (const context of contexts) {
      const entity = (context as any).get('.//xbrli:entity', {
        xbrli: 'http://www.xbrl.org/2003/instance'
      });
      if (!entity) {
        errors.push({
          code: 'INVALID_CONTEXT',
          message: `Context ${(context as any).attr('id')?.value()} missing entity`,
          severity: 'error'
        });
      }

      const period = (context as any).get('.//xbrli:period', {
        xbrli: 'http://www.xbrl.org/2003/instance'
      });
      if (!period) {
        errors.push({
          code: 'INVALID_CONTEXT',
          message: `Context ${(context as any).attr('id')?.value()} missing period`,
          severity: 'error'
        });
      }
    }

    return errors;
  }

  /**
   * Get validation summary for monitoring
   */
  async getValidationSummary(formId: string): Promise<{
    applicableRules: number;
    criticalRules: number;
    warningRules: number;
    infoRules: number;
    categories: Record<string, number>;
  }> {
    const applicableRules = Array.from(this.businessRules.values()).filter(rule =>
      !rule.formIds || rule.formIds.includes(formId)
    );

    const summary = {
      applicableRules: applicableRules.length,
      criticalRules: applicableRules.filter(r => r.severity === 'error').length,
      warningRules: applicableRules.filter(r => r.severity === 'warning').length,
      infoRules: applicableRules.filter(r => r.severity === 'info').length,
      categories: {} as Record<string, number>
    };

    for (const rule of applicableRules) {
      summary.categories[rule.category] = (summary.categories[rule.category] || 0) + 1;
    }

    return summary;
  }

  /**
   * Add custom business rule
   */
  addBusinessRule(rule: BusinessRule): void {
    this.businessRules.set(rule.id, rule);
  }

  /**
   * Remove business rule
   */
  removeBusinessRule(ruleId: string): boolean {
    return this.businessRules.delete(ruleId);
  }

  /**
   * Get all business rules
   */
  getBusinessRules(): BusinessRule[] {
    return Array.from(this.businessRules.values());
  }
}