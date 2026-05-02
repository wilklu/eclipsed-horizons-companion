import { createSequenceRoller } from "./apps/system-generator/frontend/src/utils/wbh/dice.js";
import {
  generateWorldPhysicalCharacteristicsWbh,
  determineWorldDiameter,
  determineTerrestrialDensity,
  determineTerrestrialComposition,
  getWbhWorldSizeEntry,
} from "./apps/system-generator/frontend/src/utils/wbh/worldPhysicalCharacteristicsWbh.js";

const seq = [2, 4, 5, 2, 4, 5];
const base = createSequenceRoller(seq);
const logs = [];
const rollDie = (sides) => {
  const r = base(sides);
  logs.push({ sides, r });
  return r;
};

console.log("sequence:", seq);
console.log("determineWorldDiameter with seeded roller:");
const diameter = determineWorldDiameter({ sizeCode: "5", rollDie, detailDie: 63 });
console.log("diameterKm =>", diameter);

// After diameter consumed some rolls, test composition/density
const compRoll = 10; // as used in spec
const composition = determineTerrestrialComposition({
  sizeCode: "5",
  orbitNumber: 3.1,
  hzco: 3.3,
  systemAgeGyr: 5,
  rollTotal: compRoll,
});
console.log("composition =>", composition);
const densityRollSeed = 9;
const density = determineTerrestrialDensity({ composition, rollTotal: densityRollSeed });
console.log("density (from composition & roll 9) =>", density);

console.log("Now full generateWorldPhysicalCharacteristicsWbh with same seeded roller:");
// recreate base roller so sequence restarts for the generator run
const base2 = createSequenceRoller(seq);
const logs2 = [];
const rollDie2 = (sides) => {
  const r = base2(sides);
  logs2.push({ sides, r });
  return r;
};
const world = generateWorldPhysicalCharacteristicsWbh({
  worldName: "Aab IV d",
  sizeCode: "5",
  orbitNumber: 3.1,
  hzco: 3.3,
  systemAgeGyr: 5,
  detailDie: 63,
  rollDie: rollDie2,
});
console.log("world.sizeProfile =>", world.sizeProfile);
console.log("world.diameterKm =>", world.diameterKm);
console.log("world.density =>", world.density);
console.log("world.gravity =>", world.gravity);
console.log("world.mass =>", world.mass);
console.log("logged rolls during generation:", logs2);

console.log("initial small-run logs (determineWorldDiameter):", logs);
