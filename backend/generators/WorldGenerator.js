/**
 * World Generator - Phase 2 of System Generation
 * Step 2: Generate planets, moons, and other orbital bodies
 * Reference: World Builder's Handbook Chapter 3: Worlds and Orbits, Pages 37-60
 */

const { DiceRoller } = require("./utils/dice.js");

class WorldGenerator {
  constructor(starSystem, seed = null) {
    this.starSystem = starSystem; // Complete star system from Phase 1
    this.roller = new DiceRoller(seed);
    this.seed = this.roller.getSeed();
    this.generationLog = [];

    // World collections
    this.gasGiants = [];
    this.planetoidBelts = [];
    this.terrestrialPlanets = [];
    this.allWorlds = [];
    this.worldMap = {}; // Orbit -> World mapping
  }

  /**
   * MAIN ENTRY POINT: Generate all worlds for the system
   */
  generateWorlds() {
    try {
      console.log("\n=== PHASE 2: WORLD GENERATION ===\n");

      // Step 1: Determine world type counts
      this.determineWorldCounts();

      // Step 2: Calculate habitable zone
      this.calculateHabitableZone();

      // Step 3: Determine orbital structure
      this.determineOrbitStructure();

      // Step 4: Place worlds in orbits
      this.placeWorlds();

      // Step 5: Generate world characteristics
      this.generateWorldCharacteristics();

      // ✅ NEW: Step 6B: Generate planetary moons
      this.generatePlanetaryMoons();

      // Step 6: Determine mainworld
      this.determineMainworld();

      this.generationLog.push({
        step: "Phase 2 Complete",
        action: "World generation complete",
        totalWorlds: this.allWorlds.length,
        totalMoons: this.allWorlds.reduce((sum, w) => sum + (w.moons?.length || 0), 0),
      });

      return this.buildSystemWithWorlds();
    } catch (error) {
      console.error("Error in generateWorlds():", error);
      this.generationLog.push({
        step: "Error",
        error: error.message,
      });
      return null;
    }
  }

