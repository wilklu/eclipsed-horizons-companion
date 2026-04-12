import { describe, expect, it } from "vitest";

import {
  buildSectorSurveyHexTitle,
  buildSectorSurveyProgress,
  describeSectorSurveyHexBadge,
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

    expect(resolveSectorSurveyFilterMatch(anomalyHex, "anomaly")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(anomalyHex, "oba")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(presenceHex, "presence")).toBe(true);
    expect(resolveSectorSurveyFilterMatch(legacyHex, "legacy")).toBe(true);
    expect(resolveSectorSurveyFilterMatch({ hasSystem: false }, "empty")).toBe(true);
  });

  it("summarizes filter buckets and progress totals", () => {
    const hexes = [
      { coord: "0101", hasSystem: true, starType: "G2V" },
      { coord: "0102", hasSystem: true, presenceOnly: true },
      { coord: "0103", hasSystem: true, starType: "B0V", anomalyType: "Pulsar" },
      { coord: "0104", hasSystem: false },
    ];

    expect(summarizeSectorSurveyFilters(hexes)).toEqual({
      surveyed: 2,
      presence: 1,
      anomaly: 1,
      oba: 1,
      fgk: 1,
      m: 0,
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
});
