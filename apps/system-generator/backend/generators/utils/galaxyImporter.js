// utils/galaxyImporter.js

export async function importGalaxy(existingGalaxyData, targetUniverse) {
  const importSession = {
    originalGalaxyId: existingGalaxyData.galaxyId,
    newGalaxyId: generateNewGalaxyId(targetUniverse),
    idRemappingTable: {},
    errors: [],
    warnings: [],
    processedItems: 0,
  };

  try {
    // Step 1: Validate import data
    validateGalaxyImport(existingGalaxyData);

    // Step 2: Remap Galaxy ID
    const remappedGalaxy = remapGalaxyId(existingGalaxyData, importSession.newGalaxyId);
    importSession.idRemappingTable.galaxyId = {
      old: existingGalaxyData.galaxyId,
      new: importSession.newGalaxyId,
    };

    // Step 3: Adjust coordinates based on target position
    const adjustedGalaxy = adjustGalaxyCoordinates(
      remappedGalaxy,
      targetUniverse.userCoordinates || { x: 0, y: 0, z: 0 },
    );

    // Step 4: Remap all linked sectors
    if (adjustedGalaxy.linkedSectors && adjustedGalaxy.linkedSectors.length) {
      adjustedGalaxy.linkedSectors = remapSectorIds(adjustedGalaxy.linkedSectors, importSession.idRemappingTable);
    }

    // Step 5: Mark as imported
    adjustedGalaxy.importMetadata = {
      isImported: true,
      sourceGalaxy: existingGalaxyData.galaxyName[0].name,
      originalGalaxyId: existingGalaxyData.galaxyId,
      idRemappingTable: importSession.idRemappingTable,
      importedAt: new Date().toISOString(),
      importNotes: `Imported from external galaxy. Original ID: ${existingGalaxyData.galaxyId}`,
    };

    // Step 6: Validate remapped data
    const validationResult = validateRemappedGalaxy(adjustedGalaxy);
    if (!validationResult.isValid) {
      importSession.errors = validationResult.errors;
      throw new Error("Validation failed after remapping");
    }

    importSession.processedItems = 1 + (adjustedGalaxy.linkedSectors?.length || 0);

    return {
      success: true,
      galaxy: adjustedGalaxy,
      importSession,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      importSession,
    };
  }
}

function generateNewGalaxyId(targetUniverse) {
  const existingIds = targetUniverse.galaxies.map((g) => parseInt(g.galaxyId));
  const nextId = Math.max(...existingIds) + 1;
  return String(nextId).padStart(3, "0");
}

function validateGalaxyImport(galaxyData) {
  if (!galaxyData.galaxyId) throw new Error("Missing galaxyId");
  if (!galaxyData.galaxyNames || !galaxyData.galaxyNames.length) {
    throw new Error("Missing galaxy names");
  }
  if (!galaxyData.galaxyType) throw new Error("Missing galaxy type");
}

function remapGalaxyId(galaxy, newId) {
  return {
    ...galaxy,
    galaxyId: newId,
  };
}

function adjustGalaxyCoordinates(galaxy, targetCoordinates) {
  // Calculate offset between original center and target position
  const offsetX = targetCoordinates.x - (galaxy.galaxyCoordinates.x || 0);
  const offsetY = targetCoordinates.y - (galaxy.galaxyCoordinates.y || 0);
  const offsetZ = (targetCoordinates.z || 0) - (galaxy.galaxyCoordinates.z || 0);

  return {
    ...galaxy,
    galaxyCoordinates: {
      x: targetCoordinates.x,
      y: targetCoordinates.y,
      z: targetCoordinates.z || 0,
    },
    // Adjust all linked sectors by the same offset
    linkedSectors:
      galaxy.linkedSectors?.map((sector) => ({
        ...sector,
        coordinates: {
          x: (sector.coordinates.x || 0) + offsetX,
          y: (sector.coordinates.y || 0) + offsetY,
          z: (sector.coordinates.z || 0) + offsetZ,
        },
      })) || [],
  };
}

function remapSectorIds(sectors, idRemappingTable) {
  return sectors.map((sector) => {
    const newSectorId = generateRemappedId(sector.sectorId, idRemappingTable);
    return {
      ...sector,
      sectorId: newSectorId,
    };
  });
}

function generateRemappedId(oldId, mappingTable) {
  if (!mappingTable.sectorIds) mappingTable.sectorIds = {};

  if (mappingTable.sectorIds[oldId]) {
    return mappingTable.sectorIds[oldId];
  }

  const newId = `sector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  mappingTable.sectorIds[oldId] = newId;
  return newId;
}

function validateRemappedGalaxy(galaxy) {
  const errors = [];

  if (!galaxy.galaxyId) errors.push("Galaxy ID missing after remap");
  if (!galaxy.galaxyCoordinates) errors.push("Coordinates missing after remap");
  if (galaxy.linkedSectors?.some((s) => !s.sectorId)) {
    errors.push("Some sectors missing IDs after remap");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
