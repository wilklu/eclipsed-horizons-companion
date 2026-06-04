import { describe, expect, it } from "vitest";
import {
  WORLD_HEX_BIOMES,
  WORLD_HEX_TAGS,
  WORLD_HEX_TERRAIN_CLASSES,
  buildWorldHexTagIndex,
  buildWorldTerrainHexTagSnapshot,
} from "./worldTerrainHexTags.js";

describe("worldTerrainHexTags", () => {
  it("splits terrain and feature tags while preserving the combined tag list", () => {
    const index = buildWorldHexTagIndex({
      cells: [
        { key: "hex-a", faceId: "Face-1", points: "0,0" },
        { key: "hex-b", faceId: "Face-2", points: "1,1" },
        { key: "hex-c", faceId: "Face-2", points: "2,2" },
        { key: "hex-d", faceId: "", points: "3,3" },
      ],
      topologyGraph: {
        triangles: [
          { id: "Face-1", neighbors: ["Face-2"] },
          { id: "Face-2", neighbors: ["Face-1"] },
        ],
      },
      oceanTriangleIds: ["Face-2"],
      layerHexMaps: [
        [
          new Map([
            ["hex-a", true],
            ["hex-c", true],
          ]),
          WORLD_HEX_TAGS.MOUNTAIN,
        ],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.CROPLAND],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.TOWN],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.CITY],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.DOMED_CITY],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.ARCOLOGY],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.RURAL],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.STARPORT],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.SPACEPORT],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.TWILIGHT_ZONE],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.BAKED_LANDS],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.PENAL_COLONY],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.WASTELAND],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.EXOTIC],
        [new Map([["hex-a", true]]), WORLD_HEX_TAGS.NOBLE_LANDS],
        [new Map([["hex-d", true]]), WORLD_HEX_TAGS.ICE_CAP],
      ],
    });

    expect(index.shorelineTriangleIds).toEqual(["Face-1"]);
    expect(index.oceanTriangleIds).toEqual(["Face-2"]);

    expect(index.byKey.get("hex-a")).toMatchObject({
      tags: [
        WORLD_HEX_TAGS.ARCOLOGY,
        WORLD_HEX_TAGS.BAKED_LANDS,
        WORLD_HEX_TAGS.CITY,
        WORLD_HEX_TAGS.CROPLAND,
        WORLD_HEX_TAGS.DOMED_CITY,
        WORLD_HEX_TAGS.EXOTIC,
        WORLD_HEX_TAGS.MOUNTAIN,
        WORLD_HEX_TAGS.NOBLE_LANDS,
        WORLD_HEX_TAGS.PENAL_COLONY,
        WORLD_HEX_TAGS.RURAL,
        WORLD_HEX_TAGS.SHORELINE,
        WORLD_HEX_TAGS.SPACEPORT,
        WORLD_HEX_TAGS.STARPORT,
        WORLD_HEX_TAGS.TOWN,
        WORLD_HEX_TAGS.TWILIGHT_ZONE,
        WORLD_HEX_TAGS.WASTELAND,
      ],
      terrainTags: [
        WORLD_HEX_TAGS.EXOTIC,
        WORLD_HEX_TAGS.MOUNTAIN,
        WORLD_HEX_TAGS.TWILIGHT_ZONE,
        WORLD_HEX_TAGS.WASTELAND,
      ],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.IMPASSABLE,
      biomeTags: [WORLD_HEX_BIOMES.DESERT, WORLD_HEX_BIOMES.MOUNTAIN],
      featureTags: [
        WORLD_HEX_TAGS.ARCOLOGY,
        WORLD_HEX_TAGS.BAKED_LANDS,
        WORLD_HEX_TAGS.CITY,
        WORLD_HEX_TAGS.CROPLAND,
        WORLD_HEX_TAGS.DOMED_CITY,
        WORLD_HEX_TAGS.NOBLE_LANDS,
        WORLD_HEX_TAGS.PENAL_COLONY,
        WORLD_HEX_TAGS.RURAL,
        WORLD_HEX_TAGS.SHORELINE,
        WORLD_HEX_TAGS.SPACEPORT,
        WORLD_HEX_TAGS.STARPORT,
        WORLD_HEX_TAGS.TOWN,
      ],
      hasTerrainTags: true,
      hasFeatureTags: true,
      hasBiomeTags: true,
    });

    expect(index.byKey.get("hex-b")).toMatchObject({
      tags: [WORLD_HEX_TAGS.OCEAN],
      terrainTags: [WORLD_HEX_TAGS.OCEAN],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.AQUATIC,
      biomeTags: [WORLD_HEX_BIOMES.AQUATIC],
      featureTags: [],
      hasTerrainTags: true,
      hasFeatureTags: false,
      hasBiomeTags: true,
    });

    expect(index.byKey.get("hex-c")).toMatchObject({
      tags: [WORLD_HEX_TAGS.ISLAND],
      terrainTags: [WORLD_HEX_TAGS.ISLAND],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT,
      biomeTags: [WORLD_HEX_BIOMES.PLAINS],
      featureTags: [],
      hasTerrainTags: true,
      hasFeatureTags: false,
      hasBiomeTags: true,
    });

    expect(index.byKey.get("hex-d")).toMatchObject({
      tags: [WORLD_HEX_TAGS.ICE_CAP],
      terrainTags: [WORLD_HEX_TAGS.ICE_CAP],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT,
      biomeTags: [WORLD_HEX_BIOMES.ARCTIC],
      featureTags: [],
      hasTerrainTags: true,
      hasFeatureTags: false,
      hasBiomeTags: true,
    });
  });

  it("builds a persisted snapshot for other survey pages to consume", () => {
    const index = buildWorldHexTagIndex({
      cells: [{ key: "hex-a", faceId: "Face-1", points: "0,0" }],
      topologyGraph: { triangles: [{ id: "Face-1", neighbors: [] }] },
      oceanTriangleIds: [],
      layerHexMaps: [[new Map([["hex-a", true]]), WORLD_HEX_TAGS.RESOURCES]],
    });

    const snapshot = buildWorldTerrainHexTagSnapshot(index, {
      systemId: "sys-42",
      worldIndex: 2,
      worldName: "Aurelia",
      updatedAt: "2024-01-01T00:00:00.000Z",
    });

    expect(snapshot).toMatchObject({
      systemId: "sys-42",
      worldIndex: 2,
      worldName: "Aurelia",
      updatedAt: "2024-01-01T00:00:00.000Z",
      taggedHexCount: 1,
      terrainTaggedHexCount: 1,
      featureTaggedHexCount: 1,
      biomeTaggedHexCount: 1,
      oceanTriangleIds: [],
      shorelineTriangleIds: [],
    });
    expect(snapshot.hexesByKey["hex-a"].tags).toContain(WORLD_HEX_TAGS.RESOURCES);
    expect(snapshot.signature).toContain("Aurelia");
  });

  it("remaps ocean and land tags for frozen worlds while preserving ice caps", () => {
    const index = buildWorldHexTagIndex({
      cells: [
        { key: "hex-ocean", faceId: "Face-2", points: "1,1" },
        { key: "hex-land", faceId: "Face-1", points: "0,0" },
        { key: "hex-cap", faceId: "Face-1", points: "2,2" },
      ],
      topologyGraph: {
        triangles: [
          { id: "Face-1", neighbors: ["Face-2"] },
          { id: "Face-2", neighbors: ["Face-1"] },
        ],
      },
      oceanTriangleIds: ["Face-2"],
      frozenWorld: true,
      layerHexMaps: [[new Map([["hex-cap", true]]), WORLD_HEX_TAGS.ICE_CAP]],
    });

    expect(index.byKey.get("hex-ocean")).toMatchObject({
      tags: [WORLD_HEX_TAGS.ICE_FIELD],
      terrainTags: [WORLD_HEX_TAGS.ICE_FIELD],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.AQUATIC,
      biomeTags: [WORLD_HEX_BIOMES.AQUATIC, WORLD_HEX_BIOMES.ARCTIC],
      hasTerrainTags: true,
      hasBiomeTags: true,
    });

    expect(index.byKey.get("hex-land")).toMatchObject({
      tags: [WORLD_HEX_TAGS.FROZEN_LANDS, WORLD_HEX_TAGS.SHORELINE],
      terrainTags: [WORLD_HEX_TAGS.FROZEN_LANDS],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT,
      biomeTags: [WORLD_HEX_BIOMES.ARCTIC],
      featureTags: [WORLD_HEX_TAGS.SHORELINE],
      hasTerrainTags: true,
      hasFeatureTags: true,
      hasBiomeTags: true,
    });

    expect(index.byKey.get("hex-cap")).toMatchObject({
      tags: [WORLD_HEX_TAGS.ICE_CAP],
      terrainTags: [WORLD_HEX_TAGS.ICE_CAP],
      terrainClass: WORLD_HEX_TERRAIN_CLASSES.OPEN_FLAT,
      biomeTags: [WORLD_HEX_BIOMES.ARCTIC],
      featureTags: [],
      hasTerrainTags: true,
      hasFeatureTags: false,
      hasBiomeTags: true,
    });
  });
});
