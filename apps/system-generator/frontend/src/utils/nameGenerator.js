const NORMALIZED_ADJECTIVES = Object.freeze([
  "Ancient",
  "Whirling",
  "Grand",
  "Silent",
  "Radiant",
  "Outer",
  "Veiled",
  "Shattered",
  "Eternal",
  "Forgotten",
  "Hidden",
  "Crimson",
  "Azure",
  "Emerald",
  "Obsidian",
  "Celestial",
  "Luminous",
  "Spectral",
  "Vast",
  "Infinite",
  "Ethereal",
  "Astral",
  "Deep",
  "Vast",
  "Aurora",
  "Nova",
  "Stellar",
  "Cosmic",
  "Infernal",
  "Radiant",
  "Sable",
  "Gilded",
  "Twilight",
  "Obsidian",
  "Silent",
  "Eclipsed",
  "Ghostly",
  "Starborn",
  "Starforged",
  "Starbound",
  "Starward",
  "Starbright",
  "Starshadow",
  "Starweaver",
  "Starshaper",
  "Starcaller",
  "Starseeker",
  "Starwanderer",
  "Starstrider",
  "Nightfall",
  "Nightshade",
  "Nightstar",
  "Nightwind",
  "Nightweaver",
  "Nightshaper",
  "Nightcaller",
  "Nightseeker",
  "Nightwanderer",
  "Nightstrider",
  "Nightborne",
  "Moonlit",
  "Moonshadow",
  "Moonweaver",
  "Moonshaper",
  "Mooncaller",
  "Moonseeker",
  "Moonwanderer",
  "Moonstrider",
  "Moonborne",
  "Shadowed",
  "Shadowy",
  "Shadowborn",
  "Shadowweaver",
  "Shadowshaper",
  "Shadowcaller",
  "Shadowseeker",
  "Shadowwanderer",
  "Shadowstrider",
  "Shadowborne",
  "Voidborn",
  "Voidwalker",
  "Voidweaver",
  "Voidshaper",
  "Voidcaller",
  "Voidseeker",
  "Voidwanderer",
  "Voidstrider",
  "Voidborne",
  "Voidward",
  "Voidlight",
  "Voidshadow",
  "Voidstar",
  "Voidmoon",
  "Voidnight",
  "Voidwind",
  "Reverent",
  "Venerable",
  "Solemn",
  "Hallowed",
  "Sacred",
  "Divine",
  "Blessed",
  "Cursed",
  "Fallen",
  "Doomed",
  "Forsaken",
  "Haunted",
  "Enigmatic",
  "Mysterious",
  "Arcane",
  "Eldritch",
  "Dreambound",
  "Dreamweaver",
  "Dreamshaper",
  "Dreamcaller",
  "Dreamseeker",
  "Dreamwanderer",
  "Dreamstrider",
  "Eternum",
  "Emberbright",
  "Frostbound",
  "Frostweaver",
  "Frostshaper",
  "Frostcaller",
  "Frostseeker",
  "Frostwanderer",
  "Froststrider",
  "Frostborne",
  "Frostward",
  "Frostlight",
  "Frostshadow",
  "Froststar",
  "Frostmoon",
  "Frostnight",
  "Frostwind",
  "Emberstar",
  "Embermoon",
  "Embernight",
  "Emberwind",
  "Emberweaver",
  "Embershaper",
  "Embercaller",
  "Emberseeker",
  "Emberwanderer",
  "Emberstrider",
  "Emberborne",
  "Emberward",
  "Emberlight",
  "Embershadow",
  "Emberfall",
  "Stormlight",
  "Stormshadow",
  "Stormstar",
  "Stormmoon",
  "Stormnight",
  "Stormwind",
  "Stormweaver",
  "Stormshaper",
  "Stormcaller",
  "Stormseeker",
  "Stormwanderer",
  "Stormstrider",
  "Stormborne",
  "Stormward",
  "Stormfall",
  "Crowned",
  "Shrouded",
  "Drifting",
  "Marching",
  "Halcyon",
  "Gated",
  "Clustered",
  "Everstar",
  "Evermoon",
  "Evernight",
  "Everwind",
  "Everweaver",
  "Evershaper",
  "Evercaller",
  "Everseeker",
  "Everwanderer",
  "Everstrider",
  "Everborne",
  "Everward",
  "Everlight",
  "Evershadow",
  "Everfall",
  "Solar",
  "Solarstar",
  "Solarmoon",
  "Solarnight",
  "Solarwind",
  "Solarweaver",
  "Solarshaper",
  "Solarcaller",
  "Solarseeker",
  "Solarwanderer",
  "Solarstrider",
  "Solarborne",
  "Solarward",
  "Solarlight",
  "Solarshadow",
  "Solarfall",
  "Lunar",
  "Lunarstar",
  "Lunarmoon",
  "Lunarnight",
  "Lunarwind",
  "Lunarweaver",
  "Lunarshaper",
  "Lunarcaller",
  "Lunarseeker",
  "Lunarwanderer",
  "Lunarstrider",
  "Lunarborne",
  "Lunarward",
  "Lunarlight",
  "Lunarshadow",
  "Lunarfall",
  "Starlit",
  "Stargazer",
  "Starborn",
  "Golden",
  "Silver",
  "Bronze",
  "Diamond",
  "Platinum",
  "Onyx",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Amethyst",
  "Topaz",
  "Opal",
  "Goldenstar",
  "Goldenmoon",
  "Goldennight",
  "Goldenwind",
  "Goldenweaver",
  "Goldenshaper",
  "Goldencaller",
  "Goldenseeker",
  "Goldenwanderer",
  "Goldenstrider",
  "Goldenborne",
  "Goldenward",
  "Goldenlight",
  "Goldenshadow",
  "Goldenfall",
  "Silverstar",
  "Silvermoon",
  "Silvernight",
  "Silverwind",
  "Silverweaver",
  "Silvershaper",
  "Silvercaller",
  "Silverseeker",
  "Silverwanderer",
  "Silverstrider",
  "Silverborne",
  "Silverward",
  "Silverlight",
  "Silvershadow",
  "Silverfall",
  "Bronzestar",
  "Bronzemoon",
  "Bronzenight",
  "Bronzewind",
  "Bronzeweaver",
  "Bronzeshaper",
  "Bronzecaller",
  "Bronzeseeker",
  "Bronzewanderer",
  "Bronzestrider",
  "Bronzeborne",
  "Bronzeward",
  "Bronzelight",
  "Bronzeshadow",
  "Bronzefall",
  "Diamondstar",
  "Diamondmoon",
  "Diamondnight",
  "Diamondwind",
  "Diamondweaver",
  "Diamondshaper",
  "Diamondcaller",
  "Diamondseeker",
  "Diamondwanderer",
  "Diamondstrider",
  "Diamondborne",
  "Diamondward",
  "Diamondlight",
  "Diamondshadow",
  "Diamondfall",
  "Platinumstar",
  "Platinummoon",
  "Platinumnight",
  "Platinumwind",
  "Platinumweaver",
  "Platinumshaper",
  "Platinumcaller",
  "Platinumseeker",
  "Platinumwanderer",
  "Platinumstrider",
  "Platinumborne",
  "Platinumward",
  "Platinumlight",
  "Platinumshadow",
  "Platinumfall",
  "Onyxstar",
  "Onyxmoon",
  "Onyxnight",
  "Onyxwind",
  "Onyxweaver",
  "Onyxshaper",
  "Onyxcaller",
  "Onyxseeker",
  "Onyxwanderer",
  "Onyxstrider",
  "Onyxborne",
  "Onyxward",
  "Onyxlight",
  "Onyxshadow",
  "Onyxfall",
  "Sapphirestar",
  "Sapphiremoon",
  "Sapphirenight",
  "Sapphirewind",
  "Sapphireweaver",
  "Sapphireshaper",
  "Sapphirecaller",
  "Sapphireseeker",
  "Sapphirewanderer",
  "Sapphirestrider",
  "Sapphireborne",
  "Sapphireward",
  "Sapphirelight",
  "Sapphireshadow",
  "Sapphirefall",
  "Rubystar",
  "Rubymoon",
  "Rubynight",
  "Rubywind",
  "Rubyweaver",
  "Rubyshaper",
  "Rubycaller",
  "Rubyseeker",
  "Rubywanderer",
  "Rubystrider",
  "Rubyborne",
  "Rubyward",
  "Rubylight",
  "Rubyshadow",
  "Rubyfall",
  "Emeraldstar",
  "Emeraldmoon",
  "Emeraldnight",
  "Emeraldwind",
  "Emeraldweaver",
  "Emeraldshaper",
  "Emeraldcaller",
  "Emeraldseeker",
  "Emeraldwanderer",
  "Emeraldstrider",
  "Emeraldborne",
  "Emeraldward",
  "Emeraldlight",
  "Emeraldshadow",
  "Emeraldfall",
  "Amethyststar",
  "Amethystmoon",
  "Amethystnight",
  "Amethystwind",
  "Amethystweaver",
  "Amethystshaper",
  "Amethystcaller",
  "Amethystseeker",
  "Amethystwanderer",
  "Amethyststrider",
  "Amethystborne",
  "Amethystward",
  "Amethystlight",
  "Amethystshadow",
  "Amethystfall",
  "Topazstar",
  "Topazmoon",
  "Topaznight",
  "Topazwind",
  "Topazweaver",
  "Topazshaper",
  "Topazcaller",
  "Topazseeker",
  "Topazwanderer",
  "Topazstrider",
  "Topazborne",
  "Topazward",
  "Topazlight",
  "Topazshadow",
  "Topazfall",
  "Opalstar",
  "Opalmoon",
  "Opalnight",
  "Opalwind",
  "Opalweaver",
  "Opalshaper",
  "Opalcaller",
  "Opalseeker",
  "Opalwanderer",
  "Opalstrider",
  "Opalborne",
  "Opalward",
  "Opallight",
  "Opalshadow",
  "Opalfall",
]);

