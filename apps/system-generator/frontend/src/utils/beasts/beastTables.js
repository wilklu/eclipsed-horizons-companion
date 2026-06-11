export const GRAVITY_MODIFIERS = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 1,
  A: 1,
  B: 1,
  C: 1,
  D: 2,
  E: 2,
  F: 2,
};

export const TERRAIN_LOCOMOTION_TABLE = {
  Clear: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Rough: ["Amphib", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Woods: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  "Wet Woods": ["Amphib", "Walker", "Walker", "Walker", "Triphib", "Flyphib"],
  "Rough Woods": ["Amphib", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Reserve: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Mountain: ["Walker", "Walker", "Walker", "Walker", "Flyer", "Static"],
  Desert: ["Walker", "Walker", "Walker", "Walker", "Flyer", "Static"],
  Caverns: ["Amphib", "Walker", "Walker", "Walker", "Swimmer", "Static"],
  Crater: ["Walker", "Walker", "Walker", "Walker", "Flyer", "Flyer"],
  Wasteland: ["Walker", "Walker", "Walker", "Walker", "Flyer", "Flyer"],
  Mines: ["Amphib", "Walker", "Walker", "Walker", "Swimmer", "Static"],
  Islands: ["Amphib", "Walker", "Walker", "Flyer", "Flyer", "Swimmer"],
  Shore: ["Amphib", "Walker", "Walker", "Flyer", "Triphib", "Swimmer"],
  "Ice Field": ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Icecap: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Glacier: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Exotic: ["Aquatic", "Walker", "Walker", "Walker", "Flyer", "Flyphib"],
  Abyss: ["Diver", "Diver", "Diver", "Drifter", "Drifter", "Static"],
  "Ocean Depths": ["Aquatic", "Aquatic", "Diver", "Diver", "Diver", "Drifter"],
  Ocean: ["Flyphib", "Swimmer", "Swimmer", "Aquatic", "Aquatic", "Drifter"],
  River: ["Aquatic", "Aquatic", "Swimmer", "Swimmer", "Triphib", "Flyphib"],
  Lake: ["Aquatic", "Amphib", "Swimmer", "Diver", "Triphib", "Triphib"],
  Wetland: ["Amphib", "Amphib", "Walker", "Walker", "Flyer", "Triphib"],
  "Baked lands": ["Walker", "Walker", "Walker", "Walker", "Flyer", "Static"],
  Twilight: ["Walker", "Walker", "Walker", "Walker", "Flyer", "Flyer"],
  "Frozen Lands": ["Walker", "Walker", "Walker", "Walker", "Flyer", "Static"],
  Volcano: ["Walker", "Walker", "Flyer", "Flyer", "Drifter", "Static"],
  Chasm: ["Walker", "Walker", "Walker", "Flyer", "Flyer", "Static"],
  Precipice: ["Walker", "Walker", "Walker", "Flyer", "Flyer", "Static"],
  City: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Suburbs: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Town: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Rural: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Croplands: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
  Starport: ["Walker", "Walker", "Walker", "Walker", "Walker", "Flyer"],
};

export const ECOLOGICAL_NICHE_TABLE = {
  "-5": {
    niche: "Producer",
    subniches: {
      Herbivore: "Filter",
      Omnivore: "Eater",
      Carnivore: "Trapper",
      Scavenger: "Hijacker",
      Producer: "Basker",
    },
  },
  "-4": {
    niche: "Herbivore",
    subniches: {
      Herbivore: "Filter",
      Omnivore: "Eater",
      Carnivore: "Trapper",
      Scavenger: "Hijacker",
      Producer: "Basker",
    },
  },
  "-3": {
    niche: "Herbivore",
    subniches: {
      Herbivore: "Intermittent",
      Omnivore: "Gatherer",
      Carnivore: "Trapper",
      Scavenger: "Hijacker",
      Producer: "Basker",
    },
  },
  "-2": {
    niche: "Omnivore",
    subniches: {
      Herbivore: "Intermittent",
      Omnivore: "Gatherer",
      Carnivore: "Siren",
      Scavenger: "Intimidator",
      Producer: "Basker",
    },
  },
  "-1": {
    niche: "Omnivore",
    subniches: {
      Herbivore: "Intermittent",
      Omnivore: "Gatherer",
      Carnivore: "Pouncer",
      Scavenger: "CarrionEater",
      Producer: "Basker",
    },
  },
  0: {
    niche: "Omnivore",
    subniches: {
      Herbivore: "Grazer",
      Omnivore: "Hunter/Gatherer",
      Carnivore: "Chaser",
      Scavenger: "Intimidator",
      Producer: "Collector",
    },
  },
  1: {
    niche: "Omnivore",
    subniches: {
      Herbivore: "Grazer",
      Omnivore: "Hunter",
      Carnivore: "Pouncer",
      Scavenger: "CarrionEater",
      Producer: "Collector",
    },
  },
  2: {
    niche: "Omnivore",
    subniches: {
      Herbivore: "Grazer",
      Omnivore: "Hunter",
      Carnivore: "Siren",
      Scavenger: "Intimidator",
      Producer: "Collector",
    },
  },
  3: {
    niche: "Carnivore",
    subniches: {
      Herbivore: "Grazer",
      Omnivore: "Hunter",
      Carnivore: "Killer",
      Scavenger: "Reducer",
      Producer: "Collector",
    },
  },
  4: {
    niche: "Carnivore",
    subniches: {
      Herbivore: "Intermittent",
      Omnivore: "Eater",
      Carnivore: "Killer",
      Scavenger: "Reducer",
      Producer: "Basker",
    },
  },
  5: {
    niche: "Scavenger",
    subniches: {
      Herbivore: "Filter",
      Omnivore: "Eater",
      Carnivore: "Killer",
      Scavenger: "Reducer",
      Producer: "Basker",
    },
  },
};

export const REACTION_TABLE = {
  Collector: { attack: "No", flee: "No" },
  Basker: { attack: "No", flee: "No" },
  Filter: { attack: "P", flee: 12 },
  Grazer: { attack: 10, flee: 10 },
  Intermittent: { attack: 11, flee: 11 },
  Hunter: { attack: 14, flee: 10 },
  "Hunter/Gatherer": { attack: 12, flee: 11 },
  Gatherer: { attack: 11, flee: 12 },
  Eater: { attack: 14, flee: 10 },
  Trapper: { attack: "S", flee: 12 },
  Siren: { attack: "S", flee: 12 },
  Chaser: { attack: 10, flee: 10 },
  Pouncer: { attack: "S", flee: "S+" },
  Killer: { attack: 14, flee: 9 },
  Intimidator: { attack: 12, flee: 11 },
  Hijacker: { attack: 13, flee: 11 },
  CarrionEater: { attack: 12, flee: 12 },
  Reducer: { attack: 12, flee: 12 },
};

export const QUANTITY_TABLE = {
  "-5": { label: "Solitary", formula: "1" },
  "-4": { label: "Single", formula: "1" },
  "-3": { label: "Pair", formula: "1/2D" },
  "-2": { label: "Small Group", formula: "1D" },
  "-1": { label: "Large Group", formula: "1D+2" },
  0: { label: "Pack", formula: "2D" },
  1: { label: "Small Herd", formula: "3D" },
  2: { label: "Large Herd", formula: "4D" },
  3: { label: "Small Swarm", formula: "6D" },
  4: { label: "Large Swarm", formula: "8D" },
  5: { label: "Hive", formula: "2D*2D" },
};

export const SIZE_TABLE = {
  "-6": { size: 1, label: "Tiny", measure: "0.7 cm" },
  "-5": { size: 1, label: "Tiny", measure: "0.7 cm" },
  "-4": { size: 2, label: "Very Small", measure: "7.5 cm" },
  "-3": { size: 2, label: "Very Small", measure: "7.5 cm" },
  "-2": { size: 3, label: "Small", measure: "20 cm" },
  "-1": { size: 3, label: "Small", measure: "20 cm" },
  0: { size: 4, label: "Typical", measure: "75 cm" },
  1: { size: 4, label: "Typical", measure: "75 cm" },
  2: { size: 5, label: "Large", measure: "1.5 m" },
  3: { size: 5, label: "Large", measure: "1.5 m" },
  4: { size: 6, label: "Very Large", measure: "7.5 m" },
  5: { size: 6, label: "Very Large", measure: "7.5 m" },
  6: { size: 7, label: "Gigantic", measure: "75 m" },
};

export const SPEED_TABLE = {
  0: { speedC: "Static", kph: 0 },
  1: { speedC: "Walk", kph: 5 },
  2: { speedC: "Run", kph: 10 },
  3: { speedC: "Sprint", kph: 20 },
  4: { speedC: "Charge", kph: 30 },
  5: { speedC: "Fast", kph: 50 },
  6: { speedC: "V Fast", kph: 100 },
  7: { speedC: "V Fast", kph: 200 },
  8: { speedC: "X Fast", kph: 300 },
};

export const SPEED_BANDS = {
  Static: { attack: "Static", burst: "Static" },
  Walk: { attack: "Run", burst: "Sprint" },
  Run: { attack: "Sprint", burst: "Charge" },
  Sprint: { attack: "Charge", burst: "Fast" },
  Charge: { attack: "Fast", burst: "V Fast" },
  Fast: { attack: "V Fast", burst: "X Fast" },
  "V Fast": { attack: "X Fast", burst: "X Fast" },
  "X Fast": { attack: "X Fast", burst: "X Fast" },
};

export const WEAPON_TABLE = {
  "-6": "Claws",
  "-5": "Claws",
  "-4": "Sting",
  "-3": "Tusks",
  "-2": "Tusks",
  "-1": "Teeth",
  0: "Peds",
  1: "Body",
  2: "Horns",
  3: "Horns",
  4: "Spikes",
  5: "Spikes",
  6: "Body",
};

export const ARMOR_TABLE = {
  "-5": "1D RadProof",
  "-4": "4D Armor",
  "-3": "1D FlashProof",
  "-2": "2D Sealed",
  "-1": "1D Sealed",
  0: "2D Armor",
  1: "1D Insulated",
  2: "2D Insulated",
  3: "1D SoundProof",
  4: "3D Armor",
  5: "1D PsiShield",
};

export const FAUNA_HABITAT_TABLE = {
  aquatic: ["reef ledges", "kelp corridors", "tidal channels", "submerged shelf forests"],
  forest: ["canopy layers", "leaf-litter understories", "root tangles", "shadowed glades"],
  arid: ["rocky washes", "dune breaks", "salt flats", "burrowed heat refuges"],
  frozen: ["ice ridges", "snow tunnels", "wind-swept shelves", "thermal vent margins"],
  cavern: ["echoing chambers", "mossed tunnels", "limestone vaults", "deep fracture networks"],
  highland: ["wind-cut cliffs", "plateau ledges", "alpine scree", "ridge-top hollows"],
  urban: ["service ducts", "abandoned structures", "roofline roosts", "flooded underways"],
  general: ["open plains", "mixed terrain margins", "scrubland edges", "adaptive border habitats"],
};

export const FAUNA_BEHAVIOR_TABLE = {
  Producer: [
    "sessile colony feeding",
    "sun-tracking basking",
    "distributed nutrient collection",
    "slow territorial growth",
  ],
  Herbivore: ["foraging herd movement", "selective grazing", "browse-and-withdraw feeding", "seasonal migration"],
  Omnivore: ["opportunistic ranging", "adaptive scavenging", "mixed foraging cycles", "variable social probing"],
  Carnivore: ["ambush pursuit", "pack hunting", "territorial stalking", "high-risk predation"],
  Scavenger: ["carcass recovery", "signal-following feeding", "territorial salvage", "opportunistic theft"],
  general: ["cautious ranging", "territorial observation", "flexible local adaptation", "small-group movement"],
};

export const FAUNA_SENSORY_TABLE = {
  Walker: [
    "broad-spectrum motion vision",
    "close-range scent mapping",
    "ground vibration awareness",
    "temperature contrast reading",
  ],
  Swimmer: ["pressure-wave detection", "current tracing", "low-light lateral sensing", "dissolved-odor tracking"],
  Flyer: ["long-range horizon sight", "air-current reading", "rapid depth judgment", "distant motion tracking"],
  Aquatic: ["pressure-wave detection", "current tracing", "low-light lateral sensing", "dissolved-odor tracking"],
  Producer: ["light-gradient sensing", "humidity tracking", "pollinator timing sense", "chemical drift awareness"],
  general: ["motion vision", "odor tracking", "sound triangulation", "electrostatic awareness"],
};

export const FAUNA_ADAPTATION_TABLE = {
  aquatic: [
    "streamlined locomotion",
    "hydrodynamic surfaces",
    "pressure-tolerant tissues",
    "filtering respiratory folds",
  ],
  forest: ["camouflage striping", "climbing grip structures", "shade-tuned pigmentation", "soft-signal communication"],
  arid: ["heat-dispersing hide", "water-saving metabolism", "burrow-refuge behavior", "reflective surface layers"],
  frozen: [
    "insulating fat reserves",
    "cold-shielded tissues",
    "antifreeze biochemistry",
    "low-surface-area extremities",
  ],
  cavern: ["low-light sensory organs", "echo mapping", "pale or reduced pigmentation", "vibration-sensitive limbs"],
  highland: ["oxygen-efficient respiration", "balance-assist limbs", "wind-resistant build", "compact frame stability"],
  urban: ["climbing claws", "tight-space maneuvering", "communal alert systems", "opportunistic shelter use"],
  general: ["generalist physiology", "seasonal flexibility", "behavioral plasticity", "mixed-terrain tolerance"],
};

export const DEFAULT_TERRAINS = Object.keys(TERRAIN_LOCOMOTION_TABLE);
export const DEFAULT_PRIMARY_NICHES = ["Producer", "Herbivore", "Omnivore", "Carnivore", "Scavenger"];
