#!/usr/bin/env node
/**
 * RTF Reporting Tool – Existence Assertion Parser
 *
 * Reads all vr-e*.xml files from the XBRL Formula Linkbase val/ directory,
 * extracts ea:existenceAssertion information, and outputs required-fields.json
 * consumed by XBRLSchemaParser and XBRLValidationService.
 *
 * Usage: node scripts/parse-existence-assertions.mjs
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

const OUT_FILE = join(ROOT, 'backend/src/data/required-fields.json');

// ── Minimal XML attribute extractor (no external deps needed) ─────────────────

function getAttr(xml, tag, attr) {
  const tagStart = xml.indexOf(`<${tag} `);
  if (tagStart === -1) return null;
  const tagEnd = xml.indexOf('>', tagStart);
  const tagContent = xml.slice(tagStart, tagEnd);
  const attrMatch = tagContent.match(new RegExp(`${attr}="([^"]+)"`));
  return attrMatch ? attrMatch[1] : null;
}

function getAllTags(xml, tag) {
  const results = [];
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>|<${tag}[^>]*/>`, 'g');
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[0]);
  }
  return results;
}

function getAttrFromElement(element, attr) {
  const match = element.match(new RegExp(`${attr}="([^"]+)"`));
  return match ? match[1] : null;
}

function getTextContent(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return match ? match[1].trim() : null;
}

// ── Parse a single vr-e*.xml file ────────────────────────────────────────────

function parseAssertionFile(filePath, fileName) {
  const xml = readFileSync(filePath, 'utf8');

  // Extract assertion ID
  const assertionId = getAttr(xml, 'ea:existenceAssertion', 'id');
  if (!assertionId) return null;

  // Extract dimension filters
  const dimensionBlocks = getAllTags(xml, 'df:explicitDimension');

  let row = null;
  let col = null;
  let template = null;

  for (const block of dimensionBlocks) {
    const dimQName = getTextContent(block, 'df:qname');
    const memberQName = (() => {
      // Find df:member > df:qname
      const memberBlock = block.match(/<df:member>([\s\S]*?)<\/df:member>/);
      if (!memberBlock) return null;
      return getTextContent(memberBlock[1], 'df:qname');
    })();

    if (!dimQName || !memberQName) continue;

    // Extract local name (after colon)
    const dim = dimQName.split(':')[1];
    const member = memberQName.split(':')[1];

    if (dim === 'ROW') row = member;
    else if (dim === 'COL') col = member;
    else if (dim === 'TEM') template = member;
  }

  // Fallback: derive template and row from filename (vr-e{template}_{row}.xml)
  // E.g. vr-edbl_0045.xml → template=DBL, row=x045
  if (!template || !row) {
    const match = fileName.match(/^vr-e([a-z0-9-]+)_(\d+)\.xml$/);
    if (match) {
      if (!template) template = match[1].toUpperCase();
      // Row member convention: 4-digit number with first zero stripped → x045 from 0045
      if (!row) row = `x${match[2].replace(/^0/, '')}`;
    }
  }

  return { assertionId, template, row, col };
}

// ── Parse German label from companion -lab-de.xml ─────────────────────────────

function parseLabel(labelFilePath) {
  try {
    const xml = readFileSync(labelFilePath, 'utf8');
    // Find label:label element with xml:lang="de"
    const match = xml.match(/xml:lang="de"[^>]*>([^<]+)<\/label:label>/);
    if (match) {
      // Strip the error suffix like ", DBL 010/010"
      const fullLabel = match[1].trim();
      // Remove trailing ", FORM ROW/COL" pattern
      return fullLabel.replace(/,\s*[A-Z0-9-]+\s+\d+\/\d+\s*$/, '').replace(/\s+fehlt\s*$/i, '').trim();
    }
  } catch {
    // label file missing – silent
  }
  return null;
}

// ── Infer data type from German label ─────────────────────────────────────────

function inferDataType(label) {
  if (!label) return 'si6';
  const l = label.toLowerCase();
  if (l.includes('datum') || l.includes('stichtag')) return 'di5';
  if (l.includes('frequenz') || l.includes('umfang') || l.includes('basis')) return 'ei8';
  if (l.includes('betrag') || l.includes('summe') || l.includes('anzahl')) return 'mi1';
  if (l.includes('telefon') || l.includes('mail') || l.includes('name') || l.includes('id') || l.includes('ansprechpartner')) return 'si6';
  return 'si6';
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  console.log('Parsing existence assertions from:', VAL_DIR);

  const files = readdirSync(VAL_DIR);

  // Only process vr-e*.xml (existence assertions), exclude -lab- and -err-
  const assertionFiles = files
    .filter(f => f.startsWith('vr-e') && f.endsWith('.xml') && !f.includes('-lab-') && !f.includes('-err-'))
    .sort();

  console.log(`Found ${assertionFiles.length} existence assertion files`);

  const byTemplate = {};

  for (const file of assertionFiles) {
    const filePath = join(VAL_DIR, file);
    const labelFilePath = join(VAL_DIR, file.replace('.xml', '-lab-de.xml'));

    const assertion = parseAssertionFile(filePath, file);
    if (!assertion || !assertion.template) {
      console.warn(`  Skipping ${file}: could not extract assertion data`);
      continue;
    }

    const rawLabel = parseLabel(labelFilePath);
    const label = rawLabel || assertion.assertionId;

    const entry = {
      assertionId: assertion.assertionId,
      row: assertion.row,
      col: assertion.col || null,
      fieldKey: assertion.col
        ? `${assertion.row}_${assertion.col}`
        : assertion.row,
      label,
      errorLabel: rawLabel ? `${rawLabel} fehlt` : `${assertion.assertionId} fehlt`,
      dataType: inferDataType(rawLabel),
    };

    if (!byTemplate[assertion.template]) {
      byTemplate[assertion.template] = [];
    }
    byTemplate[assertion.template].push(entry);

    console.log(
      `  ${file} → template=${assertion.template} row=${assertion.row}` +
      (assertion.col ? ` col=${assertion.col}` : '') +
      ` label="${label}"`
    );
  }

  const output = {
    version: '2023-12',
    generatedAt: new Date().toISOString(),
    description: 'Required fields derived from XBRL Formula Linkbase ea:existenceAssertion elements',
    requiredFields: byTemplate,
  };

  // Ensure output directory exists
  const outDir = dirname(OUT_FILE);
  mkdirSync(outDir, { recursive: true });

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nWrote ${OUT_FILE}`);

  // Summary
  console.log('\nSummary:');
  for (const [template, fields] of Object.entries(byTemplate)) {
    console.log(`  ${template}: ${fields.length} required field(s)`);
    for (const f of fields) {
      console.log(`    - ${f.fieldKey} (${f.dataType}): ${f.label}`);
    }
  }
}

main();
