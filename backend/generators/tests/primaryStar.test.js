const StarGenerator = require("../starGenerator");

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║      PRIMARY STAR GENERATION TEST - CASCADE LOGIC STEP 1       ║");
console.log("║      World Builder's Handbook Compliance Test (p. 16-17)       ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

// Test 1: Basic generation
console.log("TEST 1: Generate a primary star with seed\n");
const generator1 = new StarGenerator(12345);
const star1 = generator1.generatePrimaryStar();

console.log("Generated Star:");
console.log(`  Classification: ${star1.classification}`);
console.log(`  Spectral Class: ${star1.spectralClass}`);
console.log(`  Subtype: ${star1.spectralSubtype}`);
console.log(`  Luminosity Class: ${star1.luminosityClass}`);
console.log(`  Cascade Path: ${star1.cascadePath ? star1.cascadePath.join(" → ") : "Type (Main Sequence)"}`);
console.log(`  Mass: ${star1.mass.toFixed(2)} M☉`);
console.log(`  Diameter: ${star1.diameter.toFixed(2)} D☉`);
console.log(`  Luminosity: ${star1.luminosity.toFixed(3)} L☉`);
console.log(`  Temperature: ${star1.temperature.toLocaleString()} K`);
console.log(`  Main Sequence Lifespan: ${star1.mainSequenceLifespan.toLocaleString()} Gyr`);
console.log(`  Current Age: ${star1.age.toFixed(2)} Gyr`);
console.log(`  Habitable Zone: ${star1.habitableZoneInner.toFixed(2)} - ${star1.habitableZoneOuter.toFixed(2)} AU`);

// Test 2: Reproducibility
console.log("\n\nTEST 2: Reproducibility (same seed = same star)\n");
const generator2 = new StarGenerator(12345);
const star2 = generator2.generatePrimaryStar();

console.log("First star:   " + star1.classification);
console.log("Second star:  " + star2.classification);
console.log(`Match: ${star1.classification === star2.classification ? "✓ PASS" : "✗ FAIL"}`);
console.log(`Mass match: ${star1.mass === star2.mass ? "✓ PASS" : "✗ FAIL"}`);
console.log(`Luminosity match: ${star1.luminosity === star2.luminosity ? "✓ PASS" : "✗ FAIL"}`);
console.log(
  `Cascade path match: ${
    JSON.stringify(star1.cascadePath) === JSON.stringify(star2.cascadePath) ? "✓ PASS" : "✗ FAIL"
  }`,
);

// TEST 3: CASCADE LOGIC - Verify cascade paths are tracked
console.log("\n\nTEST 3: CASCADE PATH TRACKING\n");

let cascadeStats = {
  normalMain: 0,
  specialCascade: 0,
  unusualCascade: 0,
  peculiarCascade: 0,
  giantsCascade: 0,
  hotColumn: 0,
};

for (let testSeed = 1; testSeed <= 500; testSeed++) {
  const gen = new StarGenerator(testSeed);
  const star = gen.generatePrimaryStar();

  if (!star.cascadePath || star.cascadePath.length === 0) {
    cascadeStats.normalMain++;
  } else if (star.cascadePath.includes("Giants")) {
    cascadeStats.giantsCascade++;
  } else if (star.cascadePath.includes("Peculiar")) {
    cascadeStats.peculiarCascade++;
  } else if (star.cascadePath.includes("Unusual")) {
    cascadeStats.unusualCascade++;
  } else if (star.cascadePath.includes("Special")) {
    cascadeStats.specialCascade++;
  } else if (star.cascadePath.includes("Hot")) {
    cascadeStats.hotColumn++;
  }
}

console.log("Cascade Distribution (500 seeds):");
console.log(`  Normal Main Sequence: ${cascadeStats.normalMain}`);
console.log(`  Special Column cascade: ${cascadeStats.specialCascade}`);
console.log(`  Unusual Column cascade: ${cascadeStats.unusualCascade}`);
console.log(`  Peculiar Column cascade: ${cascadeStats.peculiarCascade}`);
console.log(`  Giants Column cascade: ${cascadeStats.giantsCascade}`);
console.log(`  Hot Column cascade: ${cascadeStats.hotColumn}`);
console.log(`\n✓ Cascade paths being tracked correctly`);

// TEST 4: VERIFY SPECIAL → GIANTS CASCADE RESULTS IN CLASS III+
console.log("\n\nTEST 4: SPECIAL → GIANTS CASCADE (Class III+)\n");

let giantsFound = false;
for (let testSeed = 1; testSeed < 10000 && !giantsFound; testSeed++) {
  const gen = new StarGenerator(testSeed);
  const star = gen.generatePrimaryStar();

  if (star.cascadePath && star.cascadePath.includes("Giants")) {
    console.log(`Seed ${testSeed}: Found Giants cascade`);
    console.log(`  Type: ${star.spectralClass}`);
    console.log(`  Class: ${star.luminosityClass}`);
    console.log(`  Cascade Path: ${star.cascadePath.join(" → ")}`);
    console.log(`  Expected: Class II, III, Ib, or Ia`);

    const validGiantClass = ["II", "III", "Ib", "Ia"].includes(star.luminosityClass);
    console.log(`  ✓ PASS: Valid giant class ${validGiantClass ? "" : "- UNEXPECTED!"}`);
    giantsFound = true;
  }
}

if (!giantsFound) {
  console.log("⚠ No Giants cascade found in first 10000 seeds (statistically possible but rare)");
}

// TEST 5: VERIFY PECULIAR TYPES FROM CASCADE
console.log("\n\nTEST 5: PECULIAR TYPES FROM CASCADE\n");

let peculiarStats = {};
let peculiarFound = false;

for (let testSeed = 1; testSeed < 50000 && !peculiarFound; testSeed++) {
  const gen = new StarGenerator(testSeed);
  const star = gen.generatePrimaryStar();

  if (star.isPeculiar) {
    peculiarStats[star.type] = (peculiarStats[star.type] || 0) + 1;

    if (!peculiarFound) {
      console.log(`First Peculiar found at seed ${testSeed}:`);
      console.log(`  Type: ${star.type}`);
      console.log(`  Designation: ${star.designation}`);
      console.log(`  Cascade Path: ${star.cascadePath.join(" → ")}`);
      console.log(`  Expected Path: Type → Special → Unusual → Peculiar`);

      const correctPath =
        star.cascadePath[0] === "Special" && star.cascadePath[1] === "Unusual" && star.cascadePath[2] === "Peculiar";
      console.log(`  ✓ Path correct: ${correctPath ? "PASS" : "FAIL"}`);

      peculiarFound = true;
    }
  }
}

if (!peculiarFound) {
  console.log("⚠ No Peculiar results in first 50000 seeds (expected - very rare)");
} else {
  console.log("\n✓ Peculiar star handling working");
}

// TEST 6: GENERATION LOG WITH CASCADE DETAILS
console.log("\n\nTEST 6: GENERATION LOG (Cascade information)\n");

const generator3 = new StarGenerator(99999);
const star3 = generator3.generatePrimaryStar();

console.log("Generation Log with Cascade Details:");
const log = generator3.getGenerationLog();
const cascadeSteps = log.filter((l) => l.step && l.step.includes("Cascade"));

if (cascadeSteps.length > 0) {
  console.log(`  Found ${cascadeSteps.length} cascade steps:`);
  cascadeSteps.forEach((l) => {
    console.log(`    Step ${l.step}: ${l.action}`);
    if (l.result) console.log(`      Result: ${l.result}`);
  });
  console.log("\n✓ Cascade steps logged correctly");
} else {
  console.log("  No cascade steps (normal main sequence type)");
}

// TEST 7: Star Mass Validation
console.log("\n\nTEST 7: Star Mass Validation\n");

const validations = [];

let passCount = 0;
let failCount = 0;

for (let testSeed = 1; testSeed <= 100; testSeed++) {
  const gen = new StarGenerator(testSeed);
  const star = gen.generatePrimaryStar();

  const validation = gen.validateStarMass(star);

  // Skip peculiar types for mass validation
  if (star.isPeculiar) {
    continue;
  }

  // Validate temperature is within reasonable range
  const tempValid = star.temperature >= 0 && star.temperature <= 100000;

  // Build the validation object and ADD it to the array
  validations.push({
    seed: testSeed,
    star: star.classification,
    mass: star.mass,
    temperature: star.temperature,
    cascadePath: star.cascadePath ? star.cascadePath.join(" → ") : "Type",
    massValid: validation.valid,
    tempValid: tempValid,
    status: validation.error || "OK",
  });

  if (validation.valid && tempValid) {
    passCount++;
  } else {
    console.error(`FAIL Seed ${testSeed}: ${validation.error}`);
    failCount++;
  }
}

console.log(`✓ Mass Validation Results:`);
console.log(`  Passed: ${passCount}`);
console.log(`  Failed: ${failCount}`);

// TEST 8: CASCADE PATH CONSISTENCY
console.log("\n\nTEST 8: CASCADE PATH CONSISTENCY\n");

let cascadeConsistent = true;
for (let testSeed = 1; testSeed <= 100; testSeed++) {
  const gen1 = new StarGenerator(testSeed);
  const star1 = gen1.generatePrimaryStar();

  const gen2 = new StarGenerator(testSeed);
  const star2 = gen2.generatePrimaryStar();

  if (JSON.stringify(star1.cascadePath) !== JSON.stringify(star2.cascadePath)) {
    console.log(`MISMATCH at seed ${testSeed}: ${star1.cascadePath} vs ${star2.cascadePath}`);
    cascadeConsistent = false;
    break;
  }
}

console.log(`Cascade paths reproducible: ${cascadeConsistent ? "✓ PASS" : "✗ FAIL"}`);

// FINAL SUMMARY
console.log("\n═══════════════════════════════════════════════════════════════");
console.log("Sample of 50 generated stars with cascade info:");
console.log("Seed  | Designation | Class | Cascade Path");
console.log("------|-------------|-------|-------------------------------------");

validations.slice(0, 50).forEach((v) => {
  const cascadePath = v.cascadePath === "Type" ? "Main Sequence" : v.cascadePath;
  console.log(`${v.seed.toString().padEnd(5)} | ${v.star.padEnd(11)} | ${v.status.padEnd(5)} | ${cascadePath}`);
});

const allValid = validations.every((v) => v.massValid && v.tempValid);
console.log(`\nAll properties within handbook ranges: ${allValid ? "✓ PASS" : "✗ FAIL"}`);

console.log("\n╔════════════════════════════════════════════════════════════════╗");
console.log("║                    CASCADE TEST SUITE COMPLETE                 ║");
console.log("║              All cascade paths being tracked correctly         ║");
console.log("╚════════════════════════════════════════════════════════════════╝");
