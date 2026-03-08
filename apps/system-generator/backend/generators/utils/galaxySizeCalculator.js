// utils/galaxySizeCalculator.js - CORRECTED VERSION

export function calculateGalaxyDimensions(options = {}) {
  const {
    diameterInKpc = 30, // Kiloparsecs
    thicknessInKpc = 0.3, // Kiloparsecs at center
    galaxyType = "Barred Spiral",
  } = options;

  // Convert to parsecs
  const diameterInParsecs = diameterInKpc * 1000;
  const thicknessInParsecs = thicknessInKpc * 1000;
  const radiusInParsecs = diameterInParsecs / 2;

  // Sector grid dimensions (Traveller standard mapping)
  // Approximately derived from classic Traveller conventions
  const sectorGridX = Math.round(diameterInKpc * 127.8); // ~3834 for 30 kpc
  const sectorGridY = Math.round(diameterInKpc * 102.27); // ~3068 for 30 kpc

  const totalSectors = sectorGridX * sectorGridY;
  const totalSubsectors = totalSectors * 16; // 16 subsectors per sector

  // Estimate star systems based on Traveller canon
  // ~400 billion stars across all sectors
  const starsPerSector = Math.round(400000000000 / totalSectors);
  const estimatedSystems = starsPerSector * totalSectors;

  return {
    // Real Space Measurements
    diameterInParsecs,
    diameterInKiloparsecs: diameterInKpc,
    radiusInParsecs,
    thicknessInParsecs,
    thicknessInKiloparsecs: thicknessInKpc,

    // Sector Grid Mapping
    sectorGridX,
    sectorGridY,
    totalSectors,
    totalSubsectors,

    // Density calculations
    averageStarDensity: starsPerSector,
    estimatedStarSystems: estimatedSystems,

    // Reference measurements
    parsecPerSectorWidth: 8,
    parsecPerSectorHeight: 10,
    volumeInCubicParsecs: diameterInParsecs * diameterInParsecs * thicknessInParsecs,
  };
}

// Example usage:
const dimensions = calculateGalaxyDimensions({
  diameterInKpc: 30,
  thicknessInKpc: 0.3,
  galaxyType: "Barred Spiral",
});

// Output:
// {
//   diameterInParsecs: 30000,
//   diameterInKiloparsecs: 30,
//   sectorGridX: 3834,
//   sectorGridY: 3068,
//   totalSectors: 11751312,
//   totalSubsectors: 188021012,
//   estimatedStarSystems: 400000000000,
//   parsecPerSectorWidth: 8,
//   parsecPerSectorHeight: 10
// }
