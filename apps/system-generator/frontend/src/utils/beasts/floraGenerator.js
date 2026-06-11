import {
  buildWorldLinkedCreatureOptions,
  createSeededRng,
  generateGuidSeed,
  getWorldAvailableCreatureTerrains,
} from "./beastGenerator.js";
import { buildLifeTaxonomy, buildLineageProfile } from "./taxonomy.js";

export const FLORA_GROWTH_FORMS = [
  "Canopy Tree",
  "Spore Fern",
  "Creeping Vine",
  "Bulb Grove",
  "Succulent Tower",
  "Floating Frond",
  "Crystal Moss",
  "Reed Colony",
];

export const FLORA_CLIMATES = [
  "Temperate",
  "Arid",
  "Wetland",
  "Tropical",
  "Alpine",
  "Tundra",
  "Subterranean",
  "Coastal",
];

const ICONS = ["🌿", "🌱", "🌳", "🍃", "🪴", "🌾", "🍄", "🌴"];
export const FLORA_ROOT_NETWORK_ARCHITECTURE = [
  "radial sinker",
  "lateral fan",
  "heart-shaped plexus",
  "multi-tier terrace",
  "spiral tendril",
  "reticulated mesh",
  "crisscross ladder",
  "clustered bulbs",
];

export const FLORA_LEAF_ARRANGEMENTS = [
  "alternate",
  "opposite",
  "whorled",
  "basal rosette",
  "spiralled",
  "pinnate",
  "palmate",
  "fascicled",
];

export const FLORA_POLLINATION_SYNDROMES = [
  "entomophilous (insect)",
  "anemophilous (wind)",
  "ornithophilous (bird)",
  "chiropterophilous (bat)",
  "hydrophilous (water)",
  "self-compatible",
  "ambophilous (mixed)",
];

export const FLORA_REPRODUCTIVE_STRATEGIES = [
  "sexual",
  "apomictic",
  "vegetative cloning",
  "spore-based",
  "bulbil-producing",
  "rhizomatous spread",
];

export const FLORA_BRANCHING_PATTERNS = ["dichotomous", "monopodial", "sympodial", "interrupted", "opposite decussate"];

export const FLORA_HABITUS = ["tree", "shrub", "herb", "liana", "epiphyte", "hemiepiphyte", "geophyte", "parasite"];

export const FLORA_RESOURCE_VALUES = [
  "nectar-rich",
  "pollen-rich",
  "edible fruit",
  "medicinal sap",
  "fibrous bark",
  "resinous",
];

export const FLORA_OCCURRENCE_NOTES = [
  "rarely observed",
  "locally common",
  "widespread",
  "endemic",
  "invasive tendencies",
];

export const FLORA_LIFESPAN_CLASSES = ["annual", "biennial", "perennial", "long-lived perennial"];

export const FLORA_GROWTH_RATE = ["slow", "moderate", "vigorous", "explosive"];

export const FLORA_BIOME_ASSOCIATIONS = [
  "temperate forest",
  "tropical rainforest",
  "savanna",
  "chaparral",
  "mangrove",
  "alpine meadow",
];

export const FLORA_ROOT_DEPTH = [
  "surface mat",
  "shallow (0-30cm)",
  "moderate (30-90cm)",
  "deep (90cm+)",
  "taproot dominant",
];

export const FLORA_LEAF_MORPHOLOGIES = [
  "needle-like",
  "blade (simple)",
  "compound (pinnate)",
  "compound (palmate)",
  "scale-like",
  "succulent",
  "filiform",
];

export const FLORA_BARK_CHARACTER = ["smooth", "furrowed", "peeling", "lenticelled", "rhomboid", "corky"];

export const FLORA_FRUIT_TYPES = ["drupe", "berry", "pome", "capsule", "achene", "nut", "aggregate"];

export const FLORA_SEED_DISPERSAL = ["endozoochory", "epizoochory", "anemochory", "hydrochory", "ballistic"];

export const FLORA_LEAF_SURFACE = ["glabrous", "pubescent", "tomentose", "glaucous", "rugose", "lustrous"];

export const FLORA_FLOWER_SYMMETRY = ["actinomorphic", "zygomorphic", "asymmetric"];

export const FLORA_INFLORESCENCE_FORMS = ["raceme", "panicle", "umbel", "head/capitulum", "spike", "cyme"];

export const FLORA_SEASONALITY = ["evergreen", "deciduous", "semi-deciduous", "seasonally dormant"];

