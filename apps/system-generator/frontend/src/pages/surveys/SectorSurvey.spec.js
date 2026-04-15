/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  toastInfo: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  toastWarning: vi.fn(),
  routeState: {
    query: {
      sectorId: "sector-a",
      from: "atlas",
    },
    params: {
      galaxyId: "gal-1",
    },
  },
  baseGalaxy: {
    galaxyId: "gal-1",
    name: "Test Galaxy",
    type: "Spiral",
    morphology: {
      bulgeRadius: 5000,
      armCount: 2,
      coreDensity: 0.7,
      diskThickness: 1000,
      centralAnomaly: { type: "Black Hole", massSolarMasses: 4000000, activityIndex: 0.2 },
    },
    metadata: {
      createdAt: "2026-04-11T00:00:00.000Z",
      lastModified: "2026-04-11T00:00:00.000Z",
      status: "Active",
      universeCoordinates: { x: 0, y: 0 },
    },
  },
}));

const routeState = reactive(hoisted.routeState);
const { routerPush, routerReplace, toastInfo, toastError, toastSuccess, toastWarning, baseGalaxy } = hoisted;

function createSectorRecord() {
  return {
    sectorId: "sector-a",
    galaxyId: "gal-1",
    densityClass: 3,
    densityVariation: 0,
    coordinates: { x: 1, y: 2 },
    metadata: {
      createdAt: "2026-04-11T00:00:00.000Z",
      lastModified: "2026-04-11T00:00:00.000Z",
      displayName: "Aquila Verge",
      scope: "subsector",
      subsector: "B",
      subsectorName: "Lanthan",
      subsectorNames: { B: "Lanthan" },
      gridCols: 8,
      gridRows: 10,
      gridX: 1,
      gridY: 2,
      occupiedHexes: ["0101", "0102", "0103"],
      hexStarTypes: {
        "0101": { starType: "G2V", secondaryStars: [] },
        "0102": { starType: "K2V", anomalyType: "Nebula", secondaryStars: [] },
      },
      hexPresenceGenerated: true,
      systemCount: 3,
      occupancyRealism: 1,
    },
  };
}

const sectorStoreState = reactive({
  sectors: [],
  currentSectorId: null,
  error: null,
  loadSectors: vi.fn().mockImplementation(async () => {
    sectorStoreState.sectors = [createSectorRecord()];
    return sectorStoreState.sectors;
  }),
  setCurrentSector: vi.fn((sectorId) => {
    sectorStoreState.currentSectorId = sectorId;
  }),
  createSector: vi
    .fn()
    .mockImplementation(async (payload) => ({ ...payload, sectorId: payload.sectorId || "sector-a" })),
  updateSector: vi.fn().mockImplementation(async (sectorId, payload) => ({ ...payload, sectorId })),
  clearSectors: vi.fn(() => {
    sectorStoreState.sectors = [];
    sectorStoreState.currentSectorId = null;
    sectorStoreState.error = null;
  }),
});
hoisted.sectorStoreState = sectorStoreState;

const systemStoreState = reactive({
  systems: [],
  currentSystemId: null,
  error: null,
  loadSystems: vi.fn().mockImplementation(async () => {
    systemStoreState.systems = [];
    return [];
  }),
  setCurrentSystem: vi.fn(),
  clearSystems: vi.fn(() => {
    systemStoreState.systems = [];
    systemStoreState.currentSystemId = null;
    systemStoreState.error = null;
  }),
});
hoisted.systemStoreState = systemStoreState;

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: hoisted.routerPush, replace: hoisted.routerReplace }),
  useRoute: () => hoisted.routeState,
}));

vi.mock("../../stores/sectorStore.js", () => ({
  useSectorStore: () => hoisted.sectorStoreState,
}));

vi.mock("../../stores/systemStore.js", () => ({
  useSystemStore: () => hoisted.systemStoreState,
}));

vi.mock("../../stores/preferencesStore.js", () => ({
  usePreferencesStore: () => ({
    sectorNameMode: "list",
    worldNameMode: "list",
    asteroidBeltNameMode: "list",
    galaxyMythicTheme: "all",
    ttsRate: 1,
    ttsPitch: 1,
    ttsVoiceURI: "",
  }),
}));

vi.mock("../../api/galaxyApi.js", () => ({
  getGalaxy: vi.fn().mockResolvedValue(hoisted.baseGalaxy),
}));

vi.mock("../../api/sectorApi.js", () => ({
  getSector: vi.fn().mockImplementation(async () => createSectorRecord()),
  updateSectorStrict: vi
    .fn()
    .mockImplementation(async (sectorId, payload) => ({ ...createSectorRecord(), ...payload, sectorId })),
  createSectorsBatch: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../api/systemApi.js", () => ({
  getSystemsBySectorStrict: vi.fn().mockResolvedValue([]),
  replaceSystemsForSectorStrict: vi.fn().mockResolvedValue([]),
  upsertSystemStrict: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../utils/toast.js", () => ({
  info: (...args) => hoisted.toastInfo(...args),
  error: (...args) => hoisted.toastError(...args),
  success: (...args) => hoisted.toastSuccess(...args),
  warning: (...args) => hoisted.toastWarning(...args),
}));

