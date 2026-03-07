import { roll2d6, roll1d6, pick, pickUnique } from '../../utils/dice';

export interface Character {
  name: string;
  species: string;
  age: number;
  attributes: Attributes;
  career: CareerHistory[];
  skills: Record<string, number>;
  equipment: string[];
  credits: number;
  contacts: string[];
  allies: string[];
  enemies: string[];
  background: string;
  upp: string;
}

export interface Attributes {
  STR: number;
  DEX: number;
  END: number;
  INT: number;
  EDU: number;
  SOC: number;
}

export interface CareerHistory {
  career: string;
  terms: number;
  rank: string;
  events: string[];
}

const CAREER_TABLE: Record<string, CareerData> = {
  Navy: {
    qualification: { attr: 'INT', target: 6 },
    ranks: ['Recruit', 'Able Spacehand', 'Petty Officer 3rd', 'Petty Officer 2nd', 'Petty Officer 1st', 'Chief Petty Officer', 'Warrant Officer'],
    skills: ['Pilot', 'Gunner', 'Engineer', 'Vacc Suit', 'Tactics', 'Electronics', 'Astrogation'],
    events: ['Participated in a major battle', 'Served on a frontier patrol', 'Cross-trained in alien relations', 'Commended for bravery', 'Served as section leader', 'Survived a ship disaster'],
  },
  Marines: {
    qualification: { attr: 'END', target: 6 },
    ranks: ['Marine', 'Lance Corporal', 'Corporal', 'Lance Sergeant', 'Sergeant', 'Gunnery Sergeant', 'Sergeant Major'],
    skills: ['Gun Combat', 'Melee', 'Athletics', 'Recon', 'Stealth', 'Heavy Weapons', 'Explosives'],
    events: ['Assaulted an enemy fortification', 'Survived a planetary insertion', 'Trained local militia', 'Served as boarding party', 'Participated in anti-piracy operations', 'Rescued hostages'],
  },
  Army: {
    qualification: { attr: 'END', target: 5 },
    ranks: ['Private', 'Lance Corporal', 'Corporal', 'Lance Sergeant', 'Sergeant', 'Staff Sergeant', 'Sergeant Major'],
    skills: ['Gun Combat', 'Melee', 'Recon', 'Athletics', 'Drive', 'Heavy Weapons', 'Leadership'],
    events: ['Fought in a planetary campaign', 'Served in a counterinsurgency', 'Completed jungle survival training', 'Led a scouting mission', 'Served in peacekeeping', 'Participated in a coup'],
  },
  Scout: {
    qualification: { attr: 'INT', target: 5 },
    ranks: ['Messenger', 'Scout', 'Senior Scout', 'Scout Specialist', 'Master Scout', 'Chief Scout', 'Scout Commander'],
    skills: ['Pilot', 'Astrogation', 'Survival', 'Recon', 'Mechanic', 'Jack-of-all-Trades', 'Navigation'],
    events: ['Surveyed an uncharted system', 'Made first contact with a primitive culture', 'Discovered a dangerous anomaly', 'Lost in jumpspace briefly', 'Served as courier on a sensitive mission', 'Mapped a new trade route'],
  },
  Merchant: {
    qualification: { attr: 'INT', target: 4 },
    ranks: ['Trainee', 'Cargo Master', 'Third Officer', 'Second Officer', 'First Officer', 'Ship Captain', 'Sector Director'],
    skills: ['Broker', 'Persuade', 'Pilot', 'Steward', 'Admin', 'Streetwise', 'Trade'],
    events: ['Negotiated a lucrative trade deal', 'Survived a pirate attack', 'Smuggled contraband past customs', 'Established a new trade route', 'Lost a cargo ship to bankruptcy', 'Met an influential noble'],
  },
  Rogue: {
    qualification: { attr: 'DEX', target: 6 },
    ranks: ['Associate', 'Thief', 'Enforcer', 'Cutpurse', 'Operator', 'Fixer', 'Crime Lord'],
    skills: ['Streetwise', 'Deception', 'Stealth', 'Recon', 'Gun Combat', 'Melee', 'Persuade'],
    events: ['Pulled off a major heist', 'Narrowly escaped law enforcement', 'Betrayed by a contact', 'Served time in prison', 'Made alliance with a crime boss', 'Protected by a powerful patron'],
  },
  Scholar: {
    qualification: { attr: 'EDU', target: 6 },
    ranks: ['Student', 'Researcher', 'Fellow', 'Senior Researcher', 'Lab Director', 'Chief Scientist', 'Renowned Expert'],
    skills: ['Science', 'Medic', 'Electronics', 'Admin', 'Investigate', 'Computers', 'Language'],
    events: ['Published a major paper', 'Made a groundbreaking discovery', 'Worked on a classified project', 'Collaborated with a rival', 'Encountered a dangerous experiment', 'Won a prestigious award'],
  },
  Drifter: {
    qualification: { attr: 'DEX', target: 3 },
    ranks: ['Wanderer', 'Vagabond', 'Traveller', 'Wayfarer', 'Journeyman', 'Road Veteran', 'Living Legend'],
    skills: ['Survival', 'Streetwise', 'Melee', 'Recon', 'Athletics', 'Stealth', 'Drive'],
    events: ['Survived a harsh frontier world', 'Fell in with a gang briefly', 'Worked passage on a tramp freighter', 'Witnessed a major political event', 'Lost everything in a disaster', 'Found an unusual artefact'],
  },
};

