#!/usr/bin/env node
/**
 * RTF Reporting Tool – Value Assertion Parser
 *
 * Reads all vr-v*.xml files from the XBRL Formula Linkbase val/ directory,
 * extracts va:valueAssertion information and variable bindings,
 * and outputs value-rules.json consumed by ValueAssertionEvaluator.
 *
 * Usage: node scripts/parse-value-assertions.mjs
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const VAL_DIR = join(
  ROOT,
  'RTF_Validierungsdateien/www.bundesbank.de/de/sprv/xbrl/fws/rtf/rtf-2023-12/2023-12-31/val'
);

const OUT_FILE = join(ROOT, 'backend/src/data/value-rules.json');

// ── XML helpers ───────────────────────────────────────────────────────────────

function unescapeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#xD;/g, '')
    .replace(/&#xA;/g, '')
    .trim();
}

function getAttr(element, attr) {
  const m = element.match(new RegExp(`\\b${attr}="([^"]+)"`));
  return m ? m[1] : null;
}

function getChildText(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`));
  return m ? m[1].trim() : null;
}

/** Returns all self-closing or block elements matching a tag */
function getAllElements(xml, tag) {
  const results = [];
  const regex = new RegExp(`<${tag}\\s[^>]*(?:/>|>[\\s\\S]*?<\\/${tag}>)`, 'g');
  let m;
  while ((m = regex.exec(xml)) !== null) {
    results.push(m[0]);
  }
  return results;
}

/** Returns all arcs matching tag: { from, to, name } */
function getAllArcs(xml, arcTag) {
  const arcs = [];
  const regex = new RegExp(`<${arcTag}[^>]+/>`, 'g');
  let m;
  while ((m = regex.exec(xml)) !== null) {
    const el = m[0];
    const from = el.match(/xlink:from="([^"]+)"/)?.[1];
    const to = el.match(/xlink:to="([^"]+)"/)?.[1];
    const name = el.match(/\bname="([^"]+)"/)?.[1];
    if (from && to) arcs.push({ from, to, name });
  }
  return arcs;
}

/** Parses a df:explicitDimension element → { dim, member } */
function parseDimFilter(el) {
  const memberBlock = el.match(/<df:member>([\s\S]*?)<\/df:member>/);
  const dimQname = getChildText(el, 'df:qname');
  const memberQname = memberBlock ? getChildText(memberBlock[1], 'df:qname') : null;
  if (!dimQname) return null;
  return {
    dim: dimQname.split(':')[1],      // e.g. COL, ROW, TEM, GRA, RTA
    member: memberQname ? memberQname.split(':')[1] : null,  // e.g. x030, RSK
  };
}

// ── Parse a single vr-v*.xml file ─────────────────────────────────────────────

