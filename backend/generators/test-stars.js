// test-stars.js
const StarGenerator = require("./StarGenerator");
const WorldGenerator = require("./WorldGenerator");

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║     TRAVELLER SYSTEM GENERATION TEST (Phase 1 & 2)             ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

try {
  const starGen = new StarGenerator();

  // Phase 1: Generate stars
  console.log("✓ PHASE 1: STAR GENERATION\n");
  const system = starGen.generateSystem();

  if (!system) {
    throw new Error("Star generation failed!");
  }

  // Phase 2: Generate worlds
  console.log("✓ PHASE 2: WORLD GENERATION\n");
  const worldGen = new WorldGenerator(system);
  // test-stars.js - Updated display
  const completeSystem = worldGen.generateWorlds();

  if (!completeSystem) {
    throw new Error("World generation failed!");
  }

  console.log(`\n✓ Complete system generated!`);
  console.log(`\n📊 SYSTEM SUMMARY:`);
  console.log(`  Primary Star: ${completeSystem.primaryStar.classification}`);

  console.log(`\n🌍 TERRESTRIAL PLANETS:`);
  completeSystem.terrestrialPlanets.forEach((planet) => {
    console.log(`\n  ${planet.id}:`);
    console.log(`    Size: ${planet.size}, Orbit: ${planet.orbit?.toFixed(2)} AU`);
    console.log(`    Atmosphere: ${planet.atmosphereCode} (${planet.atmosphereType})`);
    console.log(`      Pressure: ${planet.atmospherePressure?.toFixed(2)} bar`);
    if (planet.isBreathable) {
      console.log(`      ✓ BREATHABLE`);
    }
    console.log(`    Hydrographics: ${planet.hydrographicsCode} (${planet.hydrographicsPercent?.toFixed(1)}%)`);
    console.log(`    Surface: ${planet.surfaceFeatures?.distributionPattern || "Unknown"}`);
    console.log(`    Habitability: ${planet.habitabilityScore} - ${planet.habitabilityFactors?.join(", ") || "N/A"}`);

    if (planet.moons && planet.moons.length > 0) {
      console.log(`    🌙 Moons: ${planet.moons.length}`);
    }
  });

  if (completeSystem.mainworld) {
    console.log(`\n⭐ MAINWORLD: ${completeSystem.mainworld.id}`);
    console.log(`  Atmosphere: ${completeSystem.mainworld.atmosphereCode}`);
    console.log(`  Hydrographics: ${completeSystem.mainworld.hydrographicsCode}`);
    console.log(`  Habitability Score: ${completeSystem.mainworld.habitabilityScore}`);
  }
} catch (error) {
  console.error("\n❌ Error:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