export interface CareerData {
  qualification: { attr: keyof Attributes; target: number };
  ranks: string[];
  skills: string[];
  events: string[];
}

const BACKGROUND_SKILLS = ['Admin', 'Animals', 'Art', 'Athletics', 'Carouse', 'Drive', 'Science', 'Streetwise', 'Trade', 'Vacc Suit'];

const HUMANITI_NAMES_FIRST = ['Alex', 'Mira', 'Tobias', 'Seren', 'Cael', 'Vesper', 'Rova', 'Jhen', 'Marek', 'Olix', 'Tavin', 'Celwyn', 'Drex', 'Noli', 'Quanta'];
const HUMANITI_NAMES_LAST = ['Vance', 'Orin', 'Tesk', 'Calloway', 'Drevin', 'Holt', 'Mercer', 'Stavros', 'Yuen', 'Achebe', 'Narayan', 'Kowalski', 'Santos', 'Diaz', 'Wren'];

const SPECIES_OPTIONS = ['Human (Solomani)', 'Human (Vilani)', 'Human (Zhodani)', 'Human (Mixed)', 'Aslan', 'Vargr', 'Custom Sophont'];

function generateAttributes(): Attributes {
  return {
    STR: roll2d6(),
    DEX: roll2d6(),
    END: roll2d6(),
    INT: roll2d6(),
    EDU: roll2d6(),
    SOC: roll2d6(),
  };
}

function attributeModifier(value: number): number {
  if (value <= 2) return -3;
  if (value <= 5) return -2;
  if (value <= 6) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3;
}

function applyAgingEffects(attrs: Attributes, terms: number): Attributes {
  if (terms < 4) return { ...attrs };

  const result = { ...attrs };
  const agingRolls = terms - 3;

  for (let i = 0; i < agingRolls; i++) {
    const r = roll2d6() - i;
    if (r <= 5) {
      const stat = pick(['STR', 'DEX', 'END'] as (keyof Attributes)[]);
      result[stat] = Math.max(1, result[stat] - 1);
    }
  }

  return result;
}

function resolveCareerTerm(
  _careerName: string,
  career: CareerData,
  attrs: Attributes,
  existingSkills: Record<string, number>
): { skills: Record<string, number>; event: string; survived: boolean; rank: number } {
  const skills = { ...existingSkills };

  // Gain 1-2 skills per term
  const gainCount = roll1d6() <= 4 ? 1 : 2;
  const newSkills = pickUnique(career.skills, gainCount);
  for (const skill of newSkills) {
    skills[skill] = (skills[skill] ?? -1) + 1;
  }

  // Survival check (simplified: 5+ on 2d6 + relevant modifier)
  const survivalRoll = roll2d6() + attributeModifier(attrs[career.qualification.attr]);
  const survived = survivalRoll >= 5;

  const event = pick(career.events);

  return {
    skills,
    event,
    survived,
    rank: 0,
  };
}

