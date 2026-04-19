import {
  ARMOR_TABLE,
  DEFAULT_PRIMARY_NICHES,
  DEFAULT_TERRAINS,
  ECOLOGICAL_NICHE_TABLE,
  GRAVITY_MODIFIERS,
  QUANTITY_TABLE,
  REACTION_TABLE,
  SIZE_TABLE,
  SPEED_BANDS,
  SPEED_TABLE,
  TERRAIN_LOCOMOTION_TABLE,
  WEAPON_TABLE,
} from "./beastTables.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashSeed(seed) {
  const text = String(seed ?? "beast-seed");
  let hash = 1779033703 ^ text.length;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return hash >>> 0 || 1;
}

export function createSeededRng(seed = "beast-seed") {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollDie(rng, sides = 6) {
  const roller = typeof rng === "function" ? rng : Math.random;
  return Math.floor(roller() * sides) + 1;
}

export function rollDice(rng, count = 1, sides = 6) {
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    total += rollDie(rng, sides);
  }
  return total;
}

export function rollFlux(rng) {
  return rollDie(rng, 6) - rollDie(rng, 6);
}

export function rollHighFlux(rng) {
  return Math.abs(rollDie(rng, 6) - rollDie(rng, 6));
}

export function normalizeWorldSize(worldSize = "8") {
  if (worldSize === null || worldSize === undefined || worldSize === "") {
    return "8";
  }

  const text = String(worldSize).trim().toUpperCase();
  if (/^[0-9A-F]$/.test(text)) {
    return text;
  }

  const parsed = Number(text);
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 15) {
    return parsed.toString(16).toUpperCase();
  }

  return "8";
}

export function resolveGravityMod(worldSize = "8") {
  const normalized = normalizeWorldSize(worldSize);
  return GRAVITY_MODIFIERS[normalized] ?? 0;
}

export function resolveTerrain(terrain = "Clear") {
  const exact = DEFAULT_TERRAINS.find((entry) => entry.toLowerCase() === String(terrain).trim().toLowerCase());
  return exact || "Clear";
}

export function resolveLocomotion(terrain = "Clear", roll = 1) {
  const resolvedTerrain = resolveTerrain(terrain);
  const row = TERRAIN_LOCOMOTION_TABLE[resolvedTerrain] || TERRAIN_LOCOMOTION_TABLE.Clear;
  const column = clamp(Number(roll) || 1, 1, 6) - 1;
  return row[column];
}

export function resolveEcologicalNiche(flux = 0, primaryNiche = null) {
  const normalizedFlux = clamp(Number(flux) || 0, -5, 5);
  const row = ECOLOGICAL_NICHE_TABLE[normalizedFlux] || ECOLOGICAL_NICHE_TABLE[0];
  const niche = DEFAULT_PRIMARY_NICHES.includes(primaryNiche) ? primaryNiche : row.niche;
  const subniche = row.subniches[niche] || row.subniches[row.niche];
  return { flux: normalizedFlux, niche, subniche, tableNiche: row.niche };
}

function resolveQuantityCount(formula, rng) {
  switch (formula) {
    case "1":
      return 1;
    case "1/2D":
      return Math.max(2, Math.ceil(rollDie(rng, 6) / 2));
    case "1D":
      return rollDie(rng, 6);
    case "1D+2":
      return rollDie(rng, 6) + 2;
    case "2D":
      return rollDice(rng, 2, 6);
    case "3D":
      return rollDice(rng, 3, 6);
    case "4D":
      return rollDice(rng, 4, 6);
    case "6D":
      return rollDice(rng, 6, 6);
    case "8D":
      return rollDice(rng, 8, 6);
    case "2D*2D":
      return rollDice(rng, 2, 6) * rollDice(rng, 2, 6);
    default:
      return 1;
  }
}

export function resolveQuantity(flux = 0, rng = Math.random) {
  const normalizedFlux = clamp(Number(flux) || 0, -5, 5);
  const row = QUANTITY_TABLE[normalizedFlux] || QUANTITY_TABLE[0];
  return {
    flux: normalizedFlux,
    label: row.label,
    formula: row.formula,
    count: resolveQuantityCount(row.formula, rng),
  };
}

