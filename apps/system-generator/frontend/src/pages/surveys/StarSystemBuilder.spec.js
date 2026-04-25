/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StarSystemBuilder from "./StarSystemBuilder.vue";
import { determineSystemPlanetZone } from "../../utils/systemWorldGeneration.js";

const hoisted = vi.hoisted(() => ({
  routeState: {
    query: {
      hex: "0101",
      systemRecordId: "gal-1:1,2:0101",
    },
    params: {
      galaxyId: "gal-1",
      sectorId: "grid:1:2",
    },
    name: "StarSystemBuilder",
  },
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  sectorStoreState: {
    sectors: [
      {
        sectorId: "gal-1:1,2",
        galaxyId: "gal-1",
        coordinates: { x: 1, y: 2 },
        metadata: {
          gridX: 1,
          gridY: 2,
          occupiedHexes: ["0101"],
          hexStarTypes: {},
        },
      },
    ],
    setCurrentSector: vi.fn(),
  },
  systemStoreState: {
    systems: [],
    currentSystemId: null,
    loadSystems: vi.fn(),
    createSystem: vi.fn(async (payload) => payload),
    setCurrentSystem: vi.fn(),
    findSystemByHex: vi.fn(),
  },
}));

const routeState = reactive(hoisted.routeState);
const sectorStoreState = reactive(hoisted.sectorStoreState);
const systemStoreState = reactive(hoisted.systemStoreState);

vi.mock("vue-router", () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: hoisted.routerPush, replace: hoisted.routerReplace }),
}));

vi.mock("../../stores/preferencesStore.js", () => ({
  usePreferencesStore: () => ({
    worldNameMode: "list",
    asteroidBeltNameMode: "phonotactic",
    galaxyMythicTheme: "all",
  }),
}));

vi.mock("../../stores/sectorStore.js", () => ({
  useSectorStore: () => sectorStoreState,
}));

vi.mock("../../stores/systemStore.js", () => ({
  useSystemStore: () => systemStoreState,
}));

vi.mock("../../api/sectorApi.js", () => ({
  getSector: vi.fn(async () => sectorStoreState.sectors[0]),
  upsertSector: vi.fn(async (payload) => payload),
}));

vi.mock("../../composables/useArchiveTransfer.js", () => ({
  useArchiveTransfer: () => ({
    overlayProps: {
      isVisible: false,
      context: "stellar",
      tone: "analysis",
      stateLabel: "",
      statusCode: "",
      title: "",
      message: "",
      barLabel: "",
      diagnostics: [],
      ledger: [],
    },
    exportJson: vi.fn(),
  }),
}));

