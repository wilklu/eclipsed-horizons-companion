import { lookupHZCO } from "./worldGenerator.js";

/**
 * IISS Star System Profile Generator
 *
 * Generates IISS (Interstellar Institute of Spacefaring Sciences) shorthand profiles
 * for star systems in the format specified by Traveller 5.
 *
 * Single Star Profile: #-T# C-M-D-L-A
 * Multi-Star Profile: #-T# C-M-D-L-A:D-O-E-T# C-M-D-L:D-O-E-T#...
 *
 * Where:
 *  # = Number of stars (often omitted if 1)
 *  T# = Spectral type and subtype (e.g., G2V)
 *  C = Luminosity class (main component of spectral class, e.g., V for main sequence)
 *  M = Mass in solar masses
 *  D = Diameter in solar diameters
 *  L = Luminosity in solar luminosities
 *  A = System age in Gyrs
 *
 * For companion stars:
 *  D = Designation letter(s) (e.g., B, Ab, Cab)
 *  O = Orbit number
 *  E = Eccentricity
 */

/**
 * Rounds a numeric value to 2 decimal places for profile compactness
 * @param {number} value - The value to round
 * @returns {string} - The rounded value as a string
 */
function roundProfile(value) {
  if (!Number.isFinite(value)) return "0";
  return (Math.round(value * 100) / 100).toString();
}

/**
 * Extracts the luminosity class from a spectral class string
 * Luminosity classes: Ia, Ib, II, III, IV, V (most common), VI, D (degenerate)
 * @param {string} spectralClass - The full spectral class (e.g., "G2 V")
 * @returns {string} - The luminosity class (e.g., "V")
 */
function extractLuminosityClass(spectralClass) {
  if (!spectralClass) return "";

  const normalized = String(spectralClass).trim().toUpperCase();

  // Check for explicit luminosity class
  const matches = normalized.match(/(IA|IB|II|III|IV|V|VI|D|WD)/);
  if (matches) return matches[1];

  // Default to main sequence for unknown formats
  return "V";
}

/**
 * Formats a single star profile component
 * @param {Object} star - The star object with spectral class, mass, diameter, luminosity
 * @param {number} ageGyr - System age in Gyrs (only included for primary star)
 * @param {boolean} isPrimary - Whether this is the primary star
 * @returns {string} - The formatted profile component
 */
function formatStarProfile(star, ageGyr, isPrimary = false) {
  if (!star) return "";

  const spectral = String(star.spectralClass || star.designation || "G2V").trim();
  const lumClass = extractLuminosityClass(spectral);
  const mass = roundProfile(star.massInSolarMasses ?? 1);
  const diameter = roundProfile(star.diameterInSolarDiameters ?? 1);
  const luminosity = roundProfile(star.luminosity ?? 1);

  let profile = `${spectral}-${lumClass}-${mass}-${diameter}-${luminosity}`;

  // Add age only for primary star
  if (isPrimary && Number.isFinite(ageGyr)) {
    profile += `-${roundProfile(ageGyr)}`;
  }

  return profile;
}

/**
 * Formats a companion star profile component
 * @param {Object} star - The companion star object
 * @param {string} designation - The star's system designation (e.g., "B", "Ab")
 * @param {number} orbitNumber - The orbit number
 * @param {number} eccentricity - The orbital eccentricity
 * @returns {string} - The formatted companion profile component
 */
function formatCompanionProfile(star, designation, orbitNumber, eccentricity) {
  if (!star) return "";

  const des = String(designation || "").trim();
  const orbit = Number.isFinite(orbitNumber) ? String(Math.round(orbitNumber)) : "0";
  const ecc = roundProfile(eccentricity ?? 0);

  const spectral = String(star.spectralClass || star.designation || "G2V").trim();
  const lumClass = extractLuminosityClass(spectral);
  const mass = roundProfile(star.massInSolarMasses ?? 1);
  const diameter = roundProfile(star.diameterInSolarDiameters ?? 1);
  const luminosity = roundProfile(star.luminosity ?? 1);

  return `${des}-${orbit}-${ecc}-${spectral}-${lumClass}-${mass}-${diameter}-${luminosity}`;
}

/**
 * Build a compact IISS-style note for gas giant sizing metadata.
 *
 * Format: GG-<SAH>-<D#>-<M#>
 * Example: GG-GMB-D11-M340
 *
 * @param {{
 *   sourceType?: string,
 *   type?: string,
 *   sizeCode?: string,
 *   gasGiantCategoryCode?: string,
 *   gasGiantDiameterCode?: string,
 *   gasGiantDiameterTerran?: number,
 *   gasGiantMassEarth?: number
 * }} [world]
 * @returns {string}
 */
