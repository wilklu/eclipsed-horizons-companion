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
  console.log(`  Total Stars: ${completeSystem.totalStars}`);
  console.log(`\n🌍 WORLDS:`);
  console.log(`  Gas Giants: ${completeSystem.gasGiants.length}`);
  console.log(`  Planetoid Belts: ${completeSystem.planetoidBelts.length}`);
  console.log(`  Terrestrial Planets: ${completeSystem.terrestrialPlanets.length}`);

  // ✅ Display moon information
  console.log(`\n🌙 MOONS:`);
  completeSystem.allWorlds.forEach((world) => {
    if (world.moons && world.moons.length > 0) {
      console.log(`  ${world.id}: ${world.moons.length} moon(s)`);
      world.moons.forEach((moon) => {
        const retrograde = moon.isRetrograde ? " (retrograde)" : "";
        console.log(
          `    └─ ${moon.id}: Size ${moon.size}, Orbit ${moon.orbitPD} PD, Period ${moon.orbitalPeriodDays} days${retrograde}`,
        );
      });
    }
  });

  if (completeSystem.mainworld) {
    console.log(`\n⭐ MAINWORLD:`);
    console.log(
      `  ${completeSystem.mainworld.id}: Size ${completeSystem.mainworld.size}/${completeSystem.mainworld.atmosphere}/${completeSystem.mainworld.hydrographics}`,
    );
    if (completeSystem.mainworld.moons) {
      console.log(`  Moons: ${completeSystem.mainworld.moons.length}`);
    }
  }
} catch (error) {
  console.error("\n❌ Error:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
