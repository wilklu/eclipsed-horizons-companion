import { describe, expect, it } from "vitest";

import { buildSystemSummaryLabel, summarizeSystemRecord } from "./systemSummary.js";

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
});
