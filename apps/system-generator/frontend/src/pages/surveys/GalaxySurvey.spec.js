/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerPush = vi.fn();
const routerReplace = vi.fn();
const toastInfo = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();
const toastWarning = vi.fn();

const baseGalaxy = {
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
};

function createSectorRecord({ sectorId, gridX, gridY, occupiedHexes = [], hexStarTypes = {}, displayName }) {
  return {
    sectorId,
    galaxyId: "gal-1",
    densityClass: 3,
    metadata: {
      gridX,
      gridY,
      displayName,
      occupiedHexes,
      hexStarTypes,
      hexPresenceGenerated: true,
      subsectorNames: {},
    },
  };
}

const initialSectors = [
  createSectorRecord({ sectorId: "sec-0", gridX: 0, gridY: 0, displayName: "Center" }),
  createSectorRecord({ sectorId: "sec-1", gridX: 1, gridY: 0, occupiedHexes: ["0101"], displayName: "Ring 1" }),
  createSectorRecord({ sectorId: "sec-2", gridX: 2, gridY: 0, occupiedHexes: ["0101"], displayName: "Ring 2" }),
];

const advancedSectors = [
  createSectorRecord({ sectorId: "sec-0", gridX: 0, gridY: 0, displayName: "Center" }),
  createSectorRecord({
    sectorId: "sec-1",
    gridX: 1,
    gridY: 0,
    occupiedHexes: ["0101"],
    hexStarTypes: { "0101": { starType: "G2V" } },
    displayName: "Ring 1",
  }),
  createSectorRecord({ sectorId: "sec-2", gridX: 2, gridY: 0, occupiedHexes: ["0101"], displayName: "Ring 2" }),
];

const galaxyStoreState = reactive({
  galaxies: [baseGalaxy],
  currentGalaxyId: "gal-1",
  importInProgress: false,
  importProgress: 0,
  isLoading: false,
  error: null,
  loadGalaxies: vi.fn().mockResolvedValue([baseGalaxy]),
  setCurrentGalaxy: vi.fn((galaxyId) => {
    galaxyStoreState.currentGalaxyId = galaxyId;
  }),
  updateGalaxy: vi.fn().mockResolvedValue(baseGalaxy),
  createGalaxy: vi.fn().mockResolvedValue(baseGalaxy),
  importGalaxy: vi.fn().mockResolvedValue(baseGalaxy),
  deleteGalaxy: vi.fn().mockResolvedValue(),
  get getAllGalaxies() {
    return this.galaxies;
  },
  get getCurrentGalaxy() {
    return this.galaxies.find((entry) => entry.galaxyId === this.currentGalaxyId) || null;
  },
});

const sectorStoreState = reactive({
  sectors: initialSectors.map((sector) => ({ ...sector, metadata: { ...sector.metadata } })),
  loadSectors: vi.fn().mockImplementation(async () => {
    sectorStoreState.sectors = advancedSectors.map((sector) => ({ ...sector, metadata: { ...sector.metadata } }));
    return sectorStoreState.sectors;
  }),
  updateSector: vi.fn().mockResolvedValue(),
});

const systemStoreState = reactive({
  systems: [],
  replaceSectorSystems: vi.fn().mockResolvedValue(),
});

const preferencesStoreState = reactive({
  galaxyNameMode: "normalized",
  galaxyMythicTheme: "all",
  sectorNameMode: "list",
  surveyOccupancyRealism: 1,
  set: vi.fn((key, value) => {
    preferencesStoreState[key] = value;
  }),
});

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: routerPush, replace: routerReplace }),
  useRoute: () => ({ query: { galaxyId: "gal-1" } }),
}));

vi.mock("../../stores/galaxyStore.js", () => ({
  useGalaxyStore: () => galaxyStoreState,
}));

vi.mock("../../stores/sectorStore.js", () => ({
  useSectorStore: () => sectorStoreState,
}));

vi.mock("../../stores/systemStore.js", () => ({
  useSystemStore: () => systemStoreState,
}));

