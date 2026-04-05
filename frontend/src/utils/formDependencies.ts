/**
 * RTF Form Dependency Rules
 *
 * Based on Merkblatt §§ 10,11 FinaRisikoV — defines which forms are always
 * required, which depend on Berichtsumfang (DBL x030), and which are submitted
 * once per Steuerungskreis.
 */

export type AccountingStandard = 'hgb' | 'ifrs' | 'hgb_and_ifrs';

export type FormRequirement =
  | 'always'              // stets einzureichen
  | 'consolidated'        // nur zusammengefasste Basis
  | 'per_steuerungskreis' // je Steuerungskreis (alle Standards)
  | 'per_sk_ifrs'         // je Steuerungskreis, nur bei IFRS-Abschluss
  | 'per_sk_hgb'          // je Steuerungskreis, nur bei HGB-Abschluss
  | 'per_sk_barwertig';   // je Steuerungskreis, barwertig (RDP-BW)

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
    prefixes: ['GR', 'GRP', 'STA'],
    info: {
      requirement: 'consolidated',
      label: 'Zusammengefasste Basis',
      description:
        'Nur für Meldungen auf zusammengefasster Basis einzureichen (Berichtsumfang = Zusammengefasste Meldung im DBL-Vordruck).'
    }
  },
  {
    prefixes: ['STKK', 'RSK'],
    info: {
      requirement: 'per_steuerungskreis',
      label: 'Je Steuerungskreis',
      description: 'Für jeden zum Meldestichtag relevanten Steuerungskreis einzureichen.'
    }
  },
  {
    prefixes: ['RDP-BI'],
    info: {
      requirement: 'per_sk_ifrs',
      label: 'Je SK – IFRS',
      description: 'Einzureichen für jeden Steuerungskreis, bei dem das RDP ausgehend von einem IFRS-Jahres- oder -Zwischenabschluss abgeleitet wird.'
    }
  },
  {
    prefixes: ['RDP-BH'],
    info: {
      requirement: 'per_sk_hgb',
      label: 'Je SK – HGB',
      description: 'Einzureichen für jeden Steuerungskreis, bei dem das RDP ausgehend von einem HGB-Jahres- oder -Zwischenabschluss abgeleitet wird.'
    }
  },
  {
    prefixes: ['RDP-BW'],
    info: {
      requirement: 'per_sk_barwertig',
      label: 'Je SK – Barwertig',
      description: 'Einzureichen für jeden Steuerungskreis, bei dem das RDP barwertig abgeleitet wird.'
    }
  },
  {
    prefixes: ['RDP-R'],
    info: {
      requirement: 'per_steuerungskreis',
      label: 'Je SK – Regulatorisch',
      description: 'Einzureichen für jeden Steuerungskreis, bei dem das RDP ausgehend von den regulatorischen Eigenmitteln abgeleitet wird.'
    }
  },
  {
    prefixes: ['RDP'],
    info: {
      requirement: 'per_steuerungskreis',
      label: 'Je Steuerungskreis',
      description: 'RDP-Vordruck je relevantem Steuerungskreis einzureichen.'
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
 * Returns the applicability of a form given institution master data.
 * 'required'        — must be submitted
 * 'conditional'     — institution data not yet available
 * 'not_applicable'  — not required for this institution
 */
export function getFormApplicability(
  code: string,
  isConsolidated: boolean | undefined,
  accountingStandard: AccountingStandard | undefined
): 'required' | 'conditional' | 'not_applicable' {
  const dep = getFormDependency(code);
  if (!dep) return 'required';

  switch (dep.requirement) {
    case 'always':
    case 'per_steuerungskreis':
    case 'per_sk_barwertig':
      return 'required';

    case 'consolidated':
      if (isConsolidated === undefined) return 'conditional';
      return isConsolidated ? 'required' : 'not_applicable';

    case 'per_sk_ifrs':
      if (accountingStandard === undefined) return 'conditional';
      return accountingStandard === 'ifrs' || accountingStandard === 'hgb_and_ifrs'
        ? 'required'
        : 'not_applicable';

    case 'per_sk_hgb':
      if (accountingStandard === undefined) return 'conditional';
      return accountingStandard === 'hgb' || accountingStandard === 'hgb_and_ifrs'
        ? 'required'
        : 'not_applicable';

    default:
      return 'required';
  }
}
