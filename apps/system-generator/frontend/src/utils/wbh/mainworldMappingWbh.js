/**
 * Mainworld Mapping — WBH Chapter 6
 *
 * Derives a terrain hex composition for a terrestrial world using a standard
 * 490-hex icosahedron map (Method 1: standard map, variable hex size).
 *
 * Five hexes ≈ 1% of world surface area.
 * References:
 *   WBH Chapter 6: Mainworld Mapping — Determining World Surface Features
 *   Beasts and Sophonts: Native Terrain and Locomotion table (terrain type names)
 */

/** Total hexes on a standard 490-hex world map (WBH Method 1). */
const STANDARD_MAP_HEXES = 490;

/**
 * Atmosphere codes that preclude liquid-water hydrographics or indicate an
 * entirely hostile surface.  For these worlds the terrain skews towards
 * exotic / hostile types.
 */
const CORROSIVE_ATM_CODES = new Set([10, 11, 12]); // A, B, C
const EXOTIC_ATM_CODES = new Set([13, 14, 15]); // D, E, F
const VACUUM_ATM_CODES = new Set([0, 1]); // 0, 1 — essentially airless

/**
 * Returns true if the high temperature (°C) implies permanent ice coverage
 * over land at that latitude.  WBH rule: permanent glaciers where high temp
 * ≤ 0 °C (273 K).
 */
function isPermanentIce(highTempC) {
  return Number.isFinite(highTempC) && highTempC <= 0;
}

/**
 * Clamps a value between min and max.
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Rounds to nearest integer and returns at least 0.
 */