  /**
   * STEP 1: Determine world type counts
   * Reference: Handbook pages 37-40
   *
   * Process:
   * 1a. Determine gas giant (GG) presence: 9- roll for each (9+)
   * 1b. Determine planetoid belt (PB) presence: 8+ for each
   * 1c. Determine terrestrial planet (TP) quantity: 2D-2 + DMs
   */
  determineWorldCounts() {
    console.log("STEP 1: Determine World Type Counts");

    const primary = this.starSystem.primaryStar;
    let dmGasGiant = 0;
    let dmPlanetoidBelt = 0;
    let dmTerrestrial = 0;

    // ✅ Apply DMs based on primary star
    // Class III/IV primaries: DM+1 to gas giant presence
    if (["III", "IV"].includes(primary.luminosityClass)) {
      dmGasGiant = 1;
      this.generationLog.push({
        step: "1A-DM-GasGiant",
        reason: `Primary is Class ${primary.luminosityClass}`,
        dm: dmGasGiant,
      });
    }

    // Brown Dwarfs: DM-2 to all world types
    if (primary.type === "Brown Dwarf") {
      dmGasGiant = -2;
      dmPlanetoidBelt = -2;
      dmTerrestrial = -2;
      this.generationLog.push({
        step: "1A-DM-BrownDwarf",
        reason: "Primary is Brown Dwarf",
        dm: -2,
      });
    }

    // 1A: Gas Giants - Roll 2D for EACH potential gas giant
    let gasGiantCount = 0;
    let ggRoll = this.roller.roll2D() + dmGasGiant;

    if (ggRoll >= 9) {
      gasGiantCount = 1;
      // Check for additional gas giants with cumulative penalty
      let checkRoll = this.roller.roll2D() - 2; // DM-2 for each additional
      while (checkRoll >= 9) {
        gasGiantCount++;
        checkRoll = this.roller.roll2D() - 2;
      }
    }

    this.gasGiants = Array(gasGiantCount)
      .fill(null)
      .map((_, i) => ({
        id: `GG${i + 1}`,
        index: i + 1,
        type: "Gas Giant",
        size: null, // Will be determined later
      }));

    this.generationLog.push({
      step: "1A-GasGiants",
      action: "Determine gas giant quantity",
      roll: ggRoll,
      dm: dmGasGiant,
      count: gasGiantCount,
    });

    // 1B: Planetoid Belts - Roll 2D for EACH potential belt
    let planetoidBeltCount = 0;
    let pbRoll = this.roller.roll2D() + dmPlanetoidBelt;

    if (pbRoll >= 8) {
      planetoidBeltCount = 1;
      // Check for additional belts
      let checkRoll = this.roller.roll2D() - 2; // DM-2 for each additional
      while (checkRoll >= 8) {
        planetoidBeltCount++;
        checkRoll = this.roller.roll2D() - 2;
      }
    }

    this.planetoidBelts = Array(planetoidBeltCount)
      .fill(null)
      .map((_, i) => ({
        id: `PB${i + 1}`,
        index: i + 1,
        type: "Planetoid Belt",
      }));

    this.generationLog.push({
      step: "1B-PlanetoidBelts",
      action: "Determine planetoid belt quantity",
      roll: pbRoll,
      dm: dmPlanetoidBelt,
      count: planetoidBeltCount,
    });

    // 1C: Terrestrial Planets - Roll 2D-2 + DMs
    const tpRoll = this.roller.roll2D();
    let terrestrialCount = tpRoll - 2 + dmTerrestrial;
    terrestrialCount = Math.max(0, terrestrialCount); // Cannot be negative

    // If mainworld exists and is a terrestrial planet, ensure at least 1
    if (terrestrialCount === 0 && this.starSystem.primaryStar) {
      terrestrialCount = 1;
      this.generationLog.push({
        step: "1C-MinimumTerrestrial",
        reason: "Mainworld guarantee",
        adjustment: "+1",
      });
    }

    this.terrestrialPlanets = Array(terrestrialCount)
      .fill(null)
      .map((_, i) => ({
        id: `TP${i + 1}`,
        index: i + 1,
        type: "Terrestrial Planet",
        size: null,
        atmosphere: null,
        hydrographics: null,
      }));

    this.generationLog.push({
      step: "1C-TerrestrialPlanets",
      action: "Determine terrestrial planet quantity",
      roll: tpRoll,
      dm: dmTerrestrial,
      count: terrestrialCount,
    });

    console.log(`  Gas Giants: ${gasGiantCount}`);
    console.log(`  Planetoid Belts: ${planetoidBeltCount}`);
    console.log(`  Terrestrial Planets: ${terrestrialCount}`);

    this.allWorlds = [...this.gasGiants, ...this.planetoidBelts, ...this.terrestrialPlanets];
  }

  /**
   * STEP 2: Calculate Habitable Zone
   * Reference: Handbook pages 41-43
   *
   * The habitable zone is where liquid water can exist on a world
   * Inner boundary: ~0.7 AU from star (where water vaporizes)
   * Outer boundary: ~1.5 AU from star (where water freezes)
   *
   * Formula adjusts based on star's luminosity
   */
  calculateHabitableZone() {
    console.log("\nSTEP 2: Calculate Habitable Zone");

    const primary = this.starSystem.primaryStar;
    const luminosity = primary.luminosity;

    // Habitable zone based on luminosity[^5]
    // Inner boundary = sqrt(Luminosity) × 0.7 AU
    // Outer boundary = sqrt(Luminosity) × 1.5 AU
    const hzInner = Math.sqrt(luminosity) * 0.7;
    const hzOuter = Math.sqrt(luminosity) * 1.5;

    // Convert AU to Orbit# (simplified: Orbit# ≈ AU)
    // For detailed calculation, see Handbook page 42-43
    const hzCenterOrbit = this.auToOrbitNumber(Math.sqrt(hzInner * hzOuter));

    this.habitableZone = {
      innerAU: hzInner,
      outerAU: hzOuter,
      centerOrbit: hzCenterOrbit,
      breadth: hzOuter - hzInner,
      primaryStar: primary.id,
    };

    this.generationLog.push({
      step: "2-HabitableZone",
      action: "Calculate habitable zone",
      luminosity: luminosity,
      innerAU: hzInner.toFixed(2),
      outerAU: hzOuter.toFixed(2),
      centerOrbit: hzCenterOrbit.toFixed(2),
    });

    console.log(`  Habitable Zone Center Orbit: ${hzCenterOrbit.toFixed(2)}`);
    console.log(`  Range: ${hzInner.toFixed(2)} - ${hzOuter.toFixed(2)} AU`);
  }

