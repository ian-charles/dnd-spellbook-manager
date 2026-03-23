import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ComponentBadges, ClassBadges } from './SpellBadges';
import { Spell } from '../types/spell';

const baseSpell: Spell = {
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  castingTime: '1 action',
  range: '150 feet',
  duration: 'Instantaneous',
  components: { verbal: true, somatic: true, material: true },
  materials: 'a tiny ball of bat guano and sulfur',
  concentration: false,
  ritual: false,
  description: 'A bright streak flashes.',
  higherLevels: '',
  classes: ['Sorcerer', 'Wizard'],
  source: 'PHB',
  id: 'fireball',
};

describe('ComponentBadges', () => {
  it('should render V, S, M badges when all components are true', () => {
    const { container } = render(<ComponentBadges spell={baseSpell} />);
    const badges = container.querySelectorAll('.component-badge');
    expect(badges).toHaveLength(3);
    expect(badges[0].textContent).toBe('V');
    expect(badges[1].textContent).toBe('S');
    expect(badges[2].textContent).toBe('M');
  });

  it('should only render badges for true components', () => {
    const spell = { ...baseSpell, components: { verbal: true, somatic: false, material: false } };
    const { container } = render(<ComponentBadges spell={spell} />);
    const badges = container.querySelectorAll('.component-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0].textContent).toBe('V');
  });

  it('should show materials as title on M badge', () => {
    const { container } = render(<ComponentBadges spell={baseSpell} />);
    const mBadge = container.querySelector('.badge-material');
    expect(mBadge?.getAttribute('title')).toBe('a tiny ball of bat guano and sulfur');
  });

  it('should not set title on M badge when materials is empty', () => {
    const spell = { ...baseSpell, materials: '' };
    const { container } = render(<ComponentBadges spell={spell} />);
    const mBadge = container.querySelector('.badge-material');
    expect(mBadge?.getAttribute('title')).toBeNull();
  });
});

describe('ClassBadges', () => {
  it('should render 3-letter uppercase abbreviations', () => {
    const { container } = render(<ClassBadges classes={['Sorcerer', 'Wizard']} />);
    const badges = container.querySelectorAll('.class-badge');
    expect(badges).toHaveLength(2);
    expect(badges[0].textContent).toBe('SOR');
    expect(badges[1].textContent).toBe('WIZ');
  });

  it('should render empty container for empty classes', () => {
    const { container } = render(<ClassBadges classes={[]} />);
    const badges = container.querySelectorAll('.class-badge');
    expect(badges).toHaveLength(0);
  });
});
