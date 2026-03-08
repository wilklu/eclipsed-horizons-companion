/**
 * JSON to SQLite Converter
 *
 * Converts entities from JSON format into SQLite database with automatic ID remapping
 * and relationship preservation. Handles imports and nested entity hierarchies.
 *
 * Usage:
 *   import { jsonToSqlite } from './jsonToSqlite.js'
 *
 *   const idMap = await jsonToSqlite(db, jsonUniverse)
 *   // Returns: { galaxyIds, sectorIds, systemIds, worldIds, sophontIds }
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generate new ID based on type
 */
function generateId(type) {
  // For now, use UUID. Could use sequential IDs if preferred.
  return `${type}-${uuidv4()}`;
}

/**
 * Convert JSON galaxy to SQLite
 */
export async function jsonGalaxyToSqlite(db, galaxyJson, idMap = {}) {
  // Generate new galaxy ID
  const oldId = galaxyJson.galaxyId;
  const newId = generateId("galaxy");
  idMap.galaxies = idMap.galaxies || {};
  idMap.galaxies[oldId] = newId;

  const galaxy = {
    galaxyId: newId,
    name: galaxyJson.name,
    type: galaxyJson.type,
    morphology: JSON.stringify(galaxyJson.morphology),
    metadata: JSON.stringify(galaxyJson.metadata || {}),
    importMetadata: JSON.stringify(galaxyJson.importMetadata || { isImported: true, sourceGalaxy: oldId }),
  };

  db.prepare(
    `
    INSERT INTO galaxies (galaxyId, name, type, morphology, metadata, importMetadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(galaxy.galaxyId, galaxy.name, galaxy.type, galaxy.morphology, galaxy.metadata, galaxy.importMetadata);

  return { newId, idMap };
}

/**
 * Convert JSON sector to SQLite
 */
export async function jsonSectorToSqlite(db, sectorJson, galaxyIdMap, idMap = {}) {
  const oldId = sectorJson.sectorId;
  const newId = generateId("sector");
  idMap.sectors = idMap.sectors || {};
  idMap.sectors[oldId] = newId;

  const sector = {
    sectorId: newId,
    galaxyId: galaxyIdMap[sectorJson.galaxyId],
    coordinates: JSON.stringify(sectorJson.coordinates),
    densityClass: sectorJson.densityClass,
    densityVariation: sectorJson.densityVariation,
    metadata: JSON.stringify(sectorJson.metadata || {}),
  };

  db.prepare(
    `
    INSERT INTO sectors (sectorId, galaxyId, coordinates, densityClass, densityVariation, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(
    sector.sectorId,
    sector.galaxyId,
    sector.coordinates,
    sector.densityClass,
    sector.densityVariation,
    sector.metadata,
  );

  return { newId, idMap };
}

/**
 * Convert JSON system to SQLite
 */
export async function jsonSystemToSqlite(db, systemJson, sectorIdMap, idMap = {}) {
  const oldId = systemJson.systemId;
  const newId = generateId("system");
  idMap.systems = idMap.systems || {};
  idMap.systems[oldId] = newId;

  const system = {
    systemId: newId,
    sectorId: sectorIdMap[systemJson.sectorId],
    hexCoordinates: JSON.stringify(systemJson.hexCoordinates),
    starCount: systemJson.starCount,
    primaryStar: JSON.stringify(systemJson.primaryStar),
    companionStars: systemJson.companionStars ? JSON.stringify(systemJson.companionStars) : null,
    habitable_zone: systemJson.habitableZone,
    metadata: JSON.stringify(systemJson.metadata || {}),
  };

  db.prepare(
    `
    INSERT INTO systems (systemId, sectorId, hexCoordinates, starCount, primaryStar, companionStars, habitable_zone, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    system.systemId,
    system.sectorId,
    system.hexCoordinates,
    system.starCount,
    system.primaryStar,
    system.companionStars,
    system.habitable_zone,
    system.metadata,
  );

  return { newId, idMap };
}

/**
 * Convert JSON world to SQLite
 */
export async function jsonWorldToSqlite(db, worldJson, systemIdMap, idMap = {}) {
  const oldId = worldJson.worldId;
  const newId = generateId("world");
  idMap.worlds = idMap.worlds || {};
  idMap.worlds[oldId] = newId;

  const world = {
    worldId: newId,
    systemId: systemIdMap[worldJson.systemId],
    name: worldJson.name,
    orbit: worldJson.orbit,
    uwp: worldJson.uwp,
    physical: JSON.stringify(worldJson.physical),
    census: JSON.stringify(worldJson.census),
    tradeCodes: worldJson.tradeCodes ? JSON.stringify(worldJson.tradeCodes) : null,
    starport: worldJson.starport,
    metadata: JSON.stringify(worldJson.metadata || {}),
  };

  db.prepare(
    `
    INSERT INTO worlds (worldId, systemId, name, orbit, uwp, physical, census, tradeCodes, starport, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    world.worldId,
    world.systemId,
    world.name,
    world.orbit,
    world.uwp,
    world.physical,
    world.census,
    world.tradeCodes,
    world.starport,
    world.metadata,
  );

  return { newId, idMap };
}

/**
 * Convert JSON sophont to SQLite
 */
export async function jsonSophontToSqlite(db, sophontJson, worldIdMap, idMap = {}) {
  const oldId = sophontJson.sophontId;
  const newId = generateId("sophont");
  idMap.sophonts = idMap.sophonts || {};
  idMap.sophonts[oldId] = newId;

  const sophont = {
    sophontId: newId,
    worldId: worldIdMap[sophontJson.worldId],
    name: sophontJson.name,
    bodyPlan: sophontJson.bodyPlan,
    culture: JSON.stringify(sophontJson.culture),
    population: sophontJson.population ? JSON.stringify(sophontJson.population) : null,
    techLevel: sophontJson.techLevel,
    metadata: JSON.stringify(sophontJson.metadata || {}),
  };

  db.prepare(
    `
    INSERT INTO sophonts (sophontId, worldId, name, bodyPlan, culture, population, techLevel, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    sophont.sophontId,
    sophont.worldId,
    sophont.name,
    sophont.bodyPlan,
    sophont.culture,
    sophont.population,
    sophont.techLevel,
    sophont.metadata,
  );

  return { newId, idMap };
}

/**
 * Import entire universe from JSON
 */
export async function jsonUniverseToSqlite(db, universeJson) {
  const idMap = {
    galaxies: {},
    sectors: {},
    systems: {},
    worlds: {},
    sophonts: {},
  };

  try {
    // Start transaction
    const insertGalaxy = db.transaction((galaxy) => {
      for (const sector of galaxy.sectors || []) {
        insertSector(sector);
      }
      return jsonGalaxyToSqlite(db, galaxy, idMap);
    });

    const insertSector = db.transaction((sector) => {
      for (const system of sector.systems || []) {
        insertSystem(system);
      }
      return jsonSectorToSqlite(db, sector, idMap.galaxies, idMap);
    });

    const insertSystem = db.transaction((system) => {
      for (const world of system.worlds || []) {
        insertWorld(world);
      }
      return jsonSystemToSqlite(db, system, idMap.sectors, idMap);
    });

    const insertWorld = db.transaction((world) => {
      for (const sophont of world.sophonts || []) {
        insertSophont(sophont);
      }
      return jsonWorldToSqlite(db, world, idMap.systems, idMap);
    });

    const insertSophont = (sophont) => {
      return jsonSophontToSqlite(db, sophont, idMap.worlds, idMap);
    };

    // Import galaxies with nested entities
    for (const galaxy of universeJson.galaxies || []) {
      const { newId } = await jsonGalaxyToSqlite(db, galaxy, idMap);

      // Import sectors
      for (const sector of galaxy.sectors || []) {
        const sectorData = { ...sector, galaxyId: newId };
        const { newId: sectorId } = await jsonSectorToSqlite(db, sectorData, idMap.galaxies, idMap);

        // Import systems
        for (const system of sector.systems || []) {
          const systemData = { ...system, sectorId };
          const { newId: systemId } = await jsonSystemToSqlite(db, systemData, idMap.sectors, idMap);

          // Import worlds
          for (const world of system.worlds || []) {
            const worldData = { ...world, systemId };
            const { newId: worldId } = await jsonWorldToSqlite(db, worldData, idMap.systems, idMap);

            // Import sophonts
            for (const sophont of world.sophonts || []) {
              const sophontData = { ...sophont, worldId };
              await jsonSophontToSqlite(db, sophontData, idMap.worlds, idMap);
            }
          }
        }
      }
    }

    return idMap;
  } catch (err) {
    throw new Error(`Failed to import universe: ${err.message}`);
  }
}
