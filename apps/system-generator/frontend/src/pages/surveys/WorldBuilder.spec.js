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
});