const NORMALIZED_NOUNS = Object.freeze([
  "Galaxy",
  "Nebula",
  "Reach",
  "Expanse",
  "Crown",
  "Drift",
  "March",
  "Halo",
  "Gate",
  "Cluster",
  "Field",
  "Tide",
  "Fold",
  "Belt",
  "Ring",
  "Spiral",
  "Void",
  "Frontier",
  "Domain",
  "Wastes",
  "Wilds",
  "Depths",
  "Shroud",
]);

const NORMALIZED_OBJECT_NOUNS = Object.freeze({
  generic: NORMALIZED_NOUNS,
  "asteroid-belt": Object.freeze([
    "Belt",
    "Cluster",
    "Field",
    "Zone",
    "Corridor",
    "Band",
    "Ring",
    "Strip",
    "Reach",
    "Drift",
    "Shroud",
    "Chain",
    "Arc",
    "Trail",
    "Swarm",
    "Tangle",
    "Stream",
    "Shelf",
    "Spur",
    "Tract",
  ]),
});

const MYTHIC_THEMES = Object.freeze({
  "greco-roman": Object.freeze([
    "Astraeus",
    "Nyx",
    "Hyperion",
    "Selene",
    "Aether",
    "Phoebe",
    "Atlas",
    "Rhea",
    "Cronus",
    "Theia",
    "Oceanus",
    "Tethys",
    "Helios",
    "Eos",
    "Prometheus",
    "Gaia",
    "Uranus",
    "Poseidon",
    "Hades",
    "Zeus",
    "Hera",
    "Demeter",
    "Apollo",
    "Artemis",
    "Ares",
    "Athena",
    "Hephaestus",
    "Hermes",
    "Dionysus",
  ]),
  norse: Object.freeze([
    "Ymir",
    "Bifrost",
    "Skadi",
    "Mimir",
    "Surtur",
    "Freyja",
    "Odin",
    "Thor",
    "Loki",
    "Frigg",
    "Tyr",
    "Balder",
    "Hel",
    "Njord",
    "Idunn",
    "Bragi",
    "Hodr",
    "Vidar",
    "Valkyrie",
  ]),
  mesopotamian: Object.freeze([
    "Tiamat",
    "Ishtar",
    "Marduk",
    "Nammu",
    "Enlil",
    "Anu",
    "Enki",
    "Ninurta",
    "Ereshkigal",
    "Utu",
    "Inanna",
    "Dumuzi",
    "Ninhursag",
    "Ashur",
    "Adad",
    "Sin",
  ]),
  egyptian: Object.freeze([
    "Ra",
    "Nut",
    "Osiris",
    "Sekhmet",
    "Hathor",
    "Anubis",
    "Isis",
    "Set",
    "Bastet",
    "Horus",
    "Sobek",
    "Thoth",
    "Nephthys",
    "Ptah",
    "Amun",
    "Ma'at",
  ]),
});