vi.mock("../../api/sectorApi.js", () => ({
  createSectorsBatch: vi.fn().mockResolvedValue([]),
  deleteSector: vi.fn().mockResolvedValue(),
  getSectorStats: vi.fn().mockResolvedValue({
    totalSectors: 3,
    populatedSectors: 2,
    generatedPresenceSectors: 3,
    emptySectors: 1,
    totalObjects: 2,
    avgObjectsPerSector: 0.66,
  }),
  upsertSector: vi.fn().mockImplementation(async (sector) => ({
    ...sector,
    sectorId: sector.sectorId || `sec-${sector.metadata?.gridX ?? 0}`,
  })),
  upsertSectorStrict: vi.fn().mockImplementation(async (sector) => ({
    ...sector,
    sectorId: sector.sectorId || `sec-${sector.metadata?.gridX ?? 0}`,
  })),
  updateSectorStrict: vi.fn().mockImplementation(async (sectorId, payload) => ({
    ...payload,
    sectorId,
  })),
}));

vi.mock("../../api/systemApi.js", () => ({
  replaceSystemsForSectorStrict: vi.fn().mockResolvedValue([]),
}));

vi.mock("../../utils/sectorGeneration.js", () => ({
  calculateHexOccupancyProbability: vi.fn().mockReturnValue(0),
}));

vi.mock("../../utils/primaryStarGenerator.js", () => ({
  generatePrimaryStar: vi.fn().mockReturnValue({ designation: "G2V", spectralType: "G2V" }),
}));

vi.mock("../../utils/systemStarMetadata.js", () => ({
  buildHexStarTypeMetadata: vi.fn().mockImplementation(() => ({
    starType: "G2V",
    secondaryStars: [],
    generatedStars: [],
    anomalyType: null,
  })),
  normalizeHexStarTypeRecord: vi.fn((record) => record),
}));

vi.mock("../../utils/galaxySectorStats.js", () => ({
  buildGalaxyExportPayload: vi.fn().mockReturnValue({}),
  normalizeSectorStats: vi.fn((stats) => ({
    totalSectors: 0,
    populatedSectors: 0,
    generatedPresenceSectors: 0,
    emptySectors: 0,
    totalObjects: 0,
    avgObjectsPerSector: 0,
    legacyReconstructedCount: 0,
    legacyHierarchyUnknownCount: 0,
    ...stats,
  })),
}));

vi.mock("../../utils/galaxySurveyPersistence.js", () => ({
  buildGalaxyCreatePayload: vi.fn((payload) => payload),
  buildGalaxyEditPayload: vi.fn(({ galaxy }) => galaxy),
  buildGalaxyImportRequest: vi.fn(() => ({ galaxyData: null, options: {} })),
  buildGalaxySectorStatsPayload: vi.fn(({ galaxy }) => galaxy),
  canDismissGalaxyImportModal: vi.fn().mockReturnValue(true),
  createDefaultGalaxyImportForm: vi.fn(() => ({
    fileData: null,
    placementMode: "clustered",
    placementSeed: "",
    coordinatesX: 0,
    coordinatesY: 0,
    clusterMinSeparation: 12,
    clusterMaxSeparation: 29,
    clusterClearance: 10,
    clusterSlotsPerRing: 16,
  })),
  resolveGalaxySectorStatsRefresh: vi.fn().mockResolvedValue({
    source: "cache",
    stats: {
      totalSectors: 3,
      populatedSectors: 2,
      generatedPresenceSectors: 3,
      emptySectors: 1,
      totalObjects: 2,
      avgObjectsPerSector: 0.66,
      legacyReconstructedCount: 0,
      legacyHierarchyUnknownCount: 0,
    },
  }),
}));

vi.mock("../../utils/starDisplay.js", () => ({
  starDescriptorToCssClass: vi.fn().mockReturnValue("star-g"),
}));

