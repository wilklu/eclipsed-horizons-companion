import { describe, expect, it } from "vitest";

import {
  buildPropagationOriginNote,
  buildSystemCoordinateIndex,
  calculateSystemDistance,
  pickNearbySpeciesTemplate,
  resolvePropagationChanceByDistance,
} from "./speciesPropagation.js";

describe("speciesPropagation", () => {
  it("builds coordinate index from system records", () => {
    const index = buildSystemCoordinateIndex([
      { systemId: "sector:0101", hexCoordinates: { x: 1, y: 1 } },
      { systemId: "sector:0509", hexCoordinates: { x: 5, y: 9 } },
    ]);

    expect(index.size).toBe(2);
    expect(index.get("sector:0101")).toEqual({ x: 1, y: 1 });
  });

  it("computes euclidean system distance", () => {
    const coordinateIndex = new Map([
      ["a", { x: 1, y: 1 }],
      ["b", { x: 4, y: 5 }],
    ]);

    const distance = calculateSystemDistance({
      fromSystemId: "a",
      toSystemId: "b",
      coordinateIndex,
    });

    expect(distance).toBe(5);
  });

  it("uses lower reuse probability for distant systems", () => {
    expect(resolvePropagationChanceByDistance(0)).toBe(0.16);
    expect(resolvePropagationChanceByDistance(1)).toBe(0.12);
    expect(resolvePropagationChanceByDistance(3)).toBe(0.08);
    expect(resolvePropagationChanceByDistance(6)).toBe(0.04);
    expect(resolvePropagationChanceByDistance(10)).toBe(0.02);
    expect(resolvePropagationChanceByDistance(12)).toBe(0.005);
    expect(resolvePropagationChanceByDistance(Number.NaN)).toBe(0.01);
    expect(resolvePropagationChanceByDistance(0)).toBeGreaterThan(resolvePropagationChanceByDistance(12));
    expect(resolvePropagationChanceByDistance(3)).toBeGreaterThan(resolvePropagationChanceByDistance(12));
  });

  it("prefers nearby candidates when selecting cross-world species", () => {
    const selection = pickNearbySpeciesTemplate({
      currentSystemId: "home",
      currentWorldKey: "home:world-a",
      systems: [
        { systemId: "home", hexCoordinates: { x: 1, y: 1 } },
        { systemId: "near", hexCoordinates: { x: 2, y: 2 } },
        { systemId: "far", hexCoordinates: { x: 20, y: 20 } },
      ],
      records: [
        { id: "r1", systemId: "near", worldKey: "near:w1", worldName: "Near One" },
        { id: "r2", systemId: "far", worldKey: "far:w1", worldName: "Far One" },
      ],
      rng: () => 0,
    });

    expect(selection?.record?.id).toBe("r1");
  });

  it("builds readable origin notes", () => {
    const note = buildPropagationOriginNote({
      record: { worldName: "Mora" },
      distance: 2.345,
    });

    expect(note).toContain("Mora");
    expect(note).toContain("distance 2.3");
  });
});
