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
  generateIISSProfile,
  parseIISSProfile,
};