const MYTHIC_SUFFIXES = Object.freeze(["Expanse", "Crown", "Reach", "Fold", "Drift", "Cluster"]);

const PHONOTACTIC_STYLES = Object.freeze({
  normalized: Object.freeze([
    "sol",
    "ter",
    "vex",
    "kesh",
    "zar",
    "mor",
    "vel",
    "dar",
    "lun",
    "cor",
    "xen",
    "lyr",
    "quar",
    "zen",
    "tor",
    "nex",
    "sil",
    "vor",
    "eli",
    "sha",
    "qun",
    "tara",
  ]),
  mythic: Object.freeze([
    "ae",
    "thy",
    "ion",
    "ra",
    "nes",
    "ur",
    "os",
    "met",
    "an",
    "is",
    "th",
    "el",
    "ka",
    "or",
    "en",
    "al",
    "ar",
    "ze",
    "va",
    "ni",
  ]),
  phonotactic: Object.freeze([
    "sha",
    "vor",
    "eli",
    "qun",
    "tara",
    "zen",
    "cor",
    "lyr",
    "sil",
    "nex",
    "tor",
    "xen",
    "sol",
    "ter",
    "vex",
    "kesh",
    "zar",
    "mor",
    "vel",
    "dar",
    "lun",
  ]),
});

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function titleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ensureObjectSuffix(value, objectType = "generic") {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return "";
  }

  const nouns = NORMALIZED_OBJECT_NOUNS[objectType] || NORMALIZED_OBJECT_NOUNS.generic;
  const lowerValue = normalizedValue.toLowerCase();
  const hasKnownSuffix = nouns.some((noun) => lowerValue.endsWith(` ${String(noun).toLowerCase()}`));
  if (hasKnownSuffix) {
    return normalizedValue;
  }

  return `${normalizedValue} ${sample(nouns)}`;
}

