import { buildWorldLinkedCreatureOptions, createSeededRng, generateGuidSeed } from "./beastGenerator.js";
import { buildLifeTaxonomy, buildLineageProfile } from "./taxonomy.js";

export const BODY_PLANS = [
  "Bilateral Symmetry",
  "Radial Symmetry",
  "Asymmetric",
  "Segmented",
  "Aquatic",
  "Arboreal",
  "Insectoid",
  "Avian",
];

export const HOME_ENVS = [
  "Dense Atmosphere",
  "Thin Atmosphere",
  "Aquatic",
  "Arctic",
  "Desert",
  "Forest",
  "Mountain",
  "Underground",
];

const SENSORY_TRAITS_POOL = [
  { name: "Acute Hearing", dm: 1, description: "+1 DM to Stealth resistance and Recon" },
  { name: "Ultraviolet Vision", dm: 1, description: "+1 DM to Perception in UV environments" },
  { name: "Infrared Vision", dm: 1, description: "+1 DM to detection checks in darkness" },
  { name: "Electroreception", dm: 1, description: "+1 DM to detect hidden electronics" },
  { name: "Tremorsense", dm: 1, description: "+1 DM to locate moving targets on ground" },
  { name: "Colour Blind", dm: -1, description: "-1 DM to tasks requiring colour differentiation" },
  { name: "Poor Night Vision", dm: -1, description: "-1 DM to all actions in low-light conditions" },
  { name: "Sonar", dm: 1, description: "+1 DM to navigation in fluid environments" },
  { name: "Olfactory Tracking", dm: 1, description: "+1 DM to Survival and tracking checks" },
  { name: "Limited Hearing", dm: -1, description: "-1 DM to communication in noisy environments" },
];

const SPECIAL_ABILITIES_POOL = [
  "Natural Armour (armour 2)",
  "Amphibious",
  "Flight (limited)",
  "Regeneration (minor wounds)",
  "Psionic Potential",
  "Toxin Resistance",
  "Camouflage (natural)",
  "Bioluminescence",
  "Venom (melee attack, 1D damage)",
  "Exoskeleton (+1 armour)",
];

const SOCIAL_STRUCTURES = [
  "Hive Mind (partial)",
  "Clan-based Tribes",
  "Matriarchal Hierarchy",
  "Patriarchal Hierarchy",
  "Meritocracy",
  "Theocracy",
  "Technocracy",
  "Democratic Collective",
  "Nomadic Bands",
];

const SETTLEMENT_PATTERNS = [
  "Dispersed habitat clusters",
  "Arcology city-states",
  "Nomadic migration corridors",
  "Orbital ring settlements",
  "Subsurface enclave network",
  "River-valley federation",
  "Sacred highland citadels",
];

const CONTACT_STATUSES = [
  "Open contact",
  "Cautious contact",
  "Isolationist posture",
  "Protected client culture",
  "Expansion frontier",
  "Observation-first diplomacy",
];

const CULTURAL_FOCUSES = [
  "ancestral continuity",
  "trade leverage",
  "scientific stewardship",
  "martial prestige",
  "ritual ecology",
  "collective memory",
  "artisanal mastery",
];

const DIPLOMATIC_POSTURES = [
  "guarded neutrality",
  "mission-driven outreach",
  "mercantile engagement",
  "border vigilance",
  "scholarly exchange",
  "ritualized first-contact protocol",
];

const DIPLOMATIC_LEVERS = [
  "control of a jump corridor",
  "rare biotech patents",
  "pilgrimage rights",
  "frontier survey access",
  "orbital shipyard capacity",
  "ancient treaty archives",
];

const DIPLOMATIC_FLASHPOINTS = [
  "a contested border moon",
  "migration corridor rights",
  "salvage claims in a dead system",
  "trade tariffs on strategic compounds",
  "protection of a client habitat",
  "cultural claims over precursor ruins",
];

