import { describe, it, expect } from "vitest";
import {
  toSectorCoordKey,
  fromSectorCoordKey,
  isSurveyedSector,
  isAdjacentToSurveyed,
  calculateSpaceTier,
  resolveGenerationModeForSpaceTier,
  buildSurveyedCoordKeySet,
  buildFrontierCoordKeySet,
  buildKnownSpaceCoordKeySet,
  countSpaceTiers,
  calculatePlanningRegionCapacity,
  isInPlanningWindow,
} from "./spaceClassification.js";

describe("spaceClassification", () => {
  describe("toSectorCoordKey and fromSectorCoordKey", () => {
    it("converts coordinates to key format", () => {
      expect(toSectorCoordKey(5, -3)).toBe("5:-3");
      expect(toSectorCoordKey(0, 0)).toBe("0:0");
      expect(toSectorCoordKey(-10, 20)).toBe("-10:20");
    });

    it("returns null for non-finite coordinates", () => {
      expect(toSectorCoordKey(NaN, 5)).toBe(null);
      expect(toSectorCoordKey(5, Infinity)).toBe(null);
      expect(toSectorCoordKey("invalid", 5)).toBe(null);
    });

    it("parses keys back to coordinates", () => {
      expect(fromSectorCoordKey("5:-3")).toEqual([5, -3]);
      expect(fromSectorCoordKey("0:0")).toEqual([0, 0]);
      expect(fromSectorCoordKey("-10:20")).toEqual([-10, 20]);
    });

    it("returns null for invalid keys", () => {
      expect(fromSectorCoordKey("invalid")).toBeNull();
      expect(fromSectorCoordKey("5")).toBeNull();
      expect(fromSectorCoordKey("5:a:b")).toBeNull();
    });
  });

  describe("isSurveyedSector", () => {
    it("returns true for sector with hexPresenceGenerated", () => {
      expect(isSurveyedSector({ hexPresenceGenerated: true })).toBe(true);
    });

    it("returns true for sector with positive systemCount", () => {
      expect(isSurveyedSector({ systemCount: 42 })).toBe(true);
      expect(isSurveyedSector({ systemCount: 1 })).toBe(true);
    });

    it("returns false for sector without presence or systems", () => {
      expect(isSurveyedSector({ hexPresenceGenerated: false })).toBe(false);
      expect(isSurveyedSector({ systemCount: 0 })).toBe(false);
      expect(isSurveyedSector({})).toBe(false);
    });

    it("returns false for null/undefined sector", () => {
      expect(isSurveyedSector(null)).toBe(false);
      expect(isSurveyedSector(undefined)).toBe(false);
    });
  });

  describe("isAdjacentToSurveyed", () => {
    it("detects adjacent surveyed sectors in 8 directions", () => {
      const surveyed = new Set([
        "0:0", // Center surveyed sector
      ]);

      // All 8 adjacent sectors should be adjacent
      expect(isAdjacentToSurveyed(0, 1, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(0, -1, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(1, 0, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(-1, 0, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(1, 1, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(1, -1, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(-1, 1, surveyed)).toBe(true);
      expect(isAdjacentToSurveyed(-1, -1, surveyed)).toBe(true);
    });

    it("returns false for non-adjacent sectors", () => {
      const surveyed = new Set(["0:0"]);
      expect(isAdjacentToSurveyed(2, 0, surveyed)).toBe(false);
      expect(isAdjacentToSurveyed(0, 2, surveyed)).toBe(false);
      expect(isAdjacentToSurveyed(10, 10, surveyed)).toBe(false);
    });

    it("returns false for empty surveyed set", () => {
      expect(isAdjacentToSurveyed(0, 0, new Set())).toBe(false);
      expect(isAdjacentToSurveyed(0, 0, null)).toBe(false);
    });
  });

  describe("calculateSpaceTier", () => {
    const surveyed = new Set(["0:0"]);

    it("returns 'surveyed' for surveyed sector coordinate", () => {
      expect(calculateSpaceTier(0, 0, surveyed)).toBe("surveyed");
    });

    it("returns 'frontier' for adjacent non-surveyed sector", () => {
      expect(calculateSpaceTier(0, 1, surveyed)).toBe("frontier");
      expect(calculateSpaceTier(1, 1, surveyed)).toBe("frontier");
    });

    it("returns 'void' for non-adjacent sector", () => {
      expect(calculateSpaceTier(5, 5, surveyed)).toBe("void");
    });
  });

  describe("resolveGenerationModeForSpaceTier", () => {
    it("forces surveyed sectors to full systems mode", () => {
      expect(resolveGenerationModeForSpaceTier("name", "surveyed")).toBe("name-systems");
      expect(resolveGenerationModeForSpaceTier("presence", "surveyed")).toBe("name-systems");
      expect(resolveGenerationModeForSpaceTier("name-presence", "surveyed")).toBe("name-systems");
    });

    it("preserves user mode in frontier sectors", () => {
      expect(resolveGenerationModeForSpaceTier("name", "frontier")).toBe("name");
      expect(resolveGenerationModeForSpaceTier("presence", "frontier")).toBe("presence");
      expect(resolveGenerationModeForSpaceTier("name-systems", "frontier")).toBe("name-systems");
    });

    it("downgrades void sectors away from full systems", () => {
      expect(resolveGenerationModeForSpaceTier("name-systems", "void")).toBe("name-presence");
      expect(resolveGenerationModeForSpaceTier("name", "void")).toBe("presence");
      expect(resolveGenerationModeForSpaceTier("presence", "void")).toBe("presence");
      expect(resolveGenerationModeForSpaceTier("name-presence", "void")).toBe("name-presence");
    });
  });

  describe("buildSurveyedCoordKeySet", () => {
    it("extracts coordinates from surveyed sectors", () => {
      const sectors = [
        {
          sectorId: "1",
          coordinates: { x: 0, y: 0 },
          hexPresenceGenerated: true,
        },
        {
          sectorId: "2",
          coordinates: { x: 1, y: 1 },
          systemCount: 50,
        },
      ];

      const result = buildSurveyedCoordKeySet(sectors);
      expect(result.has("0:0")).toBe(true);
      expect(result.has("1:1")).toBe(true);
      expect(result.size).toBe(2);
    });

    it("ignores non-surveyed sectors", () => {
      const sectors = [
        {
          sectorId: "1",
          coordinates: { x: 0, y: 0 },
          hexPresenceGenerated: true,
        },
        {
          sectorId: "2",
          coordinates: { x: 1, y: 1 },
          systemCount: 0,
        },
      ];

      const result = buildSurveyedCoordKeySet(sectors);
      expect(result.has("0:0")).toBe(true);
      expect(result.has("1:1")).toBe(false);
      expect(result.size).toBe(1);
    });

    it("handles empty or null input", () => {
      expect(buildSurveyedCoordKeySet([]).size).toBe(0);
      expect(buildSurveyedCoordKeySet(null).size).toBe(0);
    });
  });

  describe("buildFrontierCoordKeySet", () => {
    it("builds one-ring frontier around surveyed sector", () => {
      const surveyed = new Set(["0:0"]);
      const frontier = buildFrontierCoordKeySet(surveyed);

      // Should have 8 frontier sectors (all adjacent except center)
      expect(frontier.size).toBe(8);
      expect(frontier.has("0:0")).toBe(false); // Center not in frontier
      expect(frontier.has("0:1")).toBe(true);
      expect(frontier.has("1:1")).toBe(true);
    });

    it("builds frontier for multiple surveyed sectors", () => {
      const surveyed = new Set(["0:0", "2:0"]);
      const frontier = buildFrontierCoordKeySet(surveyed);

      // Both should have frontier rings, some overlapping
      expect(frontier.has("0:0")).toBe(false); // Surveyed not in frontier
      expect(frontier.has("2:0")).toBe(false); // Surveyed not in frontier
      expect(frontier.has("0:1")).toBe(true);
      expect(frontier.has("1:0")).toBe(true); // Between the two surveyed
    });

    it("handles empty surveyed set", () => {
      const frontier = buildFrontierCoordKeySet(new Set());
      expect(frontier.size).toBe(0);
    });
  });

  describe("buildKnownSpaceCoordKeySet", () => {
    it("combines surveyed and frontier", () => {
      const surveyed = new Set(["0:0"]);
      const knownSpace = buildKnownSpaceCoordKeySet(surveyed);

      // Should have 1 surveyed + 8 frontier = 9 total
      expect(knownSpace.has("0:0")).toBe(true);
      expect(knownSpace.has("0:1")).toBe(true);
      expect(knownSpace.size).toBe(9);
    });
  });

  describe("countSpaceTiers", () => {
    it("counts surveyed and frontier sectors", () => {
      const surveyed = new Set(["0:0"]);
      const counts = countSpaceTiers(surveyed);

      expect(counts.surveyed).toBe(1);
      expect(counts.frontier).toBe(8);
      expect(counts.void).toBeNull(); // Void is unbounded
    });

    it("scales with multiple surveyed sectors", () => {
      const surveyed = new Set(["0:0", "2:0"]);
      const counts = countSpaceTiers(surveyed);

      expect(counts.surveyed).toBe(2);
      expect(counts.frontier).toBeGreaterThan(0);
    });
  });

  describe("calculatePlanningRegionCapacity", () => {
    it("calculates 10x10 planning window capacity", () => {
      const capacity = calculatePlanningRegionCapacity({
        centerX: 0,
        centerY: 0,
        planningRadius: 5,
      });

      expect(capacity.totalCapacity).toBe(121); // 11x11
      expect(capacity.centerX).toBe(0);
      expect(capacity.centerY).toBe(0);
      expect(capacity.planningRadius).toBe(5);
    });

    it("uses defaults for 10x10 window", () => {
      const capacity = calculatePlanningRegionCapacity();
      expect(capacity.totalCapacity).toBe(121);
    });
  });

  describe("isInPlanningWindow", () => {
    it("detects sectors within planning window", () => {
      expect(isInPlanningWindow(0, 0, 0, 0, 5)).toBe(true);
      expect(isInPlanningWindow(5, 5, 0, 0, 5)).toBe(true);
      expect(isInPlanningWindow(-5, -5, 0, 0, 5)).toBe(true);
    });

    it("rejects sectors outside planning window", () => {
      expect(isInPlanningWindow(6, 0, 0, 0, 5)).toBe(false);
      expect(isInPlanningWindow(0, 6, 0, 0, 5)).toBe(false);
      expect(isInPlanningWindow(10, 10, 0, 0, 5)).toBe(false);
    });

    it("works with offset center", () => {
      expect(isInPlanningWindow(10, 10, 5, 5, 5)).toBe(true);
      expect(isInPlanningWindow(0, 0, 5, 5, 5)).toBe(true);
      expect(isInPlanningWindow(11, 11, 5, 5, 5)).toBe(false);
    });
  });
});
