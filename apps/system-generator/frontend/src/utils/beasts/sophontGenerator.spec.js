import { describe, expect, it } from "vitest";
import {
  buildSophontDiplomacyProfile,
  buildSophontEventChain,
  buildSophontFactionTensions,
  buildSophontImagePrompt,
  buildSophontHistoryTimeline,
  buildSophontWorldUpdate,
  buildWorldLinkedSophontOptions,
  describeSophontTechBand,
  generateSophontProfile,
  mapWorldToSophontEnvironment,
  recommendBodyPlan,
} from "./sophontGenerator.js";

describe("sophontGenerator shared biology rules", () => {
  it("maps stored world conditions to a sophont home environment", () => {
    expect(mapWorldToSophontEnvironment({ hydrographics: 9, avgTempC: 16 })).toBe("Aquatic");
    expect(mapWorldToSophontEnvironment({ hydrographics: 1, avgTempC: 42 })).toBe("Desert");
    expect(mapWorldToSophontEnvironment({ hydrographics: 4, avgTempC: -12 })).toBe("Arctic");
  });

  it("recommends a body plan suited to the environment", () => {
    expect(["Aquatic", "Radial Symmetry", "Bilateral Symmetry"]).toContain(recommendBodyPlan("Aquatic", () => 0));
    expect(["Avian", "Bilateral Symmetry", "Segmented"]).toContain(recommendBodyPlan("Mountain", () => 0));
  });

  it("creates a guid-like seed and identifier when none is provided", () => {
    const profile = generateSophontProfile();

    expect(profile.seed).toMatch(/^sophont-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(profile.id).toBe(profile.seed);
  });

  it("allows sophont names to reroll independently from the main seed", () => {
    const first = generateSophontProfile({ seed: "caledon-native", nameSeed: "sophont-name-a" });
    const second = generateSophontProfile({ seed: "caledon-native", nameSeed: "sophont-name-b" });

    expect(first.seed).toBe(second.seed);
    expect(first.name).not.toBe(second.name);
    expect(first.biology["Body Plan"]).toBe(second.biology["Body Plan"]);
  });

  it("builds deterministic world-linked sophont profiles", () => {
    const linked = buildWorldLinkedSophontOptions({
      name: "Caledon",
      uwp: "A867A99-C",
      hydrographics: 8,
      avgTempC: 18,
      nativeSophontLife: true,
    });

    const first = generateSophontProfile({
      seed: "caledon-native",
      name: "Caledans",
      bodyPlan: linked.bodyPlan,
      homeEnvironment: linked.homeEnvironment,
      sourceWorld: linked.sourceWorld,
    });

    const second = generateSophontProfile({
      seed: "caledon-native",
      name: "Caledans",
      bodyPlan: linked.bodyPlan,
      homeEnvironment: linked.homeEnvironment,
      sourceWorld: linked.sourceWorld,
    });

    expect(second).toEqual(first);
    expect(first.sourceWorld?.name).toBe("Caledon");
    expect(first.origin).toBeTruthy();
    expect(first.lineage.originModel).toBeTruthy();
    expect(first.lineage.humanAnalogueStatus).toBeTruthy();
    expect(first.taxonomy.Domain).toBeTruthy();
    expect(first.taxonomy.Family).toBeTruthy();
    expect(first.taxonomy.Species).toBeTruthy();
    expect(first.civilization["Settlement Pattern"]).toBeTruthy();
    expect(first.worldIntegration.summary).toContain("culture");
    expect(first.diplomacy["Current Flashpoint"]).toBeTruthy();
    expect(first.historyTimeline.length).toBeGreaterThan(1);
    expect(first.factionTensions.summary).toContain("maneuvering");
    expect(first.eventChain).toHaveLength(3);
    expect(first.visualDescription).toContain("Caledans");
    expect(first.imagePrompt).toContain("Detailed sci-fi species concept art");
  });

  it("builds an image-ready sophont description", () => {
    const profile = generateSophontProfile({
      seed: "art-case",
      name: "Talari",
      bodyPlan: "Avian",
      homeEnvironment: "Mountain",
    });

    const prompt = buildSophontImagePrompt(profile);
    expect(prompt.visualDescription).toContain("Talari");
    expect(prompt.imagePrompt).toContain("full-body character sheet");
    expect(prompt.imageCaption).toContain("sophont concept");
  });

  it("builds diplomacy hooks, faction tensions, and a short event chain", () => {
    const diplomacy = buildSophontDiplomacyProfile({
      techLevel: 10,
      civilization: { "Contact Status": "Open contact", "Diplomatic Posture": "scholarly exchange" },
    });
    const timeline = buildSophontHistoryTimeline({
      name: "Talari",
      techLevel: 10,
      civilization: { "Tech Band": "stellar-capable", "Settlement Pattern": "Arcology city-states" },
      diplomacy,
      sourceWorld: {
        name: "Talara",
        nativeSophontLife: true,
        factionsProfile: { summary: "2 significant factions; Riots pressure from II" },
        civilConflict: { active: true, trigger: "balkanization" },
      },
    });
    const factionTensions = buildSophontFactionTensions({
      name: "Talari",
      civilization: { "Settlement Pattern": "Arcology city-states" },
      diplomacy,
      sourceWorld: {
        name: "Talara",
        factionsProfile: { summary: "2 significant factions; Riots pressure from II" },
        civilConflict: { active: true, trigger: "balkanization" },
      },
    });
    const eventChain = buildSophontEventChain({
      name: "Talari",
      diplomacy,
      factionTensions,
      historyTimeline: timeline,
      sourceWorld: { name: "Talara" },
    });

    expect(diplomacy.hooks.length).toBeGreaterThan(0);
    expect(timeline).toHaveLength(3);
    expect(timeline[0].title).toBeTruthy();
    expect(factionTensions.factions).toHaveLength(2);
    expect(eventChain).toHaveLength(3);
    expect(eventChain[0].title).toContain("Dispute");
  });

  it("builds a world update overlay from a saved sophont dossier", () => {
    expect(describeSophontTechBand(12)).toBe("advanced interstellar");

    const update = buildSophontWorldUpdate({
      id: "s-1",
      name: "Caledans",
      techLevel: 11,
      government: "Elected Senate",
      socialStructure: "Democratic Collective",
      origin: "Native sophont lineage",
      civilization: {
        "Settlement Pattern": "Arcology city-states",
        "Contact Status": "Open contact",
        "Cultural Focus": "scientific stewardship",
        "Diplomatic Posture": "scholarly exchange",
        "Tech Band": "advanced interstellar",
      },
    });

    expect(update.nativeSophontLife).toBe(true);
    expect(update.linkedSophontProfile.name).toBe("Caledans");
    expect(update.linkedSophontProfile.scientificName).toBeTruthy();
    expect(update.linkedSophontProfile.originModel).toBeTruthy();
    expect(update.secondaryWorldContext).toContain("Open contact");
    expect(update.linkedSophontProfile.currentFlashpoint).toBeTruthy();
    expect(update.remarks.length).toBeGreaterThan(0);
  });
});