function buildNormalizedGalaxyName() {
  return `${sample(NORMALIZED_ADJECTIVES)} ${sample(NORMALIZED_NOUNS)}`;
}

function buildNormalizedObjectName(objectType = "generic") {
  const nouns = NORMALIZED_OBJECT_NOUNS[objectType] || NORMALIZED_OBJECT_NOUNS.generic;
  return ensureObjectSuffix(`${sample(NORMALIZED_ADJECTIVES)} ${sample(nouns)}`, objectType);
}

function buildPhonotacticObjectName(objectType = "generic", style = "phonotactic") {
  const nouns = NORMALIZED_OBJECT_NOUNS[objectType] || NORMALIZED_OBJECT_NOUNS.generic;
  const stem = generatePhonotacticName({ style, syllablesMin: 2, syllablesMax: 3 });
  return ensureObjectSuffix(`${stem} ${sample(nouns)}`, objectType);
}

function buildMythicObjectName(objectType = "generic", theme = "all") {
  const nouns = NORMALIZED_OBJECT_NOUNS[objectType] || NORMALIZED_OBJECT_NOUNS.generic;
  const pool = theme && theme !== "all" ? MYTHIC_THEMES[theme] : Object.values(MYTHIC_THEMES).flat();
  return ensureObjectSuffix(
    `${sample(pool && pool.length ? pool : Object.values(MYTHIC_THEMES).flat())} ${sample(nouns)}`,
    objectType,
  );
}