const ALLY_ARCHETYPES = [
  "merchant patrons",
  "scout mediators",
  "neighboring client polities",
  "shared-faith enclaves",
  "academic exchange blocs",
  "naval mutual-defense partners",
];

const RIVAL_ARCHETYPES = [
  "pirate confederacies",
  "resource competitors",
  "ancestral rival houses",
  "expansionist outsiders",
  "dogmatic missionary states",
  "border militarists",
];

const FACTION_AGENDAS = [
  "control the next colonial charter",
  "lock in defense appropriations",
  "restore ancestral migration routes",
  "monopolize starport customs",
  "broker peace with offworld rivals",
  "seize symbolic control of precursor ruins",
];

const EVENT_CHAIN_COMPLICATIONS = [
  "a trusted envoy disappears during shuttle transfer",
  "archival evidence surfaces that challenges the treaty",
  "port strikes interrupt critical supply lanes",
  "a border patrol overreacts and sparks a panic",
  "smugglers exploit the crisis for private gain",
  "religious custodians refuse outside arbitration",
];

const EVENT_CHAIN_PAYOFFS = [
  "stabilize the subsector through a negotiated compact",
  "trigger a lasting cold war between rival blocs",
  "open a fresh trade corridor for allied worlds",
  "elevate the culture into regional leadership",
  "fracture the current regime into successor states",
  "uncover a deeper precursor conspiracy",
];

const GOVERNMENTS = [
  "None (anarchy)",
  "Council of Elders",
  "Corporate Council",
  "Hereditary Monarchy",
  "Elected Senate",
  "Military Junta",
  "Religious Authority",
  "AI Governance",
  "Federation",
];

const TAGLINES = [
  "ancient starfarers who chart the deep void",
  "warriors bound by a code of honour older than their sun",
  "gentle philosophers who communicate through song",
  "mercantile traders whose webs span a dozen sectors",
  "reclusive scholars hoarding the knowledge of dead civilisations",
  "pack hunters who value loyalty above all",
  "psychic nomads drifting between stars in living ships",
  "proud artisans whose technology is indistinguishable from art",
];

const SPECIES_PREFIXES = ["Vel", "Kra", "Sh'", "Ax", "Mer", "Tor", "Dyn", "Ul", "Ixo", "Var"];
const SPECIES_SUFFIXES = ["athi", "oni", "ek", "ara", "ites", "oth", "ians", "enni", "azh", "uru"];
const ICONS = ["👽", "🦎", "🐙", "🦑", "🕷️", "🦂", "🐦", "🦈", "🐉", "🦋"];

function pick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

function d6(rng = Math.random, count = 1) {
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    total += Math.floor(rng() * 6) + 1;
  }
  return total;
}

