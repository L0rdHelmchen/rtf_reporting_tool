// RTF Reporting Tool - Enhanced XBRL Schema Parser for Phase 3
import { promises as fs } from 'fs';
import path from 'path';
import libxmljs from 'libxmljs2';
import winston from 'winston';

// Configure logger for XBRL parser
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export interface XBRLConcept {
  id: string;
  name: string;
  type: string;
  substitutionGroup?: string;
  periodType: 'instant' | 'duration';
  balance?: 'debit' | 'credit';
  abstract?: boolean;
  nillable?: boolean;
  labels?: Record<string, string>; // Language -> Label mapping
  namespace: string;
  dataType?: 'si6' | 'mi1' | 'pi2' | 'ii3' | 'di5' | 'bi7' | 'ei8' | 'text';
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface XBRLDimension {
  id: string;
  name: string;
  type: 'explicit' | 'typed';
  namespace: string;
  members: XBRLDimensionMember[];
  isDefault?: boolean;
}

export interface XBRLDimensionMember {
  id: string;
  name: string;
  parentId?: string;
  level: number;
  labels?: Record<string, string>;
  namespace: string;
  usable?: boolean;
}

export interface XBRLHypercube {
  id: string;
  name: string;
  dimensions: string[];
  primaryItems: string[];
  namespace: string;
  closed?: boolean;
}

export interface FormDefinition {
  id: string;
  code: string;
  name: string;
  namespace: string;
  concepts: string[];
  hypercubes: string[];
  roles: string[];
  sections: FormSection[];
  version: string;
  entryPoint?: string;
  taxonomyVersion?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
  parent?: string;
  roleURI?: string;
  repeatable?: boolean;
  conditional?: {
    dependsOn: string;
    showWhen: any;
  };
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  dataType: 'si6' | 'mi1' | 'pi2' | 'ii3' | 'di5' | 'bi7' | 'ei8' | 'text';
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
  };
  enumOptions?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  helpText?: string;
  conceptId: string;
}

export interface XBRLContext {
  id: string;
  entity: {
    identifier: {
      scheme: string;
      value: string;
    };
  };
  period: {
    instant?: string;
    startDate?: string;
    endDate?: string;
  };
  scenario?: {
    [dimensionId: string]: string;
  };
}

export interface XBRLFact {
  concept: string;
  contextRef: string;
  value: any;
  unitRef?: string;
  decimals?: number;
  precision?: number;
  id?: string;
}

export class XBRLSchemaParser {
  private concepts = new Map<string, XBRLConcept>();
  private dimensions = new Map<string, XBRLDimension>();
  private hypercubes = new Map<string, XBRLHypercube>();
  private forms = new Map<string, FormDefinition>();
  private labels = new Map<string, Record<string, string>>();
  private namespaces = new Map<string, string>();
  private roles = new Map<string, string>();

  constructor(private basePath: string) {
    this.initializeNamespaces();
  }

  private initializeNamespaces(): void {
    this.namespaces.set('xs', 'http://www.w3.org/2001/XMLSchema');
    this.namespaces.set('xbrli', 'http://www.xbrl.org/2003/instance');
    this.namespaces.set('link', 'http://www.xbrl.org/2003/linkbase');
    this.namespaces.set('xlink', 'http://www.w3.org/1999/xlink');
    this.namespaces.set('gen', 'http://xbrl.org/2008/generic');
    this.namespaces.set('label', 'http://xbrl.org/2008/label');
    this.namespaces.set('xbrldt', 'http://xbrl.org/2005/xbrldt');
    this.namespaces.set('model', 'http://www.eurofiling.info/xbrl/ext/model');
  }

