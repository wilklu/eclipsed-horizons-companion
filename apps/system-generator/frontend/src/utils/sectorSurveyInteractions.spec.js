import { describe, expect, it } from "vitest";

import {
  buildSectorSurveyAccessibilityStatus,
  buildSectorSurveyChecklist,
  buildSectorSurveyHexAriaLabel,
  buildSectorSurveyHexTitle,
  buildSectorSurveyProgress,
  buildSectorSurveyReviewQueue,
  describeSectorSurveyHexBadge,
  findNextSectorSurveyReviewCoord,
  moveSectorSurveyCoord,
  moveSectorSurveySubsector,
  normalizeSectorSurveyCoord,
  resolveSectorSurveyFilterMatch,
  summarizeSectorSurveyFilters,
} from "./sectorSurveyInteractions.js";

describe("sectorSurveyInteractions", () => {
  it("normalizes four-digit hex coordinates inside the current grid bounds", () => {
    expect(normalizeSectorSurveyCoord(" 0712 ", { cols: 32, rows: 40 })).toBe("0712");
    expect(normalizeSectorSurveyCoord("0741", { cols: 32, rows: 40 })).toBe("");
    expect(normalizeSectorSurveyCoord("abcd", { cols: 32, rows: 40 })).toBe("");
  });

  it("moves selected coordinates while clamping to the current grid", () => {
    expect(moveSectorSurveyCoord("0101", { cols: 8, rows: 10, columnDelta: -1, rowDelta: -1 })).toBe("0101");
    expect(moveSectorSurveyCoord("0405", { cols: 8, rows: 10, columnDelta: 2, rowDelta: 3 })).toBe("0608");
    expect(moveSectorSurveyCoord("", { cols: 8, rows: 10, columnDelta: 1, rowDelta: 0 })).toBe("0101");
  });

  it("moves subsector letters inside the 4x4 subsector grid", () => {
    expect(moveSectorSurveySubsector("A", { columnDelta: 1, rowDelta: 0 })).toBe("B");
    expect(moveSectorSurveySubsector("F", { columnDelta: 0, rowDelta: 1 })).toBe("J");
    expect(moveSectorSurveySubsector("P", { columnDelta: 1, rowDelta: 1 })).toBe("P");
  });

  it("matches hexes against the sector survey filter modes", () => {
    const anomalyHex = { hasSystem: true, starType: "B2V", anomalyType: "Black Hole" };
    const presenceHex = { hasSystem: true, presenceOnly: true };
    const legacyHex = { hasSystem: true, starType: "G2V", legacyReconstructed: true };
    const nativeLifeHex = { hasSystem: true, starType: "M1V", nativeSophontLife: true, nativeLifeWorldCount: 1 };

    expect(resolveSectorSurveyFilterMatch(anomalyHex, "anomaly")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(anomalyHex, "oba")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(presenceHex, "presence")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(legacyHex, "legacy")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(nativeLifeHex, "nativeLife")).toBe(true);
    expect(resolveSectorSurveyFilterMatch({ hasSystem: false }, "empty")).toBe(true);
  });

  it("summarizes filter buckets, progress totals, and checklist states", () => {
    const hexes = [
      { coord: "0101", hasSystem: true, starType: "G2V" },
      { coord: "0102", hasSystem: true, presenceOnly: true },
      { coord: "0103", hasSystem: true, starType: "B0V", anomalyType: "Pulsar" },
      { coord: "0104", hasSystem: true, starType: "M1V", nativeSophontLife: true, nativeLifeWorldCount: 1 },
      { coord: "0105", hasSystem: false },
    ];

    expect(summarizeSectorSurveyFilters(hexes)).toEqual({
      surveyed: 3,
      presence: 1,
      anomaly: 1,
      nativeLife: 1,
      oba: 1,
      fgk: 1,
      m: 1,
      legacy: 0,
      empty: 1,
    });

    expect(buildSectorSurveyProgress({ systemCount: 3, presenceOnlyCount: 1, totalHexes: 4 })).toEqual({
      totalHexes: 4,
      systemCount: 3,
      typedCount: 2,
      presenceOnlyCount: 1,
      emptyCount: 1,
      typedPercent: 50,
      presencePercent: 25,
      emptyPercent: 25,
      completedPercent: 75,
    });

    expect(
      buildSectorSurveyChecklist({
        sectorName: "Aquila Verge",
        totalHexes: 4,
        systemCount: 3,
        presenceOnlyCount: 1,
        typedCount: 2,
        reviewQueueCounts: { presence: 1, anomaly: 1, habitable: 0, nativeLife: 1, legacy: 0 },
      }),
    ).toMatchObject({
      completeCount: 2,
      nextAction: "3 follow-up targets remain in the queue.",
      items: [
        { id: "name", status: "complete" },
        { id: "mapping", status: "active" },
        { id: "systems", status: "active" },
        { id: "review", status: "active" },
        { id: "stellar", status: "complete" },
      ],
    });
  });

  it("describes anomaly badges and richer hover titles", () => {
    expect(describeSectorSurveyHexBadge({ anomalyType: "Nebula" })).toEqual({
      icon: "☁",
      label: "Nebula",
      className: "hex-badge--nebula",
    });

    expect(
      buildSectorSurveyHexTitle({
        coord: "1410",
        hasSystem: true,
        starType: "G2V",
        secondaryStars: ["M4V"],
        anomalyType: "Nebula",
        mainworldName: "Caledon",
        mainworldUwp: "A867A99-C",
      }),
    ).toBe("1410 - G2V - companions M4V - Nebula - mainworld Caledon - UWP A867A99-C");
  });

  it("builds screen-reader labels and live accessibility status summaries", () => {
    expect(
      buildSectorSurveyHexAriaLabel(
        {
          coord: "1410",
          hasSystem: true,
          starType: "G2V",
          anomalyType: "Nebula",
          mainworldName: "Caledon",
        },
        { isSelected: true },
      ),
    ).toContain("Hex 1410, selected, surveyed system G2V");

    expect(
      buildSectorSurveyAccessibilityStatus({
        currentViewMode: "subsector",
        sectorName: "Aquila Verge",
        selectedHex: {
          coord: "1410",
          hasSystem: true,
          starType: "G2V",
        },
        surveyProgress: {
          completedPercent: 75,
          typedCount: 2,
          presenceOnlyCount: 1,
        },
        activeReviewQueueLabel: "Needs Systems",
        activeReviewQueueCount: 3,
        nextAction: "3 follow-up targets remain in the queue.",
        generationStatusMessage: "Queued hex 1410.",
      }),
    ).toContain("Subsector survey Aquila Verge. 75% mapped.");
  });

  it("builds guided review buckets for presence, anomaly, habitable, native-life, and legacy follow-up", () => {
    const hexes = [
      { coord: "0101", hasSystem: true, presenceOnly: true },
      { coord: "0102", hasSystem: true, starType: "K2V", anomalyType: "Nebula" },
      { coord: "0103", hasSystem: true, starType: "G2V", habitability: "8 / Good" },
      { coord: "0104", hasSystem: true, starType: "F7V", legacyReconstructed: true },
      { coord: "0105", hasSystem: true, starType: "M1V", nativeSophontLife: true, nativeLifeform: "2201" },
      { coord: "0106", hasSystem: false },
    ];

    expect(buildSectorSurveyReviewQueue(hexes)).toEqual({
      presence: 1,
      anomaly: 1,
      habitable: 1,
      nativeLife: 1,
      legacy: 1,
    });
  });

  it("ignores stale native-life strings without real world evidence", () => {
    const hexes = [
      { coord: "0101", hasSystem: true, starType: "M1V", nativeSophontLife: true, nativeLifeWorldCount: 1 },
      { coord: "0102", hasSystem: true, starType: "K2V", nativeLifeform: "2201", nativeLifeWorldCount: 0 },
      { coord: "0103", hasSystem: true, starType: "F7V", nativeSophontLife: false, nativeLifeform: "2201" },
    ];

    expect(buildSectorSurveyReviewQueue(hexes)).toMatchObject({ nativeLife: 1 });
  });

  it("cycles to the next queued review target with wraparound", () => {
    const hexes = [
      { coord: "0101", hasSystem: true, presenceOnly: true },
      { coord: "0102", hasSystem: true, starType: "K2V", anomalyType: "Nebula" },
      { coord: "0103", hasSystem: true, starType: "G2V", habitability: "8 / Good" },
      { coord: "0104", hasSystem: true, starType: "F7V", legacyReconstructed: true },
      { coord: "0105", hasSystem: true, starType: "M1V", nativeSophontLife: true, nativeLifeform: "2201" },
    ];

    expect(findNextSectorSurveyReviewCoord(hexes, "presence", "0104")).toBe("0101");
    expect(findNextSectorSurveyReviewCoord(hexes, "anomaly", "0101")).toBe("0102");
    expect(findNextSectorSurveyReviewCoord(hexes, "habitable", "0101")).toBe("0103");
    expect(findNextSectorSurveyReviewCoord(hexes, "native-life", "0101")).toBe("0105");
    expect(findNextSectorSurveyReviewCoord(hexes, "legacy", "0101")).toBe("0104");
  });
});
