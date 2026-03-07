import { roll1d6, roll2d6, pick, pickUnique } from '../../utils/dice';

export interface SophontProfile {
  name: string;
  homeworld: HomeworldType;
  bodyPlan: BodyPlan;
  senses: string[];
  locomotion: string;
  diet: string;
  socialStructure: string;
  technologicalAptitude: string;
  culturalTraits: string[];
  attributeModifiers: AttributeModifiers;
  lifespan: string;
  averageSize: string;
  notes: string[];
}

export interface AttributeModifiers {
  STR: number;
  DEX: number;
  END: number;
  INT: number;
  EDU: number;
  SOC: number;
}

export type HomeworldType =
  | 'Desert World'
  | 'Ocean World'
  | 'Dense Jungle World'
  | 'Frozen Tundra World'
  | 'Airless Rock'
  | 'High Gravity World'
  | 'Low Gravity World'
  | 'Temperate Garden World'
  | 'Volcanic World'
  | 'Gas Giant Moon';

export interface BodyPlan {
  symmetry: string;
  limbs: string;
  covering: string;
  reproduction: string;
}

const HOMEWORLD_TYPES: HomeworldType[] = [
  'Desert World',
  'Ocean World',
  'Dense Jungle World',
  'Frozen Tundra World',
  'Airless Rock',
  'High Gravity World',
  'Low Gravity World',
  'Temperate Garden World',
  'Volcanic World',
  'Gas Giant Moon',
];

const SYMMETRY_OPTIONS = ['Bilateral', 'Radial (4)', 'Radial (6)', 'Asymmetric', 'Bilateral with vestigial third axis'];
const LIMB_OPTIONS = ['2 arms, 2 legs', '4 arms, 2 legs', '6 limbs (multi-purpose)', '2 arms, 4 legs', '0 limbs (serpentine)', 'Tentacles (4)', 'Tentacles (8)', '2 legs only (manipulator tendrils)'];
const COVERING_OPTIONS = ['Smooth skin', 'Scales', 'Thick hide', 'Carapace/shell', 'Dense fur', 'Fine feathers', 'Bony plates', 'Mucous membrane'];
const REPRODUCTION_OPTIONS = ['Live birth, K-strategy', 'Live birth, r-strategy', 'Egg layers (small clutch)', 'Egg layers (large clutch)', 'Budding/fission', 'External spore dispersal'];
const SENSE_OPTIONS = ['Vision (full spectrum)', 'Vision (limited spectrum)', 'Infrared sensing', 'Echolocation', 'Magnetic field detection', 'Electroreception', 'Vibration/tremorsense', 'Chemical trail sensing', 'Sonar', 'Pressure waves (lateral line)'];
const LOCOMOTION_OPTIONS = ['Bipedal walking', 'Quadrupedal walking', 'Flying (wings)', 'Swimming (primary)', 'Burrowing', 'Arboreal (swinging/climbing)', 'Slithering', 'Rolling/tumbling', 'Jet propulsion (aquatic)', 'Hovering (gas sacs)'];
const DIET_OPTIONS = ['Obligate carnivore', 'Herbivore', 'Omnivore', 'Filter feeder', 'Photosynthetic supplement', 'Chemosynthetic', 'Lithotroph (mineral-based)', 'Fungal/decomposer'];
const SOCIAL_STRUCTURE_OPTIONS = ['Solitary hunters', 'Mated pairs (lifelong)', 'Small family units', 'Extended clan/tribe', 'Hive mind (distributed)', 'Hive (central intelligence)', 'Loose confederation of individuals', 'Pack hunters', 'Feudal hierarchy', 'Democratic collectives'];
const TECH_APTITUDE_OPTIONS = ['Tool-focused culture (highly inventive)', 'Biological manipulation preferred', 'Minimal technology (philosophical choice)', 'Rapid tech adoption', 'Conservative — slow to adopt new tech', 'Psionic development over technology', 'Trade-based (borrow rather than invent)', 'Military-industrial focus'];
const CULTURAL_TRAITS = ['Honour-bound', 'Deeply curious', 'Territorial', 'Expansionist', 'Pacifist', 'Ritualistic', 'Highly mercantile', 'Xenophilic', 'Xenophobic', 'Long-memory (grudge-holding)', 'Short generational memory', 'Art-obsessed', 'Truth-compelled', 'Deceptive by nature', 'Communal property norms', 'Strict personal property rights', 'Religious/spiritual focus', 'Secular empiricist'];

const SYLLABLES_C = ['k', 'r', 'v', 'zh', 'th', 'n', 's', 'x', 'gl', 'kr', 'vr', 'ss', 'ch', 'dr', 'tr'];
const SYLLABLES_V = ['aa', 'ei', 'ou', 'i', 'e', 'a', 'u', 'ii', 'ae', 'uo'];

