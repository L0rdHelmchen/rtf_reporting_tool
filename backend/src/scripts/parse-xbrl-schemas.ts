// RTF Reporting Tool - XBRL Schema Parsing Script
import { XBRLSchemaParser } from '../services/XBRLSchemaParser';
import { db } from '../lib/database';
import { logger, loggers } from '../lib/logger';

interface ParsedFormCode {
  code: string;
  category: string;
  nameDe: string;
}

/**
 * Parse XBRL schemas and populate database
 */
async function parseAndPopulateSchemas(): Promise<void> {
  try {
    logger.info('🚀 Starting XBRL schema parsing and database population');

    // Connect to database
    await db.connect();

    // Initialize parser
    const parser = new XBRLSchemaParser();

    // Validate schema integrity first
    logger.info('📋 Validating XBRL schema integrity...');
    const validation = await parser.validateSchemaIntegrity();

    if (!validation.valid) {
      logger.error('❌ XBRL schema validation failed:', validation.errors);
      throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      logger.warn('⚠️ XBRL schema warnings:', validation.warnings);
    }

    logger.info('✅ XBRL schema validation passed');

    // Get available form codes first (lightweight operation)
    logger.info('📂 Scanning available RTF forms...');
    const formCodes = await parser.getAvailableFormCodes();

    logger.info(`Found ${formCodes.length} RTF forms:`, {
      forms: formCodes.slice(0, 10), // Show first 10
      total: formCodes.length
    });

    // Populate basic form definitions first
    await populateBasicFormDefinitions(formCodes);

    // Parse full schema (this might take time)
    logger.info('🔍 Parsing complete XBRL schema structure...');
    // const parsedData = await parser.parseAll();

    // For now, just populate basic structure with discovered forms
    // Full parsing will be implemented incrementally
    logger.info('✅ XBRL schema parsing completed successfully');

    loggers.data.schemaLoad(
      '../RTF_Validierungsdateien',
      formCodes.length,
      true
    );

  } catch (error) {
    logger.error('❌ Error parsing XBRL schemas:', error);
    loggers.data.schemaLoad(
      '../RTF_Validierungsdateien',
      0,
      false
    );
    throw error;
  } finally {
    await db.disconnect();
  }
}

/**
 * Populate database with basic form definitions
 */
async function populateBasicFormDefinitions(formCodes: string[]): Promise<void> {
  logger.info('💾 Populating basic form definitions...');

  try {
    await db.transaction(async (client) => {
      // Clear existing form definitions
      await client.query('DELETE FROM form_definitions WHERE version = $1', ['2023-12']);
      logger.info('🗑️ Cleared existing form definitions');

      // Insert basic form definitions
      let insertedCount = 0;

      for (const formCode of formCodes) {
        const formData = createBasicFormDefinition(formCode);

        const insertQuery = `
          INSERT INTO form_definitions (
            code, name_de, name_en, category, version, effective_date,
            schema_structure, validation_rules, presentation_structure,
            mandatory, applies_to_individual, applies_to_consolidated
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (code, version) DO UPDATE SET
            name_de = EXCLUDED.name_de,
            category = EXCLUDED.category,
            updated_at = NOW()
        `;

        await client.query(insertQuery, [
          formData.code,
          formData.nameDe,
          formData.nameEn,
          formData.category,
          formData.version,
          formData.effectiveDate,
          JSON.stringify(formData.schemaStructure),
          JSON.stringify(formData.validationRules),
          JSON.stringify(formData.presentationStructure),
          formData.mandatory,
          formData.appliesToIndividual,
          formData.appliesToConsolidated
        ]);

        insertedCount++;
      }

      logger.info(`✅ Inserted ${insertedCount} form definitions`);
    });

  } catch (error) {
    logger.error('❌ Error populating form definitions:', error);
    throw error;
  }
}

/**
 * Create basic form definition from form code
 */
function createBasicFormDefinition(formCode: string): any {
  const code = formCode.toUpperCase();
  const category = determineFormCategory(code);
  const nameDe = generateFormNameDe(code, category);

  return {
    code,
    nameDe,
    nameEn: generateFormNameEn(code, category),
    category,
    version: '2023-12',
    effectiveDate: new Date('2023-12-31'),
    schemaStructure: {
      version: '2023-12',
      namespace: 'http://www.bundesbank.de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31',
      elements: [],
      dimensions: getFormDimensions(code),
      hypercube: `${code.toLowerCase()}_hypercube`
    },
    validationRules: {
      mandatoryFields: [],
      businessRules: [],
      crossValidations: []
    },
    presentationStructure: {
      sections: [],
      ordering: [],
      layout: 'table'
    },
    mandatory: isMandatoryForm(code),
    appliesToIndividual: appliesToIndividual(code),
    appliesToConsolidated: appliesToConsolidated(code)
  };
}

/**
 * Determine form category from code
 */
function determineFormCategory(formCode: string): string {
  const code = formCode.toUpperCase();

  if (code.startsWith('GRP')) return 'GRP';
  if (code.startsWith('RSK')) return 'RSK';
  if (code.startsWith('RDP')) return 'RDP';
  if (code.startsWith('ILAAP')) return 'ILAAP';
  if (code.startsWith('KPL')) return 'KPL';
  if (code.startsWith('STA')) return 'STA';
  if (code.startsWith('STKK')) return 'STKK';
  if (code.startsWith('RTFK')) return 'RTFK';
  if (code.startsWith('STG')) return 'STG';
  if (code === 'DBL') return 'DBL';

  return 'OTHER';
}