export const FLORA_SOIL_PREFERENCES = ["sandy", "loamy", "clay", "peaty", "alkaline", "acidic"];

export const FLORA_LIGHT_PREFERENCES = ["full sun", "partial shade", "deep shade", "dappled light"];

export const FLORA_MOISTURE_PREFERENCES = ["xeric", "mesic", "hydric", "seasonally inundated"];

export const FLORA_WOOF = ["scented", "odorless", "foul-smelling", "fragrant"];

export const FLORA_BLOOM_DURATION = ["ephemeral (days)", "short (weeks)", "extended (months)", "continuous"];

export const FLORA_TASTE_NOTES = ["bitter", "sweet", "astringent", "acrid", "savory", "mild"];

export const FLORA_DEFENSES = [
  "thorns",
  "spines",
  "chemical (toxic sap)",
  "mucilaginous",
  "sticky glandular trichomes",
];

export const FLORA_GROWTH_HABITS = ["clumping", "rhizomatous", "stoloniferous", "single-stemmed", "multi-stemmed"];

export const FLORA_LIGNIFICATION = ["non-woody", "semi-woody", "woody", "hard-wooded"];

export const FLORA_CANOPY_POROSITY = ["dense", "open", "intermediate", "layered"];

/* ---------------------------
   Color system (global lists)
   You already provided the core hue/effect dictionaries — they are included here
   and reused by part-specific lists below.
   --------------------------- */

export const COLOUR_HUE_MEANINGS = [
  { prefix: "pale", meaning: "light, washed out" },
  { prefix: "light", meaning: "bright, high value" },
  { prefix: "soft", meaning: "muted, low saturation" },
  { prefix: "bright", meaning: "vivid, saturated" },
  { prefix: "deep", meaning: "dark, intense" },
  { prefix: "rich", meaning: "saturated, luxurious" },
  { prefix: "muted", meaning: "greyed, subdued" },
  { prefix: "dusty", meaning: "grey-toned, powdery" },
  { prefix: "pastel", meaning: "soft and light" },
  { prefix: "vivid", meaning: "extremely saturated" },
  { prefix: "neon", meaning: "fluorescent, electric" },
  { prefix: "electric", meaning: "intensely bright" },
  { prefix: "hot", meaning: "warm and intense" },
  { prefix: "cool", meaning: "blue-toned" },
  { prefix: "warm", meaning: "red/yellow-toned" },
  { prefix: "dark", meaning: "low value, shadowy" },
  { prefix: "shadowy", meaning: "very dark, near-black" },
  { prefix: "milky", meaning: "white-toned, opaque" },
  { prefix: "creamy", meaning: "warm-white toned" },
  { prefix: "smoky", meaning: "grey-toned, hazy" },
  { prefix: "bleached", meaning: "extremely light, whitened" },
  { prefix: "washed", meaning: "faded, desaturated" },
  { prefix: "dirty", meaning: "grey-brown toned, muddy" },
  { prefix: "clear", meaning: "pure, transparent-bright" },
  { prefix: "sheer", meaning: "translucent, delicate" },
];

export const COLOUR_HUE_SUFFIX_EXAMPLES = {
  red: ["coral", "rose", "ruby"],
  orange: ["tangerine", "apricot"],
  yellow: ["lemon", "gold", "butter"],
  green: ["lime", "emerald", "moss"],
  blue: ["sky", "cobalt", "navy"],
  purple: ["violet", "plum", "amethyst"],
  pink: ["rose", "blush", "magenta"],
  brown: ["tan", "taupe", "chocolate"],
  grey: ["slate", "ash", "dove"],
  white: ["cream", "ivory", "snow"],
  black: ["jet", "ink", "charcoal"],
  cyan: ["teal", "aqua", "turquoise"],
  magenta: ["fuchsia", "hot pink"],
  lavender: ["lilac", "wisteria"],
  coral: ["salmon", "melon"],
  mint: ["seafoam", "sage"],
  peach: ["nectarine", "apricot"],
  plum: ["damson", "aubergine"],
  slate: ["steel", "blue-grey"],
  olive: ["khaki", "chartreuse"],
  burgundy: ["wine", "maroon"],
  gold: ["honey", "amber"],
  silver: ["pewter", "platinum"],
  copper: ["rust", "terracotta"],
  bronze: ["patina", "verdigris"],
};