function shuffle(arr, rng = Math.random) {
  return [...arr]
    .map((value) => ({ value, sort: rng() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.value);
}

function uniqueRemarks(values = []) {
  return [...new Set(values.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

export function describeSophontTechBand(techLevel = 0) {
  const level = Number(techLevel) || 0;
  if (level >= 12) return "advanced interstellar";
  if (level >= 9) return "stellar-capable";
  if (level >= 6) return "industrial orbital";
  return "prestellar";
}

export function buildSophontCivilizationProfile(
  { techLevel = 0, socialStructure = "Clan-based Tribes", government = "Council of Elders", sourceWorld = null } = {},
  rng = Math.random,
) {
  const techBand = describeSophontTechBand(techLevel);
  const contactPool =
    techLevel >= 9 ? CONTACT_STATUSES.filter((entry) => entry !== "Protected client culture") : CONTACT_STATUSES;
  const contactStatus = pick(contactPool, rng);
  const settlementPattern = pick(SETTLEMENT_PATTERNS, rng);
  const culturalFocus = pick(CULTURAL_FOCUSES, rng);
  const diplomaticPosture = pick(DIPLOMATIC_POSTURES, rng);

  return {
    "Settlement Pattern": settlementPattern,
    "Contact Status": sourceWorld?.nativeSophontLife ? `Native ${contactStatus.toLowerCase()}` : contactStatus,
    "Cultural Focus": culturalFocus,
    "Diplomatic Posture": diplomaticPosture,
    "Civic Frame": `${government} within a ${String(socialStructure || "community structure").toLowerCase()}`,
    "Tech Band": techBand,
  };
}

export function buildSophontDiplomacyProfile(
  { techLevel = 0, civilization = {}, sourceWorld = null } = {},
  rng = Math.random,
) {
  const contactStatus = String(civilization["Contact Status"] || "Open contact");
  const currentStance = String(civilization["Diplomatic Posture"] || "guarded neutrality");
  const leverage = pick(DIPLOMATIC_LEVERS, rng);
  const flashpoint = pick(DIPLOMATIC_FLASHPOINTS, rng);
  const ally = pick(ALLY_ARCHETYPES, rng);
  const rival = pick(RIVAL_ARCHETYPES, rng);
  const techBand = String(civilization["Tech Band"] || describeSophontTechBand(techLevel));

  return {
    "Current Stance": currentStance,
    "Primary Ally": sourceWorld?.nativeSophontLife ? `local ${ally}` : ally,
    "Primary Rival": rival,
    "Strategic Leverage": leverage,
    "Current Flashpoint": flashpoint,
    hooks: [
      `Negotiations often pivot on ${leverage}.`,
      `${contactStatus} is tested by ${flashpoint}.`,
      `Relations remain shaped by ${currentStance}.`,
    ],
    techBand,
  };
}

export function buildSophontHistoryTimeline({
  name = "Generated Sophont",
  techLevel = 0,
  civilization = {},
  diplomacy = {},
  sourceWorld = null,
} = {}) {
  const culturalFocus = String(civilization["Cultural Focus"] || "shared survival");
  const settlementPattern = String(civilization["Settlement Pattern"] || "dispersed settlements");
  const techBand = String(civilization["Tech Band"] || describeSophontTechBand(techLevel));
  const contactStatus = String(civilization["Contact Status"] || "Open contact");
  const flashpoint = String(diplomacy["Current Flashpoint"] || "regional pressures");

  return [
    {
      era: "Origins",
      title: sourceWorld?.nativeSophontLife ? "Ancestral Consolidation" : "Arrival and Adaptation",
      summary: sourceWorld?.nativeSophontLife
        ? `${name} first unified around ${culturalFocus} on ${sourceWorld?.name || "their homeworld"}.`
        : `${name} established enduring footholds through ${settlementPattern.toLowerCase()} after offworld arrival.`,
    },
    {
      era: "Expansion",
      title: techBand === "prestellar" ? "Regional Ascendancy" : "Interstellar Opening",
      summary:
        techBand === "prestellar"
          ? `Power centers spread through ${settlementPattern.toLowerCase()} while cultural identity hardened.`
          : `${contactStatus} enabled a ${techBand} rise anchored by trade, patrols, and exploratory reach.`,
    },
    {
      era: "Current Era",
      title: "Present Tension",
      summary: `Current politics turn on ${flashpoint} while leaders maintain ${String(diplomacy["Current Stance"] || "guarded neutrality")}.`,
    },
  ];
}

export function buildSophontFactionTensions(
  { name = "Generated Sophont", civilization = {}, diplomacy = {}, sourceWorld = null } = {},
  rng = Math.random,
) {
  const settlementPattern = String(civilization["Settlement Pattern"] || "localized settlements");
  const flashpoint = String(diplomacy["Current Flashpoint"] || "regional pressures");
  const worldFactionSummary = String(sourceWorld?.factionsProfile?.summary || "").trim();
  const conflictProfile =
    sourceWorld?.civilConflict && typeof sourceWorld.civilConflict === "object" ? sourceWorld.civilConflict : {};
  const activeConflict = Boolean(conflictProfile.active);
  const pressureLevel = activeConflict ? "High" : conflictProfile.eligible ? "Elevated" : "Managed";
  const trigger = String(conflictProfile.trigger || flashpoint || "faction rivalry");
  const agendas = shuffle(FACTION_AGENDAS, rng);
  const factions = [
    {
      name: `${name} Concord`,
      role: "established leadership",
      agenda: agendas[0] || "hold the current order together",
    },
    {
      name: `${name} Frontier Bloc`,
      role: activeConflict ? "hardline opposition" : "ambitious reformers",
      agenda: agendas[1] || "shift the balance of power",
    },
  ];

  return {
    "Pressure Level": pressureLevel,
    "Conflict Trigger": trigger,
    "Local Faction Profile":
      worldFactionSummary || `${pressureLevel} faction pressure around ${settlementPattern.toLowerCase()}`,
    summary: `${factions[0].name} and ${factions[1].name} are maneuvering over ${flashpoint}.`,
    factions,
    hooks: [
      `${factions[0].name} wants to ${String(factions[0].agenda || "secure influence")}.`,
      `${factions[1].name} is prepared to exploit ${trigger}.`,
    ],
  };
}

export function buildSophontEventChain(
  { name = "Generated Sophont", diplomacy = {}, factionTensions = {}, historyTimeline = [], sourceWorld = null } = {},
  rng = Math.random,
) {
  const flashpoint = String(
    diplomacy["Current Flashpoint"] || factionTensions["Conflict Trigger"] || "regional pressures",
  );
  const stance = String(diplomacy["Current Stance"] || "guarded neutrality");
  const leadFaction = String(factionTensions?.factions?.[0]?.name || `${name} Concord`);
  const rivalFaction = String(factionTensions?.factions?.[1]?.name || `${name} Frontier Bloc`);
  const recentTurn = String(historyTimeline.at(-1)?.title || "Present Tension");
  const worldName = String(sourceWorld?.name || "the linked world");

  return [
    {
      phase: "Catalyst",
      title: `Dispute over ${flashpoint}`,
      summary: `${leadFaction} petitions outside mediators after tensions flare on ${worldName}.`,
      stakes: `If mishandled, ${recentTurn.toLowerCase()} hardens into open confrontation.`,
    },
    {
      phase: "Escalation",
      title: "Faction Brinkmanship",
      summary: `${rivalFaction} challenges the current order while leaders cling to ${stance}.`,
      stakes: pick(EVENT_CHAIN_COMPLICATIONS, rng),
    },
    {
      phase: "Resolution",
      title: "Accord or Schism",
      summary: `A final summit will decide whether ${name} politics stabilize or split into hostile blocs.`,
      stakes: pick(EVENT_CHAIN_PAYOFFS, rng),
    },
  ];
}

export function buildSophontWorldUpdate(record = {}, existingWorld = {}) {
  const civilization = record?.civilization && typeof record.civilization === "object" ? record.civilization : {};
  const settlementPattern = String(civilization["Settlement Pattern"] || "Localized settlements");
  const contactStatus = String(civilization["Contact Status"] || "Open contact");
  const culturalFocus = String(civilization["Cultural Focus"] || "shared survival");
  const diplomaticPosture = String(civilization["Diplomatic Posture"] || "guarded neutrality");
  const diplomacy = record?.diplomacy && typeof record.diplomacy === "object" ? record.diplomacy : {};
  const factionTensions =
    record?.factionTensions && typeof record.factionTensions === "object" ? record.factionTensions : {};
  const techBand = String(civilization["Tech Band"] || describeSophontTechBand(record?.techLevel));
  const currentFlashpoint = String(diplomacy["Current Flashpoint"] || "regional pressures");
  const currentStance = String(diplomacy["Current Stance"] || diplomaticPosture);
  const recentHistory = Array.isArray(record?.historyTimeline) ? record.historyTimeline.at(-1) : null;
  const factionSummary = String(
    factionTensions.summary ||
      factionTensions["Local Faction Profile"] ||
      existingWorld?.factionsProfile?.summary ||
      "Faction pressure contained",
  );
  const originDescriptor = String(record?.lineage?.originModel || record?.origin || "").toLowerCase();
  const nativeSophontLife = Boolean(
    existingWorld?.nativeSophontLife ||
    record?.sourceWorld?.nativeSophontLife ||
    originDescriptor.includes("native") ||
    originDescriptor.includes("independent evolution"),
  );
  const summary = `${record?.name || "Linked sophonts"} maintain ${settlementPattern.toLowerCase()} with ${contactStatus} and ${currentStance}.`;
  const remarks = uniqueRemarks([
    ...(Array.isArray(existingWorld?.remarks) ? existingWorld.remarks : []),
    `Sophont dossier: ${summary}`,
    `Cultural focus centers on ${culturalFocus}.`,
    `Current flashpoint: ${currentFlashpoint}.`,
    `Faction pressure: ${factionSummary}.`,
  ]).slice(-8);

  const governmentNote = `${record?.government || "Local council"} guided by ${String(record?.socialStructure || "communal ties").toLowerCase()}`;
  const governmentProfile = String(existingWorld?.governmentProfile || "").includes(String(record?.government || ""))
    ? String(existingWorld?.governmentProfile || "")
    : existingWorld?.governmentProfile
      ? `${existingWorld.governmentProfile}; Sophont influence: ${record?.government || "local council"}`
      : governmentNote;
  const secondaryWorldContext = String(existingWorld?.secondaryWorldContext || "").includes(summary)
    ? String(existingWorld?.secondaryWorldContext || summary)
    : existingWorld?.secondaryWorldContext
      ? `${existingWorld.secondaryWorldContext}; ${summary}`
      : summary;

  return {
    nativeSophontLife,
    nativeSophontStatus: nativeSophontLife ? "exist" : String(existingWorld?.nativeSophontStatus || "absent"),
    governmentProfile,
    secondaryWorldContext,
    techLevelPockets: `${techBand} enclaves benchmarked at TL ${Number(record?.techLevel ?? 0)}.`,
    linkedSophontProfile: {
      id: String(record?.id || ""),
      name: String(record?.name || "Linked Sophont"),
      scientificName: String(record?.taxonomy?.["Scientific Name"] || "Unclassified sophont"),
      origin: String(record?.origin || record?.lineage?.originModel || "Unknown origin"),
      originModel: String(record?.lineage?.originModel || record?.origin || "Unknown origin"),
      humanAnalogueStatus: String(record?.lineage?.humanAnalogueStatus || "No clear Terran analogue"),
      techLevel: Number(record?.techLevel ?? 0),
      government: String(record?.government || "—"),
      socialStructure: String(record?.socialStructure || "—"),
      settlementPattern,
      contactStatus,
      diplomaticPosture,
      currentStance,
      culturalFocus,
      currentFlashpoint,
      conflictTrigger: String(factionTensions["Conflict Trigger"] || currentFlashpoint),
      pressureLevel: String(factionTensions["Pressure Level"] || "Managed"),
      factionSummary,
      historySummary: recentHistory?.title || "Present Tension",
      diplomacyHooks: Array.isArray(diplomacy?.hooks) ? [...diplomacy.hooks] : [],
      eventChainHighlights: Array.isArray(record?.eventChain)
        ? record.eventChain.map((entry) => entry.title).slice(0, 3)
        : [],
      summary: recentHistory?.summary ? `${summary} ${recentHistory.summary}` : `${summary} ${factionSummary}`,
      updatedAt: String(record?.updatedAt || new Date().toISOString()),
    },
    remarks,
  };
}

export function mapWorldToSophontEnvironment(world = {}) {
  const terrain = String(buildWorldLinkedCreatureOptions(world).terrain || "").toLowerCase();
  const hydrographics = Number(world?.hydrographics ?? 0);
  const atmosphereCode = Number(world?.atmosphereCode ?? world?.atmosphere ?? 0);
  const avgTempC = Number(world?.avgTempC ?? 20);
  const tempCategory = String(world?.tempCategory || "").toLowerCase();

  if (terrain.includes("ocean") || terrain.includes("wet") || hydrographics >= 8) return "Aquatic";
  if (terrain.includes("frozen") || tempCategory.includes("frozen") || avgTempC <= -5) return "Arctic";
  if (terrain.includes("desert") || terrain.includes("baked") || hydrographics <= 2 || avgTempC >= 35) return "Desert";
  if (terrain.includes("mountain") || terrain.includes("chasm") || terrain.includes("precipice")) return "Mountain";
  if (terrain.includes("cavern") || terrain.includes("mine") || terrain.includes("abyss")) return "Underground";
  if (terrain.includes("woods") || terrain.includes("rural") || terrain.includes("cropland")) return "Forest";
  if (atmosphereCode >= 10) return "Dense Atmosphere";
  if (atmosphereCode > 0 && atmosphereCode <= 3) return "Thin Atmosphere";
  return "Forest";
}

export function recommendBodyPlan(environment = "Forest", rng = Math.random) {
  const env = String(environment || "Forest");
  const lookup = {
    Aquatic: ["Aquatic", "Radial Symmetry", "Bilateral Symmetry"],
    Arctic: ["Bilateral Symmetry", "Segmented", "Avian"],
    Desert: ["Bilateral Symmetry", "Insectoid", "Asymmetric"],
    Forest: ["Arboreal", "Bilateral Symmetry", "Avian"],
    Mountain: ["Avian", "Bilateral Symmetry", "Segmented"],
    Underground: ["Segmented", "Insectoid", "Asymmetric"],
    "Dense Atmosphere": ["Avian", "Bilateral Symmetry", "Radial Symmetry"],
    "Thin Atmosphere": ["Bilateral Symmetry", "Segmented", "Avian"],
  };

  return pick(lookup[env] || BODY_PLANS, rng);
}

export function buildWorldLinkedSophontOptions(world = {}) {
  const worldLink = buildWorldLinkedCreatureOptions(world);
  const homeEnvironment = mapWorldToSophontEnvironment(world);

  return {
    sourceWorld: {
      ...worldLink.sourceWorld,
      nativeSophontLife: Boolean(world?.nativeSophontLife),
    },
    homeEnvironment,
    bodyPlan: recommendBodyPlan(homeEnvironment, createSeededRng(`${worldLink.sourceWorld?.name || "world"}-body`)),
    origin: world?.nativeSophontLife ? "Native sophont lineage" : "Adapted colonial or transplanted lineage",
  };
}

export function buildSophontImagePrompt(profile = {}) {
  const name = String(profile?.name || "Generated Sophont");
  const bodyPlan = String(profile?.biology?.["Body Plan"] || "Bilateral Symmetry").toLowerCase();
  const environment = String(profile?.biology?.["Home Environment"] || "temperate frontier").toLowerCase();
  const height = String(profile?.biology?.["Avg Height"] || "human-scale");
  const mass = String(profile?.biology?.["Avg Mass"] || "athletic build");
  const language = String(profile?.culture?.Language || "expressive communication").toLowerCase();
  const aesthetics = String(profile?.culture?.Aesthetics || "symbolic").toLowerCase();
  const posture = String(profile?.civilization?.["Diplomatic Posture"] || "guarded neutrality").toLowerCase();
  const focus = String(profile?.civilization?.["Cultural Focus"] || "shared survival").toLowerCase();
  const government = String(profile?.government || "local governance");
  const techBand = String(profile?.civilization?.["Tech Band"] || describeSophontTechBand(profile?.techLevel));
  const worldName = String(profile?.sourceWorld?.name || "their homeworld");
  const traitNames = Array.isArray(profile?.sensoryTraits)
    ? profile.sensoryTraits
        .slice(0, 2)
        .map((trait) => trait?.name)
        .filter(Boolean)
        .join(", ")
    : "distinctive sensory adaptations";
  const specialAbilities =
    Array.isArray(profile?.specialAbilities) && profile.specialAbilities.length
      ? profile.specialAbilities.slice(0, 2).join(", ").toLowerCase()
      : "no obvious overt augmentations";

  return {
    visualDescription: `${name} present as a ${bodyPlan} sophont species shaped by ${environment} conditions, averaging ${height} and ${mass}. Their appearance suggests ${focus}, ${posture}, and ${aesthetics} design language, with recognizable traits such as ${traitNames} and ${specialAbilities}.`,
    imagePrompt: `Detailed sci-fi species concept art of ${name}, alien sophont from ${worldName}, ${bodyPlan} anatomy, adapted to ${environment}, average build ${height} and ${mass}, visual cues of ${focus}, ${aesthetics} cultural design, ${language} communication style, ${government} civic identity, ${techBand} setting, full-body character sheet, cinematic but realistic lighting, highly detailed.`,
    imageCaption: `${name} — ${techBand} sophont concept from ${worldName}`,
  };
}

export function generateSophontProfile(options = {}) {
  const {
    seed = "",
    name = "Generated Sophont",
    nameSeed = "",
    bodyPlan = "random",
    homeEnvironment = "random",
    sourceWorld = null,
  } = options;

  const resolvedSeed = String(seed || "").trim() || generateGuidSeed("sophont");
  const resolvedNameSeed = String(nameSeed || "").trim() || resolvedSeed;
  const resolvedName =
    !String(name || "").trim() || name === "Generated Sophont"
      ? randomSophontName(resolvedNameSeed)
      : String(name).trim();
  const rng = createSeededRng(resolvedSeed);
  const resolvedEnvironment = homeEnvironment === "random" ? pick(HOME_ENVS, rng) : homeEnvironment;
  const resolvedBodyPlan = bodyPlan === "random" ? recommendBodyPlan(resolvedEnvironment, rng) : bodyPlan;

  const rawMods = {
    Strength: d6(rng, 1) - 4,
    Dexterity: d6(rng, 1) - 4,
    Endurance: d6(rng, 1) - 4,
    Intelligence: d6(rng, 1) - 4,
    Education: d6(rng, 1) - 4,
    "Social Standing": d6(rng, 1) - 4,
  };

  const charModifiers = Object.fromEntries(
    Object.entries(rawMods).map(([key, value]) => [key, Math.min(2, Math.max(-2, value))]),
  );

  const sensoryTraits = shuffle(SENSORY_TRAITS_POOL, rng).slice(0, 2 + Math.floor(rng() * 3));
  const specialAbilities = rng() < 0.35 ? shuffle(SPECIAL_ABILITIES_POOL, rng).slice(0, 1 + Math.floor(rng() * 2)) : [];
  const techLevel = Math.floor(rng() * 16);
  const socialStructure = pick(SOCIAL_STRUCTURES, rng);
  const government = pick(GOVERNMENTS, rng);
  const civilization = buildSophontCivilizationProfile({ techLevel, socialStructure, government, sourceWorld }, rng);
  const diplomacy = buildSophontDiplomacyProfile({ techLevel, civilization, sourceWorld }, rng);
  const historyTimeline = buildSophontHistoryTimeline({
    name: resolvedName,
    techLevel,
    civilization,
    diplomacy,
    sourceWorld,
  });
  const factionTensions = buildSophontFactionTensions(
    { name: resolvedName, civilization, diplomacy, sourceWorld },
    rng,
  );
  const eventChain = buildSophontEventChain(
    { name: resolvedName, diplomacy, factionTensions, historyTimeline, sourceWorld },
    rng,
  );
  const taxonomy = buildLifeTaxonomy({
    seed: resolvedSeed,
    name: resolvedName,
    category: "sophont",
    bodyPlan: resolvedBodyPlan,
    environment: resolvedEnvironment,
    niche: civilization["Cultural Focus"] || socialStructure,
  });
  const lineage = buildLineageProfile({
    seed: resolvedSeed,
    category: "sophont",
    sourceWorld,
    bodyPlan: resolvedBodyPlan,
    environment: resolvedEnvironment,
  });

  const profile = {
    id: String(options.id || resolvedSeed),
    name: resolvedName,
    icon: pick(ICONS, rng),
    tagline: pick(TAGLINES, rng),
    biology: {
      "Body Plan": resolvedBodyPlan,
      "Home Environment": resolvedEnvironment,
      "Avg Height": `${100 + Math.round(rng() * 150)} cm`,
      "Avg Mass": `${20 + Math.round(rng() * 130)} kg`,
      Lifespan: `${30 + Math.round(rng() * 150)} years`,
      Reproduction: pick(["Sexual, live birth", "Asexual, budding", "Oviparous", "Sporulation"], rng),
      Diet: pick(["Omnivore", "Herbivore", "Carnivore", "Filter Feeder", "Chemotroph"], rng),
    },
    charModifiers,
    sensoryTraits,
    culture: {
      Language: pick(["Spoken (sonic)", "Gestural", "Chemical", "Colour-based", "Sonic/Infrasound", "Telepathic"], rng),
      Religion: pick(["Animist", "Polytheist", "Monotheist", "Secular", "Ancestor worship", "Philosophic"], rng),
      Aesthetics: pick(["Minimalist", "Ornate", "Functional", "Abstract", "Symbolic", "Chaotic"], rng),
      "Primary Drive": pick(
        ["Expansion", "Preservation", "Knowledge", "Trade", "Conquest", "Balance", "Isolation"],
        rng,
      ),
      Attitude: pick(["Xenophilic", "Xenophobic", "Pragmatic", "Curious", "Aggressive", "Pacifist"], rng),
    },
    civilization,
    diplomacy,
    historyTimeline,
    factionTensions,
    eventChain,
    techLevel,
    socialStructure,
    government,
    ftlCapable: techLevel >= 9,
    specialAbilities,
    taxonomy,
    lineage,
    sourceWorld,
    origin: lineage.originModel,
    worldIntegration: {
      summary: `${resolvedName} are a ${civilization["Tech Band"]} culture centered on ${String(civilization["Cultural Focus"] || "shared purpose")}.`,
      censusContext: `${government} / ${socialStructure}`,
      notes: [
        `${civilization["Contact Status"]} across ${String(civilization["Settlement Pattern"] || "local habitats").toLowerCase()}.`,
        `Diplomatic posture favors ${String(civilization["Diplomatic Posture"] || "guarded neutrality")}.`,
        `Current flashpoint: ${String(diplomacy["Current Flashpoint"] || "regional pressures")}.`,
        `Faction pressure: ${String(factionTensions.summary || "contained political rivalry")}.`,
        `Event chain opening: ${String(eventChain[0]?.title || "Present Tension")}.`,
        `Recent turning point: ${String(historyTimeline.at(-1)?.title || "Present Tension")}.`,
        lineage.uniquenessStatement,
      ],
    },
    seed: resolvedSeed,
  };

  return {
    ...profile,
    ...buildSophontImagePrompt(profile),
  };
}

export function randomSophontName(seed = "") {
  const rng = createSeededRng(String(seed || "").trim() || generateGuidSeed("sophont-name"));
  return `${pick(SPECIES_PREFIXES, rng)}${pick(SPECIES_SUFFIXES, rng)}`;
}
