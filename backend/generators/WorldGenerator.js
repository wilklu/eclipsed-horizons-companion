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
   * World generation method
   * creation of a worlds for a star system
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

      // Step 6B: Generate planetary moons
      this.generatePlanetaryMoons();

      // Step 6: Determine mainworld
      this.determineMainworld();

      // Phase 3A: Generate atmospheres and hydrographics for terrestrial planets
      this.generateAtmosphereAndHydrographics();

      this.generationLog.push({
        step: "Phase 2 & 3A Complete",
        action: "World generation with atmosphere and hydrographics complete",
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
  //  #region World Generation Steps
  /**Step 1: Determine world type counts
   *
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

  /**Step 2: Calculate Habitable Zone
   *
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

  /**Step 3: Determine Orbital Structure
   *
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

  /** Step 4: Place worlds in orbital slots
   *
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

  /**Step 5: Generate World Characteristics
   *
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

  /**Step 6: Determine Mainworld
   *
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
  // #endregion
  // #region Moon Generation Steps
  /**Step 6B: Generate Significant Moons for Worlds
   *
   * Reference: Handbook pages 55-78 - Significant Moons and Rings
   *
   * Process:
   * a. Determine quantity of moons
   * b. Determine moon sizes
   * c. Determine moon orbital positions
   * d. Calculate moon orbital periods
   * e. Determine eccentricity and retrograde orbits
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

  /**Process: Determine moon quantity for a world
   * Generate moons for a specific world
   * Reference: Handbook pages 56-57 - Significant Moon Quantity table
   */
  generateMoonsForWorld(world, worldType) {
    // Step a: Determine quantity of significant moons[^12]
    const moonQuantity = this.determineMoonQuantity(world, worldType);

    if (moonQuantity <= 0) {
      world.moons = [];
      world.hasRings = moonQuantity === 0; // 0 indicates ring, not moon
      return;
    }

    // Step b: Generate moons with sizes
    world.moons = [];
    for (let i = 0; i < moonQuantity; i++) {
      const moon = this.generateMoon(world, i + 1, worldType);
      if (moon) {
        world.moons.push(moon);
      }
    }

    // Step c: Determine orbit positions (Planetary Diameters)
    this.determineMoonOrbits(world);

    // Step d: Calculate orbital periods
    this.calculateMoonOrbitalPeriods(world);

    // Step e: Determine eccentricity and retrograde orbits[^6,^8]
    this.determineMoonOrbitalCharacteristics(world);

    this.generationLog.push({
      step: "6B-WorldMoons",
      world: world.id,
      moonCount: world.moons.length,
      hasRings: world.hasRings || false,
    });
  }
  // #endregion
  // #region Helper Methods for Moon Generation
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
  // #endregion
  // #region Helper Methods for World Generation
  // ============ HELPER METHODS ============

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
      atmosphereData: this.terrestrialPlanets.map((p) => ({
        world: p.id,
        atmosphereCode: p.atmosphereCode,
        atmosphereType: p.atmosphereType,
        pressure: p.atmospherePressure?.toFixed(2),
        hydrographics: p.hydrographicsCode,
        percent: p.hydrographicsPercent?.toFixed(1),
        breathable: p.isBreathable,
        habitability: p.habitabilityScore,
      })),
      mainworld: this.mainworld,
      worldGenerationLog: this.generationLog,
      generatedAt: new Date().toISOString(),
    };
  }

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
  // #endregion
  // #region Phase 3A: Atmosphere and Hydrographics Generation
  /**
   * PHASE 3A: ATMOSPHERE & HYDROGRAPHICS GENERATION
   * Reference: Handbook pages 78-108 - Atmosphere and Hydrographics
   *
   * Process:
   * 3a.1: Determine atmosphere codes
   * 3a.2: Determine atmosphere pressure & composition (if needed)
   * 3a.3: Determine hydrographics percentage
   * 3a.4: Surface feature distribution
   * 3a.5: Check for runaway greenhouse effect
   * 3a.6: Determine habitability
   */
  generateAtmosphereAndHydrographics() {
    console.log("\n=== PHASE 3A: ATMOSPHERE & HYDROGRAPHICS ===\n");

    // Generate detailed atmosphere for each terrestrial planet
    this.terrestrialPlanets.forEach((planet) => {
      this.generatePlanetAtmosphere(planet);
      this.generatePlanetHydrographics(planet);
      this.determineSurfaceFeatures(planet);
      this.checkRunawayGreenhouse(planet);
      this.calculateHabitability(planet);
    });

    this.generationLog.push({
      step: "Phase 3A Complete",
      action: "Atmosphere and hydrographics generated",
      worldsProcessed: this.terrestrialPlanets.length,
    });

    console.log(`✓ Atmosphere & hydrographics generated for ${this.terrestrialPlanets.length} terrestrial planets`);
  }

  /**
   * Generate atmosphere for a terrestrial planet
   * Reference: Handbook pages 79-95
   */
  generatePlanetAtmosphere(planet) {
    // Step 1: Check if world can have atmosphere[^13]
    if (planet.size === 0 || planet.size === 1 || planet.type === "S") {
      planet.atmosphereCode = 0;
      planet.atmosphereType = "None";
      planet.atmospherePressure = 0;
      return;
    }

    // Step 2: Roll for atmosphere code[^13]
    // Atmosphere Code = 2D-7 + Size
    const atmRoll = this.roller.roll2D();
    let atmDM = 0;

    // Apply modifiers based on world characteristics
    if (planet.size <= 4) {
      // Optional variant: DM-2 for smaller worlds
      atmDM = -2;
      this.generationLog.push({
        step: "3A-AtmDM-SmallWorld",
        world: planet.id,
        dm: atmDM,
        reason: "Size 2-4 variant",
      });
    }

    let atmCode = atmRoll - 7 + planet.size + atmDM;
    atmCode = Math.max(0, atmCode);

    planet.atmosphereCode = atmCode;
    planet.rawAtmosphereRoll = atmRoll;

    this.generationLog.push({
      step: "3A-AtmosphereCode",
      world: planet.id,
      roll: atmRoll,
      size: planet.size,
      dm: atmDM,
      code: atmCode,
    });

    // Step 3: Determine atmosphere type based on code[^13]
    planet.atmosphereType = this.getAtmosphereType(atmCode, planet);

    // Step 4: Determine if in habitable zone[^1]
    const inHZ = this.isInHabitableZone(planet);
    planet.inHabitableZone = inHZ;

    // Step 5: Calculate atmospheric pressure[^8]
    this.calculateAtmosphericPressure(planet);

    // Step 6: Calculate oxygen partial pressure (for habitable atmospheres)[^8]
    if ([2, 3, 4, 5, 6, 7, 8, 9, "D", "E"].includes(atmCode)) {
      this.calculateOxygenPartialPressure(planet);
    }

    // Step 7: Determine atmospheric composition (optional detailed)[^16,^7,^1]
    if (inHZ && [2, 3, 4, 5, 6, 7, 8, 9].includes(atmCode)) {
      planet.atmosphereComposition = this.getHabitableAtmosphereComposition(planet);
    } else if (!inHZ) {
      planet.atmosphereComposition = this.getNonHabitableAtmosphereComposition(planet, atmCode);
    }

    console.log(`  ${planet.id}: Atmosphere ${atmCode} (${planet.atmosphereType})`);
  }

  /**
   * Get atmosphere type name based on code
   * Reference: Handbook page 79 - Atmosphere Codes
   */
  getAtmosphereType(code, planet) {
    const typeMap = {
      0: "Trace",
      1: "Trace",
      2: "Very Thin",
      3: "Very Thin",
      4: "Thin",
      5: "Thin",
      6: "Standard",
      7: "Standard",
      8: "Dense",
      9: "Dense",
      A: "Very Dense",
      B: "Corrosive",
      C: "Insidious",
      D: "Very Dense",
      E: "Low",
      F: "Unusual",
      G: "Helium",
      H: "Hydrogen",
    };

    return typeMap[code] || "Unknown";
  }

  /**
   * Determine if planet is in habitable zone
   * Reference: Handbook pages 41-43
   */
  isInHabitableZone(planet) {
    if (!planet.orbit || !this.habitableZone) {
      return false;
    }

    // Within ±1 orbit of HZ center is "effectively habitable"
    const hzCenter = this.habitableZone.centerOrbit;
    const distance = Math.abs(planet.orbit - hzCenter);

    return distance <= 1.0;
  }

  /**
   * Calculate atmospheric pressure (bar)
   * Reference: Handbook page 81 - Total Atmospheric Pressure
   */
  calculateAtmosphericPressure(planet) {
    const code = planet.atmosphereCode;

    // Atmosphere pressure ranges by code
    const pressureRanges = {
      0: { min: 0, max: 0.01 },
      1: { min: 0.01, max: 0.09 },
      2: { min: 0.1, max: 0.42 },
      3: { min: 0.43, max: 0.49 },
      4: { min: 0.5, max: 0.8 },
      5: { min: 0.81, max: 1.49 },
      6: { min: 0.51, max: 1.49 },
      7: { min: 0.51, max: 1.49 },
      8: { min: 1.5, max: 2.49 },
      9: { min: 2.5, max: 5.09 },
      A: { min: 5.1, max: 9.99 },
      B: { min: 10, max: 50 },
      C: { min: 10, max: 50 },
      D: { min: 1, max: 10 },
      E: { min: 0.1, max: 0.5 },
    };

    const range = pressureRanges[code];
    if (!range) {
      planet.atmospherePressure = 0;
      return;
    }

    // Calculate using linear variance[^8]
    // Pressure = Min + (Max - Min) × (2D ÷ 12)
    const variance = this.roller.roll2D() / 12;
    const span = range.max - range.min;
    planet.atmospherePressure = range.min + span * variance;

    this.generationLog.push({
      step: "3A-AtmPressure",
      world: planet.id,
      code: code,
      min: range.min,
      max: range.max,
      calculated: planet.atmospherePressure.toFixed(2),
    });
  }

  /**
   * Calculate oxygen partial pressure (ppo)
   * Reference: Handbook page 81-82
   */
  calculateOxygenPartialPressure(planet) {
    // Oxygen fraction typically 10-30% for habitable worlds[^8]
    const oxygenFraction = ((this.roller.roll1D() - 1) * 5 + 10) / 100;

    planet.oxygenFraction = oxygenFraction;
    planet.oxygenPartialPressure = oxygenFraction * planet.atmospherePressure;

    // Determine breathability
    planet.isBreathable =
      planet.oxygenPartialPressure >= 0.16 &&
      planet.oxygenPartialPressure <= 0.4 &&
      planet.atmospherePressure >= 0.5 &&
      planet.atmospherePressure <= 2.5;

    this.generationLog.push({
      step: "3A-OxygenPPO",
      world: planet.id,
      oxygenFraction: (oxygenFraction * 100).toFixed(1),
      ppo: planet.oxygenPartialPressure.toFixed(3),
      breathable: planet.isBreathable,
    });
  }

  /**
   * Get standard habitable atmosphere composition
   * Reference: Handbook pages 83-87
   */
  getHabitableAtmosphereComposition(planet) {
    // Most habitable worlds have nitrogen-oxygen mix
    const oxygenPercent = planet.oxygenFraction * 100;
    const nitrogenPercent = 100 - oxygenPercent;
    const tracePercent = 0;

    return {
      primary: "N2",
      primaryPercent: nitrogenPercent.toFixed(1),
      secondary: "O2",
      secondaryPercent: oxygenPercent.toFixed(1),
      trace: "Ar, CO2",
      tracePercent: tracePercent.toFixed(1),
      description: "Nitrogen-Oxygen Mix (Earth-like)",
    };
  }

  /**
   * Get non-habitable zone atmosphere composition
   * Reference: Handbook pages 95-99
   */
  getNonHabitableAtmosphereComposition(planet, code) {
    // Hot vs Cold atmosphere determination[^12]
    let temperature = "Unknown";
    if (planet.orbit && this.habitableZone) {
      const distanceFromHZ = planet.orbit - this.habitableZone.centerOrbit;
      if (distanceFromHZ < -0.5) {
        temperature = "Hot";
      } else if (distanceFromHZ > 0.5) {
        temperature = "Cold";
      }
    }

    // Simplified composition based on code and temperature
    const compositionMap = {
      Hot: {
        0: "None",
        1: "Trace CO2",
        A: "Exotic (CO2, NH3, etc.)",
        B: "Corrosive (SO2, etc.)",
        C: "Insidious (toxic)",
      },
      Cold: {
        0: "None",
        1: "Trace (N2 ice)",
        F: "Unusual (He, H2)",
        G: "Helium",
        H: "Hydrogen",
      },
    };

    const comp = compositionMap[temperature]?.[code];
    return {
      primary: comp || "Unknown",
      description: `${temperature} atmosphere - ${comp || "unclassified"}`,
    };
  }

  /**
   * Generate hydrographics percentage for a planet
   * Reference: Handbook pages 100-101
   */
  generatePlanetHydrographics(planet) {
    // Step 1: Determine baseline hydrographics code
    // Roll 2D-7 + Atmosphere code
    const hydroRoll = this.roller.roll2D();
    let hydroDM = 0;

    // Apply DMs based on atmosphere[^14]
    if ([0, 1, "A", "B", "C"].includes(planet.atmosphereCode)) {
      hydroDM = -4; // No standard water
    }

    // Apply temperature DMs[^14]
    if (planet.temperature) {
      if (planet.temperature >= 303 && planet.temperature < 323) {
        hydroDM -= 2; // Hot
      } else if (planet.temperature >= 323) {
        hydroDM -= 6; // Boiling
      }
    }

    let hydroCode = hydroRoll - 7 + planet.atmosphereCode + hydroDM;
    hydroCode = Math.max(0, Math.min(10, hydroCode));

    planet.hydrographicsCode = hydroCode;

    // Step 2: Calculate exact hydrographics percentage[^15]
    planet.hydrographicsPercent = this.calculateHydrographicsPercent(hydroCode);

    this.generationLog.push({
      step: "3A-Hydrographics",
      world: planet.id,
      roll: hydroRoll,
      atmosphereCode: planet.atmosphereCode,
      dm: hydroDM,
      code: hydroCode,
      percent: planet.hydrographicsPercent.toFixed(1),
    });

    console.log(`  ${planet.id}: Hydrographics ${hydroCode} (${planet.hydrographicsPercent.toFixed(1)}%)`);
  }

  /**
   * Calculate exact hydrographics percentage
   * Reference: Handbook page 100 - Hydrographics Ranges
   */
  calculateHydrographicsPercent(code) {
    const ranges = {
      0: { min: 0, max: 5 },
      1: { min: 6, max: 15 },
      2: { min: 16, max: 25 },
      3: { min: 26, max: 35 },
      4: { min: 36, max: 45 },
      5: { min: 46, max: 55 },
      6: { min: 56, max: 65 },
      7: { min: 66, max: 75 },
      8: { min: 76, max: 85 },
      9: { min: 86, max: 95 },
      10: { min: 96, max: 100 },
    };

    const range = ranges[code];
    if (!range) return 0;

    // Use d10 roll for precise value within range[^15]
    let variance;
    if (code === 0) {
      // Special: 0 uses -4+d10, minimum 0
      variance = Math.max(0, -4 + this.roller.roll1D(10));
    } else if (code === 10) {
      // Special: A uses 96+d10, capped at 100
      variance = Math.min(100, 96 + this.roller.roll1D(10));
    } else {
      // Normal: min + d10
      variance = range.min + this.roller.roll1D(10);
    }

    return variance;
  }

  /**
   * Determine surface feature distribution
   * Reference: Handbook page 101 - Surface Feature Distribution
   */
  determineSurfaceFeatures(planet) {
    if (planet.hydrographicsCode === 0) {
      planet.surfaceFeatures = {
        type: "Barren",
        description: "No significant water or features",
        majorBodies: 0,
        minorBodies: 0,
      };
      return;
    }

    // Roll 2D-2 for distribution pattern[^23]
    const distributionRoll = this.roller.roll2D() - 2;

    const distributions = {
      0: { name: "Extremely Dispersed", majorPercent: 0, description: "Many minor/small bodies: no major bodies" },
      1: { name: "Very Dispersed", majorPercent: 7.5, description: "Mostly minor: 5-10% in major bodies" },
      2: { name: "Dispersed", majorPercent: 15, description: "Mostly minor: 10-20% in major bodies" },
      3: { name: "Scattered", majorPercent: 25, description: "~20-30% in major bodies" },
      4: { name: "Slightly Scattered", majorPercent: 35, description: "~30-40% in major bodies" },
      5: { name: "Mixed", majorPercent: 50, description: "50-50 split of major/minor" },
      6: { name: "Slight Concentration", majorPercent: 65, description: "~60-70% in major bodies" },
      7: { name: "Concentrated", majorPercent: 75, description: "~75-90% in major bodies" },
      8: { name: "Very Concentrated", majorPercent: 92.5, description: "Most surface area in major bodies" },
      9: { name: "Extremely Concentrated", majorPercent: 100, description: "Dominated by major bodies" },
    };

    const dist = distributions[Math.max(0, Math.min(9, distributionRoll))];

    planet.surfaceFeatures = {
      type: planet.hydrographicsCode >= 6 ? "Ocean World" : "Land World",
      distributionPattern: dist.name,
      description: dist.description,
      majorBodyPercent: dist.majorPercent,
      waterCovered: planet.hydrographicsCode >= 6,
      roll: distributionRoll,
    };

    this.generationLog.push({
      step: "3A-SurfaceFeatures",
      world: planet.id,
      roll: distributionRoll,
      pattern: dist.name,
    });
  }

  /**
   * Check for runaway greenhouse effect
   * Reference: Handbook page 81 - Runaway Greenhouse
   */
  checkRunawayGreenhouse(planet) {
    // Only check habitable zone worlds with certain conditions[^11]
    if (!planet.inHabitableZone || planet.atmosphereCode < 2) {
      planet.runawayGreenhouse = false;
      return;
    }

    // Check base temperature (needs to be calculated first, or estimate)
    // For now, we'll estimate based on orbit proximity to HZ
    let baseTemperatureEstimate = 288; // Earth-like baseline

    if (planet.orbit && this.habitableZone) {
      const distFromHZ = planet.orbit - this.habitableZone.centerOrbit;
      baseTemperatureEstimate += distFromHZ * 50; // Rough 50K per orbit shift
    }

    // Roll for greenhouse on hot/boiling worlds[^11]
    if (baseTemperatureEstimate > 303) {
      // Above 30°C
      const ghRoll = this.roller.roll2D();
      let ghDM = 0;

      // System age DM[^11]
      const systemAge = this.starSystem.age || 4.5; // Gyr
      ghDM += Math.ceil(systemAge);

      // Boiling temperature DM[^11]
      if (baseTemperatureEstimate >= 323) {
        ghDM += 4;
      }

      const ghTotal = ghRoll + ghDM;
      planet.runawayGreenhouse = ghTotal >= 12;

      if (planet.runawayGreenhouse) {
        // Convert atmosphere to exotic/corrosive/insidious[^11]
        const ghAtmRoll = this.roller.roll1D();
        let newAtmCode;
        if (ghAtmRoll === 1) {
          newAtmCode = "A"; // Exotic
        } else if (ghAtmRoll <= 4) {
          newAtmCode = "B"; // Corrosive
        } else {
          newAtmCode = "C"; // Insidious
        }

        planet.originalAtmosphereCode = planet.atmosphereCode;
        planet.atmosphereCode = newAtmCode;
        planet.atmosphereType = this.getAtmosphereType(newAtmCode, planet);

        this.generationLog.push({
          step: "3A-RunawayGreenhouse",
          world: planet.id,
          roll: ghRoll,
          dm: ghDM,
          total: ghTotal,
          newAtmosphere: newAtmCode,
        });
      }
    }

    planet.greenhouseRoll = { roll: ghRoll, dm: ghDM, total: ghTotal };
  }

  /**
   * Calculate habitability score for a world
   * Reference: Handbook pages 133-134
   */
  calculateHabitability(planet) {
    let score = 0;
    let habitabilityFactors = [];

    // Size: Prefer 6-9 (Earth-like)[^1]
    if (planet.size >= 6 && planet.size <= 9) {
      score += 2;
      habitabilityFactors.push("Good size (6-9)");
    } else if (planet.size >= 4 && planet.size <= 5) {
      score += 1;
      habitabilityFactors.push("Acceptable size (4-5)");
    }

    // Atmosphere: Prefer breathable (4-9)[^1]
    if (planet.atmosphereCode >= 4 && planet.atmosphereCode <= 9) {
      score += 3;
      habitabilityFactors.push("Breathable atmosphere");
    } else if ([2, 3, "D", "E"].includes(planet.atmosphereCode)) {
      score += 1;
      habitabilityFactors.push("Thin/dense atmosphere");
    }

    // Hydrographics: Prefer water (3-8)[^1]
    if (planet.hydrographicsCode >= 3 && planet.hydrographicsCode <= 8) {
      score += 2;
      habitabilityFactors.push("Adequate water (3-8)");
    } else if (planet.hydrographicsCode === 10) {
      score += 1;
      habitabilityFactors.push("Water-covered (100%)");
    }

    // Bonus for breathable conditions
    if (planet.isBreathable) {
      score += 2;
      habitabilityFactors.push("Human-breathable");
    }

    // Penalty for extreme conditions
    if (planet.runawayGreenhouse) {
      score -= 3;
      habitabilityFactors.push("Runaway greenhouse (hostile)");
    }

    planet.habitabilityScore = score;
    planet.habitabilityFactors = habitabilityFactors;

    this.generationLog.push({
      step: "3A-Habitability",
      world: planet.id,
      score: score,
      factors: habitabilityFactors.join("; "),
    });
  }
  // #endregion
}

module.exports = WorldGenerator;
