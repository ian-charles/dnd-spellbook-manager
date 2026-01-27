/**
 * Parse a D&D Beyond spell detail page DOM into raw spell data.
 *
 * Selector strategy mirrors Beyond20's approach:
 *   - Name:       .page-title
 *   - Statblock:  .ddb-statblock-item-{label} .ddb-statblock-item-value
 *   - Ritual:     .i-ritual icon
 *   - Materials:  .components-blurb
 *   - Desc:       .spell-details .more-info-content
 *
 * Each extraction function tries a primary selector then fallbacks.
 * Throws descriptive errors when the expected structure is missing,
 * making it easy to update selectors when D&D Beyond changes markup.
 */

/**
 * @param {Document} doc
 * @returns {{
 *   name: string,
 *   level: number,
 *   school: string,
 *   classes: string[],
 *   castingTime: string,
 *   range: string,
 *   components: { verbal: boolean, somatic: boolean, material: boolean },
 *   materials: string,
 *   duration: string,
 *   concentration: boolean,
 *   ritual: boolean,
 *   description: string,
 *   higherLevels: string,
 * }}
 */
export function parseSpellPage(doc) {
  return {
    name: parseName(doc),
    level: parseLevel(doc),
    school: parseSchool(doc),
    castingTime: parseCastingTime(doc),
    range: parseRange(doc),
    components: parseComponents(doc),
    materials: parseMaterials(doc),
    duration: parseDuration(doc),
    concentration: parseConcentration(doc),
    ritual: parseRitual(doc),
    description: parseDescription(doc),
    higherLevels: parseHigherLevels(doc),
    classes: parseClasses(doc),
  };
}

// ── Helpers ─────────────────────────────────────────────────

function text(el) {
  return el?.textContent?.trim() ?? '';
}

function statblockValue(doc, label) {
  const selectors = [
    `.ddb-statblock-item-${label} .ddb-statblock-item-value`,
    `.ddb-statblock-item-${label} [class*="statblock-item-value"]`,
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) return text(el);
  }
  return '';
}

// ── Individual field parsers ────────────────────────────────

function parseName(doc) {
  const selectors = ['.page-title', 'h1[class*="page-title"]', 'h1'];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el && text(el)) return text(el);
  }
  throw new Error('Could not find spell name. Tried: ' + selectors.join(', '));
}

function parseLevel(doc) {
  const raw = statblockValue(doc, 'level');
  if (/cantrip/i.test(raw)) return 0;
  const match = raw.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  throw new Error(`Could not parse level from: "${raw}"`);
}

function parseSchool(doc) {
  const raw = statblockValue(doc, 'school');
  if (raw) return raw;
  throw new Error('Could not find school in statblock');
}

function parseCastingTime(doc) {
  const raw = statblockValue(doc, 'casting-time') || statblockValue(doc, 'castingtime');
  if (raw) return raw;
  throw new Error('Could not find casting time in statblock');
}

function parseRange(doc) {
  const raw = statblockValue(doc, 'range-area') || statblockValue(doc, 'range');
  if (raw) return raw;
  throw new Error('Could not find range in statblock');
}

function parseComponents(doc) {
  const raw = statblockValue(doc, 'components');
  return {
    verbal: /\bV\b/.test(raw),
    somatic: /\bS\b/.test(raw),
    material: /\bM\b/.test(raw),
  };
}

function parseMaterials(doc) {
  const selectors = [
    '.spell-details .more-info-content .components-blurb',
    '.components-blurb',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) {
      const raw = text(el);
      // Strip surrounding parentheses
      return raw.replace(/^\(/, '').replace(/\)$/, '').trim();
    }
  }
  return '';
}

function parseDuration(doc) {
  const raw = statblockValue(doc, 'duration');
  if (raw) return raw;
  throw new Error('Could not find duration in statblock');
}

function parseConcentration(doc) {
  const duration = statblockValue(doc, 'duration');
  return /^concentration/i.test(duration);
}

function parseRitual(doc) {
  const selectors = ['.i-ritual', '[class*="ritual"]'];
  for (const sel of selectors) {
    if (doc.querySelector(sel)) return true;
  }
  return false;
}

function parseDescription(doc) {
  const container = doc.querySelector('.spell-details .more-info-content');
  if (!container) return '';

  // Collect text from <p> elements, skipping the components-blurb and higher-levels section
  const paragraphs = [];
  for (const child of container.children) {
    if (child.classList?.contains('components-blurb')) continue;
    if (child.classList?.contains('more-info-content')) continue;
    if (child.tagName === 'H4' || child.tagName === 'H3') continue;
    paragraphs.push(text(child));
  }
  return paragraphs.filter(Boolean).join('\n\n');
}

function parseHigherLevels(doc) {
  // Look for "At Higher Levels" heading and grab the text after it
  const headings = doc.querySelectorAll('.spell-details h4, .spell-details h3');
  for (const h of headings) {
    if (/higher\s*levels/i.test(text(h))) {
      // Grab the sibling or parent content after the heading
      const next = h.nextElementSibling;
      if (next) return text(next);
    }
  }

  // Fallback: nested .more-info-content that contains "At Higher Levels"
  const nested = doc.querySelectorAll('.spell-details .more-info-content .more-info-content');
  for (const el of nested) {
    const heading = el.querySelector('h4, h3');
    if (heading && /higher\s*levels/i.test(text(heading))) {
      const paras = [];
      for (const child of el.children) {
        if (child.tagName === 'H4' || child.tagName === 'H3') continue;
        paras.push(text(child));
      }
      return paras.filter(Boolean).join('\n\n');
    }
  }

  return '';
}

function parseClasses(doc) {
  const selectors = ['.spell-classes .class-tag', '.spell-classes'];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) {
      const raw = text(el);
      if (raw) return raw.split(',').map(c => c.trim()).filter(Boolean);
    }
  }
  return [];
}
