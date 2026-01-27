import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseSpellPage } from '../parser.js';

function makeDom(html) {
  return new JSDOM(html).window.document;
}

/** Builds a full spell page DOM fixture from individual parts. */
function buildSpellPage({
  name = 'Fireball',
  level = '3rd-level',
  school = 'Evocation',
  castingTime = '1 Action',
  range = '150 Feet',
  components = 'V, S, M',
  duration = 'Instantaneous',
  ritual = false,
  materialsBlurb = '(a tiny ball of bat guano and sulfur)',
  description = '<p>A bright streak flashes from your pointing finger.</p>',
  higherLevels = '<p>When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6.</p>',
  classesText = 'Sorcerer, Wizard',
} = {}) {
  return `
    <html><body>
      <h1 class="page-title">${name}</h1>

      <div class="ddb-statblock">
        <div class="ddb-statblock-item ddb-statblock-item-level">
          <div class="ddb-statblock-item-label">Level</div>
          <div class="ddb-statblock-item-value">${level}</div>
        </div>
        <div class="ddb-statblock-item ddb-statblock-item-casting-time">
          <div class="ddb-statblock-item-label">Casting Time</div>
          <div class="ddb-statblock-item-value">${castingTime}</div>
        </div>
        <div class="ddb-statblock-item ddb-statblock-item-range-area">
          <div class="ddb-statblock-item-label">Range/Area</div>
          <div class="ddb-statblock-item-value">${range}</div>
        </div>
        <div class="ddb-statblock-item ddb-statblock-item-components">
          <div class="ddb-statblock-item-label">Components</div>
          <div class="ddb-statblock-item-value">${components}</div>
        </div>
        <div class="ddb-statblock-item ddb-statblock-item-duration">
          <div class="ddb-statblock-item-label">Duration</div>
          <div class="ddb-statblock-item-value">${duration}</div>
        </div>
        <div class="ddb-statblock-item ddb-statblock-item-school">
          <div class="ddb-statblock-item-label">School</div>
          <div class="ddb-statblock-item-value">${school}</div>
        </div>
      </div>

      ${ritual ? '<i class="i-ritual"></i>' : ''}

      <div class="spell-details">
        <div class="more-info-content">
          <div class="components-blurb">${materialsBlurb}</div>
          ${description}
          ${higherLevels ? `<div class="more-info-content"><h4>At Higher Levels</h4>${higherLevels}</div>` : ''}
        </div>
      </div>

      <div class="spell-classes">
        <span class="class-tag">${classesText}</span>
      </div>
    </body></html>
  `;
}