export const COLOUR_HUE_SUFFIX_MEANINGS = {
  red: "base color is red",
  orange: "base color is orange",
  yellow: "base color is yellow",
  green: "base color is green",
  blue: "base color is blue",
  purple: "base color is purple",
  pink: "base color is pink",
  brown: "base color is brown",
  grey: "base color is grey",
  white: "base color is white",
  black: "base color is black",
  cyan: "base color is cyan",
  magenta: "base color is magenta",
  lavender: "base color is lavender",
  coral: "base color is coral",
  mint: "base color is mint",
  peach: "base color is peach",
  plum: "base color is plum",
  slate: "base color is slate",
  olive: "base color is olive",
  burgundy: "base color is burgundy",
  gold: "base color is gold",
  silver: "base color is silver",
  copper: "base color is copper",
  bronze: "base color is bronze",
};

export const COLOUR_EFFECT_PREFIX_MEANINGS = {
  translucent: "semi-transparent, light passes through",
  frosted: "cloudy, hazy, diffused",
  velvet: "soft, matte, plush",
  gloss: "shiny, reflective",
  matte: "flat, non-reflective",
  satin: "soft sheen, between matte and gloss",
  metallic: "shiny like metal",
  shimmering: "sparkling, glittering",
  glittering: "sparkling with tiny flashes",
  glowing: "emitting light, luminous",
  luminous: "light-emitting, radiant",
  pearlescent: "iridescent like pearl",
  opalescent: "shifting colors like opal",
  iridescent: "rainbow-shifting",
  burnished: "polished, rubbed smooth",
  dulled: "intentionally subdued",
  dusty: "powdery surface",
  waxy: "smooth, slightly greasy sheen",
  glossy: "high-shine, mirror-like",
  silken: "smooth, fine, soft",
  crystalline: "clear, faceted, glass-like",
  watery: "fluid, translucent, thin",
  milky: "opaque white, soft",
  smoky: "hazy, darkly translucent",
  sheer: "very thin, barely-there color",
};

export const COLOUR_EFFECT_SUFFIX_MEANINGS = {
  finish: "general surface appearance",
  gloss: "shiny reflective quality",
  glow: "light-emitting quality",
  sheen: "soft reflective quality",
  shimmer: "subtle sparkle",
  sparkle: "tiny bright reflections",
  luster: "soft, rich shine",
  patina: "aged, developed surface",
  bloom: "powdery or waxy coating",
  veil: "thin, transparent overlay",
  haze: "diffused, unclear surface",
  glaze: "glassy, smooth coating",
  polish: "smooth, rubbed shine",
  texture: "surface feel, not smooth",
  coat: "even, applied layer",
  layer: "stacked, multi-depth",
  wash: "thin, dilute application",
  stain: "absorbed color effect",
  tint: "very subtle color effect",
  tone: "overall color cast",
  cast: "reflected color shift",
  flash: "brief bright reflection",
  gleam: "narrow, bright shine",
  opalescence: "color-shifting effect",
  fluorescence: "light-activated glow",
};

/* ---------------------------
   Per-plant-part color lists
   Tailored Hue / Accent / Effect tables for each plant part
   --------------------------- */

export const PLANT_PARTS = ["leaf", "flower", "bark_stem", "fruit", "root"];

/* Hue suffixes by part — realistic palettes for each plant part */
export const COLOUR_HUE_SUFFIXES_BY_PART = {
  leaf: [
    "moss",
    "sage",
    "olive",
    "chartreuse",
    "emerald",
    "juniper",
    "seafoam",
    "mint",
    "teal",
    "forest",
    "pea",
    "khaki",
    "celadon",
    "glaucous",
    "apple",
    "laurel",
    "viridian",
    "bottle",
    "pistachio",
    "asparagus",
    "sea-green",
    "bay",
    "fern",
  ],
  flower: [
    "rose",
    "magenta",
    "fuchsia",
    "coral",
    "peach",
    "apricot",
    "lemon",
    "gold",
    "amber",
    "plum",
    "lavender",
    "lilac",
    "periwinkle",
    "cerise",
    "scarlet",
    "crimson",
    "ruby",
    "azure",
    "sky",
    "cobalt",
    "indigo",
    "ivory",
    "blush",
    "cream",
  ],
  bark_stem: [
    "cinnamon",
    "rust",
    "mahogany",
    "charcoal",
    "taupe",
    "tan",
    "umber",
    "ochre",
    "sienna",
    "bistre",
    "walnut",
    "cedar",
    "bark-brown",
    "smoke",
    "graphite",
  ],
  fruit: [
    "cranberry",
    "raspberry",
    "cherry",
    "apricot",
    "peach",
    "amber",
    "tangerine",
    "lemon",
    "lime",
    "plum",
    "blackberry",
    "blueberry",
    "fig",
    "olive",
    "golden",
  ],
  root: ["tan", "buff", "beige", "ochre", "clay", "russet", "umber", "raw-sienna", "earth", "peat"],
};

