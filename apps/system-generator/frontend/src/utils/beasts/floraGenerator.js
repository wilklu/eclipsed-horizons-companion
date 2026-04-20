import { buildWorldLinkedCreatureOptions, createSeededRng, generateGuidSeed } from "./beastGenerator.js";
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
const ROOT_NETWORKS = [
  "deep anchor taproot",
  "fibrous web mat",
  "hollow nutrient lattice",
  "tidal rhizome spread",
  "stone-splitting nodules",
  "symbiotic fungal mesh",
];
const WATER_STRATEGIES = [
  "dew capture",
  "seasonal water hoarding",
  "salt filtering",
  "fog siphoning",
  "capillary trunk storage",
  "floodplain cycling",
];
const SOIL_PREFERENCES = [
  "volcanic loam",
  "alkaline dune crust",
  "peat-rich bog beds",
  "limestone shelves",
  "iron-rich clay",
  "orbital hydroponic trays",
];
const REPRODUCTION_STRATEGIES = [
  "seed pods launched by pressure",
  "wind-borne spores",
  "runner shoots",
  "pollinator symbiosis",
  "seasonal bulb splitting",
  "tidal pollination",
];
const COLOURWAYS = [
  "emerald and silver",
  "violet and black",
  "amber and jade",
  "scarlet-veined green",
  "pale blue fronds",
  "bronze waxy leaves",
];
const BLOOM_SHAPES = [
  "lantern-shaped blossoms",
  "spiral pollen cones",
  "umbrella petals",
  "glassy seed bells",
  "ribbon-like fronds",
  "clustered bulb crowns",
];
const SURFACE_TEXTURES = [
  "velvet leaf surfaces",
  "waxy reflective skin",
  "fine crystalline fuzz",
  "ribbed bark plating",
  "translucent petal membranes",
  "braided stem fibers",
];
const LIGHTING_MOODS = [
  "soft dawn light",
  "misty wetland haze",
  "high desert glare",
  "glowing twilight ambience",
  "cool subterranean luminescence",
  "storm-lit horizon light",
];
const ADAPTATIONS = [
  "bioluminescent bloom tips",
  "pressure-sealed seed chambers",
  "toxin-laced sap",
  "mirror-leaf heat deflection",
  "electrostatic pollen nets",
  "night-breathing stomata",
  "ice-crystal antifreeze tissues",
  "rapid wound callusing",
];
const PRIMARY_USES = [
  "medicinal resin",
  "textile fiber",
  "ceremonial incense",
  "high-calorie foodstock",
  "starship biofilter substrate",
  "structural cane",
  "industrial dye",
  "luxury perfume oil",
];
const HAZARD_LEVELS = ["Low", "Moderate", "Elevated", "High"];
const MARKET_APPEAL = ["local staple", "specialist export", "luxury trade good", "restricted cargo"];
const TAGLINES = [
  "a hardy botanical lineage shaped by extreme frontiers",
  "an elegant world-rooted flora prized across nearby trade lanes",
  "a strange bloom whose ecology hints at older planetary cycles",
  "a resilient plant network adapted to volatile local seasons",
  "an iconic species that defines the color and scent of its homeworld",
];
const NAME_PREFIXES = ["Aurel", "Thorn", "Myco", "Luma", "Virel", "Sable", "Tidal", "Cinder", "Vel", "Goss"];
const NAME_SUFFIXES = ["bloom", "reed", "fern", "spire", "vine", "moss", "frond", "root", "crown", "pod"];
const NAME_FLORA_CREATURE = [
  "Dragon",
  "Wolf",
  "Raven",
  "Crow",
  "Bear",
  "Alligator",
  "Beaver",
  "Cow",
  "Pig",
  "Bird",
  "Bull",
  "Buffalo",
  "Cat",
  "Chick",
  "Colt",
  "Crab",
  "Dog",
  "Stag",
  "Drake",
  "Duck",
  "Dove",
  "Eel",
  "Elephant",
  "Goat",
  "Fox",
  "Hog",
  "Horse",
  "Lark",
  "Lamb",
  "Adder",
  "Worm",
  "Buck",
  "Sheep",
  "Sow",
  "Spider",
  "Toad",
  "Viper",
  "Lion",
  "Snail",
  "Snake",
  "Rat",
  "Mouse",
  "Owl",
  "Wyvern",
  "Imp",
  "Mare",
  "Raptor",
  "Shark",
  "Swine",
  "Turtle",
  "Weasel",
  "Boar",
  "Ferret",
  "Gull",
  "Mantis",
  "Mole",
  "Pigeon",
  "Porcupine",
  "Raccoon",
  "Salamander",
  "Sparrow",
  "Squirrel",
  "Vulture",
  "Badger",
  "Bat",
  "Bison",
  "Butterfly",
  "Caribou",
  "Centipede",
  "Cobra",
  "Cougar",
  "Crane",
  "Crocodile",
  "Crow",
  "Deer",
  "Dolphin",
  "Falcon",
  "Ferret",
  "Finch",
  "Gazelle",
  "Giraffe",
  "Goose",
];
const NAME_FLORA_THING = [
  "Sand",
  "Button",
  "Musk",
  "Plume",
  "Sand",
  "Wick",
  "Spell",
  "Wild",
  "Water",
  "Bramble",
  "Sap",
  "Wool",
  "Gem",
  "Crunch",
  "Bell",
  "Salt",
  "Winkle",
  "Stream",
  "Branch",
  "Pepper",
  "Fern",
  "Wall",
  "Nut",
  "Needle",
  "Bristle",
  "Bind",
  "Sweet",
  "Spur",
  "Plague",
  "Pine",
  "Strife",
  "Tear",
  "Knap",
  "Bell",
  "Flag",
  "Hoof",
  "Bite",
  "Honey",
  "Hedge",
  "Balm",
  "Blood",
  "Thick",
  "Rue",
  "Glove",
  "Whip",
  "Copper",
  "Iron",
  "Drop",
  "Cotton",
  "Butter",
  "Ash",
  "Dew",
  "Frost",
  "Gale",
  "Hollow",
  "Mire",
  "Moss",
  "Pollen",
  "Quill",
  "Rough",
  "Shale",
  "Shimmer",
  "Soot",
  "Spore",
  "Tangle",
  "Tear",
  "Vine",
  "Wisp",
  "Worm",
  "Yarrow",
  "Zephyr",
  "Amber",
  "Basil",
  "Cedar",
  "Cinder",
  "Clover",
  "Dusk",
  "Ember",
  "Fawn",
  "Fern",
  "Frost",
  "Gale",
  "Glade",
  "Hawthorn",
  "Hedge",
  "Ivy",
  "Juniper",
  "Lichen",
  "Lily",
  "Moss",
  "Myrtle",
  "Nettle",
  "Oak",
  "Olive",
  "Pine",
  "Reed",
  "Rosemary",
  "Sage",
  "Thistle",
  "Thorn",
  "Valerian",
  "Willow",
];
const NAME_FLORA_SIGNIFIER = [
  "King",
  "Queen",
  "Crown",
  "Day",
  "Night",
  "Demon",
  "Winter",
  "Summer",
  "Witch",
  "Moon",
  "Sun",
  "River",
  "Mount",
  "Hill",
  "Steed",
  "Garden",
  "Meadow",
  "Devil",
  "Mage",
  "Fairy",
  "Wizard",
  "Valor",
  "Heart",
  "Head",
  "Mind",
  "Jewel",
  "Love",
  "Hate",
  "God",
  "Knight",
  "Lady",
  "Father",
  "Parent",
  "Money",
  "Dawn",
  "Dusk",
  "Lord",
  "Shepherd",
  "Bastard",
  "Gem",
  "Pilgrim",
  "Realm",
  "Maiden",
  "Hero",
  "Diamond",
  "Emerald",
  "Mother",
  "Beggar",
  "Lover",
  "World",
  "Iron",
  "Drop",
  "Cotton",
  "Butter",
];
const NAME_FLORA_GRASS = [
  "Weed",
  "Grass",
  "Cress",
  "Flower",
  "Clover",
  "Seed",
  "Berry",
  "Brome",
  "Wheat",
  "Thorn",
  "Vine",
  "Mint",
  "Herb",
  "Daisy",
  "Thyme",
  "Flax",
  "Hemp",
  "Lettuce",
  "Mallow",
  "Millet",
  "Wort",
  "Nettle",
  "Sedge",
  "Rose",
  "Sage",
  "Reed",
  "Bur",
  "Root",
  "Spurge",
  "Blossom",
  "Tansy",
  "Teasel",
  "Tassel",
  "Thistle",
  "Fruit",
  "Leaf",
  "Vetch",
  "Wood",
  "Cherry",
  "Poppy",
  "Suckle",
  "Mur",
  "Phlox",
  "Ivy",
  "Mustard",
  "Lily",
  "Lilac",
  "Plant",
  "Fig",
  "Meg",
  "Fern",
  "Moss",
  "Cactus",
  "Palm",
  "Fungus",
  "Algae",
  "Shrub",
  "Tree",
  "Bulb",
  "Bloom",
  "Frond",
  "Spore",
  "Branch",
  "Bramble",
  "Bush",
  "Cane",
  "Carpet",
  "Cluster",
  "Colony",
  "Crag",
  "Crone",
  "Crown",
  "Daisy",
  "Dawn",
  "Dusk",
  "Fern",
  "Field",
  "Flame",
  "Frost",
  "Gale",
  "Glade",
  "Glory",
  "Hawthorn",
  "Hedge",
  "Hill",
  "Hollow",
  "Ivy",
  "Juniper",
  "Lichen",
  "Lily",
  "Mallow",
  "Meadow",
  "Mint",
  "Moss",
  "Myrtle",
  "Nettle",
  "Oak",
  "Olive",
  "Pine",
  "Reed",
  "Rosemary",
  "Sage",
  "Thistle",
  "Thorn",
  "Valerian",
  "Willow",
];
const NAME_FLORA_MODIFIER = [
  "Bane",
  "Head",
  "Foot",
  "Finger",
  "Tail",
  "Tooth",
  "Guts",
  "Lock",
  "Hair",
  "Horn",
  "Beard",
  "Knot",
  "Death",
  "Milk",
  "Shade",
  "Tongue",
  "Rot",
  "Foil",
  "Grasp",
  "Wings",
  "Claw",
  "Heart",
  "Veil",
  "Whisper",
  "Shroud",
  "Flare",
  "Gaze",
  "Spear",
  "Fang",
  "Brew",
  "Curse",
  "Blessing",
  "Doom",
  "Glory",
  "Horror",
  "Revenge",
  "Sin",
  "Sorrow",
  "Joy",
  "Valor",
  "Ruin",
  "Hope",
  "Fear",
  "Hate",
  "Love",
  "Dawn",
  "Dusk",
  "Light",
  "Darkness",
  "Shadow",
  "Dream",
  "Nightmare",
  "Storm",
  "Frost",
  "Flame",
  "Gale",
  "Ember",
  "Ashes",
];
const NAME_FLORA_REGION_FEATURE = [
  "Mountain",
  "Prairie",
  "Tundra",
  "Valley",
  "Forest",
  "Jungle",
  "Canopy",
  "Summit",
  "Meadow",
  "Thicket",
  "Channel",
  "Canyon",
  "Desert",
  "Wetland",
  "Quarter",
  "Shrubland",
  "Island",
  "Lowland",
  "Rainforest",
  "Highland",
];
const NAME_FLORA_METAPHOR = [
  "Bane",
  "Barren",
  "Belt",
  "Blade",
  "Blight",
  "Border",
  "Branch",
  "Cairn",
  "Cradle",
  "Curse",
  "Deep",
  "Doom",
  "Edge",
  "Fall",
  "Fang",
  "Fear",
  "Fell",
  "Field",
  "Fire",
  "Flail",
  "Flame",
  "Flat",
  "Fog",
  "Forge",
  "Frost",
  "Gate",
  "Grasp",
  "Grave",
  "Guard",
  "Gull",
  "Hail",
  "Heart",
  "Hearth",
  "Heat",
  "Hedge",
  "Hex",
  "Knife",
  "Light",
  "Mane",
  "Mare",
  "Mark",
  "Mask",
  "Mast",
  "Maw",
  "Mirth",
  "Mist",
  "Murk",
  "Needle",
  "Pale",
  "Path",
  "Pyre",
  "Range",
  "Reach",
  "Realm",
  "Ridge",
  "Rim",
  "Rise",
  "Rite",
  "Rock",
  "Sail",
  "Scale",
  "Scar",
  "Scare",
  "Scream",
  "Shadow",
  "Shard",
  "Skull",
  "Sky",
  "Sound",
  "Spear",
  "Spine",
  "Spire",
  "Stair",
  "Stead",
  "Sting",
  "Sword",
  "Tear",
  "Thaw",
  "Thorn",
  "Tooth",
  "Torch",
  "Tree",
  "Veil",
  "Vein",
  "Vow",
  "Wake",
  "Wall",
  "War",
  "Ward",
  "Watch",
  "Way",
  "Wheel",
  "Whyll",
  "Wild",
  "Wind",
  "Wing",
  "Wisp",
  "Wreath",
  "Yew",
];
const NAME_FLORA_REGION_DESCRIPTOR = [
  "Astral",
  "Blasted",
  "Blazing",
  "Blessed",
  "Bloodied",
  "Breaking",
  "Bright",
  "Broken",
  "Bronze",
  "Color",
  "Crystal",
  "Cursed",
  "Damned",
  "Divine",
  "Eastern",
  "Elder",
  "Faerie",
  "Fallen",
  "Fetid",
  "Fickle",
  "Fierce",
  "Fiery",
  "Final",
  "First",
  "Fleeting",
  "Flooded",
  "Forgotten",
  "Free",
  "Giant",
  "Gleaming",
  "Golden",
  "Great",
  "Greater",
  "Grieving",
  "Hanging",
  "Hidden",
  "High",
  "Infernal",
  "Infinite",
  "Last",
  "Lesser",
  "Lonely",
  "Long",
  "Lost",
  "Lower",
  "Mangled",
  "Many",
  "Marred",
  "Middle",
  "Misty",
  "Mystic",
  "Northern",
  "Painted",
  "Pallid",
  "Past",
  "Piercing",
  "Poisoned",
  "Quiet",
  "Ragged",
  "Raised",
  "Risen",
  "Rocky",
  "Rugged",
  "Sacred",
  "Scarred",
  "Screaming",
  "Screeching",
  "Seared",
  "Serene",
  "Shadow",
  "Shallow",
  "Sharp",
  "Shining",
  "Silent",
  "Silver",
  "Sleeping",
  "Slumbering",
  "Solemn",
  "Southern",
  "Summer",
  "Sundered",
  "Sunken",
  "Sweeping",
  "Torn",
  "Torrid",
  "Twisted",
  "Undying",
  "Upper",
  "Veiled",
  "Waking",
  "Wasting",
  "Weary",
  "Weeping",
  "Western",
  "White",
  "Winding",
  "Winter",
  "Wistful",
];
const NAME_FLORA_REGION_CONCEPT = [
  "Haven",
  "Fame",
  "Dawn",
  "Sorrow",
  "Fear",
  "Song",
  "Death",
  "Quiet",
  "Dream",
  "Life",
  "Sight",
  "King",
  "Queen",
  "Vision",
  "Fey",
  "Hurt",
  "Beacon",
  "Star",
  "Peace",
  "Spell",
  "Beast",
  "Raven",
  "Battle",
  "Priest",
  "Mage",
  "Moon",
  "Crow",
  "Ghost",
  "Fiend",
  "Still",
  "Night",
  "Spirit",
  "God",
  "Lion",
  "Dusk",
  "Steed",
  "Cloud",
  "Sun",
  "Siren",
  "Time",
  "Fright",
  "Sleep",
  "Seer",
  "Dagger",
  "End",
];