export function formatIISSGasGiantNote(world) {
  const sourceType = String(world?.sourceType ?? world?.type ?? "")
    .trim()
    .toLowerCase();

  const isGasGiant = sourceType === "gasgiant" || sourceType === "gas giant" || sourceType === "gas_giant";

  const rawSizeCode = String(world?.sizeCode ?? "")
    .trim()
    .toUpperCase();
  const sizeMatch = rawSizeCode.match(/^G([SML])([0-9A-HJ-NP-Z])$/);

  const categoryCode = String(world?.gasGiantCategoryCode ?? (sizeMatch ? `G${sizeMatch[1]}` : ""))
    .trim()
    .toUpperCase();
  const diameterCode = String(world?.gasGiantDiameterCode ?? (sizeMatch ? sizeMatch[2] : ""))
    .trim()
    .toUpperCase();

  const diameterTerran = Number(world?.gasGiantDiameterTerran);
  const massEarth = Number(world?.gasGiantMassEarth);

  const sahCode = sizeMatch ? rawSizeCode : categoryCode && diameterCode ? `${categoryCode}${diameterCode}` : "";
  const hasDiameter = Number.isFinite(diameterTerran) && diameterTerran > 0;
  const hasMass = Number.isFinite(massEarth) && massEarth > 0;

  if (!isGasGiant && !sahCode && !hasDiameter && !hasMass) {
    return "";
  }

  const parts = ["GG"];

  if (sahCode) {
    parts.push(sahCode);
  }

  if (hasDiameter) {
    parts.push(`D${Math.round(diameterTerran)}`);
  }

  if (hasMass) {
    parts.push(`M${Math.round(massEarth)}`);
  }

  return parts.join("-");
}

const EHEX_DIGITS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function toEhexCount(value) {
  const count = Math.max(0, Math.floor(Number(value) || 0));
  if (count < EHEX_DIGITS.length) {
    return EHEX_DIGITS[count];
  }
  return String(count);
}

function normalizePlanetarySpread(worldPlacement) {
  const roundedSpread = Number(worldPlacement?.steps?.step5?.roundedSpread);
  if (Number.isFinite(roundedSpread)) {
    return roundProfile(roundedSpread);
  }

  const spread = Number(worldPlacement?.steps?.step5?.spread);
  if (Number.isFinite(spread)) {
    return roundProfile(spread);
  }

  return "0";
}

function normalizePlanetaryBaseline(worldPlacement) {
  const baselineNumber = Number(worldPlacement?.steps?.step2?.baselineNumber);
  if (!Number.isFinite(baselineNumber)) {
    return 0;
  }
  return Math.max(0, Math.floor(baselineNumber));
}

