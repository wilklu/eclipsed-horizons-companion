/**
 * Star Generator - Phase 1 of System Generation
 * Step 1: Determine primary star type and class
 * Reference: World Builder's Handbook Chapter 2: Stars, Pages 15-18
 */

const { DiceRoller } = require("./utils/dice.js");
const starTypeTable = require("./data/starTypeDetermination.json");
const starSubtypeTable = require("./data/starSubtypeDetermination.json");

class StarGenerator {
  constructor(seed = null) {
    this.roller = new DiceRoller(seed);
    this.seed = this.roller.getSeed();
    this.generationLog = []; // Track all rolls for reproducibility
  }

  /**
   * STEP 1: Determine primary star type and class
   * Reference: Handbook pages 15-18
   *
   * Process:
   * 1a. Roll 2D on Star Type Determination table (with cascading columns)
   * 1b. Get numeric subtype (0-9) from Star Subtype table
   * 1c. Combine to get spectral classification (e.g., G7 V)
   * 1d-1e. Determine mass, diameter, luminosity, temperature
   */

  generatePrimaryStar() {
    const steps = {
      step1a: null,
      step1b: null,
      step1c: null,
      step1d: null,
      step1e: null,
    };

    // ✅ DECLARE LUMINOSITY CLASS AT FUNCTION LEVEL (near top)
    let luminosityClass = "V"; // Default to main sequence
    let cascadePath = [];

    // STEP 1A: Initial roll on Type column
    const initialTypeRoll = this.roller.roll2D();
    let tableEntry = this.getTableEntry(initialTypeRoll);
    let finalType = tableEntry.type;

    this.generationLog.push({
      step: "1A-Initial",
      action: "Roll 2D for initial star type",
      roll: initialTypeRoll,
      result: finalType,
    });

    // CASCADE CHAIN: Handle forward-only cascading
    if (finalType === "Special") {
      
      cascadePath.push("Type");

      // Roll on Special column
      const specialRoll = this.roller.roll2D();
      tableEntry = this.getTableEntry(specialRoll);
      const specialClassString = tableEntry.special; // This is "Class VI", "Class IV", etc.

      this.generationLog.push({
        step: "1A-Special",
        action: "Special column cascade",
        roll: specialRoll,
        result: specialClassString,
      });

      cascadePath.push("Special");

      // ✅ UPDATE THE FUNCTION-LEVEL VARIABLE
      luminosityClass = this.extractClassFromString(specialClassString);

      // ✅ NOW ROLL ON TYPE COLUMN WITH DM+1
      const typeRoll = this.roller.roll2D() + 1;
      tableEntry = this.getTableEntry(typeRoll);
      finalType = tableEntry.type; // ← This is the SPECTRAL TYPE ("G", "K", etc.)

      this.generationLog.push({
        step: "1A-Special-Type",
        action: "Type column roll (DM+1) for Special",
        roll: typeRoll,
        result: finalType,
        luminosityClass: luminosityClass,
      });

      cascadePath.push("Type-DM+1");
    }

    // If Special roll is 2, cascade to Unusual
    if (finalType === "Unusual") {
      const unusualRoll = this.roller.roll2D();
      tableEntry = this.getTableEntry(unusualRoll);
      const unusualClassString = tableEntry.unusual; // This is "Class VI", "Class IV", etc.

      this.generationLog.push({
        step: "1A-Unusual",
        action: "Unusual column cascade (from Special)",
        roll: unusualRoll,
        result: unusualClassString,
      });

      cascadePath.push("Unusual");

      // ✅ UPDATE THE FUNCTION-LEVEL VARIABLE
      luminosityClass = this.extractClassFromString(unusualClassString);

      // ✅ NOW ROLL ON TYPE COLUMN WITH DM+1
      const typeRoll = this.roller.roll2D() + 1;
      tableEntry = this.getTableEntry(typeRoll);
      finalType = tableEntry.type; // ← This is the SPECTRAL TYPE ("G", "K", etc.)

      this.generationLog.push({
        step: "1A-Unusual-Type",
        action: "Type column roll (DM+1) for Unusual",
        roll: typeRoll,
        result: finalType,
        luminosityClass: luminosityClass,
      });

      cascadePath.push("Type-DM+1");
    }
    // If Unusual roll is 2, cascade to Peculiar
    if (finalType === "Peculiar") {
      const peculiarRoll = this.roller.roll2D();
      tableEntry = this.getTableEntry(peculiarRoll);
      finalType = tableEntry.peculiar;

      this.generationLog.push({
        step: "1A-Peculiar",
        action: "Peculiar column cascade (from Unusual)",
        roll: peculiarRoll,
        result: finalType,
      });

      cascadePath.push("Peculiar");
    }

    // Check if cascade stopped at Giants (Special roll 11-12)
    else if (finalType === "Giants") {
      const giantsRoll = this.roller.roll2D();
      tableEntry = this.getTableEntry(giantsRoll);
      const giantsClassString = tableEntry.giants; // This is "Class III", "Class II", etc.

      this.generationLog.push({
        step: "1A-Giants",
        action: "Giants column cascade",
        roll: giantsRoll,
        result: giantsClassString,
      });

      cascadePath.push("Giants");

      // ✅ UPDATE THE FUNCTION-LEVEL VARIABLE
      luminosityClass = this.extractClassFromString(giantsClassString);

      // ✅ NOW ROLL ON TYPE COLUMN WITH DM+1
      const typeRoll = this.roller.roll2D() + 1;
      tableEntry = this.getTableEntry(typeRoll);
      finalType = tableEntry.type; // ← This is the SPECTRAL TYPE ("G", "K", etc.)

      this.generationLog.push({
        step: "1A-Giants-Type",
        action: "Type column roll (DM+1) for Giants",
        roll: typeRoll,
        result: finalType,
        luminosityClass: luminosityClass,
      });

      cascadePath.push("Type-DM+1");
    }

    // Handle Hot column rolls (12+)
    if (finalType === "Hot") {
      const hotRoll = this.roller.roll2D();
      const hotResult = this.lookupStarTypeHot(hotRoll);
      finalType = hotResult.type;

      this.generationLog.push({
        step: "1A-Hot",
        action: "Hot column lookup (from 12+ initial roll)",
        roll: hotRoll,
        result: finalType,
      });

      cascadePath.push("Hot");
    }

    steps.step1a = {
      initialRoll: initialTypeRoll,
      cascadePath: cascadePath,
      finalResult: finalType,
    };

    // Handle peculiar types
    const peculiarTypes = ["Black Hole", "Neutron Star", "Pulsar", "Protostar", "Nebula", "Star Cluster", "Anomaly"];

    if (peculiarTypes.includes(finalType)) {
      const peculiarStar = this.handlePeculiarType(finalType);

      this.generationLog.push({
        step: "1D-Peculiar",
        action: "Peculiar star type detected",
        cascadePath: cascadePath,
        type: finalType,
      });

      return {
        seed: this.seed,
        generationLog: this.generationLog,
        id: 1,
        component: "Primary",
        classification: peculiarStar.classification,
        type: finalType,
        cascadePath: cascadePath,
        isPeculiar: true,
        ...peculiarStar,
        createdAt: new Date().toISOString(),
      };
    }

    // STEP 1B: Roll for numeric subtype
    const subtypeRoll = this.roller.roll2D();
    let subtypeResult = this.lookupSubtype(subtypeRoll, finalType);

    // ✅ APPLY CLASS IV M-TYPE ADJUSTMENT[^6]
    if (luminosityClass === "IV" && finalType === "M") {
      const originalSubtype = subtypeResult.subtype;
      subtypeResult.subtype = Math.min(9, subtypeResult.subtype + 5);

      this.generationLog.push({
        step: "1B-Class-IV-M",
        action: "Class IV M-type: added 5 to subtype (range limit)",
        originalSubtype: originalSubtype,
        adjustedSubtype: subtypeResult.subtype,
      });
    }

    steps.step1b = { roll: subtypeRoll, result: subtypeResult };

    // STEP 1C: Combine to get spectral classification
    // ✅ USE THE TRACKED LUMINOSITY CLASS
    const spectralClassification = `${finalType}${subtypeResult.subtype} ${luminosityClass}`;

    this.generationLog.push({
      step: "1C",
      action: "Combine into spectral classification",
      classification: spectralClassification,
      luminosityClass: luminosityClass,
    });

    steps.step1c = { classification: spectralClassification };

    // STEP 1D: Get star properties
    const properties = this.getStarProperties(finalType, subtypeResult.subtype);

    this.generationLog.push({
      step: "1D",
      action: "Look up star properties",
      properties: {
        mass: properties.mass.toFixed(2),
        diameter: properties.diameter.toFixed(2),
        luminosity: properties.luminosity.toFixed(3),
      },
    });

    steps.step1d = { properties: properties };

    // Determine system age
    const age = this.roller._random() * properties.mainSequenceLifespan;

    const primaryStar = {
      seed: this.seed,
      generationLog: this.generationLog,
      id: 1,
      component: "Primary",
      classification: spectralClassification,
      spectralClass: finalType,
      spectralSubtype: subtypeResult.subtype,
      luminosityClass: luminosityClass,
      cascadePath: cascadePath,
      mass: properties.mass,
      diameter: properties.diameter,
      radius: properties.diameter / 2,
      luminosity: properties.luminosity,
      temperature: properties.temperature,
      mainSequenceLifespan: properties.mainSequenceLifespan,
      age: age,
      habitableZoneInner: Math.sqrt(properties.luminosity) * 0.7,
      habitableZoneOuter: Math.sqrt(properties.luminosity) * 1.5,
      variance: 0,
      createdAt: new Date().toISOString(),
    };

    return primaryStar;
  }

