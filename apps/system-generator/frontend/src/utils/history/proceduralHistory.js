import {
  GALACTIC_CALENDAR_NAME,
  GALACTIC_CURRENT_DATE,
  formatGalacticDate,
  formatGalacticSpan,
  resolveGalacticDateFromYearsAgo,
  resolveGalacticEra,
} from "./galacticCalendar.js";

export const EVENT_CATEGORY_DEFINITIONS = Object.freeze([
  {
    name: "Political",
    description: "state formation, reform, and succession struggles",
    weight: 5,
    subcategories: ["Unification", "Succession Crisis", "Constitutional Reform"],
  },
  {
    name: "Military",
    description: "wars, invasions, and decisive campaigns",
    weight: 4,
    subcategories: ["Border War", "Civil War", "Defensive Campaign"],
  },
  {
    name: "Economic",
    description: "trade booms, scarcity, and market upheaval",
    weight: 4,
    subcategories: ["Trade Boom", "Resource Shock", "Market Collapse"],
  },
  {
    name: "Technological",
    description: "engineering leaps and infrastructure revolutions",
    weight: 5,
    subcategories: ["Jump Innovation", "Industrial Leap", "Machine Intelligence"],
  },
  {
    name: "Scientific",
    description: "discovery, research, and frontier knowledge",
    weight: 4,
    subcategories: ["Survey Discovery", "Xenobiology", "Archaeological Breakthrough"],
  },
  {
    name: "Cultural",
    description: "art, philosophy, migration, and identity",
    weight: 3,
    subcategories: ["Renaissance", "Mass Migration", "Philosophical Movement"],
  },
  {
    name: "Diplomatic",
    description: "treaties, summits, and alliance reshaping",
    weight: 4,
    subcategories: ["Treaty Settlement", "Embassy Crisis", "Alliance Shift"],
  },
  {
    name: "Colonization",
    description: "settlement waves and expansion into new systems",
    weight: 4,
    subcategories: ["Frontier Charter", "New Colony", "Colonial Secession"],
  },
  {
    name: "Exploration",
    description: "surveys, expeditions, and unknown frontiers",
    weight: 4,
    subcategories: ["Deep Survey", "Lost Expedition", "Route Discovery"],
  },
  {
    name: "First Contact",
    description: "contact, reaction, and cross-species encounters",
    weight: 3,
    subcategories: ["Signal Intercept", "Diplomatic Encounter", "Trade Opening"],
  },
  {
    name: "Religious",
    description: "faith movements, reformations, and holy conflict",
    weight: 2,
    subcategories: ["Prophetic Movement", "Reformation", "Sectarian Conflict"],
  },
  {
    name: "Social Upheaval",
    description: "civil unrest, migration strain, and class revolt",
    weight: 3,
    subcategories: ["Food Riots", "Labor Revolt", "Displacement Crisis"],
  },
  {
    name: "Natural Disaster",
    description: "plague, tectonic catastrophe, and climate shock",
    weight: 2,
    subcategories: ["Pandemic", "Climate Shock", "Seismic Disaster"],
  },
  {
    name: "Collapse",
    description: "dark ages, fragmentation, and systemic failure",
    weight: 2,
    subcategories: ["State Fragmentation", "Economic Breakdown", "Dark Age"],
  },
]);

