export * from './types';
export { z } from 'zod';
export declare const VERSION = "1.0.0";
export declare const SUPPORTED_RTF_VERSION = "2023-12";
export declare const CONSTANTS: {
    readonly RTF_VERSION: "2023-12";
    readonly BUNDESBANK_NAMESPACE: "http://www.bundesbank.de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31";
    readonly XBRL_INSTANCE_NAMESPACE: "http://www.xbrl.org/2003/instance";
    readonly SUBMISSION_DEADLINE_WEEKS: 7;
    readonly MAX_FILE_SIZE_MB: 50;
    readonly SUPPORTED_LANGUAGES: readonly ["de", "en"];
    readonly DEFAULT_LANGUAGE: "de";
};
export declare const FORM_CATEGORY_NAMES_DE: {
    readonly GRP: "Gruppenangaben";
    readonly RSK: "Risiken";
    readonly RDP: "Risikodeckungspotenzial";
    readonly ILAAP: "Interne Liquiditätsbewertung";
    readonly KPL: "Kapitalplanung";
    readonly STA: "Stammdaten";
    readonly STKK: "Steuerungskreis-Konzeption";
    readonly RTFK: "Risikotragfähigkeits-Konzeption";
    readonly STG: "Stresstests";
    readonly DBL: "Deckblatt";
    readonly OTHER: "Sonstige";
};
export declare const DATA_TYPE_DESCRIPTIONS_DE: {
    readonly si6: "Text";
    readonly mi1: "Geldbetrag (EUR)";
    readonly pi2: "Prozentsatz";
    readonly ii3: "Ganze Zahl";
    readonly li1: "Liste";
    readonly di5: "Datum";
    readonly bi7: "Ja/Nein";
    readonly ci1: "Code";
    readonly ti1: "Zeit";
    readonly url: "URL";
    readonly mem: "Mitglied";
    readonly bool: "Boolean";
    readonly date: "Datum";
};
export declare const INSTITUTION_TYPE_NAMES_DE: {
    readonly bank: "Kreditinstitut";
    readonly savings_bank: "Sparkasse";
    readonly cooperative_bank: "Genossenschaftsbank";
    readonly building_society: "Bausparkasse";
    readonly investment_firm: "Wertpapierinstitut";
    readonly other: "Sonstiges";
};
export declare const EXEMPTION_CATEGORY_NAMES_DE: {
    readonly section_53b: "§ 53b KWG (EU/EWR-Zweigstellen)";
    readonly section_53c: "§ 53c Abs. 1 Nr. 2 KWG (Gebundene Vermittler)";
    readonly securities_trading_bank: "Wertpapierhandelsbank";
    readonly risk_management_exemption: "§ 2a Abs. 2/5 KWG (Risikomanagement-Freistellung)";
    readonly none: "Keine Befreiung";
};
export declare const USER_ROLE_NAMES_DE: {
    readonly admin: "Administrator";
    readonly compliance_officer: "Compliance-Beauftragter";
    readonly risk_manager: "Risikomanager";
    readonly data_entry: "Dateneingabe";
    readonly reviewer: "Prüfer";
    readonly viewer: "Betrachter";
};
export declare const FORM_STATUS_NAMES_DE: {
    readonly draft: "Entwurf";
    readonly in_review: "In Prüfung";
    readonly submitted: "Eingereicht";
    readonly accepted: "Akzeptiert";
    readonly rejected: "Abgelehnt";
};
//# sourceMappingURL=index.d.ts.map