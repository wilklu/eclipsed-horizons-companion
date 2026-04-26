const ORBIT_BAND_TABLE = Object.freeze([
  { maxOrbit: 2, key: "epistellar", label: "Epistellar" },
  { maxOrbit: 5, key: "inner", label: "Inner Zone" },
  { maxOrbit: Number.POSITIVE_INFINITY, key: "outer", label: "Outer Zone" },
]);

const EMPTY_NATIVE_LIFE_CODES = new Set(["", "0000", "NONE", "ABSENT", "N/A", "NULL", "UNINHABITED"]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function parseExtendedHex(value) {
  const normalized = String(value ?? "")
    .trim()
    .charAt(0)
    .toUpperCase();

  if (!normalized) {
    return Number.NaN;
  }

  if (normalized === "S") {
    return 0;
  }

  if (normalized === "R") {
    return 0;
  }

  const parsed = Number.parseInt(normalized, 36);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function resolveNumericSize(planet = {}) {
  const directSize = Number(planet.size);
  if (Number.isFinite(directSize)) {
    return directSize;
  }

  const sizeCode = parseExtendedHex(planet.sizeCode);
  if (Number.isFinite(sizeCode)) {
    return sizeCode;
  }

  const uwpSize = parseExtendedHex(String(planet.uwp || "").charAt(1));
  if (Number.isFinite(uwpSize)) {
    return uwpSize;
  }

  return Number.NaN;
}

function resolveHydrographicsCode(planet = {}) {
  const directHydro = Number(planet.hydrographics);
  if (Number.isFinite(directHydro)) {
    return clamp(directHydro, 0, 10);
  }

  const hydroFromUwp = parseExtendedHex(String(planet.uwp || "").charAt(3));
  if (Number.isFinite(hydroFromUwp)) {
    return clamp(hydroFromUwp, 0, 10);
  }

  const hydroPercent = Number(planet.hydrographicsPercent);
  if (Number.isFinite(hydroPercent)) {
    return clamp(Math.round(hydroPercent / 10), 0, 10);
  }

  return 0;
}

function resolveHydrographicsPercent(planet = {}) {
  const hydroPercent = Number(planet.hydrographicsPercent);
  if (Number.isFinite(hydroPercent)) {
    return clamp(hydroPercent, 0, 100);
  }

  const hydroCode = resolveHydrographicsCode(planet);
  return hydroCode >= 10 ? 100 : hydroCode * 10;
}

function resolveAtmosphereCode(planet = {}) {
  const directAtmo = Number(planet.atmosphereCode);
  if (Number.isFinite(directAtmo)) {
    return clamp(directAtmo, 0, 15);
  }

  const atmoFromUwp = parseExtendedHex(String(planet.uwp || "").charAt(2));
  if (Number.isFinite(atmoFromUwp)) {
    return clamp(atmoFromUwp, 0, 15);
  }

  return 0;
}

function hasNativeLife(planet = {}) {
  const lifeCode = String(planet.nativeLifeform || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

  return !EMPTY_NATIVE_LIFE_CODES.has(lifeCode) || planet.nativeSophontLife === true;
}

function isMoltenWorld(planet = {}) {
  const avgTempC = Number(planet.avgTempC);
  const surfaceSummary = [planet.dominantSurface, planet.hydrosphereLiquid, planet.hydrosphereDescription]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return Boolean(planet.runawayGreenhouse) || avgTempC >= 180 || /molten|magma|lava/.test(surfaceSummary);
}

function isTidalWorld(planet = {}) {
  const surfaceTidalEffect = Number(planet.surfaceTidalEffectMeters);
  const totalTidalEffect = Number(planet?.seismology?.totalTidalEffectMeters);
  const plateCount = Number(planet.majorTectonicPlates);

  return Boolean(planet.isMoon) || surfaceTidalEffect >= 2 || totalTidalEffect >= 2 || plateCount >= 10;
}

function resolveChemistrySummary(planet = {}) {
  try {
    const detailed = planet?.atmosphereCompositionDetailed;
    if (detailed && typeof detailed === "object") {
      const gasNames = Array.isArray(detailed.gases)
        ? detailed.gases
            .map((g) => String(g?.gas || ""))
            .filter(Boolean)
            .join(" ")
        : "";
      const taints = Array.isArray(detailed.taints)
        ? detailed.taints.join(" ")
        : typeof detailed.taints === "string"
          ? detailed.taints
          : "";
      return [
        detailed.description,
        gasNames,
        taints,
        planet.composition,
        planet.atmosphereComposition,
        planet.atmosphereDesc,
        planet.worldDescriptor,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    }
  } catch (e) {
    /* ignore and fallback */
  }

  return [
    planet.composition,
    planet.hydrosphereLiquid,
    planet.hydrosphereDescription,
    planet.atmosphereComposition,
    planet.atmosphereDesc,
    planet.worldDescriptor,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function resolveHydrosphereChemistry(planet = {}) {
  // Prefer the structured hydrography if available
  try {
    const detailed = planet?.hydrographicsCompositionDetailed;
    if (detailed && typeof detailed === "object") {
      const wf = Number(detailed.waterFraction || 0);
      const ocean = Number(detailed.oceanFraction || 0);
      const ice = Number(detailed.iceFraction || 0);
      // Mostly water and reasonable ocean share -> water
      if (wf >= 0.5 && ocean >= 0.3) return "water";
      // Very icy ocean-dominated worlds at cryogenic temperatures may be hydrocarbon seas
      const avgTempC = Number(planet?.avgTempC);
      const hydroPercent = resolveHydrographicsPercent(planet);
      if (hydroPercent > 0 && Number.isFinite(avgTempC) && avgTempC <= -70 && wf < 0.25) return "methane";
      if (
        String(detailed.salinity || "")
          .toLowerCase()
          .includes("fresh") &&
        wf > 0
      )
        return "water";
    }
  } catch (e) {
    // fall through to text-based heuristics
  }

  const chemistry = resolveChemistrySummary(planet);

  if (/ammonia/.test(chemistry)) {
    return "ammonia";
  }

  if (/methane|ethane|hydrocarbon|cryogenic/.test(chemistry)) {
    return "methane";
  }

  if (/water|ocean|sea|pelagic|panthalassic/.test(chemistry)) {
    return "water";
  }

  return "unknown";
}

function classifyOceanicWorld(planet = {}) {
  const chemistry = resolveHydrosphereChemistry(planet);

  if (chemistry === "ammonia") {
    return { worldClass: "Oceanic", worldSubtype: "Nunnic" };
  }

  if (chemistry === "methane") {
    return { worldClass: "Oceanic", worldSubtype: "Teathic" };
  }

  return {
    worldClass: "Oceanic",
    worldSubtype: "Pelagic",
  };
}

function classifyVesperianWorld(planet = {}) {
  const hydroPercent = resolveHydrographicsPercent(planet);
  const chemistry = resolveChemistrySummary(planet);
  const avgTempC = Number(planet.avgTempC);

  if (/chlorine|chloride|hydrogen chloride/.test(chemistry)) {
    return { worldClass: "Epistellar", worldSubtype: "ChloriVesperian" };
  }

  if (hydroPercent >= 80 || (hydroPercent >= 60 && Number.isFinite(avgTempC) && avgTempC >= 45)) {
    return { worldClass: "Epistellar", worldSubtype: "BathyVesperian" };
  }

  if (hydroPercent <= 30) {
    return { worldClass: "Epistellar", worldSubtype: "JaniVesperian" };
  }

  if (hydroPercent >= 50) {
    return { worldClass: "Epistellar", worldSubtype: "EuVesperian" };
  }

  return { worldClass: "Epistellar", worldSubtype: "Vesperian" };
}

function classifyTelluricWorld(planet = {}, orbitBandKey) {
  const atmosphereCode = resolveAtmosphereCode(planet);
  const hydroPercent = resolveHydrographicsPercent(planet);
  const avgTempC = Number(planet.avgTempC);

  if (
    orbitBandKey === "epistellar" ||
    Boolean(planet.runawayGreenhouse) ||
    atmosphereCode >= 13 ||
    (Number.isFinite(avgTempC) && avgTempC >= 250) ||
    (Number.isFinite(avgTempC) && avgTempC >= 180 && hydroPercent <= 2)
  ) {
    return { worldClass: "Telluric", worldSubtype: "Phosphorian" };
  }

  return { worldClass: "Telluric", worldSubtype: "Cytherean" };
}

function isGaianCandidate(
  planet = {},
  { hydroPercent = 0, atmosphereCode = 0, hasLife = false, orbitBandKey = "" } = {},
) {
  const avgTempC = Number(planet.avgTempC);
  return (
    orbitBandKey !== "epistellar" &&
    hasLife &&
    hydroPercent >= 35 &&
    hydroPercent <= 90 &&
    atmosphereCode >= 4 &&
    atmosphereCode <= 9 &&
    Number.isFinite(avgTempC) &&
    avgTempC >= -10 &&
    avgTempC <= 32
  );
}

function isAmunianCandidate(planet = {}, { hydroPercent = 0, orbitBandKey = "" } = {}) {
  const avgTempC = Number(planet.avgTempC);
  const chemistry = resolveChemistrySummary(planet);
  return (
    orbitBandKey === "outer" &&
    hydroPercent >= 2 &&
    Number.isFinite(avgTempC) &&
    avgTempC <= 0 &&
    avgTempC >= -90 &&
    (/ammonia/.test(chemistry) || (/nitrogen/.test(chemistry) && /carbon|hydrocarbon/.test(chemistry)))
  );
}

function isTartarianCandidate(planet = {}, { hydroPercent = 0, orbitBandKey = "" } = {}) {
  const avgTempC = Number(planet.avgTempC);
  const chemistry = resolveChemistrySummary(planet);
  return (
    orbitBandKey === "outer" &&
    hydroPercent >= 2 &&
    Number.isFinite(avgTempC) &&
    avgTempC <= -70 &&
    (/methane|hydrocarbon|cryogenic/.test(chemistry) ||
      String(planet.zone || "")
        .trim()
        .toLowerCase() === "frozen")
  );
}

function inferWorldFamily(planet = {}) {
  const type = String(planet.type || "")
    .trim()
    .toLowerCase();
  const composition = String(planet.composition || "")
    .trim()
    .toLowerCase();
  const size = resolveNumericSize(planet);

  if (type.includes("belt")) {
    return "Planetoid Belt";
  }

  if (type.includes("gas giant") || type.includes("jovian")) {
    return "Jovian World";
  }

  if (type.includes("helian") || (size >= 10 && /hydrogen|helium/.test(composition))) {
    return "Helian World";
  }

  if (Number.isFinite(size) && size <= 4) {
    return "Dwarf World";
  }

  return "Terrestrial World";
}

function classifyDwarfWorld(planet = {}, orbitBandKey) {
  const hydroPercent = resolveHydrographicsPercent(planet);
  const molten = isMoltenWorld(planet);
  const tidalWorld = isTidalWorld(planet);
  const zone = String(planet.zone || "")
    .trim()
    .toLowerCase();
  const hasLife = hasNativeLife(planet);

  if (orbitBandKey === "epistellar") {
    return molten
      ? { worldClass: "GeoThermic", worldSubtype: "Meltball" }
      : { worldClass: "GeoPassive", worldSubtype: "Rockball" };
  }

  if (orbitBandKey === "outer" && (zone === "frozen" || hydroPercent >= 70)) {
    return { worldClass: "GeoPassive", worldSubtype: "Snowball" };
  }

  if (tidalWorld) {
    return hydroPercent >= 30 || hasLife
      ? { worldClass: "GeoTidal", worldSubtype: "GeoTidal" }
      : { worldClass: "GeoTidal", worldSubtype: "Hebean" };
  }

  if (molten) {
    return { worldClass: "GeoThermic", worldSubtype: "Meltball" };
  }

  if (hydroPercent >= 20) {
    return { worldClass: "GeoCyclic", worldSubtype: "GeoCyclic" };
  }

  return { worldClass: "GeoPassive", worldSubtype: "Rockball" };
}

function classifyTerrestrialWorld(planet = {}, orbitBandKey) {
  const hydroPercent = resolveHydrographicsPercent(planet);
  const atmosphereCode = resolveAtmosphereCode(planet);
  const molten = isMoltenWorld(planet);
  const hasLife = hasNativeLife(planet);
  const avgTempC = Number(planet.avgTempC);
  const plateCount = Number(planet.majorTectonicPlates);

  if (orbitBandKey === "epistellar") {
    const shouldStayVesperian = (hasLife || hydroPercent >= 20) && (!Number.isFinite(avgTempC) || avgTempC < 140);

    if (shouldStayVesperian) {
      return classifyVesperianWorld(planet);
    }

    if (molten || atmosphereCode >= 10 || (Number.isFinite(avgTempC) && avgTempC >= 140 && hydroPercent <= 20)) {
      return classifyTelluricWorld(planet, orbitBandKey);
    }

    return { worldClass: "Epistellar", worldSubtype: "JaniLithic" };
  }

  if (hydroPercent >= 80) {
    return classifyOceanicWorld(planet);
  }

  if (isTartarianCandidate(planet, { hydroPercent, orbitBandKey })) {
    return { worldClass: "Tectonic", worldSubtype: "Tartarian" };
  }

  if (isAmunianCandidate(planet, { hydroPercent, orbitBandKey })) {
    return { worldClass: "Tectonic", worldSubtype: "Amunian" };
  }

  if (isGaianCandidate(planet, { hydroPercent, atmosphereCode, hasLife, orbitBandKey })) {
    return { worldClass: "Tectonic", worldSubtype: "Gaian" };
  }

  if (molten || (atmosphereCode >= 10 && hydroPercent <= 20)) {
    return classifyTelluricWorld(planet, orbitBandKey);
  }

  if (hydroPercent >= 40 || hasLife || plateCount >= 6) {
    return { worldClass: "Tectonic", worldSubtype: "Tectonic" };
  }

  return { worldClass: "Arid", worldSubtype: "Arid" };
}

function classifyHelianWorld(planet = {}, orbitBandKey) {
  const hydroPercent = resolveHydrographicsPercent(planet);
  const chemistry = resolveHydrosphereChemistry(planet);
  const atmosphereCode = resolveAtmosphereCode(planet);
  const avgTempC = Number(planet.avgTempC);

  if (orbitBandKey === "epistellar") {
    if (hydroPercent <= 20 || atmosphereCode <= 2 || (Number.isFinite(avgTempC) && avgTempC >= 120)) {
      return { worldClass: "Helian", worldSubtype: "Asphodelian" };
    }

    return { worldClass: "Helian", worldSubtype: "Hot Helian" };
  }

  if (orbitBandKey !== "outer" && (hydroPercent >= 70 || chemistry === "water")) {
    return { worldClass: "Helian", worldSubtype: "Panthalassic" };
  }

  return { worldClass: "Helian", worldSubtype: "Helian" };
}

function classifyJovianWorld(planet = {}, orbitBandKey) {
  const zone = String(planet.zone || "")
    .trim()
    .toLowerCase();
  const composition = String(planet.composition || "")
    .trim()
    .toLowerCase();

  if (orbitBandKey === "epistellar") {
    return { worldClass: "Jovian", worldSubtype: "Hot Jovian" };
  }

  if (zone === "frozen" || composition.includes("ice")) {
    return { worldClass: "Jovian", worldSubtype: "Ice Giant" };
  }

  return { worldClass: "Jovian", worldSubtype: "Jovian" };
}

export function resolveOrbitBandFromOrbitNumber(orbitNumber) {
  const numericOrbit = Number(orbitNumber);
  if (!Number.isFinite(numericOrbit)) {
    return { key: "unknown", label: "Unknown Orbit" };
  }

  const matchedBand = ORBIT_BAND_TABLE.find((band) => numericOrbit <= band.maxOrbit);
  return matchedBand ? { key: matchedBand.key, label: matchedBand.label } : { key: "outer", label: "Outer Zone" };
}

export function classifyPlanetaryBody(planet = {}) {
  const orbitBandInfo = resolveOrbitBandFromOrbitNumber(planet.orbitNumber);
  const worldFamily = inferWorldFamily(planet);

  let classification;
  if (worldFamily === "Planetoid Belt") {
    classification = { worldClass: "Debris Field", worldSubtype: "Planetoid Belt" };
  } else if (worldFamily === "Jovian World") {
    classification = classifyJovianWorld(planet, orbitBandInfo.key);
  } else if (worldFamily === "Helian World") {
    classification = classifyHelianWorld(planet, orbitBandInfo.key);
  } else if (worldFamily === "Dwarf World") {
    classification = classifyDwarfWorld(planet, orbitBandInfo.key);
  } else {
    classification = classifyTerrestrialWorld(planet, orbitBandInfo.key);
  }

  return {
    orbitBandKey: orbitBandInfo.key,
    orbitBand: orbitBandInfo.label,
    worldFamily,
    worldClass: classification.worldClass,
    worldSubtype: classification.worldSubtype,
    worldDescriptor: `${orbitBandInfo.label} ${classification.worldSubtype}`.trim(),
  };
}

export function applyPlanetaryBodyClassification(planet = {}) {
  return {
    ...(planet && typeof planet === "object" ? planet : {}),
    ...classifyPlanetaryBody(planet),
  };
}