describe("StarSystemBuilder page", () => {
  it("maps orbit distance into Hot, Warm, Habitable, Cold, and Frozen zones", () => {
    const habitableZone = { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8 };

    expect(determineSystemPlanetZone(0.2, habitableZone)).toBe("hot");
    expect(determineSystemPlanetZone(0.7, habitableZone)).toBe("warm");
    expect(determineSystemPlanetZone(1.2, habitableZone)).toBe("habitable");
    expect(determineSystemPlanetZone(3.2, habitableZone)).toBe("cold");
    expect(determineSystemPlanetZone(7.4, habitableZone)).toBe("frozen");
  });

  beforeEach(() => {
    hoisted.routerPush.mockReset();
    hoisted.routerReplace.mockReset();
    hoisted.systemStoreState.currentSystemId = null;
    routeState.query = {
      hex: "0101",
      systemRecordId: "gal-1:1,2:0101",
    };

    const nullHabitableZoneSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "BH",
          spectralClass: "Black Hole",
          massInSolarMasses: 12,
          luminosity: 0,
          temperatureK: 0,
          orbitType: null,
          isAnomaly: true,
        },
      ],
      habitableZone: null,
      planets: [],
      metadata: {},
    };

    hoisted.systemStoreState.systems = [nullHabitableZoneSystem];
    hoisted.systemStoreState.loadSystems = vi.fn(async () => hoisted.systemStoreState.systems);
    hoisted.systemStoreState.createSystem = vi.fn(async (payload) => payload);
    hoisted.systemStoreState.findSystemByHex = vi.fn(() => nullHabitableZoneSystem);
    hoisted.systemStoreState.setCurrentSystem = vi.fn((systemId) => {
      hoisted.systemStoreState.currentSystemId = systemId;
    });
  });

  it("renders safely when a persisted system is missing habitable-zone data", async () => {
    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("System Layout Anchor");
    expect(wrapper.text()).toContain("Inner System");
    expect(wrapper.text()).toContain("Outer System");
  });

  it("shows Native Lifeforms and Native Sophonts in the Planetary Catalog", async () => {
    const lifeBearingSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [
        {
          name: "Verdant",
          type: "Terrestrial Planet",
          orbitAU: 1.1,
          zone: "habitable",
          composition: "Rocky",
          uwp: "B766655-8",
          nativeLifeform: "2201",
          nativeSophontLife: true,
        },
      ],
      metadata: {},
    };

    systemStoreState.systems = [lifeBearingSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => lifeBearingSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Native Lifeforms");
    expect(wrapper.text()).toContain("Native Sophonts");
    expect(wrapper.text()).toContain("Present");
    expect(wrapper.text()).toContain("Exist");
  });

  it("keeps the saved system designation in the Stellar Survey header", async () => {
    const namedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "Aster Primus Major",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [],
      profiles: {
        systemDesignation: "Aster System",
      },
      metadata: {},
    };

    systemStoreState.systems = [namedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => namedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Aster System");
    expect(wrapper.text()).not.toContain("0101\n");
  });

  it("shows a descriptive subtype label for legacy persisted planets without precomputed classification", async () => {
    const legacyTypedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [
        {
          name: "Verdant",
          type: "Terrestrial Planet",
          orbitNumber: 4,
          orbitAU: 1.2,
          zone: "habitable",
          hydrographics: 6,
          avgTempC: 18,
          composition: "Rocky",
        },
      ],
      metadata: {},
    };

    systemStoreState.systems = [legacyTypedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => legacyTypedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Inner Zone Tectonic");
  });

  it("shows expanded pelagic subtype labels for saved ocean worlds", async () => {
    const oceanicSavedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [
        {
          name: "Pelagia",
          type: "Terrestrial Planet",
          orbitNumber: 5,
          orbitAU: 1.5,
          zone: "habitable",
          hydrographics: 10,
          atmosphereCode: 6,
          avgTempC: 14,
          hydrosphereLiquid: "Liquid Water",
          nativeLifeform: "A987",
          composition: "Rocky with deep oceans",
        },
      ],
      metadata: {},
    };

    systemStoreState.systems = [oceanicSavedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => oceanicSavedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Inner Zone Pelagic");
  });

  it("shows vesperian subtype labels for saved epistellar worlds", async () => {
    const epistellarSavedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "M2V",
          spectralClass: "M2V",
          massInSolarMasses: 0.42,
          luminosity: 0.03,
          temperatureK: 3500,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.12, outerAU: 0.28, frostLineAU: 1.2, hasRadiantHabitableZone: true },
      planets: [
        {
          name: "Vespera",
          type: "Terrestrial Planet",
          orbitNumber: 2,
          orbitAU: 0.18,
          zone: "habitable",
          hydrographics: 4,
          atmosphereCode: 7,
          avgTempC: 22,
          hydrosphereLiquid: "Liquid Water",
          nativeLifeform: "B776",
          composition: "Rocky silicate crust",
        },
      ],
      metadata: {},
    };

    systemStoreState.systems = [epistellarSavedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => epistellarSavedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Epistellar Vesperian");
  });

  it("shows telluric subtype labels for saved greenhouse worlds", async () => {
    const telluricSavedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "F3V",
          spectralClass: "F3V",
          massInSolarMasses: 1.3,
          luminosity: 2.4,
          temperatureK: 6900,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 1.2, outerAU: 2.3, frostLineAU: 6.8, hasRadiantHabitableZone: true },
      planets: [
        {
          name: "Cytherea",
          type: "Terrestrial Planet",
          orbitNumber: 4,
          orbitAU: 1.4,
          zone: "warm",
          hydrographics: 1,
          atmosphereCode: 11,
          avgTempC: 180,
          composition: "Dense carbon dioxide atmosphere with sulfur clouds",
        },
      ],
      metadata: {},
    };

    systemStoreState.systems = [telluricSavedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => telluricSavedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Inner Zone Cytherean");
  });

  it("preserves the routed system name and legacy star designation labels for saved surveys", async () => {
    routeState.query = {
      ...routeState.query,
      systemName: "Aster System",
    };

    const legacyNamedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "",
          starKey: "Aster Primus Major",
          typeSubtype: "G2 V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [],
      metadata: {},
    };

    systemStoreState.systems = [legacyNamedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => legacyNamedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Aster System");
    expect(wrapper.text()).toContain("Aster Primus Major");
  });

  it("shows saved legacy starKey names even when designation is only a spectral placeholder", async () => {
    routeState.query = {
      ...routeState.query,
      systemName: "Aster System",
    };

    const legacyKeyedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2 V",
          starKey: "Aster Primus Major",
          spectralClass: "G2 V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [],
      metadata: {},
    };

    systemStoreState.systems = [legacyKeyedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => legacyKeyedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Aster Primus Major");
  });

  it("does not fall back to hex names or Star-0 placeholders for legacy saved surveys", async () => {
    routeState.query = {
      hex: "0101",
      systemRecordId: "gal-1:1,2:0101",
    };

    const genericLegacySystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      name: "0101",
      stars: [
        {
          designation: "Aster Primus Major",
          starKey: "Star-0",
          spectralClass: "G2 V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [],
      metadata: {
        displayName: "Aster System",
      },
    };

    systemStoreState.systems = [genericLegacySystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => genericLegacySystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Aster System");
    expect(wrapper.text()).toContain("Aster Primus Major");
    expect(wrapper.text()).not.toContain("Star-0");
  });

  it("uses the system name to build Primus and Proximus designations for generic saved stars", async () => {
    const autoNamedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      name: "Aster System",
      stars: [
        {
          designation: "G2 V",
          starKey: "star-0",
          spectralClass: "G2 V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
        {
          designation: "K7 V",
          starKey: "star-1",
          spectralClass: "K7 V",
          massInSolarMasses: 0.7,
          luminosity: 0.2,
          temperatureK: 4200,
          orbitType: "Close",
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [],
      metadata: {
        displayName: "Aster System",
      },
    };

    systemStoreState.systems = [autoNamedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => autoNamedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Aster Primus Major");
    expect(wrapper.text()).toContain("Aster Proximus Major");
  });

  it("uses the system name to build Primus and Proximus designations for generic saved stars", async () => {
    const autoNamedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      name: "Aster System",
      stars: [
        {
          designation: "G2 V",
          starKey: "star-0",
          spectralClass: "G2 V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
        {
          designation: "K7 V",
          starKey: "star-1",
          spectralClass: "K7 V",
          massInSolarMasses: 0.7,
          luminosity: 0.2,
          temperatureK: 4200,
          orbitType: "Close",
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [],
      metadata: {
        displayName: "Aster System",
      },
    };

    systemStoreState.systems = [autoNamedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => autoNamedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Aster Primus Major");
    expect(wrapper.text()).toContain("Aster Proximus Major");
  });

  it("renders clickable planet markers on the habitable-zone bar", async () => {
    const markerSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [
        { name: "Inner", type: "Terrestrial Planet", orbitAU: 0.4, zone: "hot", composition: "Rocky" },
        { name: "Verdant", type: "Terrestrial Planet", orbitAU: 1.2, zone: "habitable", composition: "Rocky" },
        { name: "Outer", type: "Terrestrial Planet", orbitAU: 3.2, zone: "cold", composition: "Rocky" },
      ],
      metadata: {},
    };

    systemStoreState.systems = [markerSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => markerSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    const markers = wrapper.findAll(".hz-planet-marker");
    expect(markers).toHaveLength(3);
    expect(wrapper.findAll(".hz-marker-tag").map((node) => node.text())).toEqual(["Inner", "Verdant", "Outer"]);

    await markers[2].trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Selected world: Outer · Terrestrial Planet · cold");
  });

  it("shows the quick action controls above the Planetary Catalog", async () => {
    const actionableSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [{ name: "Verdant", type: "Terrestrial Planet", orbitAU: 1.2, zone: "habitable", composition: "Rocky" }],
      metadata: {},
    };

    systemStoreState.systems = [actionableSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => actionableSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    const pageHtml = wrapper.html();
    expect(pageHtml.indexOf("Selected world:")).toBeGreaterThan(-1);
    expect(pageHtml.indexOf("Open System Survey")).toBeLessThan(pageHtml.indexOf("🪐 Planetary Catalog"));
    expect(pageHtml.indexOf("Build Selected World")).toBeLessThan(pageHtml.indexOf("🪐 Planetary Catalog"));
  });

  it("renders the Planetary Catalog from the closest orbit to the farthest", async () => {
    const unsortedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [
        { name: "Outer", type: "Terrestrial Planet", orbitAU: 4.8, zone: "cold", composition: "Rocky" },
        { name: "Inner", type: "Terrestrial Planet", orbitAU: 0.4, zone: "hot", composition: "Rocky" },
        { name: "Middle", type: "Terrestrial Planet", orbitAU: 1.2, zone: "habitable", composition: "Rocky" },
      ],
      metadata: {},
    };

    systemStoreState.systems = [unsortedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => unsortedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    const rows = wrapper.findAll(".planet-table tbody tr");
    expect(rows).toHaveLength(3);
    expect(rows[0].text()).toContain("Inner");
    expect(rows[1].text()).toContain("Middle");
    expect(rows[2].text()).toContain("Outer");
  });

  it("assigns zones in the expected sequence from hot to frozen", async () => {
    const zonedSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 1,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: { innerAU: 0.9, outerAU: 1.6, frostLineAU: 4.8, hasRadiantHabitableZone: true },
      planets: [
        { name: "Mercury", type: "Terrestrial Planet", orbitAU: 0.2, zone: "hot", composition: "Rocky" },
        { name: "Ember", type: "Terrestrial Planet", orbitAU: 0.7, zone: "warm", composition: "Rocky" },
        { name: "Verdant", type: "Terrestrial Planet", orbitAU: 1.2, zone: "habitable", composition: "Rocky" },
        { name: "Brisk", type: "Terrestrial Planet", orbitAU: 3.2, zone: "cold", composition: "Rocky" },
        { name: "Rime", type: "Terrestrial Planet", orbitAU: 7.4, zone: "frozen", composition: "Rocky" },
      ],
      metadata: {},
    };

    systemStoreState.systems = [zonedSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => zonedSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();

    const rows = wrapper.findAll(".planet-table tbody tr");
    expect(rows[0].text()).toContain("hot");
    expect(rows[1].text()).toContain("warm");
    expect(rows[2].text()).toContain("habitable");
    expect(rows[3].text()).toContain("cold");
    expect(rows[4].text()).toContain("frozen");
  });

  it("rebuilds a persisted system even when reused star records have no positive mass", async () => {
    const masslessSystem = {
      systemId: "gal-1:1,2:0101",
      sectorId: "gal-1:1,2",
      galaxyId: "gal-1",
      stars: [
        {
          designation: "G2V",
          spectralClass: "G2V",
          massInSolarMasses: 0,
          luminosity: 1,
          temperatureK: 5800,
          orbitType: null,
        },
      ],
      habitableZone: null,
      planets: [],
      metadata: {
        generatedWorldProfilesIncomplete: true,
      },
    };

    systemStoreState.systems = [masslessSystem];
    systemStoreState.loadSystems = vi.fn(async () => systemStoreState.systems);
    systemStoreState.findSystemByHex = vi.fn(() => masslessSystem);

    const wrapper = mount(StarSystemBuilder, {
      props: {
        galaxyId: "gal-1",
        sectorId: "grid:1:2",
      },
      global: {
        stubs: {
          LoadingSpinner: true,
          SurveyNavigation: true,
        },
      },
    });

    await flushPromises();
    await wrapper.find("button.btn.btn-primary").trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("Planetary Catalog");
  });
});