  /**
   * Get the table entry for a 2D roll
   * Handles edge cases: 2- and 12+
   * Reference: Handbook page 16
   */
  getTableEntry(roll2d) {
    const table = starTypeTable.StarTypeDetermination.table;

    let entry;
    if (roll2d <= 2) {
      entry = table.find((e) => e.roll === "2-");
    } else if (roll2d >= 12) {
      entry = table.find((e) => e.roll === "12+");
    } else {
      entry = table.find((e) => e.roll === roll2d);
    }

    if (!entry) {
      throw new Error(`Invalid roll on Star Type Determination table: ${roll2d}`);
    }

    // ✅ Validate that Type column contains only spectral types
    const validTypes = ["O", "B", "A", "F", "G", "K", "M", "Hot", "Special"];
    if (!validTypes.includes(entry.type)) {
      throw new Error(
        `Invalid spectral type in table for roll ${roll2d}: "${entry.type}". ` +
          `Type column should only contain O, B, A, F, G, K, M, Hot, or Special.`,
      );
    }

    return entry;
  }

  /**
   * Look up star type from Hot column (when 12+ is rolled)
   * Reference: Handbook page 16
   */
  lookupStarTypeHot(roll2d) {
    // For Hot column rolls, we need to map the roll to a Hot type
    // The Hot column contains: A, A, A, A, A, A, A, A, B, B, O
    const hotMappings = {
      2: "A",
      3: "A",
      4: "A",
      5: "A",
      6: "A",
      7: "A",
      8: "A",
      9: "A",
      10: "B",
      11: "B",
      12: "O",
    };

    const hotType = hotMappings[roll2d] || hotMappings[12];

    return {
      type: hotType,
      description: `Hot column result from 2D roll of ${roll2d}`,
      roll: roll2d,
    };
  }

