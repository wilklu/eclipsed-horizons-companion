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
  const completeSystem = starGen.generateSystem();

  if (!completeSystem) {
    throw new Error("Star generation failed!");
  }

  // Phase 2: Generate worlds
  console.log("✓ PHASE 2: WORLD GENERATION\n");
  const worldGen = new WorldGenerator(completeSystem);
  const result = worldGen.generateWorlds();

  if (!result.mainworld) {
    throw new Error("No mainworld generated");
  }

  console.log(`\n✅ MAINWORLD DETERMINATION COMPLETE\n`);
  console.log(`Mainworld: ${result.mainworld.id}`);
  console.log(`Type: ${result.mainworld.candidateType}`);

  if (result.mainworld.parentWorld) {
    console.log(`Body: Moon of ${result.mainworld.parentWorld}`);
    console.log(`Designation: ${result.mainworld.moonDesignation}`);
    console.log(`Orbital Position: ${result.mainworld.orbitPD} PD`);
  }

  console.log(`\nSelection Method: ${result.mainworld.selectionMethod}`);
  console.log(`Habitability Rating: ${result.mainworld.habitabilityRating}/9`);
  console.log(`Resource Rating: ${result.mainworld.resourceRating}/12`);
  console.log(`Refueling Quality: ${result.mainworld.refuelingQuality}/5`);

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