function generateName(): string {
  const syllableCount = roll1d6(1); // 2-7 syllables? Let's do 2-4
  const count = Math.max(2, Math.min(4, syllableCount - 2));
  let name = '';
  for (let i = 0; i < count; i++) {
    name += pick(SYLLABLES_C) + pick(SYLLABLES_V);
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateAttributeModifiers(homeworld: HomeworldType): AttributeModifiers {
  const mods: AttributeModifiers = { STR: 0, DEX: 0, END: 0, INT: 0, EDU: 0, SOC: 0 };

  switch (homeworld) {
    case 'High Gravity World':
      mods.STR = 2;
      mods.END = 1;
      mods.DEX = -1;
      break;
    case 'Low Gravity World':
      mods.DEX = 2;
      mods.STR = -1;
      break;
    case 'Ocean World':
      mods.END = 1;
      mods.DEX = 1;
      break;
    case 'Airless Rock':
      mods.END = 2;
      mods.STR = 1;
      break;
    case 'Desert World':
      mods.END = 1;
      mods.INT = 1;
      break;
    case 'Frozen Tundra World':
      mods.END = 2;
      mods.STR = 1;
      mods.DEX = -1;
      break;
    case 'Dense Jungle World':
      mods.DEX = 2;
      mods.INT = 1;
      break;
    case 'Temperate Garden World':
      mods.SOC = 1;
      mods.EDU = 1;
      break;
    case 'Volcanic World':
      mods.END = 2;
      mods.INT = -1;
      break;
    case 'Gas Giant Moon':
      mods.INT = 1;
      mods.DEX = 1;
      break;
  }

  return mods;
}

function generateLifespan(homeworld: HomeworldType): string {
  const base = roll2d6() * 10;
  const suffix =
    homeworld === 'High Gravity World' || homeworld === 'Volcanic World'
      ? ' years (harsh environment)'
      : homeworld === 'Temperate Garden World'
        ? ' years (long-lived)'
        : ' years';
  const lifespan = homeworld === 'Temperate Garden World' ? base + 40 : base;
  return `${lifespan}${suffix}`;
}

function generateAverageSize(homeworld: HomeworldType): string {
  const sizes = ['Small (0.5–1m)', 'Medium (1–2m)', 'Large (2–4m)', 'Massive (4m+)'];
  if (homeworld === 'High Gravity World') return pick([sizes[0], sizes[1]]);
  if (homeworld === 'Low Gravity World') return pick([sizes[2], sizes[3]]);
  if (homeworld === 'Airless Rock') return pick([sizes[0], sizes[1]]);
  return pick(sizes);
}

function generateNotes(profile: Partial<SophontProfile>): string[] {
  const notes: string[] = [];

  if (profile.homeworld === 'Airless Rock') {
    notes.push('Requires a sealed suit or hostile environment gear to survive standard atmospheres');
  }
  if (profile.locomotion === 'Flying (wings)') {
    notes.push('May not function well in high-gravity environments; check with referee');
  }
  if (profile.socialStructure?.includes('Hive')) {
    notes.push('Hive sophonts may suffer psychological stress when isolated from their group for extended periods');
  }
  if (profile.diet === 'Photosynthetic supplement') {
    notes.push('Requires regular exposure to appropriate light spectrum; may weaken in darkness');
  }
  if (profile.attributeModifiers && profile.attributeModifiers.INT < 0) {
    notes.push('Low intelligence modifier: sophont may struggle in highly technical careers');
  }
  if (notes.length === 0) {
    notes.push('No special physiological notes');
  }

  return notes;
}

export function generateSophont(): SophontProfile {
  const homeworld = pick(HOMEWORLD_TYPES);
  const senseCount = Math.max(2, roll1d6() - 1);

  const bodyPlan: BodyPlan = {
    symmetry: pick(SYMMETRY_OPTIONS),
    limbs: pick(LIMB_OPTIONS),
    covering: pick(COVERING_OPTIONS),
    reproduction: pick(REPRODUCTION_OPTIONS),
  };

  const attributeModifiers = generateAttributeModifiers(homeworld);

  const partial: Partial<SophontProfile> = {
    homeworld,
    locomotion: pick(LOCOMOTION_OPTIONS),
    socialStructure: pick(SOCIAL_STRUCTURE_OPTIONS),
    diet: pick(DIET_OPTIONS),
    attributeModifiers,
  };

  const notes = generateNotes(partial);

  return {
    name: generateName(),
    homeworld,
    bodyPlan,
    senses: pickUnique(SENSE_OPTIONS, senseCount),
    locomotion: partial.locomotion!,
    diet: partial.diet!,
    socialStructure: partial.socialStructure!,
    technologicalAptitude: pick(TECH_APTITUDE_OPTIONS),
    culturalTraits: pickUnique(CULTURAL_TRAITS, 3),
    attributeModifiers,
    lifespan: generateLifespan(homeworld),
    averageSize: generateAverageSize(homeworld),
    notes,
  };
}
