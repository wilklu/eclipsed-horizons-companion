export function generateSectorSystems(galaxyData, sectorCoordinates) {
  /**
   * Generate all systems in a sector based on density
   */

  const sectorDensity = getSectorDensity(galaxyData, sectorCoordinates);
  const systems = [];

  // For each hex in the sector (1-32 columns, 1-40 rows)
  for (let col = 1; col <= 32; col++) {
    for (let row = 1; row <= 40; row++) {
      // Roll for system presence based on density
      const roll = rollDice(sectorDensity.diceType);

      if (roll <= sectorDensity.rollTarget) {
        // System is present
        const system = generateSystem(galaxyData, {
          sectorCoordinates,
          hexCoordinates: { x: col, y: row },
          localDensity: getSectorDensity(galaxyData, sectorCoordinates),
        });

        systems.push(system);
      }
    }
  }

  return {
    sectorCoordinates,
    systems,
    systemCount: systems.length,
    expectedSystemCount: sectorDensity.systemsPerSector,
    variance: systems.length - sectorDensity.systemsPerSector,
  };
}