  /**
   * STEP 3: Determine Orbital Structure
   * Reference: Handbook pages 44-50
   *
   * Creates orbital slots where worlds can be placed
   * Must avoid:
   * - Too close to star (Roche limit)
   * - Overlapping with binary companion orbits
   * - Unstable zones in multi-star systems
   */
  determineOrbitStructure() {
    console.log("\nSTEP 3: Determine Orbital Structure");

    const primary = this.starSystem.primaryStar;

    // Minimum allowable orbit based on star class[^2]
    const mao = this.getMinimumAllowableOrbit(primary);

    // Maximum orbit before hitting binary companion
    const maxOrbit = this.getMaximumAllowableOrbit(primary);

    // Calculate spread for orbital distribution[^6]
    const spread = this.calculateSpread(mao, maxOrbit);

    this.orbitalStructure = {
      minimumAllowableOrbit: mao,
      maximumAllowableOrbit: maxOrbit,
      spread: spread,
      availableOrbits: this.generateAvailableOrbits(mao, maxOrbit, spread),
      primaryStar: primary.id,
    };

    this.generationLog.push({
      step: "3-OrbitalStructure",
      action: "Determine orbital structure",
      mao: mao.toFixed(3),
      maxOrbit: maxOrbit.toFixed(2),
      spread: spread.toFixed(2),
      availableOrbits: this.orbitalStructure.availableOrbits.length,
    });

    console.log(`  Minimum Allowable Orbit: ${mao.toFixed(3)}`);
    console.log(`  Maximum Allowable Orbit: ${maxOrbit.toFixed(2)}`);
    console.log(`  Orbital Spread: ${spread.toFixed(2)}`);
  }

  /**
   * STEP 4: Place worlds in orbital slots
   * Reference: Handbook page 51-52
   */
  placeWorlds() {
    console.log("\nSTEP 4: Place Worlds in Orbits");

    if (this.allWorlds.length === 0) {
      console.log("  No worlds to place");
      return;
    }

    const availableOrbits = this.orbitalStructure.availableOrbits;

    // Shuffle worlds randomly
    const worldsToPlace = [...this.allWorlds].sort(() => Math.random() - 0.5);

    worldsToPlace.forEach((world, index) => {
      if (index < availableOrbits.length) {
        const orbit = availableOrbits[index];
        world.orbit = orbit;
        world.orbitNumber = orbit;
        this.worldMap[orbit] = world;

        this.generationLog.push({
          step: "4-PlaceWorld",
          world: world.id,
          type: world.type,
          orbit: orbit.toFixed(2),
        });
      }
    });

    console.log(`  Placed ${Math.min(worldsToPlace.length, availableOrbits.length)} of ${worldsToPlace.length} worlds`);
  }

  /**
   * STEP 5: Generate world characteristics
   * Size, Atmosphere, Hydrographics for terrestrial worlds
   */
  generateWorldCharacteristics() {
    console.log("\nSTEP 5: Generate World Characteristics");

    // Gas Giants - Determine size (Large, Medium, Small)
    this.gasGiants.forEach((gg, idx) => {
      const sizeRoll = this.roller.roll2D();
      let size;
      if (sizeRoll <= 4) size = "Large";
      else if (sizeRoll <= 9) size = "Medium";
      else size = "Small";

      gg.size = size;
      this.generationLog.push({
        step: "5-GasGiant",
        world: gg.id,
        roll: sizeRoll,
        size: size,
      });
    });

    console.log(`  Gas Giants: ${this.gasGiants.map((g) => g.size).join(", ")}`);

    // Terrestrial Planets - Full characteristics
    this.terrestrialPlanets.forEach((tp, idx) => {
      // Size: 2D
      const sizeRoll = this.roller.roll2D();
      tp.size = sizeRoll;

      // Atmosphere: 2D - 7 + size DM
      const atmRoll = this.roller.roll2D();
      const atmCode = this.getAtmosphereCode(atmRoll, tp.size);
      tp.atmosphere = atmCode;

      // Hydrographics: 2D - 7 + atmosphere DM
      const hydroRoll = this.roller.roll2D();
      const hydro = this.getHydrographicsCode(hydroRoll, atmCode);
      tp.hydrographics = hydro;

      this.generationLog.push({
        step: "5-TerrestrialPlanet",
        world: tp.id,
        size: tp.size,
        atmosphere: tp.atmosphere,
        hydrographics: tp.hydrographics,
      });
    });

    console.log(
      `  Terrestrial Planets: ${this.terrestrialPlanets
        .map((p) => `${p.id}(${p.size}/${p.atmosphere}/${p.hydrographics})`)
        .join(", ")}`,
    );
  }