export function generateCharacter(): Character {
  const attrs = generateAttributes();
  const firstName = pick(HUMANITI_NAMES_FIRST);
  const lastName = pick(HUMANITI_NAMES_LAST);
  const name = `${firstName} ${lastName}`;
  const species = pick(SPECIES_OPTIONS);

  // Background skills (3 at level 0)
  const skills: Record<string, number> = {};
  const bgSkills = pickUnique(BACKGROUND_SKILLS, 3);
  for (const skill of bgSkills) {
    skills[skill] = 0;
  }

  // Career history — 1 to 3 terms
  const careerNames = Object.keys(CAREER_TABLE);
  const careerHistory: CareerHistory[] = [];
  let totalTerms = 0;
  const currentAttrs = { ...attrs };

  // Attempt 1–2 careers
  const numCareers = roll1d6() <= 3 ? 1 : 2;

  for (let c = 0; c < numCareers; c++) {
    const careerName = pick(careerNames);
    const career = CAREER_TABLE[careerName];

    // Qualification check
    const qualRoll = roll2d6() + attributeModifier(currentAttrs[career.qualification.attr]);
    if (qualRoll < career.qualification.target && c > 0) {
      break; // Failed to qualify for second career
    }

    const terms = roll1d6() <= 4 ? 1 : roll1d6() <= 4 ? 2 : 3;
    const events: string[] = [];
    let survived = true;

    for (let t = 0; t < terms && survived; t++) {
      const result = resolveCareerTerm(careerName, career, currentAttrs, skills);
      Object.assign(skills, result.skills);
      events.push(result.event);
      survived = result.survived;
      totalTerms++;
    }

    const rankIndex = Math.min(terms, career.ranks.length - 1);
    careerHistory.push({
      career: careerName,
      terms,
      rank: career.ranks[rankIndex],
      events,
    });

    if (!survived) break;
  }

  // Apply aging
  const age = 18 + totalTerms * 4;
  const finalAttrs = applyAgingEffects(currentAttrs, totalTerms);

  // Muster-out benefits
  const credits = roll2d6() * 1000 * Math.max(1, totalTerms - 1);
  const equipment: string[] = [];
  const possibleEquip = ['Laser Pistol', 'Blade', 'Cloth Armour', 'Vacc Suit (TL 10)', 'Medikit', 'Comms', 'Binoculars', 'Multi-tool', 'Handgun', 'Combat Armour'];
  const equipCount = Math.min(3, roll1d6() - 2);
  if (equipCount > 0) {
    equipment.push(...pickUnique(possibleEquip, equipCount));
  }

  // Contacts and allies
  const contactNames = ['a retired Navy captain', 'a shady merchant broker', 'a scout service contact', 'a local crime boss', 'an academic researcher', 'a planetary noble', 'a fellow veteran'];
  const contactCount = roll1d6() - 3;
  const contacts = contactCount > 0 ? pickUnique(contactNames, contactCount) : [];
  const allyCount = roll1d6() <= 2 ? 1 : 0;
  const allies = allyCount > 0 ? [pick(['a loyal crewmate', 'a powerful patron', 'an old friend in high places'])] : [];
  const enemyCount = roll1d6() <= 2 ? 1 : 0;
  const enemies = enemyCount > 0 ? [pick(['a vengeful crime lord', 'a dishonored officer', 'a rival merchant'])] : [];

  // Build UPP
  function toHexChar(n: number): string {
    if (n < 10) return String(n);
    return String.fromCharCode(55 + n);
  }
  const upp = [
    toHexChar(finalAttrs.STR),
    toHexChar(finalAttrs.DEX),
    toHexChar(finalAttrs.END),
    toHexChar(finalAttrs.INT),
    toHexChar(finalAttrs.EDU),
    toHexChar(finalAttrs.SOC),
  ].join('');

  const backgroundStory = `${name} grew up on ${pick(['a frontier colony world', 'a bustling starport hub', 'a remote agricultural planet', 'a high-tech core world', 'a war-torn world in recovery'])} and entered service as ${careerHistory[0]?.rank ?? 'a traveller'} in the ${careerHistory[0]?.career ?? 'service'}.`;

  return {
    name,
    species,
    age,
    attributes: finalAttrs,
    career: careerHistory,
    skills,
    equipment,
    credits,
    contacts,
    allies,
    enemies,
    background: backgroundStory,
    upp,
  };
}