function safeRound(value) {
  return Math.max(0, Math.round(value));
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Estimate fractional ice-cap coverage of the total surface.
 *
 * Uses the simplified latitude model from WBH Chapter 6:
 *   • High temp ≤ 0 °C  → entire world frozen (ice fraction → land-ice only;
 *     water is already counted in hydrographics as frozen)
 *   • Mean temp ≤ -30 °C → large glaciation
 *   • Mean temp ≤ 0 °C   → moderate polar caps
 *   • High temp ≤ 10 °C  → small polar ice caps
 */
function estimateLandIceFraction(avgTempC, highTempC) {
  const mean = Number.isFinite(avgTempC) ? avgTempC : 0;
  const high = Number.isFinite(highTempC) ? highTempC : mean + 20;

  if (high <= 0) return 0.85; // world-wide glaciation on land
  if (mean <= -40) return 0.65;
  if (mean <= -20) return 0.45;
  if (mean <= 0) return 0.25;
  if (high <= 5) return 0.12;
  if (high <= 10) return 0.06;
  if (mean <= 10) return 0.03;
  return 0;
}

/**
 * Estimate fractional mountain/rough coverage from seismic stress and tectonic
 * plate count, per WBH seismology notes.
 */
function estimateMountainFraction(totalSeismicStress, majorTectonicPlates) {
  const stress = Number(totalSeismicStress) || 0;
  const plates = Number(majorTectonicPlates) || 0;
  // Base fraction rises with stress and plate count
  let fraction = 0.03;
  if (stress > 100) fraction += 0.2;
  else if (stress >= 50) fraction += 0.14;
  else if (stress >= 20) fraction += 0.09;
  else if (stress >= 10) fraction += 0.05;
  else if (stress >= 1) fraction += 0.02;
  if (plates >= 10) fraction += 0.05;
  else if (plates >= 6) fraction += 0.03;
  else if (plates >= 3) fraction += 0.01;
  return clamp(fraction, 0, 0.45);
}

/**
 * Estimate fractional volcanic coverage.  Only meaningful with high seismic
 * stress (residual internal heat, tidal stress).
 */
function estimateVolcanoFraction(totalSeismicStress) {
  const stress = Number(totalSeismicStress) || 0;
  if (stress > 100) return 0.05;
  if (stress >= 50) return 0.03;
  if (stress >= 20) return 0.01;
  return 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a terrain hex composition for a terrestrial world.
 *
 * @param {object} params
 * @param {string|number} params.sizeCode          World size code (0–F)
 * @param {number}        params.atmosphereCode     Atmosphere code (0–15)
 * @param {number}        params.hydrographics      Hydrographics code (0–10)
 * @param {number}        [params.hydrographicsPercent]  Precise % (0–100)
 * @param {number}        params.avgTempC            Mean surface temperature (°C)
 * @param {number}        [params.highTempC]         High surface temperature (°C)
 * @param {object}        [params.seismology]        Seismology profile object
 * @param {string}        [params.dominantSurface]   "ocean" | "land" (from surface distribution)
 * @returns {MainworldTerrainComposition}
 */
export function generateMainworldTerrainComposition(params = {}) {
  const atmCode = Number(params.atmosphereCode ?? 6);
  const hydro = clamp(Number(params.hydrographics ?? 5), 0, 10);
  const hydroPct = Number.isFinite(params.hydrographicsPercent)
    ? clamp(params.hydrographicsPercent, 0, 100)
    : hydro * 10;
  const avgTempC = Number.isFinite(params.avgTempC) ? params.avgTempC : 15;
  const highTempC = Number.isFinite(params.highTempC) ? params.highTempC : avgTempC + 20;
  const seismicStress = Number(params.seismology?.totalSeismicStress ?? 0);
  const tectonicPlates = Number(params.seismology?.majorTectonicPlates ?? params.majorTectonicPlates ?? 0);

  // -----------------------------------------------------------------------
  // Step 1 — Water hexes
  // -----------------------------------------------------------------------
  const totalWaterHexes = safeRound((hydroPct / 100) * STANDARD_MAP_HEXES);
  const landHexes = STANDARD_MAP_HEXES - totalWaterHexes;

  // Atmosphere influences surface liquid type
  const isExoticAtm = EXOTIC_ATM_CODES.has(atmCode);
  const isCorrosiveAtm = CORROSIVE_ATM_CODES.has(atmCode);
  const isVacuumAtm = VACUUM_ATM_CODES.has(atmCode);

  // -----------------------------------------------------------------------
  // Step 2 — Land ice (glaciers, polar caps)
  // -----------------------------------------------------------------------
  const landIceFraction = estimateLandIceFraction(avgTempC, highTempC);
  const iceHexesOnLand = safeRound(landHexes * landIceFraction);
  const usableLandHexes = landHexes - iceHexesOnLand;

  // -----------------------------------------------------------------------
  // Step 3 — Elevated terrain (mountains, rough, volcanoes)
  // -----------------------------------------------------------------------
  const mountainFraction = estimateMountainFraction(seismicStress, tectonicPlates);
  const volcanoFraction = estimateVolcanoFraction(seismicStress);
  const roughFraction = mountainFraction * 0.5; // rough terrain flanking mountains

  let mountainHexes = safeRound(usableLandHexes * mountainFraction);
  let volcanoHexes = safeRound(usableLandHexes * volcanoFraction);
  let roughHexes = safeRound(usableLandHexes * roughFraction);

  // -----------------------------------------------------------------------
  // Step 4 — Arid / desert terrain
  // -----------------------------------------------------------------------
  // Driven by low hydro (dry world) and/or high temperature
  let desertFraction = 0;
  if (avgTempC > 60) desertFraction += 0.35;
  else if (avgTempC > 40) desertFraction += 0.2;
  else if (avgTempC > 30) desertFraction += 0.1;

  if (hydro <= 1) desertFraction += 0.5;
  else if (hydro <= 2) desertFraction += 0.35;
  else if (hydro <= 3) desertFraction += 0.2;
  else if (hydro <= 4) desertFraction += 0.08;

  // Vacuum and airless worlds are all "desert/wasteland"
  if (isVacuumAtm) desertFraction = 0.9;
  desertFraction = clamp(desertFraction, 0, 0.9);

  // Distinguish baked (very hot) from standard desert
  const isBaked = avgTempC > 50;
  let desertHexes = safeRound(usableLandHexes * desertFraction);

  // -----------------------------------------------------------------------
  // Step 5 — Vegetation: forest and wetland
  // -----------------------------------------------------------------------
  // Exists where temperature and water are both adequate
  const isHabitable = avgTempC >= -10 && avgTempC <= 60 && highTempC > 0;
  const hasVegetation = isHabitable && hydro >= 3 && !isVacuumAtm && !isCorrosiveAtm;

  let forestHexes = 0;
  let wetlandHexes = 0;
  let roughWoodsHexes = 0;
  let wetWoodsHexes = 0;

  if (hasVegetation) {
    // Forest fraction scales with hydro and temperature comfort
    const comfortFactor = avgTempC >= 5 && avgTempC <= 30 ? 1.0 : 0.5;
    const forestFraction = comfortFactor * clamp((hydro - 2) * 0.06, 0, 0.35);
    forestHexes = safeRound(usableLandHexes * forestFraction);
    // Rough woods on mountain flanks
    roughWoodsHexes = safeRound(forestHexes * 0.2);
    forestHexes -= roughWoodsHexes;

    // Wetland only where hydro is high and temperature is comfortable
    if (hydro >= 5 && avgTempC >= 0 && avgTempC <= 35) {
      const wetlandFraction = clamp((hydro - 4) * 0.015, 0, 0.08);
      wetlandHexes = safeRound(usableLandHexes * wetlandFraction);
      // Wet woods adjacent to wetlands
      wetWoodsHexes = safeRound(wetlandHexes * 0.5);
    }
  }

  // -----------------------------------------------------------------------
  // Step 6 — Exotic/hostile land surface (corrosive/unusual atmosphere)
  // -----------------------------------------------------------------------
  let exoticHexes = 0;
  if (isExoticAtm || isCorrosiveAtm) {
    exoticHexes = safeRound(usableLandHexes * 0.15);
  }

  // -----------------------------------------------------------------------
  // Step 7 — Clear / plains as remainder
  // -----------------------------------------------------------------------
  const allocatedLand =
    mountainHexes +
    volcanoHexes +
    roughHexes +
    desertHexes +
    forestHexes +
    roughWoodsHexes +
    wetlandHexes +
    wetWoodsHexes +
    exoticHexes;
  const clearHexes = Math.max(0, usableLandHexes - allocatedLand);

  // -----------------------------------------------------------------------
  // Step 8 — Water terrain breakdown
  // -----------------------------------------------------------------------
  let oceanHexes = 0;
  let shoreHexes = 0;
  let islandHexes = 0;
  let lakeRiverHexes = 0;

  if (totalWaterHexes > 0) {
    // Shore hexes ≈ the coastal boundary band
    const shoreFraction =
      hydro >= 6
        ? 0.1 // ocean-dominated worlds have long coastlines
        : 0.2; // land-dominated worlds have enclosed seas with more shoreline
    shoreHexes = safeRound(totalWaterHexes * shoreFraction);
    // Islands (small land hexes embedded in water)
    const islandFraction = hydro >= 6 ? 0.04 : 0.08;
    islandHexes = safeRound(totalWaterHexes * islandFraction);
    oceanHexes = Math.max(0, totalWaterHexes - shoreHexes - islandHexes);
  }

  // Rivers and lakes are land features independent of ocean coverage
  if (hydro >= 3 && isHabitable && !isVacuumAtm) {
    lakeRiverHexes = safeRound(landHexes * clamp((hydro - 2) * 0.005, 0, 0.04));
  }

  // -----------------------------------------------------------------------
  // Ice breakdown: separate icecap / glacier / ice field / frozen lands
  // -----------------------------------------------------------------------
  const icecapHexes = safeRound(iceHexesOnLand * 0.4);
  const glacierHexes = safeRound(iceHexesOnLand * 0.35);
  const iceFieldHexes = safeRound(iceHexesOnLand * 0.15);
  const frozenLandsHexes = Math.max(0, iceHexesOnLand - icecapHexes - glacierHexes - iceFieldHexes);

  // -----------------------------------------------------------------------
  // Assemble hex counts
  // -----------------------------------------------------------------------
  const hexCounts = [];
  const push = (type, hexes, category) => {
    if (hexes > 0) hexCounts.push({ type, hexes, category });
  };

  // Water
  push("Ocean", oceanHexes, "water");
  push("Shore", shoreHexes, "water");
  push("Islands", islandHexes, "water");
  push("River", safeRound(lakeRiverHexes * 0.5), "water");
  push("Lake", safeRound(lakeRiverHexes * 0.5), "water");

  // Ice
  push("Icecap", icecapHexes, "ice");
  push("Glacier", glacierHexes, "ice");
  push("Ice Field", iceFieldHexes, "ice");
  push("Frozen Lands", frozenLandsHexes, "ice");

  // Elevated / seismic
  push("Mountain", mountainHexes, "elevated");
  push("Rough", roughHexes, "elevated");
  push("Volcano", volcanoHexes, "elevated");

  // Arid
  push(isBaked ? "Baked lands" : "Desert", desertHexes, "arid");

  // Vegetated
  push("Woods", forestHexes, "vegetation");
  push("Rough Woods", roughWoodsHexes, "vegetation");
  push("Wet Woods", wetWoodsHexes, "vegetation");
  push("Wetland", wetlandHexes, "vegetation");

  // Exotic
  push("Exotic", exoticHexes, "exotic");

  // Plains
  push("Clear", clearHexes, "plains");

  // -----------------------------------------------------------------------
  // Total and percent
  // -----------------------------------------------------------------------
  const assignedHexes = hexCounts.reduce((s, e) => s + e.hexes, 0);
  const withPercent = hexCounts.map((e) => ({
    ...e,
    percent: Number(((e.hexes / STANDARD_MAP_HEXES) * 100).toFixed(1)),
  }));

  return {
    totalMapHexes: STANDARD_MAP_HEXES,
    assignedHexes,
    waterHexes: totalWaterHexes,
    landHexes,
    hexCounts: withPercent,
    surfaceProfile: buildSurfaceProfile({
      avgTempC,
      highTempC,
      hydro,
      hydroPct,
      atmCode,
      seismicStress,
      tectonicPlates,
      landIceFraction,
      hasVegetation,
    }),
  };
}

/**
 * Builds a human-readable surface profile summary from the world parameters.
 */
function buildSurfaceProfile({
  avgTempC,
  highTempC,
  hydro,
  hydroPct,
  atmCode,
  seismicStress,
  tectonicPlates,
  landIceFraction,
  hasVegetation,
}) {
  const notes = [];

  // Water character
  if (hydroPct >= 80) notes.push("Aquatic world — mostly ocean, few continents");
  else if (hydroPct >= 60) notes.push("Ocean-dominated world with sizeable continents");
  else if (hydroPct >= 40) notes.push("Mixed land and ocean");
  else if (hydroPct >= 20) notes.push("Primarily land, with seas and lakes");
  else if (hydroPct > 0) notes.push("Arid world — only traces of surface liquid");
  else notes.push("Waterless surface");

  // Temperature character
  if (avgTempC <= -50) notes.push("Deeply frozen world");
  else if (highTempC <= 0) notes.push("Permanent global glaciation");
  else if (landIceFraction >= 0.4) notes.push("Extensive polar glaciation");
  else if (landIceFraction >= 0.1) notes.push("Significant polar ice caps");
  else if (avgTempC > 60) notes.push("Extreme heat — much of the surface is baked or barren");
  else if (avgTempC > 40) notes.push("Very hot surface, widespread desert");
  else if (avgTempC >= 5 && avgTempC <= 30) notes.push("Temperate climate band present");

  // Seismics
  if (seismicStress > 100)
    notes.push(`Highly active geology — ${tectonicPlates} tectonic plates, active volcanism and mountain-building`);
  else if (seismicStress >= 20)
    notes.push(`Active geology — ${tectonicPlates} tectonic plates, significant mountain ranges`);
  else if (seismicStress >= 5) notes.push(`Moderate seismic activity — some mountain terrain`);
  else if (seismicStress > 0) notes.push("Mostly stable geology, residual seismics");
  else notes.push("Geologically dead — no active tectonics");

  // Vegetation
  if (hasVegetation && hydro >= 6 && avgTempC >= 5 && avgTempC <= 30)
    notes.push("Broad vegetated regions likely — forests and grasslands");
  else if (hasVegetation && hydro >= 4) notes.push("Some vegetation — patchy forests and grasslands");
  else if (hasVegetation) notes.push("Sparse vegetation where conditions allow");
  else notes.push("No surface vegetation (conditions too extreme or lacking liquid water)");

  // Atmosphere notes
  if (VACUUM_ATM_CODES.has(atmCode)) notes.push("Airless or near-vacuum surface");
  else if (CORROSIVE_ATM_CODES.has(atmCode)) notes.push("Corrosive atmosphere shapes exotic surface chemistry");
  else if (EXOTIC_ATM_CODES.has(atmCode)) notes.push("Unusual atmosphere — exotic surface conditions");

  return notes;
}

/**
 * Returns the CSS/display category label for a terrain entry.
 */
export const TERRAIN_CATEGORY_LABELS = {
  water: "Water",
  ice: "Ice & Glaciers",
  elevated: "Mountains & Elevation",
  arid: "Arid & Desert",
  vegetation: "Vegetation",
  exotic: "Exotic",
  plains: "Plains",
};