  /**
   * STEP 6: Determine mainworld
   * Reference: Handbook pages 133-134
   *
   * Mainworld candidates:
   * - Highest habitability rating
   * - In or near habitable zone
   * - With liquid water (Hydrographics A or higher)
   */
  determineMainworld() {
    console.log("\nSTEP 6: Determine Mainworld");

    let mainworld = null;
    let maxHabitability = -999;

    // Score each terrestrial planet
    this.terrestrialPlanets.forEach((tp) => {
      const habitability = this.calculateHabitability(tp);

      if (habitability > maxHabitability) {
        maxHabitability = habitability;
        mainworld = tp;
      }

      this.generationLog.push({
        step: "6-HabitabilityScore",
        world: tp.id,
        size: tp.size,
        atmosphere: tp.atmosphere,
        hydrographics: tp.hydrographics,
        score: habitability,
      });
    });

    if (mainworld) {
      mainworld.isMainworld = true;
      console.log(`  Mainworld selected: ${mainworld.id}`);
      console.log(
        `  Size: ${mainworld.size}, Atmosphere: ${mainworld.atmosphere}, Hydrographics: ${mainworld.hydrographics}`,
      );
    } else {
      console.log("  No suitable mainworld found");
    }

    this.mainworld = mainworld;
  }

  /**
   * STEP 6B: Generate Significant Moons for Worlds
   * Reference: Handbook pages 55-78 - Significant Moons and Rings
   *
   * Process:
   * 6a. Determine quantity of moons
   * 6b. Determine moon sizes
   * 6c. Determine moon orbital positions
   * 6d. Calculate moon orbital periods
   * 6e. Determine eccentricity and retrograde orbits
   */
  generatePlanetaryMoons() {
    console.log("\nSTEP 6B: Generate Planetary Moons");

    // Generate moons for all worlds
    this.terrestrialPlanets.forEach((planet, idx) => {
      this.generateMoonsForWorld(planet, "terrestrial");
    });

    this.gasGiants.forEach((gg, idx) => {
      this.generateMoonsForWorld(gg, "gasGiant");
    });

    this.generationLog.push({
      step: "6B-Moons-Complete",
      action: "Planetary moons generated for all worlds",
      totalMoons: this.allWorlds.reduce((sum, w) => sum + (w.moons?.length || 0), 0),
    });

    console.log(`  Total moons generated: ${this.allWorlds.reduce((sum, w) => sum + (w.moons?.length || 0), 0)}`);
  }

  /**
   * Generate moons for a specific world
   * Reference: Handbook pages 56-57 - Significant Moon Quantity table
   */
  generateMoonsForWorld(world, worldType) {
    // Step 1: Determine quantity of significant moons[^12]
    const moonQuantity = this.determineMoonQuantity(world, worldType);

    if (moonQuantity <= 0) {
      world.moons = [];
      world.hasRings = moonQuantity === 0; // 0 indicates ring, not moon
      return;
    }

    // Step 2: Generate moons with sizes
    world.moons = [];
    for (let i = 0; i < moonQuantity; i++) {
      const moon = this.generateMoon(world, i + 1, worldType);
      if (moon) {
        world.moons.push(moon);
      }
    }

    // Step 3: Determine orbit positions (Planetary Diameters)
    this.determineMoonOrbits(world);

    // Step 4: Calculate orbital periods
    this.calculateMoonOrbitalPeriods(world);

    // Step 5: Determine eccentricity and retrograde orbits[^6,^8]
    this.determineMoonOrbitalCharacteristics(world);

    this.generationLog.push({
      step: "6B-WorldMoons",
      world: world.id,
      moonCount: world.moons.length,
      hasRings: world.hasRings || false,
    });
  }

