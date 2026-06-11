import { describe, expect, it } from "vitest";
import { findMatchingWorldOption, listSystemWorldOptions } from "./worldLink.js";

describe("worldLink helpers", () => {
  it("builds world options from persisted planetary catalogs and preserves world indexes", () => {
    const options = listSystemWorldOptions([
      {
        systemId: "sector:0101",
        name: "Aster",
        planets: [{ name: "Aster I" }, { name: "Aster II", isMainworld: true }, { name: "Aster III" }],
      },
    ]);

    expect(options).toHaveLength(3);
    expect(options.map((entry) => entry.worldIndex)).toEqual([0, 1, 2]);
    expect(options[1].worldName).toBe("Aster II");
  });

  it("matches the current routed world before falling back to the broader system", () => {
    const options = listSystemWorldOptions([
      {
        systemId: "sector:0101",
        name: "Aster",
        planets: [{ name: "Aster I" }, { name: "Aster II" }, { name: "Aster III" }],
      },
    ]);

    const match = findMatchingWorldOption(options, {
      query: {
        systemRecordId: "sector:0101",
        worldIndex: "2",
        worldName: "Aster III",
      },
    });

    expect(match?.worldName).toBe("Aster III");
    expect(match?.worldIndex).toBe(2);
  });
});