vi.mock("../../composables/useArchiveTransfer.js", () => ({
  useArchiveTransfer: () => ({
    overlayProps: {},
    exportJson: vi.fn().mockResolvedValue(true),
    reset: vi.fn(),
  }),
}));

vi.mock("../../utils/nameGenerator.js", () => ({
  generatePhonotacticName: vi.fn().mockReturnValue("Generated Name"),
}));

import SectorSurvey from "./SectorSurvey.vue";

function mountSectorSurvey(props = { galaxyId: "gal-1", viewMode: "sector" }) {
  return mount(SectorSurvey, {
    props,
    global: {
      stubs: {
        LoadingSpinner: { template: "<div data-test='loading-spinner' />" },
        SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
      },
    },
  });
}

describe("SectorSurvey page regressions", () => {
  beforeEach(() => {
    routerPush.mockReset();
    routerReplace.mockReset();
    toastInfo.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
    toastWarning.mockReset();
    routeState.query = { sectorId: "sector-a", from: "atlas" };
    sectorStoreState.sectors = [createSectorRecord()];
    sectorStoreState.currentSectorId = "sector-a";
    sectorStoreState.loadSectors.mockClear();
    sectorStoreState.setCurrentSector.mockClear();
    systemStoreState.systems = [];
    systemStoreState.loadSystems.mockClear();
    localStorage.clear();
  });

  it("restores persisted workspace state and exposes accessible grid guidance", async () => {
    localStorage.setItem(
      "eclipsed-horizons-sector-survey-workspace",
      JSON.stringify({
        "gal-1": {
          galaxyId: "gal-1",
          selectedSectorId: "sector-a",
          scope: "sector",
          selectedSubsector: "B",
          gridSizeMode: "large",
          sectorSurveyFilterMode: "legacy",
          activeReviewQueue: "anomaly",
          selectedHex: "0102",
        },
      }),
    );

    const wrapper = mountSectorSurvey({ galaxyId: "gal-1", viewMode: "sector" });
    await flushPromises();
    await flushPromises();

    expect(wrapper.vm.$.setupState.gridSizeMode).toBe("large");
    expect(wrapper.vm.$.setupState.sectorSurveyFilterMode).toBe("legacy");
    expect(wrapper.vm.$.setupState.activeReviewQueue).toBe("anomaly");
    expect(wrapper.vm.$.setupState.selectedHex).toBe("0102");
    expect(wrapper.find(".skip-link").exists()).toBe(true);
    expect(wrapper.get("#sector-grid-live-status").text()).toContain("Sector survey Aquila Verge.");
    expect(wrapper.get(".hex-grid-wrapper").attributes("aria-describedby")).toContain("sector-grid-keyboard-help");
  });

  it("renders checklist and advances the guided review queue from the page controls", async () => {
    const wrapper = mountSectorSurvey({ galaxyId: "gal-1", viewMode: "sector" });
    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Progress Checklist");
    expect(wrapper.text()).toContain("Guided Review Queue");

    const presenceButton = wrapper.findAll(".review-queue-btn").find((entry) => entry.text().includes("Needs Systems"));

    expect(presenceButton).toBeTruthy();
    await presenceButton.trigger("click");
    await flushPromises();

    expect(wrapper.vm.$.setupState.selectedHex).toBe("0103");
    expect(toastInfo).toHaveBeenCalled();
  });

  it("shows the shared subsector sidebar tools in subsector view", async () => {
    routeState.query = { sectorId: "sector-a", viewScope: "subsector", subsector: "B", from: "atlas" };

    const wrapper = mountSectorSurvey({ galaxyId: "gal-1", viewMode: "subsector" });
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(".subsector-sidebar").exists()).toBe(true);
    expect(wrapper.text()).toContain("Select Subsector");
    expect(wrapper.text()).toContain("Subsector Survey");
    expect(wrapper.findAll(".subsector-grid--sidebar .subsector-btn").length).toBeGreaterThan(0);
  });

  it("keeps the execute label aligned with the selected survey option even in void-tier space", async () => {
    sectorStoreState.sectors = [
      {
        ...createSectorRecord(),
        metadata: {
          ...createSectorRecord().metadata,
          occupiedHexes: [],
          hexStarTypes: {},
          hexPresenceGenerated: false,
          systemCount: 0,
        },
      },
    ];

    const wrapper = mountSectorSurvey({ galaxyId: "gal-1", viewMode: "sector" });
    await flushPromises();
    await flushPromises();

    const optionButtons = wrapper.findAll(".survey-option-btn");
    const nameOnlyButton = optionButtons.find((entry) => entry.text().includes("Name Only"));
    const fullSurveyButton = optionButtons.find((entry) => entry.text().includes("Systems + Worlds"));

    expect(nameOnlyButton).toBeTruthy();
    expect(fullSurveyButton).toBeTruthy();

    await nameOnlyButton.trigger("click");
    await flushPromises();

    expect(wrapper.find(".survey-action-label").text()).toContain("Save Sector Name");
    expect(wrapper.find(".survey-action-label").text()).not.toContain("Presence Only");

    await fullSurveyButton.trigger("click");
    await flushPromises();

    expect(wrapper.find(".survey-action-label").text()).toContain("Name + Systems + Worlds");
    expect(wrapper.vm.$.setupState.tierAwareGenerationMode).toBe("name-systems");
  });
});
