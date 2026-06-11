import { describe, expect, it } from "vitest";
import {
  buildDynastyChronicles,
  createHistorySeededRng,
  generateProceduralHistory,
  randomHistoricalPersonName,
  resolveContextualSubcategory,
} from "./proceduralHistory.js";

function createSequenceRng(sequence = [0.5]) {
  let index = 0;
  return () => {
    const value = sequence[Math.min(index, sequence.length - 1)];
    index += 1;
    return value;
  };
}

describe("proceduralHistory contextual subcategories", () => {
  it("prefers sectarian religious pressure under theocracy", () => {
    const subcategory = resolveContextualSubcategory(
      "Religious",
      {
        government: "High Theocracy",
        pressureLevel: "High",
        diplomaticPosture: "aggressive expansion",
      },
      () => 0.95,
    );

    expect(subcategory).toBe("Sectarian Conflict");
  });

  it("surfaces contextual drivers in generated overviews", () => {
    const history = generateProceduralHistory({
      civilizationName: "Talari Concord",
      historyLength: "medium",
      eraStart: 250000,
      rng: createSequenceRng([0.72, 0.91, 0.35, 0.88, 0.27, 0.66]),
      context: {
        worldName: "Talara",
        government: "Directorate",
        worldTraits: ["desert", "frontier", "scarcity"],
        pressureLevel: "High",
        diplomaticPosture: "guarded hostility",
        techBand: "stellar-capable",
        flashpoint: "water-rights blockade",
        conflictSummary: "frontier blocs are contesting the remaining aquifers",
      },
    });

    expect(history.overview["Context Drivers"]).toContain("Directorate");
    expect(history.overview["Context Drivers"]).toContain("desert");
    expect(history.overview["Context Drivers"]).toContain("High pressure");
  });

  it("builds first and last names plus tracked lives for important figures", () => {
    const person = randomHistoricalPersonName(createSequenceRng([0.1, 0.2]), { civilizationName: "Talari Concord" });
    const history = generateProceduralHistory({
      civilizationName: "Talari Concord",
      historyLength: "medium",
      eraStart: 10000,
      rng: createSequenceRng([0.14, 0.42, 0.61, 0.83, 0.25, 0.73]),
      context: { worldName: "Talara", government: "Republic" },
    });

    expect(person.firstName).toBeTruthy();
    expect(person.lastName).toBeTruthy();
    expect(history.notablePeople.length).toBeGreaterThan(0);
    expect(history.notablePeople[0].lifeEvents.map((entry) => entry.type)).toContain("Birth");
    expect(history.notablePeople[0].lifeEvents.map((entry) => entry.type)).toContain("Death");
  });

  it("builds dynasties and parent-child links for the family tree", () => {
    const history = generateProceduralHistory({
      civilizationName: "Talari Concord",
      historyLength: "long",
      eraStart: 15000,
      rng: createSequenceRng([0.22, 0.44, 0.66, 0.88, 0.31, 0.57, 0.79]),
      context: { worldName: "Talara", government: "Directorate", worldTraits: ["frontier"] },
    });

    expect(history.dynasties.length).toBeGreaterThan(0);
    expect(history.familyTree.length).toBe(history.dynasties.length);
    expect(history.notablePeople.some((person) => Boolean(person.parentName) || person.childNames?.length)).toBe(true);
    expect(history.notablePeople.some((person) => Boolean(person.spouseName) || person.siblingNames?.length)).toBe(
      true,
    );
    expect(
      history.dynasties.every((dynasty) => Boolean(dynasty.rivalDynasty) && Boolean(dynasty.inheritanceCrisis)),
    ).toBe(true);
    expect(
      history.familyTree.some((branch) =>
        branch.links.some((link) => link.type === "marriage" || link.type === "sibling"),
      ),
    ).toBe(true);
  });

  it("adds great-house politics, heirs, and causal succession events", () => {
    const history = generateProceduralHistory({
      civilizationName: "Talari Concord",
      historyLength: "long",
      eraStart: 25000,
      rng: createSequenceRng([0.18, 0.36, 0.54, 0.72, 0.9, 0.27, 0.45, 0.63]),
      context: {
        worldName: "Talara",
        government: "Imperial Directorate",
        pressureLevel: "High",
        diplomaticPosture: "guarded hostility",
        flashpoint: "succession blockade",
        conflictSummary: "great houses are maneuvering for the throne",
      },
    });

    expect(
      history.dynasties.some((dynasty) => Boolean(dynasty.alliedDynasty) && Boolean(dynasty.cadetBranchName)),
    ).toBe(true);
    expect(history.dynasties.some((dynasty) => Boolean(dynasty.feudSummary) && Boolean(dynasty.betrayalSummary))).toBe(
      true,
    );
    expect(history.notablePeople.some((person) => Boolean(person.heirName) && Boolean(person.claimantName))).toBe(true);
    expect(history.notablePeople.some((person) => person.childProfiles?.length)).toBe(true);
    expect(history.events.some((event) => Boolean(event.causedBy) && Boolean(event.relatedDynasty))).toBe(true);
  });

  it("produces deterministic output when a seeded rng is supplied", () => {
    const shared = {
      civilizationName: "Talari Concord",
      historyLength: "long",
      eraStart: 25000,
      context: {
        worldName: "Talara",
        government: "Imperial Directorate",
        pressureLevel: "High",
        diplomaticPosture: "guarded hostility",
        flashpoint: "succession blockade",
      },
    };

    const one = generateProceduralHistory({
      ...shared,
      rng: createHistorySeededRng("talara-history-seed"),
    });
    const two = generateProceduralHistory({
      ...shared,
      rng: createHistorySeededRng("talara-history-seed"),
    });

    expect(one.events.map((event) => event.title)).toEqual(two.events.map((event) => event.title));
    expect(one.overview["Historical Themes"]).toBe(two.overview["Historical Themes"]);
    expect(one.notablePeople.map((person) => person.name)).toEqual(two.notablePeople.map((person) => person.name));
  });

  it("builds branching family generations instead of a strictly linear chain", () => {
    const notablePeople = Array.from({ length: 9 }, (_, index) => ({
      name: `Figure ${index + 1}`,
      firstName: `Figure${index + 1}`,
      lastName: "Talor",
      role: "Regent",
      category: "Political",
      summary: `Figure ${index + 1} shaped the dynasty.`,
      birth: { yearsAgo: 9000 - index * 100 },
      death: { yearsAgo: 8800 - index * 90 },
      lifeEvents: [],
    }));

    const lineage = buildDynastyChronicles(
      {
        notablePeople,
        civilizationName: "Talari Concord",
        context: { worldName: "Talara" },
        totalSpan: 10000,
      },
      () => 0.1,
    );

    expect(
      lineage.dynasties.some((dynasty) => dynasty.members.length >= 3 && dynasty.generations < dynasty.members.length),
    ).toBe(true);
    expect(lineage.familyTree.some((branch) => branch.members.some((member) => Array.isArray(member.childNames)))).toBe(
      true,
    );
  });
});
