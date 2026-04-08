import { describe, expect, it } from "vitest";

import { buildSystemHexSummary, summarizeSystemRecord } from "./systemSummary.js";

describe("systemSummary", () => {
  it("summarizes persisted system legal overlays for Traveller Map consumers", () => {
    const summary = summarizeSystemRecord({
      name: "Aramis",
      mainworldUwp: "A867A99-C",
      starport: { class: "A", navy: true, scout: true },
      gasGiants: 2,
      importance: "+2",
      travelZone: "Amber",
      tradeCodes: ["Hi", "In"],
      governmentProfile: { profileCode: "C7", summary: "Centralized bureau" },
      justiceProfile: { summary: "Inquisitorial review" },
      lawProfile: { summary: "Weapons restricted" },
      appealProfile: { summary: "Defendant appeal allowed" },
      privateLawProfile: { summary: "Arbitration mandatory" },
      personalRightsProfile: { summary: "Speech monitored" },
      minimumSustainableTechLevel: { summary: "TL 8 floor" },
      populationConcentration: { summary: "Dense arcologies" },
      urbanization: { summary: "Planet-spanning urban belts" },
      majorCities: { summary: "Five major cities" },
    });

    expect(summary.hasSavedSystem).toBe(true);
    expect(summary.systemName).toBe("Aramis");
    expect(summary.starport).toBe("A — Excellent");
    expect(summary.bases).toEqual(["Navy", "Scout"]);
    expect(summary.appealProfile).toBe("Defendant appeal allowed");
    expect(summary.privateLawProfile).toBe("Arbitration mandatory");
    expect(summary.personalRightsProfile).toBe("Speech monitored");
    expect(summary.tradeCodes).toEqual(["Hi", "In"]);
    expect(summary.surveyStatus).toBe("Survey summary available");
  });

  it("prefers mainworld fallbacks for Sector Survey hex summaries", () => {
    const summary = buildSystemHexSummary({
      mainworld: {
        name: "Mora",
        uwp: "B7569A9-B",
        governmentProfile: { profileCode: "B4" },
        justiceProfile: { summary: "Civil review panels" },
        lawProfile: { summary: "Moderate weapons licensing" },
        appealProfile: { summary: "Appellate courts available" },
        privateLawProfile: { summary: "Contract law formalized" },
        personalRightsProfile: { summary: "Assembly regulated" },
        factionsProfile: { summary: "Three active factions" },
        minimumSustainableTechLevel: { summary: "TL 7 floor" },
        populationConcentration: { summary: "Continental cores" },
        urbanization: { summary: "Urbanized coastal bands" },
        majorCities: { summary: "Two major cities" },
      },
    });

    expect(summary.mainworldName).toBe("Mora");
    expect(summary.mainworldUwp).toBe("B7569A9-B");
    expect(summary.governmentProfile).toBe("B4");
    expect(summary.appealProfile).toBe("Appellate courts available");
    expect(summary.privateLawProfile).toBe("Contract law formalized");
    expect(summary.personalRightsProfile).toBe("Assembly regulated");
    expect(summary.factionsProfile).toBe("Three active factions");
  });
});
