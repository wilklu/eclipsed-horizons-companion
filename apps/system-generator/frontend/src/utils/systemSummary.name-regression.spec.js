import { describe, expect, it } from "vitest";

import { buildSystemHexSummary, buildSystemSummaryLabel, summarizeSystemRecord } from "./systemSummary.js";

describe("systemSummary naming regressions", () => {
  it("uses metadata displayName when a persisted stellar record has no top-level name", () => {
    const summary = summarizeSystemRecord({
      systemId: "g-1:0101",
      metadata: {
        displayName: "Aster System",
        systemRecord: {
          name: "Aster System",
        },
      },
      stars: [{ designation: "K2 V" }],
    });

    expect(summary.systemName).toBe("Aster System");
  });

  it("builds the summary label from the saved system name instead of falling back to the hex", () => {
    expect(
      buildSystemSummaryLabel({
        system: {
          systemId: "g-1:0101",
          metadata: {
            displayName: "Aster System",
            systemRecord: {
              name: "Aster System",
            },
          },
          stars: [{ designation: "K2 V" }],
        },
        fallbackHex: "0101",
      }),
    ).toBe("Aster System · K2 V");
  });

  it("exposes the saved system name in stellar hex summaries for Sector Survey cards", () => {
    const summary = buildSystemHexSummary({
      systemId: "g-1:0101",
      metadata: {
        displayName: "Aster System",
        systemRecord: {
          name: "Aster System",
        },
      },
      mainworldName: "Iona",
    });

    expect(summary.systemName).toBe("Aster System");
  });

  it("derives a system name from the generated primary star designation when older records are unnamed", () => {
    const summary = buildSystemHexSummary({
      systemId: "g-1:0101",
      stars: [{ designation: "Aster Primus Major", spectralClass: "G2 V" }],
    });

    expect(summary.systemName).toBe("Aster System");
    expect(
      buildSystemSummaryLabel({
        system: {
          systemId: "g-1:0101",
          stars: [{ designation: "Aster Primus Major", spectralClass: "G2 V" }],
        },
        fallbackHex: "0101",
      }),
    ).toBe("Aster System · Aster Primus Major");
  });

  it("preserves named stellar designations for preview cards", () => {
    const summary = buildSystemHexSummary({
      stars: [
        { designation: "Aster Primus Major", spectralClass: "G2 V" },
        { designation: "Aster Proximus Major", spectralClass: "K7 V" },
        { designation: "Aster Procul Minor", spectralClass: "M4 V" },
      ],
    });

    expect(summary.primaryStarName).toBe("Aster Primus Major");
    expect(summary.secondaryStarNames).toEqual(["Aster Proximus Major", "Aster Procul Minor"]);
  });
});
