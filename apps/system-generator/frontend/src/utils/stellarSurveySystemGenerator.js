import { generateObjectName } from "./nameGenerator.js";
import { generateAutomaticWorldName } from "./worldProfileGenerator.js";
import { buildProfiledWbhSystemPlanets, calculateSystemHabitableZone } from "./systemWorldGeneration.js";
import { resolveGeneratedStarsFromHex, resolveStarRecord } from "./systemStarMetadata.js";

function buildSurveySystemShell({
  galaxyId,
  sectorId,
  hex,
  stars,
  primary,
  companionStars,
  anomalyType,
  error = null,
}) {
  const nowIso = new Date().toISOString();
  return {
    systemId: `${sectorId}:${String(hex?.coord || "0000").trim()}`,
    galaxyId,
    sectorId,
    hexCoordinates: {
      x: Number(String(hex?.coord || "0000").slice(0, 2)) || 0,
      y: Number(String(hex?.coord || "0000").slice(2, 4)) || 0,
    },
    starCount: stars.length,
    stars,
    primaryStar: primary,
    companionStars,
    habitableZone: null,
    planets: [],
    mainworld: null,
    mainworldName: "",
    mainworldType: "",
    mainworldParentWorldName: "",
    mainworldUwp: "",
    nativeLifeform: "",
    habitability: "",
    resourceRating: "",
    minimumSustainableTechLevel: null,
    populationConcentration: null,
    urbanization: null,
    majorCities: null,
    governmentProfile: null,
    justiceProfile: null,
    lawProfile: null,
    appealProfile: null,
    privateLawProfile: null,
    personalRightsProfile: null,
    factionsProfile: null,
    tradeCodes: [],
    mainworldRemarks: [],
    metadata: {
      generatedSurvey: {
        stars,
        anomalyType,
        legacyReconstructed: Boolean(hex?.legacyReconstructed),
        legacyHierarchyUnknown: Boolean(hex?.legacyHierarchyUnknown),
      },
      anomalyType,
      legacyReconstructed: Boolean(hex?.legacyReconstructed),
      legacyHierarchyUnknown: Boolean(hex?.legacyHierarchyUnknown),
      generatedWorldProfilesAt: nowIso,
      lastModified: nowIso,
      generationError: error ? String(error) : null,
      generatedWorldProfilesIncomplete: Boolean(error),
    },
  };
}

