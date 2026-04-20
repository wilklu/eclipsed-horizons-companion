import { describe, expect, it } from "vitest";

import { classifyPlanetaryBody, resolveOrbitBandFromOrbitNumber } from "./systemWorldClassification.js";

describe("systemWorldClassification", () => {
  it("maps orbit numbers into the agreed orbit bands", () => {
    expect(resolveOrbitBandFromOrbitNumber(0)).toEqual({ key: "epistellar", label: "Epistellar" });
    expect(resolveOrbitBandFromOrbitNumber(2)).toEqual({ key: "epistellar", label: "Epistellar" });
    expect(resolveOrbitBandFromOrbitNumber(3)).toEqual({ key: "inner", label: "Inner Zone" });
    expect(resolveOrbitBandFromOrbitNumber(5)).toEqual({ key: "inner", label: "Inner Zone" });
    expect(resolveOrbitBandFromOrbitNumber(6)).toEqual({ key: "outer", label: "Outer Zone" });
    expect(resolveOrbitBandFromOrbitNumber(12)).toEqual({ key: "outer", label: "Outer Zone" });
  });

  it("classifies small epistellar rocky bodies as meltballs when they are molten", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 1,
      size: 2,
      avgTempC: 260,
      hydrographics: 0,
      runawayGreenhouse: true,
    });

    expect(classification.worldFamily).toBe("Dwarf World");
    expect(classification.worldSubtype).toBe("Meltball");
    expect(classification.orbitBand).toBe("Epistellar");
    expect(classification.worldDescriptor).toBe("Epistellar Meltball");
  });

  it("classifies habitable inner-zone terrestrial worlds as tectonic when they hold significant surface water", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 4,
      size: 8,
      hydrographics: 6,
      avgTempC: 19,
      nativeLifeform: "2201",
    });

    expect(classification.worldFamily).toBe("Terrestrial World");
    expect(classification.worldClass).toBe("Tectonic");
    expect(classification.worldSubtype).toBe("Tectonic");
    expect(classification.worldDescriptor).toBe("Inner Zone Tectonic");
  });

  it("classifies temperate life-bearing terrestrial worlds as gaian when the conditions are earthlike", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 4,
      size: 8,
      hydrographics: 7,
      atmosphereCode: 6,
      avgTempC: 16,
      nativeLifeform: "A987",
    });

    expect(classification.worldClass).toBe("Tectonic");
    expect(classification.worldSubtype).toBe("Gaian");
    expect(classification.worldDescriptor).toBe("Inner Zone Gaian");
  });

  it("classifies dry epistellar terrestrials as janilithic", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 1,
      size: 8,
      hydrographics: 0,
      atmosphereCode: 3,
      avgTempC: 65,
      composition: "Rocky silicate crust",
    });

    expect(classification.worldClass).toBe("Epistellar");
    expect(classification.worldSubtype).toBe("JaniLithic");
    expect(classification.worldDescriptor).toBe("Epistellar JaniLithic");
  });

  it("classifies wetter life-friendly epistellar terrestrials as vesperian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 2,
      size: 8,
      hydrographics: 4,
      atmosphereCode: 7,
      avgTempC: 24,
      nativeLifeform: "B776",
      hydrosphereLiquid: "Liquid Water",
    });

    expect(classification.worldClass).toBe("Epistellar");
    expect(classification.worldSubtype).toBe("Vesperian");
    expect(classification.worldDescriptor).toBe("Epistellar Vesperian");
  });

  it("classifies borderline dry vesperian worlds as janivesperian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 2,
      size: 8,
      hydrographics: 2,
      atmosphereCode: 7,
      avgTempC: 20,
      nativeLifeform: "9775",
      hydrosphereDescription: "Twilight seas and nightside frost basins",
    });

    expect(classification.worldClass).toBe("Epistellar");
    expect(classification.worldSubtype).toBe("JaniVesperian");
    expect(classification.worldDescriptor).toBe("Epistellar JaniVesperian");
  });

  it("classifies mature temperate vesperian worlds as euvesperian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 2,
      size: 8,
      hydrographics: 6,
      atmosphereCode: 7,
      avgTempC: 21,
      nativeLifeform: "B987",
      hydrosphereLiquid: "Liquid Water",
    });

    expect(classification.worldClass).toBe("Epistellar");
    expect(classification.worldSubtype).toBe("EuVesperian");
    expect(classification.worldDescriptor).toBe("Epistellar EuVesperian");
  });

  it("classifies deep hot vesperian oceans as bathyvesperian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 2,
      size: 8,
      hydrographics: 9,
      atmosphereCode: 9,
      avgTempC: 75,
      nativeLifeform: "B998",
      hydrosphereLiquid: "Liquid Water",
      composition: "Deep ocean silicate world",
    });

    expect(classification.worldClass).toBe("Epistellar");
    expect(classification.worldSubtype).toBe("BathyVesperian");
    expect(classification.worldDescriptor).toBe("Epistellar BathyVesperian");
  });

  it("classifies chlorine biosphere vesperian worlds as chlorivesperian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 2,
      size: 8,
      hydrographics: 5,
      atmosphereCode: 10,
      avgTempC: 28,
      nativeLifeform: "C998",
      hydrosphereLiquid: "Liquid Water",
      atmosphereComposition: "Hydrogen chloride and chlorine-rich atmosphere",
    });

    expect(classification.worldClass).toBe("Epistellar");
    expect(classification.worldSubtype).toBe("ChloriVesperian");
    expect(classification.worldDescriptor).toBe("Epistellar ChloriVesperian");
  });

  it("classifies hot dense greenhouse terrestrials as phosphorian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 3,
      size: 8,
      hydrographics: 0,
      atmosphereCode: 13,
      avgTempC: 320,
      runawayGreenhouse: true,
    });

    expect(classification.worldClass).toBe("Telluric");
    expect(classification.worldSubtype).toBe("Phosphorian");
    expect(classification.worldDescriptor).toBe("Inner Zone Phosphorian");
  });

  it("classifies less extreme greenhouse terrestrials as cytherean", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 4,
      size: 8,
      hydrographics: 1,
      atmosphereCode: 11,
      avgTempC: 180,
      composition: "Dense carbon dioxide atmosphere with sulfur clouds",
    });

    expect(classification.worldClass).toBe("Telluric");
    expect(classification.worldSubtype).toBe("Cytherean");
    expect(classification.worldDescriptor).toBe("Inner Zone Cytherean");
  });

  it("classifies cold ammonia-leaning tectonic worlds as amunian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 7,
      size: 8,
      hydrographics: 5,
      atmosphereCode: 8,
      avgTempC: -35,
      hydrosphereDescription: "Ammonia-rich seas and cryogenic basins",
      composition: "Carbon-rich with ammonia ices",
    });

    expect(classification.worldClass).toBe("Tectonic");
    expect(classification.worldSubtype).toBe("Amunian");
    expect(classification.orbitBand).toBe("Outer Zone");
  });

  it("classifies methane-rich cryogenic worlds as tartarian", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 8,
      size: 7,
      hydrographics: 4,
      atmosphereCode: 8,
      avgTempC: -120,
      hydrosphereLiquid: "Liquid Methane",
      composition: "Hydrocarbon-rich icy crust",
    });

    expect(classification.worldClass).toBe("Tectonic");
    expect(classification.worldSubtype).toBe("Tartarian");
    expect(classification.worldDescriptor).toBe("Outer Zone Tartarian");
  });

  it("classifies deep water worlds as pelagic when they are standard oceanic planets", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 5,
      size: 8,
      hydrographics: 10,
      atmosphereCode: 6,
      avgTempC: 14,
      hydrosphereLiquid: "Liquid Water",
      nativeLifeform: "A987",
    });

    expect(classification.worldClass).toBe("Oceanic");
    expect(classification.worldSubtype).toBe("Pelagic");
    expect(classification.worldDescriptor).toBe("Inner Zone Pelagic");
  });

  it("classifies ammonia-ocean superwet worlds as nunnic", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 7,
      size: 8,
      hydrographics: 10,
      atmosphereCode: 8,
      avgTempC: -40,
      hydrosphereLiquid: "Liquid Ammonia",
      composition: "Carbon-rich ammonia ices",
    });

    expect(classification.worldClass).toBe("Oceanic");
    expect(classification.worldSubtype).toBe("Nunnic");
    expect(classification.worldDescriptor).toBe("Outer Zone Nunnic");
  });

  it("classifies methane-ocean superwet worlds as teathic", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 9,
      size: 8,
      hydrographics: 10,
      atmosphereCode: 8,
      avgTempC: -140,
      hydrosphereLiquid: "Liquid Methane",
      composition: "Hydrocarbon seas and cryogenic methane basins",
    });

    expect(classification.worldClass).toBe("Oceanic");
    expect(classification.worldSubtype).toBe("Teathic");
    expect(classification.worldDescriptor).toBe("Outer Zone Teathic");
  });

  it("classifies volatile-rich inner helian worlds as panthalassic", () => {
    const classification = classifyPlanetaryBody({
      type: "Helian World",
      orbitNumber: 5,
      size: 11,
      hydrographics: 9,
      atmosphereCode: 11,
      avgTempC: -5,
      composition: "Water-hydrogen envelope with deep ocean layers",
    });

    expect(classification.worldClass).toBe("Helian");
    expect(classification.worldSubtype).toBe("Panthalassic");
  });

  it("classifies stripped epistellar helian worlds as asphodelian", () => {
    const classification = classifyPlanetaryBody({
      type: "Helian World",
      orbitNumber: 2,
      size: 11,
      hydrographics: 0,
      atmosphereCode: 1,
      avgTempC: 210,
      composition: "Hydrogen-helium envelope with exposed hot upper layers",
    });

    expect(classification.worldClass).toBe("Helian");
    expect(classification.worldSubtype).toBe("Asphodelian");
    expect(classification.worldDescriptor).toBe("Epistellar Asphodelian");
  });

  it("classifies frozen outer dwarf worlds as snowballs", () => {
    const classification = classifyPlanetaryBody({
      type: "Terrestrial Planet",
      orbitNumber: 9,
      size: 3,
      hydrographics: 9,
      zone: "frozen",
      avgTempC: -140,
    });

    expect(classification.worldFamily).toBe("Dwarf World");
    expect(classification.worldSubtype).toBe("Snowball");
    expect(classification.orbitBand).toBe("Outer Zone");
  });
});