  /**
   * Determine moon quantity for a world
   * Reference: Handbook page 56 - Significant Moon Quantity table
   */
  determineMoonQuantity(world, worldType) {
    let diceRoll;
    let dm = 0;

    // Apply DMs based on orbit and stellar proximity[^12]
    if (world.orbit && world.orbit < 1.0) {
      dm = -1; // Planet's Orbit# is less than 1.0
    }

    // Roll based on world type[^12]
    if (worldType === "terrestrial") {
      if (world.size >= 1 && world.size <= 2) {
        diceRoll = this.roller.roll1D() - 5;
      } else if (world.size >= 3 && world.size <= 9) {
        diceRoll = this.roller.roll2D() - 8;
      } else if (world.size >= 10) {
        // Size A-F (large terrestrial)
        diceRoll = this.roller.roll2D() - 6;
      }
    } else if (worldType === "gasGiant") {
      const ggSize = world.size; // "Large", "Medium", "Small"

      if (ggSize === "Small") {
        diceRoll = this.roller.roll3D() - 7;
      } else if (ggSize === "Medium") {
        diceRoll = this.roller.roll4D() - 6;
      } else {
        // Large
        diceRoll = this.roller.roll4D() - 6;
      }
    }

    const totalMoons = Math.max(-1, diceRoll + dm);

    this.generationLog.push({
      step: "6B-MoonQuantity",
      world: world.id,
      type: worldType,
      roll: diceRoll,
      dm: dm,
      total: totalMoons,
    });

    return totalMoons;
  }

  /**
   * Generate individual moon
   * Reference: Handbook pages 57-58 - Significant Moon Sizing table
   */
  generateMoon(world, moonIndex, worldType) {
    const sizeRoll = this.roller.roll1D();
    let moonSize;

    if (sizeRoll >= 1 && sizeRoll <= 3) {
      // Size S moon (400-800 km diameter)
      moonSize = "S";
    } else if (sizeRoll >= 4 && sizeRoll <= 5) {
      // Moderate sized moon - roll 2D-1
      const modRoll = this.roller.roll2D() - 1;
      if (modRoll === 0) {
        moonSize = "R"; // Ring instead
        world.hasRings = true;
        return null; // Don't add as moon
      } else {
        moonSize = modRoll.toString(); // Size 1-2
      }
    } else if (sizeRoll === 6) {
      // Larger moon
      if (worldType === "terrestrial") {
        // Roll 1D and subtract from parent Size-1
        const largeRoll = this.roller.roll1D();
        const result = world.size - 1 - largeRoll;

        if (result < 0) {
          moonSize = "S"; // Size S moon
        } else if (result === 0) {
          moonSize = "R"; // Ring
          world.hasRings = true;
          return null;
        } else {
          moonSize = result.toString();
        }
      } else if (worldType === "gasGiant") {
        // Gas Giant Special Moon Sizing[^14]
        const specialRoll = this.roller.roll1D();

        if (specialRoll >= 1 && specialRoll <= 3) {
          // Determine size 1-6
          const sizeRoll2 = this.roller.roll1D();
          moonSize = sizeRoll2.toString();
        } else if (specialRoll >= 4 && specialRoll <= 5) {
          // Determine size 0-A
          const sizeRoll2 = this.roller.roll2D() - 2;
          if (sizeRoll2 === 0) {
            moonSize = "R";
            world.hasRings = true;
            return null;
          } else {
            moonSize = Math.max(0, sizeRoll2).toString();
          }
        } else if (specialRoll === 6) {
          // Determine size 6-G (potential Small gas giant moon!)
          const sizeRoll2 = this.roller.roll2D() + 4;
          if (sizeRoll2 >= 16) {
            moonSize = "GS"; // Small gas giant moon
          } else {
            moonSize = Math.min(15, sizeRoll2).toString();
          }
        }
      }
    }

    return {
      id: `${world.id}${String.fromCharCode(97 + moonIndex - 1)}`, // a, b, c, etc.
      designation: String.fromCharCode(97 + moonIndex - 1),
      parentWorld: world.id,
      index: moonIndex,
      type: "Moon",
      size: moonSize,
      orbit: null, // Will be calculated
      orbitPD: null, // In Planetary Diameters
      eccentricity: 0,
      isRetrograde: false,
      orbitalPeriod: null, // In hours
      orbitalPeriodDays: null,
      characteristics: {},
    };
  }

