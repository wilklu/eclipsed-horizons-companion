import { describe, expect, it } from "vitest";
import {
  buildFloraImagePrompt,
  buildFloraWorldUpdate,
  buildWorldLinkedFloraOptions,
  deriveFloraVisualCues,
  generateFloraProfile,
  mapWorldToFloraClimate,
  randomFloraName,
  recommendGrowthForm,
} from "./floraGenerator.js";

describe("floraGenerator", () => {
  it("maps world conditions to flora climates", () => {
    expect(mapWorldToFloraClimate({ hydrographics: 9, avgTempC: 18 })).toBe("Wetland");
    expect(mapWorldToFloraClimate({ hydrographics: 1, avgTempC: 42 })).toBe("Arid");
    expect(mapWorldToFloraClimate({ avgTempC: -12 })).toBe("Tundra");
  });

  it("recommends climate-suitable growth forms", () => {
    expect(["Succulent Tower", "Crystal Moss", "Bulb Grove"]).toContain(recommendGrowthForm("Arid", () => 0));
  });

  it("maps subtype-rich worlds into more distinctive flora climates", () => {
    expect(mapWorldToFloraClimate({ worldSubtype: "Gaian", hydrographics: 5, avgTempC: 19 })).toBe("Wetland");
    expect(mapWorldToFloraClimate({ worldSubtype: "Tartarian", hydrographics: 5, avgTempC: 8 })).toBe("Tundra");
  });

  it("builds flora names from the configured naming convention tables", () => {
    const name = randomFloraName("flora-seed");

    expect(name).toMatch(/[ '\-]/);
    expect(name.length).toBeGreaterThan(4);
  });

  it("creates a guid-like seed and identifier when none is provided", () => {
    const flora = generateFloraProfile();

    expect(flora.seed).toMatch(/^flora-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(flora.id).toBe(flora.seed);
  });

  it("allows flora names to reroll independently from the main seed", () => {
    const first = generateFloraProfile({ seed: "iona-flora", nameSeed: "flora-name-a" });
    const second = generateFloraProfile({ seed: "iona-flora", nameSeed: "flora-name-b" });

    expect(first.seed).toBe(second.seed);
    expect(first.name).not.toBe(second.name);
    expect(first.biology["Growth Form"]).toBe(second.biology["Growth Form"]);
  });

  it("builds deterministic linked flora profiles", () => {
    const linked = buildWorldLinkedFloraOptions({
      name: "Iona",
      hydrographics: 7,
      avgTempC: 19,
      nativeLifeform: "2201",
    });

    const first = generateFloraProfile({
      seed: "iona-flora",
      name: "Ionan Bloom",
      growthForm: linked.growthForm,
      climate: linked.climate,
      sourceWorld: linked.sourceWorld,
    });
    const second = generateFloraProfile({
      seed: "iona-flora",
      name: "Ionan Bloom",
      growthForm: linked.growthForm,
      climate: linked.climate,
      sourceWorld: linked.sourceWorld,
    });

    expect(second).toEqual(first);
    expect(first.hooks.length).toBeGreaterThan(1);
    expect(first.worldIntegration.summary).toContain("known for");
    expect(first.visualDescription).toContain("Ionan Bloom");
    expect(first.imagePrompt).toContain("Detailed botanical concept art");
    expect(first.taxonomy.Domain).toBeTruthy();
    expect(first.taxonomy["Phylum / Division"]).toBeTruthy();
    expect(first.taxonomy.Species).toBeTruthy();
    expect(first.lineage.originModel).toBeTruthy();
  });

  it("builds an image-ready flora description", () => {
    const prompt = buildFloraImagePrompt({
      name: "Ionan Bloom",
      biology: {
        "Growth Form": "Reed Colony",
        Climate: "Wetland",
        Height: "3 m",
        Canopy: "spiral fronds",
        Coloration: "amber and jade",
      },
      ecology: { "Soil Preference": "peat-rich bog beds", "Water Strategy": "fog siphoning" },
      adaptations: ["bioluminescent bloom tips", "rapid wound callusing"],
      uses: { "Primary Use": "medicinal resin" },
      sourceWorld: { name: "Iona" },
    });

    expect(prompt.visualDescription).toContain("Ionan Bloom");
    expect(prompt.imagePrompt).toContain("Iona");
    expect(prompt.imageCaption).toContain("specimen");
  });

  it("builds a world update overlay from flora records", () => {
    const update = buildFloraWorldUpdate({
      id: "flora-1",
      name: "Ionan Bloom",
      biology: { "Growth Form": "Canopy Tree", Climate: "Temperate" },
      uses: { "Primary Use": "medicinal resin", "Hazard Level": "Moderate" },
    });

    expect(update.linkedFloraSummary.name).toBe("Ionan Bloom");
    expect(update.linkedFloraSummary.primaryUse).toBe("medicinal resin");
    expect(update.linkedFloraSummary.scientificName).toBeTruthy();
    expect(update.linkedFloraSummary.originModel).toBeTruthy();
    expect(update.remarks.length).toBeGreaterThan(0);
  });

  it("derives planetary visual cues from climate: tundra worlds produce frost-adapted tissues", () => {
    const tundra = deriveFloraVisualCues({ biology: { Climate: "Tundra" } });
    expect(tundra.climaticTexture.toLowerCase()).toMatch(/frost|wiry|antifreeze|stolon/);
    expect(tundra.climaticAdaptation.toLowerCase()).toMatch(/cold|ivory|frost|silver/);
  });

  it("derives planetary visual cues from climate: arid worlds produce drought-adapted waxy stems", () => {
    const arid = deriveFloraVisualCues({ biology: { Climate: "Arid" } });
    expect(arid.climaticTexture.toLowerCase()).toMatch(/waxy|drought|epidermis|storage/);
    expect(arid.climaticAdaptation.toLowerCase()).toMatch(/ochre|amber|heat|sun/);
  });

  it("derives planetary visual cues from climate: wetland worlds produce flood-adapted membranes", () => {
    const wetland = deriveFloraVisualCues({ biology: { Climate: "Wetland" } });
    expect(wetland.climaticTexture.toLowerCase()).toMatch(/moisture|membrane|flood|root/);
    expect(wetland.climaticAdaptation.toLowerCase()).toMatch(/emerald|teal|waterlogged|flood/);
  });

  it("injects planetary visual cues into generated flora image prompts", () => {
    const tundraFlora = generateFloraProfile({ seed: "tundra-test", climate: "Tundra" });
    expect(tundraFlora.imagePrompt.toLowerCase()).toMatch(/frost|wiry|antifreeze|ivory|silver|cold/);

    const aridFlora = generateFloraProfile({ seed: "arid-test", climate: "Arid" });
    expect(aridFlora.imagePrompt.toLowerCase()).toMatch(/waxy|drought|ochre|amber|heat/);
  });
});
