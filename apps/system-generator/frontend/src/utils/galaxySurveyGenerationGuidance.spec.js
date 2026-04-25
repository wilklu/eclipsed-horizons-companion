import { describe, expect, it } from "vitest";

import {
  buildGalaxyGenerationGuidance,
  findNextGalaxyGenerationRing,
  summarizeGalaxyGenerationRings,
} from "./galaxySurveyGenerationGuidance.js";

describe("galaxySurveyGenerationGuidance", () => {
  it("summarizes ring persistence, presence, and system completion counts", () => {
    const summaries = summarizeGalaxyGenerationRings([
      { ring: 0, persisted: true, presenceGenerated: true, occupiedHexCount: 0, typedHexCount: 0 },
      { ring: 1, persisted: true, presenceGenerated: true, occupiedHexCount: 2, typedHexCount: 1 },
      { ring: 1, persisted: false, presenceGenerated: false, occupiedHexCount: 0, typedHexCount: 0 },
    ]);

    expect(summaries).toEqual([
      {
        ring: 0,
        label: "Ring 0",
        layoutCount: 1,
        persistedCount: 1,
        presenceCompleteCount: 1,
        systemsCompleteCount: 1,
        missingSectorCount: 0,
        presencePendingCount: 0,
        systemsPendingCount: 0,
        isComplete: true,
      },
      {
        ring: 1,
        label: "Ring 1",
        layoutCount: 2,
        persistedCount: 1,
        presenceCompleteCount: 1,
        systemsCompleteCount: 0,
        missingSectorCount: 1,
        presencePendingCount: 1,
        systemsPendingCount: 2,
        isComplete: false,
      },
    ]);
  });

  it("finds the next incomplete ring per generation mode", () => {
    const ringSummaries = [
      { ring: 0, presencePendingCount: 0, systemsPendingCount: 0 },
      { ring: 1, presencePendingCount: 0, systemsPendingCount: 3 },
      { ring: 2, presencePendingCount: 4, systemsPendingCount: 4 },
    ];

    expect(findNextGalaxyGenerationRing(ringSummaries, "presence")?.ring).toBe(2);
    expect(findNextGalaxyGenerationRing(ringSummaries, "systems")?.ring).toBe(1);
  });

  it("recommends finishing systems before moving to a later unsurveyed ring", () => {
    const guidance = buildGalaxyGenerationGuidance({
      tiles: [
        { ring: 0, persisted: true, presenceGenerated: true, occupiedHexCount: 0, typedHexCount: 0 },
        { ring: 1, persisted: true, presenceGenerated: true, occupiedHexCount: 2, typedHexCount: 1 },
        { ring: 2, persisted: false, presenceGenerated: false, occupiedHexCount: 0, typedHexCount: 0 },
      ],
    });

    expect(guidance.nextPresenceRing?.ring).toBe(2);
    expect(guidance.nextSystemsRing?.ring).toBe(1);
    expect(guidance.recommendation).toEqual({
      title: "Resume ring 1 systems",
      body: "Ring 1 already has persisted survey coverage, but 1 sector is still missing typed system output.",
      mode: "systems",
      ring: 1,
    });
  });

  it("reports a complete footprint when every ring has full presence and systems", () => {
    const guidance = buildGalaxyGenerationGuidance({
      tiles: [
        { ring: 0, persisted: true, presenceGenerated: true, occupiedHexCount: 0, typedHexCount: 0 },
        { ring: 1, persisted: true, presenceGenerated: true, occupiedHexCount: 3, typedHexCount: 3 },
      ],
    });

    expect(guidance.completedRingCount).toBe(2);
    expect(guidance.nextPresenceRing).toBeNull();
    expect(guidance.nextSystemsRing).toBeNull();
    expect(guidance.recommendation.mode).toBeNull();
    expect(guidance.recommendation.title).toBe("Survey footprint complete");
  });
});