function normalizePlanetarySourceType(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function mapPlanetaryWorldToken(planet) {
  const sourceType = normalizePlanetarySourceType(planet?.sourceType ?? planet?.type);
  const hasMainworldSecondary =
    planet?.hasMainworldSecondary === true ||
    (Array.isArray(planet?.secondaryWorldTypes) && planet.secondaryWorldTypes.includes("mainworld"));

  if (hasMainworldSecondary) {
    if (sourceType === "gasgiant" || sourceType === "gas giant" || sourceType === "gas_giant") {
      return "GM";
    }
    if (sourceType === "planetoidbelt" || sourceType === "planetoid belt" || sourceType === "planetoid_belt") {
      return "PM";
    }
    return "M";
  }

  if (sourceType === "mainworld") {
    return "M";
  }

  if (sourceType === "gasgiant" || sourceType === "gas giant" || sourceType === "gas_giant") {
    return "G";
  }

  if (sourceType === "planetoidbelt" || sourceType === "planetoid belt" || sourceType === "planetoid_belt") {
    return "P";
  }

  if (
    sourceType === "terrestrialplanet" ||
    sourceType === "terrestrial planet" ||
    sourceType === "terrestrial_planet"
  ) {
    return "T";
  }

  return null;
}

function resolvePrimaryProfileDesignation(stars = []) {
  const primary = stars[0] ?? null;
  return (
    String(primary?.systemDesignationCombined ?? primary?.systemDesignation ?? primary?.designation ?? "A").trim() ||
    "A"
  );
}

function resolveSegmentDesignation(planet, primaryDesignation) {
  const label = String(planet?.parentDesignation ?? "").trim();
  if (label) {
    return label;
  }
  return primaryDesignation;
}

function resolveSegmentHzcoOrbit({ stars = [], starKey, fallbackOrbit }) {
  let star = null;

  if (starKey === "primary") {
    star = stars[0] ?? null;
  } else {
    const match = String(starKey ?? "").match(/^secondary-(\d+)$/);
    if (match) {
      const index = Number.parseInt(match[1], 10);
      if (Number.isFinite(index) && index >= 1) {
        star = stars[index] ?? null;
      }
    }
  }

  if (star) {
    const spectralClass = star.spectralClass ?? star.designation ?? "";
    const luminosityClass = star.luminosityClass ?? extractLuminosityClass(spectralClass);
    const hzco = lookupHZCO(spectralClass, luminosityClass);
    if (Number.isFinite(hzco)) {
      return hzco;
    }
  }

  if (Number.isFinite(fallbackOrbit)) {
    return fallbackOrbit;
  }

  return null;
}

function calculateSegmentBaselineFromWorlds(worlds, hzcoOrbit, fallbackBaseline) {
  if (!Array.isArray(worlds) || worlds.length === 0) {
    return 0;
  }

  const finiteWorlds = worlds.filter((world) => Number.isFinite(world?.orbitNumber));
  if (finiteWorlds.length === 0) {
    return Math.max(0, Math.floor(Number(fallbackBaseline) || 0));
  }

  if (!Number.isFinite(hzcoOrbit)) {
    return Math.max(0, Math.floor(Number(fallbackBaseline) || 0));
  }

  const allOutside = finiteWorlds.every((world) => world.orbitNumber > hzcoOrbit);
  if (allOutside) {
    return 0;
  }

  const allInside = finiteWorlds.every((world) => world.orbitNumber < hzcoOrbit);
  if (allInside) {
    return finiteWorlds.length;
  }

  let bestIndex = 0;
  let bestDelta = Number.POSITIVE_INFINITY;

  finiteWorlds.forEach((world, index) => {
    const delta = Math.abs(world.orbitNumber - hzcoOrbit);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });

  return bestIndex + 1;
}

/**
 * Generates a short planetary system profile: G-P-T-N-S
 * G/P/T are encoded as eHex quantities.
 *
 * @param {{ worldPlacement?: object }} [options]
 * @returns {string}
 */
export function generatePlanetarySystemShortProfile({ worldPlacement } = {}) {
  const counts = worldPlacement?.counts ?? {};
  const postAnomalyCounts = counts.afterAnomalies ?? {};

  const gasGiants = postAnomalyCounts.gasGiantCount ?? counts.gasGiants ?? 0;
  const planetoidBelts = postAnomalyCounts.planetoidBeltCount ?? counts.planetoidBelts ?? 0;
  const terrestrialPlanets = postAnomalyCounts.terrestrialPlanetCount ?? counts.terrestrialPlanets ?? 0;

  const baseline = normalizePlanetaryBaseline(worldPlacement);
  const spread = normalizePlanetarySpread(worldPlacement);

  return `${toEhexCount(gasGiants)}-${toEhexCount(planetoidBelts)}-${toEhexCount(terrestrialPlanets)}-${baseline}-${spread}`;
}

/**
 * Generates a long planetary system profile: St-N-W...-S
 * Multi-parent segments are separated by colons.
 *
 * @param {{ planets?: Array<object>, stars?: Array<object>, worldPlacement?: object }} [options]
 * @returns {string}
 */
export function generatePlanetarySystemLongProfile({ planets = [], stars = [], worldPlacement } = {}) {
  if (!Array.isArray(planets) || planets.length === 0) {
    return "";
  }

  const spread = normalizePlanetarySpread(worldPlacement);
  const fallbackBaseline = normalizePlanetaryBaseline(worldPlacement);
  const fallbackHzcoOrbit = Number(worldPlacement?.steps?.step3?.baselineOrbit);
  const primaryDesignation = resolvePrimaryProfileDesignation(stars);

  const segmentMap = new Map();

  planets.forEach((planet) => {
    const token = mapPlanetaryWorldToken(planet);
    if (!token) {
      return;
    }

    const designation = resolveSegmentDesignation(planet, primaryDesignation);
    const starKey = String(planet?.starKey ?? "primary");
    const key = `${designation}|${starKey}`;

    if (!segmentMap.has(key)) {
      segmentMap.set(key, {
        designation,
        starKey,
        worlds: [],
      });
    }

    segmentMap.get(key).worlds.push({
      orbitNumber: Number(planet?.orbitNumber),
      token,
    });
  });

  const segments = [];

  for (const segment of segmentMap.values()) {
    const orderedWorlds = segment.worlds
      .filter((world) => Number.isFinite(world.orbitNumber))
      .sort((a, b) => a.orbitNumber - b.orbitNumber);

    if (orderedWorlds.length === 0) {
      continue;
    }

    const hzcoOrbit = resolveSegmentHzcoOrbit({
      stars,
      starKey: segment.starKey,
      fallbackOrbit: fallbackHzcoOrbit,
    });

    const baseline = calculateSegmentBaselineFromWorlds(orderedWorlds, hzcoOrbit, fallbackBaseline);
    const worldTokens = orderedWorlds.map((world) => world.token);
    segments.push(`${segment.designation}-${baseline}-${worldTokens.join("-")}-${spread}`);
  }

  return segments.join(":");
}

/**
 * Generates both planetary profile forms from system survey data.
 *
 * @param {{ planets?: Array<object>, stars?: Array<object>, worldPlacement?: object }} [options]
 * @returns {{ shortProfile: string, longProfile: string }}
 */
export function generatePlanetarySystemProfiles({ planets = [], stars = [], worldPlacement } = {}) {
  return {
    shortProfile: generatePlanetarySystemShortProfile({ worldPlacement }),
    longProfile: generatePlanetarySystemLongProfile({ planets, stars, worldPlacement }),
  };
}

/**
 * Generates an IISS shorthand profile for a star system
 *
 * @param {Object} system - The generated system object with stars array and metadata
 * @returns {string} - The IISS profile string
 */
export function generateIISSProfile(system) {
  if (!system || !Array.isArray(system.stars) || system.stars.length === 0) {
    return "";
  }

  const stars = system.stars;
  const starCount = stars.length;
  const metadata = system.metadata || {};
  const survey = metadata.generatedSurvey || {};

  // Determine system age (use primary star age or estimate from metadata)
  const primaryAge = system.ageGyr ?? survey.primaryStar?.ageGyr ?? 5;

  // Primary star profile
  const primaryProfile = formatStarProfile(stars[0], primaryAge, true);

  if (starCount === 1) {
    // Single star: optionally include star count (often omitted)
    return primaryProfile;
  }

  // Multi-star system: include companion profiles
  const profiles = [primaryProfile];

  for (let i = 1; i < stars.length; i++) {
    const star = stars[i];
    const designation = star.systemDesignation ?? star.designation ?? String.fromCharCode(64 + i);
    const orbitNum = star.stellarOrbitNumber ?? i - 1;
    const eccentricity = star.stellarOrbitEccentricity ?? 0;

    const companionProfile = formatCompanionProfile(star, designation, orbitNum, eccentricity);
    if (companionProfile) {
      profiles.push(companionProfile);
    }
  }

  // Join with colons separating primary from companions
  if (profiles.length === 1) {
    return profiles[0];
  }

  return profiles[0] + ":" + profiles.slice(1).join(":");
}

/**
 * Parses an IISS profile string back into structured data
 * Useful for loading previously exported profiles
 *
 * @param {string} profileString - The IISS profile to parse
 * @returns {Object} - Parsed profile data with primary and companion arrays
 */
export function parseIISSProfile(profileString) {
  if (!profileString || typeof profileString !== "string") {
    return { primary: null, companions: [] };
  }

  const parts = profileString.split(":");
  if (parts.length === 0) return { primary: null, companions: [] };

  // Parse primary (first component)
  const primaryFields = parts[0].split("-");

  // Extract spectral type - may contain spaces (e.g., "G2 V" or just "G2V")
  let spectral = primaryFields[0] || "G2V";
  let lumClass = primaryFields[1] || "V";

  // If spectral contains both type and class (e.g., "G2 V"), split them
  if (spectral && spectral.includes(" ")) {
    const [spec, lum] = spectral.split(" ");
    spectral = spec;
    lumClass = lum || lumClass;
  }

  const primary = {
    spectral: spectral,
    lumClass: lumClass,
    mass: parseFloat(primaryFields[2]) || 1,
    diameter: parseFloat(primaryFields[3]) || 1,
    luminosity: parseFloat(primaryFields[4]) || 1,
    age: parseFloat(primaryFields[5]) || 5,
  };

  // Parse companions (remaining components)
  const companions = [];
  for (let i = 1; i < parts.length; i++) {
    const compFields = parts[i].split("-");

    // Extract companion spectral type similar to primary
    let compSpectral = compFields[3] || "G2V";
    let compLumClass = compFields[4] || "V";

    if (compSpectral && compSpectral.includes(" ")) {
      const [spec, lum] = compSpectral.split(" ");
      compSpectral = spec;
      compLumClass = lum || compLumClass;
    }

    companions.push({
      designation: compFields[0] || "B",
      orbit: parseInt(compFields[1]) || 0,
      eccentricity: parseFloat(compFields[2]) || 0,
      spectral: compSpectral,
      lumClass: compLumClass,
      mass: parseFloat(compFields[5]) || 1,
      diameter: parseFloat(compFields[6]) || 1,
      luminosity: parseFloat(compFields[7]) || 1,
    });
  }

  return { primary, companions };
}

export default {
  formatIISSGasGiantNote,
  generateIISSProfile,
  parseIISSProfile,
  generatePlanetarySystemShortProfile,
  generatePlanetarySystemLongProfile,
  generatePlanetarySystemProfiles,
};
