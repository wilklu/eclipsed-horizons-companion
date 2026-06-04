/** @vitest-environment jsdom */

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import WorldTerrainHexInspector from "./WorldTerrainHexInspector.vue";

describe("WorldTerrainHexInspector", () => {
  it("renders the selected hex tags and summary counts", async () => {
    const wrapper = mount(WorldTerrainHexInspector, {
      props: {
        selectedKey: "hex-a",
        selectedHex: {
          key: "hex-a",
          faceId: "Face-1",
          tags: ["Mountain", "Shoreline", "Arctic"],
          terrainTags: ["Mountain"],
          featureTags: ["Shoreline"],
          biomeTags: ["Mountain", "Arctic"],
          terrainClass: "Impassable",
        },
        summary: {
          taggedHexCount: 7,
          terrainTaggedHexCount: 4,
          featureTaggedHexCount: 3,
          biomeTaggedHexCount: 2,
          shorelineTriangleCount: 2,
        },
      },
    });

    expect(wrapper.text()).toContain("Hex Inspector");
    expect(wrapper.text()).toContain("hex-a");
    expect(wrapper.text()).toContain("Mountain");
    expect(wrapper.text()).toContain("Shoreline");
    expect(wrapper.text()).toContain("Impassable");
    expect(wrapper.text()).toContain("Arctic");
    expect(wrapper.text()).toContain("Biomes");
    expect(wrapper.text()).toContain("Tagged");
    expect(wrapper.text()).toContain("7");

    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("clear-selection")).toHaveLength(1);
  });

  it("still shows the clicked hex key when no tag entry exists yet", () => {
    const wrapper = mount(WorldTerrainHexInspector, {
      props: {
        selectedKey: "hex-z",
        selectedHex: null,
      },
    });

    expect(wrapper.text()).toContain("hex-z");
    expect(wrapper.text()).toContain("This hex is selected but has no recorded tag entry yet.");
  });
});