  /**
   * Determine Hill Sphere and calculate moon orbit range
   * Reference: Handbook pages 75-77 - Moon Orbit Limits
   */
  calculateMoonOrbitLimits(world) {
    // Hill Sphere depends on world mass and star distance
    // Simplified calculation: Hill Sphere (PD) = (world mass / star mass)^(1/3) × world diameter / star distance

    const planetDiameter = world.diameter || 12800; // Default Earth-like in km

    // Simplified: Assume star mass = 1 solar mass, planet distance = 1 AU
    // Real formula requires more precise calculations
    const hillSpherePD = Math.pow(0.000003, 1 / 3) * (planetDiameter / 12800) * 5000;

    // Roche Limit (typically 1.5 PD for most compositions)[^5]
    const rocheLimitPD = 1.5;

    // Moon Orbit Range = Hill Sphere - Roche Limit
    const mor = Math.max(0, Math.floor(hillSpherePD) - Math.ceil(rocheLimitPD));

    return {
      hillSpherePD: hillSpherePD,
      rocheLimitPD: rocheLimitPD,
      moonOrbitRange: mor,
    };
  }

  /**
   * Determine orbital positions for moons
   * Reference: Handbook pages 77-78 - Moon Orbit Determination
   */
  determineMoonOrbits(world) {
    if (!world.moons || world.moons.length === 0) {
      return;
    }

    // Calculate limits
    const limits = this.calculateMoonOrbitLimits(world);
    const mor = limits.moonOrbitRange;

    if (mor < 1.5) {
      // Below Roche limit - no moons can exist
      world.moons = [];
      return;
    }

    // Cap MOR if it's too large[^5]
    let cappedMOR = mor;
    if (mor > 200) {
      cappedMOR = 200 + world.moons.length;
    }

    // Divide into orbital ranges[^2,^5]
    const innerRangeEnd = cappedMOR / 6; // Inner sixth
    const middleRangeEnd = innerRangeEnd + cappedMOR / 3; // Middle third
    const outerRangeEnd = cappedMOR; // Outer half

    // Assign orbits to each moon
    world.moons.forEach((moon, idx) => {
      // Determine which orbit range[^2]
      let dm = cappedMOR < 60 ? 1 : 0; // DM+1 if MOR < 60
      const rangeRoll = this.roller.roll1D() + dm;

      let orbitPD;
      let orbitRange;

      if (rangeRoll <= 3) {
        // Inner range
        orbitRange = "Inner";
        const spreadRoll = this.roller.roll2D() - 2;
        orbitPD = (spreadRoll * cappedMOR) / 60 + 2;
      } else if (rangeRoll <= 5) {
        // Middle range
        orbitRange = "Middle";
        const spreadRoll = this.roller.roll2D() - 2;
        orbitPD = (spreadRoll * cappedMOR) / 30 + cappedMOR / 6 + 3;
      } else {
        // Outer range
        orbitRange = "Outer";
        const spreadRoll = this.roller.roll2D() - 2;
        orbitPD = (spreadRoll * cappedMOR) / 20 + cappedMOR / 2 + 4;
      }

      moon.orbitPD = Math.max(2, Math.round(orbitPD * 10) / 10); // Round to 1 decimal
      moon.orbitRange = orbitRange;
      moon.orbitKm = moon.orbitPD * (world.diameter || 12800);

      this.generationLog.push({
        step: "6B-MoonOrbit",
        moon: moon.id,
        range: orbitRange,
        orbitPD: moon.orbitPD,
        rangeRoll: rangeRoll,
        dm: dm,
      });
    });

    // Sort moons by orbit distance (closest first)
    world.moons.sort((a, b) => a.orbitPD - b.orbitPD);

    // Re-assign designations (a=closest, b=next, etc.)
    world.moons.forEach((moon, idx) => {
      moon.designation = String.fromCharCode(97 + idx);
      moon.id = `${world.id}${moon.designation}`;
    });
  }

