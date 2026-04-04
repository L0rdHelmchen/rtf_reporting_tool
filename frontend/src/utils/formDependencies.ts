/**
 * RTF Form Dependency Rules
 *
 * Based on Merkblatt §§ 10,11 FinaRisikoV — defines which forms are always
 * required, which depend on Berichtsumfang (DBL x030), and which are submitted
 * once per Steuerungskreis.
 */

export type FormRequirement =
  | 'always'            // stets einzureichen
  | 'consolidated'      // nur zusammengefasste Basis (x030 = x02)
  | 'per_steuerungskreis'; // je Steuerungskreis

export interface FormDependencyInfo {
  requirement: FormRequirement;
  /** Short label shown as badge */
  label: string;
  /** Tooltip / full explanation */
  description: string;
}

/**
 * Prefix-based rules — matches any form whose code starts with the given prefix.
 * Order matters: first match wins.
 */
const DEPENDENCY_RULES: Array<{ prefixes: string[]; info: FormDependencyInfo }> = [
  {
    prefixes: ['DBL'],
    info: {
      requirement: 'always',
      label: 'Pflicht',
      description: 'Betrifft grundlegende Informationen zum Kreditinstitut und ist stets einzureichen.'
    }
  },
  {
    prefixes: ['RTFK'],
    info: {
      requirement: 'always',
      label: 'Pflicht',
      description: 'Betrifft grundlegende Informationen zum Risikotragfähigkeitskonzept und ist stets einzureichen.'
    }
  },
  {
    prefixes: ['STG'],
    info: {
      requirement: 'always',
      label: 'Pflicht',
      description: 'Betrifft Steuerungsmaßnahmen und ist stets einzureichen.'
    }
  },
  {
    prefixes: ['KPL'],
    info: {
      requirement: 'always',
      label: 'Pflicht',
      description: 'Betrifft die Kapitalplanung und ist stets einzureichen.'
    }
  },
  {
    prefixes: ['ILAAP'],
    info: {
      requirement: 'always',
      label: 'Pflicht',
      description: 'Betrifft das interne Konzept der Liquiditätssteuerung und ist stets einzureichen.'
    }
  },
  {
    prefixes: ['GRP', 'STA'],
    info: {
      requirement: 'consolidated',
      label: 'Zusammengefasste Basis',
      description:
        'Nur für Meldungen auf zusammengefasster Basis einzureichen (Berichtsumfang = Zusammengefasste Meldung im DBL-Vordruck).'
    }
  },
  {
    prefixes: ['STKK', 'RDP', 'RSK'],
    info: {
      requirement: 'per_steuerungskreis',
      label: 'Je Steuerungskreis',
      description: 'Für jeden zum Meldestichtag relevanten Steuerungskreis einzureichen.'
    }
  }
];

/** Returns dependency info for a form code, or undefined if unknown. */
export function getFormDependency(code: string): FormDependencyInfo | undefined {
  const upper = code.toUpperCase();
  for (const rule of DEPENDENCY_RULES) {
    if (rule.prefixes.some(p => {
      if (upper === p) return true;
      if (!upper.startsWith(p)) return false;
      // Allow suffix starting with digit or hyphen (e.g. GRP1, RDP-BH)
      const suffix = upper[p.length];
      return suffix === undefined || /[\d-]/.test(suffix);
    })) {
      return rule.info;
    }
  }
  return undefined;
}

/**
 * Given the DBL Berichtsumfang value (x030), returns whether consolidated-only
 * forms are applicable.
 * x02 = "Zusammengefasste Meldung"
 */
export function isConsolidatedReporting(berichtsumfang: string | undefined): boolean {
  return berichtsumfang === 'x02';
}

/**
 * Returns the applicability of a form given the current context.
 * 'required'    — must be submitted
 * 'conditional' — applies but condition not yet set in DBL
 * 'not_applicable' — condition is set and this form is excluded
 */
export function getFormApplicability(
  code: string,
  berichtsumfang: string | undefined
): 'required' | 'conditional' | 'not_applicable' {
  const dep = getFormDependency(code);
  if (!dep) return 'required'; // unknown forms treated as required

  if (dep.requirement === 'always' || dep.requirement === 'per_steuerungskreis') {
    return 'required';
  }

  if (dep.requirement === 'consolidated') {
    if (berichtsumfang === undefined) return 'conditional'; // DBL not yet filled in
    return isConsolidatedReporting(berichtsumfang) ? 'required' : 'not_applicable';
  }

  return 'required';
}