const EVENT_TEMPLATES = {
  Political: [
    {
      title: "Formation of the {gov}",
      description: "A new {gov} unified the fractured {region} after decades of local rivalry.",
      consequence: "A central charter created the first stable inter-regional authority.",
    },
    {
      title: "The Great Schism",
      description: "The ruling council divided over access to {resource}, splitting the state into rival blocs.",
      consequence: "Two successor powers defined politics for generations.",
    },
    {
      title: "Bloodless Revolution",
      description: "The old political class yielded after sustained civil pressure and coordinated reform movements.",
      consequence: "A new constitutional era began with wider representation.",
    },
  ],
  Military: [
    {
      title: "The {war} War",
      description: "A long conflict over the {frontier} frontier hardened military identity across the civilization.",
      consequence: "Veteran leadership reshaped doctrine and border policy.",
    },
    {
      title: "The Battle of {location}",
      description: "A decisive clash at {location} broke the momentum of an entrenched rival force.",
      consequence: "The defeated power was forced to negotiate from weakness.",
    },
    {
      title: "Invasion from the {region}",
      description: "Foreign fleets crossed into core territory, forcing a rapid and costly mobilization.",
      consequence: "Strategic defenses were permanently expanded.",
    },
  ],
  Economic: [
    {
      title: "The {resource} Trade Collapse",
      description: "The sudden loss of {resource} destabilized commerce and triggered wide fiscal panic.",
      consequence: "New trade corridors were surveyed to restore supply.",
    },
    {
      title: "The Age of Prosperity",
      description: "A sustained cycle of surplus and low conflict raised living standards across multiple worlds.",
      consequence: "Merchant houses accumulated lasting influence.",
    },
    {
      title: "First Interstellar Market",
      description: "Formal exchange agreements created the first durable offworld commodity network.",
      consequence: "Technology and population both accelerated in response.",
    },
  ],
  Technological: [
    {
      title: "Jump Drive Breakthrough",
      description: "Engineers achieved a stable jump solution, making true interstellar logistics viable.",
      consequence: "Expansion into neighboring systems began within a decade.",
    },
    {
      title: "Fusion Power Era",
      description: "Dense fusion infrastructure ended chronic energy scarcity and transformed heavy industry.",
      consequence: "Urbanization and orbital manufacturing both surged.",
    },
    {
      title: "Synthetic Intelligence Emergence",
      description: "The first recognized machine intellect changed research, law, and strategic planning.",
      consequence: "Debate over synthetic personhood became unavoidable.",
    },
  ],
  Scientific: [
    {
      title: "The {discovery} Survey",
      description: "A landmark research mission redefined accepted knowledge of {region} space.",
      consequence: "Academic institutions gained unprecedented prestige.",
    },
    {
      title: "Genome Atlas Initiative",
      description: "Large-scale biological mapping exposed hidden links between native and imported lifeforms.",
      consequence: "Medicine and biosphere engineering advanced rapidly.",
    },
    {
      title: "The Observatory Consensus",
      description: "Long-running rival theories were finally reconciled by a shared evidence archive.",
      consequence: "A new scientific orthodoxy guided exploration policy.",
    },
  ],
  Cultural: [
    {
      title: "The Renaissance of {art}",
      description: "A flowering of {art} gave the civilization a renewed and confident identity.",
      consequence: "Shared symbolism strengthened unity across distant worlds.",
    },
    {
      title: "The Great Migration",
      description: "Millions relocated toward new colonies and trade hubs in search of opportunity.",
      consequence: "Old customs blended with frontier identities.",
    },
    {
      title: "The Philosophical Age",
      description: "New schools of thought challenged inherited assumptions about duty, purpose, and personhood.",
      consequence: "Education and debate became matters of state importance.",
    },
  ],
  Diplomatic: [
    {
      title: "The {treaty} Compact",
      description: "A major summit produced a lasting agreement over borders, access, and mutual guarantees.",
      consequence: "An era of guarded peace followed.",
    },
    {
      title: "Embassy Crisis at {location}",
      description:
        "A diplomatic incident nearly escalated into war before skilled intermediaries stabilized the situation.",
      consequence: "Protocol and security doctrine were completely revised.",
    },
    {
      title: "Alliance of the {region}",
      description: "Neighboring powers formed a strategic bloc to resist instability along shared routes.",
      consequence: "Joint patrols and trade standards became the norm.",
    },
  ],
  Colonization: [
    {
      title: "Settlement of the {frontier} Frontier",
      description: "The civilization launched a sustained push into the {frontier} frontier corridor.",
      consequence: "New colonial administrations and defense posts followed.",
    },
    {
      title: "The Charter Fleets",
      description: "A wave of licensed colony expeditions opened remote habitats to organized settlement.",
      consequence: "Population pressure eased across the core worlds.",
    },
    {
      title: "Founding of the Outer Arc Worlds",
      description: "A network of difficult but resource-rich colonies established the outer edge of influence.",
      consequence: "Frontier identity became politically powerful.",
    },
  ],
  Exploration: [
    {
      title: "Charting the {region}",
      description: "Systematic surveys revealed new routes, hazards, and viable settlement targets.",
      consequence: "The map of known space expanded dramatically.",
    },
    {
      title: "The Lost Expedition Returns",
      description: "A long-missing survey group reappeared with records of a rich and dangerous stellar cluster.",
      consequence: "A new exploration race began.",
    },
    {
      title: "Discovery of the Ancient Ruins",
      description: "Explorers uncovered precursor remains that challenged accepted historical timelines.",
      consequence: "Archaeology became strategically significant.",
    },
  ],
  "First Contact": [
    {
      title: "Signals from the Dark",
      description:
        "Structured transmissions from beyond known routes triggered the first serious contact preparations.",
      consequence: "Language, protocol, and defense teams were assembled in haste.",
    },
    {
      title: "The Arrival",
      description:
        "An alien vessel entered the system and forced the civilization to define its place in a wider community.",
      consequence: "Diplomatic relations were cautiously established.",
    },
    {
      title: "The Traders from Beyond",
      description: "Offworld merchants made first exchange under tense but controlled conditions.",
      consequence: "Cross-cultural knowledge spread with unexpected speed.",
    },
  ],
  Religious: [
    {
      title: "The Prophet of {region}",
      description: "A charismatic spiritual reformer drew scattered traditions into a unified doctrine.",
      consequence: "Faith institutions became inseparable from governance.",
    },
    {
      title: "The Reformation",
      description: "A once-dominant religious hierarchy was challenged and structurally transformed.",
      consequence: "Secular and spiritual authority were renegotiated.",
    },
    {
      title: "The Holy War",
      description: "Rival interpretations of sacred duty ignited a devastating sectarian conflict.",
      consequence: "Religious legitimacy became a matter of state security.",
    },
  ],
  "Social Upheaval": [
    {
      title: "The Bread Riots",
      description: "Food shortages and administrative failure sparked coordinated unrest across urban centers.",
      consequence: "Emergency reforms prevented wider collapse.",
    },
    {
      title: "The Workers' Rising",
      description: "Industrial labor blocs shut down production until representation and safety demands were met.",
      consequence: "The civic order shifted toward negotiation over coercion.",
    },
    {
      title: "The Displacement Crisis",
      description: "Rapid migration overwhelmed local institutions and exposed old class divisions.",
      consequence: "Citizenship and settlement law were rewritten.",
    },
  ],
  "Natural Disaster": [
    {
      title: "The Long Winter",
      description: "Atmospheric debris dimmed the skies for years, causing cascading agricultural failure.",
      consequence: "Population declined sharply before recovery stabilized.",
    },
    {
      title: "Plague of the {region}",
      description: "A lethal contagion moved along trade routes and killed millions before containment.",
      consequence: "Medical research became a civilizational priority.",
    },
    {
      title: "The Great Quake",
      description: "Massive tectonic upheaval destroyed major settlements and reshaped core infrastructure.",
      consequence: "Reconstruction changed urban planning for centuries.",
    },
  ],
  Collapse: [
    {
      title: "The Dark Age Begins",
      description: "Central authority failed and the civilization fragmented into isolated successor states.",
      consequence: "Knowledge and coordination regressed for generations.",
    },
    {
      title: "Economic Implosion",
      description: "Currency failure and trade collapse shattered normal exchange all at once.",
      consequence: "Local barter and warlord economies took root.",
    },
    {
      title: "The Betrayal of {gov}",
      description: "An internal coup destroyed political legitimacy at the moment of greatest strain.",
      consequence: "Civil war and separatism followed immediately.",
    },
  ],
};

const ERA_CATEGORY_WEIGHTS = {
  "Founding Ages": {
    Political: 5,
    Cultural: 4,
    Religious: 4,
    "Natural Disaster": 3,
    "Social Upheaval": 2,
    Collapse: 2,
  },
  "The Emergence": {
    Political: 4,
    Economic: 3,
    Technological: 5,
    Scientific: 5,
    Exploration: 3,
    "Social Upheaval": 2,
  },
  "The Reaching": {
    Economic: 4,
    Technological: 4,
    Diplomatic: 4,
    Colonization: 5,
    Exploration: 5,
    Military: 3,
  },
  "The First Contact": {
    Diplomatic: 5,
    "First Contact": 5,
    Political: 3,
    Cultural: 3,
    Military: 2,
    "Social Upheaval": 2,
  },
};