  async parseRTFTaxonomy(): Promise<void> {
    try {
      logger.info('Starting comprehensive RTF taxonomy parsing...');

      // 1. Parse main taxonomy schema
      const mainSchemaPath = path.join(
        this.basePath,
        'RTF_Validierungsdateien/www.bundesbank.de/de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31/tax.xsd'
      );
      await this.parseMainTaxonomy(mainSchemaPath);

      // 2. Parse dimension dictionaries
      await this.parseDimensionDictionaries();

      // 3. Parse all form schemas
      await this.parseAllFormSchemas();

      // 4. Build form structures with fields
      await this.buildFormStructures();

      logger.info(`Parsing complete. Found ${this.forms.size} forms, ${this.concepts.size} concepts, ${this.dimensions.size} dimensions`);
    } catch (error) {
      logger.error(`Failed to parse RTF taxonomy: ${error}`);
      throw error;
    }
  }

  async parseMainTaxonomy(schemaPath: string): Promise<void> {
    try {
      logger.info(`Parsing main taxonomy schema: ${schemaPath}`);
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const doc = libxmljs.parseXml(schemaContent);

      // Extract namespace mappings
      const schema = doc.root();
      if (!schema) throw new Error('Invalid XML schema');

      const targetNamespace = schema.attr('targetNamespace')?.value();
      if (targetNamespace) {
        this.namespaces.set('target', targetNamespace);
      }

      logger.info(`Found target namespace: ${targetNamespace}`);
    } catch (error) {
      logger.error(`Failed to parse main taxonomy: ${error}`);
      throw error;
    }
  }