  /**
   * Calculate orbital periods for moons
   * Reference: Handbook page 78 - Period of a Moon's Orbit
   */
  calculateMoonOrbitalPeriods(world) {
    if (!world.moons || world.moons.length === 0) {
      return;
    }

    // Moon orbital period formula[^6]
    // Period (hours) = 0.176927 × sqrt((PD × Size)³ ÷ Mp)
    // Where PD = orbital distance in planetary diameters
    //       Size = planet size in Earth diameters
    //       Mp = planet mass in Earth masses

    const planetSize = world.size || 1; // Default to Earth-like
    const planetMass = world.mass || 1; // Default to Earth mass

    world.moons.forEach((moon) => {
      if (moon.orbitPD) {
        // Calculate period
        const numerator = Math.pow(moon.orbitPD * planetSize, 3);
        const divisor = planetMass;
        const periodHours = 0.176927 * Math.sqrt(numerator / divisor);

        moon.orbitalPeriod = Math.round(periodHours * 100) / 100; // In hours
        moon.orbitalPeriodDays = Math.round((periodHours / 24) * 100) / 100; // In days

        this.generationLog.push({
          step: "6B-MoonPeriod",
          moon: moon.id,
          orbitPD: moon.orbitPD,
          periodHours: moon.orbitalPeriod,
          periodDays: moon.orbitalPeriodDays,
        });
      }
    });
  }

  /**
   * Determine eccentricity and retrograde orbits
   * Reference: Handbook page 78 - Eccentricity and Orbital Direction
   */
  determineMoonOrbitalCharacteristics(world) {
    if (!world.moons || world.moons.length === 0) {
      return;
    }

    world.moons.forEach((moon) => {
      // Determine eccentricity[^8]
      const eccentricityRoll = this.roller.roll2D();
      let eccentricityDM = 0;

      if (moon.orbitRange === "Inner") {
        eccentricityDM = -1;
      } else if (moon.orbitRange === "Middle") {
        eccentricityDM = 1;
      } else if (moon.orbitRange === "Outer") {
        eccentricityDM = 4;
      }

      const eccentricityTotal = eccentricityRoll + eccentricityDM;
      moon.eccentricity = eccentricityTotal / 20 + 0.05;
      moon.eccentricity = Math.max(0, Math.min(1, moon.eccentricity)); // Clamp 0-1

      // Determine retrograde orbit[^8]
      const retrogradeRoll = this.roller.roll2D();
      const retrogradeTotal = retrogradeRoll + eccentricityDM;
      moon.isRetrograde = retrogradeTotal >= 10;

      this.generationLog.push({
        step: "6B-OrbitalChar",
        moon: moon.id,
        eccentricityRoll: eccentricityRoll,
        eccentricityDM: eccentricityDM,
        eccentricity: moon.eccentricity.toFixed(3),
        retrogradeRoll: retrogradeRoll,
        isRetrograde: moon.isRetrograde,
      });
    });
  }

  /**
   * Helper: Determine tidal locking status[^3]
   * Reference: Handbook page 107 - Tidal Locking
   */
  determineTidalLocking(moon, parentWorld) {
    const baseDM = 6; // Base DM for locking

    let lockDM = baseDM;

    // Moon orbit greater than 20 PD: DM-PD÷20
    if (moon.orbitPD > 20) {
      lockDM -= Math.floor(moon.orbitPD / 20);
    }

    // Retrograde orbit: DM-2
    if (moon.isRetrograde) {
      lockDM -= 2;
    }

    // Apply parent planet mass DMs[^3]
    const parentMass = parentWorld.mass || 1;
    if (parentMass >= 1 && parentMass < 10) {
      lockDM += 2;
    } else if (parentMass >= 10 && parentMass < 100) {
      lockDM += 4;
    } else if (parentMass >= 100 && parentMass < 1000) {
      lockDM += 6;
    } else if (parentMass >= 1000) {
      lockDM += 8;
    }

    // Roll 2D for tidal locking (10+ means locked)
    const lockRoll = this.roller.roll2D();
    const lockTotal = lockRoll + lockDM;

    return {
      baseDM: baseDM,
      appliedDM: lockDM,
      roll: lockRoll,
      total: lockTotal,
      isLocked: lockTotal >= 10,
    };
  }