const REGIONS = ["Northern Reaches", "Iron Coast", "Sunken Lands", "High Plateau", "Deep Rift", "Outer Arc"];
const GOVS = ["Republic", "Empire", "Confederation", "Theocracy", "Consortium", "Directorate"];
const RESOURCES = ["rare metals", "antimatter fuel", "bio-compounds", "water ice", "dark matter", "jump crystals"];
const ARTS = ["sculpture", "literature", "music", "architecture", "digital art", "oral tradition"];
const LOCATIONS = ["Iron Gate", "Starfall", "The Narrows", "Ember Ridge", "Crystal Lake", "Red Plains"];
const WARS = ["Iron", "Star", "Silent", "Long", "Red Dawn", "Fractured Sky"];
const DISCOVERIES = ["Helix Deep", "Black Sun", "Aster Vault", "Mirror Reach", "Ghost Spiral", "Nadir Crown"];
const TREATIES = ["Silver Lantern", "Ash Meridian", "Sable Accord", "Twelve Harbors", "Pale Horizon"];
const FRONTIERS = ["Outer Arc", "Sundrift", "Lantern Verge", "Morrow Belt", "Fallow Expanse", "Red Margin"];
const PERSON_FIRST_NAMES = [
  "Ari",
  "Selene",
  "Corin",
  "Liora",
  "Tavin",
  "Mira",
  "Jarek",
  "Nyra",
  "Dalen",
  "Vessa",
  "Orin",
  "Kaela",
  "Theron",
  "Ilya",
  "Marek",
  "Neris",
  "Soren",
  "Talin",
  "Varen",
  "Ysolde",
];
const PERSON_LAST_NAMES = [
  "Voss",
  "Maren",
  "Kade",
  "Talar",
  "Siv",
  "Dray",
  "Corvin",
  "Vale",
  "Oris",
  "Dane",
  "Kestrel",
  "Morrow",
  "Hale",
  "Rhyse",
  "Sable",
  "Quorin",
  "Ventor",
  "Lask",
  "Toren",
  "Vey",
];
const PERSON_EPITHETS = [
  "the Navigator",
  "the Builder",
  "the Bold",
  "the Reformer",
  "the Silent",
  "the Flame",
  "the Warden",
  "the Chronicler",
];
const PERSON_ROLE_BY_CATEGORY = {
  Political: ["Chancellor", "Consul", "Regent", "Speaker"],
  Military: ["Marshal", "Admiral", "Commander", "Warden"],
  Economic: ["Guildmaster", "Trade Minister", "Factor", "Quartermaster"],
  Technological: ["Engineer", "Systems Architect", "Inventor", "Fabricator"],
  Scientific: ["Research Director", "Archivist", "Explorer", "Scholar"],
  Cultural: ["Poet Laureate", "Patron", "Visionary", "Curator"],
  Diplomatic: ["Envoy", "Mediator", "Ambassador", "Legate"],
  Colonization: ["Wayfinder", "Charter Leader", "Settlement Marshal", "Frontier Patron"],
  Exploration: ["Survey Captain", "Pathfinder", "Cartographer", "Expedition Lead"],
  "First Contact": ["Contact Envoy", "Interpreter", "Trade Liaison", "Protocol Marshal"],
  Religious: ["High Seer", "Prelate", "Oracle", "Reformer"],
  "Social Upheaval": ["Organizer", "Tribune", "Firebrand", "Witness"],
  "Natural Disaster": ["Relief Marshal", "Survivor-Scholar", "Steward", "Emergency Prefect"],
  Collapse: ["Last Chancellor", "Keeper", "Exile Leader", "Restoration Voice"],
};
const DYNASTY_TITLES = ["House", "Line", "Dynasty", "Clan"];
const MARRIAGE_STYLES = ["treaty marriage", "political union", "frontier compact", "ceremonial bond"];

