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
  const completeSystem = worldGen.generateWorlds();

  if (!completeSystem) {
    throw new Error("World generation failed!");
  }

  console.log(`\n✓ Complete system generated!`);
  console.log(`\n📊 SYSTEM SUMMARY:`);
  console.log(`  Primary Star: ${completeSystem.primaryStar.classification}`);

  console.log(`\n🌍 TERRESTRIAL PLANETS WITH TEMPERATURE & CLIMATE:`);
  completeSystem.terrestrialPlanets.forEach((planet) => {
    console.log(`\n  ${planet.id}:`);
    console.log(`    Orbit: ${planet.orbit?.toFixed(2)} AU`);
    console.log(`    Size: ${planet.size}, Atmosphere: ${planet.atmosphereCode}`);
    console.log(`    Hydrographics: ${planet.hydrographicsCode} (${planet.hydrographicsPercent?.toFixed(1)}%)`);

    console.log(`\n    🌡️  TEMPERATURE:`);
    console.log(`      Mean: ${planet.meanTemperatureCelsius?.toFixed(1)}°C (${planet.meanTemperature?.toFixed(1)}K)`);
    console.log(`      High: ${planet.highTemperatureCelsius?.toFixed(1)}°C`);
    console.log(`      Low: ${planet.lowTemperatureCelsius?.toFixed(1)}°C`);
    console.log(`      Classification: ${planet.temperatureClassification}`);
    console.log(`      Axial Tilt: ${planet.axialTilt}°${planet.isTidallyLocked ? " (TIDALLY LOCKED)" : ""}`);

    console.log(`\n    🌍 CLIMATE:`);
    console.log(`      Type: ${planet.climateType}`);
    console.log(`      ${planet.climateDescription}`);

    if (planet.climateZones) {
      console.log(`      Zones: ${planet.climateZones.type}`);
    }

    console.log(`\n    ✓ HABITABILITY CHECK:`);
    console.log(`      Breathable: ${planet.isBreathable ? "✓ YES" : "✗ No"}`);
    console.log(`      Water: ${planet.hydrographicsPercent > 0 ? "✓ YES" : "✗ No"}`);
    console.log(`      Temperature: ${planet.temperatureClassification}`);
    console.log(`      Habitability Score: ${planet.habitabilityScore}`);
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
