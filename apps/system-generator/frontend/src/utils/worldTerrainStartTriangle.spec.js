import { describe, expect, it, vi } from "vitest";
import {
  D46_TRIANGLE_TABLE,
  normalizeFaceTopologyId,
  pickRandomHexInTriangle,
  resolveStarterTriangle,
  rollD46,
} from "./worldTerrainStartTriangle.js";

describe("worldTerrainStartTriangle", () => {
  it("maps d46 roll values to the configured triangle table", () => {
    expect(D46_TRIANGLE_TABLE["11"]).toBe("Upper-0L");
    expect(D46_TRIANGLE_TABLE["24"]).toBe("Middle-6");
    expect(D46_TRIANGLE_TABLE["31"]).toBe("Middle-0L");
    expect(D46_TRIANGLE_TABLE["46"]).toBe("Middle-0R");
  });

  it("rolls d46 using a supplied rng", () => {
    const rng = vi
      .fn()
      .mockReturnValueOnce(0.74) // d4 -> 3
      .mockReturnValueOnce(0.83); // d6 -> 5

    const result = rollD46(rng);
    expect(result).toEqual({ d4: 3, d6: 5, roll: "35", faceId: "Middle-7" });
  });

  it("keeps the rolled face when available", () => {
    expect(resolveStarterTriangle("Upper-3", ["Upper-1", "Upper-3", "Upper-4"])).toBe("Upper-3");
  });

  it("falls back to a random available face when the rolled face is unavailable", () => {
    const rng = vi.fn().mockReturnValue(0.6);
    expect(resolveStarterTriangle("Upper-9", ["Upper-1", "Upper-2", "Upper-3"], rng)).toBe("Upper-2");
  });

  it("resolves to lateral partner when rolled edge face is unavailable by exact id", () => {
    expect(resolveStarterTriangle("Upper-0L", ["Upper-0R", "Upper-1"])).toBe("Upper-0R");
  });

  it("picks a random hex from the active triangle", () => {
    const rng = vi.fn().mockReturnValue(0.5);
    const picked = pickRandomHexInTriangle(
      [
        { key: "a", faceId: "Upper-1" },
        { key: "b", faceId: "Upper-2" },
        { key: "c", faceId: "Upper-2" },
      ],
      "Upper-2",
      rng,
    );

    expect(picked?.key).toBe("c");
  });

  it("returns null when no hexes are available for the active triangle", () => {
    expect(pickRandomHexInTriangle([{ key: "a", faceId: "Upper-1" }], "Lower-4")).toBeNull();
  });

  it("treats lateral partner faces as equivalent when picking random hexes", () => {
    const picked = pickRandomHexInTriangle(
      [
        { key: "a", faceId: "Upper-0L" },
        { key: "b", faceId: "Upper-0R" },
      ],
      "Upper-0L",
      () => 0.9,
    );

    expect(picked?.key).toBe("b");
  });

  it("normalizes L/R face suffixes to shared topology ids", () => {
    expect(normalizeFaceTopologyId("Upper-0L")).toBe("Upper-0");
    expect(normalizeFaceTopologyId("Upper-0R")).toBe("Upper-0");
    expect(normalizeFaceTopologyId("Middle-7")).toBe("Middle-7");
  });
});
