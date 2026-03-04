// test-stars.js
const StarGenerator = require("./starGenerator");

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║       STAR SYSTEM GENERATION TEST SUITE (Node.js)              ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

try {
  const generator = new StarGenerator();

  // Verify methods exist
  if (typeof generator.generateSystem !== "function") {
    throw new Error("generateSystem() method not found!");
  }
  if (typeof generator.testStarGeneration !== "function") {
    throw new Error("testStarGeneration() method not found!");
  }

  console.log("✓ All required methods found\n");

  // Run the test suite
  generator.testStarGeneration();

  console.log("\n✓ Test suite completed successfully!");
} catch (error) {
  console.error("\n❌ Error:");
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
}
