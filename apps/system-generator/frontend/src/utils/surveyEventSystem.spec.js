import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  surveyEventBus,
  detectSurveyCompletion,
  getNeighboringCoordinates,
  findNeighboringSectors,
  buildFrontierPromotionMetadata,
  promoteToFrontier,
  onSectorSurveyCompleted,
  onSurveyed,
} from "./surveyEventSystem.js";

describe("surveyEventSystem", () => {
  describe("detectSurveyCompletion", () => {
    it("detects transition from non-surveyed to surveyed", () => {
      const oldSector = { sectorId: "1", systemCount: 0 };
      const newSector = { sectorId: "1", systemCount: 42 };

      expect(detectSurveyCompletion(oldSector, newSector)).toBe(true);
    });

    it("detects hexPresenceGenerated transition", () => {
      const oldSector = { sectorId: "1", hexPresenceGenerated: false };
      const newSector = { sectorId: "1", hexPresenceGenerated: true };

      expect(detectSurveyCompletion(oldSector, newSector)).toBe(true);
    });

    it("returns false if already surveyed", () => {
      const oldSector = { sectorId: "1", systemCount: 42 };
      const newSector = { sectorId: "1", systemCount: 50 };

      expect(detectSurveyCompletion(oldSector, newSector)).toBe(false);
    });

    it("returns false if not surveyed", () => {
      const oldSector = { sectorId: "1", systemCount: 0 };
      const newSector = { sectorId: "1", systemCount: 0 };

      expect(detectSurveyCompletion(oldSector, newSector)).toBe(false);
    });

    it("handles new sector without old data", () => {
      const newSector = { sectorId: "1", systemCount: 50 };
      expect(detectSurveyCompletion(null, newSector)).toBe(true);
      expect(detectSurveyCompletion(undefined, newSector)).toBe(true);
    });

    it("returns false for null new sector", () => {
      const oldSector = { sectorId: "1", systemCount: 0 };
      expect(detectSurveyCompletion(oldSector, null)).toBe(false);
      expect(detectSurveyCompletion(oldSector, undefined)).toBe(false);
    });
  });

  describe("getNeighboringCoordinates", () => {
    it("returns 8 neighbor coordinates in Chebyshev distance", () => {
      const neighbors = getNeighboringCoordinates(0, 0);
      expect(neighbors).toHaveLength(8);
      expect(neighbors).toContainEqual([-1, -1]);
      expect(neighbors).toContainEqual([0, -1]);
      expect(neighbors).toContainEqual([1, -1]);
      expect(neighbors).toContainEqual([-1, 0]);
      expect(neighbors).toContainEqual([1, 0]);
      expect(neighbors).toContainEqual([-1, 1]);
      expect(neighbors).toContainEqual([0, 1]);
      expect(neighbors).toContainEqual([1, 1]);
    });

    it("works with negative coordinates", () => {
      const neighbors = getNeighboringCoordinates(-5, -10);
      expect(neighbors).toHaveLength(8);
      expect(neighbors).toContainEqual([-6, -11]);
      expect(neighbors).toContainEqual([-4, -9]);
    });

    it("does not include center coordinate", () => {
      const neighbors = getNeighboringCoordinates(0, 0);
      expect(neighbors).not.toContainEqual([0, 0]);
    });
  });

  describe("findNeighboringSectors", () => {
    const sectors = [
      { sectorId: "center", coordinates: { x: 0, y: 0 }, systemCount: 50 },
      { sectorId: "ne", coordinates: { x: 1, y: -1 }, systemCount: 0 },
      { sectorId: "e", coordinates: { x: 1, y: 0 }, systemCount: 0 },
      { sectorId: "se", coordinates: { x: 1, y: 1 }, systemCount: 0 },
      { sectorId: "s", coordinates: { x: 0, y: 1 }, systemCount: 0 },
      { sectorId: "w", coordinates: { x: -1, y: 0 }, systemCount: 0 },
      { sectorId: "far", coordinates: { x: 10, y: 10 }, systemCount: 0 },
    ];

    it("finds all 8 neighboring sectors", () => {
      const neighbors = findNeighboringSectors(0, 0, sectors);
      expect(neighbors).toHaveLength(5); // All except center and far
      expect(neighbors.map((s) => s.sectorId)).toEqual(expect.arrayContaining(["ne", "e", "se", "s", "w"]));
    });

    it("returns empty list if no sectors provided", () => {
      expect(findNeighboringSectors(0, 0, [])).toEqual([]);
      expect(findNeighboringSectors(0, 0, null)).toEqual([]);
    });

    it("excludes sectors without coordinates", () => {
      const badSectors = [
        { sectorId: "bad", systemCount: 0 },
        { sectorId: "good", coordinates: { x: 1, y: 0 }, systemCount: 0 },
      ];
      const neighbors = findNeighboringSectors(0, 0, badSectors);
      expect(neighbors).toHaveLength(1);
      expect(neighbors[0].sectorId).toBe("good");
    });

    it("works with negative coordinates", () => {
      const testSectors = [
        { sectorId: "center", coordinates: { x: -5, y: -5 } },
        { sectorId: "neighbor", coordinates: { x: -4, y: -4 } },
      ];
      const neighbors = findNeighboringSectors(-5, -5, testSectors);
      expect(neighbors).toHaveLength(1);
      expect(neighbors[0].sectorId).toBe("neighbor");
    });
  });

  describe("buildFrontierPromotionMetadata", () => {
    it("adds frontierPromotedAt timestamp", () => {
      const before = new Date();
      const metadata = buildFrontierPromotionMetadata({});
      const after = new Date();

      expect(metadata.frontierPromotedAt).toBeDefined();
      const promotedTime = new Date(metadata.frontierPromotedAt);
      expect(promotedTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(promotedTime.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("preserves existing metadata", () => {
      const existing = { customField: "value", nested: { data: true } };
      const metadata = buildFrontierPromotionMetadata(existing);

      expect(metadata.customField).toBe("value");
      expect(metadata.nested.data).toBe(true);
      expect(metadata.frontierPromotedAt).toBeDefined();
    });
  });

  describe("promoteToFrontier", () => {
    it("adds frontier promotion metadata to sector", () => {
      const sector = { sectorId: "1", coordinates: { x: 0, y: 0 } };
      const promoted = promoteToFrontier(sector);

      expect(promoted.metadata).toBeDefined();
      expect(promoted.metadata.frontierPromotedAt).toBeDefined();
      expect(promoted.sectorId).toBe("1");
    });

    it("preserves existing metadata", () => {
      const sector = {
        sectorId: "1",
        metadata: { existingField: "data" },
      };
      const promoted = promoteToFrontier(sector);

      expect(promoted.metadata.existingField).toBe("data");
      expect(promoted.metadata.frontierPromotedAt).toBeDefined();
    });

    it("returns null for invalid sector", () => {
      expect(promoteToFrontier(null)).toBeNull();
      expect(promoteToFrontier(undefined)).toBeNull();
    });
  });

  describe("onSectorSurveyCompleted", () => {
    it("returns neighbors and event data", () => {
      const sectors = [
        { sectorId: "center", coordinates: { x: 0, y: 0 }, systemCount: 50 },
        { sectorId: "neighbor", coordinates: { x: 1, y: 0 }, systemCount: 0 },
      ];

      const result = onSectorSurveyCompleted(sectors[0], sectors);

      expect(result.neighbors).toHaveLength(1);
      expect(result.neighbors[0].sectorId).toBe("neighbor");
      expect(result.event).toBeDefined();
      expect(result.event.sectorId).toBe("center");
      expect(result.event.coordinates).toEqual({ x: 0, y: 0 });
    });

    it("detects new survey in event", () => {
      const oldSector = { sectorId: "1", coordinates: { x: 0, y: 0 }, systemCount: 0 };
      const newSector = { sectorId: "1", coordinates: { x: 0, y: 0 }, systemCount: 50 };
      const sectors = [newSector];

      const result = onSectorSurveyCompleted(newSector, sectors, oldSector);

      expect(result.event.isNewSurvey).toBe(true);
    });

    it("returns empty neighbors for invalid sector", () => {
      const result = onSectorSurveyCompleted(null, []);
      expect(result.neighbors).toEqual([]);
      expect(result.event).toBeNull();
    });

    it("emits surveyed event", (done) => {
      const sectors = [{ sectorId: "test", coordinates: { x: 5, y: 5 }, systemCount: 10 }];

      const unsubscribe = onSurveyed((event) => {
        expect(event.sectorId).toBe("test");
        expect(event.coordinates).toEqual({ x: 5, y: 5 });
        unsubscribe();
        done();
      });

      onSectorSurveyCompleted(sectors[0], sectors);
    });
  });

  describe("onSurveyed subscription", () => {
    it("handles multiple subscribers", (done) => {
      let call1 = false;
      let call2 = false;

      const unsub1 = onSurveyed(() => {
        call1 = true;
        if (call1 && call2) done();
      });

      const unsub2 = onSurveyed(() => {
        call2 = true;
        if (call1 && call2) done();
      });

      onSectorSurveyCompleted({ sectorId: "test", coordinates: { x: 0, y: 0 }, systemCount: 1 }, []);

      setTimeout(() => {
        unsub1();
        unsub2();
      }, 100);
    });

    it("unsubscribe function prevents future calls", (done) => {
      let callCount = 0;

      const unsubscribe = onSurveyed(() => {
        callCount++;
      });

      onSectorSurveyCompleted({ sectorId: "test1", coordinates: { x: 0, y: 0 }, systemCount: 1 }, []);

      unsubscribe();

      onSectorSurveyCompleted({ sectorId: "test2", coordinates: { x: 0, y: 0 }, systemCount: 1 }, []);

      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 100);
    });

    it("handles handler errors gracefully", (done) => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let call2 = false;

      onSurveyed(() => {
        throw new Error("Test error");
      });

      onSurveyed(() => {
        call2 = true;
      });

      onSectorSurveyCompleted({ sectorId: "test", coordinates: { x: 0, y: 0 }, systemCount: 1 }, []);

      setTimeout(() => {
        expect(call2).toBe(true);
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
        done();
      }, 100);
    });
  });
});
