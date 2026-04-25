function hashSeed(seed = "taxonomy") {
  const text = String(seed || "taxonomy");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

function createSeededRng(seed = "taxonomy") {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(values = [], rng = Math.random, fallback = "") {
  return Array.isArray(values) && values.length ? values[Math.floor(rng() * values.length)] : fallback;
}

function normalizeLetters(value = "", fallback = "nova") {
  const cleaned = String(value || "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z ]+/g, " ")
    .trim()
    .toLowerCase();
  return cleaned || fallback;
}

function toLatinStem(value = "", fallback = "nova") {
  const cleaned = normalizeLetters(value, fallback).replace(/\s+/g, "");
  return (cleaned.slice(0, 8) || fallback).replace(/[^a-z]/g, "") || fallback;
}

function capitalize(word = "") {
  const text = String(word || "").trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function buildGenus(name = "", rng = Math.random) {
  const base = toLatinStem(name, pick(["nova", "xeno", "thal", "vela"], rng, "nova"));
  const suffix = pick(["a", "us", "is", "on", "or", "ea"], rng, "us");
  return capitalize(`${base}${suffix}`.slice(0, 12));
}

function buildSpeciesEpithet({ niche = "", environment = "", climate = "", category = "" } = {}, rng = Math.random) {
  const hint = toLatinStem(niche || environment || climate || category || "prime", "prime");
  const endings = ["ensis", "iformis", "aris", "alis", "oides", "ata"];
  return `${hint.slice(0, 8)}${pick(endings, rng, "ensis")}`.toLowerCase();
}

function resolveKingdom(category = "fauna") {
  switch (String(category || "fauna").toLowerCase()) {
    case "flora":
      return "Plantae Analog";
    case "sophont":
      return "Animalia Analog";
    default:
      return "Animalia Analog";
  }
}

function resolvePhylumDivision({ category = "fauna", bodyPlan = "", growthForm = "" } = {}, rng = Math.random) {
  const normalizedCategory = String(category || "fauna").toLowerCase();
  const normalizedBody = String(bodyPlan || "").toLowerCase();
  const normalizedGrowth = String(growthForm || "").toLowerCase();

  if (normalizedCategory === "flora") {
    if (normalizedGrowth.includes("moss") || normalizedGrowth.includes("fern")) return "Bryophyta Analog";
    if (normalizedGrowth.includes("reed") || normalizedGrowth.includes("tree")) return "Tracheophyta Analog";
    return pick(["Floraspora", "Xylophyta", "Tracheophyta Analog"], rng, "Tracheophyta Analog");
  }

  if (normalizedBody.includes("insect")) return "Arthropoda Analog";
  if (normalizedBody.includes("radial") || normalizedBody.includes("aquatic")) return "Cnidaria Analog";
  if (normalizedBody.includes("segmented")) return "Segmentata Analog";
  return pick(["Chordata Analog", "Mollusca Analog", "Chordata Analog"], rng, "Chordata Analog");
}

function resolveClassRank(
  { category = "fauna", bodyPlan = "", growthForm = "", environment = "" } = {},
  rng = Math.random,
) {
  const normalizedCategory = String(category || "fauna").toLowerCase();
  const normalizedBody = String(bodyPlan || "").toLowerCase();
  const normalizedGrowth = String(growthForm || "").toLowerCase();
  const normalizedEnvironment = String(environment || "").toLowerCase();

  if (normalizedCategory === "flora") {
    if (normalizedGrowth.includes("tree")) return "Arboriformes";
    if (normalizedGrowth.includes("vine")) return "Lianopsida";
    if (normalizedGrowth.includes("moss")) return "Muscopsida";
    return pick(["Floropsida", "Canoptera", "Rhizomata"], rng, "Floropsida");
  }

  if (normalizedBody.includes("avian")) return "Avesformes";
  if (normalizedBody.includes("aquatic") || normalizedEnvironment.includes("aquatic")) return "Pelagomorpha";
  if (normalizedBody.includes("insect")) return "Hexapoda Analog";
  if (normalizedBody.includes("radial")) return "Radiata";
  return pick(["Theriomorpha", "Sapiomorpha", "Chordamorphi"], rng, "Theriomorpha");
}

function resolveOrderRank({ category = "fauna", niche = "", climate = "", environment = "" } = {}, rng = Math.random) {
  const normalizedCategory = String(category || "fauna").toLowerCase();
  const normalizedNiche = String(niche || "").toLowerCase();
  const normalizedClimate = String(climate || environment || "").toLowerCase();

  if (normalizedCategory === "flora") {
    if (normalizedClimate.includes("arid")) return "Xerophyllales";
    if (normalizedClimate.includes("wet") || normalizedClimate.includes("coastal")) return "Hydrobotanales";
    if (normalizedClimate.includes("tundra") || normalizedClimate.includes("alpine")) return "Cryoflorales";
    return pick(["Floranales", "Canopyales", "Rhizomales"], rng, "Floranales");
  }

  if (normalizedNiche.includes("carnivore")) return "Predatoria";
  if (normalizedNiche.includes("herbivore")) return "Grazoria";
  if (normalizedNiche.includes("producer")) return "Autotrophica";
  if (normalizedNiche.includes("scavenger")) return "Detritivora";
  return pick(["Omnivora", "Foragera", "Cursoriales"], rng, "Omnivora");
}

export function buildLifeTaxonomy({
  seed = "",
  name = "Generated Lifeform",
  category = "fauna",
  bodyPlan = "",
  growthForm = "",
  niche = "",
  climate = "",
  environment = "",
} = {}) {
  const rng = createSeededRng(
    `${seed}:${category}:${name}:${bodyPlan}:${growthForm}:${niche}:${climate}:${environment}`,
  );
  const genus = buildGenus(name, rng);
  const species = buildSpeciesEpithet({ niche, environment, climate, category }, rng);
  const familySuffix = String(category || "fauna").toLowerCase() === "flora" ? "aceae" : "idae";

  return {
    Domain: pick(["Biota", "Eukaryota Analog", "Xenobiota"], rng, "Biota"),
    Kingdom: resolveKingdom(category),
    "Phylum / Division": resolvePhylumDivision({ category, bodyPlan, growthForm }, rng),
    Class: resolveClassRank({ category, bodyPlan, growthForm, environment }, rng),
    Order: resolveOrderRank({ category, niche, climate, environment }, rng),
    Family: `${genus.toLowerCase()}${familySuffix}`,
    Genus: genus,
    Species: species,
    "Scientific Name": `${genus} ${species}`,
  };
}

export function buildLineageProfile({
  seed = "",
  category = "fauna",
  sourceWorld = null,
  bodyPlan = "",
  environment = "",
} = {}) {
  const rng = createSeededRng(`${seed}:${category}:${bodyPlan}:${environment}:${sourceWorld?.name || ""}`);
  const normalizedCategory = String(category || "fauna").toLowerCase();
  let originPool;

  if (normalizedCategory === "sophont") {
    originPool = sourceWorld?.nativeSophontLife
      ? ["Independent evolution", "Convergent humanoid evolution", "Ancient-seeded diaspora"]
      : ["Ancient-seeded diaspora", "Transplanted offshoot lineage", "Convergent humanoid evolution"];
  } else if (normalizedCategory === "flora") {
    originPool = sourceWorld?.nativeLifeform
      ? ["Native botanical evolution", "Ancient-seeded biosphere", "Transplanted colonial stock"]
      : ["Transplanted colonial stock", "Ancient-seeded biosphere", "Bioengineered cultivar"];
  } else {
    originPool = sourceWorld?.nativeLifeform
      ? ["Native faunal evolution", "Ancient-seeded biosphere", "Engineered descendant strain"]
      : ["Transplanted faunal stock", "Ancient-seeded biosphere", "Engineered descendant strain"];
  }

  const originModel = pick(originPool, rng, originPool[0]);
  const humanAnalogueStatus =
    normalizedCategory === "sophont"
      ? originModel === "Ancient-seeded diaspora"
        ? "Human-like traits may reflect ancient seeding or migration, but this remains a distinct species."
        : "Any human-like appearance is convergent or analogous rather than true Terran humanity."
      : "Terran similarity, if present, is treated as analogous rather than identical.";

  return {
    originModel,
    humanAnalogueStatus,
    uniquenessStatement:
      originModel === "Ancient-seeded diaspora"
        ? "Shared ancestry is only plausible through deliberate seeding or transplant; identical human species are not assumed."
        : "This lineage is biologically unique to its world or clade even when it resembles Terran life.",
    evidence: sourceWorld?.name ? `Linked world context: ${sourceWorld.name}` : "No linked homeworld evidence",
  };
}