  /**
   * STEP 1B: Look up subtype from Star Subtype Determination Table
   * Reference: Handbook page 17, Star Subtype table
   */
  lookupSubtype(roll2d, spectralClass) {
    const table = starSubtypeTable.StarSubtypeDetermination.table;

    const entry = table.find((e) => e.roll === roll2d);

    if (!entry) {
      throw new Error(`Invalid subtype roll: ${roll2d}`);
    }

    // For M-type primaries, use the mType column; otherwise use numeric
    const subtype = spectralClass === "M" ? entry.mType : entry.numeric;

    // Special case: K-type Class IV stars subtract 5 if result > 4
    // (We'll handle this later when we know the luminosity class)

    return {
      subtype: subtype,
      roll: roll2d,
      column: spectralClass === "M" ? "M-type" : "Numeric",
      description: entry.description,
    };
  }

  /**
   * STEP 1D: Get star properties from the spectral class and subtype
   * Reference: Handbook page 18, Star Mass and Temperature by Class table
   */
  getStarProperties(spectralClass, subtype) {
    // Star properties table by class and subtype
    // Values for subtypes 0, 5, and (9 for M-type)
    // We interpolate between known values
    const starPropertiesTable = {
      O: {
        0: { mass: 60, diameter: 17.8, luminosity: 1400000, temperature: 54000, mainSequenceLifespan: 0.002 },
        5: { mass: 47, diameter: 12.5, luminosity: 400000, temperature: 43500, mainSequenceLifespan: 0.002 },
      },
      B: {
        0: { mass: 17.8, diameter: 7.2, luminosity: 20000, temperature: 30000, mainSequenceLifespan: 0.01 },
        5: { mass: 14, diameter: 5.5, luminosity: 4500, temperature: 15500, mainSequenceLifespan: 0.01 },
      },
      A: {
        0: { mass: 2.1, diameter: 1.86, luminosity: 67, temperature: 10000, mainSequenceLifespan: 0.42 },
        5: { mass: 1.9, diameter: 1.74, luminosity: 31, temperature: 8400, mainSequenceLifespan: 0.42 },
      },
      F: {
        0: { mass: 1.46, diameter: 1.43, luminosity: 6.5, temperature: 7500, mainSequenceLifespan: 2.1 },
        5: { mass: 1.35, diameter: 1.28, luminosity: 2.9, temperature: 6500, mainSequenceLifespan: 2.1 },
      },
      G: {
        0: { mass: 1.1, diameter: 1.15, luminosity: 1.5, temperature: 6000, mainSequenceLifespan: 10 },
        5: { mass: 1.0, diameter: 1.05, luminosity: 0.88, temperature: 5500, mainSequenceLifespan: 10 },
      },
      K: {
        0: { mass: 0.78, diameter: 0.92, luminosity: 0.4, temperature: 5200, mainSequenceLifespan: 56 },
        5: { mass: 0.71, diameter: 0.85, luminosity: 0.2, temperature: 4700, mainSequenceLifespan: 56 },
      },
      M: {
        0: { mass: 0.51, diameter: 0.72, luminosity: 0.081, temperature: 3800, mainSequenceLifespan: 200 },
        5: { mass: 0.42, diameter: 0.62, luminosity: 0.03, temperature: 3400, mainSequenceLifespan: 200 },
        9: { mass: 0.33, diameter: 0.51, luminosity: 0.01, temperature: 2700, mainSequenceLifespan: 200 },
      },
    };

    // Interpolate properties based on subtype
    const classTable = starPropertiesTable[spectralClass];
    if (!classTable) {
      throw new Error(`Unknown spectral class: ${spectralClass}`);
    }

    let properties;

    if (subtype === 0 && classTable[0]) {
      properties = classTable[0];
    } else if (subtype === 5 && classTable[5]) {
      properties = classTable[5];
    } else if (subtype === 9 && classTable[9]) {
      properties = classTable[9]; // For M-types
    } else {
      // Interpolate between known values
      properties = this.interpolateProperties(classTable, subtype, spectralClass);
    }

    return properties;
  }

