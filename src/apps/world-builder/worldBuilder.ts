import { roll1d6, roll2d6, pick, toHex } from '../../utils/dice';

export interface StarSystem {
  name: string;
  star: Star;
  worlds: World[];
  mainWorld: World;
}

export interface Star {
  type: string;
  size: string;
  luminosity: string;
  habZone: string;
}

export interface World {
  name: string;
  orbit: number;
  type: WorldType;
  uwp: string;
  size: number;
  atmosphere: number;
  hydrosphere: number;
  population: number;
  government: number;
  lawLevel: number;
  techLevel: number;
  tradeCodes: string[];
  remarks: string;
  isMainWorld: boolean;
}

export type WorldType = 'Asteroid Belt' | 'Inner Planet' | 'Habitable Zone' | 'Outer Planet' | 'Gas Giant' | 'Planetoid';

const STAR_TYPES = ['O', 'B', 'A', 'F', 'G', 'G', 'G', 'K', 'K', 'M', 'M', 'M'];
const SYSTEM_NAMES_PREFIX = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Iota', 'Kappa', 'Sigma'];
const SYSTEM_NAMES_SUFFIX = ['Prime', 'Minor', 'Secundus', 'Tertius', 'Deep', 'Far', 'Near', 'Station'];
const WORLD_NAMES = ['Haven', 'Reach', 'Margin', 'Frontier', 'Crest', 'Vale', 'Ridge', 'Hollow', 'Brink', 'Expanse', 'Void', 'Deep', 'Shore', 'Verge', 'Nexus'];

const ATMOSPHERE_TABLE: Record<number, string> = {
  0: 'None',
  1: 'Trace',
  2: 'Very Thin, Tainted',
  3: 'Very Thin',
  4: 'Thin, Tainted',
  5: 'Thin',
  6: 'Standard',
  7: 'Standard, Tainted',
  8: 'Dense',
  9: 'Dense, Tainted',
  10: 'Exotic',
  11: 'Corrosive',
  12: 'Insidious',
  13: 'Dense, High',
  14: 'Thin, Low',
  15: 'Unusual',
};

const GOVERNMENT_TABLE: Record<number, string> = {
  0: 'None',
  1: 'Company/Corporation',
  2: 'Participating Democracy',
  3: 'Self-Perpetuating Oligarchy',
  4: 'Representative Democracy',
  5: 'Feudal Technocracy',
  6: 'Captive Government',
  7: 'Balkanization',
  8: 'Civil Service Bureaucracy',
  9: 'Impersonal Bureaucracy',
  10: 'Charismatic Dictator',
  11: 'Non-Charismatic Leader',
  12: 'Charismatic Oligarchy',
  13: 'Religious Dictatorship',
};

function generateSystemName(): string {
  return `${pick(SYSTEM_NAMES_PREFIX)} ${pick(SYSTEM_NAMES_SUFFIX)}`;
}

function generateWorldName(): string {
  return pick(WORLD_NAMES) + ' ' + roll1d6().toString();
}