function parseValueAssertionFile(filePath, fileName) {
  const xml = readFileSync(filePath, 'utf8');

  // 1. Extract assertion element
  const assertionMatch = xml.match(/<va:valueAssertion\s[^>]+>/);
  if (!assertionMatch) return null;

  const assertionEl = assertionMatch[0];
  const assertionId = getAttr(assertionEl, 'id');
  const assertionLabel = getAttr(assertionEl, 'xlink:label');
  const rawTest = getAttr(assertionEl, 'test');
  if (!assertionId || !rawTest || !assertionLabel) return null;

  const test = unescapeXml(rawTest);

  // 2. Build label → dimension filter map
  const dimFilterMap = {};
  for (const el of getAllElements(xml, 'df:explicitDimension')) {
    const label = getAttr(el, 'xlink:label');
    if (label) {
      const parsed = parseDimFilter(el);
      if (parsed) dimFilterMap[label] = parsed;
    }
  }

  // 3. Build label → data type (concept name) map
  const conceptNameMap = {};
  for (const el of getAllElements(xml, 'cf:conceptName')) {
    const label = getAttr(el, 'xlink:label');
    if (!label) continue;
    const qname = getChildText(el, 'cf:qname');
    if (qname) conceptNameMap[label] = qname.split(':')[1]; // mi1, si6, bi7, ei8...
  }

  // 4. Get arcs
  const variableArcs = getAllArcs(xml, 'variable:variableArc');
  const setFilterArcs = getAllArcs(xml, 'variable:variableSetFilterArc');
  const filterArcs = getAllArcs(xml, 'variable:variableFilterArc');

  // 5. Build variable name → label mapping (from assertion)
  const varLabelToName = {};
  for (const arc of variableArcs) {
    if (arc.from === assertionLabel && arc.name) {
      varLabelToName[arc.to] = arc.name;
    }
  }

  // 6. Extract global dimension filters (assertion-level)
  const globalFilters = {};
  for (const arc of setFilterArcs) {
    if (arc.from === assertionLabel) {
      const df = dimFilterMap[arc.to];
      if (df && df.member) globalFilters[df.dim] = df.member;
    }
  }

  // Template from TEM global filter, or derive from filename
  let template = globalFilters['TEM'];
  if (!template) {
    const fnMatch = fileName.match(/^vr-v([a-z0-9-]+)_\d+\.xml$/);
    if (fnMatch) template = fnMatch[1].toUpperCase();
  }
  if (!template) return null;

  // 7. Extract fallback values per factVariable label
  const fallbackValues = {};
  const factVarRegex = /<variable:factVariable\s[^>]+>/g;
  let fvMatch;
  while ((fvMatch = factVarRegex.exec(xml)) !== null) {
    const label = getAttr(fvMatch[0], 'xlink:label');
    const fallback = getAttr(fvMatch[0], 'fallbackValue');
    if (label) fallbackValues[label] = fallback ?? null;
  }

  // 8. Build per-variable dimension bindings
  const variables = {};
  for (const [varLabel, varName] of Object.entries(varLabelToName)) {
    const varFilters = { row: null, col: null, dataType: null };

    const filterLabels = filterArcs
      .filter(arc => arc.from === varLabel)
      .map(arc => arc.to);

    for (const filterLabel of filterLabels) {
      const df = dimFilterMap[filterLabel];
      if (df) {
        if (df.dim === 'ROW' && df.member) varFilters.row = df.member;
        if (df.dim === 'COL' && df.member) varFilters.col = df.member;
      }
      if (conceptNameMap[filterLabel] && !varFilters.dataType) {
        varFilters.dataType = conceptNameMap[filterLabel];
      }
    }

    variables[varName] = {
      row: varFilters.row,
      col: varFilters.col,
      fallbackValue: fallbackValues[varLabel] ?? null,
      dataType: varFilters.dataType,
    };
  }

  return {
    assertionId,
    template,
    test,
    globalCol: globalFilters['COL'] ?? null,
    globalRow: globalFilters['ROW'] ?? null,
    variables,
  };
}

// ── Parse German error message from -err-de.xml ───────────────────────────────

function parseErrorMessage(errFilePath) {
  try {
    const xml = readFileSync(errFilePath, 'utf8');
    const m = xml.match(/<msg:message[^>]+xml:lang="de"[^>]*>([^<]+)<\/msg:message>/);
    if (m) return m[1].trim();
  } catch {
    // error file missing – silent
  }
  return null;
}

// ── Classify test pattern for the evaluator ───────────────────────────────────

function classifyTest(test) {
  if (test.startsWith('iaf:')) return 'iaf';
  if (test.startsWith('matches(')) return 'regex';
  if (test.startsWith('if (')) return 'conditional';
  if (test.startsWith('$')) return 'simple';
  return 'unknown';
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('Parsing value assertions from:', VAL_DIR);

  const files = readdirSync(VAL_DIR);

  const assertionFiles = files
    .filter(f =>
      f.startsWith('vr-v') &&
      f.endsWith('.xml') &&
      !f.includes('-lab-') &&
      !f.includes('-err-')
    )
    .sort();

  console.log(`Found ${assertionFiles.length} value assertion files`);

  const rules = [];
  let skipped = 0;
  const byTemplate = {};
  const byPattern = {};

  for (const file of assertionFiles) {
    const filePath = join(VAL_DIR, file);
    const errFilePath = join(VAL_DIR, file.replace('.xml', '-err-de.xml'));

    const rule = parseValueAssertionFile(filePath, file);
    if (!rule) {
      console.warn(`  Skipping ${file}: could not extract assertion data`);
      skipped++;
      continue;
    }

    const errorMessage = parseErrorMessage(errFilePath);
    rule.errorMessage = errorMessage || rule.assertionId;
    rule.pattern = classifyTest(rule.test);

    rules.push(rule);
    byTemplate[rule.template] = (byTemplate[rule.template] || 0) + 1;
    byPattern[rule.pattern] = (byPattern[rule.pattern] || 0) + 1;
  }

  console.log(`\nParsed ${rules.length} rules (${skipped} skipped)\n`);

  console.log('By template:');
  for (const [t, count] of Object.entries(byTemplate).sort()) {
    console.log(`  ${t}: ${count}`);
  }

  console.log('\nBy pattern:');
  for (const [p, count] of Object.entries(byPattern).sort()) {
    console.log(`  ${p}: ${count}`);
  }

  const output = {
    version: '2023-12',
    generatedAt: new Date().toISOString(),
    description:
      'Value assertion rules derived from XBRL Formula Linkbase va:valueAssertion elements',
    rules,
  };

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nWrote ${OUT_FILE}`);
}

main();
