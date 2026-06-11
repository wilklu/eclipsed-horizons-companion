import { describe, expect, it } from "vitest";

import { generatePrimaryStar, generatePrimaryStarHeuristic } from "./primaryStarGenerator.js";
import { createSequenceRoller } from "./wbh/dice.js";

describe("primaryStarGenerator integration", () => {
  it("uses WBH generation by default", () => {
    const rollDie = createSequenceRoller([1, 5, 1, 2, 5, 5, 6, 6, 5, 4]);
    const star = generatePrimaryStar({ rollDie });

    expect(star.generatorModel).toBe("wbh-primary-star");
    expect(star.wbhStatus).toBe("implemented-core-tables");
  });

  it("supports opting back into the heuristic generator", () => {
    const star = generatePrimaryStar({ useWbh: false, spectralType: "G", decimal: 2, luminosityClass: "V" });

    expect(star.designation).toBe("G2V");
    expect(star.generatorModel).toBeUndefined();
  });

  it("returns non-stellar WBH primaries when the handbook tables roll them", () => {
    const rollDie = createSequenceRoller([1, 1, 1, 1, 1, 1, 3, 4]);
    const star = generatePrimaryStar({ rollDie });

    expect(star.designation).toBe("Proto");
    expect(star.wbhStatus).toBe("non-stellar-object");
  });

  it("still exposes the heuristic generator directly", () => {
    const star = generatePrimaryStarHeuristic({ spectralType: "K", decimal: 4, luminosityClass: "V" });

    expect(star.designation).toBe("K4V");
  });
});
