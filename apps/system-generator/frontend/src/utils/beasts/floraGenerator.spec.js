import { describe, expect, it } from "vitest";
import {
  ALL_FLORA_TABLES,
  BLOOM_SHAPE,
  COLOURWAY_PALETTE,
  FLORA_ADAPTATIONS,
  FLORA_ADAPTATION,
  FLORA_TAGLINE_ECOLOGY_FRAMES,
  FLORA_TAGLINE_FRAMINGS,
  FLORA_TAGLINE_ORIGINS,
  FLORA_TAGLINE_PATTERNS,
  FLORA_TAGLINE_QUALITIES,
  FLORA_TAGLINE_TEMPERAMENTS,
  LIGHTING_MOOD,
  PRIMARY_USE,
  FLORA_ROOT_NETWORK_ARCHITECTURE,
  FLORA_ROOT_NETWORK_STRATEGY,
  FLORA_ROOT_NETWORK_SUBSTRATE,
  FLORA_ROOT_NETWORK_TISSUE,
  FLORA_WATER_STRATEGY_MECHANISM,
  FLORA_WATER_STRATEGY_SOURCE,
  FLORA_WATER_STRATEGY_STORAGE,
  SURFACE_TEXTURE,
  buildFloraImagePrompt,
  buildFloraWorldUpdate,
  buildWorldLinkedFloraOptions,
  deriveFloraVisualCues,
  generateCompactFlora,
  generateDetailedFlora,
  generateFloraRootNetwork,
  generateFloraProfile,
  generateFloraWaterStrategy,
  generateSpecFlora,
  generateTagline,
  generateTaglineList,
  getRandomEntry,
  getWorldAvailableFloraClimates,
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
    const result = recommendGrowthForm("Arid", () => 0);

    expect(result).toMatchObject({
      climate: "Arid",
      prefix: "Dwarf",
      core: "Tower",
      suffix: "Scrub",
    });
    expect(result.recommendedForm).toBe("Dwarf Tower");
  });

  it("maps subtype-rich worlds into more distinctive flora climates", () => {
    expect(mapWorldToFloraClimate({ worldSubtype: "Gaian", hydrographics: 5, avgTempC: 19 })).toBe("Wetland");
    expect(mapWorldToFloraClimate({ worldSubtype: "Tartarian", hydrographics: 5, avgTempC: 8 })).toBe("Tundra");
  });

  it("derives available flora climates from terrain card composition", () => {
    const climates = getWorldAvailableFloraClimates({
      terrainComposition: {
        hexCounts: [
          { type: "ocean", count: 6 },
          { type: "mountain", count: 4 },
          { type: "desert", count: 2 },
        ],
      },
    });

    expect(climates).toContain("Wetland");
    expect(climates).toContain("Alpine");
    expect(climates).toContain("Arid");
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
    expect(first.biology["Hue Meaning"]).toBeTruthy();
    expect(first.biology.Hue).toBeTruthy();
    expect(first.biology["Hue Suffix Meaning"]).toBeTruthy();
    expect(first.biology["Hue Example Hues"]).toBeTruthy();
    expect(first.biology.Accent).toBeTruthy();
    expect(first.biology.Effect).toBeTruthy();
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
        Hue: "bright green",
        "Hue Meaning": "vivid, saturated",
        "Hue Suffix Meaning": "base color is green",
        "Hue Example Hues": ["lime", "emerald", "moss"],
        Accent: "silver veined",
        "Accent Summary": "silver veined",
        Effect: "velvet finish",
        "Effect Meaning": "soft, matte, plush",
        "Effect Suffix Meaning": "general surface appearance",
      },
      ecology: { "Soil Preference": "peat-rich bog beds", "Water Strategy": "fog siphoning" },
      adaptations: ["bioluminescent bloom tips", "rapid wound callusing"],
      uses: { "Primary Use": "medicinal resin" },
      sourceWorld: { name: "Iona" },
    });

    expect(prompt.visualDescription).toContain("Ionan Bloom");
    expect(prompt.visualDescription).toContain("bright green");
    expect(prompt.visualDescription).toContain("vivid, saturated");
    expect(prompt.visualDescription).not.toContain("suffix:");
    expect(prompt.visualDescription).toContain("lime, emerald, moss");
    expect(prompt.visualDescription).toContain("silver veined");
    expect(prompt.visualDescription).toContain("velvet finish");
    expect(prompt.imagePrompt).toContain("Iona");
    expect(prompt.imagePrompt).toContain("bright green");
    expect(prompt.imagePrompt).not.toContain("suffix:");
    expect(prompt.imagePrompt).toContain("lime, emerald, moss");
    expect(prompt.imagePrompt).toContain("silver veined");
    expect(prompt.imagePrompt).toContain("velvet finish");
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
    const tundra = deriveFloraVisualCues({ biology: { Climate: "Tundra" } }, () => 0);
    expect(tundra.climate).toBe("Tundra");
    expect(tundra.climaticTexture).toContain("velvet leaf surfaces");
    expect(tundra.climaticTexture).toContain("soft dawn light");
    expect(tundra.climaticAdaptation).toContain("pale moss with white banded accents");
    expect(tundra.climaticAdaptation).toContain("ice-crystal antifreeze tissues");
  });

  it("derives planetary visual cues from climate: arid worlds produce drought-adapted waxy stems", () => {
    const arid = deriveFloraVisualCues({ biology: { Climate: "Arid" } }, () => 0);
    expect(arid.climate).toBe("Arid");
    expect(arid.climaticTexture).toContain("waxy reflective skin");
    expect(arid.climaticTexture).toContain("high desert glare");
    expect(arid.climaticAdaptation).toContain("pale cinnamon with white banded accents");
    expect(arid.climaticAdaptation).toContain("mirror-leaf heat deflection");
  });

  it("derives planetary visual cues from climate: wetland worlds produce flood-adapted membranes", () => {
    const wetland = deriveFloraVisualCues({ biology: { Climate: "Wetland" } }, () => 0);
    expect(wetland.climate).toBe("Wetland");
    expect(wetland.climaticTexture).toContain("velvet leaf surfaces");
    expect(wetland.climaticTexture).toContain("misty wetland haze");
    expect(wetland.climaticAdaptation).toContain("pale moss with white veined accents");
    expect(wetland.climaticAdaptation).toContain("pressure-sealed seed chambers");
  });

  it("injects planetary visual cues into generated flora image prompts", () => {
    const tundraFlora = generateFloraProfile({ seed: "tundra-test", climate: "Tundra" });
    expect(tundraFlora.imagePrompt.toLowerCase()).toMatch(/preferring|colouration with|conditions/);

    const aridFlora = generateFloraProfile({ seed: "arid-test", climate: "Arid" });
    expect(aridFlora.imagePrompt.toLowerCase()).toMatch(/preferring|colouration with|conditions/);
  });

  it("exports the base flora adaptation table for extension", () => {
    expect(FLORA_ADAPTATIONS).toContain("bioluminescent bloom tips");
    expect(Array.isArray(FLORA_ADAPTATIONS)).toBe(true);
  });

  it("accepts additional adaptations when generating flora", () => {
    const flora = generateFloraProfile({
      seed: "custom-adaptation-test-7",
      additionalAdaptations: ["vacuum-hardened spore shells", "mirror-petal flare signaling"],
    });

    expect(
      flora.adaptations.some((adaptation) =>
        ["vacuum-hardened spore shells", "mirror-petal flare signaling"].includes(adaptation),
      ),
    ).toBe(true);
  });

  it("builds compact root networks from architecture and strategy tables", () => {
    expect(generateFloraRootNetwork({ mode: "compact", rng: () => 0 })).toBe(
      `${FLORA_ROOT_NETWORK_ARCHITECTURE[0]} ${FLORA_ROOT_NETWORK_STRATEGY[0]}`,
    );
  });

  it("builds verbose root networks from architecture, substrate, and strategy tables", () => {
    expect(generateFloraRootNetwork({ mode: "verbose", rng: () => 0 })).toBe(
      `${FLORA_ROOT_NETWORK_ARCHITECTURE[0]} ${FLORA_ROOT_NETWORK_SUBSTRATE[0]} ${FLORA_ROOT_NETWORK_STRATEGY[0]}`,
    );
  });

  it("builds descriptive root networks from tissue, architecture, and substrate tables", () => {
    expect(generateFloraRootNetwork({ mode: "descriptive", rng: () => 0 })).toBe(
      `${FLORA_ROOT_NETWORK_TISSUE[0]} ${FLORA_ROOT_NETWORK_ARCHITECTURE[0]} ${FLORA_ROOT_NETWORK_SUBSTRATE[0]}`,
    );
  });

  it("uses the requested root network mode in generated flora profiles", () => {
    const flora = generateFloraProfile({ seed: "root-network-mode", rootNetworkMode: "verbose" });
    const parts = String(flora.ecology["Root Network"] || "").split(" ");

    expect(parts.length).toBeGreaterThanOrEqual(5);
  });

  it("builds compact water strategies from source and mechanism tables", () => {
    expect(generateFloraWaterStrategy({ mode: "compact", rng: () => 0 })).toBe(
      `${FLORA_WATER_STRATEGY_SOURCE[0]} with ${FLORA_WATER_STRATEGY_MECHANISM[0]}`,
    );
  });

  it("builds full water strategies from source, mechanism, and storage tables", () => {
    expect(generateFloraWaterStrategy({ mode: "full", rng: () => 0 })).toBe(
      `${FLORA_WATER_STRATEGY_SOURCE[0]} -> ${FLORA_WATER_STRATEGY_MECHANISM[0]} -> ${FLORA_WATER_STRATEGY_STORAGE[0]}`,
    );
  });

  it("builds concise water strategies from source, mechanism, and storage tables", () => {
    expect(generateFloraWaterStrategy({ mode: "concise", rng: () => 0 })).toBe(
      `${FLORA_WATER_STRATEGY_SOURCE[0]} ${FLORA_WATER_STRATEGY_MECHANISM[0]} ${FLORA_WATER_STRATEGY_STORAGE[0]}`,
    );
  });

  it("biases arid water strategies toward drought-oriented entries", () => {
    expect(generateFloraWaterStrategy({ mode: "full", climate: "Arid", rng: () => 0 })).toBe(
      "fog drip -> vapor sorption -> subterranean cistern",
    );
  });

  it("uses the requested water strategy mode in generated flora profiles", () => {
    const flora = generateFloraProfile({
      seed: "water-strategy-mode",
      climate: "Wetland",
      waterStrategyMode: "full",
    });

    expect(String(flora.ecology["Water Strategy"] || "")).toContain("->");
  });

  it("exports d8 flora appearance and trait tables", () => {
    expect(COLOURWAY_PALETTE).toHaveLength(8);
    expect(BLOOM_SHAPE).toHaveLength(8);
    expect(SURFACE_TEXTURE).toHaveLength(8);
    expect(LIGHTING_MOOD).toHaveLength(8);
    expect(FLORA_ADAPTATION).toHaveLength(8);
    expect(PRIMARY_USE).toHaveLength(8);
    expect(ALL_FLORA_TABLES.colours.die).toBe("d8");
  });

  it("selects random table entries with deterministic rng", () => {
    expect(getRandomEntry(["a", "b", "c"], () => 0)).toBe("a");
    expect(getRandomEntry(["a", "b", "c"], () => 0.999)).toBe("c");
  });

  it("builds compact flora appearance lines", () => {
    expect(generateCompactFlora({ rng: () => 0 })).toBe(
      "emerald and silver lantern-shaped blossoms with velvet leaf surfaces, glowing in soft dawn light",
    );
  });

  it("builds detailed flora descriptions with adaptation and use", () => {
    expect(generateDetailedFlora({ rng: () => 0 })).toBe(
      "A flora with emerald and silver colouring, bearing lantern-shaped blossoms. Its velvet leaf surfaces are adapted for soft dawn light conditions, with bioluminescent bloom tips. Primary harvest: medicinal resin.",
    );
  });

  it("builds flora spec sheets as structured lines", () => {
    expect(generateSpecFlora({ rng: () => 0 })).toBe(
      "Colour: emerald and silver\nBloom shape: lantern-shaped blossoms\nTexture: velvet leaf surfaces\nLighting: soft dawn light\nAdaptation: bioluminescent bloom tips\nPrimary use: medicinal resin",
    );
  });

  it("exports the structured flora tagline tables", () => {
    expect(FLORA_TAGLINE_FRAMINGS.length).toBeGreaterThanOrEqual(10);
    expect(FLORA_TAGLINE_TEMPERAMENTS.length).toBeGreaterThanOrEqual(20);
    expect(FLORA_TAGLINE_ORIGINS.length).toBeGreaterThanOrEqual(20);
    expect(FLORA_TAGLINE_QUALITIES.length).toBeGreaterThanOrEqual(20);
    expect(FLORA_TAGLINE_ECOLOGY_FRAMES.length).toBeGreaterThanOrEqual(20);
    expect(FLORA_TAGLINE_PATTERNS).toHaveLength(8);
  });

  it("builds deterministic tagline rolls", () => {
    expect(generateTagline({ rng: () => 0 })).toBe(
      "a hardy botanical lineage shaped by extreme frontiers, prized across nearby trade lanes",
    );
  });

  it("builds unique tagline lists up to the requested count", () => {
    const lines = generateTaglineList(5);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.length).toBeLessThanOrEqual(5);
    expect(new Set(lines).size).toBe(lines.length);
  });
});
