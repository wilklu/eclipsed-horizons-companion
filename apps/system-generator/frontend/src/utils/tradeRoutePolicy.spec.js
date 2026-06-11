import { describe, it, expect } from "vitest";
import { resolveTradeRouteSpaceTier, resolveTradeRouteLegendKey } from "./tradeRoutePolicy.js";

describe("tradeRoutePolicy", () => {
  describe("resolveTradeRouteSpaceTier", () => {
    const surveyed = new Set(["0:0"]);

    it("excludes routes that touch void space", () => {
      expect(resolveTradeRouteSpaceTier({ sectorX: 0, sectorY: 0 }, { sectorX: 4, sectorY: 4 }, surveyed)).toBeNull();
    });

    it("buckets mixed surveyed and frontier endpoints as frontier routes", () => {
      expect(resolveTradeRouteSpaceTier({ sectorX: 0, sectorY: 0 }, { sectorX: 1, sectorY: 0 }, surveyed)).toBe(
        "frontier",
      );
    });

    it("keeps fully surveyed links in the surveyed bucket", () => {
      const surveyedPair = new Set(["0:0", "1:0"]);
      expect(resolveTradeRouteSpaceTier({ sectorX: 0, sectorY: 0 }, { sectorX: 1, sectorY: 0 }, surveyedPair)).toBe(
        "surveyed",
      );
    });
  });

  describe("resolveTradeRouteLegendKey", () => {
    it("gives frontier routes their own legend entry", () => {
      expect(resolveTradeRouteLegendKey({ routeTier: "frontier" })).toBe("frontier");
    });

    it("keeps surveyed hazards prioritized over major or pressure styling", () => {
      expect(
        resolveTradeRouteLegendKey({
          routeTier: "surveyed",
          hazardous: true,
          highestImportance: 5,
          pressured: true,
        }),
      ).toBe("hazard");
    });
  });
});
