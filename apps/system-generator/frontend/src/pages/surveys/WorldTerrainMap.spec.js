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
  updateSystem: vi.fn(),
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
  onBeforeRouteLeave: () => {},
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

vi.mock("../../utils/toast.js", () => ({
  error: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}));

import WorldTerrainMap from "./WorldTerrainMap.vue";

describe("WorldTerrainMap", () => {
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
    systemStoreState.updateSystem.mockReset();
    systemStoreState.setCurrentSystem.mockReset();
  });

  it("prefers interior hexes over border hexes when scoring mountain candidates", async () => {
    const wrapper = mount(WorldTerrainMap, {
      global: {
        stubs: {
          LoadingSpinner: { template: "<div />" },
          SurveyNavigation: { template: "<div />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const setupState = wrapper.vm.$.setupState;
    const cells = [
      { key: "center", cx: 0, cy: 0, faceId: "Face-1", points: "0,0 1,0 2,1 1,2 0,2 -1,1" },
      { key: "b1", cx: 1, cy: 0, faceId: "Face-1", points: "1,0 2,0 3,1 2,2 1,2 0,1" },
      { key: "b2", cx: -1, cy: 0, faceId: "Face-1", points: "-1,0 0,0 1,1 0,2 -1,2 -2,1" },
      { key: "b3", cx: 0, cy: 1, faceId: "Face-1", points: "0,1 1,1 2,2 1,3 0,3 -1,2" },
      { key: "b4", cx: 0, cy: -1, faceId: "Face-1", points: "0,-1 1,-1 2,0 1,1 0,1 -1,0" },
      { key: "b5", cx: 1, cy: 1, faceId: "Face-1", points: "1,1 2,1 3,2 2,3 1,3 0,2" },
      { key: "b6", cx: -1, cy: -1, faceId: "Face-1", points: "-1,-1 0,-1 1,0 0,1 -1,1 -2,0" },
    ];
    const adjacencyById = new Map([
      ["center", { neighbors: new Set(["b1", "b2", "b3", "b4", "b5", "b6"]) }],
      ["b1", { neighbors: new Set(["center"]) }],
      ["b2", { neighbors: new Set(["center"]) }],
      ["b3", { neighbors: new Set(["center"]) }],
      ["b4", { neighbors: new Set(["center"]) }],
      ["b5", { neighbors: new Set(["center"]) }],
      ["b6", { neighbors: new Set(["center"]) }],
    ]);

    const scoreByKey = setupState.buildTerrainPlacementScoreMap(cells, 12345, adjacencyById);

    expect(scoreByKey.get("center")).toBeGreaterThan(scoreByKey.get("b1"));
    expect(scoreByKey.get("center")).toBeGreaterThan(scoreByKey.get("b2"));
  });
});