const NAME_FLORA_COLOR = [
  "Red",
  "Green",
  "Purple",
  "Yellow",
  "Silver",
  "Black",
  "White",
  "Blue",
  "Grey",
  "Brown",
  "Orange",
  "Golden",
  "Bronze",
  "Pink",
  "Violet",
  "Lavender",
  "Dark",
  "Bright",
  "Brilliant",
  "Roll twice",
];
const NAME_FLORA_TREES = [
  "Pine",
  "Fir",
  "Fig",
  "Oak",
  "Aspen",
  "Birch",
  "Maple",
  "Cherry",
  "Yew",
  "Eucalyptus",
  "Gum",
  "Bamboo",
  "Palm",
  "Baobab",
  "Acacia",
  "Spruce",
  "Sequoia",
  "Cypress",
  "Rubber",
  "Mahogany",
  "Date",
  "Willow",
  "Sycamore",
  "Larch",
  "Ash",
  "Walnut",
  "Magnolia",
  "Hemlock",
  "Cacao",
  "Burflower",
  "Juniper",
  "Papaya",
  "Gingko",
  "Coconut",
  "Dove",
  "Pagoda",
  "Fern",
  "Cathaya",
  "Tallow",
  "Laurel",
  "Camphor",
  "Holly",
  "Lime",
  "Dragon",
  "Banyan",
  "Sallow",
  "Kauri",
  "Bristlecone",
  "Nutmeg",
];

