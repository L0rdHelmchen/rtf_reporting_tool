"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORM_STATUS_NAMES_DE = exports.USER_ROLE_NAMES_DE = exports.EXEMPTION_CATEGORY_NAMES_DE = exports.INSTITUTION_TYPE_NAMES_DE = exports.DATA_TYPE_DESCRIPTIONS_DE = exports.FORM_CATEGORY_NAMES_DE = exports.CONSTANTS = exports.SUPPORTED_RTF_VERSION = exports.VERSION = exports.z = void 0;
// RTF Reporting Tool - Shared Types & Utilities
__exportStar(require("./types"), exports);
// Re-export commonly used utilities
var zod_1 = require("zod");
Object.defineProperty(exports, "z", { enumerable: true, get: function () { return zod_1.z; } });
// Version info
exports.VERSION = '1.0.0';
exports.SUPPORTED_RTF_VERSION = '2023-12';
// Constants
exports.CONSTANTS = {
    RTF_VERSION: '2023-12',
    BUNDESBANK_NAMESPACE: 'http://www.bundesbank.de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31',
    XBRL_INSTANCE_NAMESPACE: 'http://www.xbrl.org/2003/instance',
    SUBMISSION_DEADLINE_WEEKS: 7,
    MAX_FILE_SIZE_MB: 50,
    SUPPORTED_LANGUAGES: ['de', 'en'],
    DEFAULT_LANGUAGE: 'de'
};
// German form categories mapping
exports.FORM_CATEGORY_NAMES_DE = {
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
};
// Data type descriptions for UI
exports.DATA_TYPE_DESCRIPTIONS_DE = {
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
};
// Institution type descriptions
exports.INSTITUTION_TYPE_NAMES_DE = {
    bank: 'Kreditinstitut',
    savings_bank: 'Sparkasse',
    cooperative_bank: 'Genossenschaftsbank',
    building_society: 'Bausparkasse',
    investment_firm: 'Wertpapierinstitut',
    other: 'Sonstiges'
};
// Exemption category descriptions
exports.EXEMPTION_CATEGORY_NAMES_DE = {
    section_53b: '§ 53b KWG (EU/EWR-Zweigstellen)',
    section_53c: '§ 53c Abs. 1 Nr. 2 KWG (Gebundene Vermittler)',
    securities_trading_bank: 'Wertpapierhandelsbank',
    risk_management_exemption: '§ 2a Abs. 2/5 KWG (Risikomanagement-Freistellung)',
    none: 'Keine Befreiung'
};
// User role descriptions
exports.USER_ROLE_NAMES_DE = {
    admin: 'Administrator',
    compliance_officer: 'Compliance-Beauftragter',
    risk_manager: 'Risikomanager',
    data_entry: 'Dateneingabe',
    reviewer: 'Prüfer',
    viewer: 'Betrachter'
};
// Form status descriptions
exports.FORM_STATUS_NAMES_DE = {
    draft: 'Entwurf',
    in_review: 'In Prüfung',
    submitted: 'Eingereicht',
    accepted: 'Akzeptiert',
    rejected: 'Abgelehnt'
};
//# sourceMappingURL=index.js.map