export function buildPersistedSurveySystemFromHex({ galaxyId, sectorId, hex, namingOptions = {} }) {
  const stars = resolveGeneratedStarsFromHex(hex);
  const primary = stars[0] ?? resolveStarRecord(hex?.anomalyType || hex?.starType || "G2V");
  const companionStars = stars.slice(1).map((star) => ({ ...star }));
  const anomalyType =
    hex?.anomalyType ??
    (primary?.isAnomaly
      ? String(hex?.starType || primary?.spectralClass || primary?.designation || "").trim() || null
      : null);
  const legacyReconstructed = Boolean(hex?.legacyReconstructed);
  const legacyHierarchyUnknown = Boolean(hex?.legacyHierarchyUnknown);
  const lineageSeed = `${sectorId}:${String(hex?.coord || "0000").trim()}`;
  let habitableZone = null;
  let planets = [];
  let mainworld = null;
  let generationError = null;

  try {
    habitableZone = calculateSystemHabitableZone(stars);
    planets = buildProfiledWbhSystemPlanets({
      stars,
      habitableZone,
      createPlanetName: ({ type, usedNames, index }) =>
        type === "Planetoid Belt"
          ? generateObjectName({
              mode: String(namingOptions.asteroidBeltNameMode || "phonotactic")
                .trim()
                .toLowerCase(),
              objectType: "asteroid-belt",
              mythicTheme: String(namingOptions.galaxyMythicTheme || "all")
                .trim()
                .toLowerCase(),
              lineageSeed,
              seed: `${lineageSeed}:belt:${index}`,
              parentName: String(hex?.coord || "").trim(),
            })
          : generateAutomaticWorldName({
              mode: namingOptions.worldNameMode,
              usedNames,
              systemName: String(hex?.coord || "").trim(),
              seed: `${lineageSeed}:world:${index}`,
            }),
    });
    mainworld = planets.find((world) => world?.isMainworld) ?? null;
  } catch (error) {
    generationError = error instanceof Error ? error.message : String(error || "Unknown system generation error");
  }

  if (generationError) {
    return buildSurveySystemShell({
      galaxyId,
      sectorId,
      hex,
      stars,
      primary,
      companionStars,
      anomalyType,
      error: generationError,
    });
  }

  const nowIso = new Date().toISOString();

  return {
    systemId: `${sectorId}:${String(hex?.coord || "0000").trim()}`,
    galaxyId,
    sectorId,
    hexCoordinates: {
      x: Number(String(hex?.coord || "0000").slice(0, 2)) || 0,
      y: Number(String(hex?.coord || "0000").slice(2, 4)) || 0,
    },
    starCount: stars.length,
    stars,
    primaryStar: primary, // Always full star object
    companionStars: companionStars,
    habitableZone,
    planets,
    mainworld,
    mainworldName: mainworld?.name ?? "",
    mainworldType: mainworld?.isMoon ? "Moon" : (mainworld?.type ?? ""),
    mainworldParentWorldName: mainworld?.parentWorldName ?? "",
    mainworldUwp: mainworld?.uwp ?? "",
    nativeLifeform: mainworld?.nativeLifeform ?? "",
    habitability: mainworld?.habitability ?? "",
    resourceRating: mainworld?.resourceRating ?? "",
    minimumSustainableTechLevel:
      mainworld?.minimumSustainableTechLevel && typeof mainworld.minimumSustainableTechLevel === "object"
        ? { ...mainworld.minimumSustainableTechLevel }
        : null,
    populationConcentration:
      mainworld?.populationConcentration && typeof mainworld.populationConcentration === "object"
        ? { ...mainworld.populationConcentration }
        : null,
    urbanization:
      mainworld?.urbanization && typeof mainworld.urbanization === "object" ? { ...mainworld.urbanization } : null,
    majorCities:
      mainworld?.majorCities && typeof mainworld.majorCities === "object" ? { ...mainworld.majorCities } : null,
    governmentProfile:
      mainworld?.governmentProfile && typeof mainworld.governmentProfile === "object"
        ? { ...mainworld.governmentProfile }
        : null,
    justiceProfile:
      mainworld?.justiceProfile && typeof mainworld.justiceProfile === "object"
        ? { ...mainworld.justiceProfile }
        : null,
    lawProfile: mainworld?.lawProfile && typeof mainworld.lawProfile === "object" ? { ...mainworld.lawProfile } : null,
    appealProfile:
      mainworld?.appealProfile && typeof mainworld.appealProfile === "object" ? { ...mainworld.appealProfile } : null,
    privateLawProfile:
      mainworld?.privateLawProfile && typeof mainworld.privateLawProfile === "object"
        ? { ...mainworld.privateLawProfile }
        : null,
    personalRightsProfile:
      mainworld?.personalRightsProfile && typeof mainworld.personalRightsProfile === "object"
        ? { ...mainworld.personalRightsProfile }
        : null,
    factionsProfile:
      mainworld?.factionsProfile && typeof mainworld.factionsProfile === "object"
        ? { ...mainworld.factionsProfile }
        : null,
    tradeCodes: Array.isArray(mainworld?.tradeCodes) ? [...mainworld.tradeCodes] : [],
    mainworldRemarks: Array.isArray(mainworld?.remarks) ? [...mainworld.remarks] : [],
    metadata: {
      generatedSurvey: {
        stars,
        anomalyType,
        legacyReconstructed,
        legacyHierarchyUnknown,
      },
      anomalyType,
      legacyReconstructed,
      legacyHierarchyUnknown,
      generatedWorldProfilesAt: nowIso,
      lastModified: nowIso,
    },
  };
}