function normalizeContextList(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(/[,;/|]+/);
  return values
    .map((entry) =>
      String(entry || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
}

function includesAny(source = "", needles = []) {
  const haystack = String(source || "").toLowerCase();
  return needles.some((needle) => haystack.includes(String(needle || "").toLowerCase()));
}

export function buildHistoryContextProfile(context = {}) {
  const government = String(context?.government || "").trim();
  const pressureLevel = String(context?.pressureLevel || "").trim();
  const diplomaticPosture = String(context?.diplomaticPosture || "").trim();
  const techBand = String(context?.techBand || "").trim();
  const flashpoint = String(context?.flashpoint || "").trim();
  const conflictSummary = String(context?.conflictSummary || "").trim();
  const worldTraits = [
    ...normalizeContextList(context?.worldTraits),
    ...normalizeContextList(context?.homeEnvironment),
    ...normalizeContextList(context?.climate),
    ...normalizeContextList(context?.terrain),
    ...normalizeContextList(context?.tradeCodes),
  ].filter((entry, index, all) => all.indexOf(entry) === index);

  return {
    government,
    governmentText: government.toLowerCase(),
    pressureLevel,
    pressureText: pressureLevel.toLowerCase(),
    diplomaticPosture,
    diplomaticText: diplomaticPosture.toLowerCase(),
    techBand,
    techText: techBand.toLowerCase(),
    flashpoint,
    flashpointText: flashpoint.toLowerCase(),
    conflictSummary,
    conflictText: conflictSummary.toLowerCase(),
    worldTraits,
  };
}

export function summarizeHistoryContextDrivers(context = {}) {
  const profile = buildHistoryContextProfile(context);
  const drivers = [];

  if (profile.government) drivers.push(profile.government);
  if (profile.techBand) drivers.push(profile.techBand);
  if (profile.pressureLevel) drivers.push(`${profile.pressureLevel} pressure`);
  if (profile.diplomaticPosture) drivers.push(profile.diplomaticPosture);
  if (profile.worldTraits.length) drivers.push(profile.worldTraits.slice(0, 3).join("/"));

  return drivers.join(", ") || "General frontier dynamics";
}

export function resolveContextualSubcategory(categoryName = "Political", context = {}, rng = Math.random) {
  const category = EVENT_CATEGORY_DEFINITIONS.find((entry) => entry.name === categoryName) || {
    subcategories: [String(categoryName || "General")],
  };
  const profile = buildHistoryContextProfile(context);
  const defaults =
    Array.isArray(category.subcategories) && category.subcategories.length
      ? [...category.subcategories]
      : [String(categoryName || "General")];
  let candidates = [...defaults];
  const combinedText = [profile.governmentText, profile.flashpointText, profile.conflictText, profile.diplomaticText]
    .filter(Boolean)
    .join(" ");

  switch (categoryName) {
    case "Religious":
      if (includesAny(combinedText, ["theocracy", "faith", "holy", "sect", "temple", "relig"])) {
        candidates = ["Prophetic Movement", "Reformation", "Sectarian Conflict"];
      }
      break;
    case "Military":
      if (includesAny(combinedText, ["border", "frontier", "incursion", "blockade", "war"])) {
        candidates = ["Civil War", "Defensive Campaign", "Border War"];
      } else if (includesAny(profile.pressureText, ["high", "elevated"])) {
        candidates = ["Defensive Campaign", "Border War", "Civil War"];
      }
      break;
    case "Economic":
      if (includesAny(combinedText, ["trade", "resource", "market", "embargo", "water", "aquifer", "scarcity"])) {
        candidates = ["Trade Boom", "Market Collapse", "Resource Shock"];
      }
      break;
    case "Technological":
      if (includesAny(profile.techText, ["advanced", "stellar", "interstellar", "orbital"])) {
        candidates = ["Industrial Leap", "Jump Innovation", "Machine Intelligence"];
      }
      break;
    case "Diplomatic":
      if (includesAny(combinedText, ["treaty", "rights", "alliance", "embassy", "blockade", "sanction"])) {
        candidates = ["Alliance Shift", "Treaty Settlement", "Embassy Crisis"];
      }
      break;
    case "Colonization":
      if (profile.worldTraits.some((entry) => includesAny(entry, ["frontier", "remote", "outer", "settlement"]))) {
        candidates = ["New Colony", "Colonial Secession", "Frontier Charter"];
      }
      break;
    case "Exploration":
      if (
        profile.worldTraits.some((entry) => includesAny(entry, ["frontier", "remote", "outer", "anomaly", "ruins"]))
      ) {
        candidates = ["Lost Expedition", "Deep Survey", "Route Discovery"];
      }
      break;
    case "Natural Disaster":
      if (
        profile.worldTraits.some((entry) => includesAny(entry, ["desert", "arid", "dry", "scarcity", "drought"])) ||
        includesAny(combinedText, ["water", "aquifer", "climate"])
      ) {
        candidates = ["Pandemic", "Seismic Disaster", "Climate Shock"];
      }
      break;
    case "Social Upheaval":
      if (includesAny(combinedText, ["food", "migration", "displacement", "labor", "unrest", "scarcity"])) {
        candidates = ["Labor Revolt", "Displacement Crisis", "Food Riots"];
      }
      break;
    case "First Contact":
      if (includesAny(profile.diplomaticText, ["hostile", "aggressive", "guarded"])) {
        candidates = ["Trade Opening", "Diplomatic Encounter", "Signal Intercept"];
      }
      break;
    default:
      break;
  }

  return pick(candidates, rng) || pick(defaults, rng);
}

function resolveHistoricalRole(categoryName = "Political", rng = Math.random) {
  return pick(PERSON_ROLE_BY_CATEGORY[categoryName] || ["Notable Figure"], rng) || "Notable Figure";
}

export function randomHistoricalPersonName(rng = Math.random, context = {}) {
  const firstName = pick(PERSON_FIRST_NAMES, rng) || "Ari";
  const civilizationRoot = String(context?.civilizationName || context?.worldName || "")
    .replace(/[^A-Za-z ]/g, " ")
    .split(/\s+/)
    .find((entry) => entry.length >= 4);
  const lastNamePool = [...PERSON_LAST_NAMES];

  if (civilizationRoot) {
    const root = civilizationRoot.slice(0, Math.min(5, civilizationRoot.length));
    lastNamePool.push(`${root}ar`, `${root}en`);
  }

  const lastName = pick(lastNamePool, rng) || "Voss";
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
}

function buildPersonMilestone(type, yearsAgo, label, detail, totalSpan) {
  const resolvedYearsAgo = Math.max(0, Math.floor(Number(yearsAgo) || 0));
  const date = resolveGalacticDateFromYearsAgo(resolvedYearsAgo, GALACTIC_CURRENT_DATE);
  const era = resolveGalacticEra(resolvedYearsAgo, totalSpan);

  return {
    type,
    label,
    detail,
    yearsAgo: resolvedYearsAgo,
    date: { ...date, era: era.name },
  };
}

export function buildNotableFigure(
  anchorEvent = {},
  { civilizationName = "", totalSpan = 5000, context = {} } = {},
  rng = Math.random,
) {
  const name = randomHistoricalPersonName(rng, { civilizationName, worldName: context?.worldName });
  const role = resolveHistoricalRole(anchorEvent?.category, rng);
  const epithet = pick(PERSON_EPITHETS, rng) || "the Remembered";
  const eventYearsAgo = Math.max(0, Math.floor(Number(anchorEvent?.yearsAgo) || 0));
  const birthYearsAgo = Math.min(totalSpan, eventYearsAgo + 22 + Math.floor(rng() * 55));
  const riseYearsAgo = Math.max(eventYearsAgo, birthYearsAgo - (18 + Math.floor(rng() * 20)));
  const deathYearsAgo = Math.max(0, eventYearsAgo - (2 + Math.floor(rng() * 24)));
  const lifeSpanYears = Math.max(20, birthYearsAgo - deathYearsAgo);
  const birthplace = context?.worldName
    ? `on ${context.worldName}`
    : `within ${civilizationName || "the civilization"}`;

  return {
    name: name.fullName,
    firstName: name.firstName,
    lastName: name.lastName,
    epithet,
    role,
    category: String(anchorEvent?.category || "Political"),
    subcategory: String(anchorEvent?.subcategory || "General"),
    mentorName: null,
    rivalName: null,
    heirName: null,
    claimantName: null,
    spouseProfile: null,
    childProfiles: [],
    siblingProfiles: [],
    legendStatus: role === "Regent" || role === "High Seer" ? "Legendary Founder" : "Historic Figure",
    lifeSpanYears,
    birth: buildPersonMilestone(
      "Birth",
      birthYearsAgo,
      `Born ${birthplace}`,
      `${name.fullName} was born ${birthplace}.`,
      totalSpan,
    ),
    death: buildPersonMilestone(
      "Death",
      deathYearsAgo,
      `Death of ${name.fullName}`,
      `${name.fullName} died after a life shaped by ${String(anchorEvent?.category || "historical").toLowerCase()} conflict and change.`,
      totalSpan,
    ),
    lifeEvents: [
      buildPersonMilestone(
        "Birth",
        birthYearsAgo,
        `Birth of ${name.fullName}`,
        `${name.fullName} was born ${birthplace}.`,
        totalSpan,
      ),
      buildPersonMilestone(
        "Rise",
        riseYearsAgo,
        `Rose as ${role}`,
        `${name.fullName} first emerged as ${role.toLowerCase()} during a period of ${String(anchorEvent?.subcategory || "regional change").toLowerCase()}.`,
        totalSpan,
      ),
      buildPersonMilestone(
        "Event",
        eventYearsAgo,
        String(anchorEvent?.title || "Recorded turning point"),
        String(anchorEvent?.description || "Their defining public action was recorded in the archives."),
        totalSpan,
      ),
      buildPersonMilestone(
        "Death",
        deathYearsAgo,
        `Death of ${name.fullName}`,
        `${name.fullName} left behind a reputation as ${epithet.toLowerCase()}.`,
        totalSpan,
      ),
    ],
    summary: `${name.fullName}, ${role} ${epithet}, lived roughly ${lifeSpanYears} years and is chiefly remembered for ${String(anchorEvent?.title || "a major turning point").toLowerCase()}.`,
  };
}

export function buildNotablePeopleTimeline(
  { events = [], civilizationName = "", totalSpan = 5000, context = {} } = {},
  rng = Math.random,
) {
  if (!Array.isArray(events) || !events.length) {
    return [];
  }

  const desiredCount = Math.min(5, Math.max(3, Math.ceil(events.length / 4)));
  const step = Math.max(1, Math.floor(events.length / desiredCount));
  const anchors = [];

  for (let index = 0; index < events.length && anchors.length < desiredCount; index += step) {
    if (events[index]) {
      anchors.push(events[index]);
    }
  }

  return anchors.map((event) => buildNotableFigure(event, { civilizationName, totalSpan, context }, rng));
}

function buildDynastyName(founder = {}, civilizationName = "", rng = Math.random) {
  const title = pick(DYNASTY_TITLES, rng) || "House";
  const root = String(founder?.lastName || civilizationName || "Orion")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 12);

  return `${title} ${root || "Orion"}`;
}

function buildInheritanceCrisis(dynastyName, rivalDynasty, context = {}, rng = Math.random) {
  const flashpoint = String(context?.flashpoint || "succession rights").trim() || "succession rights";
  const rivalryFocus = pick(
    [flashpoint, "inheritance law", "marriage claims", "border charters", "ancestral holdings"],
    rng,
  );

  return `${dynastyName} faces an inheritance crisis over ${rivalryFocus}, with ${rivalDynasty} backing a rival claimant.`;
}

function buildDynastyConflictEvents({ dynasties = [], totalSpan = 5000, context = {} } = {}, rng = Math.random) {
  if (!Array.isArray(dynasties) || !dynasties.length) {
    return [];
  }

  const conflictEvents = [];
  dynasties.slice(0, 3).forEach((dynasty, index) => {
    const crisisYearsAgo = Math.max(30, Math.floor(totalSpan * (0.16 - index * 0.03)));
    const allianceYearsAgo = Math.max(12, crisisYearsAgo - (20 + Math.floor(rng() * 25)));
    const reformYearsAgo = Math.max(6, crisisYearsAgo - (8 + Math.floor(rng() * 12)));

    const crisisDate = resolveGalacticDateFromYearsAgo(crisisYearsAgo, GALACTIC_CURRENT_DATE);
    const allianceDate = resolveGalacticDateFromYearsAgo(allianceYearsAgo, GALACTIC_CURRENT_DATE);
    const reformDate = resolveGalacticDateFromYearsAgo(reformYearsAgo, GALACTIC_CURRENT_DATE);

    conflictEvents.push(
      {
        year: -crisisYearsAgo,
        yearsAgo: crisisYearsAgo,
        date: { ...crisisDate, era: resolveGalacticEra(crisisYearsAgo, totalSpan).name },
        era: resolveGalacticEra(crisisYearsAgo, totalSpan).name,
        category: "Political",
        subcategory: "Succession Crisis",
        title: `War of the ${dynasty.name} Claim`,
        description: `${dynasty.inheritanceCrisis} ${dynasty.cadetBranchName} and ${dynasty.rivalDynasty} forced the realm toward open conflict.`,
        consequence: `${dynasty.name} authority was tested by a dynastic civil war.`,
        categoryDescription: "dynastic succession, coups, and regime realignment",
        causedBy: dynasty.inheritanceCrisis,
        relatedDynasty: dynasty.name,
      },
      {
        year: -allianceYearsAgo,
        yearsAgo: allianceYearsAgo,
        date: { ...allianceDate, era: resolveGalacticEra(allianceYearsAgo, totalSpan).name },
        era: resolveGalacticEra(allianceYearsAgo, totalSpan).name,
        category: "Diplomatic",
        subcategory: "Alliance Shift",
        title: `Alliance of ${dynasty.name} and ${dynasty.alliedDynasty}`,
        description: `${dynasty.name} sealed a ${dynasty.marriageStyle} with ${dynasty.alliedDynasty}, only for old feuds with ${dynasty.rivalDynasty} to deepen.`,
        consequence: `${dynasty.alliedDynasty} became a decisive bloc in later succession politics.`,
        categoryDescription: "alliances, compacts, and balance-of-power diplomacy",
        causedBy: dynasty.feudSummary,
        relatedDynasty: dynasty.name,
      },
      {
        year: -reformYearsAgo,
        yearsAgo: reformYearsAgo,
        date: { ...reformDate, era: resolveGalacticEra(reformYearsAgo, totalSpan).name },
        era: resolveGalacticEra(reformYearsAgo, totalSpan).name,
        category: index % 2 === 0 ? "Political" : "Social Upheaval",
        subcategory: index % 2 === 0 ? "Constitutional Reform" : "Labor Revolt",
        title: index % 2 === 0 ? `Settlement of the ${dynasty.name} Crisis` : `Riots Under ${dynasty.name}`,
        description:
          index % 2 === 0
            ? `${dynasty.betrayalSummary} The resulting settlement rewrote inheritance law and curbed noble privilege.`
            : `${dynasty.feudSummary} Street unrest and claimant violence forced officials to respond publicly.`,
        consequence:
          index % 2 === 0
            ? `A new succession charter limited future coups.`
            : `Popular unrest spilled into the wider political order and weakened the old guard.`,
        categoryDescription: "the downstream political fallout of family and house conflict",
        causedBy: dynasty.betrayalSummary,
        relatedDynasty: dynasty.name,
      },
    );
  });

  return conflictEvents;
}

export function buildDynastyChronicles(
  { notablePeople = [], civilizationName = "", context = {}, totalSpan = 5000 } = {},
  rng = Math.random,
) {
  if (!Array.isArray(notablePeople) || !notablePeople.length) {
    return { notablePeople: [], dynasties: [], familyTree: [] };
  }

  const sorted = [...notablePeople].sort(
    (left, right) => Number(right?.birth?.yearsAgo || 0) - Number(left?.birth?.yearsAgo || 0),
  );
  const dynastyCount = Math.min(3, Math.max(1, Math.ceil(sorted.length / 2)));
  const buckets = Array.from({ length: dynastyCount }, () => []);

  sorted.forEach((person, index) => {
    buckets[index % dynastyCount].push(person);
  });

  const baseDynasties = buckets
    .filter((members) => members.length)
    .map((members, dynastyIndex) => ({
      id: `dynasty-${dynastyIndex + 1}`,
      name: buildDynastyName(members[0], civilizationName || context?.worldName, rng),
      members,
    }));

  const dynasties = baseDynasties.map((baseDynasty, dynastyIndex, allDynasties) => {
    const rivalDynasty =
      allDynasties.length > 1
        ? allDynasties[(dynastyIndex + 1) % allDynasties.length].name
        : `${baseDynasty.name} Cadet Branch`;
    const alliedDynasty =
      allDynasties.length > 2
        ? allDynasties[(dynastyIndex + 2) % allDynasties.length].name
        : `${baseDynasty.name} League`;
    const cadetBranchName = `${baseDynasty.name} Cadet Branch`;
    const inheritanceCrisis = buildInheritanceCrisis(baseDynasty.name, rivalDynasty, context, rng);
    const marriageStyle = pick(MARRIAGE_STYLES, rng) || "political union";
    const feudSummary = `${baseDynasty.name} and ${rivalDynasty} maintain a bitter feud over charters, marriages, and old betrayals.`;
    const betrayalSummary = `${baseDynasty.name} suffered a high-profile betrayal when one of its own quietly aligned with ${rivalDynasty}.`;

    const lineageMembers = baseDynasty.members.map((member, memberIndex, lineage) => {
      const parent = memberIndex > 0 ? lineage[memberIndex - 1] : null;
      const child = memberIndex < lineage.length - 1 ? lineage[memberIndex + 1] : null;
      const spouse = randomHistoricalPersonName(rng, { civilizationName, worldName: context?.worldName });
      const spouseName = `${spouse.firstName} ${member.lastName}`;
      const siblingNames = [
        memberIndex > 0 ? `${pick(PERSON_FIRST_NAMES, rng)} ${member.lastName}` : null,
        memberIndex < lineage.length - 1 ? `${pick(PERSON_FIRST_NAMES, rng)} ${member.lastName}` : null,
      ].filter(Boolean);
      const marriageYearsAgo = Math.max(
        Number(member?.death?.yearsAgo ?? 0) + 1,
        Number(member?.birth?.yearsAgo ?? 0) - (16 + Math.floor(rng() * 14)),
      );
      const marriageMilestone = buildPersonMilestone(
        "Marriage",
        marriageYearsAgo,
        `Marriage to ${spouseName}`,
        `${member.name} entered a ${marriageStyle} with ${spouseName}, strengthening ${baseDynasty.name}.`,
        totalSpan,
      );
      const spouseProfile = {
        name: spouseName,
        role: "Consort",
        relation: marriageStyle,
        summary: `${spouseName} became consort of ${member.name} through a ${marriageStyle}.`,
      };
      const childProfiles = child
        ? [
            {
              name: child.name,
              role: "Heir",
              relation: "Child",
              summary: `${child.name} inherited the expectations of ${baseDynasty.name}.`,
            },
          ]
        : [];
      const siblingProfiles = siblingNames.map((siblingName) => ({
        name: siblingName,
        role: "Sibling",
        relation: "Sibling",
        summary: `${siblingName} remained part of the wider ${baseDynasty.name} network.`,
      }));
      const mentorName = parent?.name || `${baseDynasty.name} elder`;
      const rivalName =
        memberIndex % 2 === 0
          ? `${pick(PERSON_FIRST_NAMES, rng)} ${baseDynasty.members[0]?.lastName || member.lastName}`
          : `${pick(PERSON_FIRST_NAMES, rng)} ${pick(PERSON_LAST_NAMES, rng)}`;
      const heirName = child?.name || `${pick(PERSON_FIRST_NAMES, rng)} ${member.lastName}`;
      const claimantName = `${pick(PERSON_FIRST_NAMES, rng)} ${pick(PERSON_LAST_NAMES, rng)}`;
      const legendStatus =
        memberIndex === 0
          ? "Legendary Founder"
          : memberIndex === lineage.length - 1
            ? "Active Claimant"
            : memberIndex === 1
              ? "Power Broker"
              : "House Veteran";

      return {
        ...member,
        dynasty: baseDynasty.name,
        dynastyId: baseDynasty.id,
        generation: memberIndex + 1,
        familyRole: parent ? (child ? "Line Holder" : "Heir") : "Founder",
        parentName: parent?.name || null,
        childNames: child ? [child.name] : [],
        spouseName,
        siblingNames,
        spouseProfile,
        childProfiles,
        siblingProfiles,
        mentorName,
        rivalName,
        heirName,
        claimantName,
        legendStatus,
        rivalDynasty,
        alliedDynasty,
        cadetBranchName,
        relationText: parent ? `Child of ${parent.name}` : `Founder of ${baseDynasty.name}`,
        lifeEvents: [...member.lifeEvents.slice(0, 2), marriageMilestone, ...member.lifeEvents.slice(2)],
        summary:
          `${member.summary} Married to ${spouseName}. ${siblingNames.length ? `Known siblings: ${siblingNames.join(", ")}. ` : ""}${legendStatus}.`.trim(),
      };
    });

    return {
      id: baseDynasty.id,
      name: baseDynasty.name,
      founderName: lineageMembers[0]?.name || "Unknown Founder",
      rivalDynasty,
      alliedDynasty,
      cadetBranchName,
      marriageStyle,
      feudSummary,
      betrayalSummary,
      inheritanceCrisis,
      successionWar: `The ${baseDynasty.name} Succession War`,
      generations: lineageMembers.length,
      summary: `${baseDynasty.name} influenced ${
        lineageMembers
          .map((member) => member.category)
          .filter(Boolean)
          .slice(0, 2)
          .join(" and ") || "civic life"
      } across ${lineageMembers.length} generations while contending with ${rivalDynasty}.`,
      members: lineageMembers,
    };
  });

  const enrichedPeople = dynasties.flatMap((dynasty) => dynasty.members);
  const familyTree = dynasties.map((dynasty) => ({
    id: dynasty.id,
    dynastyName: dynasty.name,
    founderName: dynasty.founderName,
    rivalDynasty: dynasty.rivalDynasty,
    alliedDynasty: dynasty.alliedDynasty,
    cadetBranchName: dynasty.cadetBranchName,
    inheritanceCrisis: dynasty.inheritanceCrisis,
    feudSummary: dynasty.feudSummary,
    members: dynasty.members.map(
      ({
        name,
        role,
        generation,
        parentName,
        familyRole,
        spouseName,
        siblingNames,
        mentorName,
        rivalName,
        heirName,
        claimantName,
        legendStatus,
      }) => ({
        name,
        role,
        generation,
        parentName,
        familyRole,
        spouseName,
        siblingNames,
        mentorName,
        rivalName,
        heirName,
        claimantName,
        legendStatus,
      }),
    ),
    links: [
      ...dynasty.members
        .filter((member) => member.parentName)
        .map((member) => ({
          type: "parent-child",
          parent: member.parentName,
          child: member.name,
          generation: member.generation,
        })),
      ...dynasty.members
        .filter((member) => member.spouseName)
        .map((member) => ({
          type: "marriage",
          parent: member.name,
          child: member.spouseName,
          generation: member.generation,
        })),
      ...dynasty.members.flatMap((member) =>
        (Array.isArray(member.siblingNames) ? member.siblingNames : []).map((siblingName) => ({
          type: "sibling",
          parent: member.name,
          child: siblingName,
          generation: member.generation,
        })),
      ),
      {
        type: "rivalry",
        parent: dynasty.name,
        child: dynasty.rivalDynasty,
        generation: 0,
      },
    ],
  }));

  return {
    notablePeople: enrichedPeople,
    dynasties,
    familyTree,
  };
}

function pick(values = [], rng = Math.random) {
  return values[Math.floor(rng() * values.length)] ?? values[0];
}

function fillTemplate(str, rng = Math.random) {
  return String(str || "")
    .replace(/{region}/g, pick(REGIONS, rng))
    .replace(/{gov}/g, pick(GOVS, rng))
    .replace(/{resource}/g, pick(RESOURCES, rng))
    .replace(/{art}/g, pick(ARTS, rng))
    .replace(/{location}/g, pick(LOCATIONS, rng))
    .replace(/{war}/g, pick(WARS, rng))
    .replace(/{discovery}/g, pick(DISCOVERIES, rng))
    .replace(/{treaty}/g, pick(TREATIES, rng))
    .replace(/{frontier}/g, pick(FRONTIERS, rng));
}

function pickWeighted(entries = [], rng = Math.random) {
  const weighted = entries.filter((entry) => Number(entry?.weight) > 0);
  const total = weighted.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
  if (!total) {
    return weighted[0] || null;
  }

  let roll = rng() * total;
  for (const entry of weighted) {
    roll -= Number(entry.weight || 0);
    if (roll <= 0) {
      return entry;
    }
  }

  return weighted.at(-1) || null;
}

export function pickHistoryCategoryForEra(eraName = "The First Contact", rng = Math.random, context = {}) {
  const eraWeights = ERA_CATEGORY_WEIGHTS[String(eraName || "The First Contact")] || {};
  const profile = buildHistoryContextProfile(context);
  const weightedDefinitions = EVENT_CATEGORY_DEFINITIONS.map((definition) => ({
    ...definition,
    weight: Number(definition.weight || 1) * Number(eraWeights[definition.name] || 1),
  }));
  const bumpWeight = (categoryName, amount) => {
    const entry = weightedDefinitions.find((definition) => definition.name === categoryName);
    if (entry) {
      entry.weight += Number(amount || 0);
    }
  };

  if (includesAny(profile.governmentText, ["theocracy", "faith", "religious", "cult"])) {
    bumpWeight("Religious", 6);
    bumpWeight("Political", 2);
  }
  if (includesAny(profile.governmentText, ["empire", "directorate", "dominion", "military", "autocracy"])) {
    bumpWeight("Military", 3);
    bumpWeight("Political", 2);
    bumpWeight("Social Upheaval", 2);
  }
  if (includesAny(profile.governmentText, ["republic", "confederation", "democracy", "council"])) {
    bumpWeight("Diplomatic", 2);
    bumpWeight("Political", 2);
    bumpWeight("Cultural", 1);
  }

  if (includesAny(profile.pressureText, ["high", "elevated"])) {
    bumpWeight("Diplomatic", 4);
    bumpWeight("Military", 3);
    bumpWeight("Social Upheaval", 3);
    bumpWeight("Political", 2);
  }
  if (includesAny(profile.diplomaticText, ["aggressive", "hostile", "belligerent"])) {
    bumpWeight("Military", 2);
    bumpWeight("Diplomatic", 1);
  }
  if (includesAny(profile.diplomaticText, ["pacifist", "open", "xenophilic", "cooperative"])) {
    bumpWeight("Diplomatic", 3);
    bumpWeight("Cultural", 1);
  }

  if (includesAny(profile.techText, ["advanced", "stellar", "interstellar", "orbital"])) {
    bumpWeight("Technological", 3);
    bumpWeight("Scientific", 2);
    bumpWeight("Exploration", 1);
  }

  if (profile.worldTraits.some((entry) => includesAny(entry, ["desert", "arid", "dry", "scarcity", "drought"]))) {
    bumpWeight("Natural Disaster", 4);
    bumpWeight("Economic", 2);
    bumpWeight("Social Upheaval", 2);
  }
  if (profile.worldTraits.some((entry) => includesAny(entry, ["frontier", "outer", "remote", "outpost"]))) {
    bumpWeight("Exploration", 3);
    bumpWeight("Colonization", 2);
    bumpWeight("Military", 1);
  }
  if (profile.worldTraits.some((entry) => includesAny(entry, ["ruins", "anomaly", "ancient", "vault"]))) {
    bumpWeight("Scientific", 2);
    bumpWeight("Exploration", 2);
    bumpWeight("First Contact", 1);
  }

  return (
    pickWeighted(
      weightedDefinitions.map((definition) => ({
        ...definition,
        weight: Math.max(1, Number(definition.weight || 1)),
      })),
      rng,
    ) || EVENT_CATEGORY_DEFINITIONS[0]
  );
}

export function summarizeHistoryThemes(events = []) {
  const counts = new Map();
  for (const event of events) {
    const key = String(event?.category || "Unknown");
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([name]) => name)
    .join(", ");
}

export function summarizeHistorySubcategories(events = []) {
  const counts = new Map();
  for (const event of events) {
    const key = String(event?.subcategory || "General");
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([name]) => name)
    .join(", ");
}

export function buildHistoryEvent(yearsAgo, totalSpan, context = {}, rng = Math.random) {
  const resolvedYearsAgo = Math.max(0, Math.floor(Number(yearsAgo) || 0));
  const galacticDate = resolveGalacticDateFromYearsAgo(resolvedYearsAgo, GALACTIC_CURRENT_DATE);
  const era = resolveGalacticEra(resolvedYearsAgo, totalSpan);
  const category = pickHistoryCategoryForEra(era.name, rng, context);
  const subcategory = resolveContextualSubcategory(category.name, context, rng);
  const templates = EVENT_TEMPLATES[category.name] || EVENT_TEMPLATES.Political;
  const tpl = pick(templates, rng);

  return {
    year: -resolvedYearsAgo,
    yearsAgo: resolvedYearsAgo,
    date: { ...galacticDate, era: era.name },
    era: era.name,
    category: category.name,
    subcategory,
    title: fillTemplate(tpl.title, rng),
    description: fillTemplate(tpl.description, rng),
    consequence: tpl.consequence ? fillTemplate(tpl.consequence, rng) : null,
    categoryDescription: category.description,
    worldName: String(context?.worldName || "").trim(),
  };
}

export function buildSeededHistoryEvent(yearsAgo, totalSpan, context = {}) {
  if (!context?.flashpoint && !context?.eventHook) {
    return null;
  }

  const resolvedYearsAgo = Math.max(0, Math.floor(Number(yearsAgo) || 0));
  const galacticDate = resolveGalacticDateFromYearsAgo(resolvedYearsAgo, GALACTIC_CURRENT_DATE);
  const era = resolveGalacticEra(resolvedYearsAgo, totalSpan);
  const seededCategory = pickHistoryCategoryForEra(era.name, () => 0.65, context);
  const seededSubcategory = resolveContextualSubcategory(seededCategory.name, context, () => 0.95);

  return {
    year: -resolvedYearsAgo,
    yearsAgo: resolvedYearsAgo,
    date: { ...galacticDate, era: era.name },
    era: era.name,
    category: seededCategory.name,
    subcategory: seededSubcategory,
    categoryDescription: seededCategory.description,
    title: context?.eventHook || "Present Flashpoint",
    description: context?.flashpoint
      ? `Current tensions center on ${context.flashpoint}${context.worldName ? ` near ${context.worldName}` : ""}.`
      : `Recent developments are being shaped by ${context?.eventHook || "an unresolved frontier development"}.`,
    consequence: context?.conflictSummary || "The next response will shape the civilization's near future.",
    worldName: String(context?.worldName || "").trim(),
  };
}

export function generateProceduralHistory({
  civilizationName = "",
  historyLength = "medium",
  eraStart = 5000,
  context = {},
  rng = Math.random,
} = {}) {
  const count = historyLength === "short" ? 5 : historyLength === "long" ? 20 : 10;
  const start = Math.max(100, Number(eraStart) || 5000);
  const interval = Math.max(50, Math.floor(start / count));
  const currentDateLabel = formatGalacticDate(GALACTIC_CURRENT_DATE, { forceLong: true });

  const events = [];
  let yearsAgo = start;
  const seededEvent = buildSeededHistoryEvent(yearsAgo, start, context);
  if (seededEvent) {
    events.push(seededEvent);
    yearsAgo = Math.max(0, yearsAgo - interval);
  }

  for (let index = events.length; index < count; index += 1) {
    events.push(buildHistoryEvent(yearsAgo, start, context, rng));
    yearsAgo = Math.max(0, yearsAgo - (interval + Math.floor(rng() * interval * 0.5)));
  }

  const resolvedCivilizationName =
    String(civilizationName || "Generated Civilization").trim() || "Generated Civilization";
  const notablePeople = buildNotablePeopleTimeline(
    {
      events,
      civilizationName: resolvedCivilizationName,
      totalSpan: start,
      context,
    },
    rng,
  );
  const lineageRecord = buildDynastyChronicles(
    {
      notablePeople,
      civilizationName: resolvedCivilizationName,
      context,
      totalSpan: start,
    },
    rng,
  );
  const causalEvents = buildDynastyConflictEvents(
    {
      dynasties: lineageRecord.dynasties,
      totalSpan: start,
      context,
    },
    rng,
  );
  const allEvents = [...events, ...causalEvents].sort(
    (left, right) => Number(right?.yearsAgo || 0) - Number(left?.yearsAgo || 0),
  );

  return {
    calendarName: GALACTIC_CALENDAR_NAME,
    currentDateLabel,
    civilizationName: resolvedCivilizationName,
    overview: {
      Calendar: GALACTIC_CALENDAR_NAME,
      "Current Reference": currentDateLabel,
      Founded: `${start.toLocaleString()} years before present`,
      "Historical Themes": summarizeHistoryThemes(allEvents) || "Political, Exploration, Cultural",
      "Common Subcategories": summarizeHistorySubcategories(allEvents) || "Unification, Deep Survey, Treaty Settlement",
      "Context Drivers": summarizeHistoryContextDrivers(context),
      "Notable Figures":
        lineageRecord.notablePeople
          .map((person) => person.name)
          .slice(0, 3)
          .join(", ") || "No major figures recorded",
      Dynasties: lineageRecord.dynasties.map((dynasty) => dynasty.name).join(", ") || "No dynasties recorded",
      "House Alliances": lineageRecord.dynasties
        .map((dynasty) => `${dynasty.name} ↔ ${dynasty.alliedDynasty}`)
        .join("; "),
      "Rival Houses": lineageRecord.dynasties.map((dynasty) => `${dynasty.name} vs ${dynasty.rivalDynasty}`).join("; "),
      "Inheritance Crisis": lineageRecord.dynasties[0]?.inheritanceCrisis || "No active succession conflict recorded",
      "Great Feuds": lineageRecord.dynasties
        .map((dynasty) => dynasty.feudSummary)
        .slice(0, 2)
        .join(" "),
      "Current Status": pick(["Thriving", "Declining", "Fragmented", "Ascendant", "Collapsed (historical)"], rng),
      "Dominant Culture": pick(
        ["Militarist", "Mercantile", "Scientific", "Artistic", "Religious", "Expansionist"],
        rng,
      ),
      "Stellar Reach": pick(["Single System", "2–5 Systems", "Subsector", "Sector-wide", "Multi-sector"], rng),
      "Current Flashpoint": context?.flashpoint || "Stable frontier conditions",
      "Conflict Pressure": context?.conflictSummary || "No major factional rupture recorded",
      "Notable Achievement": pick(
        [
          "First jump drive development",
          "Peaceful first contact with 3 species",
          "Largest known megastructure",
          "Oldest democracy in the sector",
          "Premier medical research",
          "Longest-standing interstellar trade network",
        ],
        rng,
      ),
    },
    meta: {
      historyLength,
      eraStart: start,
      generatedAt: currentDateLabel,
    },
    events: allEvents,
    notablePeople: lineageRecord.notablePeople,
    dynasties: lineageRecord.dynasties,
    familyTree: lineageRecord.familyTree,
    categories: EVENT_CATEGORY_DEFINITIONS.map(({ name, description, subcategories }) => ({
      name,
      description,
      subcategories: Array.isArray(subcategories) ? [...subcategories] : [],
    })),
    spanLabel: formatGalacticSpan(start),
  };
}
