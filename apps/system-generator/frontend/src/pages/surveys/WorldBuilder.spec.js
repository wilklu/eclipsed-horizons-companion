/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
}));

const routeState = reactive({
  query: {
    systemRecordId: "sector-1:0101",
    worldIndex: "0",
    worldName: "Iona",
    worldType: "Moon",
    orbitAU: "3.2",
    zone: "habitable",
    star: "G2V",
  },
  params: {
    systemId: "0101",
  },
});

function createSystemRecord() {
  return {
    systemId: "sector-1:0101",
    hexCoordinates: { x: 1, y: 1 },
    primaryStar: { spectralClass: "G2V", luminosity: 1, massInSolarMasses: 1 },
    planets: [
      {
        name: "Iona",
        type: "Moon",
        isMoon: true,
        parentWorldName: "Tethys",
        orbitAU: 3.2,
        zone: "habitable",
        uwp: "A867A99-C",
        tradeCodes: [],
      },
    ],
    metadata: {
      lastModified: "2026-04-15T00:00:00.000Z",
    },
  };
}

const systemStoreState = reactive({
  systems: [createSystemRecord()],
  currentSystemId: "sector-1:0101",
  getCurrentSystem: createSystemRecord(),
  updateSystem: vi.fn().mockImplementation(async (systemId, payload) => ({
    ...createSystemRecord(),
    ...payload,
    systemId,
  })),
  setCurrentSystem: vi.fn(),
});

const preferencesStoreState = reactive({
  worldNameMode: "list",
  ttsRate: 1,
  ttsPitch: 1,
  ttsVoiceURI: "",
});

const creatureStoreState = reactive({
  faunaBundlesByWorld: vi.fn(() => []),
});

const floraStoreState = reactive({
  floraByWorld: vi.fn(() => []),
});

const sophontStoreState = reactive({
  sophontsByWorld: vi.fn(() => []),
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: hoisted.routerPush, replace: hoisted.routerReplace }),
  useRoute: () => routeState,
}));

vi.mock("../../stores/systemStore.js", () => ({
  useSystemStore: () => systemStoreState,
}));

vi.mock("../../stores/preferencesStore.js", () => ({
  usePreferencesStore: () => preferencesStoreState,
}));

vi.mock("../../stores/creatureStore.js", () => ({
  useCreatureStore: () => creatureStoreState,
}));

vi.mock("../../stores/floraStore.js", () => ({
  useFloraStore: () => floraStoreState,
}));

vi.mock("../../stores/sophontStore.js", () => ({
  useSophontStore: () => sophontStoreState,
}));

