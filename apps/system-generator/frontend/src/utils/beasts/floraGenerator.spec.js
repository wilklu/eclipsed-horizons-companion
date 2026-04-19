import { describe, expect, it } from "vitest";
import {
  buildFloraImagePrompt,
  buildFloraWorldUpdate,
  buildWorldLinkedFloraOptions,
  generateFloraProfile,
  mapWorldToFloraClimate,
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
    expect(update.remarks.length).toBeGreaterThan(0);
  });
});