export function resolveSize(flux = 0, gravityMod = 0) {
  const adjustedFlux = clamp((Number(flux) || 0) + (Number(gravityMod) || 0), -6, 6);
  const row = SIZE_TABLE[adjustedFlux] || SIZE_TABLE[0];
  return {
    flux: Number(flux) || 0,
    gravityMod: Number(gravityMod) || 0,
    adjustedFlux,
    ...row,
  };
}

export function resolveStrength({ size = 4, worldSize = "8", roll = 1 } = {}) {
  if (size <= 3) {
    return { rating: "Minimal", dice: "0D", melee: 0 };
  }

  const normalizedWorldSize = normalizeWorldSize(worldSize);
  let index = Number(roll) || 1;

  if (normalizedWorldSize === "4") {
    index -= 1;
  }
  if (["A", "B", "C", "D", "E", "F"].includes(normalizedWorldSize)) {
    index += 1;
  }
  if (size === 4) {
    index -= 3;
  }
  if (size >= 6) {
    index += 2;
  }

  index = clamp(index, 0, 7);

  const lookup = {
    0: { rating: "Feeble", dice: "1D-3", melee: 0 },
    1: { rating: "Weak", dice: "1D", melee: 1 },
    2: { rating: "Typical", dice: "2D", melee: 2 },
    3: { rating: "Typical", dice: "3D", melee: 3 },
    4: { rating: "Strong", dice: "4D", melee: 4 },
    5: { rating: "V Strong", dice: "5D", melee: 5 },
    6: { rating: "Formidable", dice: "6D", melee: 6 },
    7: { rating: "Herculean", dice: "7D", melee: 7 },
  };

  return lookup[index];
}

export function resolveSpeed({ roll = 1, locomotion = "Walker", niche = "Omnivore" } = {}) {
  const moveType = String(locomotion || "Walker");

  if (moveType === "Static") {
    return {
      locomotion: moveType,
      speedC: "Static",
      kph: 0,
      speedAF: "Static",
      speedB: "Static",
      resolvedRoll: 0,
    };
  }

  let resolvedRoll = Number(roll) || 1;
  if (["Swimmer", "Swims"].includes(moveType)) {
    resolvedRoll += 1;
  }
  if (["Diver", "Aquatic"].includes(moveType)) {
    resolvedRoll += 2;
  }
  if (["Flyer", "Flyphib", "Triphib"].includes(moveType)) {
    resolvedRoll += 2;
  }
  if (niche === "Producer") {
    resolvedRoll -= 5;
  }

  resolvedRoll = clamp(resolvedRoll, 0, 8);
  const row = SPEED_TABLE[resolvedRoll] || SPEED_TABLE[1];
  const band = SPEED_BANDS[row.speedC] || SPEED_BANDS.Walk;

  return {
    locomotion: moveType,
    speedC: row.speedC,
    kph: row.kph,
    speedAF: band.attack,
    speedB: band.burst,
    resolvedRoll,
  };
}

export function resolveReaction(subniche, rng = Math.random) {
  const row = REACTION_TABLE[subniche] || { attack: 10, flee: 10 };
  const adjust = (value) => (typeof value === "number" ? Math.max(2, value - rollDie(rng, 6)) : value);
  return {
    subniche,
    attack: adjust(row.attack),
    flee: adjust(row.flee),
    attackBase: row.attack,
    fleeBase: row.flee,
  };
}

export function resolveWeapon(flux = 0, niche = "Omnivore") {
  let adjustedFlux = clamp(Number(flux) || 0, -6, 6);
  if (niche === "Carnivore") {
    adjustedFlux -= 1;
  }
  if (niche === "Herbivore") {
    adjustedFlux += 1;
  }
  adjustedFlux = clamp(adjustedFlux, -6, 6);

  const weapon = WEAPON_TABLE[adjustedFlux] || "Body";
  const damageType = ["Claws", "Tusks", "Teeth", "Horns", "Spikes", "Sting"].includes(weapon) ? "Cut" : "Blow";

  return { flux: adjustedFlux, weapon, damageType };
}