  /**
   * Roll 3D (sum of 3d6)
   */
  roll3D() {
    return this.roller.roll1D() + this.roller.roll1D() + this.roller.roll1D();
  }

  /**
   * Roll 4D (sum of 4d6)
   */
  roll4D() {
    return this.roller.roll1D() + this.roller.roll1D() + this.roller.roll1D() + this.roller.roll1D();
  }

  /**
   * Build complete system with worlds
   */
  buildSystemWithWorlds() {
    return {
      ...this.starSystem,
      worldsGenerated: true,
      gasGiants: this.gasGiants,
      planetoidBelts: this.planetoidBelts,
      terrestrialPlanets: this.terrestrialPlanets,
      allWorlds: this.allWorlds,
      habitableZone: this.habitableZone,
      orbitalStructure: this.orbitalStructure,
      mainworld: this.mainworld,
      worldGenerationLog: this.generationLog,
      generatedAt: new Date().toISOString(),
    };
  }

  // ============ HELPER METHODS ============

  /**
   * Convert AU (Astronomical Units) to Orbit# (simplified)
   */
  auToOrbitNumber(au) {
    // Simplified: Orbit# ≈ AU for this approximation
    // Detailed calculation on Handbook page 42-43
    return au;
  }

  /**
   * Get Minimum Allowable Orbit based on star type
   * Reference: Handbook page 44
   */
  getMinimumAllowableOrbit(star) {
    // Rough approximation based on star class
    const spectralClass = star.spectralClass;
    const maoTable = {
      O: 0.1,
      B: 0.1,
      A: 0.08,
      F: 0.06,
      G: 0.04, // Like our Sun
      K: 0.03,
      M: 0.02,
    };
    return maoTable[spectralClass] || 0.04;
  }

  /**
   * Get Maximum Allowable Orbit (before binary companion)
   */
  getMaximumAllowableOrbit(star) {
    // If no companions, allow orbits up to ~40 AU
    // If companions exist, restrict based on companion distance
    const secondaryStars = this.starSystem.secondaryStars || [];

    if (secondaryStars.length === 0) {
      return 40; // No companions, allow far orbits
    }

    // For simplicity, restrict to 10 AU with companions
    return 10;
  }

  /**
   * Calculate orbital spread
   */
  calculateSpread(mao, maxOrbit) {
    // Spread determines how far apart worlds are distributed
    const range = maxOrbit - mao;
    return range / Math.max(1, this.allWorlds.length);
  }

  /**
   * Generate available orbital slots
   */
  generateAvailableOrbits(mao, maxOrbit, spread) {
    const orbits = [];
    let currentOrbit = mao + spread / 2;

    while (currentOrbit < maxOrbit && orbits.length < 20) {
      orbits.push(currentOrbit);
      currentOrbit += spread;
    }

    return orbits;
  }

  /**
   * Get atmosphere code based on size
   */
  getAtmosphereCode(roll, size) {
    const atmRoll = roll - 7 + this.getSizeDM(size);
    const codes = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C"];
    const index = Math.max(0, Math.min(codes.length - 1, atmRoll + 3));
    return codes[index];
  }

  /**
   * Get hydrographics code
   */
  getHydrographicsCode(roll, atmosphere) {
    let hydro = roll - 7;
    if (["0", "1", "X"].includes(atmosphere)) hydro -= 4; // No atmosphere
    hydro = Math.max(0, Math.min(10, hydro));
    return hydro.toString();
  }

  /**
   * Get Size DM for atmosphere rolls
   */
  getSizeDM(size) {
    if (size <= 3) return -2;
    if (size <= 5) return -1;
    if (size <= 8) return 0;
    return 1;
  }

  /**
   * Calculate habitability score for a world
   */
  calculateHabitability(world) {
    let score = 0;

    // Size: Prefer Size 6-9 (Earth-like)
    if (world.size >= 6 && world.size <= 9) score += 2;
    else if (world.size >= 4 && world.size <= 5) score += 1;

    // Atmosphere: Prefer breathable (4-9)
    if (world.atmosphere >= "4" && world.atmosphere <= "9") score += 3;

    // Hydrographics: Prefer water (3-8)
    if (world.hydrographics >= "3" && world.hydrographics <= "8") score += 2;

    return score;
  }
}

module.exports = WorldGenerator;
