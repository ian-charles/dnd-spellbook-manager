export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  classes: string[];
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
  };
  materials: string;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels: string;
  source: string;
}

export interface SpellData {
  version: string;
  generatedAt: string;
  count: number;
  spells: Spell[];
}

export interface SpellFilters {
  searchText?: string;
  levelRange?: { min: number; max: number };
  schools?: string[];
  classes?: string[];
  concentration?: boolean;
  ritual?: boolean;
  componentVerbal?: boolean;
  componentSomatic?: boolean;
  componentMaterial?: boolean;
}