export function resolveArmor(armorCount = 0, armorFluxes = [], rng = Math.random) {
  const count = clamp(Number(armorCount) || 0, 0, 5);
  const types = [];

  for (let index = 0; index < count; index += 1) {
    const flux = Array.isArray(armorFluxes) && armorFluxes[index] !== undefined ? armorFluxes[index] : rollFlux(rng);
    const normalizedFlux = clamp(Number(flux) || 0, -5, 5);
    const armor = ARMOR_TABLE[normalizedFlux];
    if (armor && !types.includes(armor)) {
      types.push(armor);
    }
  }

  return {
    count,
    types,
    primary: types[0] || "No Armor",
  };
}

export function resolveHits(size = 4) {
  if (size <= 3) return 1;
  if (size === 4) return 3;
  if (size === 5) return 12;
  if (size === 6) return 35;
  return 100;
}

function pickFrom(values = [], rng = Math.random, fallback = "Unknown") {
  if (!Array.isArray(values) || !values.length) {
    return fallback;
  }
  return values[Math.floor(rng() * values.length)] ?? fallback;
}

export function buildCreatureImagePrompt(profile = {}) {
  const name = String(profile?.name || "Generated Beast");
  const terrain = String(profile?.terrain || "frontier wilds").toLowerCase();
  const locomotion = String(profile?.locomotion || "walker").toLowerCase();
  const niche = String(profile?.ecologicalNiche?.niche || "omnivore").toLowerCase();
  const subniche = String(profile?.ecologicalNiche?.subniche || "generalist").toLowerCase();
  const sizeLabel = String(profile?.size?.label || "typical").toLowerCase();
  const measure = String(profile?.size?.measure || "medium-sized silhouette");
  const body = String(profile?.extended?.bodySymmetry || "bilateral frame").toLowerCase();
  const stance = String(profile?.extended?.stance || "alert posture").toLowerCase();
  const covering = String(profile?.extended?.covering || "natural hide").toLowerCase();
  const weapon = String(profile?.combat?.weapon?.weapon || "body").toLowerCase();
  const adaptation = String(profile?.extended?.notableAdaptation || "localized survival trait").toLowerCase();
  const senses = Array.isArray(profile?.extended?.senses)
    ? profile.extended.senses.slice(0, 2).join(", ")
    : "sharp survival senses";
  const worldName = String(profile?.sourceWorld?.name || "an alien frontier world");

  return {
    visualDescription: `${name} appears as a ${sizeLabel} ${niche} beast adapted to ${terrain}, with a ${body}, ${stance}, ${covering}, and a ${weapon}-based threat profile. Its frame suggests ${subniche} behavior, while notable features include ${adaptation} and ${senses}.`,
    imagePrompt: `Detailed sci-fi creature concept art of ${name}, an alien ${niche} from ${worldName}, ${measure}, ${body}, ${stance}, ${covering}, moving as a ${locomotion}, natural weapon emphasis on ${weapon}, adapted for ${terrain}, hints of ${adaptation}, full body visible, naturalistic field-guide illustration, dramatic but realistic lighting, highly detailed.`,
    imageCaption: `${name} — ${sizeLabel} ${niche} specimen from ${worldName}`,
  };
}