const FLORA_NAME_SOURCE_MAP = Object.freeze({
  Creature: NAME_FLORA_CREATURE,
  Thing: NAME_FLORA_THING,
  Grass: NAME_FLORA_GRASS,
  Modifier: NAME_FLORA_MODIFIER,
  Signifier: NAME_FLORA_SIGNIFIER,
  Descriptor: NAME_FLORA_COLOR,
  Tree: NAME_FLORA_TREES,
  "Region Feature": NAME_FLORA_REGION_FEATURE,
  "Region Metaphor": NAME_FLORA_METAPHOR,
  "Region Descriptor": NAME_FLORA_REGION_DESCRIPTOR,
  "Region Concept": NAME_FLORA_REGION_CONCEPT,
});

function pick(values, rng = Math.random) {
  return values[Math.floor(rng() * values.length)];
}

function shuffle(values, rng = Math.random) {
  return [...values]
    .map((value) => ({ value, order: rng() }))
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.value);
}

function uniqueEntries(values = []) {
  return [...new Set(values.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

function describeClimateBand(climate = "Temperate") {
  const normalized = String(climate || "Temperate");
  if (["Arid", "Tundra", "Subterranean"].includes(normalized)) return "stress-adapted";
  if (["Wetland", "Tropical", "Coastal"].includes(normalized)) return "water-rich";
  return "temperate-stable";
}

function normalizeFloraSubtypeToken(world = {}) {
  return [world?.worldSubtype, world?.worldClass, world?.worldDescriptor].filter(Boolean).join(" ").toLowerCase();
}

function resolveFloraSubtypeBias(world = {}) {
  const subtype = normalizeFloraSubtypeToken(world);

  if (!subtype) {
    return {};
  }

  if (/(gaian|euvesperian|pelagic|panthalassic|oceanic|bathyvesperian)/.test(subtype)) {
    return {
      climate: "Wetland",
      growthForms: ["Canopy Tree", "Floating Frond", "Reed Colony", "Creeping Vine"],
      adaptations: ["bioluminescent bloom tips", "electrostatic pollen nets", "rapid wound callusing"],
      uses: ["medicinal resin", "luxury perfume oil", "textile fiber"],
      tagline: "a lush botanical lineage thriving in water-rich planetary cycles",
    };
  }

  if (/(vesperian|chlorivesperian|janivesperian)/.test(subtype)) {
    return {
      climate: subtype.includes("janivesperian") ? "Coastal" : "Temperate",
      growthForms: ["Creeping Vine", "Canopy Tree", "Spore Fern", "Reed Colony"],
      adaptations: ["night-breathing stomata", "mirror-leaf heat deflection", "electrostatic pollen nets"],
      uses: ["luxury perfume oil", "medicinal resin", "ceremonial incense"],
      tagline: "an elegant twilight-adapted flora shaped by tidally locked seasons",
    };
  }

  if (/(tartarian|teathic|nunnic|amunian|snowball)/.test(subtype)) {
    return {
      climate: "Tundra",
      growthForms: ["Crystal Moss", "Spore Fern", "Bulb Grove"],
      adaptations: ["ice-crystal antifreeze tissues", "pressure-sealed seed chambers", "night-breathing stomata"],
      uses: ["starship biofilter substrate", "industrial dye", "restricted cargo"],
      tagline: "a cryogenic flora lineage adapted to volatile cold-sea chemistry",
    };
  }

  if (/(arid|janilithic|telluric|phosphorian|cytherean|meltball|rockball)/.test(subtype)) {
    return {
      climate: "Arid",
      growthForms: ["Succulent Tower", "Crystal Moss", "Bulb Grove"],
      adaptations: ["mirror-leaf heat deflection", "toxin-laced sap", "pressure-sealed seed chambers"],
      uses: ["industrial dye", "structural cane", "ceremonial incense"],
      tagline: "a hardy drought-shaped flora lineage built for punishing heat and scarce water",
    };
  }

  return {};
}

export function mapWorldToFloraClimate(world = {}) {
  const terrain = String(buildWorldLinkedCreatureOptions(world).terrain || "").toLowerCase();
  const hydrographics = Number(world?.hydrographics ?? 0);
  const avgTempC = Number(world?.avgTempC ?? 20);
  const subtypeBias = resolveFloraSubtypeBias(world);

  if (subtypeBias.climate) return subtypeBias.climate;
  if (terrain.includes("ocean") || terrain.includes("wet") || hydrographics >= 8) return "Wetland";
  if (terrain.includes("coast") || terrain.includes("shore")) return "Coastal";
  if (terrain.includes("mount") || terrain.includes("precipice")) return "Alpine";
  if (terrain.includes("cavern") || terrain.includes("underground")) return "Subterranean";
  if (avgTempC <= -5) return "Tundra";
  if (hydrographics <= 2 || avgTempC >= 35) return "Arid";
  if (avgTempC >= 28) return "Tropical";
  return "Temperate";
}

export function recommendGrowthForm(climate = "Temperate", rng = Math.random, world = {}) {
  const subtypeBias = resolveFloraSubtypeBias(world);
  const lookup = {
    Temperate: ["Canopy Tree", "Bulb Grove", "Creeping Vine"],
    Arid: ["Succulent Tower", "Crystal Moss", "Bulb Grove"],
    Wetland: ["Floating Frond", "Reed Colony", "Spore Fern"],
    Tropical: ["Canopy Tree", "Creeping Vine", "Spore Fern"],
    Alpine: ["Crystal Moss", "Bulb Grove", "Reed Colony"],
    Tundra: ["Crystal Moss", "Spore Fern", "Bulb Grove"],
    Subterranean: ["Spore Fern", "Crystal Moss", "Creeping Vine"],
    Coastal: ["Reed Colony", "Floating Frond", "Canopy Tree"],
  };

  return pick(subtypeBias.growthForms || lookup[String(climate || "Temperate")] || FLORA_GROWTH_FORMS, rng);
}

export function buildWorldLinkedFloraOptions(world = {}) {
  const worldLink = buildWorldLinkedCreatureOptions(world);
  const climate = mapWorldToFloraClimate(world);

  return {
    sourceWorld: {
      ...worldLink.sourceWorld,
      nativeLifeform: String(world?.nativeLifeform || ""),
      nativeSophontLife: Boolean(world?.nativeSophontLife),
      worldSubtype: String(world?.worldSubtype || ""),
      worldClass: String(world?.worldClass || ""),
      worldDescriptor: String(world?.worldDescriptor || ""),
    },
    climate,
    growthForm: recommendGrowthForm(climate, createSeededRng(`${worldLink.sourceWorld?.name || "world"}-flora`), world),
    origin: world?.nativeLifeform ? "Native floral lineage" : "Imported or engineered stock",
  };
}

export function buildFloraImagePrompt({
  name = "Generated Flora",
  biology = {},
  ecology = {},
  adaptations = [],
  uses = {},
  sourceWorld = null,
  rng = Math.random,
} = {}) {
  const growthForm = String(biology?.["Growth Form"] || "alien plant");
  const climate = String(biology?.Climate || "temperate").toLowerCase();
  const height = String(biology?.Height || "medium height");
  const canopy = String(biology?.Canopy || "ornate foliage").toLowerCase();
  const coloration = String(biology?.Coloration || "varied green coloration").toLowerCase();
  const soil = String(ecology?.["Soil Preference"] || "mineral-rich soil").toLowerCase();
  const waterStrategy = String(ecology?.["Water Strategy"] || "efficient moisture capture").toLowerCase();
  const primaryUse = String(uses?.["Primary Use"] || "ecological value").toLowerCase();
  const worldName = String(sourceWorld?.name || "an alien frontier world");
  const featureList =
    Array.isArray(adaptations) && adaptations.length ? adaptations.slice(0, 2).join(", ") : "unusual adaptive traits";

  const bloomShape = pick(BLOOM_SHAPES, rng);
  const surfaceTexture = pick(SURFACE_TEXTURES, rng);
  const lightingMood = pick(LIGHTING_MOODS, rng);

  const visualDescription = `${name} appears as a ${climate} ${growthForm.toLowerCase()} roughly ${height} tall, with ${canopy}, ${coloration}, and ${bloomShape} supported by ${surfaceTexture}. It grows from ${soil} using ${waterStrategy}, and its most notable traits include ${featureList}.`;
  const imagePrompt = `Detailed botanical concept art of ${name}, an alien ${growthForm.toLowerCase()} on ${worldName}, ${height} tall, ${canopy}, ${coloration}, ${bloomShape}, ${surfaceTexture}, adapted for ${climate} conditions, growing from ${soil}, hints of ${featureList}, naturalistic sci-fi field-guide style, full plant visible, clean composition, ${lightingMood}, highly detailed.`;

  return { visualDescription, imagePrompt, imageCaption: `${name} — ${primaryUse} specimen from ${worldName}` };
}

export function generateFloraProfile(options = {}) {
  const {
    seed = "",
    name = "Generated Flora",
    nameSeed = "",
    growthForm = "random",
    climate = "random",
    sourceWorld = null,
  } = options;
  const resolvedSeed = String(seed || "").trim() || generateGuidSeed("flora");
  const resolvedNameSeed = String(nameSeed || "").trim() || resolvedSeed;
  const rng = createSeededRng(resolvedSeed);
  const subtypeBias = resolveFloraSubtypeBias(sourceWorld || {});
  const resolvedName =
    !String(name || "").trim() || name === "Generated Flora" ? randomFloraName(resolvedNameSeed) : String(name).trim();
  const resolvedClimate = climate === "random" ? subtypeBias.climate || pick(FLORA_CLIMATES, rng) : climate;
  const resolvedGrowthForm =
    growthForm === "random" ? recommendGrowthForm(resolvedClimate, rng, sourceWorld || {}) : growthForm;
  const adaptationPool = uniqueEntries([...(subtypeBias.adaptations || []), ...ADAPTATIONS]);
  const primaryUsePool = uniqueEntries([...(subtypeBias.uses || []), ...PRIMARY_USES]);
  const adaptationList = shuffle(adaptationPool, rng).slice(0, 3);
  const hazardPool =
    subtypeBias.climate === "Arid" || subtypeBias.climate === "Tundra"
      ? ["Moderate", "Elevated", "High"]
      : HAZARD_LEVELS;
  const hazardLevel = pick(hazardPool, rng);
  const primaryUse = pick(primaryUsePool, rng);
  const climateBand = describeClimateBand(resolvedClimate);

  const biology = {
    "Growth Form": resolvedGrowthForm,
    Climate: resolvedClimate,
    Height: `${1 + Math.floor(rng() * 18)} m`,
    Canopy: pick(
      ["dense layered crown", "umbrella spread", "spiral fronds", "low clustered pads", "ribboned tendrils"],
      rng,
    ),
    Coloration: pick(COLOURWAYS, rng),
    Reproduction: pick(REPRODUCTION_STRATEGIES, rng),
  };
  const ecology = {
    "Root Network": pick(ROOT_NETWORKS, rng),
    "Water Strategy": pick(
      uniqueEntries([
        ...(subtypeBias.climate === "Arid" ? ["fog siphoning", "seasonal water hoarding"] : []),
        ...(subtypeBias.climate === "Wetland" ? ["floodplain cycling", "salt filtering"] : []),
        ...(subtypeBias.climate === "Tundra" ? ["dew capture", "capillary trunk storage"] : []),
        ...WATER_STRATEGIES,
      ]),
      rng,
    ),
    "Soil Preference": pick(
      uniqueEntries([
        ...(subtypeBias.climate === "Tundra" ? ["iron-rich clay", "limestone shelves"] : []),
        ...(subtypeBias.climate === "Arid" ? ["alkaline dune crust", "volcanic loam"] : []),
        ...SOIL_PREFERENCES,
      ]),
      rng,
    ),
    "Seasonal Cycle": pick(
      [
        "brief explosive bloom",
        "evergreen persistence",
        "storm-triggered fruiting",
        "dormant dry-season retreat",
        "night-only flowering",
      ],
      rng,
    ),
    "Climate Band": climateBand,
  };
  const uses = {
    "Primary Use": primaryUse,
    "Hazard Level": hazardLevel,
    "Market Appeal": pick(MARKET_APPEAL, rng),
    "Harvest Window": pick(
      ["year-round", "short monsoon", "winter frost", "double equinox", "high tide alignment"],
      rng,
    ),
  };
  const { visualDescription, imagePrompt, imageCaption } = buildFloraImagePrompt({
    name: resolvedName,
    biology,
    ecology,
    adaptations: adaptationList,
    uses,
    sourceWorld,
    rng,
  });
  const taxonomy = buildLifeTaxonomy({
    seed: resolvedSeed,
    name: resolvedName,
    category: "flora",
    growthForm: resolvedGrowthForm,
    climate: resolvedClimate,
    environment: resolvedClimate,
  });
  const lineage = buildLineageProfile({
    seed: resolvedSeed,
    category: "flora",
    sourceWorld,
    environment: resolvedClimate,
  });

  return {
    id: String(options.id || resolvedSeed),
    name: resolvedName,
    icon: pick(ICONS, rng),
    summary: `${resolvedName} is ${subtypeBias.tagline || pick(TAGLINES, rng)}.`,
    biology,
    ecology,
    uses,
    adaptations: adaptationList,
    hooks: [
      `Local traders value it for ${primaryUse}.`,
      `Field teams report ${adaptationList[0] || "resilient growth"} in the wild.`,
      `${resolvedGrowthForm} colonies thrive through ${String(resolvedClimate || "variable").toLowerCase()} cycles.`,
      subtypeBias.tagline ? `Researchers describe it as ${subtypeBias.tagline}.` : null,
    ].filter(Boolean),
    visualDescription,
    imagePrompt,
    imageCaption,
    taxonomy,
    lineage,
    origin: lineage.originModel,
    sourceWorld,
    worldIntegration: {
      summary: `${resolvedName} is a ${String(resolvedClimate).toLowerCase()} ${String(resolvedGrowthForm).toLowerCase()} known for ${String(primaryUse).toLowerCase()}.`,
      notes: [
        `Hazard rating holds at ${hazardLevel.toLowerCase()}.`,
        `Typical adaptation profile includes ${adaptationList.join(", ")}.`,
        lineage.uniquenessStatement,
      ],
    },
    seed: resolvedSeed,
  };
}

export function buildFloraWorldUpdate(record = {}, existingWorld = {}) {
  const growthForm = String(record?.biology?.["Growth Form"] || "Flora cluster");
  const climate = String(record?.biology?.Climate || "Temperate");
  const primaryUse = String(record?.uses?.["Primary Use"] || "general ecological value");
  const hazardLevel = String(record?.uses?.["Hazard Level"] || "Low");
  const summary = `${record?.name || "Linked flora"} is a ${climate.toLowerCase()} ${growthForm.toLowerCase()} valued for ${primaryUse.toLowerCase()}.`;
  const remarks = uniqueEntries([
    ...(Array.isArray(existingWorld?.remarks) ? existingWorld.remarks : []),
    `Flora dossier: ${summary}`,
    `Botanical hazard: ${hazardLevel}.`,
  ]).slice(-8);

  return {
    linkedFloraSummary: {
      id: String(record?.id || ""),
      name: String(record?.name || "Linked flora"),
      scientificName: String(record?.taxonomy?.["Scientific Name"] || "Unclassified flora"),
      originModel: String(record?.lineage?.originModel || record?.origin || "Unknown lineage"),
      growthForm,
      climate,
      primaryUse,
      hazardLevel,
      summary,
      updatedAt: String(record?.updatedAt || new Date().toISOString()),
    },
    secondaryWorldContext: String(existingWorld?.secondaryWorldContext || "").includes(summary)
      ? String(existingWorld?.secondaryWorldContext || summary)
      : existingWorld?.secondaryWorldContext
        ? `${existingWorld.secondaryWorldContext}; ${summary}`
        : summary,
    remarks,
  };
}

function pickFloraNamePart(category, rng = Math.random) {
  return pick(FLORA_NAME_SOURCE_MAP[category] || NAME_FLORA_THING, rng);
}

function buildNestedFloraName(rng = Math.random, depth = 0) {
  const safeDepth = Number(depth) || 0;
  const patternRoll = Math.floor(rng() * 22) + 1;
  const nestedRoll = safeDepth >= 1 && (patternRoll === 10 || patternRoll === 21) ? 1 : patternRoll;

  switch (nestedRoll) {
    case 1:
      return `${pickFloraNamePart("Creature", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 2:
      return `${pickFloraNamePart("Creature", rng)}s${pickFloraNamePart("Modifier", rng)}`;
    case 3:
      return `${pickFloraNamePart("Creature", rng)}s${pickFloraNamePart("Modifier", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 4:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 5:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Thing", rng)}`;
    case 6:
      return `${pickFloraNamePart("Thing", rng)}${pickFloraNamePart("Modifier", rng)}`;
    case 7:
      return `${pickFloraNamePart("Creature", rng)}'s ${pickFloraNamePart("Descriptor", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 8:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Creature", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 9:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}${pickFloraNamePart("Modifier", rng)}`;
    case 10:
      return `${pickFloraNamePart("Descriptor", rng)} ${buildNestedFloraName(rng, safeDepth + 1)}`;
    case 11:
      return `${pickFloraNamePart("Tree", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 12:
      return `${pickFloraNamePart("Grass", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 13:
      return `${pickFloraNamePart("Signifier", rng)}s${pickFloraNamePart("Modifier", rng)}`;
    case 14:
      return `${pickFloraNamePart("Signifier", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 15:
      return `${pickFloraNamePart("Descriptor", rng)}-${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 16:
      return `${pickFloraNamePart("Descriptor", rng)}${pickFloraNamePart("Modifier", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 17:
      return `${pickFloraNamePart("Region Feature", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 18:
      return `${pickFloraNamePart("Region Metaphor", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 19:
      return `${pickFloraNamePart("Region Descriptor", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 20:
      return `${pickFloraNamePart("Region Concept", rng)} ${pickFloraNamePart("Grass", rng)}`;
    case 21:
      return `${pickFloraNamePart("Signifier", rng)}'s ${buildNestedFloraName(rng, safeDepth + 1)}`;
    case 22:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Tree", rng)}`;
    default:
      return `${pickFloraNamePart("Thing", rng)} ${pickFloraNamePart("Grass", rng)}`;
  }
}

export function randomFloraName(seed = "") {
  const rng = createSeededRng(String(seed || "").trim() || generateGuidSeed("flora-name"));
  return buildNestedFloraName(rng).replace(/\s+/g, " ").trim();
}