function generateStar(): Star {
  const roll = roll2d6();
  const typeIndex = Math.min(roll - 2, STAR_TYPES.length - 1);
  const type = STAR_TYPES[typeIndex];
  const size = type === 'M' ? pick(['V', 'VI']) : 'V';

  let luminosity: string;
  let habZone: string;

  switch (type) {
    case 'O':
    case 'B':
      luminosity = 'Very High';
      habZone = 'Orbit 8–12';
      break;
    case 'A':
      luminosity = 'High';
      habZone = 'Orbit 6–8';
      break;
    case 'F':
      luminosity = 'Above Average';
      habZone = 'Orbit 4–6';
      break;
    case 'G':
      luminosity = 'Average (Sol-like)';
      habZone = 'Orbit 3–5';
      break;
    case 'K':
      luminosity = 'Below Average';
      habZone = 'Orbit 2–3';
      break;
    case 'M':
    default:
      luminosity = 'Low';
      habZone = 'Orbit 0–1';
      break;
  }

  return { type, size, luminosity, habZone };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function generateMainWorld(): World {
  const size = clamp(roll2d6() - 2, 0, 10);
  const atmosphere = size === 0 ? 0 : clamp(roll2d6() - 7 + size, 0, 15);
  const hydrosphere = atmosphere <= 1 ? 0 : clamp(roll2d6() - 7 + atmosphere, 0, 10);
  const population = clamp(roll2d6() - 2, 0, 12);
  const government = clamp(roll2d6() - 7 + population, 0, 13);
  const lawLevel = clamp(roll2d6() - 7 + government, 0, 9);

  // Tech level
  let tl = roll1d6();
  if (size <= 1) tl += 2;
  else if (size <= 4) tl += 1;
  if (atmosphere <= 3 || atmosphere >= 10) tl += 1;
  if (hydrosphere === 9) tl += 1;
  if (hydrosphere === 10) tl += 2;
  if (population >= 1 && population <= 5) tl += 1;
  if (population === 9) tl += 2;
  if (population === 10) tl += 4;
  if (government === 0 || government === 5) tl += 1;
  if (government === 7) tl += 2;
  if (government === 13 || government === 14) tl -= 2;
  const techLevel = clamp(tl, 0, 15);

  const tradeCodes = computeTradeCodes(size, atmosphere, hydrosphere, population, government, lawLevel, techLevel);

  const uwp = [
    pick(['A', 'B', 'C', 'D', 'E', 'X']), // starport
    toHex(size),
    toHex(atmosphere),
    toHex(hydrosphere),
    toHex(population),
    toHex(government),
    toHex(lawLevel),
    '-',
    toHex(techLevel),
  ].join('');

  return {
    name: generateWorldName(),
    orbit: 3,
    type: 'Habitable Zone',
    uwp,
    size,
    atmosphere,
    hydrosphere,
    population,
    government,
    lawLevel,
    techLevel,
    tradeCodes,
    remarks: generateRemarks(atmosphere, government, lawLevel, population),
    isMainWorld: true,
  };
}

function computeTradeCodes(
  size: number,
  atm: number,
  hyd: number,
  pop: number,
  gov: number,
  law: number,
  tl: number
): string[] {
  const codes: string[] = [];

  if (atm >= 4 && atm <= 9 && hyd >= 4 && hyd <= 8 && pop >= 5 && pop <= 7) codes.push('Ag'); // Agricultural
  if (size === 0 && atm === 0 && hyd === 0) codes.push('As'); // Asteroid
  if (pop === 0 && gov === 0 && law === 0) codes.push('Ba'); // Barren
  if (atm >= 2 && hyd === 0) codes.push('De'); // Desert
  if (atm >= 10 && hyd >= 1) codes.push('Fl'); // Fluid Oceans (non-water)
  if (atm >= 5 && atm <= 7 && hyd >= 4 && hyd <= 9 && pop >= 4 && pop <= 8) codes.push('Ga'); // Garden
  if (pop >= 9) codes.push('Hi'); // High Population
  if (tl >= 12) codes.push('Ht'); // High Technology
  if (atm <= 1 && hyd >= 1) codes.push('Ic'); // Ice-capped
  if ([0, 1, 2, 4, 7, 9].includes(atm) && pop >= 9) codes.push('In'); // Industrial
  if (pop >= 1 && pop <= 3) codes.push('Lo'); // Low Population
  if (tl <= 5) codes.push('Lt'); // Low Technology
  if (atm <= 3 && hyd <= 3 && pop >= 6) codes.push('Na'); // Non-agricultural
  if (pop >= 1 && pop <= 6) codes.push('Ni'); // Non-industrial
  if (atm >= 2 && atm <= 5 && hyd <= 3) codes.push('Po'); // Poor
  if ([6, 8].includes(atm) && pop >= 6 && pop <= 8 && [4, 5, 6, 7].includes(gov)) codes.push('Ri'); // Rich
  if (hyd === 10) codes.push('Wa'); // Water World
  if (atm === 0) codes.push('Va'); // Vacuum

  return codes;
}

function generateRemarks(atmosphere: number, government: number, lawLevel: number, population: number): string {
  const remarks: string[] = [];

  if (atmosphere >= 10) remarks.push('Hostile atmosphere requires sealed environment');
  if (atmosphere === 0) remarks.push('Airless world');
  if (government === 7) remarks.push('Balkanized — multiple competing nation-states');
  if (lawLevel >= 9) remarks.push('Extreme law enforcement');
  if (lawLevel === 0) remarks.push('No centralized law enforcement');
  if (population === 0) remarks.push('Uninhabited');
  if (population >= 10) remarks.push('Enormous population — major starport hub');

  return remarks.join('; ') || 'Unremarkable world';
}

export function generateStarSystem(): StarSystem {
  const name = generateSystemName();
  const star = generateStar();
  const mainWorld = generateMainWorld();

  // Generate 2-6 additional worlds
  const worldCount = roll1d6() + 1;
  const worlds: World[] = [];

  for (let i = 0; i < worldCount; i++) {
    const orbitTypes: WorldType[] = ['Asteroid Belt', 'Inner Planet', 'Outer Planet', 'Gas Giant', 'Planetoid'];
    const type = pick(orbitTypes);
    const worldSize = type === 'Gas Giant' ? roll2d6() + 4 : type === 'Asteroid Belt' ? 0 : clamp(roll1d6() - 1, 0, 8);

    worlds.push({
      name: generateWorldName(),
      orbit: i + 1,
      type,
      uwp: `?${toHex(worldSize)}????-?`,
      size: worldSize,
      atmosphere: type === 'Gas Giant' ? 15 : type === 'Asteroid Belt' ? 0 : clamp(roll2d6() - 7 + worldSize, 0, 15),
      hydrosphere: 0,
      population: 0,
      government: 0,
      lawLevel: 0,
      techLevel: 0,
      tradeCodes: [],
      remarks: type === 'Gas Giant' ? 'Gas giant — potential fuel source' : '',
      isMainWorld: false,
    });
  }

  return { name, star, worlds: [mainWorld, ...worlds], mainWorld };
}

export { ATMOSPHERE_TABLE, GOVERNMENT_TABLE };
