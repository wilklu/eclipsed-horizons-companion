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
      console.log("\n=== PHASE 2, 3A, 3B & 3C: COMPLETE WORLD GENERATION ===\n");

      // ===============================================
      // PHASE 2: WORLD DISCOVERY & PLACEMENT
      // ===============================================
      console.log("PHASE 2: World Discovery & Placement");
      this.determineWorldCounts();
      this.calculateHabitableZone();
      this.determineOrbitStructure();
      this.placeWorlds();
      this.generateWorldCharacteristics(); // Size only

      // Generate moons for ALL worlds (they're candidates)
      this.generatePlanetaryMoons();

      console.log(`  Total worlds: ${this.allWorlds.length}`);
      console.log(`  Moons generated: ${this.allWorlds.reduce((sum, w) => sum + (w.moons?.length || 0), 0)}`);

      // ===============================================
      // PHASE 3A: ATMOSPHERE & HYDROGRAPHICS FOR ALL WORLDS
      // ===============================================
      console.log("\nPHASE 3A: Atmosphere & Hydrographics (All Worlds)");
      this.generateAtmosphereAndHydrographicsForAllWorlds();

      // ===============================================
      // PHASE 3B: TEMPERATURE & CLIMATE FOR ALL WORLDS
      // ===============================================
      console.log("\nPHASE 3B: Temperature & Climate (All Worlds)");
      this.generateTemperatureAndClimateForAllWorlds();

      // ===============================================
      // MAINWORLD DETERMINATION
      // ===============================================
      console.log("\nMAINWORLD DETERMINATION:");
      // NOW we have complete data for all worlds
      this.determineMainworld();

      if (!this.mainworld) {
        throw new Error("CRITICAL: Mainworld determination failed");
      }

      // ===============================================
      // PHASE 3C: POPULATION & SETTLEMENTS (MAINWORLD + SECONDARIES)
      // ===============================================
      console.log("\nPHASE 3C: Population & Settlements");
      this.generatePopulationAndSettlementsForAllWorlds();

      // ===============================================
      // UWP GENERATION FOR ALL WORLDS
      // ===============================================
      console.log("\nUWP GENERATION:");
      this.generateUWPForAllWorlds();

      return this.buildSystemWithWorlds();
    } catch (error) {
      console.error("Error in generateWorlds():", error);
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
  /**
 * MAINWORLD DETERMINATION - COMPREHENSIVE SYSTEM
 * Reference: Handbook pages 59-60, 134-135
 * 
 * Process:
 * 1. Collect all mainworld candidates (planets + moons)
 * 2. Evaluate candidates using priority criteria
 * 3. Select mainworld based on priority ranking
 * 4. Alternative selection methods if needed
 */

  /**
   * Determine mainworld from all available candidates
   * Reference: Handbook page 134 - Final Mainworld Determination
   *
   * SELECTION PRIORITY:
   * 1. Highest Habitability Rating (pages 132-134)
   * 2. Native Sophonts Present (optional, lore-driven)
   * 3. Highest Resource Rating (pages 186-191)
   * 4. Best Refueling Location (pages 189-194)
   * 5. Arbitrary selection (Referee discretion)
   */
  determineMainworld() {
    console.log("\nSTEP 6: DETERMINE MAINWORLD (Extended Method)");

    // Step 1: Collect ALL mainworld candidates
    const candidates = this.collectMainworldCandidates();

    if (candidates.length === 0) {
      console.error("❌ CRITICAL: No worlds available for mainworld selection");
      throw new Error("System has no worlds - cannot determine mainworld");
    }

    console.log(`\n  📊 Evaluating ${candidates.length} mainworld candidate(s)...`);

    // Step 2: Score all candidates using priority criteria
    const scoredCandidates = candidates.map((candidate) => {
      return this.scoreMainworldCandidate(candidate);
    });

    // Display evaluation results
    this.displayCandidateEvaluation(scoredCandidates);

    // Step 3: Select mainworld using priority system
    const mainworld = this.selectMainworldByPriority(scoredCandidates);

    if (!mainworld) {
      throw new Error("Mainworld selection failed - no valid candidates");
    }

    // Step 4: Mark as mainworld and add metadata
    mainworld.isMainworld = true;
    mainworld.mainworldScore = mainworld.score;
    mainworld.selectionMethod = mainworld.selectionMethod;
    mainworld.description = this.generateMainworldDescription(mainworld);

    console.log(`\n  ✅ MAINWORLD SELECTED: ${mainworld.id}`);
    console.log(`     Type: ${mainworld.type}`);
    console.log(`     Body: ${mainworld.parentWorld ? mainworld.parentWorld : "Planet"}`);
    console.log(`     Selection: ${mainworld.selectionMethod}`);
    console.log(`     Habitability: ${mainworld.habitabilityRating}/9`);

    this.generationLog.push({
      step: "6-FinalMainworldDetermination",
      selected: mainworld.id,
      type: mainworld.type,
      method: mainworld.selectionMethod,
      totalCandidates: candidates.length,
      habitabilityRating: mainworld.habitabilityRating,
      resourceRating: mainworld.resourceRating || "TBD",
      refuelingQuality: mainworld.refuelingQuality || "TBD",
    });

    this.mainworld = mainworld;
  }

  /**
   * Collect ALL mainworld candidates from system
   * Reference: Handbook page 60 - Mainworld Candidate Selection
   *
   * Candidates include:
   * - All terrestrial planets
   * - All moons with Size 2+ (capable of atmosphere)
   * - Size 1 moons in exceptional cases
   */
  collectMainworldCandidates() {
    const candidates = [];

    // Include all terrestrial planets
    if (this.terrestrialPlanets && this.terrestrialPlanets.length > 0) {
      this.terrestrialPlanets.forEach((planet) => {
        candidates.push({
          ...planet,
          candidateType: "Terrestrial Planet",
          parentWorld: null,
        });
      });
    }

    // Include all moons from ALL bodies (planets and gas giants)
    // Reference: Handbook page 76 - "A moon is no different than a planet..."
    if (this.allWorlds && this.allWorlds.length > 0) {
      this.allWorlds.forEach((world) => {
        if (world.moons && world.moons.length > 0) {
          world.moons.forEach((moon) => {
            // Filter moons that could be candidates
            // Size 2+ can have atmosphere; Size 1+ can be considered
            if (moon.size && (moon.size === 0 || moon.size > 1 || moon.size === "S")) {
              // Size S moons are marginal but possible
              candidates.push({
                ...moon,
                candidateType: "Moon",
                parentWorld: world.id,
                parentType: world.type,
                orbitPD: moon.orbitPD,
                moonDesignation: `${world.id} ${moon.designation}`,
                id: moon.id || `${world.id}-${moon.designation}`,
              });
            }
          });
        }
      });
    }

    console.log(`    Total candidates collected: ${candidates.length}`);
    console.log(`    - Planets: ${this.terrestrialPlanets?.length || 0}`);
    console.log(`    - Moons: ${candidates.length - (this.terrestrialPlanets?.length || 0)}`);

    return candidates;
  }

  /**
   * Score a mainworld candidate using all evaluation criteria
   * Reference: Handbook pages 132-134 - Habitability Determination
   */
  scoreMainworldCandidate(candidate) {
    let totalScore = 0;
    const scoreBreakdown = {};

    // PRIORITY 1: HABITABILITY RATING (pages 132-134)
    // This is the PRIMARY criterion
    const habitabilityRating = this.calculateHabitabilityRating(candidate);
    candidate.habitabilityRating = habitabilityRating;
    scoreBreakdown.habitability = habitabilityRating;
    totalScore += habitabilityRating * 100; // Weight heavily: ×100

    // PRIORITY 2: NATIVE SOPHONTS (optional, lore-driven)
    // Would require additional native population tracking
    const hasSophonts = candidate.nativeSophonts === true ? 50 : 0;
    scoreBreakdown.nativeSophonts = hasSophonts;
    totalScore += hasSophonts;

    // PRIORITY 3: RESOURCE RATING (pages 186-191)
    // Calculate resource rating for comparison
    const resourceRating = this.calculateResourceRating(candidate);
    candidate.resourceRating = resourceRating;
    scoreBreakdown.resources = resourceRating;
    totalScore += resourceRating * 10; // Weight moderately: ×10

    // PRIORITY 4: REFUELING QUALITY (pages 189-194)
    // Starport class indicates refueling capability
    const refuelingQuality = this.calculateRefuelingQuality(candidate);
    candidate.refuelingQuality = refuelingQuality;
    scoreBreakdown.refueling = refuelingQuality;
    totalScore += refuelingQuality * 5; // Weight lightly: ×5

    // BONUS: Location in habitable zone
    if (candidate.inHabitableZone) {
      totalScore += 25;
      scoreBreakdown.habitableZone = 25;
    }

    // BONUS: Size suitable for development
    if (candidate.size >= 4 && candidate.size <= 9) {
      totalScore += 10;
      scoreBreakdown.suitableSize = 10;
    }

    candidate.score = totalScore;
    candidate.scoreBreakdown = scoreBreakdown;

    return candidate;
  }

  /**
   * Calculate habitability rating for a world
   * Reference: Handbook pages 132-134 - Habitability Rating Determination
   *
   * Habitability Rating ranges from -3 to 9
   * Scores 5+ = Regional Habitability
   * Scores 8+ = Full Habitability (Garden World potential)
   */
  calculateHabitabilityRating(world) {
    let rating = 0;

    // SIZE: Base factor[^1]
    // Ideal: 6-9 (terrestrial)
    if (world.size >= 6 && world.size <= 9) {
      rating += 2;
    } else if (world.size >= 4 && world.size <= 5) {
      rating += 1;
    } else if (world.size === 3) {
      rating += 0;
    } else if (world.size === 2) {
      rating -= 1;
    } else if (world.size === 1 || world.size === 0) {
      rating -= 2;
    }

    // ATMOSPHERE: Breathability[^1]
    // Ideal: 4-9 (standard to dense)
    const atmCode = world.atmosphereCode;
    if ([4, 5, 6, 7, 8, 9].includes(atmCode)) {
      rating += 3; // Breathable atmosphere
    } else if ([2, 3, "A", "B", "C", "D", "E"].includes(atmCode)) {
      rating += 1; // Non-standard but potentially survivable
    } else if (atmCode === 0 || atmCode === 1) {
      rating -= 2; // No/trace atmosphere
    }

    // HYDROGRAPHICS: Water availability[^1]
    // Ideal: 4-8 (moderate water for agriculture)
    const hydroCode = world.hydrographicsCode;
    if (hydroCode >= 4 && hydroCode <= 8) {
      rating += 2; // Good water availability
    } else if (hydroCode === 3 || hydroCode === 9) {
      rating += 1; // Marginal water
    } else if (hydroCode >= 10) {
      rating += 1; // Water world (less ideal for terrestrial development)
    } else if (hydroCode === 0 || hydroCode === 1) {
      rating -= 2; // No water
    }

    // TEMPERATURE: Survivability[^1]
    // Reference: Handbook page 133 - Temperature considerations
    if (world.meanTemperatureCelsius) {
      if (world.meanTemperatureCelsius >= -50 && world.meanTemperatureCelsius <= 50) {
        rating += 1; // Habitable temperature range
      } else if (world.meanTemperatureCelsius < -50) {
        rating -= 2; // Too cold (frozen)
      } else if (world.meanTemperatureCelsius > 50) {
        rating -= 2; // Too hot (hostile)
      }
    }

    // GRAVITY: Development difficulty[^1]
    // Reference: Handbook page 133 - Gravity DMs
    if (world.gravity) {
      if (world.gravity >= 0.66 && world.gravity <= 1.5) {
        rating += 0; // Acceptable (no penalty)
      } else if (world.gravity < 0.66) {
        rating -= 1; // Low gravity complications
      } else if (world.gravity > 1.5) {
        rating -= 1; // High gravity complications
      }
    }

    // GOVERNMENT & POPULATION: Secondary factors[^2]
    // These are filled in during Phase 3C but affect habitability perception
    if (world.populationCode !== undefined) {
      if (world.populationCode >= 5) {
        rating += 1; // Established population
      }
    }

    // Clamp rating to valid range (-3 to 9)
    rating = Math.max(-3, Math.min(9, rating));

    return rating;
  }

  /**
   * Calculate resource rating for a candidate
   * Reference: Handbook pages 186-191 - Resources
   *
   * Used as secondary criteria for mainworld selection
   */
  calculateResourceRating(world) {
    // If not yet calculated, estimate based on characteristics
    if (world.resourceRating !== undefined) {
      return world.resourceRating;
    }

    let rating = 2; // Base rating

    // Atmosphere: Rich atmospheres have resources
    const atmCode = world.atmosphereCode;
    if ([6, 8, 9].includes(atmCode)) {
      rating += 2; // Standard/dense/exotic atmospheres
    }

    // Hydrographics: Varied water improves resources
    const hydroCode = world.hydrographicsCode;
    if (hydroCode >= 4 && hydroCode <= 8) {
      rating += 1;
    }

    // Size: Larger worlds have more resources
    if (world.size >= 6) {
      rating += 1;
    }

    // Temperature: Temperate zones are resource-rich
    if (world.temperatureClassification === "Temperate") {
      rating += 1;
    }

    // Clamp to 2-12 range
    return Math.max(2, Math.min(12, rating));
  }

  /**
   * Calculate refueling quality (starport effectiveness)
   * Reference: Handbook pages 189-194 - Starport Facilities
   *
   * Used as quaternary criteria
   */
  calculateRefuelingQuality(world) {
    // If starport already determined, use it
    if (world.starport) {
      const starportQuality = {
        A: 5, // Excellent - Class A spaceport
        B: 4, // Good - Class B spaceport
        C: 3, // Routine - Class C spaceport
        D: 2, // Poor - Class D spaceport
        E: 1, // Frontier - Class E spaceport
        X: 0, // None - no spaceport
      };
      return starportQuality[world.starport] || 0;
    }

    // Otherwise estimate based on characteristics
    // High population and tech level suggest good refueling
    let quality = 0;

    if (world.populationCode && world.populationCode >= 9) {
      quality += 2; // Major world
    }
    if (world.technologyLevel && world.technologyLevel >= 10) {
      quality += 1; // Advanced tech supports refueling
    }

    return quality;
  }

  /**
   * Select mainworld using priority-based system
   * Reference: Handbook page 134
   */
  selectMainworldByPriority(candidates) {
    console.log(`\n  📋 SELECTION PROCESS:`);

    // PRIORITY 1: Highest Habitability Rating
    console.log(`\n    Priority 1: Highest Habitability Rating`);
    const maxHabitability = Math.max(...candidates.map((c) => c.habitabilityRating));
    console.log(`      Maximum habitability: ${maxHabitability}`);

    let habitableCandidates = candidates.filter((c) => c.habitabilityRating === maxHabitability);
    console.log(`      Candidates with ${maxHabitability}: ${habitableCandidates.length}`);

    if (habitableCandidates.length === 1) {
      const selected = habitableCandidates[0];
      selected.selectionMethod = `Priority 1: Highest Habitability (${maxHabitability})`;
      return selected;
    }

    // PRIORITY 2: Native Sophonts (if applicable)
    console.log(`\n    Priority 2: Native Sophonts Present`);
    const sophontCandidates = habitableCandidates.filter((c) => c.nativeSophonts === true);

    if (sophontCandidates.length > 0) {
      let selected = sophontCandidates[0];
      selected.selectionMethod = `Priority 2: Native Sophonts`;
      return selected;
    }

    // PRIORITY 3: Highest Resource Rating
    console.log(`\n    Priority 3: Highest Resource Rating`);
    const maxResources = Math.max(...habitableCandidates.map((c) => c.resourceRating));
    console.log(`      Maximum resources: ${maxResources}`);

    let resourceCandidates = habitableCandidates.filter((c) => c.resourceRating === maxResources);
    console.log(`      Candidates with ${maxResources}: ${resourceCandidates.length}`);

    if (resourceCandidates.length === 1) {
      const selected = resourceCandidates[0];
      selected.selectionMethod = `Priority 3: Highest Resources (${maxResources})`;
      return selected;
    }

    // PRIORITY 4: Best Refueling Location
    console.log(`\n    Priority 4: Best Refueling Location`);
    const maxRefueling = Math.max(...resourceCandidates.map((c) => c.refuelingQuality));
    console.log(`      Maximum refueling quality: ${maxRefueling}`);

    let refuelingCandidates = resourceCandidates.filter((c) => c.refuelingQuality === maxRefueling);
    console.log(`      Candidates with ${maxRefueling}: ${refuelingCandidates.length}`);

    if (refuelingCandidates.length === 1) {
      const selected = refuelingCandidates[0];
      selected.selectionMethod = `Priority 4: Best Refueling (Quality ${maxRefueling})`;
      return selected;
    }

    // FALLBACK: Arbitrary selection (Referee discretion)
    // Reference: Handbook page 134 - "Referee is free to ignore these recommendations..."
    console.log(`\n    Priority 5: Arbitrary Selection (Referee Discretion)`);

    // Select based on highest total score
    let selected = refuelingCandidates.reduce((a, b) => ((a.score || 0) > (b.score || 0) ? a : b));

    selected.selectionMethod = `Priority 5: Arbitrary (Referee Choice - Highest Total Score)`;
    return selected;
  }

  /**
   * Display candidate evaluation table for transparency
   */
  displayCandidateEvaluation(candidates) {
    console.log(`\n  📊 CANDIDATE EVALUATION TABLE:`);
    console.log(
      `  ${"ID".padEnd(12)} | ${"Type".padEnd(22)} | ${"Habit".padEnd(5)} | ${"Rsrc".padEnd(4)} | ${"Fuel".padEnd(4)} | ${"Score".padEnd(6)}`,
    );
    console.log(`  ${"-".repeat(68)}`);

    candidates.forEach((c) => {
      const type = c.candidateType === "Moon" ? `${c.parentWorld} ${c.designation}` : c.id;

      console.log(
        `  ${type.padEnd(12)} | ${c.candidateType.padEnd(22)} | ${c.habitabilityRating.toString().padEnd(5)} | ${c.resourceRating.toString().padEnd(4)} | ${c.refuelingQuality.toString().padEnd(4)} | ${c.score.toString().padEnd(6)}`,
      );
    });
  }

  /**
   * Generate detailed mainworld description
   */
  generateMainworldDescription(mainworld) {
    const sizeDescriptions = {
      0: "Tiny",
      1: "Small",
      2: "Small",
      3: "Medium",
      4: "Medium",
      5: "Large",
      6: "Large",
      7: "Terrestrial",
      8: "Terrestrial",
      9: "Large",
      A: "Very Large",
      B: "Very Large",
    };

    const atmDescriptions = {
      0: "None",
      1: "Trace",
      2: "Very Thin",
      3: "Very Thin",
      4: "Thin",
      5: "Thin",
      6: "Standard",
      7: "Standard",
      8: "Dense",
      9: "Very Dense",
      A: "Exotic",
      B: "Corrosive",
      C: "Insidious",
    };

    const worldType =
      mainworld.type === "Moon"
        ? `Moon of ${mainworld.parentWorld}`
        : mainworld.type === "Terrestrial Planet"
          ? "Terrestrial Planet"
          : mainworld.type;

    return `${sizeDescriptions[mainworld.size] || "Unknown"} ${worldType} with ${atmDescriptions[mainworld.atmosphereCode] || "unknown"} atmosphere`;
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
  /**
   * Enhanced moon generation - ensure moons get SAH data
   */
  generateMoonsForWorld(world, worldType) {
    const moonQuantity = this.determineMoonQuantity(world, worldType);

    if (moonQuantity <= 0) {
      world.moons = [];
      world.hasRings = moonQuantity === 0;
      return;
    }

    world.moons = [];
    for (let i = 0; i < moonQuantity; i++) {
      const moon = this.generateMoon(world, i + 1, worldType);
      if (moon) {
        world.moons.push(moon);
      }
    }

    this.determineMoonOrbits(world);
    this.calculateMoonOrbitalPeriods(world);
    this.determineMoonOrbitalCharacteristics(world);

    // ✅ NEW: Generate moon characteristics (atmosphere, hydrographics)
    // Moons can be mainworld candidates - they need full SAH data
    world.moons.forEach((moon) => {
      this.generateMoonCharacteristics(moon, world);
    });

    this.generationLog.push({
      step: "6B-WorldMoons",
      world: world.id,
      moonCount: world.moons.length,
      hasRings: world.hasRings || false,
    });
  }

  /**
   * Generate SAH characteristics for a moon
   * Reference: Handbook page 76 - "A moon is no different than a planet..."
   */
  generateMoonCharacteristics(moon, parentWorld) {
    // Size was already determined in generateMoon()
    // Now generate atmosphere and hydrographics

    // Atmosphere: Roll 2D-7 + Size (like planets)
    const atmRoll = this.roller.roll2D();
    let atmDM = 0;

    // Apply orbit-based modifiers
    if (moon.orbitPD < 3) {
      atmDM -= 2; // Close orbits lose atmosphere
    }

    let atmCode = atmRoll - 7 + moon.size + atmDM;
    atmCode = Math.max(0, atmCode);
    moon.atmosphereCode = atmCode;

    // Hydrographics: Roll 2D-7 + Atmosphere
    const hydroRoll = this.roller.roll2D();
    let hydroDM = 0;

    if ([0, 1].includes(atmCode)) {
      hydroDM -= 4; // No atmosphere = no water
    }

    let hydroCode = hydroRoll - 7 + atmCode + hydroDM;
    hydroCode = Math.max(0, Math.min(10, hydroCode));
    moon.hydrographicsCode = hydroCode;
    moon.hydrographicsPercent = this.calculateHydrographicsPercent(hydroCode);

    // Temperature (simplified - affected by parent world)
    // Tidal locking considerations[^3]
    moon.isTidallyLocked = true; // Most moons are tidally locked

    // Estimate temperature based on parent world and orbit
    if (parentWorld.meanTemperature) {
      // Moons inherit some thermal properties from parent
      moon.meanTemperature = parentWorld.meanTemperature * 0.5; // Rough approximation
      moon.meanTemperatureCelsius = moon.meanTemperature - 273.15;
    }

    this.generationLog.push({
      step: "6B-MoonCharacteristics",
      moon: moon.id,
      size: moon.size,
      atmosphere: atmCode,
      hydrographics: hydroCode,
      tidallyLocked: moon.isTidallyLocked,
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
        diceRoll = this.roller.roll3D(-7);
      } else if (ggSize === "Medium") {
        diceRoll = this.roller.roll4D(-6);
      } else {
        // Large
        diceRoll = this.roller.roll4D(-6);
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
   * Build complete system with worlds
   */
  buildSystemWithWorlds() {
    return {
      // Star system basics
      primaryStar: this.starSystem.primaryStar,
      secondaryStars: this.starSystem.secondaryStars || [],
      systemAge: this.starSystem.age,

      // Worlds Collections
      gasGiants: this.gasGiants,
      planetoidBelts: this.planetoidBelts,
      terrestrialPlanets: this.terrestrialPlanets.map((p) => ({
        id: p.id,
        uwp: p.uwp,
        population: p.populationCode,
        ...p,
      })),
      allWorlds: this.allWorlds,

      // Mainworld (PRIMARY)
      mainworld: {
        id: this.mainworld.id,
        uwp: this.mainworld.uwp,
        type: this.mainworld.type,
        isMainworld: true,
        population: this.mainworld.populationCode,
        ...this.mainworld,
      },

      // Secondary Worlds (Populated)
      secondaryWorlds: [
        ...this.terrestrialPlanets
          .filter((p) => p !== this.mainworld && p.populationCode > 0)
          .map((p) => ({ id: p.id, uwp: p.uwp, type: "Planet" })),
        ...this.allWorlds
          .flatMap((w) => w.moons || [])
          .filter((m) => m.populationCode > 0)
          .map((m) => ({ id: m.id, uwp: m.uwp, type: "Moon" })),
      ],

      // System properties
      habitableZone: this.habitableZone,
      orbitalStructure: this.orbitalStructure,
      worldCount: this.allWorlds.length,
      moonCount: this.allWorlds.reduce((sum, w) => sum + (w.moons?.length || 0), 0),

      // Metadata
      generationLog: this.generationLog,
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
   * PHASE 3A: ATMOSPHERE & HYDROGRAPHICS FOR ALL WORLDS
   * Reference: Handbook pages 78-108
   *
   * NOW: Process EVERY world (terrestrial planets + moons)
   * All worlds must be processed equally for mainworld determination
   */
  generateAtmosphereAndHydrographicsForAllWorlds() {
    console.log("  Processing atmosphere & hydrographics for ALL worlds...\n");

    // Collect ALL candidates (planets + moons)
    const allCandidates = this.collectAllWorldCandidates();

    if (allCandidates.length === 0) {
      console.warn("  ⚠ No worlds to process");
      return;
    }

    console.log(`  Processing ${allCandidates.length} worlds total:`);
    console.log(`    - Planets: ${this.terrestrialPlanets.length}`);
    console.log(`    - Moons: ${allCandidates.length - this.terrestrialPlanets.length}\n`);

    // Process terrestrial planets
    this.terrestrialPlanets.forEach((planet) => {
      this.generatePlanetAtmosphere(planet);
      this.generatePlanetHydrographics(planet);
      this.determineSurfaceFeatures(planet);
      this.checkRunawayGreenhouse(planet);
    });

    // Process moons from all parent worlds
    this.allWorlds.forEach((world) => {
      if (world.moons && world.moons.length > 0) {
        world.moons.forEach((moon) => {
          this.generatePlanetAtmosphere(moon);
          this.generatePlanetHydrographics(moon);
          this.determineSurfaceFeatures(moon);
        });
      }
    });

    this.generationLog.push({
      step: "Phase 3A Complete",
      action: "Atmosphere & hydrographics generated",
      planetsProcessed: this.terrestrialPlanets.length,
      moonsProcessed: allCandidates.length - this.terrestrialPlanets.length,
      totalProcessed: allCandidates.length,
    });

    console.log(`  ✓ Atmosphere & Hydrographics generated for ${allCandidates.length} worlds`);
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
    let ghRoll, ghDM, ghTotal;

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
  // #region Phase 3B: Temperature and Climate Calculations
  /**
   * PHASE 3B: TEMPERATURE & CLIMATE FOR ALL WORLDS
   * Reference: Handbook pages 110-126
   *
   * NOW: Process EVERY world (terrestrial planets + moons)
   */
  generateTemperatureAndClimateForAllWorlds() {
    console.log("  Processing temperature & climate for ALL worlds...\n");

    // Process terrestrial planets
    this.terrestrialPlanets.forEach((planet) => {
      this.generatePlanetTemperature(planet);
      this.generateClimateZones(planet);
      this.calculateSeasonalTemperatures(planet);
      this.classifyClimateType(planet);
    });

    // Process moons
    this.allWorlds.forEach((world) => {
      if (world.moons && world.moons.length > 0) {
        world.moons.forEach((moon) => {
          this.generatePlanetTemperature(moon);
          this.generateClimateZones(moon);
          this.calculateSeasonalTemperatures(moon);
          this.classifyClimateType(moon);
        });
      }
    });

    this.generationLog.push({
      step: "Phase 3B Complete",
      action: "Temperature & climate generated",
      worldsProcessed:
        this.terrestrialPlanets.length + this.allWorlds.reduce((sum, w) => sum + (w.moons?.length || 0), 0),
    });

    console.log(`  ✓ Temperature & climate generated for all worlds`);
  }

  /**
   * Collect ALL world candidates (planets and moons)
   * Helper for Phase 3A/3B processing
   */
  collectAllWorldCandidates() {
    const candidates = [];

    // Add all terrestrial planets
    candidates.push(...this.terrestrialPlanets);

    // Add all moons from all worlds
    this.allWorlds.forEach((world) => {
      if (world.moons && world.moons.length > 0) {
        candidates.push(...world.moons);
      }
    });

    return candidates;
  }

  /**
   * Generate temperature for a terrestrial planet
   * Reference: Handbook pages 110-112 - Mean Surface Temperature
   */
  generatePlanetTemperature(planet) {
    // Step 1: Determine planet's axial tilt (affects climate zones)[^1,^2]
    planet.axialTilt = this.determineAxialTilt(planet);

    // Step 2: Determine albedo (surface reflectivity)[^3,^4]
    planet.albedo = this.calculateAlbedo(planet);

    // Step 3: Calculate greenhouse factor[^5,^6]
    const greenhouseFactor = this.calculateGreenhouseFactor(planet);
    planet.greenhouseFactor = greenhouseFactor;

    // Step 4: Calculate mean surface temperature[^7]
    // Formula: T_mean = 278 × (L / D²)^0.25 × (1 - A)^0.25 × (GF)^0.25
    // Where: L = star luminosity, D = orbital distance (AU), A = albedo, GF = greenhouse factor
    const starLuminosity = this.starSystem.primaryStar.luminosity;
    const orbitalDistance = planet.orbit; // Already in AU

    if (!starLuminosity || !orbitalDistance) {
      console.warn(`  ⚠ Missing stellar data for ${planet.id} - using fallback`);
      planet.meanTemperature = 288; // Earth-like default
      return;
    }

    // Calculate mean temperature in Kelvin
    const meanTempKelvin =
      278 *
      Math.pow(starLuminosity / (orbitalDistance * orbitalDistance), 0.25) *
      Math.pow(1 - planet.albedo, 0.25) *
      Math.pow(greenhouseFactor, 0.25);

    planet.meanTemperature = meanTempKelvin;
    planet.meanTemperatureCelsius = meanTempKelvin - 273.15;

    // Classify as hot, temperate, or cold
    planet.temperatureClassification = this.classifyTemperature(meanTempKelvin, planet);

    this.generationLog.push({
      step: "3B-MeanTemperature",
      world: planet.id,
      luminosity: starLuminosity,
      orbitalDistance: orbitalDistance.toFixed(2),
      albedo: planet.albedo.toFixed(3),
      greenhouseFactor: greenhouseFactor.toFixed(3),
      meanTemp: meanTempKelvin.toFixed(1),
      celsius: planet.meanTemperatureCelsius.toFixed(1),
      classification: planet.temperatureClassification,
    });

    console.log(`  ${planet.id}: ${planet.temperatureClassification} (${planet.meanTemperatureCelsius.toFixed(1)}°C)`);
  }

  /**
   * Determine planet's axial tilt
   * Reference: Handbook page 114 - Axial Tilt
   */
  determineAxialTilt(planet) {
    // Roll 2D-2 for axial tilt code
    const tiltRoll = this.roller.roll2D() - 2;

    // Axial tilt table (in degrees)
    const tiltTable = {
      0: 0, // No tilt - tidally locked
      1: 5,
      2: 10,
      3: 15,
      4: 20,
      5: 25,
      6: 30,
      7: 35,
      8: 40,
      9: 45,
      10: 50, // Extreme tilt
    };

    const tilt = tiltTable[Math.max(0, Math.min(10, tiltRoll))] || 0;

    planet.axialTiltRoll = tiltRoll;
    planet.axialTilt = tilt;
    planet.isTidallyLocked = tilt === 0;

    this.generationLog.push({
      step: "3B-AxialTilt",
      world: planet.id,
      roll: tiltRoll,
      tilt: tilt,
      tidallyLocked: planet.isTidallyLocked,
    });

    return tilt;
  }

  /**
   * Calculate planet's albedo (surface reflectivity)
   * Reference: Handbook page 112 - Albedo by World Type
   */
  calculateAlbedo(planet) {
    let baseAlbedo = 0.5; // Default
    let albedoModifier = 0;

    // Albedo based on atmosphere type[^8,^9]
    const atmCode = planet.atmosphereCode;

    if (atmCode === 0 || atmCode === 1) {
      baseAlbedo = 0.4; // Trace/very thin - rocky surface
    } else if ([2, 3, 4, 5].includes(atmCode)) {
      baseAlbedo = 0.5; // Thin atmosphere - moderate albedo
    } else if ([6, 7, 8].includes(atmCode)) {
      baseAlbedo = 0.55; // Standard/dense - cloud coverage
    } else if ([9, "A"].includes(atmCode)) {
      baseAlbedo = 0.6; // Very dense - high cloud coverage
    } else if (["B", "C"].includes(atmCode)) {
      baseAlbedo = 0.65; // Corrosive/insidious - thick clouds
    }

    // Albedo modifier based on hydrographics[^10]
    const hydroCode = planet.hydrographicsCode;

    if (hydroCode === 0) {
      albedoModifier = -0.1; // No water - darker
    } else if (hydroCode <= 3) {
      albedoModifier = -0.05;
    } else if (hydroCode <= 7) {
      albedoModifier = 0; // Neutral
    } else {
      albedoModifier = 0.05; // More water - higher albedo
    }

    const finalAlbedo = Math.max(0.1, Math.min(0.9, baseAlbedo + albedoModifier));

    return finalAlbedo;
  }

  /**
   * Calculate greenhouse factor
   * Reference: Handbook page 112 - Greenhouse Factor Determination
   */
  calculateGreenhouseFactor(planet) {
    const atmCode = planet.atmosphereCode;

    // Base greenhouse factor by atmosphere code[^5]
    const greenhouseTable = {
      0: 0, // None
      1: 0.01, // Trace
      2: 0.05, // Very thin
      3: 0.08,
      4: 0.1, // Thin
      5: 0.15,
      6: 0.2, // Standard
      7: 0.25,
      8: 0.3, // Dense
      9: 0.4, // Very dense
      A: 0.5, // Exotic dense
      B: 0.8, // Corrosive (strong greenhouse)
      C: 0.9, // Insidious (extreme greenhouse)
      D: 0.05, // Low
      E: 0.15, // Unusual
    };

    let baseFactor = greenhouseTable[atmCode] || 0;

    // Apply hydrographics modifier
    // Water bodies increase greenhouse effect[^6]
    const hydroCode = planet.hydrographicsCode;
    const hydroModifier = hydroCode * 0.02; // 0-20% increase

    const finalFactor = Math.max(0, Math.min(1, baseFactor + hydroModifier));

    return finalFactor;
  }

  /**
   * Classify temperature level
   * Reference: Handbook page 113 - Temperature Classifications
   */
  classifyTemperature(tempKelvin, planet) {
    const tempCelsius = tempKelvin - 273.15;

    // Standard classifications[^11,^12]
    if (tempCelsius < 244) {
      return "Frozen"; // Below -29°C
    } else if (tempCelsius < 273) {
      return "Very Cold"; // -29 to 0°C
    } else if (tempCelsius < 293) {
      return "Cold"; // 0 to 20°C
    } else if (tempCelsius < 323) {
      return "Temperate"; // 20 to 50°C
    } else if (tempCelsius < 353) {
      return "Hot"; // 50 to 80°C
    } else {
      return "Very Hot"; // Above 80°C
    }
  }

  /**
   * Generate climate zones based on axial tilt
   * Reference: Handbook pages 115-118 - Climate Zones
   */
  generateClimateZones(planet) {
    const axialTilt = planet.axialTilt;
    const zones = {};

    // Define zone latitudes based on axial tilt[^13]
    // Tropical zones: 0 to (90 - axial tilt - 23.5) degrees latitude
    // Temperate zones: (90 - axial tilt - 23.5) to (90 - axial tilt) degrees
    // Polar/Arctic zones: (90 - axial tilt) to 90 degrees

    const tropicalEdge = Math.max(0, 23.5 - axialTilt);
    const temperateTropicalBoundary = 90 - axialTilt - 23.5;
    const polarBoundary = 90 - axialTilt;

    // For tidally locked worlds[^14]
    if (planet.isTidallyLocked) {
      zones.type = "Tidally Locked";
      zones.daylight = {
        name: "Daylight Hemisphere",
        latitude: "0 to 90°N",
        characteristics: "Perpetually hot",
      };
      zones.twilight = {
        name: "Twilight Zone",
        latitude: "±90°",
        characteristics: "Temperate, perpetual sunset",
      };
      zones.night = {
        name: "Night Hemisphere",
        latitude: "0 to 90°S",
        characteristics: "Perpetually frozen",
      };
      return;
    }

    // Normal climate zones for non-tidally-locked worlds
    if (axialTilt < 23.5) {
      // Standard zones - three distinct regions
      zones.type = "Standard";

      zones.polar = {
        name: "Polar/Arctic",
        latitudeLow: polarBoundary,
        latitudeHigh: 90,
        coverage: ((180 - polarBoundary * 2) / 180) * 100,
      };

      zones.temperate = {
        name: "Temperate/Middle",
        latitudeLow: temperateTropicalBoundary,
        latitudeHigh: polarBoundary,
        coverage: (((polarBoundary - temperateTropicalBoundary) * 2) / 180) * 100,
      };

      zones.tropical = {
        name: "Tropical/Equatorial",
        latitudeLow: 0,
        latitudeHigh: temperateTropicalBoundary,
        coverage: ((temperateTropicalBoundary * 2) / 180) * 100,
      };
    } else if (axialTilt >= 45) {
      // Extreme tilt - no middle zones[^15]
      zones.type = "Extreme Tilt";

      zones.arctic = {
        name: "Arctic/Polar",
        latitudeLow: 90 - axialTilt,
        latitudeHigh: 90,
        coverage: ((axialTilt * 2) / 180) * 100,
      };

      zones.tropical = {
        name: "Tropical (Extreme)",
        latitudeLow: 0,
        latitudeHigh: 90 - axialTilt,
        coverage: ((180 - axialTilt * 2) / 180) * 100,
      };
    } else {
      // Moderate tilt - transitional
      zones.type = "Moderate Tilt";
      zones.description = `Axial tilt ${axialTilt}° creates overlap between zones`;
    }

    planet.climateZones = zones;

    this.generationLog.push({
      step: "3B-ClimateZones",
      world: planet.id,
      axialTilt: axialTilt,
      type: zones.type,
    });
  }

  /**
   * Calculate seasonal temperature variations
   * Reference: Handbook pages 115-116 - Seasonal Modifiers
   */
  calculateSeasonalTemperatures(planet) {
    const meanTemp = planet.meanTemperature;
    const axialTilt = planet.axialTilt;

    // Seasonal variation increases with axial tilt[^16]
    const seasonalVariation = axialTilt * 2; // Rough approximation

    // High temperature: perihelion + summer[^17]
    planet.highTemperature = meanTemp + seasonalVariation;
    planet.highTemperatureCelsius = planet.highTemperature - 273.15;

    // Low temperature: aphelion + winter[^17]
    planet.lowTemperature = meanTemp - seasonalVariation;
    planet.lowTemperatureCelsius = planet.lowTemperature - 273.15;

    // Apply eccentricity modifier[^18]
    if (planet.eccentricity && planet.eccentricity > 0.1) {
      const eccentricityEffect = planet.eccentricity * 50; // Rough scaling
      planet.highTemperature += eccentricityEffect;
      planet.lowTemperature -= eccentricityEffect;
    }

    // Rotation period affects daily temperature variation[^19]
    if (!planet.rotationPeriod) {
      planet.rotationPeriod = 24; // Default Earth-like
    }

    const rotationFactor = planet.rotationPeriod / 24;
    planet.dailyVariation = 30 * (planet.rotationFactor || 1); // Varies by rotation

    this.generationLog.push({
      step: "3B-SeasonalTemperatures",
      world: planet.id,
      mean: meanTemp.toFixed(1),
      high: planet.highTemperature.toFixed(1),
      low: planet.lowTemperature.toFixed(1),
      variation: seasonalVariation.toFixed(1),
    });
  }

  /**
   * Classify world's climate type
   * Reference: Handbook pages 120-126 - Climate Classification Systems
   */
  classifyClimateType(planet) {
    const tempClass = planet.temperatureClassification;
    const hydroCode = planet.hydrographicsCode;
    const atmCode = planet.atmosphereCode;

    let climateType = "Unknown";
    let climateDescription = "";

    // Combine temperature + hydrographics + atmosphere[^20]
    if (tempClass === "Frozen") {
      if (hydroCode >= 7) {
        climateType = "Ice World";
        climateDescription = "Frozen with ice sheets and glaciers";
      } else {
        climateType = "Sterile Ice";
        climateDescription = "Frozen with minimal water";
      }
    } else if (tempClass === "Very Cold") {
      climateType = "Arctic";
      climateDescription = "Perpetually cold with permafrost";
    } else if (tempClass === "Cold") {
      if (hydroCode >= 5) {
        climateType = "Tundra";
        climateDescription = "Cold with Arctic vegetation";
      } else {
        climateType = "Barren Cold";
        climateDescription = "Cold and arid";
      }
    } else if (tempClass === "Temperate") {
      if (hydroCode >= 7) {
        climateType = "Garden";
        climateDescription = "Temperate and wet - ideal for life";
      } else if (hydroCode >= 4) {
        climateType = "Temperate";
        climateDescription = "Temperate with moderate water";
      } else if (hydroCode >= 1) {
        climateType = "Steppe";
        climateDescription = "Temperate grasslands";
      } else {
        climateType = "Desert";
        climateDescription = "Temperate but dry";
      }
    } else if (tempClass === "Hot") {
      if (hydroCode >= 7) {
        climateType = "Wet Tropical";
        climateDescription = "Hot and humid with high rainfall";
      } else if (hydroCode >= 4) {
        climateType = "Tropical";
        climateDescription = "Hot with some water";
      } else if (hydroCode >= 1) {
        climateType = "Savanna";
        climateDescription = "Hot with scattered vegetation";
      } else {
        climateType = "Desert";
        climateDescription = "Hot and arid";
      }
    } else if (tempClass === "Very Hot") {
      climateType = "Inferno";
      climateDescription = "Extremely hot - hostile conditions";
    }

    // Special cases
    if (planet.isTidallyLocked) {
      climateType = `${climateType} (Tidally Locked)`;
      climateDescription = "Half perpetually frozen, half perpetually hot";
    }

    if (planet.runawayGreenhouse) {
      climateType = "Greenhouse Hell";
      climateDescription = "Runaway greenhouse effect - uninhabitable";
    }

    planet.climateType = climateType;
    planet.climateDescription = climateDescription;

    this.generationLog.push({
      step: "3B-ClimateType",
      world: planet.id,
      type: climateType,
      description: climateDescription,
    });
  }
  // #endregion
  // #region Phase 3C: Population and Settlements
  /**
   * PHASE 3C: POPULATION & SETTLEMENTS FOR ALL WORLDS
   * Reference: Handbook pages 147-191 - Social Characteristics
   *
   * Process:
   * - Mainworld: Full population generation (Pop, Gov, Law, Starport, TL, etc.)
   * - Secondary Planets: Simplified population generation
   * - Secondary Moons: Optional population (roll for habitability)
   */
  generatePopulationAndSettlementsForAllWorlds() {
    console.log("  Generating population & settlements...\n");

    if (!this.mainworld) {
      console.warn("  ⚠ No mainworld - skipping population generation");
      return;
    }

    // ============================================
    // STEP 1: MAINWORLD (Full Details)
    // ============================================
    console.log("  Step 1: Mainworld Population");
    this.generateMainworldPopulation(this.mainworld);

    // ============================================
    // STEP 2: SECONDARY TERRESTRIAL PLANETS
    // ============================================
    console.log("\n  Step 2: Secondary Planets Population");
    const secondaryPlanets = this.terrestrialPlanets.filter((p) => p !== this.mainworld && p.hydrographicsCode >= 0);

    if (secondaryPlanets.length > 0) {
      secondaryPlanets.forEach((planet) => {
        this.generateSecondaryWorldPopulation(planet);
      });
      console.log(`    Generated population for ${secondaryPlanets.length} secondary planets`);
    } else {
      console.log("    No suitable secondary planets for settlement");
    }

    // ============================================
    // STEP 3: SECONDARY MOONS
    // ============================================
    console.log("\n  Step 3: Secondary Moons Population (Optional)");
    let moonsProcessed = 0;
    this.allWorlds.forEach((world) => {
      if (world.moons && world.moons.length > 0) {
        world.moons.forEach((moon) => {
          // Only populate moons with suitable conditions
          if (moon.atmosphereCode >= 2 && moon.hydrographicsCode >= 1) {
            const shouldPopulate = this.roller.roll2D() >= 10; // 25% chance

            if (shouldPopulate) {
              this.generateSecondaryWorldPopulation(moon);
              moonsProcessed++;
            }
          }
        });
      }
    });

    if (moonsProcessed > 0) {
      console.log(`    Generated population for ${moonsProcessed} moons`);
    } else {
      console.log("    No moons suitable for settlement");
    }

    this.generationLog.push({
      step: "Phase 3C Complete",
      action: "Population & settlements generated",
      mainworld: this.mainworld.id,
      secondaryPlanets: secondaryPlanets.length,
      populatedMoons: moonsProcessed,
    });

    console.log(`\n  ✓ Population generation complete`);
  }

  /**
   * Generate mainworld population and social characteristics
   * Reference: Handbook pages 148-156 - Population Determination
   */
  generateMainworldPopulation(mainworld) {
    // Step 1: Determine population code[^2]
    // Roll 2D-2 for population code
    const popRoll = this.roller.roll2D() - 2;
    const populationCode = Math.max(0, popRoll);

    mainworld.populationCode = populationCode;
    mainworld.populationRoll = popRoll;

    // Step 2: Calculate actual population[^2]
    const populationValue = this.calculatePopulation(populationCode);
    mainworld.population = populationValue;
    mainworld.populationExact = this.getExactPopulation(populationCode);

    this.generationLog.push({
      step: "3C-Population",
      world: mainworld.id,
      roll: popRoll,
      code: populationCode,
      population: mainworld.populationExact,
    });

    // Step 3: Habitability check - verify world is inhabitable[^1]
    mainworld.isInhabitable = this.checkWorldInhabitability(mainworld);

    if (!mainworld.isInhabitable && populationCode > 0) {
      // Force depopulation if world isn't suitable
      this.generationLog.push({
        step: "3C-UnhabitableOverride",
        world: mainworld.id,
        warning: "World conditions prevent population",
        populationAdjusted: 0,
      });
      mainworld.populationCode = 0;
      mainworld.population = 0;
      mainworld.isAbandoned = true;
      return;
    }

    // Step 4: Determine government[^3]
    // Government = 2D-7 + Population code
    const govRoll = this.roller.roll2D();
    const govCode = Math.max(0, Math.min(15, govRoll - 7 + populationCode));
    mainworld.governmentCode = govCode;
    mainworld.governmentType = this.getGovernmentType(govCode);

    this.generationLog.push({
      step: "3C-Government",
      world: mainworld.id,
      roll: govRoll,
      dm: populationCode,
      code: govCode,
      type: mainworld.governmentType,
    });

    // Step 5: Determine law level[^4]
    // Law Level = 2D-7 + Government code
    const lawRoll = this.roller.roll2D();
    const lawLevel = Math.max(0, Math.min(15, lawRoll - 7 + govCode));
    mainworld.lawLevel = lawLevel;

    this.generationLog.push({
      step: "3C-LawLevel",
      world: mainworld.id,
      roll: lawRoll,
      dm: govCode,
      level: lawLevel,
    });

    // Step 6: Determine starport class[^5]
    // DMs based on population and government
    let starportDM = 0;
    if (populationCode >= 9) starportDM += 1;
    if (populationCode <= 3) starportDM -= 1;
    if ([0, 1, 2].includes(govCode)) starportDM -= 2;
    if (govCode === 6) starportDM -= 1;

    const starportRoll = this.roller.roll2D() + starportDM;
    mainworld.starport = this.getStarportClass(starportRoll);

    this.generationLog.push({
      step: "3C-Starport",
      world: mainworld.id,
      roll: starportRoll,
      dm: starportDM,
      class: mainworld.starport,
    });

    // Step 7: Determine technology level[^6]
    // Base TL = 1D + DMs for various factors
    let tlDM = 0;

    // Starport DMs[^7]
    const starportTLMap = { A: 6, B: 4, C: 2, D: 0, E: 0, X: -4 };
    tlDM += starportTLMap[mainworld.starport] || 0;

    // Size DM
    if (mainworld.size <= 1) tlDM += 2;
    if (mainworld.size === 2 || mainworld.size === 3) tlDM += 1;

    // Atmosphere DM
    if ([0, 1, "A", "B", "C"].includes(mainworld.atmosphereCode)) tlDM -= 2;
    if ([2, 3].includes(mainworld.atmosphereCode)) tlDM -= 1;

    // Hydrographics DM
    if (mainworld.hydrographicsCode === 0) tlDM -= 1;
    if (mainworld.hydrographicsCode === "A") tlDM += 1;

    // Population DM[^7]
    if (populationCode === 1 || populationCode === 2) tlDM -= 1;
    if (populationCode === 3 || populationCode === 4 || populationCode === 5) tlDM -= 1;
    if (populationCode >= 9) tlDM += 1;
    if (populationCode === "A") tlDM += 2;

    // Government DM
    if (govCode === 0) tlDM -= 4;
    if (govCode === 5) tlDM -= 2;
    if (govCode === 13) tlDM -= 2;

    const tlRoll = this.roller.roll1D() + tlDM;
    mainworld.technologyLevel = Math.max(0, tlRoll);

    this.generationLog.push({
      step: "3C-TechnologyLevel",
      world: mainworld.id,
      roll: tlRoll,
      dm: tlDM,
      tl: mainworld.technologyLevel,
    });

    // Step 8: Trade codes[^8]
    mainworld.tradeCodes = this.calculateTradeCodes(mainworld);

    // Step 9: Cultural characteristics
    this.generateCulturalCharacteristics(mainworld);

    // Step 10: Economic factors[^9]
    this.generateEconomicFactors(mainworld);

    // Step 11: Build UWP[^11]
    mainworld.uwp = this.buildUWP(mainworld);

    console.log(`  ${mainworld.id}: ${mainworld.uwp} (${mainworld.governmentType}, Pop ${populationCode})`);
  }

  /**
   * Calculate population value from code
   * Reference: Handbook page 149 - Population Code Values
   */
  calculatePopulation(code) {
    const populationRanges = {
      0: 0,
      1: 50,
      2: 500,
      3: 5000,
      4: 50000,
      5: 500000,
      6: 5000000,
      7: 50000000,
      8: 500000000,
      9: 5000000000,
      A: 50000000000,
      B: 500000000000,
      C: 5000000000000,
    };

    return populationRanges[code] || 0;
  }

  /**
   * Get exact population with P value variation
   * Reference: Handbook page 150 - P Value Addition
   */
  getExactPopulation(code) {
    const base = this.calculatePopulation(code);

    if (code === 0) {
      return 0;
    }

    // Roll for P value (1-9 or 1-F for code A+)
    let pValue;
    if (code <= 9) {
      pValue = this.roller.roll1D(9);
    } else {
      // For A+, use d10 for finer granularity
      pValue = this.roller.roll1D(15);
    }

    // Optional: Add secondary digit with d10
    const secondary = this.roller.roll1D(10);

    const multiplier = (pValue + secondary / 10) / 10;
    return Math.floor(base * multiplier);
  }

  /**
   * Check if world is habitable for settlement
   * Reference: Handbook page 133 - Habitability Rating
   */
  checkWorldInhabitability(world) {
    let score = 0;

    // Size: 2-10 is habitable[^1]
    if (world.size >= 2 && world.size <= 10) score++;

    // Atmosphere: 2-9 is breathable[^1]
    if ([2, 3, 4, 5, 6, 7, 8, 9].includes(world.atmosphereCode)) score++;

    // Hydrographics: 4-9 for farming, 1+ for some settlement[^1]
    if (world.hydrographicsCode >= 1 && world.hydrographicsCode <= 10) score++;

    // Temperature: Between -50 and +50°C is habitable[^1]
    if (world.meanTemperatureCelsius >= -50 && world.meanTemperatureCelsius <= 50) score++;

    return score >= 3; // Need at least 3 favorable conditions
  }

  /**
   * Get government type name
   * Reference: Handbook page 156 - Government Types
   */
  getGovernmentType(code) {
    const types = {
      0: "None",
      1: "Company/Corporation",
      2: "Participating Democracy",
      3: "Self-Perpetuating Oligarchy",
      4: "Representative Democracy",
      5: "Feudal Technocracy",
      6: "Captive Government",
      7: "Balkanisation",
      8: "Civil Service Bureaucracy",
      9: "Impersonal Bureaucracy",
      A: "Charismatic Dictator",
      B: "Non-Charismatic Leader",
      C: "Theocracy",
      D: "Transhuman Collective",
      E: "Asteriod/Orbital Prison",
      F: "Underwater Collective",
    };

    return types[code] || "Unknown";
  }

  /**
   * Get starport class
   * Reference: Handbook pages 189-194 - Starport Facilities
   */
  getStarportClass(roll) {
    if (roll >= 16) return "A"; // Excellent
    if (roll >= 12) return "B"; // Good
    if (roll >= 8) return "C"; // Routine
    if (roll >= 4) return "D"; // Poor
    if (roll >= 0) return "E"; // Frontier
    return "X"; // None
  }

  /**
   * Calculate world's trade codes
   * Reference: Handbook page 186 - Trade Codes Classification
   */
  calculateTradeCodes(world) {
    const codes = [];

    // Agricultural: Atm 4-8, Hydro 4-8, Pop 5-7[^8]
    if (
      [4, 5, 6, 7, 8].includes(world.atmosphereCode) &&
      [4, 5, 6, 7, 8].includes(world.hydrographicsCode) &&
      [5, 6, 7].includes(world.populationCode)
    ) {
      codes.push("Ag");
    }

    // Asteroid: Size 0, Hydro 0
    if (world.size === 0 && world.hydrographicsCode === 0) {
      codes.push("As");
    }

    // Barren: Size 0, Atm 0, Hydro 0
    if (world.size === 0 && world.atmosphereCode === 0 && world.hydrographicsCode === 0) {
      codes.push("Ba");
    }

    // Desert: Atm 2-9, Hydro 0
    if ([2, 3, 4, 5, 6, 7, 8, 9].includes(world.atmosphereCode) && world.hydrographicsCode === 0) {
      codes.push("De");
    }

    // Fluid Oceans: Atm A-C/F+, Hydro 1+
    if (["A", "B", "C", "F"].includes(world.atmosphereCode) && world.hydrographicsCode >= 1) {
      codes.push("Fl");
    }

    // Garden: Size 6-8, Atm 5/6/8, Hydro 5-7[^8]
    if (
      [6, 7, 8].includes(world.size) &&
      [5, 6, 8].includes(world.atmosphereCode) &&
      [5, 6, 7].includes(world.hydrographicsCode)
    ) {
      codes.push("Ga");
    }

    // High Population: Pop 9+
    if (world.populationCode >= 9) {
      codes.push("Hi");
    }

    // High Tech: TL C+
    if (world.technologyLevel >= 12) {
      codes.push("Ht");
    }

    // Ice-Capped: Size 0-1, Hydro 1+
    if ([0, 1].includes(world.size) && world.hydrographicsCode >= 1) {
      codes.push("Ic");
    }

    // Industrial: Size 0-2/4/7/9-C, Pop 9+[^8]
    if (([0, 1, 2, 4, 7, 9].includes(world.size) || world.size >= 10) && world.populationCode >= 9) {
      codes.push("In");
    }

    // Low Population: Pop 1-3
    if ([1, 2, 3].includes(world.populationCode)) {
      codes.push("Lo");
    }

    // Low Tech: TL 1-5
    if (world.technologyLevel >= 1 && world.technologyLevel <= 5) {
      codes.push("Lt");
    }

    // Non-Agricultural: Atm 0-3, Hydro 0-3, Pop 6+
    if (
      [0, 1, 2, 3].includes(world.atmosphereCode) &&
      [0, 1, 2, 3].includes(world.hydrographicsCode) &&
      world.populationCode >= 6
    ) {
      codes.push("Na");
    }

    // Non-Industrial: Size 4-6, Pop 4-6
    if ([4, 5, 6].includes(world.size) && [4, 5, 6].includes(world.populationCode)) {
      codes.push("Ni");
    }

    // Poor: Atm 2-5, Hydro 0-3
    if ([2, 3, 4, 5].includes(world.atmosphereCode) && [0, 1, 2, 3].includes(world.hydrographicsCode)) {
      codes.push("Po");
    }

    // Rich: Atm 6/8, Gov 4/6/9, Pop 6-8[^8]
    if (
      [6, 8].includes(world.atmosphereCode) &&
      [4, 6, 9].includes(world.governmentCode) &&
      [6, 7, 8].includes(world.populationCode)
    ) {
      codes.push("Ri");
    }

    // Vacuum: Size 0, Atm 0
    if (world.size === 0 && world.atmosphereCode === 0) {
      codes.push("Va");
    }

    // Waterworld: Hydro A+
    if (world.hydrographicsCode === "A" || world.hydrographicsCode >= 10) {
      codes.push("Wa");
    }

    return codes;
  }

  /**
   * Generate cultural characteristics
   * Reference: Handbook page 181 - Culture Generation
   */
  generateCulturalCharacteristics(world) {
    // 2D + DMs for each cultural trait[^10]
    const culturalTraits = {
      diversity: this.roller.roll2D(), // How mixed the population is
      xenophilia: this.roller.roll2D(), // Attitude toward outsiders
      uniqueness: this.roller.roll2D(), // How different from baseline human
      symbology: this.roller.roll2D(), // Religious/philosophical depth
      cohesion: this.roller.roll2D(), // How unified the society is
      progressiveness: this.roller.roll2D(), // Technological advancement desire
    };

    // Apply DMs based on world characteristics
    if (world.populationCode >= 8) {
      culturalTraits.diversity += 1;
      culturalTraits.xenophilia -= 1; // Large diverse populations can be insular
    }

    if (world.technologyLevel >= 10) {
      culturalTraits.progressiveness += 2;
    }

    if ([0, 1, 2].includes(world.governmentCode)) {
      culturalTraits.xenophilia += 1; // Open governments more receptive
    }

    world.culturalCharacteristics = culturalTraits;

    this.generationLog.push({
      step: "3C-CulturalCharacteristics",
      world: world.id,
      traits: culturalTraits,
    });
  }

  /**
   * Generate economic factors
   * Reference: Handbook pages 185-191 - Economics
   */
  generateEconomicFactors(world) {
    // Importance rating[^9]
    let importance = 0;

    if (world.starport === "A" || world.starport === "B") importance += 1;
    if (world.starport === "D" || world.starport === "E" || world.starport === "X") importance -= 1;

    if (world.populationCode <= 6) importance -= 1;
    if (world.populationCode >= 9) importance += 1;

    if (world.technologyLevel <= 8) importance -= 1;
    if (world.technologyLevel >= 10) importance += 1;
    if (world.technologyLevel >= 16) importance += 2;

    // Trade code bonuses
    if (world.tradeCodes.includes("Ag")) importance += 1;
    if (world.tradeCodes.includes("In")) importance += 1;
    if (world.tradeCodes.includes("Ri")) importance += 1;

    world.importanceRating = Math.max(-3, Math.min(5, importance));

    // Resource rating[^9]
    // 2D-7 + Size + DMs
    const resourceRoll = this.roller.roll2D();
    let resourceDM = 0;

    if (world.technologyLevel <= 3) resourceDM -= 2;
    if (world.technologyLevel >= 12) resourceDM += 1;

    const resourceRating = Math.max(2, resourceRoll - 7 + world.size + resourceDM);
    world.resourceRating = Math.min(12, resourceRating);

    // Infrastructure estimate
    const infrastructureBase = Math.floor(world.populationCode / 2);
    const infrastructureBonus = world.starport === "A" ? 2 : world.starport === "B" ? 1 : 0;
    world.infrastructure = Math.max(0, infrastructureBase + infrastructureBonus);

    // GWP (Gross World Product) estimation
    // Simplified: Pop × Resource × Infrastructure × TL factor
    const tlFactor = world.technologyLevel / 10 || 0.1;
    const gwp = Math.floor(
      this.calculatePopulation(world.populationCode) *
        (world.resourceRating / 10) *
        (world.infrastructure || 1) *
        tlFactor,
    );

    world.gwp = gwp;
    world.gwpPerCapita = gwp > 0 ? Math.floor(gwp / this.calculatePopulation(world.populationCode)) : 0;

    this.generationLog.push({
      step: "3C-Economics",
      world: world.id,
      importance: world.importanceRating,
      resources: world.resourceRating,
      infrastructure: world.infrastructure,
      gwp: world.gwp,
    });
  }
  /**
   * Generate complete UWP for mainworld
   * Reference: Handbook page 148 - UWP Format
   */
  generateMainworldUWP() {
    if (!this.mainworld) {
      throw new Error("Cannot generate UWP without mainworld");
    }

    const mw = this.mainworld;

    // Ensure all required fields exist
    const required = [
      "starport",
      "size",
      "atmosphereCode",
      "hydrographicsCode",
      "populationCode",
      "governmentCode",
      "lawLevel",
      "technologyLevel",
    ];

    const missing = required.filter((field) => mw[field] === undefined);
    if (missing.length > 0) {
      console.warn(`⚠ Missing UWP fields: ${missing.join(", ")}`);
    }

    // Build UWP string
    const toHex = (val) => {
      if (typeof val === "number" && val > 9) {
        return val.toString(16).toUpperCase();
      }
      return val;
    };

    const uwp = [
      mw.starport || "X",
      toHex(mw.size || 0),
      toHex(mw.atmosphereCode || 0),
      toHex(mw.hydrographicsCode || 0),
      toHex(mw.populationCode || 0),
      toHex(mw.governmentCode || 0),
      toHex(mw.lawLevel || 0),
      toHex(mw.technologyLevel || 0),
    ].join("");

    mw.uwp = uwp;

    console.log(`\n✅ MAINWORLD UWP: ${uwp}`);
    console.log(`   ${mw.id} - ${mw.description}`);

    return uwp;
  }

  /**
   * Build Universal World Profile (UWP)
   * Reference: Handbook page 148 - UWP Format
   * Format: Starport Size Atmosphere Hydrographics Population Government Law Tech
   * Example: C566776-8
   */
  buildUWP(world) {
    // Convert codes to hex where needed
    const hexMap = {
      10: "A",
      11: "B",
      12: "C",
      13: "D",
      14: "E",
      15: "F",
    };

    const toHex = (val) => {
      if (typeof val === "number" && val > 9) {
        return hexMap[val] || val.toString(16).toUpperCase();
      }
      return val;
    };

    const uwp = [
      world.starport,
      toHex(world.size),
      toHex(world.atmosphereCode),
      toHex(world.hydrographicsCode),
      toHex(world.populationCode),
      toHex(world.governmentCode),
      toHex(world.lawLevel),
      toHex(world.technologyLevel),
    ].join("");

    return uwp;
  }

  /**
   * Generate secondary world population (simplified)
   * Reference: Handbook page 155 - Secondary World Populations
   */
  generateSecondaryWorldPopulation(planet) {
    // Guard: Check if mainworld exists
    if (!this.mainworld) {
      console.warn(`  ⚠ No mainworld available for ${planet.id} - skipping secondary population`);
      planet.populationCode = 0;
      planet.population = 0;
      return;
    }
    // Secondary worlds have lower populations
    const roll = this.roller.roll2D() - 3; // -3 modifier for secondary worlds
    const popCode = Math.max(0, roll);

    planet.populationCode = popCode;
    planet.population = this.calculatePopulation(popCode);

    // Simplified government
    const govRoll = this.roller.roll2D();
    planet.governmentCode = Math.max(0, govRoll - 7 + popCode);
    planet.governmentType = this.getGovernmentType(planet.governmentCode);

    // Simplified starport
    planet.starport = popCode >= 4 ? "D" : "E";

    // Simplified TL
    planet.technologyLevel = Math.max(3, this.mainworld.technologyLevel - 2);

    this.generationLog.push({
      step: "3C-SecondaryPopulation",
      world: planet.id,
      popCode: popCode,
      population: planet.population,
    });
  }
  // #endregion
  // #region Phase 3D: UWP Generation
  /**
   * UWP GENERATION FOR ALL WORLDS
   * Reference: Handbook page 148 - UWP Format
   *
   * Generates Universal World Profile for:
   * - Mainworld (has full UWP)
   * - Secondary worlds (has abbreviated UWP)
   * - Moons (if populated)
   */
  generateUWPForAllWorlds() {
    console.log("  Generating UWP for all worlds...\n");

    const uwpResults = [];

    // Mainworld UWP (full)
    if (this.mainworld) {
      const mainworldUWP = this.buildUWP(this.mainworld);
      this.mainworld.uwp = mainworldUWP;

      uwpResults.push({
        world: this.mainworld.id,
        type: "Mainworld",
        uwp: mainworldUWP,
        population: this.mainworld.populationCode,
      });

      console.log(`  ✓ ${this.mainworld.id}: ${mainworldUWP} (Mainworld)`);
    }

    // Secondary terrestrial planets
    this.terrestrialPlanets.forEach((planet) => {
      if (planet !== this.mainworld) {
        const uwp = this.buildUWP(planet);
        planet.uwp = uwp;

        if (planet.populationCode > 0) {
          uwpResults.push({
            world: planet.id,
            type: "Secondary Planet",
            uwp: uwp,
            population: planet.populationCode,
          });

          console.log(`  ✓ ${planet.id}: ${uwp} (Secondary)`);
        }
      }
    });

    // Secondary moons (if populated)
    this.allWorlds.forEach((world) => {
      if (world.moons && world.moons.length > 0) {
        world.moons.forEach((moon) => {
          if (moon !== this.mainworld && moon.populationCode > 0) {
            const uwp = this.buildUWP(moon);
            moon.uwp = uwp;

            uwpResults.push({
              world: moon.id,
              type: "Secondary Moon",
              uwp: uwp,
              population: moon.populationCode,
              parentWorld: world.id,
            });

            console.log(`  ✓ ${moon.id}: ${uwp} (Moon of ${world.id})`);
          }
        });
      }
    });

    this.generationLog.push({
      step: "UWP Generation",
      action: "Generated UWP for all worlds",
      mainworld: this.mainworld?.uwp,
      secondaryCount: uwpResults.filter((r) => r.type !== "Mainworld").length,
      totalPopulated: uwpResults.filter((r) => r.population > 0).length,
    });

    console.log(`\n  Total UWPs generated: ${uwpResults.length}`);
  }

  /**
   * Build Universal World Profile (UWP) - UNIFIED FOR ALL WORLDS
   * Reference: Handbook page 148 - UWP Format
   * Format: Starport Size Atmosphere Hydrographics Population Government Law Tech
   * Example: C566776-8
   */
  buildUWP(world) {
    if (!world) return "X000000-0";

    const toHex = (val) => {
      if (val === undefined || val === null) return "0";
      if (typeof val === "number") {
        if (val > 9) return val.toString(16).toUpperCase();
        return val.toString();
      }
      // Already hex string like "A", "B", "C"
      return val.toString();
    };

    const uwp = [
      toHex(world.starport || "X"),
      toHex(world.size || 0),
      toHex(world.atmosphereCode !== undefined ? world.atmosphereCode : 0),
      toHex(world.hydrographicsCode !== undefined ? world.hydrographicsCode : 0),
      toHex(world.populationCode || 0),
      toHex(world.governmentCode || 0),
      toHex(world.lawLevel || 0),
      toHex(world.technologyLevel || 0),
    ].join("");

    return uwp;
  }

  // #endregion
  // #region Helper Methods
  /**
   * Validate that world generation prerequisites are met
   */
  validateGenerationPrerequisites() {
    const issues = [];

    // Check star system
    if (!this.starSystem) {
      issues.push("Missing star system");
      return issues;
    }

    // Check primary star
    if (!this.starSystem.primaryStar) {
      issues.push("Missing primary star");
      return issues;
    }

    // Check required star properties
    const star = this.starSystem.primaryStar;
    if (!star.luminosity) {
      issues.push("Primary star missing luminosity value");
    }
    if (!star.spectralClass) {
      issues.push("Primary star missing spectral class");
    }

    // Check habitable zone
    if (!this.habitableZone) {
      issues.push("Habitable zone not calculated");
    }

    // Check worlds collection
    if (!this.terrestrialPlanets || this.terrestrialPlanets.length === 0) {
      issues.push("No terrestrial planets generated");
    }

    return issues;
  }

  // #endregion
}

module.exports = WorldGenerator;