  /**
   * Interpolate star properties between known subtypes
   */
  interpolateProperties(classTable, subtype, spectralClass) {
    let lower, upper, lowerSubtype, upperSubtype;

    // Find bounding subtypes
    if (spectralClass === "M" && subtype > 5) {
      lowerSubtype = 5;
      upperSubtype = 9;
      lower = classTable[5];
      upper = classTable[9];
    } else {
      lowerSubtype = 0;
      upperSubtype = 5;
      lower = classTable[0];
      upper = classTable[5];
    }

    // Linear interpolation
    const ratio = (subtype - lowerSubtype) / (upperSubtype - lowerSubtype);

    return {
      mass: lower.mass + (upper.mass - lower.mass) * ratio,
      diameter: lower.diameter + (upper.diameter - lower.diameter) * ratio,
      luminosity: lower.luminosity + (upper.luminosity - lower.luminosity) * ratio,
      temperature: lower.temperature + (upper.temperature - lower.temperature) * ratio,
      mainSequenceLifespan: lower.mainSequenceLifespan,
    };
  }

  /**
   * Get the generation log (all rolls made)
   */
  getGenerationLog() {
    return this.generationLog;
  }

  /**
   * Get the seed for reproducibility
   */
  getSeed() {
    return this.seed;
  }