vi.mock("../../utils/toast.js", () => ({
  info: (...args) => toastInfo(...args),
  error: (...args) => toastError(...args),
  success: (...args) => toastSuccess(...args),
  warning: (...args) => toastWarning(...args),
}));

vi.mock("../../utils/nameGenerator.js", () => ({
  generateGalaxyName: vi.fn().mockReturnValue("Generated Galaxy"),
  generatePhonotacticName: vi.fn().mockReturnValue("Generated Sector"),
}));

vi.mock("../../stores/preferencesStore.js", () => ({
  usePreferencesStore: () => preferencesStoreState,
}));

vi.mock("../../composables/useArchiveTransfer.js", () => ({
  useArchiveTransfer: () => ({
    overlayProps: {},
    exportJson: vi.fn().mockResolvedValue(true),
    reset: vi.fn(),
  }),
}));

vi.mock("../../utils/sectorLayoutGenerator.js", () => ({
  estimateGalaxySectorLayoutCount: vi.fn().mockReturnValue(3),
  estimateGalaxySectorFootprint: vi.fn().mockReturnValue({
    diameterParsecs: 30000,
    width: 938,
    height: 750,
    footprintWidthPc: 30016,
    footprintHeightPc: 30000,
    gridRadius: 469,
  }),
  generateGalaxySectorLayoutWindow: vi.fn().mockReturnValue([]),
  generateGalaxySectorLayout: vi.fn().mockImplementation(() => [
    {
      sectorId: "layout-0",
      densityClass: 3,
      metadata: { gridX: 0, gridY: 0, gridWidth: 3, gridHeight: 1, displayName: "Center" },
    },
    {
      sectorId: "layout-1",
      densityClass: 3,
      metadata: { gridX: 1, gridY: 0, gridWidth: 3, gridHeight: 1, displayName: "Ring 1" },
    },
    {
      sectorId: "layout-2",
      densityClass: 3,
      metadata: { gridX: 2, gridY: 0, gridWidth: 3, gridHeight: 1, displayName: "Ring 2" },
    },
  ]),
  iterateGalaxySectorLayout: vi.fn().mockImplementation(() => [
    { sectorId: "sec-0", densityClass: 3, metadata: { gridX: 0, gridY: 0, displayName: "Center" } },
    { sectorId: "sec-1", densityClass: 3, metadata: { gridX: 1, gridY: 0, displayName: "Ring 1" } },
    { sectorId: "sec-2", densityClass: 3, metadata: { gridX: 2, gridY: 0, displayName: "Ring 2" } },
  ]),
  iterateGalaxySectorLayoutByRing: vi.fn().mockImplementation(() => [
    { sectorId: "sec-0", densityClass: 3, metadata: { gridX: 0, gridY: 0, displayName: "Center" } },
    { sectorId: "sec-1", densityClass: 3, metadata: { gridX: 1, gridY: 0, displayName: "Ring 1" } },
    { sectorId: "sec-2", densityClass: 3, metadata: { gridX: 2, gridY: 0, displayName: "Ring 2" } },
  ]),
}));

vi.mock("../../utils/subsector.js", () => ({
  SUBSECTOR_LETTERS: ["A", "B", "C", "D"],
}));

vi.mock("../../../../backend/generators/utils/universePlacement.js", () => ({
  generateClusteredUniverseCoordinates: vi.fn().mockReturnValue({ x: 0, y: 0 }),
}));

vi.mock("../../components/common/LoadingSpinner.vue", () => ({
  default: { name: "LoadingSpinner", template: "<div />" },
}));

vi.mock("../../components/common/ConfirmDialog.vue", () => ({
  default: { name: "ConfirmDialog", template: "<div />" },
}));

vi.mock("../../components/galaxy-survey/GalaxySurveyMapInspector.vue", () => ({
  default: {
    name: "GalaxySurveyMapInspector",
    props: { selectedTile: { type: Object, default: null } },
    template: `<div data-test="selected-ring">{{ selectedTile ? selectedTile.ring : 'none' }}</div>`,
  },
}));