function buildMythicGalaxyName(theme) {
  const pool = theme && theme !== "all" ? MYTHIC_THEMES[theme] : Object.values(MYTHIC_THEMES).flat();
  return `${sample(pool && pool.length ? pool : Object.values(MYTHIC_THEMES).flat())} ${sample(MYTHIC_SUFFIXES)}`;
}

export function generateGalaxyName({ mode = "normalized", mythicTheme = "all", avoid = "" } = {}) {
  const blocked = String(avoid || "")
    .trim()
    .toLowerCase();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    let nextName = "";
    if (mode === "mythic") {
      nextName = buildMythicGalaxyName(mythicTheme);
    } else if (mode === "phonotactic") {
      nextName = generatePhonotacticName({ style: "phonotactic", syllablesMin: 2, syllablesMax: 4 });
    } else {
      nextName = buildNormalizedGalaxyName();
    }

    if (nextName && nextName.toLowerCase() !== blocked) {
      return titleCase(nextName);
    }
  }

  return blocked ? `${titleCase(blocked)} Nova` : buildNormalizedGalaxyName();
}

export function generateNormalizedObjectName({ objectType = "generic", avoid = "" } = {}) {
  const blocked = String(avoid || "")
    .trim()
    .toLowerCase();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const nextName = ensureObjectSuffix(buildNormalizedObjectName(objectType), objectType);
    if (nextName && nextName.toLowerCase() !== blocked) {
      return titleCase(nextName);
    }
  }

  return blocked
    ? titleCase(ensureObjectSuffix(titleCase(blocked), objectType))
    : titleCase(ensureObjectSuffix(buildNormalizedObjectName(objectType), objectType));
}

export function generatePhonotacticObjectName({ objectType = "generic", style = "phonotactic", avoid = "" } = {}) {
  const blocked = String(avoid || "")
    .trim()
    .toLowerCase();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const nextName = ensureObjectSuffix(buildPhonotacticObjectName(objectType, style), objectType);
    if (nextName && nextName.toLowerCase() !== blocked) {
      return titleCase(nextName);
    }
  }

  return blocked
    ? titleCase(ensureObjectSuffix(titleCase(blocked), objectType))
    : titleCase(ensureObjectSuffix(buildPhonotacticObjectName(objectType, style), objectType));
}

export function generateMythicObjectName({ objectType = "generic", theme = "all", avoid = "" } = {}) {
  const blocked = String(avoid || "")
    .trim()
    .toLowerCase();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const nextName = ensureObjectSuffix(buildMythicObjectName(objectType, theme), objectType);
    if (nextName && nextName.toLowerCase() !== blocked) {
      return titleCase(nextName);
    }
  }

  return blocked
    ? titleCase(ensureObjectSuffix(titleCase(blocked), objectType))
    : titleCase(ensureObjectSuffix(buildMythicObjectName(objectType, theme), objectType));
}

export function generateObjectName({
  mode = "normalized",
  objectType = "generic",
  mythicTheme = "all",
  avoid = "",
} = {}) {
  if (mode === "phonotactic") {
    return generatePhonotacticObjectName({ objectType, avoid });
  }
  if (mode === "mythic") {
    return generateMythicObjectName({ objectType, theme: mythicTheme, avoid });
  }
  return generateNormalizedObjectName({ objectType, avoid });
}

export function generatePhonotacticName({ style = "normalized", syllablesMin = 2, syllablesMax = 4 } = {}) {
  const syllables = PHONOTACTIC_STYLES[style] || PHONOTACTIC_STYLES.normalized;
  const minCount = Math.max(1, Number(syllablesMin) || 2);
  const maxCount = Math.max(minCount, Number(syllablesMax) || minCount);
  const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;

  let name = "";
  for (let i = 0; i < count; i += 1) {
    name += sample(syllables);
  }

  return titleCase(name);
}
