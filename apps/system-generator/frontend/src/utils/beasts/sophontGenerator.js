import { buildWorldLinkedCreatureOptions, createSeededRng } from "./beastGenerator.js";

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

export function generateSophontProfile(options = {}) {
  const {
    seed = "sophont-seed",
    name = "Generated Sophont",
    bodyPlan = "random",
    homeEnvironment = "random",
    sourceWorld = null,
  } = options;

  const rng = createSeededRng(seed);
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

  return {
    name,
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
    techLevel,
    socialStructure: pick(SOCIAL_STRUCTURES, rng),
    government: pick(GOVERNMENTS, rng),
    ftlCapable: techLevel >= 9,
    specialAbilities,
    sourceWorld,
    origin: sourceWorld?.nativeSophontLife ? "Native sophont lineage" : "Adapted colonial or transplanted lineage",
    seed,
  };
}

export function randomSophontName(seed = "sophont-seed") {
  const rng = createSeededRng(seed);
  return `${pick(SPECIES_PREFIXES, rng)}${pick(SPECIES_SUFFIXES, rng)}`;
}