import { calculateHexOccupancyProbability } from "../../utils/sectorGeneration.js";
import GalaxySurvey from "./GalaxySurvey.vue";

describe("GalaxySurvey guided flow", () => {
  beforeEach(() => {
    routerPush.mockReset();
    routerReplace.mockReset();
    toastInfo.mockReset();
    toastError.mockReset();
    toastSuccess.mockReset();
    toastWarning.mockReset();
    galaxyStoreState.galaxies = [baseGalaxy];
    galaxyStoreState.currentGalaxyId = "gal-1";
    galaxyStoreState.loadGalaxies.mockClear();
    galaxyStoreState.setCurrentGalaxy.mockClear();
    galaxyStoreState.updateGalaxy.mockClear();
    sectorStoreState.sectors = initialSectors.map((sector) => ({ ...sector, metadata: { ...sector.metadata } }));
    sectorStoreState.loadSectors.mockClear();
    preferencesStoreState.surveyOccupancyRealism = 1;
    preferencesStoreState.set.mockClear();
    systemStoreState.systems = [];
    systemStoreState.replaceSectorSystems.mockClear();
    localStorage.clear();
  });

  it("restores persisted map overlay and filter preferences", async () => {
    localStorage.setItem(
      "eclipsed-horizons-galaxy-survey-view",
      JSON.stringify({
        zoomLevel: "overview",
        overlayMode: "frontier",
        statusFilter: "systems-pending",
        ringFilter: "2",
        layerMode: "persisted-only",
      }),
    );

    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    expect(wrapper.vm.$.setupState.galaxyMapZoomLevel).toBe("overview");
    expect(wrapper.vm.$.setupState.galaxyMapOverlayMode).toBe("frontier");
    expect(wrapper.vm.$.setupState.galaxyMapStatusFilter).toBe("systems-pending");
    expect(wrapper.vm.$.setupState.galaxyMapRingFilter).toBe("2");
    expect(wrapper.vm.$.setupState.galaxyMapLayerMode).toBe("persisted-only");
  });

  it("cycles map controls and clears highlighted rings with keyboard shortcuts", async () => {
    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    expect(wrapper.vm.$.setupState.galaxyMapLayerMode).toBe("combined");
    expect(wrapper.vm.$.setupState.galaxyMapRingFilter).toBe("all");
    expect(wrapper.vm.$.setupState.galaxyMapShowHelp).toBe(false);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "l" }));
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapLayerMode).toBe("persisted-only");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "L", shiftKey: true }));
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapLayerMode).toBe("combined");

    const nextRingFilter = wrapper.vm.$.setupState.galaxyMapRingFilterOptions[1].id;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }));
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapRingFilter).toBe(nextRingFilter);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "R", shiftKey: true }));
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapRingFilter).toBe("all");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" }));
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapShowHelp).toBe(true);
    expect(wrapper.text()).toContain("Ctrl+B opens bookmarks");

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "f" }));
    await flushPromises();
    expect(wrapper.get("[data-test='selected-ring']").text()).toBe("1");
    expect(wrapper.vm.$.setupState.galaxyMapHighlightedRing).toBe(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapHighlightedRing).toBe(null);
    expect(wrapper.vm.$.setupState.galaxyMapShowHelp).toBe(false);
  });

  it("labels the map as a preview and shows the actual galaxy footprint", async () => {
    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    expect(wrapper.text()).toContain("Galaxy Map Preview");
    expect(wrapper.text()).toContain("Actual footprint 938×750 sectors");
  });

  it("toggles selected ring highlighting when the same tile is clicked twice", async () => {
    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    const tile = wrapper.vm.$.setupState.galaxyMapRenderedTiles.find((entry) => entry.persisted && entry.ring === 1);
    expect(tile).toBeTruthy();

    wrapper.vm.$.setupState.selectGalaxyMapTile(tile);
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapHighlightedRing).toBe(1);
    expect(
      wrapper.vm.$.setupState.galaxyMapRenderedTiles.filter((entry) => entry.isSelectedRing).length,
    ).toBeGreaterThan(0);

    wrapper.vm.$.setupState.selectGalaxyMapTile(tile);
    await flushPromises();
    expect(wrapper.vm.$.setupState.galaxyMapHighlightedRing).toBe(null);
  });

  it("uses one shared realism slider value for ring generation", async () => {
    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    const realismSlider = wrapper.get("[data-test='galaxy-realism-slider']");
    await realismSlider.setValue("1.35");
    calculateHexOccupancyProbability.mockClear();

    await wrapper.vm.$.setupState.generateSelectedRing({ mode: "presence" });
    await flushPromises();

    expect(wrapper.vm.$.setupState.galaxyOccupancyRealism).toBe(1.35);
    expect(preferencesStoreState.surveyOccupancyRealism).toBe(1.35);
    expect(calculateHexOccupancyProbability).toHaveBeenCalled();
    expect(calculateHexOccupancyProbability.mock.calls[0][0].realismScale).toBe(1.35);
  });

  it("applies standard density across the current galaxy", async () => {
    sectorStoreState.sectors = [
      { ...createSectorRecord({ sectorId: "sec-0", gridX: 0, gridY: 0, displayName: "Center" }), densityClass: 5 },
      { ...createSectorRecord({ sectorId: "sec-1", gridX: 1, gridY: 0, displayName: "Ring 1" }), densityClass: 1 },
      { ...createSectorRecord({ sectorId: "sec-2", gridX: 2, gridY: 0, displayName: "Ring 2" }), densityClass: 4 },
    ];

    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    await wrapper.get("[data-test='galaxy-density-standardize-btn']").trigger("click");
    await flushPromises();

    expect(galaxyStoreState.updateGalaxy).toHaveBeenCalledWith(
      "gal-1",
      expect.objectContaining({
        metadata: expect.objectContaining({ densityProfileMode: "standard" }),
      }),
    );
    expect(sectorStoreState.updateSector).toHaveBeenCalledTimes(3);
    expect(sectorStoreState.sectors.every((sector) => sector.densityClass === 3)).toBe(true);
  });

  it("advances the guided frontier, focuses the next ring, and announces the change", async () => {
    const runtimeErrors = [];
    const wrapper = mount(GalaxySurvey, {
      global: {
        config: {
          errorHandler(error) {
            runtimeErrors.push(error);
          },
        },
      },
    });

    await flushPromises();
    expect(wrapper.get("[data-test='selected-ring']").text()).toBe("0");

    await wrapper.vm.$.setupState.runGuidedGenerationStepAction({ mode: "systems" });
    await flushPromises();

    expect(sectorStoreState.loadSectors).toHaveBeenCalledWith("gal-1");
    expect(wrapper.get("[data-test='selected-ring']").text()).toBe("1");
    expect(toastInfo).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith("Ring 1 processed: 1 sectors and 0 systems.");
    expect(runtimeErrors).toEqual([]);
  });

  it("opens a delete confirmation and deletes the active galaxy", async () => {
    const wrapper = mount(GalaxySurvey);
    await flushPromises();

    wrapper.vm.$.setupState.showDeleteConfirm();
    await flushPromises();

    expect(wrapper.vm.$.setupState.confirmDialog.isOpen).toBe(true);
    expect(wrapper.vm.$.setupState.confirmDialog.galaxyIdToDelete).toBe("gal-1");
    expect(wrapper.vm.$.setupState.confirmDialog.message).toContain("Delete Test Galaxy");

    await wrapper.vm.$.setupState.confirmDeleteGalaxy();
    await flushPromises();

    expect(galaxyStoreState.deleteGalaxy).toHaveBeenCalledWith("gal-1");
    expect(toastSuccess).toHaveBeenCalledWith('Galaxy "Test Galaxy" deleted successfully');
    expect(wrapper.vm.$.setupState.isDeletingGalaxy).toBe(false);
  });
});
