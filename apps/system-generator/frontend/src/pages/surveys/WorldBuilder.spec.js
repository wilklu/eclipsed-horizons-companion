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

    expect(wrapper.text()).toContain("Native Sophont Life:");
    expect(wrapper.text()).toContain("Absent");
    expect(wrapper.text()).toContain("0 — Uninhabited");
    expect(wrapper.text()).toContain("0 — No Government");
    expect(wrapper.text()).toContain("0 — No Law");
    expect(wrapper.text()).toContain("0 — Primitive");
    expect(wrapper.text()).toContain("X — No starport");
  });

  it("rerolls physical, system, and census sections independently", async () => {
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
    expect(censusReroll.nativeSophontLife).toBe(false);
    expect(censusReroll.populationCode).toBe(0);
    expect(censusReroll.governmentCode).toBe(0);
    expect(censusReroll.starport).toBe("X");
    expect(censusReroll.orbitalPeriodDays).toBe(240);
    expect(censusReroll.size).toBe(5);

    await wrapper.get('[data-test="reroll-physical"]').trigger("click");
    await flushPromises();
    await flushPromises();
    await wrapper.get('[data-test="reroll-system"]').trigger("click");
    await flushPromises();
    await flushPromises();
    await wrapper.get('[data-test="reroll-census"]').trigger("click");
    await flushPromises();
    await flushPromises();

    expect(systemStoreState.updateSystem).toHaveBeenCalledTimes(3);
  });
});
