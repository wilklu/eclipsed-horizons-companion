// utils/sectorDensityMap.js

export function getSectorDensity(galaxyData, sectorCoordinates) {
  /**
   * Returns the overall density classification for a sector
   * This is used to determine how many systems appear in that sector
   */

  const { x, y } = sectorCoordinates;
  const { sectorGridX, sectorGridY } = galaxyData.galaxyDimensions;

  // Calculate galactic density at sector center
  const sectorCenterInParsecs = {
    x: x * 8 + 4, // 8 parsecs per sector, +4 for center
    y: y * 10 + 5, // 10 parsecs per sector, +5 for center
  };

  // Use the galaxy density calculator
  const densityClassification = calculateSectorDensity(galaxyData, sectorCenterInParsecs);

  const densityData = TRAVELLER_DENSITIES[densityClassification];

  return {
    sectorCoordinates: { x, y },
    densityClassification,
    systemsPerSector: densityData.systemsPer1280,
    percentDensity: densityData.percentage,
    rollTarget: densityData.rollTarget,
    diceType: densityData.diceType,
    estimatedSystems: densityData.systemsPer1280,
    description: getDensityDescription(densityClassification),
  };
}

function getDensityDescription(density) {
  const descriptions = {
    "Extra Galactic": "Beyond the rim of the Galaxy. Star systems are rare.",
    Rift: "A gap or void of stars. Barrier to Jump travel.",
    Sparse: "Fewer star systems than most locations.",
    Scattered: "Fewer systems than many regions.",
    Standard: "Typical or average density.",
    Dense: "Greater population of star systems.",
    Cluster: "Densely packed with star systems (stellar cluster).",
    Core: "Densely packed at galactic core. Multiple systems per hex.",
  };
  return descriptions[density] || "Unknown";
}

// USAGE EXAMPLE:
const sectorInfo = getSectorDensity(galaxyData, { x: 1200, y: 1500 });
console.log(sectorInfo);
// Output:
// {
//   sectorCoordinates: { x: 1200, y: 1500 },
//   densityClassification: "Dense",
//   systemsPerSector: 840,
//   percentDensity: 66,
//   rollTarget: "4 or less (1D)",
//   diceType: "1D",
//   estimatedSystems: 840,
//   description: "Greater population of star systems."
// }
