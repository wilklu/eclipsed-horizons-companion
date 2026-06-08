import { describe, expect, it } from "vitest";
import { buildTerrainPlacementScoreMap, resolveTerrainCoreCountsFromBudget } from "../../utils/terrainPlacement.js";

describe("WorldTerrainMap", () => {
  it("prefers interior hexes over border hexes when scoring mountain candidates", () => {
    const cells = [
      { key: "center", cx: 0, cy: 0, faceId: "Face-1", points: "0,0 1,0 2,1 1,2 0,2 -1,1" },
      { key: "b1", cx: 1, cy: 0, faceId: "Face-1", points: "1,0 2,0 3,1 2,2 1,2 0,1" },
      { key: "b2", cx: -1, cy: 0, faceId: "Face-1", points: "-1,0 0,0 1,1 0,2 -1,2 -2,1" },
      { key: "b3", cx: 0, cy: 1, faceId: "Face-1", points: "0,1 1,1 2,2 1,3 0,3 -1,2" },
      { key: "b4", cx: 0, cy: -1, faceId: "Face-1", points: "0,-1 1,-1 2,0 1,1 0,1 -1,0" },
      { key: "b5", cx: 1, cy: 1, faceId: "Face-1", points: "1,1 2,1 3,2 2,3 1,3 0,2" },
      { key: "b6", cx: -1, cy: -1, faceId: "Face-1", points: "-1,-1 0,-1 1,0 0,1 -1,1 -2,0" },
    ];
    const adjacencyById = new Map([
      ["center", { neighbors: new Set(["b1", "b2", "b3", "b4", "b5", "b6"]) }],
      ["b1", { neighbors: new Set(["center"]) }],
      ["b2", { neighbors: new Set(["center"]) }],
      ["b3", { neighbors: new Set(["center"]) }],
      ["b4", { neighbors: new Set(["center"]) }],
      ["b5", { neighbors: new Set(["center"]) }],
      ["b6", { neighbors: new Set(["center"]) }],
    ]);

    const scoreByKey = buildTerrainPlacementScoreMap(cells, 12345, adjacencyById);

    expect(scoreByKey.get("center")).toBeGreaterThan(scoreByKey.get("b1"));
    expect(scoreByKey.get("center")).toBeGreaterThan(scoreByKey.get("b2"));
  });

  it("does not infer mountain or shore counts when card omits them", () => {
    const budgetMap = new Map([["water", 18]]);

    const result = resolveTerrainCoreCountsFromBudget(budgetMap, 42);

    expect(result).toEqual({
      waterCount: 18,
      mountainCount: 0,
      shoreCount: 0,
    });
  });

  it("clamps card counts to available hex capacity", () => {
    const budgetMap = new Map([
      ["water", 40],
      ["mountain", 20],
      ["shore", 20],
    ]);

    const result = resolveTerrainCoreCountsFromBudget(budgetMap, 42);

    expect(result).toEqual({
      waterCount: 40,
      mountainCount: 2,
      shoreCount: 0,
    });
  });
});