  /**
   * Handle Peculiar Column results (Black Hole, Neutron Star, etc.)
   * Reference: Handbook page 219+ (Special Circumstances chapter)
   */
  handlePeculiarType(peculiarType) {
    // Peculiar types don't have standard spectral properties
    // They require special handling per Handbook page 219+

    switch (peculiarType) {
      case "Black Hole":
        return this.generateBlackHole();

      case "Neutron Star":
        return this.generateNeutronStar();

      case "Pulsar":
        return this.generatePulsar();

      case "Protostar":
        return this.generateProtostar();

      case "Nebula":
        return this.generateNebula();

      case "Star Cluster":
        return this.generateStarCluster();

      case "Anomaly":
        return this.generateAnomaly();

      default:
        throw new Error(`Unknown peculiar type: ${peculiarType}`);
    }
  }

  /**
   * Generate Black Hole properties
   * Reference: Handbook page 229 - Black Hole Characteristics
   * Black Hole Diameter = 5.9km x Mass (☉)
   */
  generateBlackHole() {
    // Black hole mass: 2.1 + 1D - 1 + (continue rolling on 6)
    let mass = 2.1;
    let diceRoll = this.roller.roll1D();
    mass += diceRoll - 1;

    // Continue rolling if we get a 6
    while (diceRoll === 6) {
      diceRoll = this.roller.roll1D();
      mass += diceRoll;
    }

    this.generationLog.push({
      step: "1D (Black Hole)",
      action: "Generate Black Hole mass",
      roll: `See log for individual 1D rolls`,
      mass: mass,
    });

    const diameter = 5.9 * mass; // in kilometers

    // Black holes don't radiate heat by definition[^1]
    // Accretion disk may generate EM radiation but no standard temperature
    const luminosity = 0; // Referee can set as needed
    const temperature = 0; // No radiated heat

    return {
      type: "Black Hole",
      classification: "BH",
      mass: mass, // Solar masses (M☉)
      diameter: diameter, // kilometers
      luminosity: luminosity, // L☉
      temperature: temperature, // K (none - no radiation)
      isDeadStar: true,
      jumpRestriction: true, // DM-4 per Handbook[^5]
      jumpDM: -4,
      habitableZoneInner: 0,
      habitableZoneOuter: 0,
      note: "Dead star - see Special Circumstances chapter page 219+",
    };
  }