vi.mock("../../composables/useArchiveTransfer.js", () => ({
  useArchiveTransfer: () => ({
    overlayProps: {},
    exportJson: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock("../../utils/speechSynthesis.js", () => ({
  isSpeechSynthesisSupported: () => false,
  speakTextWithPreferences: vi.fn(() => ({ ok: false, reason: "unsupported" })),
  stopSpeechSynthesis: vi.fn(),
}));

vi.mock("../../utils/toast.js", () => ({
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

import WorldBuilder from "./WorldBuilder.vue";

describe("WorldBuilder", () => {
  beforeEach(() => {
    routeState.query = {
      systemRecordId: "sector-1:0101",
      worldIndex: "0",
      worldName: "Iona",
      worldType: "Moon",
      orbitAU: "3.2",
      zone: "habitable",
      star: "G2V",
    };
    routeState.params = { systemId: "0101" };
    systemStoreState.systems = [createSystemRecord()];
    systemStoreState.getCurrentSystem = createSystemRecord();
    systemStoreState.updateSystem.mockClear();
    systemStoreState.setCurrentSystem.mockClear();
    creatureStoreState.faunaBundlesByWorld.mockReset();
    creatureStoreState.faunaBundlesByWorld.mockReturnValue([]);
    floraStoreState.floraByWorld.mockReset();
    floraStoreState.floraByWorld.mockReturnValue([]);
    sophontStoreState.sophontsByWorld.mockReset();
    sophontStoreState.sophontsByWorld.mockReturnValue([]);
  });

  it("renders partial stored world profiles without crashing on missing numeric fields", async () => {
    const wrapper = mount(WorldBuilder, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Iona");
    expect(wrapper.text()).toContain("Unknown");
    expect(wrapper.text()).toContain("No trade codes applicable.");
  });

  it("keeps stale census values at the uninhabited baseline when native sophont life is absent", async () => {
    const staleSystem = createSystemRecord();
    staleSystem.planets = [
      {
        ...staleSystem.planets[0],
        nativeSophontLife: false,
        populationCode: 7,
        population: 10000000,
        governmentCode: 9,
        governmentDesc: "Impersonal Bureaucracy",
        lawLevel: 8,
        lawDesc: "Long bladed weapons controlled",
        techLevel: 10,
        techDesc: "High Stellar",
        starport: "B",
        starportDesc: "Good",
        uwp: "B867798-A",
      },
    ];
    systemStoreState.systems = [staleSystem];
    systemStoreState.getCurrentSystem = staleSystem;

    const wrapper = mount(WorldBuilder, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Native Lifeforms:");
    expect(wrapper.text()).toContain("Absent");
    expect(wrapper.text()).toContain("0 — Uninhabited");
    expect(wrapper.text()).toContain("0 — No Government");
    expect(wrapper.text()).toContain("0 — No Law");
    expect(wrapper.text()).toContain("0 — Primitive");
    expect(wrapper.text()).toContain("X — No starport");
  });

  it("shows a dedicated Life Survey section and places Trade Codes in the world header", async () => {
    const profiledSystem = createSystemRecord();
    profiledSystem.planets = [
      {
        ...profiledSystem.planets[0],
        nativeSophontLife: false,
        nativeLifeform: "2997",
        populationCode: 0,
        population: 0,
        governmentCode: 0,
        governmentDesc: "No Government",
        lawLevel: 0,
        lawDesc: "No Law",
        techLevel: 0,
        techDesc: "Primitive",
        starport: "X",
        starportDesc: "No starport",
        tradeCodes: ["Ag", "Ri"],
      },
    ];
    systemStoreState.systems = [profiledSystem];
    systemStoreState.getCurrentSystem = profiledSystem;

    const wrapper = mount(WorldBuilder, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const sections = wrapper.findAll(".world-section");
    const systemSection = sections.find((section) => section.text().includes("📡 System Survey"));
    const lifeSection = sections.find((section) => section.text().includes("🧬 Life Survey"));
    const censusSection = sections.find((section) => section.text().includes("👥 Census Survey"));
    const worldHeader = wrapper.find(".world-header");

    expect(systemSection).toBeTruthy();
    expect(systemSection.text()).not.toContain("Trade Codes");
    expect(worldHeader.text()).toContain("Trade Codes");
    expect(worldHeader.text()).not.toContain("No trade codes applicable.");
    expect(lifeSection).toBeTruthy();
    expect(lifeSection.text()).toContain("Biomass Rating:");
    expect(lifeSection.text()).not.toContain("Biomass Rating:0 — No native life");
    expect(lifeSection.text()).toContain("Biocomplexity Rating:");
    expect(lifeSection.text()).toContain("Native Sophonts:");
    expect(lifeSection.text()).toMatch(/Native Sophonts:(Exist|Absent|Extinct)/);
    expect(censusSection).toBeTruthy();
    expect(censusSection.text()).not.toContain("Biomass Rating:");
  });

  it("shows linked fauna and sophont summaries together when dossiers exist", async () => {
    creatureStoreState.faunaBundlesByWorld.mockReturnValue([
      {
        balance: { stability: "Balanced biosphere", hazardLevel: "Moderate" },
        focus: { name: "Fen Stalker" },
        terrains: ["Wetland", "Shore"],
        notes: ["Balanced biosphere with moderate encounter hazard pressure."],
      },
    ]);
    floraStoreState.floraByWorld.mockReturnValue([
      {
        name: "Ionan Bloom",
        biology: { "Growth Form": "Canopy Tree", Climate: "Temperate" },
        uses: { "Primary Use": "medicinal resin", "Hazard Level": "Moderate" },
        worldIntegration: { summary: "Ionan Bloom is a temperate canopy tree known for medicinal resin." },
      },
    ]);
    sophontStoreState.sophontsByWorld.mockReturnValue([
      {
        name: "Caledans",
        origin: "Native sophont lineage",
        government: "Elected Senate",
        techLevel: 11,
        civilization: {
          "Contact Status": "Open contact",
          "Settlement Pattern": "Arcology city-states",
        },
        diplomacy: {
          "Current Stance": "guarded neutrality",
        },
        factionTensions: {
          summary: "Caledan Concord and Frontier Bloc are maneuvering over canal tolls.",
        },
        eventChain: [{ phase: "Catalyst", title: "Dispute over canal tolls" }],
        historyTimeline: [{ era: "Present Tension", title: "Canal Accord Strain" }],
        worldIntegration: { summary: "Caledans are a stellar-capable culture." },
      },
    ]);

    const wrapper = mount(WorldBuilder, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Linked Ecology & Society");
    expect(wrapper.text()).toContain("Balanced biosphere");
    expect(wrapper.text()).toContain("Fen Stalker");
    expect(wrapper.text()).toContain("Ionan Bloom");
    expect(wrapper.text()).toContain("medicinal resin");
    expect(wrapper.text()).toContain("Caledans");
    expect(wrapper.text()).toContain("Open contact");
    expect(wrapper.text()).toContain("guarded neutrality");
    expect(wrapper.text()).toContain("Canal Accord Strain");
    expect(wrapper.text()).toContain("maneuvering over canal tolls");
    expect(wrapper.text()).toContain("Dispute over canal tolls");
  });

  it("shows the WBH native lifeform profile in World Survey when native sophont life is present", async () => {
    const profiledSystem = createSystemRecord();
    profiledSystem.planets = [
      {
        ...profiledSystem.planets[0],
        nativeSophontLife: true,
        nativeLifeform: "2201",
        populationCode: 6,
        population: 1000000,
        governmentCode: 4,
        governmentDesc: "Representative Democracy",
        lawLevel: 5,
        lawDesc: "Personal concealable weapons prohibited",
        techLevel: 9,
        techDesc: "Stellar",
        starport: "C",
        starportDesc: "Routine — Unrefined fuel, no shipyard",
      },
    ];
    systemStoreState.systems = [profiledSystem];
    systemStoreState.getCurrentSystem = profiledSystem;

    const wrapper = mount(WorldBuilder, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Native Lifeform Profile:");
    expect(wrapper.text()).toContain("2201");
    expect(wrapper.text()).toContain("Biocomplexity Rating:");

    const setupState = wrapper.vm.$.setupState;
    expect(setupState.formatNativeLifeRating("4000", 0, "biomass")).toBe("4 — Established native biosphere");
    expect(setupState.formatNativeLifeRating("0000", 0, "biomass")).toBe("0 — No native life");
  });

  it("rerolls physical, system, life, and census sections independently", async () => {
    const profiledSystem = createSystemRecord();
    profiledSystem.planets = [
      {
        ...profiledSystem.planets[0],
        size: 5,
        diameterKm: 8100,
        atmosphereCode: 6,
        atmosphereDesc: "Standard",
        hydrographics: 7,
        gravity: 0.9,
        avgTempC: 14,
        tempCategory: "Temperate",
        habitability: "Good",
        resourceRating: "Average",
        mainworldCandidateScore: 8,
        seismology: { totalSeismicStress: 2 },
        majorTectonicPlates: 5,
        orbitalPeriodDays: 240,
        dayLengthHours: 26,
        axialTilt: 12,
        moons: 1,
        magnetosphere: "Moderate",
        nativeSophontLife: true,
        populationCode: 6,
        population: 1000000,
        governmentCode: 4,
        governmentDesc: "Representative Democracy",
        lawLevel: 5,
        lawDesc: "Personal concealable weapons prohibited",
        techLevel: 9,
        techDesc: "Stellar",
        starport: "C",
        starportDesc: "Routine — Unrefined fuel, no shipyard",
        tradeCodes: ["Ag"],
        uwp: "C567645-9",
      },
    ];
    systemStoreState.systems = [profiledSystem];
    systemStoreState.getCurrentSystem = profiledSystem;

    const wrapper = mount(WorldBuilder, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const setupState = wrapper.vm.$.setupState;
    const currentWorld = setupState.world;

    const physicalReroll = setupState.mergeWorldSection(
      currentWorld,
      {
        size: 8,
        diameterKm: 11200,
        atmosphereCode: 8,
        atmosphereDesc: "Dense",
        hydrographics: 5,
        gravity: 1.2,
        avgTempC: 28,
        tempCategory: "Warm",
        habitability: "Average",
        resourceRating: "Rich",
        mainworldCandidateScore: 10,
        seismology: { totalSeismicStress: 7 },
        majorTectonicPlates: 9,
        orbitalPeriodDays: 999,
        nativeSophontLife: false,
      },
      "physical",
    );
    expect(physicalReroll.size).toBe(8);
    expect(physicalReroll.atmosphereDesc).toBe("Dense");
    expect(physicalReroll.orbitalPeriodDays).toBe(240);
    expect(physicalReroll.populationCode).toBe(6);

    const systemReroll = setupState.mergeWorldSection(
      currentWorld,
      {
        orbitalPeriodDays: 420,
        dayLengthHours: 48,
        axialTilt: 32,
        moons: 4,
        magnetosphere: "Strong",
        size: 1,
        nativeSophontLife: false,
      },
      "system",
    );
    expect(systemReroll.orbitalPeriodDays).toBe(420);
    expect(systemReroll.dayLengthHours).toBe(48);
    expect(systemReroll.size).toBe(5);
    expect(systemReroll.populationCode).toBe(6);

    const lifeReroll = setupState.mergeWorldSection(
      currentWorld,
      {
        nativeSophontLife: false,
        nativeLifeform: "2997",
        populationCode: 8,
        size: 1,
      },
      "life",
    );
    expect(lifeReroll.nativeSophontLife).toBe(false);
    expect(lifeReroll.nativeLifeform).toBe("2997");
    expect(lifeReroll.populationCode).toBe(0);
    expect(lifeReroll.size).toBe(5);
    expect(lifeReroll.orbitalPeriodDays).toBe(240);

    const censusReroll = setupState.mergeWorldSection(
      currentWorld,
      {
        nativeSophontLife: false,
        populationCode: 8,
        population: 100000000,
        governmentCode: 9,
        lawLevel: 7,
        techLevel: 11,
        starport: "B",
      },
      "census",
    );
    expect(censusReroll.nativeSophontLife).toBe(true);
    expect(censusReroll.populationCode).toBe(8);
    expect(censusReroll.governmentCode).toBe(9);
    expect(censusReroll.starport).toBe("B");
    expect(censusReroll.orbitalPeriodDays).toBe(240);
    expect(censusReroll.size).toBe(5);

    await wrapper.get('[data-test="reroll-physical"]').trigger("click");
    await flushPromises();
    await flushPromises();
    await wrapper.get('[data-test="reroll-system"]').trigger("click");
    await flushPromises();
    await flushPromises();
    await wrapper.get('[data-test="reroll-life"]').trigger("click");
    await flushPromises();
    await flushPromises();
    await wrapper.get('[data-test="reroll-census"]').trigger("click");
    await flushPromises();
    await flushPromises();

    expect(systemStoreState.updateSystem).toHaveBeenCalledTimes(4);
  });
});
