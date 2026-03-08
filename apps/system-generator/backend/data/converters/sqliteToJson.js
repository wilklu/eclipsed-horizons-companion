/**
 * SQLite to JSON Converter
 *
 * Converts entities from SQLite database format to JSON with all relationships preserved.
 * Handles nested entity hierarchies and FK relationship reconstruction.
 *
 * Usage:
 *   import { galaxyToJson, sectorToJson, etc. } from './sqliteToJson.js'
 *
 *   const galaxyJson = await galaxyToJson(db, galaxyId)
 *   // Returns: { galaxyId, name, type, sectors: [...], ...}
 */

/**
 * Convert a galaxy with all nested entities to JSON
 */
export async function galaxyToJson(db, galaxyId) {
  const galaxy = db.prepare("SELECT * FROM galaxies WHERE galaxyId = ?").get(galaxyId);

  if (!galaxy) {
    throw new Error(`Galaxy not found: ${galaxyId}`);
  }

  // Parse JSON fields
  const result = {
    ...galaxy,
    morphology: JSON.parse(galaxy.morphology),
    metadata: JSON.parse(galaxy.metadata),
    importMetadata: JSON.parse(galaxy.importMetadata),
    sectors: [],
  };

  // Get all sectors for this galaxy
  const sectors = db.prepare("SELECT sectorId FROM sectors WHERE galaxyId = ?").all(galaxyId);

  for (const sector of sectors) {
    const sectorJson = await sectorToJson(db, sector.sectorId);
    result.sectors.push(sectorJson);
  }

  return result;
}

/**
 * Convert a sector with all nested entities to JSON
 */
export async function sectorToJson(db, sectorId) {
  const sector = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(sectorId);

  if (!sector) {
    throw new Error(`Sector not found: ${sectorId}`);
  }

  const result = {
    ...sector,
    coordinates: JSON.parse(sector.coordinates),
    metadata: JSON.parse(sector.metadata),
    systems: [],
  };

  // Get all systems in this sector
  const systems = db.prepare("SELECT systemId FROM systems WHERE sectorId = ?").all(sectorId);

  for (const system of systems) {
    const systemJson = await systemToJson(db, system.systemId);
    result.systems.push(systemJson);
  }

  return result;
}

/**
 * Convert a system with all nested entities to JSON
 */
export async function systemToJson(db, systemId) {
  const system = db.prepare("SELECT * FROM systems WHERE systemId = ?").get(systemId);

  if (!system) {
    throw new Error(`System not found: ${systemId}`);
  }

  const result = {
    ...system,
    hexCoordinates: JSON.parse(system.hexCoordinates),
    primaryStar: JSON.parse(system.primaryStar),
    companionStars: system.companionStars ? JSON.parse(system.companionStars) : null,
    metadata: JSON.parse(system.metadata),
    worlds: [],
  };

  // Get all worlds in this system
  const worlds = db.prepare("SELECT worldId FROM worlds WHERE systemId = ?").all(systemId);

  for (const world of worlds) {
    const worldJson = await worldToJson(db, world.worldId);
    result.worlds.push(worldJson);
  }

  return result;
}

/**
 * Convert a world with all nested entities to JSON
 */
export async function worldToJson(db, worldId) {
  const world = db.prepare("SELECT * FROM worlds WHERE worldId = ?").get(worldId);

  if (!world) {
    throw new Error(`World not found: ${worldId}`);
  }

  const result = {
    ...world,
    physical: JSON.parse(world.physical),
    census: JSON.parse(world.census),
    tradeCodes: world.tradeCodes ? JSON.parse(world.tradeCodes) : [],
    metadata: JSON.parse(world.metadata),
    sophonts: [],
  };

  // Get all sophonts on this world
  const sophonts = db.prepare("SELECT sophontId FROM sophonts WHERE worldId = ?").all(worldId);

  for (const sophont of sophonts) {
    const sophontJson = await sophontToJson(db, sophont.sophontId);
    result.sophonts.push(sophontJson);
  }

  return result;
}

/**
 * Convert a single sophont to JSON
 */
export async function sophontToJson(db, sophontId) {
  const sophont = db.prepare("SELECT * FROM sophonts WHERE sophontId = ?").get(sophontId);

  if (!sophont) {
    throw new Error(`Sophont not found: ${sophontId}`);
  }

  return {
    ...sophont,
    culture: JSON.parse(sophont.culture),
    population: sophont.population ? JSON.parse(sophont.population) : null,
    metadata: JSON.parse(sophont.metadata),
  };
}

/**
 * Export entire universe to JSON
 */
export async function universeToJson(db) {
  const galaxies = db.prepare("SELECT galaxyId FROM galaxies").all();

  const universe = {
    exportedAt: new Date().toISOString(),
    galaxies: [],
    statistics: {
      galaxyCount: galaxies.length,
      sectorCount: 0,
      systemCount: 0,
      worldCount: 0,
      sophontCount: 0,
    },
  };

  for (const galaxy of galaxies) {
    const galaxyJson = await galaxyToJson(db, galaxy.galaxyId);
    universe.galaxies.push(galaxyJson);

    universe.statistics.sectorCount += galaxyJson.sectors.length;
    for (const sector of galaxyJson.sectors) {
      universe.statistics.systemCount += sector.systems.length;
      for (const system of sector.systems) {
        universe.statistics.worldCount += system.worlds.length;
        for (const world of system.worlds) {
          universe.statistics.sophontCount += world.sophonts.length;
        }
      }
    }
  }

  return universe;
}

/**
 * Flatten universe to array format (useful for export to CSV/spreadsheet)
 */
export async function universeFlatToJson(db) {
  const result = {
    galaxies: db.prepare("SELECT * FROM galaxies").all(),
    sectors: db.prepare("SELECT * FROM sectors").all(),
    systems: db.prepare("SELECT * FROM systems").all(),
    worlds: db.prepare("SELECT * FROM worlds").all(),
    sophonts: db.prepare("SELECT * FROM sophonts").all(),
  };

  // Parse JSON fields in each array
  result.galaxies.forEach((g) => {
    g.morphology = JSON.parse(g.morphology);
    g.metadata = JSON.parse(g.metadata);
    g.importMetadata = JSON.parse(g.importMetadata);
  });

  result.sectors.forEach((s) => {
    s.coordinates = JSON.parse(s.coordinates);
    s.metadata = JSON.parse(s.metadata);
  });

  result.systems.forEach((sys) => {
    sys.hexCoordinates = JSON.parse(sys.hexCoordinates);
    sys.primaryStar = JSON.parse(sys.primaryStar);
    if (sys.companionStars) sys.companionStars = JSON.parse(sys.companionStars);
    sys.metadata = JSON.parse(sys.metadata);
  });

  result.worlds.forEach((w) => {
    w.physical = JSON.parse(w.physical);
    w.census = JSON.parse(w.census);
    if (w.tradeCodes) w.tradeCodes = JSON.parse(w.tradeCodes);
    w.metadata = JSON.parse(w.metadata);
  });

  result.sophonts.forEach((s) => {
    s.culture = JSON.parse(s.culture);
    if (s.population) s.population = JSON.parse(s.population);
    s.metadata = JSON.parse(s.metadata);
  });

  return result;
}
