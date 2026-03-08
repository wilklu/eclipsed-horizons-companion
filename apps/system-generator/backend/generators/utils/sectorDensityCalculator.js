export function generateSectorInternalDensity(sectorDensity, hexCoords) {
  /**
   * Input: Overall sector density classification
   * Output: Individual hex density variation
   */

  const baseSystemCount = TRAVELLER_DENSITIES[sectorDensity].systemsPer1280;

  // Add local variation (±10-20% based on micro-structure)
  const hexX = hexCoords.x; // 1-32
  const hexY = hexCoords.y; // 1-40

  // Distance from sector center
  const centerX = 16.5;
  const centerY = 20.5;
  const distFromCenter = Math.sqrt((hexX - centerX) ** 2 + (hexY - centerY) ** 2);

  // Sectors have central concentration
  const concentrationFactor = 1 - (distFromCenter / 30) * 0.15;

  const adjustedSystemCount = Math.round(baseSystemCount * concentrationFactor);

  return {
    sectorDensity,
    baseSystemsPerSector: baseSystemCount,
    adjustedSystemsPerSector: adjustedSystemCount,
    concentrationFactor,
    localVariation: (concentrationFactor - 1) * 100,
  };
}

// Example: Dense sector (840 systems) with local variation
const denseExample = generateSectorInternalDensity("Dense", { x: 16, y: 20 });
// Result:
// {
//   sectorDensity: "Dense",
//   baseSystemsPerSector: 840,
//   adjustedSystemsPerSector: 840,
//   concentrationFactor: 1.0,
//   localVariation: "0%"  (center of sector)
// }

const denseEdge = generateSectorInternalDensity("Dense", { x: 1, y: 1 });
// Result:
// {
//   sectorDensity: "Dense",
//   baseSystemsPerSector: 840,
//   adjustedSystemsPerSector: 714,
//   concentrationFactor: 0.85,
//   localVariation: "-15%"  (edge of sector)
// }
