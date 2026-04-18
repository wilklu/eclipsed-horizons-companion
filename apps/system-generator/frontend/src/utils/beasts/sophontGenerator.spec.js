import { describe, expect, it } from "vitest";
import {
  buildWorldLinkedSophontOptions,
  generateSophontProfile,
  mapWorldToSophontEnvironment,
  recommendBodyPlan,
} from "./sophontGenerator.js";

describe("sophontGenerator shared biology rules", () => {
  it("maps stored world conditions to a sophont home environment", () => {
    expect(mapWorldToSophontEnvironment({ hydrographics: 9, avgTempC: 16 })).toBe("Aquatic");
    expect(mapWorldToSophontEnvironment({ hydrographics: 1, avgTempC: 42 })).toBe("Desert");
    expect(mapWorldToSophontEnvironment({ hydrographics: 4, avgTempC: -12 })).toBe("Arctic");
  });

  it("recommends a body plan suited to the environment", () => {
    expect(["Aquatic", "Radial Symmetry", "Bilateral Symmetry"]).toContain(recommendBodyPlan("Aquatic", () => 0));
    expect(["Avian", "Bilateral Symmetry", "Segmented"]).toContain(recommendBodyPlan("Mountain", () => 0));
  });

  it("builds deterministic world-linked sophont profiles", () => {
    const linked = buildWorldLinkedSophontOptions({
      name: "Caledon",
      uwp: "A867A99-C",
      hydrographics: 8,
      avgTempC: 18,
      nativeSophontLife: true,
    });

    const first = generateSophontProfile({
      seed: "caledon-native",
      name: "Caledans",
      bodyPlan: linked.bodyPlan,
      homeEnvironment: linked.homeEnvironment,
      sourceWorld: linked.sourceWorld,
    });

    const second = generateSophontProfile({
      seed: "caledon-native",
      name: "Caledans",
      bodyPlan: linked.bodyPlan,
      homeEnvironment: linked.homeEnvironment,
      sourceWorld: linked.sourceWorld,
    });

    expect(second).toEqual(first);
    expect(first.sourceWorld?.name).toBe("Caledon");
    expect(first.origin).toBe("Native sophont lineage");
  });
});