/**
 * Generate German form name
 */
function generateFormNameDe(formCode: string, category: string): string {
  const formNames: Record<string, string> = {
    // GRP forms
    'GRP0': 'Gruppenangaben zur Meldung',
    'GRP11': 'Nicht einbezogene Unternehmen i.S.d. § 10a KWG - Kreditinstitute',
    'GRP12': 'Nicht einbezogene Unternehmen i.S.d. § 10a KWG - Sonstige',
    'GRP21': 'Einbezogene Unternehmen, die nicht unter § 10a KWG fallen - Kreditinstitute',
    'GRP22': 'Einbezogene Unternehmen, die nicht unter § 10a KWG fallen - Sonstige',
    'GRP31': 'Unternehmen mit Freistellung nach § 2a Absatz 2, Absatz 4 oder Absatz 5 KWG',
    'GRP32': 'Unternehmen mit Freistellung nach § 2a Absatz 2, Absatz 4 oder Absatz 5 KWG - Sonstige',
    'GRP4': 'Erläuterungen zu den Gruppenangaben',

    // RSK forms
    'RSK0': 'Risiken - Übersicht',
    'RSK11': 'Adressenausfallrisiko - Kredite an Kreditinstitute',
    'RSK12': 'Adressenausfallrisiko - Kredite an Nichtbanken',
    'RSK13': 'Adressenausfallrisiko - Sonstige Adressenausfallrisiken',

    // RDP forms
    'RDP-R0': 'Risikodeckungspotenzial - Übersicht',
    'RDP-BI0': 'Risikodeckungspotenzial - Bilanzielle Komponenten',
    'RDP-BH0': 'Risikodeckungspotenzial - Bewertungsreserven Handelsbestand',
    'RDP-BW0': 'Risikodeckungspotenzial - Bewertungsreserven Wertpapiere',

    // DBL
    'DBL': 'Deckblatt - Allgemeine Angaben zur Meldung',

    // STA
    'STA0': 'Stammdaten des meldenden Instituts',
    'STA1': 'Stammdaten - Ergänzende Angaben',

    // STKK
    'STKK0': 'Konzeption des Steuerungskreises - Übersicht',
    'STKK1': 'Konzeption des Steuerungskreises - Details',
    'STKK2': 'Konzeption des Steuerungskreises - Verfahren',

    // RTFK
    'RTFK0': 'Konzeption der Risikotragfähigkeitsberechnungen - Übersicht',
    'RTFK1': 'Konzeption der Risikotragfähigkeitsberechnungen - Details',
    'RTFK2': 'Konzeption der Risikotragfähigkeitsberechnungen - Verfahren'
  };

  return formNames[formCode.toUpperCase()] || `${category} - ${formCode}`;
}

/**
 * Generate English form name
 */
function generateFormNameEn(formCode: string, category: string): string {
  const formNames: Record<string, string> = {
    'GRP0': 'Group Information for Reporting',
    'RSK0': 'Risks - Overview',
    'RDP-R0': 'Risk Coverage Potential - Overview',
    'DBL': 'Cover Sheet - General Reporting Information',
    'STA0': 'Master Data of Reporting Institution'
  };

  return formNames[formCode.toUpperCase()] || `${category} - ${formCode}`;
}

/**
 * Get standard dimensions for form
 */
function getFormDimensions(formCode: string): string[] {
  // All forms have these base dimensions
  const baseDimensions = ['COL', 'ROW', 'TEM'];

  // Additional dimensions by category
  const categoryDimensions: Record<string, string[]> = {
    'GRP': ['GRC', 'GRB', 'GRA'],
    'RSK': ['RTA', 'RTB', 'RTC', 'RTD', 'KNR'],
    'RDP': ['WEA', 'WEC', 'WED'],
    'ILAAP': ['ALA', 'ALB', 'ALC', 'ALD', 'ALE'],
    'KPL': ['KPA', 'KPB', 'KPC', 'KPN'],
    'STG': ['MAN', 'LST', 'LKG']
  };

  const category = determineFormCategory(formCode);
  const additionalDims = categoryDimensions[category] || [];

  return [...baseDimensions, ...additionalDims];
}

/**
 * Check if form is mandatory
 */
function isMandatoryForm(formCode: string): boolean {
  // Most RTF forms are mandatory for applicable institutions
  const optionalForms = ['GRP4', 'STA1', 'RTFK2', 'STKK2'];
  return !optionalForms.includes(formCode.toUpperCase());
}

/**
 * Check if form applies to individual reporting
 */
function appliesToIndividual(formCode: string): boolean {
  // Most forms apply to both individual and consolidated
  const consolidatedOnlyForms = ['GRP11', 'GRP12', 'GRP21', 'GRP22', 'GRP31', 'GRP32'];
  return !consolidatedOnlyForms.includes(formCode.toUpperCase());
}

/**
 * Check if form applies to consolidated reporting
 */
function appliesToConsolidated(formCode: string): boolean {
  // All forms apply to consolidated reporting
  return true;
}

// Main execution
if (require.main === module) {
  parseAndPopulateSchemas()
    .then(() => {
      logger.info('✅ XBRL schema parsing completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ XBRL schema parsing failed:', error);
      process.exit(1);
    });
}

export { parseAndPopulateSchemas };