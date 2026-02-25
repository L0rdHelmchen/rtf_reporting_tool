// RTF Reporting Tool - Shared Types & Utilities
export * from './types';

// Re-export commonly used utilities
export { z } from 'zod';

// Version info
export const VERSION = '1.0.0';
export const SUPPORTED_RTF_VERSION = '2023-12';

// Constants
export const CONSTANTS = {
  RTF_VERSION: '2023-12',
  BUNDESBANK_NAMESPACE: 'http://www.bundesbank.de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31',
  XBRL_INSTANCE_NAMESPACE: 'http://www.xbrl.org/2003/instance',
  SUBMISSION_DEADLINE_WEEKS: 7,
  MAX_FILE_SIZE_MB: 50,
  SUPPORTED_LANGUAGES: ['de', 'en'] as const,
  DEFAULT_LANGUAGE: 'de' as const
} as const;

// German form categories mapping
export const FORM_CATEGORY_NAMES_DE = {
  GRP: 'Gruppenangaben',
  RSK: 'Risiken',
  RDP: 'Risikodeckungspotenzial',
  ILAAP: 'Interne Liquiditätsbewertung',
  KPL: 'Kapitalplanung',
  STA: 'Stammdaten',
  STKK: 'Steuerungskreis-Konzeption',
  RTFK: 'Risikotragfähigkeits-Konzeption',
  STG: 'Stresstests',
  DBL: 'Deckblatt',
  OTHER: 'Sonstige'
} as const;

// Data type descriptions for UI
export const DATA_TYPE_DESCRIPTIONS_DE = {
  si6: 'Text',
  mi1: 'Geldbetrag (EUR)',
  pi2: 'Prozentsatz',
  ii3: 'Ganze Zahl',
  li1: 'Liste',
  di5: 'Datum',
  bi7: 'Ja/Nein',
  ci1: 'Code',
  ti1: 'Zeit',
  url: 'URL',
  mem: 'Mitglied',
  bool: 'Boolean',
  date: 'Datum'
} as const;

// Institution type descriptions
export const INSTITUTION_TYPE_NAMES_DE = {
  bank: 'Kreditinstitut',
  savings_bank: 'Sparkasse',
  cooperative_bank: 'Genossenschaftsbank',
  building_society: 'Bausparkasse',
  investment_firm: 'Wertpapierinstitut',
  other: 'Sonstiges'
} as const;

// Exemption category descriptions
export const EXEMPTION_CATEGORY_NAMES_DE = {
  section_53b: '§ 53b KWG (EU/EWR-Zweigstellen)',
  section_53c: '§ 53c Abs. 1 Nr. 2 KWG (Gebundene Vermittler)',
  securities_trading_bank: 'Wertpapierhandelsbank',
  risk_management_exemption: '§ 2a Abs. 2/5 KWG (Risikomanagement-Freistellung)',
  none: 'Keine Befreiung'
} as const;

// User role descriptions
export const USER_ROLE_NAMES_DE = {
  admin: 'Administrator',
  compliance_officer: 'Compliance-Beauftragter',
  risk_manager: 'Risikomanager',
  data_entry: 'Dateneingabe',
  reviewer: 'Prüfer',
  viewer: 'Betrachter'
} as const;

// Form status descriptions
export const FORM_STATUS_NAMES_DE = {
  draft: 'Entwurf',
  in_review: 'In Prüfung',
  submitted: 'Eingereicht',
  accepted: 'Akzeptiert',
  rejected: 'Abgelehnt'
} as const;