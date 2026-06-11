/** @vitest-environment jsdom */

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import GalaxySurveyMapInspector from "./GalaxySurveyMapInspector.vue";

function createSelectedTile(overrides = {}) {
  return {
    displayName: "Aegis Reach",
    sectorId: "sec-42",
    gridX: 3,
    gridY: -2,
    persisted: true,
    occupiedHexCount: 128,
    typedHexCount: 64,
    ring: 3,
    dc: 4,
    ...overrides,
  };
}

describe("GalaxySurveyMapInspector", () => {
  it("renders the selected sector summary and emits open/generate events", async () => {
    const wrapper = mount(GalaxySurveyMapInspector, {
      props: {
        selectedTile: createSelectedTile(),
        ringTileCount: 12,
        ringPersistedSectors: [{ sectorId: "sec-42" }, { sectorId: "sec-43" }],
      },
    });

    expect(wrapper.text()).toContain("Aegis Reach");
    expect(wrapper.text()).toContain("Ring 3 contains 12 layout tiles and 2 persisted sectors.");

    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    await buttons[1].trigger("click");
    await buttons[2].trigger("click");
    await buttons[3].trigger("click");

    expect(wrapper.emitted("open-sector-survey")).toEqual([
      [{ viewName: "SectorSurvey" }],
      [{ viewName: "SubsectorSurvey" }],
    ]);
    expect(wrapper.emitted("generate-ring")).toEqual([[{ mode: "presence" }], [{ mode: "systems" }]]);
  });

  it("emits ring reset payloads and disables survey jumps for layout-only tiles", async () => {
    const wrapper = mount(GalaxySurveyMapInspector, {
      props: {
        selectedTile: createSelectedTile({ persisted: false }),
        ringTileCount: 5,
        ringPersistedSectors: [{ sectorId: "sec-42" }, { sectorId: "sec-43" }],
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("disabled")).toBeDefined();
    expect(buttons[1].attributes("disabled")).toBeDefined();

    await buttons[4].trigger("click");
    await buttons[5].trigger("click");

    expect(wrapper.emitted("request-reset")).toEqual([
      [{ level: "systems", scopeLabel: "ring 3", sectorIds: ["sec-42", "sec-43"] }],
      [{ level: "presence", scopeLabel: "ring 3", sectorIds: ["sec-42", "sec-43"] }],
    ]);
  });
});