  /**
   * Generate Neutron Star properties
   * Reference: Handbook page 228-229 - Dead Stars
   */
  generateNeutronStar() {
    const diameter = 0.000015; // ≈ 20.87 kilometers[^6]

    // Neutron star initial temperature is very high but cools rapidly
    // Start at 1 million degrees, use White Dwarf aging table with modifications
    const initialTemperature = 1000000; // K

    this.generationLog.push({
      step: "1D (Neutron Star)",
      action: "Generate Neutron Star",
      diameter: `${diameter} (≈20.87 km)`,
      initialTemp: initialTemperature,
    });

    return {
      type: "Neutron Star",
      classification: "NS",
      mass: null, // Can vary, typically 1.4-2.0 M☉
      diameter: diameter, // Solar diameters
      diameterKm: 20.87, // kilometers
      luminosity: 0, // Minimal - cools over time
      temperature: initialTemperature, // K (initial, then ages)
      isDeadStar: true,
      isPulsar: false,
      jumpRestriction: true, // DM-4 per Handbook[^5]
      jumpDM: -4,
      habitableZoneInner: 0,
      habitableZoneOuter: 0,
      note: "Dead star - very hot initially, cools over time. See page 228-229",
    };
  }

  /**
   * Generate Pulsar (spinning neutron star)
   * Reference: Handbook page 229
   */
  generatePulsar() {
    const neutronStar = generateNeutronStar();

    this.generationLog.push({
      step: "1D (Pulsar)",
      action: "Generate Pulsar (spinning neutron star)",
      spinRate: "High (variable)",
    });

    return {
      ...neutronStar,
      type: "Pulsar",
      classification: "PSR",
      isPulsar: true,
      hazard: "High spin rate + frame dragging effects",
      jumpDM: -4, // DM-4 due to frame dragging[^5]
      note: "Pulsar detected by radiation, not heat. See page 229",
    };
  }

  /**
   * Generate Protostar
   * Reference: Handbook page 17-18 - Protostars
   */
  generateProtostar() {
    this.generationLog.push({
      step: "1D (Protostar)",
      action: "Generate Protostar - early star formation phase",
    });

    // Roll again on Type column with DM+1 (but avoid O-type)
    const typeRoll = roller.roll2D() + 1; // DM+1
    let tableEntry = getTableEntry(typeRoll);
    let prototypeStar = tableEntry.type;

    // Change O-type to B-type[^4]
    if (prototypeStar === "O") {
      prototypeStar = "B";
      this.generationLog.push({
        step: "1D (Protostar)",
        action: "O-type changed to B-type (O-types pass through protostar phase too quickly)",
        result: "B-type",
      });
    }

    return {
      type: "Protostar",
      classification: `${prototypeStar} (Protostar)`,
      prototypeStar: prototypeStar,
      age: roller.roll2D() / 10, // 10 million years ÷ 2d10
      isProtostar: true,
      characteristics: "Chaotic radiation/temperature fluctuations, protoplanetary rings, may be in nebula",
      note: "See page 17-18. If primary is protostar, all companions are also protostars.",
    };
  }

  /**
   * Generate Nebula
   * Reference: Handbook page 17 - Nebulas
   */
  generateNebula() {
    generationLog.push({
      step: "1D (Nebula)",
      action: "Generate Nebula - dense interstellar gas region",
    });

    return {
      type: "Nebula",
      classification: "Nebula",
      characteristics: "Dense region of interstellar gas",
      subtypes: [
        "Planetary nebula (around white dwarf)",
        "Black cloud (contracting to form star)",
        "Emission nebula",
        "Reflection nebula",
      ],
      size: "May span multiple hexes",
      note: "See page 17. Referee determines specific characteristics.",
    };
  }

  /**
   * Generate Star Cluster
   * Reference: Handbook page 18 - Star Clusters
   */
  generateStarCluster() {
    this.generationLog.push({
      step: "1D (Star Cluster)",
      action: "Generate Star Cluster - dense star nursery",
    });

    return {
      type: "Star Cluster",
      classification: "Cluster",
      characteristics: "Dense nursery of stars",
      contents: ["May include nebula", "Protostars", "Main sequence stars", "Giant stars", "Brown dwarfs"],
      quantity: "Dozens to hundreds of members",
      size: "Within 1 parsec or multi-parsec region",
      note: "See page 18. Complex system generation.",
    };
  }

