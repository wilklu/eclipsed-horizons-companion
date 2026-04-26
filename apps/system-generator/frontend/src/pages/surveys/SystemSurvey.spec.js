/** @vitest-environment jsdom */

import { reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routeState = reactive({
  name: "SystemSurvey",
  query: {
    systemId: "sector-1:0101",
    systemRecordId: "sector-1:0101",
    systemName: "Aster System",
    hex: "0101",
  },
  params: {
    galaxyId: "gal-1",
    sectorId: "sector-1",
    systemId: "sector-1:0101",
  },
});

const systemStoreState = reactive({
  currentSystemId: "sector-1:0101",
  getCurrentSystem: {
    systemId: "sector-1:0101",
    stars: [{ designation: "Aster Primus Major" }],
    worlds: [],
    metadata: {},
  },
  systems: [
    {
      systemId: "sector-1:0101",
      stars: [{ designation: "Aster Primus Major" }],
      worlds: [],
      metadata: {},
    },
  ],
});

vi.mock("vue-router", () => ({
  useRoute: () => routeState,
  useRouter: () => ({ push: vi.fn() }),
  onBeforeRouteLeave: () => {},
}));

vi.mock("../../stores/systemStore", () => ({
  useSystemStore: () => systemStoreState,
}));

import SystemSurvey from "./SystemSurvey.vue";

describe("SystemSurvey", () => {
  beforeEach(() => {
    routeState.name = "SystemSurvey";
    routeState.query = {
      systemId: "sector-1:0101",
      systemRecordId: "sector-1:0101",
      systemName: "Aster System",
      hex: "0101",
    };
    routeState.params = {
      galaxyId: "gal-1",
      sectorId: "sector-1",
      systemId: "sector-1:0101",
    };

    systemStoreState.currentSystemId = "sector-1:0101";
    systemStoreState.getCurrentSystem = {
      systemId: "sector-1:0101",
      stars: [{ designation: "Aster Primus Major" }],
      worlds: [],
      metadata: {},
    };
    systemStoreState.systems = [systemStoreState.getCurrentSystem];
  });

  it("autofills the form with routed system name and sector-hex context", async () => {
    const wrapper = mount(SystemSurvey, {
      global: {
        stubs: {
          SurveyNavigation: { template: "<div data-test='survey-navigation' />" },
        },
      },
    });

    await flushPromises();
    await flushPromises();

    const systemDesignationInput = wrapper.find('input[placeholder="e.g., Alpha Centauri A"]');
    const sectorHexInput = wrapper.find('input[placeholder="e.g., Orion 0101"]');

    expect(systemDesignationInput.element.value).toBe("Aster System");
    expect(sectorHexInput.element.value).toContain("0101");
    expect(sectorHexInput.element.value).toContain("sector-1");
  });
});