export function resolveBodyStructure(
  { locomotion = "Walker", terrain = "Clear", niche = "Omnivore" } = {},
  rng = Math.random,
) {
  const moveType = String(locomotion || "Walker");
  const resolvedTerrain = String(terrain || "Clear");

  if (niche === "Producer") {
    return {
      bodySymmetry: "Radial",
      stance: pickFrom(["anchored fronds", "rooted stalk", "broad nutrient mat"], rng),
      covering: pickFrom(["fibrous hide", "waxy membrane", "porous bark"], rng),
    };
  }

  if (["Swimmer", "Swims", "Aquatic", "Diver"].includes(moveType)) {
    return {
      bodySymmetry: "Streamlined bilateral",
      stance: pickFrom(["serpentine swimmer", "finned body", "low drifting hull"], rng),
      covering: pickFrom(["slick hide", "pressure scales", "filter fronds"], rng),
    };
  }

  if (["Flyer", "Flyphib", "Triphib"].includes(moveType)) {
    return {
      bodySymmetry: "Light bilateral",
      stance: pickFrom(["winged biped", "winged quadruped", "glider frame"], rng),
      covering: pickFrom(["feathered mantle", "membrane wings", "light scales"], rng),
    };
  }

  if (moveType === "Static") {
    return {
      bodySymmetry: "Colonial radial",
      stance: pickFrom(["sessile trap", "anchored colony", "low nutrient bulb"], rng),
      covering: pickFrom(["bark-like plates", "spore film", "rocky sheath"], rng),
    };
  }

  return {
    bodySymmetry: resolvedTerrain.includes("Desert") ? "Heat-shedding bilateral" : "Bilateral",
    stance: pickFrom(["quadruped", "biped", "low crawler", "multi-limbed stalker"], rng),
    covering: pickFrom(
      resolvedTerrain.includes("Frozen")
        ? ["insulating fur", "fat hide", "pale scales"]
        : ["hide", "fur", "chitin", "scales"],
      rng,
    ),
  };
}

export function resolveSenses(
  { terrain = "Clear", locomotion = "Walker", niche = "Omnivore" } = {},
  rng = Math.random,
) {
  const senses = ["motion vision"];
  const moveType = String(locomotion || "Walker");
  const resolvedTerrain = String(terrain || "Clear");

  if (["Swimmer", "Swims", "Aquatic", "Diver"].includes(moveType)) {
    senses.push("pressure-line vibration sense");
  }
  if (["Flyer", "Flyphib", "Triphib"].includes(moveType)) {
    senses.push("long-range horizon sight");
  }
  if (niche === "Scavenger") {
    senses.push("odor tracking");
  }
  if (niche === "Carnivore") {
    senses.push("depth-judging pursuit vision");
  }
  if (niche === "Producer") {
    senses.push("light-gradient sensing");
  }
  if (resolvedTerrain.includes("Wet") || resolvedTerrain.includes("Ocean")) {
    senses.push("humidity and current awareness");
  }
  if (resolvedTerrain.includes("Cavern") || resolvedTerrain.includes("Underground")) {
    senses.push("echo mapping");
  }

  senses.push(pickFrom(["thermal sense", "electrostatic detection", "vocal signaling", "color-flash display"], rng));
  return [...new Set(senses)].slice(0, 4);
}

export function resolveFeedingProfile({ ecologicalNiche = { niche: "Omnivore", subniche: "Hunter/Gatherer" } } = {}) {
  const niche = String(ecologicalNiche?.niche || "Omnivore");
  const subniche = String(ecologicalNiche?.subniche || "Hunter/Gatherer");

  if (niche === "Producer") {
    return { feedingModel: "Autotrophic intake", dietStrategy: `${subniche} nutrient collection` };
  }
  if (niche === "Herbivore") {
    return { feedingModel: "Bulk grazer", dietStrategy: `${subniche} browsing and forage cycles` };
  }
  if (niche === "Carnivore") {
    return { feedingModel: "Active predator", dietStrategy: `${subniche} ambush or pursuit feeding` };
  }
  if (niche === "Scavenger") {
    return { feedingModel: "Opportunistic scavenger", dietStrategy: `${subniche} carrion and remains recovery` };
  }
  return { feedingModel: "Mixed omnivore", dietStrategy: `${subniche} adaptive intake` };
}