/* Accent lists by part: colors (prefixes) and marking-types (suffixes) */

export const COLOUR_ACCENT_PREFIXES_BY_PART = {
  leaf: [
    "silver",
    "cream",
    "chartreuse",
    "red",
    "bronze",
    "gold",
    "white",
    "purple",
    "black",
    "blue",
    "rose",
    "pearl",
    "olive",
  ],
  flower: [
    "white",
    "cream",
    "yellow",
    "red",
    "rose",
    "purple",
    "blue",
    "gold",
    "black",
    "orange",
    "silver",
    "bronze",
    "pearl",
    "copper",
  ],
  bark_stem: ["white", "silver", "black", "rust", "cream", "gold", "green", "red"],
  fruit: ["white", "cream", "red", "gold", "purple", "blue", "silver", "bronze", "russet"],
  root: ["white", "cream", "rust", "brown", "black", "pearl", "ochre"],
};

export const COLOUR_ACCENT_SUFFIXES_BY_PART = {
  leaf: [
    "veined",
    "margined",
    "flecked",
    "blotched",
    "tipped",
    "edged",
    "streaked",
    "banded",
    "mottled",
    "splashed",
    "variegated",
    "stipled",
    "reticulated",
    "penciled",
    "quilled",
    "bronzed",
    "blushed",
    "washed",
    "spotched",
    "diffused",
    "suffused",
  ],
  flower: [
    "throated",
    "blushed",
    "tipped",
    "edged",
    "picotee",
    "rayed",
    "spotted",
    "striped",
    "flushed",
    "veined",
    "barred",
    "blotched",
    "nectar-marked",
    "banded",
    "haloed",
    "frosted",
    "glazed",
    "stippled",
    "sprayed",
    "painted",
    "masked",
  ],
  bark_stem: [
    "lenticelled",
    "fissured",
    "peeling",
    "striated",
    "flaked",
    "patched",
    "marbled",
    "speckled",
    "crazed",
    "blotched",
    "ridged",
    "pitted",
    "scarred",
    "streaked",
    "powdered",
  ],
  fruit: [
    "blushed",
    "russeted",
    "bloomed",
    "speckled",
    "streaked",
    "striped",
    "tipped",
    "dusted",
    "glazed",
    "polished",
    "veined",
    "marbled",
    "spotched",
    "banded",
    "bruised",
    "sun-scalded",
    "waxed",
  ],
  root: [
    "ringed",
    "knobbled",
    "scarred",
    "hairy",
    "furrowed",
    "flaked",
    "pearly",
    "coarse",
    "pitted",
    "corky",
    "mealy",
    "lenticled",
  ],
};

/* Effect prefixes/suffixes by part (surface descriptors tailored) */

export const COLOUR_EFFECT_PREFIXES_BY_PART = {
  leaf: [
    "translucent",
    "frosted",
    "velvet",
    "wax",
    "silken",
    "glossy",
    "matte",
    "satin",
    "pruinose",
    "glaucous",
    "crystalline",
    "watery",
    "milky",
    "smoky",
  ],
  flower: [
    "translucent",
    "frosted",
    "velvet",
    "pearlescent",
    "opalescent",
    "iridescent",
    "silken",
    "glossy",
    "satin",
    "shimmering",
    "glowing",
    "luminous",
    "crystalline",
    "watery",
  ],
  bark_stem: ["matte", "dulled", "burnished", "rough", "corky", "powdery", "waxed", "weathered", "polished"],
  fruit: ["glossy", "frosted", "waxed", "polished", "velvet", "pruinose", "translucent", "milky", "shimmering"],
  root: ["earthy", "mealy", "corky", "powdery", "dull", "waxy", "rough", "polished"],
};

export const COLOUR_EFFECT_SUFFIXES_BY_PART = {
  leaf: ["finish", "sheen", "sheen", "sheen", "sheen", "sheen", "sheen"],
  flower: ["finish", "glow", "sheen", "bloom", "veil", "opalescence"],
  bark_stem: ["finish", "coat", "patina", "texture"],
  fruit: ["gloss", "bloom", "sheen", "glaze", "polish"],
  root: ["coat", "texture", "finish"],
};