  async parseDimensionDictionaries(): Promise<void> {
    try {
      logger.info('Parsing dimension dictionaries...');

      const dimensionSchemaPath = path.join(
        this.basePath,
        'RTF_Validierungsdateien/www.bundesbank.de/de/sprv/xbrl/dict/dim/dim.xsd'
      );

      if (await this.fileExists(dimensionSchemaPath)) {
        await this.parseDimensionSchema(dimensionSchemaPath);
      }

      // Parse domain member files
      const domainPath = path.join(
        this.basePath,
        'RTF_Validierungsdateien/www.bundesbank.de/de/sprv/xbrl/dict/dom'
      );

      if (await this.fileExists(domainPath)) {
        const domains = await fs.readdir(domainPath);
        for (const domain of domains) {
          const domainDir = path.join(domainPath, domain);
          const stat = await fs.stat(domainDir);
          if (stat.isDirectory()) {
            await this.parseDomainMembers(domainDir, domain);
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to parse dimension dictionaries: ${error}`);
    }
  }

  async parseDimensionSchema(schemaPath: string): Promise<void> {
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const doc = libxmljs.parseXml(schemaContent);
      const schema = doc.root()!;

      // Parse dimension elements using XPath
      const elements = schema.find('//xs:element[@substitutionGroup]', this.namespaces) as libxmljs.Element[];

      for (const element of elements) {
        const name = element.attr('name')?.value();
        const id = element.attr('id')?.value() || name;
        const substitutionGroup = element.attr('substitutionGroup')?.value();

        if (name && substitutionGroup?.includes('dimensionItem')) {
          const dimension: XBRLDimension = {
            id: id!,
            name: name,
            type: 'explicit',
            namespace: this.namespaces.get('target') || '',
            members: []
          };

          this.dimensions.set(dimension.id, dimension);
        }
      }
    } catch (error) {
      logger.error(`Failed to parse dimension schema: ${error}`);
    }
  }

  async parseDomainMembers(domainDir: string, domainCode: string): Promise<void> {
    try {
      const memberSchemaPath = path.join(domainDir, 'mem.xsd');
      const labelPath = path.join(domainDir, 'mem-lab-de.xml');

      if (!(await this.fileExists(memberSchemaPath))) return;

      // Parse member schema
      const schemaContent = await fs.readFile(memberSchemaPath, 'utf8');
      const doc = libxmljs.parseXml(schemaContent);
      const schema = doc.root()!;

      const elements = schema.find('//xs:element', this.namespaces) as libxmljs.Element[];
      const members: XBRLDimensionMember[] = [];

      for (const element of elements) {
        const name = element.attr('name')?.value();
        const id = element.attr('id')?.value() || name;
        const substitutionGroup = element.attr('substitutionGroup')?.value();

        if (name && substitutionGroup?.includes('domainMemberItem')) {
          const member: XBRLDimensionMember = {
            id: id!,
            name: name,
            level: 0,
            namespace: this.namespaces.get('target') || '',
            usable: true
          };

          members.push(member);
        }
      }

      // Parse German labels for members
      if (await this.fileExists(labelPath)) {
        const memberLabels = await this.parseGenericLabelLinkbase(labelPath);
        for (const member of members) {
          if (memberLabels.has(member.id)) {
            member.labels = memberLabels.get(member.id);
          }
        }
      }

      // Associate members with dimensions
      const relatedDimension = Array.from(this.dimensions.values())
        .find(dim => dim.name.toLowerCase().includes(domainCode.toLowerCase()));

      if (relatedDimension) {
        relatedDimension.members = members;
      }

    } catch (error) {
      logger.error(`Failed to parse domain members for ${domainCode}: ${error}`);
    }
  }

  async parseAllFormSchemas(): Promise<void> {
    try {
      const formsPath = path.join(
        this.basePath,
        'RTF_Validierungsdateien/www.bundesbank.de/de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31/tab'
      );

      const formDirs = await fs.readdir(formsPath);

      // Process each form directory
      for (const formDir of formDirs) {
        const formDirPath = path.join(formsPath, formDir);
        const stat = await fs.stat(formDirPath);

        if (stat.isDirectory()) {
          const schemaPath = path.join(formDirPath, `${formDir}.xsd`);
          if (await this.fileExists(schemaPath)) {
            await this.parseFormSchema(schemaPath);
          }
        }
      }

      logger.info(`Parsed ${this.forms.size} form schemas`);
    } catch (error) {
      logger.error(`Failed to parse form schemas: ${error}`);
    }
  }

  async parseFormSchema(schemaPath: string): Promise<FormDefinition | null> {
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const doc = libxmljs.parseXml(schemaContent);
      const schema = doc.root()!;

      const targetNamespace = schema.attr('targetNamespace')?.value();
      const formCode = this.extractFormCodeFromPath(schemaPath);

      if (!formCode) {
        logger.warn(`Could not extract form code from path: ${schemaPath}`);
        return null;
      }

      const form: FormDefinition = {
        id: formCode.toLowerCase(),
        code: formCode.toUpperCase(),
        name: `${formCode.toUpperCase()} Form`,
        namespace: targetNamespace || '',
        concepts: [],
        hypercubes: [],
        roles: [],
        sections: [],
        version: '2023-12-31',
        taxonomyVersion: '2.2'
      };

      // Parse linkbase references
      const linkbaseRefs = schema.find('//link:linkbaseRef', this.namespaces) as libxmljs.Element[];

      // Parse German labels first
      for (const linkbaseRef of linkbaseRefs) {
        const href = linkbaseRef.attr('href')?.value();
        if (href?.endsWith('-lab-de.xml')) {
          const linkbasePath = path.join(path.dirname(schemaPath), href);
          const labelMap = await this.parseGenericLabelLinkbase(linkbasePath);

          // Merge labels into main labels map
          for (const [key, value] of labelMap) {
            this.labels.set(key, value);
          }
        }
      }

      // Parse role types
      const roleTypes = schema.find('//link:roleType', this.namespaces) as libxmljs.Element[];
      for (const roleType of roleTypes) {
        const roleURI = roleType.attr('roleURI')?.value();
        if (roleURI) {
          form.roles.push(roleURI);
          this.roles.set(roleURI, this.extractRoleDescription(roleURI));
        }
      }

      // Parse elements (concepts)
      const elements = schema.find('//xs:element[@name]', this.namespaces) as libxmljs.Element[];
      for (const element of elements) {
        const concept = this.parseElement(element, targetNamespace || '');
        if (concept) {
          this.concepts.set(concept.id, concept);
          form.concepts.push(concept.id);
        }
      }

      // Get German name from labels if available
      const formTableElement = Array.from(this.labels.keys()).find(key =>
        key.toLowerCase().includes(formCode.toLowerCase()) && this.labels.get(key)?.['de']
      );
      if (formTableElement) {
        const germanName = this.labels.get(formTableElement)?.['de'];
        if (germanName) {
          form.name = germanName;
        }
      }

      this.forms.set(form.id, form);
      return form;
    } catch (error) {
      logger.error(`Failed to parse form schema ${schemaPath}: ${error}`);
      return null;
    }
  }

  async parseGenericLabelLinkbase(linkbasePath: string): Promise<Map<string, Record<string, string>>> {
    const labelMap = new Map<string, Record<string, string>>();

    try {
      if (!(await this.fileExists(linkbasePath))) {
        return labelMap;
      }

      const linkbaseContent = await fs.readFile(linkbasePath, 'utf8');
      const doc = libxmljs.parseXml(linkbaseContent);
      const linkbase = doc.root()!;

      const links = linkbase.find('//gen:link | //link:labelLink', this.namespaces) as libxmljs.Element[];

      for (const link of links) {
        const locs = link.find('.//link:loc', this.namespaces) as libxmljs.Element[];
        const labels = link.find('.//label:label | .//link:label', this.namespaces) as libxmljs.Element[];
        const arcs = link.find('.//gen:arc | .//link:labelArc', this.namespaces) as libxmljs.Element[];

        // Create mapping from locator labels to element IDs
        const locMap = new Map<string, string>();
        for (const loc of locs) {
          const href = loc.attr('href')?.value();
          const label = loc.attr('label')?.value();
          if (href && label) {
            const elementId = href.split('#')[1];
            if (elementId) {
              locMap.set(label, elementId);
            }
          }
        }

        // Create mapping from label references to label texts
        const labelTexts = new Map<string, { text: string; lang: string }>();
        for (const label of labels) {
          const labelText = label.text().trim();
          const lang = label.attr('lang')?.value() || 'en';
          const labelRef = label.attr('label')?.value();

          if (labelText && labelRef) {
            labelTexts.set(labelRef, { text: labelText, lang });
          }
        }

        // Connect labels to elements via arcs
        for (const arc of arcs) {
          const from = arc.attr('from')?.value();
          const to = arc.attr('to')?.value();

          if (from && to) {
            const elementId = locMap.get(from);
            const labelData = labelTexts.get(to);

            if (elementId && labelData) {
              if (!labelMap.has(elementId)) {
                labelMap.set(elementId, {});
              }
              labelMap.get(elementId)![labelData.lang] = labelData.text;
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Failed to parse label linkbase ${linkbasePath}: ${error}`);
    }

    return labelMap;
  }

  private parseElement(element: libxmljs.Element, namespace: string): XBRLConcept | null {
    const name = element.attr('name')?.value();
    const id = element.attr('id')?.value() || name;
    const type = element.attr('type')?.value();
    const substitutionGroup = element.attr('substitutionGroup')?.value();
    const periodType = element.attr('periodType')?.value();
    const balance = element.attr('balance')?.value();
    const abstract = element.attr('abstract')?.value() === 'true';
    const nillable = element.attr('nillable')?.value() !== 'false';

    if (!name || !id) return null;

    const concept: XBRLConcept = {
      id,
      name,
      type: type || 'xbrli:stringItemType',
      substitutionGroup,
      periodType: (periodType as 'instant' | 'duration') || 'instant',
      balance: balance as 'debit' | 'credit',
      abstract,
      nillable,
      labels: this.labels.get(id) || {},
      namespace,
      dataType: this.mapXBRLTypeToFormDataType(type || ''),
      validation: this.extractValidationRules(type || '')
    };

    return concept;
  }

  private mapXBRLTypeToFormDataType(xbrlType: string): 'si6' | 'mi1' | 'pi2' | 'ii3' | 'di5' | 'bi7' | 'ei8' | 'text' {
    if (xbrlType.includes('string') || xbrlType.includes('token')) return 'si6';
    if (xbrlType.includes('monetary') || xbrlType.includes('decimal')) return 'mi1';
    if (xbrlType.includes('percent')) return 'pi2';
    if (xbrlType.includes('integer') || xbrlType.includes('int')) return 'ii3';
    if (xbrlType.includes('date')) return 'di5';
    if (xbrlType.includes('boolean')) return 'bi7';
    if (xbrlType.includes('enum')) return 'ei8';
    return 'text';
  }

  private extractValidationRules(type: string): any {
    const rules: any = {};

    if (type.includes('string')) {
      rules.maxLength = type.includes('si6') ? 6 : 255;
    }

    if (type.includes('decimal') || type.includes('monetary')) {
      rules.min = 0;
      rules.max = Number.MAX_SAFE_INTEGER;
    }

    return Object.keys(rules).length > 0 ? rules : undefined;
  }

  private async buildFormStructures(): Promise<void> {
    try {
      logger.info('Building form structures and fields...');

      for (const form of this.forms.values()) {
        // Create sections based on roles or default section
        if (form.roles.length > 0) {
          form.sections = form.roles.map((roleURI, index) => ({
            id: `section_${index + 1}`,
            title: this.extractSectionTitle(roleURI, form.code),
            description: `Section ${index + 1} for ${form.code}`,
            fields: this.buildFieldsForSection(form.concepts, index, form.roles.length),
            order: index + 1,
            roleURI
          }));
        } else {
          // Create default section with all fields
          form.sections.push({
            id: 'default_section',
            title: 'Eingaben',
            description: `Datenfelder für ${form.name}`,
            fields: this.buildFieldsForSection(form.concepts, 0, 1),
            order: 1
          });
        }
      }

      logger.info(`Built field structures for ${this.forms.size} forms`);
    } catch (error) {
      logger.error(`Failed to build form structures: ${error}`);
    }
  }

  private buildFieldsForSection(conceptIds: string[], sectionIndex: number, totalSections: number): FormField[] {
    const fields: FormField[] = [];

    // Distribute concepts across sections
    const conceptsPerSection = Math.ceil(conceptIds.length / totalSections);
    const startIndex = sectionIndex * conceptsPerSection;
    const endIndex = Math.min(startIndex + conceptsPerSection, conceptIds.length);

    const sectionConcepts = conceptIds.slice(startIndex, endIndex);

    for (const conceptId of sectionConcepts) {
      const concept = this.concepts.get(conceptId);
      if (!concept || concept.abstract) continue;

      const field: FormField = {
        id: conceptId,
        name: concept.name,
        label: concept.labels?.['de'] || concept.name,
        dataType: concept.dataType || 'text',
        required: false, // TODO: Determine from validation rules
        validation: concept.validation,
        conceptId: conceptId,
        helpText: this.generateHelpText(concept)
      };

      // Add enum options for enumeration fields
      if (field.dataType === 'ei8') {
        field.enumOptions = this.getEnumOptionsForConcept(conceptId);
      }

      fields.push(field);
    }

    return fields;
  }

  private generateHelpText(concept: XBRLConcept): string | undefined {
    if (concept.dataType === 'mi1') return 'Betrag in Euro eingeben';
    if (concept.dataType === 'pi2') return 'Prozentsatz eingeben (z.B. 5.25 für 5,25%)';
    if (concept.dataType === 'di5') return 'Datum im Format TT.MM.JJJJ';
    return undefined;
  }

  private getEnumOptionsForConcept(conceptId: string): Array<{value: string; label: string; description?: string}> {
    // TODO: Extract enum options from dimensions/domains
    return [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ];
  }

  private extractFormCodeFromPath(schemaPath: string): string | null {
    const match = schemaPath.match(/\/tab\/([^\/]+)\/[^\/]+\.xsd$/);
    return match ? match[1] : null;
  }

  private extractRoleDescription(roleURI: string): string {
    const parts = roleURI.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  private extractSectionTitle(roleURI: string, formCode: string): string {
    if (roleURI.includes('/1')) return 'Grunddaten';
    if (roleURI.includes('/2')) return 'Zusätzliche Angaben';
    if (roleURI.includes('/3')) return 'Weitere Details';
    if (roleURI.includes('/4')) return 'Ergänzende Informationen';

    return `Abschnitt für ${formCode}`;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Public getters and utility methods
  getConcepts(): Map<string, XBRLConcept> {
    return this.concepts;
  }

  getDimensions(): Map<string, XBRLDimension> {
    return this.dimensions;
  }

  getHypercubes(): Map<string, XBRLHypercube> {
    return this.hypercubes;
  }

  getForms(): Map<string, FormDefinition> {
    return this.forms;
  }

  getFormDefinition(formId: string): FormDefinition | undefined {
    return this.forms.get(formId.toLowerCase());
  }

  getGermanLabel(conceptId: string): string | undefined {
    return this.labels.get(conceptId)?.['de'];
  }

  // Generate XBRL contexts for form data
  generateXBRLContexts(institutionId: string, reportingPeriod: string): XBRLContext[] {
    const contexts: XBRLContext[] = [];

    // Base context
    contexts.push({
      id: 'ctx_base',
      entity: {
        identifier: {
          scheme: 'http://www.bundesbank.de/sprv/xbrl/dict/dom/bb',
          value: institutionId
        }
      },
      period: {
        instant: reportingPeriod
      }
    });

    return contexts;
  }

  // Generate XBRL facts from form data
  generateXBRLFacts(formId: string, formData: any, contextMap: Map<string, string> = new Map()): XBRLFact[] {
    const form = this.getFormDefinition(formId);
    if (!form) return [];

    const facts: XBRLFact[] = [];

    for (const section of form.sections) {
      for (const field of section.fields) {
        if (formData[field.name] !== undefined && formData[field.name] !== null && formData[field.name] !== '') {
          const contextRef = contextMap.get(field.conceptId) || 'ctx_base';

          facts.push({
            concept: field.conceptId,
            contextRef,
            value: formData[field.name],
            decimals: this.getDecimalsForField(field),
            id: `fact_${field.id}_${Date.now()}`
          });
        }
      }
    }

    return facts;
  }

  private getDecimalsForField(field: FormField): number | undefined {
    if (field.dataType === 'mi1') return 2; // Money fields
    if (field.dataType === 'pi2') return 4; // Percentage fields
    return undefined;
  }

  // Validation method
  validateFormData(formId: string, formData: any): { valid: boolean; errors: Array<{field: string; message: string}> } {
    const form = this.getFormDefinition(formId);
    if (!form) {
      return { valid: false, errors: [{ field: 'form', message: 'Form definition not found' }] };
    }

    const errors: Array<{field: string; message: string}> = [];

    for (const section of form.sections) {
      for (const field of section.fields) {
        const value = formData[field.name];

        // Check required fields
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push({ field: field.name, message: `${field.label} ist erforderlich` });
          continue;
        }

        if (value !== undefined && value !== null && value !== '') {
          // Validate based on data type
          if (!this.validateFieldValue(field, value)) {
            errors.push({ field: field.name, message: `Ungültiger Wert für ${field.label}` });
          }

          // Validate against field validation rules
          if (field.validation && !this.validateFieldRules(field, value)) {
            errors.push({ field: field.name, message: `Wert für ${field.label} entspricht nicht den Validierungsregeln` });
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private validateFieldValue(field: FormField, value: any): boolean {
    switch (field.dataType) {
      case 'mi1': // Money
      case 'pi2': // Percentage
        return !isNaN(parseFloat(value)) && isFinite(value);
      case 'ii3': // Integer
        return Number.isInteger(Number(value));
      case 'di5': // Date
        return !isNaN(Date.parse(value));
      case 'bi7': // Boolean
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'si6': // String
      case 'text':
      default:
        return typeof value === 'string';
    }
  }

  private validateFieldRules(field: FormField, value: any): boolean {
    if (!field.validation) return true;

    if (field.validation.min !== undefined && Number(value) < field.validation.min) {
      return false;
    }

    if (field.validation.max !== undefined && Number(value) > field.validation.max) {
      return false;
    }

    if (field.validation.maxLength !== undefined && String(value).length > field.validation.maxLength) {
      return false;
    }

    if (field.validation.pattern !== undefined) {
      const regex = new RegExp(field.validation.pattern);
      return regex.test(String(value));
    }

    return true;
  }
}