  /**
   * Generate Anomaly - Referee choice
   * Reference: Handbook page 18 - Anomalies
   */
  generateAnomaly() {
    this.generationLog.push({
      step: "1D (Anomaly)",
      action: "Generate Anomaly - Referee discretion",
    });

    return {
      type: "Anomaly",
      classification: "Anomaly",
      examples: [
        "Hypothetical exotic stars (quark, strange, electroweak, dark matter)",
        "Alien megastructures",
        "Wormholes",
        "Star gods",
        "Other exotic phenomena",
      ],
      note: "See page 18. Referee determines specific nature and properties.",
    };
  }

  /**
   * Get valid mass range for a star type
   * Reference: Handbook page 18-19 - Star Mass and Temperature by Class
   */
  getMassRangeForType(starType) {
    const massRanges = {
      O: { min: 18, max: 200, description: "Blue supergiant to blue star" },
      B: { min: 2.1, max: 17.8, description: "Blue star" },
      A: { min: 1.4, max: 2.1, description: "White star" },
      F: { min: 1.04, max: 1.46, description: "Yellow-white star" },
      G: { min: 0.8, max: 1.1, description: "Yellow star" },
      K: { min: 0.45, max: 0.78, description: "Orange star" },
      M: { min: 0.08, max: 0.51, description: "Red dwarf" },
    };

    return massRanges[starType] || null;
  }

  /**
   * Validate star mass is within expected range
   */
  validateStarMass(star) {
    if (star.isPeculiar) {
      // Peculiar stars have their own mass rules[^2,^6]
      const peculiarRules = {
        "Black Hole": { min: 2.1, validationNote: "Mass determined by 2.1 + 1D continuing" },
        "Neutron Star": { min: 1.4, max: 2.0, validationNote: "Typical neutron star mass" },
        Pulsar: { min: 1.4, max: 2.0, validationNote: "Spinning neutron star mass" },
        Protostar: { validationNote: "Mass determined by parent type with +50% variance" },
        Nebula: { validationNote: "No discrete mass - distributed region" },
        "Star Cluster": { validationNote: "No single mass - multiple members" },
        Anomaly: { validationNote: "Referee discretion" },
      };

      return {
        valid: true,
        type: "peculiar",
        note: peculiarRules[star.type]?.validationNote || "Special handling required",
      };
    }

    // Standard spectral class validation[^11]
    const range = this.getMassRangeForType(star.spectralClass);

    if (!range) {
      return {
        valid: false,
        error: `Unknown spectral class: ${star.spectralClass}`,
      };
    }

    const isValid = star.mass >= range.min && star.mass <= range.max;

    return {
      valid: isValid,
      mass: star.mass,
      expectedRange: range,
      error: isValid ? null : `Mass ${star.mass} outside range ${range.min}-${range.max}`,
    };
  }

  /**
   * Determine if system has multiple stars
   * Reference: Handbook page 23 - Multiple Stars Presence table
   */
  determineMultipleStars() {
    // Roll on Multiple Stars table based on primary star type
    const roll2D = this.roller.roll2D();

    // Apply DM based on primary star spectral class
    let dm = 0;
    const primaryClass = this.primaryStar.spectralClass;

    // Different star types have different tendencies for companions
    if (["O", "B", "A"].includes(primaryClass)) {
      dm = 1; // Hot stars more likely to have companions
    } else if (["M"].includes(primaryClass)) {
      dm = -1; // M-type stars less likely
    }

    const result = roll2D + dm;

    return {
      hasMultipleStars: result >= 8,
      roll: roll2D,
      dm: dm,
      total: result,
    };
  }

  // Add this helper method
  extractClassFromString(classString) {
    // Extract "III" from "Class III", etc.
    const match = classString.match(/Class\s+([IVabi]+)/);
    return match ? match[1] : "V";
  }
}

module.exports = StarGenerator;