/* Aggregate color system per part for easy export/use */

export const COLOUR_SYSTEM_BY_PART = Object.freeze({
  parts: PLANT_PARTS,
  huePrefixes: COLOUR_HUE_MEANINGS,
  hueSuffixExamples: COLOUR_HUE_SUFFIX_EXAMPLES,
  hueSuffixMeanings: COLOUR_HUE_SUFFIX_MEANINGS,
  effectPrefixMeanings: COLOUR_EFFECT_PREFIX_MEANINGS,
  effectSuffixMeanings: COLOUR_EFFECT_SUFFIX_MEANINGS,
  hueSuffixesByPart: COLOUR_HUE_SUFFIXES_BY_PART,
  accentPrefixesByPart: COLOUR_ACCENT_PREFIXES_BY_PART,
  accentSuffixesByPart: COLOUR_ACCENT_SUFFIXES_BY_PART,
  effectPrefixesByPart: COLOUR_EFFECT_PREFIXES_BY_PART,
  effectSuffixesByPart: COLOUR_EFFECT_SUFFIXES_BY_PART,
});

/* ---------------------------
   Simple compositional helpers
   These helpers produce human-readable color descriptors for each part.
   --------------------------- */

export function pickRandom(rng, arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)];
}

export function composeHue(rng, part) {
  // prefix from global hue prefixes, suffix from part-specific hue suffixes
  const prefix = pickRandom(rng, COLOUR_HUE_MEANINGS).prefix;
  const suffixList = COLOUR_HUE_SUFFIXES_BY_PART[part] || Object.keys(COLOUR_HUE_SUFFIX_EXAMPLES);
  const suffix = pickRandom(rng, suffixList);
  return `${prefix} ${suffix}`;
}

export function composeAccent(rng, part) {
  const colorPrefixList = COLOUR_ACCENT_PREFIXES_BY_PART[part] || ["white", "cream", "silver"];
  const markingList = COLOUR_ACCENT_SUFFIXES_BY_PART[part] || ["veined", "tipped", "blushed"];
  const prefix = pickRandom(rng, colorPrefixList);
  const suffix = pickRandom(rng, markingList);
  return `${prefix} ${suffix}`;
}

export function composeEffect(rng, part) {
  const prefixList = COLOUR_EFFECT_PREFIXES_BY_PART[part] || ["matte", "glossy", "velvet"];
  const suffixList = COLOUR_EFFECT_SUFFIXES_BY_PART[part] || ["finish", "sheen", "glow"];
  const prefix = pickRandom(rng, prefixList);
  const suffix = pickRandom(rng, suffixList);
  return `${prefix} ${suffix}`;
}

/* High level function to create a plant-part color description */
export function describePartColour(rng, part) {
  const hue = composeHue(rng, part);
  const accent = composeAccent(rng, part);
  const effect = composeEffect(rng, part);
  return { hue, accent, effect, combined: `${hue}, ${accent}, ${effect}` };
}

/* Example: generate a full plant color profile */
export function generatePlantColourProfile(seed) {
  const rng = createSeededRng(seed || generateGuidSeed());
  const profile = {};
  for (const part of PLANT_PARTS) {
    profile[part] = describePartColour(rng, part);
  }
  return profile;
}

/* ---------------------------
   Integration helpers: example usage with flora generator
   These are minimal and intended to be imported by your generator code.
   --------------------------- */

export function buildFloraColourSummary(plantProfile) {
  // produce a short human summary
  const parts = [];
  for (const part of PLANT_PARTS) {
    const p = plantProfile[part];
    if (!p) continue;
    parts.push(`${part}: ${p.combined}`);
  }
  return parts.join(" | ");
}

/* ---------------------------
   Backwards compatibility exports (for your existing code)
   --------------------------- */

export const COLOUR_HUE_SUFFIXES = COLOUR_HUE_SUFFIXES_BY_PART;
export const COLOUR_ACCENT_PREFIXES = COLOUR_ACCENT_PREFIXES_BY_PART;
export const COLOUR_ACCENT_SUFFIXES = COLOUR_ACCENT_SUFFIXES_BY_PART;
export const COLOUR_EFFECT_PREFIXES = COLOUR_EFFECT_PREFIXES_BY_PART;
export const COLOUR_EFFECT_SUFFIXES = COLOUR_EFFECT_SUFFIXES_BY_PART;

/* ---------------------------
   End of file
   --------------------------- */
