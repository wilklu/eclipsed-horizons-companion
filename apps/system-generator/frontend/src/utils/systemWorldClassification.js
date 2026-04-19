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

  if (orbitBandKey === "epistellar") {
    if (hasLife && hydroPercent >= 10) {
      return { worldClass: "Epistellar", worldSubtype: "Vesperian" };
    }

    if (molten || atmosphereCode >= 10) {
      return { worldClass: "Telluric", worldSubtype: "Telluric" };
    }

    return { worldClass: "Epistellar", worldSubtype: "JaniLithic" };
  }

  if (hydroPercent >= 80) {
    return { worldClass: "Oceanic", worldSubtype: "Oceanic" };
  }

  if (hydroPercent >= 40 || hasLife) {
    return { worldClass: "Tectonic", worldSubtype: "Tectonic" };
  }

  if (molten || atmosphereCode >= 10) {
    return { worldClass: "Telluric", worldSubtype: "Telluric" };
  }

  return { worldClass: "Arid", worldSubtype: "Arid" };
}

function classifyHelianWorld(planet = {}, orbitBandKey) {
  if (orbitBandKey === "epistellar") {
    return { worldClass: "Helian", worldSubtype: "Hot Helian" };
  }

  if (orbitBandKey === "outer") {
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