export function resolveLifeCycle(
  { size = { size: 4 }, quantity = { label: "Small Group" }, niche = "Omnivore" } = {},
  rng = Math.random,
) {
  const sizeCode = Number(size?.size ?? 4);
  const sizeLabel = String(quantity?.label || "Small Group");

  const reproduction =
    niche === "Producer"
      ? pickFrom(["spore broadcast", "runner budding", "seasonal seeding"], rng)
      : sizeCode <= 3
        ? pickFrom(["egg clutch", "burrow brood", "larval scatter"], rng)
        : sizeCode >= 5
          ? pickFrom(["live birth", "guarded nesting", "paired egg lay"], rng)
          : pickFrom(["egg lay", "live birth", "seasonal brood"], rng);

  const socialBehavior = ["Pack", "Small Herd", "Large Herd", "Small Swarm", "Large Swarm", "Hive"].includes(sizeLabel)
    ? `Group-oriented ${sizeLabel.toLowerCase()} behavior`
    : ["Pair", "Small Group"].includes(sizeLabel)
      ? "Bonded local group behavior"
      : "Primarily solitary territorial behavior";

  const lifeCycle =
    niche === "Producer"
      ? "Slow-growth seasonal maturation"
      : sizeCode <= 2
        ? "Rapid hatchling-to-adult cycle"
        : sizeCode >= 5
          ? "Long juvenile phase with mature dominance displays"
          : "Moderate juvenile development with seasonal breeding";

  return { reproduction, socialBehavior, lifeCycle };
}

export function resolveSpecialTraits(
  { terrain = "Clear", locomotion = "Walker", niche = "Omnivore", armor = { types: [] } } = {},
  rng = Math.random,
) {
  const traits = [];
  const moveType = String(locomotion || "Walker");
  const resolvedTerrain = String(terrain || "Clear");

  if (["Flyer", "Flyphib", "Triphib"].includes(moveType)) traits.push("aerial maneuvering surfaces");
  if (["Swimmer", "Swims", "Aquatic", "Diver"].includes(moveType)) traits.push("water-adapted respiration");
  if (niche === "Carnivore") traits.push("predatory focus");
  if (niche === "Scavenger") traits.push("disease-resistant digestion");
  if (niche === "Producer") traits.push("passive nutrient storage");
  if (resolvedTerrain.includes("Desert")) traits.push("heat-dispersing hide");
  if (resolvedTerrain.includes("Frozen")) traits.push("cold-shielded tissues");
  if (Array.isArray(armor?.types) && armor.types.length) traits.push(`natural ${armor.types[0].toLowerCase()}`);

  traits.push(
    pickFrom(["camouflage bloom", "territorial display organs", "burrow instinct", "alarm call network"], rng),
  );
  return [...new Set(traits)].slice(0, 4);
}

export function resolveEncounterHooks({
  terrain = "Clear",
  ecologicalNiche = { subniche: "Hunter/Gatherer" },
  quantity = { label: "Small Group" },
  extended = {},
} = {}) {
  return [
    `Tracks or signs are most obvious in ${String(terrain || "local")}.`,
    `First contact usually reflects ${String(ecologicalNiche?.subniche || "generalist").toLowerCase()} behavior.`,
    `Most encounters involve ${String(quantity?.label || "small groups").toLowerCase()}.`,
    `Referees can emphasize ${String(extended?.notableAdaptation || "its local adaptation").toLowerCase()} in scene framing.`,
  ];
}

export function buildWorldTerrainPalette(world = {}, fallbackTerrain = null) {
  const baseTerrain = resolveTerrain(
    fallbackTerrain || world?.terrain || world?.nativeTerrain || mapWorldToCreatureTerrain(world),
  );
  const hydrographics = Number(world?.hydrographics ?? NaN);
  const tempCategory = String(world?.tempCategory || "").toLowerCase();
  const palette = [baseTerrain];

  if (["Ocean", "Lake", "River", "Wetland"].includes(baseTerrain) || hydrographics >= 7) {
    palette.push("Wetland", "Shore");
  }
  if (["Desert", "Baked lands"].includes(baseTerrain) || hydrographics <= 2) {
    palette.push("Rough", "Mountain");
  }
  if (["Woods", "Rough Woods"].includes(baseTerrain)) {
    palette.push("Rough Woods", "Clear");
  }
  if (tempCategory.includes("frozen")) {
    palette.push("Frozen Lands", "Ice Field");
  }
  if (!palette.includes("Clear")) {
    palette.push("Clear");
  }

  return [...new Set(palette.map((entry) => resolveTerrain(entry)).filter(Boolean))].slice(0, 3);
}

