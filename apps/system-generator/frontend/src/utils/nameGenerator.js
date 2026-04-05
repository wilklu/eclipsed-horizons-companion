const NORMALIZED_ADJECTIVES = Object.freeze([
  "Ancient",
  "Distant",
  "Whirling",
  "Grand",
  "Silent",
  "Radiant",
  "Outer",
  "Veiled",
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

function buildNormalizedGalaxyName() {
  return `${sample(NORMALIZED_ADJECTIVES)} ${sample(NORMALIZED_NOUNS)}`;
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