describe('parseSpellPage', () => {
  it('extracts spell name', () => {
    const doc = makeDom(buildSpellPage({ name: 'Fireball' }));
    const spell = parseSpellPage(doc);
    expect(spell.name).toBe('Fireball');
  });

  it('extracts spell level from Nth-level format', () => {
    const doc = makeDom(buildSpellPage({ level: '3rd-level' }));
    const spell = parseSpellPage(doc);
    expect(spell.level).toBe(3);
  });

  it('extracts cantrip level as 0', () => {
    const doc = makeDom(buildSpellPage({ level: 'Cantrip' }));
    const spell = parseSpellPage(doc);
    expect(spell.level).toBe(0);
  });

  it('handles 1st-level', () => {
    const doc = makeDom(buildSpellPage({ level: '1st-level' }));
    expect(parseSpellPage(doc).level).toBe(1);
  });

  it('handles 2nd-level', () => {
    const doc = makeDom(buildSpellPage({ level: '2nd-level' }));
    expect(parseSpellPage(doc).level).toBe(2);
  });

  it('extracts school', () => {
    const doc = makeDom(buildSpellPage({ school: 'Evocation' }));
    expect(parseSpellPage(doc).school).toBe('Evocation');
  });

  it('extracts casting time', () => {
    const doc = makeDom(buildSpellPage({ castingTime: '1 Action' }));
    expect(parseSpellPage(doc).castingTime).toBe('1 Action');
  });

  it('extracts range', () => {
    const doc = makeDom(buildSpellPage({ range: '150 Feet' }));
    expect(parseSpellPage(doc).range).toBe('150 Feet');
  });

  it('parses V, S, M components', () => {
    const doc = makeDom(buildSpellPage({ components: 'V, S, M' }));
    const spell = parseSpellPage(doc);
    expect(spell.components).toEqual({ verbal: true, somatic: true, material: true });
  });

  it('parses V, S only components', () => {
    const doc = makeDom(buildSpellPage({ components: 'V, S' }));
    const spell = parseSpellPage(doc);
    expect(spell.components).toEqual({ verbal: true, somatic: true, material: false });
  });

  it('parses V only components', () => {
    const doc = makeDom(buildSpellPage({ components: 'V' }));
    const spell = parseSpellPage(doc);
    expect(spell.components).toEqual({ verbal: true, somatic: false, material: false });
  });

  it('parses S, M components', () => {
    const doc = makeDom(buildSpellPage({ components: 'S, M' }));
    const spell = parseSpellPage(doc);
    expect(spell.components).toEqual({ verbal: false, somatic: true, material: true });
  });

  it('extracts materials from components-blurb', () => {
    const doc = makeDom(buildSpellPage({ materialsBlurb: '(a tiny ball of bat guano and sulfur)' }));
    const spell = parseSpellPage(doc);
    expect(spell.materials).toBe('a tiny ball of bat guano and sulfur');
  });

  it('returns empty materials when no blurb present', () => {
    const doc = makeDom(buildSpellPage({ materialsBlurb: '', components: 'V, S' }));
    const spell = parseSpellPage(doc);
    expect(spell.materials).toBe('');
  });

  it('extracts duration', () => {
    const doc = makeDom(buildSpellPage({ duration: 'Instantaneous' }));
    expect(parseSpellPage(doc).duration).toBe('Instantaneous');
  });

  it('detects concentration from duration', () => {
    const doc = makeDom(buildSpellPage({ duration: 'Concentration, up to 1 minute' }));
    const spell = parseSpellPage(doc);
    expect(spell.concentration).toBe(true);
    expect(spell.duration).toBe('Concentration, up to 1 minute');
  });

  it('sets concentration false when not in duration', () => {
    const doc = makeDom(buildSpellPage({ duration: '1 hour' }));
    expect(parseSpellPage(doc).concentration).toBe(false);
  });

  it('detects ritual tag', () => {
    const doc = makeDom(buildSpellPage({ ritual: true }));
    expect(parseSpellPage(doc).ritual).toBe(true);
  });

  it('sets ritual false when no icon', () => {
    const doc = makeDom(buildSpellPage({ ritual: false }));
    expect(parseSpellPage(doc).ritual).toBe(false);
  });

  it('extracts description text', () => {
    const doc = makeDom(buildSpellPage({
      description: '<p>A bright streak flashes from your pointing finger.</p>',
    }));
    const spell = parseSpellPage(doc);
    expect(spell.description).toContain('A bright streak flashes');
  });

  it('extracts higher levels text', () => {
    const doc = makeDom(buildSpellPage({
      higherLevels: '<p>The damage increases by 1d6.</p>',
    }));
    const spell = parseSpellPage(doc);
    expect(spell.higherLevels).toContain('The damage increases by 1d6');
  });

  it('returns empty higherLevels when section absent', () => {
    const doc = makeDom(buildSpellPage({ higherLevels: '' }));
    expect(parseSpellPage(doc).higherLevels).toBe('');
  });

  it('extracts classes', () => {
    const doc = makeDom(buildSpellPage({ classesText: 'Sorcerer, Wizard' }));
    const spell = parseSpellPage(doc);
    expect(spell.classes).toEqual(['Sorcerer', 'Wizard']);
  });

  it('handles single class', () => {
    const doc = makeDom(buildSpellPage({ classesText: 'Warlock' }));
    const spell = parseSpellPage(doc);
    expect(spell.classes).toEqual(['Warlock']);
  });
});