export function summarizeEcosystemBalance(bundleOrEntries = [], sourceWorld = null) {
  const entries = Array.isArray(bundleOrEntries)
    ? bundleOrEntries
    : Array.isArray(bundleOrEntries?.entries)
      ? bundleOrEntries.entries
      : [];
  const linkedWorld = sourceWorld || bundleOrEntries?.sourceWorld || null;

  const counts = entries.reduce(
    (totals, entry) => {
      const niche = String(entry?.ecologicalNiche?.niche || "Unknown");
      totals[niche] = (totals[niche] || 0) + 1;
      return totals;
    },
    { Producer: 0, Herbivore: 0, Omnivore: 0, Carnivore: 0, Scavenger: 0 },
  );

  const predatorPressure = counts.Carnivore + counts.Scavenger;
  const hazardScore = entries.reduce((score, entry) => {
    let next = score;
    if (entry?.ecologicalNiche?.niche === "Carnivore") next += 2;
    if (entry?.ecologicalNiche?.niche === "Scavenger") next += 1;
    if (["Killer", "Pouncer", "Siren"].includes(entry?.ecologicalNiche?.subniche)) next += 1;
    if (Number(entry?.size?.size ?? 0) >= 5) next += 1;
    return next;
  }, 0);

  let stability = "Balanced biosphere";
  if (counts.Producer === 0 || counts.Herbivore === 0) {
    stability = "Fragile biosphere";
  } else if (predatorPressure > counts.Herbivore + counts.Omnivore) {
    stability = "Predator-heavy biosphere";
  } else if (linkedWorld?.nativeSophontLife) {
    stability = "Sophont-influenced biosphere";
  }

  const hazardLevel = hazardScore >= 8 ? "High" : hazardScore >= 5 ? "Moderate" : "Low";

  return {
    counts,
    predatorPressure,
    hazardLevel,
    stability,
    notes: [
      `${stability} with ${hazardLevel.toLowerCase()} encounter hazard pressure.`,
      `${counts.Producer} producer, ${counts.Herbivore} herbivore, ${counts.Omnivore} omnivore, ${counts.Carnivore} carnivore, ${counts.Scavenger} scavenger roles are represented.`,
    ],
  };
}

export function buildFaunaWorldUpdate(bundle = {}, existingWorld = {}) {
  const balance = bundle?.balance || summarizeEcosystemBalance(bundle, bundle?.sourceWorld || existingWorld);
  const focus = bundle?.focus || (Array.isArray(bundle?.entries) ? bundle.entries[0] : null);
  const summary = `${balance.stability} with ${balance.hazardLevel.toLowerCase()} hazard centered on ${focus?.name || "local fauna"}.`;
  const remarks = [
    ...(Array.isArray(existingWorld?.remarks) ? existingWorld.remarks : []),
    `Ecology bundle: ${summary}`,
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .filter((entry, index, values) => values.indexOf(entry) === index)
    .slice(-8);

  return {
    linkedFaunaSummary: {
      worldName: String(bundle?.worldName || existingWorld?.name || "Linked World"),
      stability: String(balance.stability || "Balanced biosphere"),
      hazardLevel: String(balance.hazardLevel || "Low"),
      terrains: Array.isArray(bundle?.terrains) ? [...bundle.terrains] : [],
      focusName: String(focus?.name || "Local fauna"),
      roleCount: Array.isArray(bundle?.entries) ? bundle.entries.length : 0,
      summary,
      updatedAt: String(bundle?.updatedAt || new Date().toISOString()),
    },
    remarks,
  };
}

export function generateBeastProfile(options = {}) {
  const {
    seed = "beast-seed",
    terrain = "Clear",
    worldSize = "8",
    primaryNiche = null,
    locomotionRoll,
    nicheFlux,
    quantityFlux,
    sizeFlux,
    speedRoll,
    strengthRoll,
    weaponFlux,
    armorCountFlux,
    armorFluxes,
    name = "Generated Beast",
    sourceWorld = null,
  } = options;

  const rng = createSeededRng(seed);
  const resolvedTerrain = resolveTerrain(terrain);
  const gravityMod = resolveGravityMod(worldSize);
  const locomotion = resolveLocomotion(resolvedTerrain, locomotionRoll ?? rollDie(rng, 6));
  const ecologicalNiche = resolveEcologicalNiche(nicheFlux ?? rollFlux(rng), primaryNiche);
  const quantity = resolveQuantity(quantityFlux ?? rollFlux(rng), rng);
  const size = resolveSize(sizeFlux ?? rollFlux(rng), gravityMod);
  const strength = resolveStrength({ size: size.size, worldSize, roll: strengthRoll ?? rollDie(rng, 6) });
  const speed = resolveSpeed({ roll: speedRoll ?? rollDie(rng, 6), locomotion, niche: ecologicalNiche.niche });
  const reactions = resolveReaction(ecologicalNiche.subniche, rng);
  const weapon = resolveWeapon(weaponFlux ?? rollFlux(rng), ecologicalNiche.niche);
  const armor = resolveArmor(armorCountFlux ?? rollHighFlux(rng), armorFluxes, rng);
  const bodyProfile = resolveBodyStructure({ locomotion, terrain: resolvedTerrain, niche: ecologicalNiche.niche }, rng);
  const senses = resolveSenses({ terrain: resolvedTerrain, locomotion, niche: ecologicalNiche.niche }, rng);
  const feedingProfile = resolveFeedingProfile({ ecologicalNiche });
  const lifeCycleProfile = resolveLifeCycle({ size, quantity, niche: ecologicalNiche.niche }, rng);
  const specialTraits = resolveSpecialTraits(
    { terrain: resolvedTerrain, locomotion, niche: ecologicalNiche.niche, armor },
    rng,
  );
  const extended = {
    ...bodyProfile,
    senses,
    ...feedingProfile,
    ...lifeCycleProfile,
    specialTraits,
    notableAdaptation: specialTraits[0] || "generalist survival traits",
  };
  extended.encounterHooks = resolveEncounterHooks({
    terrain: resolvedTerrain,
    ecologicalNiche,
    quantity,
    extended,
  });

  const profile = {
    name,
    seed,
    worldSize: normalizeWorldSize(worldSize),
    gravityMod,
    terrain: resolvedTerrain,
    locomotion,
    ecologicalNiche,
    quantity,
    size,
    speed,
    combat: {
      hits: resolveHits(size.size),
      strength,
      weapon,
      armor,
    },
    reactions,
    extended,
    sourceWorld,
    metadata: {
      ruleset: "BeastMaker Simple",
      version: 1,
    },
  };

  return {
    ...profile,
    ...buildCreatureImagePrompt(profile),
  };
}

export function generateEncounterTable(options = {}) {
  const { seed = "encounter-table", terrain = "Clear", worldSize = "8", sourceWorld = null } = options;

  const entries = ["Producer", "Herbivore", "Omnivore", "Carnivore", "Scavenger", null].map((primaryNiche, index) =>
    generateBeastProfile({
      seed: `${seed}-${index + 1}`,
      terrain,
      worldSize,
      primaryNiche,
      name: `Encounter ${index + 1}`,
      sourceWorld,
    }),
  );

  return entries;
}

export function generateWorldFaunaBundle(options = {}) {
  const {
    world = {},
    seed = "world-fauna",
    terrain = null,
    worldSize = null,
    sourceWorld = null,
    worldKey = "",
    systemId = "",
  } = options;

  const linkedWorld =
    world && Object.keys(world).length
      ? buildWorldLinkedCreatureOptions(world)
      : {
          sourceWorld: sourceWorld || null,
          worldSize: worldSize || "8",
          terrain: resolveTerrain(terrain || "Clear"),
        };

  const terrainPalette = buildWorldTerrainPalette(world, terrain || linkedWorld.terrain);
  const includeSophontPressure = Boolean(world?.nativeSophontLife ?? linkedWorld?.sourceWorld?.nativeSophontLife);
  const roles = [
    { slot: "Local Producers", primaryNiche: "Producer", terrain: terrainPalette[0] || linkedWorld.terrain },
    { slot: "Grazer Bands", primaryNiche: "Herbivore", terrain: terrainPalette[0] || linkedWorld.terrain },
    {
      slot: "Opportunists",
      primaryNiche: "Omnivore",
      terrain: terrainPalette[1] || terrainPalette[0] || linkedWorld.terrain,
    },
    {
      slot: "Predator Pack",
      primaryNiche: "Carnivore",
      terrain: terrainPalette[1] || terrainPalette[0] || linkedWorld.terrain,
    },
    {
      slot: "Scavenger Pressure",
      primaryNiche: "Scavenger",
      terrain: terrainPalette[2] || terrainPalette[0] || linkedWorld.terrain,
    },
    {
      slot: includeSophontPressure ? "Native Sophont Pressure" : "Hazard Encounter",
      primaryNiche: includeSophontPressure ? "Omnivore" : "Carnivore",
      terrain: terrainPalette[2] || terrainPalette[0] || linkedWorld.terrain,
    },
  ];

  const entries = roles.map((role, index) => ({
    ...generateBeastProfile({
      seed: `${seed}-${index + 1}`,
      terrain: role.terrain,
      worldSize: linkedWorld.worldSize,
      primaryNiche: role.primaryNiche,
      name: `${role.slot} ${index + 1}`,
      sourceWorld: linkedWorld.sourceWorld,
    }),
    role: role.slot,
  }));

  const balance = summarizeEcosystemBalance(entries, linkedWorld.sourceWorld);

  return {
    id: `fauna-${String(seed).replace(/\s+/g, "-")}`,
    seed,
    systemId: String(systemId || "").trim(),
    worldKey: String(worldKey || "").trim(),
    worldName: String(linkedWorld.sourceWorld?.name || world?.name || "Linked World"),
    sourceWorld: linkedWorld.sourceWorld,
    terrains: terrainPalette,
    entries,
    focus: entries.find((entry) => entry.ecologicalNiche?.niche === "Carnivore") || entries[0],
    balance,
    notes: balance.notes,
  };
}

export function mapWorldToCreatureTerrain(world = {}) {
  const explicitTerrain = resolveTerrain(world?.terrain || world?.nativeTerrain || "");
  if (explicitTerrain !== "Clear" || String(world?.terrain || world?.nativeTerrain || "").trim()) {
    return explicitTerrain;
  }

  const hydrographics = Number(world?.hydrographics ?? 0);
  const avgTempC = Number(world?.avgTempC ?? 20);
  const tempCategory = String(world?.tempCategory || "").toLowerCase();
  const surfaceText = [world?.dominantSurface, world?.hydrosphereDescription, world?.surfaceDistributionSummary]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (surfaceText.includes("ocean") || hydrographics >= 9) return "Ocean";
  if (surfaceText.includes("wet") || surfaceText.includes("swamp") || hydrographics >= 7) return "Wetland";
  if (surfaceText.includes("forest") || surfaceText.includes("wood")) return "Woods";
  if (surfaceText.includes("mountain") || surfaceText.includes("rock")) return "Mountain";
  if (tempCategory.includes("frozen") || avgTempC <= -5) return "Frozen Lands";
  if (tempCategory.includes("hot") || avgTempC >= 35 || hydrographics <= 2) return "Desert";
  return hydrographics >= 4 ? "Rough Woods" : "Clear";
}

export function buildWorldLinkedCreatureOptions(world = {}) {
  return {
    sourceWorld: {
      name: String(world?.name || world?.designation || "Linked World"),
      uwp: String(world?.uwp || ""),
      nativeSophontLife: Boolean(world?.nativeSophontLife),
    },
    worldSize: world?.size ?? world?.sizeCode ?? "8",
    terrain: mapWorldToCreatureTerrain(world),
  };
}
