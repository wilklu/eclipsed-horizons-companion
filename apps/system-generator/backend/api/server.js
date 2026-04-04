import http from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.PORT || 3100);
const DB_PATH = process.env.EH_DB_PATH || join(__dirname, "..", "data", "universe.db");

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS galaxies (
    galaxyId TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Spiral', 'Elliptical', 'Barred Spiral', 'Irregular', 'Dwarf', 'Lenticular')),
    morphology TEXT NOT NULL,
    metadata TEXT NOT NULL,
    importMetadata TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
  );

  CREATE TABLE IF NOT EXISTS sectors (
    sectorId TEXT PRIMARY KEY NOT NULL,
    galaxyId TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    densityClass INTEGER NOT NULL CHECK(densityClass BETWEEN 0 AND 5),
    densityVariation REAL,
    metadata TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (galaxyId) REFERENCES galaxies(galaxyId) ON DELETE CASCADE,
    UNIQUE(galaxyId, coordinates)
  );

  CREATE TABLE IF NOT EXISTS systems (
    systemId TEXT PRIMARY KEY NOT NULL,
    sectorId TEXT NOT NULL,
    hexCoordinates TEXT NOT NULL,
    starCount INTEGER NOT NULL CHECK(starCount BETWEEN 1 AND 4),
    primaryStar TEXT NOT NULL,
    companionStars TEXT,
    habitable_zone REAL,
    metadata TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sectorId) REFERENCES sectors(sectorId) ON DELETE CASCADE,
    UNIQUE(sectorId, hexCoordinates)
  );

  CREATE INDEX IF NOT EXISTS idx_galaxies_name ON galaxies(name);
  CREATE INDEX IF NOT EXISTS idx_sectors_galaxyId ON sectors(galaxyId);
  CREATE INDEX IF NOT EXISTS idx_systems_sectorId ON systems(sectorId);
`);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function sendNoContent(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end();
}

function parseJsonField(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toSector(row) {
  return {
    sectorId: row.sectorId,
    galaxyId: row.galaxyId,
    coordinates: parseJsonField(row.coordinates, { x: 0, y: 0 }),
    densityClass: Number(row.densityClass) || 0,
    densityVariation: Number(row.densityVariation) || 0,
    metadata: parseJsonField(row.metadata, {}),
    createdAt: row.createdAt,
    lastModified: row.lastModified,
  };
}

function normalizeSectorPayload(payload) {
  const metadata = payload?.metadata && typeof payload.metadata === "object" ? payload.metadata : {};
  const coordinates = payload?.coordinates && typeof payload.coordinates === "object" ? payload.coordinates : {};
  return {
    sectorId: String(payload?.sectorId || "").trim(),
    galaxyId: String(payload?.galaxyId || metadata.galaxyId || "").trim(),
    coordinates: {
      x: Number(coordinates.x ?? metadata.gridX ?? 0),
      y: Number(coordinates.y ?? metadata.gridY ?? 0),
    },
    densityClass: Math.max(0, Math.min(5, Number(payload?.densityClass) || 0)),
    densityVariation: Number(payload?.densityVariation) || 0,
    metadata,
  };
}

function ensureGalaxyExists(galaxyId) {
  if (!galaxyId) {
    throw new Error("galaxyId is required");
  }

  const existing = db.prepare("SELECT galaxyId FROM galaxies WHERE galaxyId = ?").get(galaxyId);
  if (existing) return;

  const morphology = {
    bulgeRadius: 5000,
    armCount: 2,
    coreDensity: 0.7,
    diskThickness: 1000,
  };
  const metadata = {
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    status: "placeholder",
    version: 1,
  };
  const importMetadata = {
    isImported: false,
    sourceGalaxy: null,
    originalGalaxyId: galaxyId,
  };

  db.prepare(
    `INSERT INTO galaxies (galaxyId, name, type, morphology, metadata, importMetadata)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    galaxyId,
    `Galaxy ${galaxyId}`,
    "Spiral",
    JSON.stringify(morphology),
    JSON.stringify(metadata),
    JSON.stringify(importMetadata),
  );
}

function aggregateSectorStats(galaxyId) {
  const rows = db.prepare("SELECT metadata FROM sectors WHERE galaxyId = ?").all(galaxyId);
  const totalSectors = rows.length;
  let populatedSectors = 0;
  let generatedPresenceSectors = 0;
  let totalObjects = 0;

  for (const row of rows) {
    const metadata = parseJsonField(row.metadata, {});
    const systemCount = Number(metadata.systemCount) || 0;
    if (systemCount > 0) populatedSectors += 1;
    if (metadata.hexPresenceGenerated) generatedPresenceSectors += 1;
    totalObjects += systemCount;
  }

  return {
    totalSectors,
    populatedSectors,
    generatedPresenceSectors,
    emptySectors: Math.max(0, totalSectors - populatedSectors),
    totalObjects,
    avgObjectsPerSector: totalSectors > 0 ? totalObjects / totalSectors : 0,
    lastUpdated: new Date().toISOString(),
  };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function upsertSector(payload) {
  const sector = normalizeSectorPayload(payload);
  if (!sector.sectorId) throw new Error("sectorId is required");
  if (!sector.galaxyId) throw new Error("galaxyId is required");

  ensureGalaxyExists(sector.galaxyId);

  const existingRow = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(sector.sectorId);
  const mergedMetadata = {
    ...parseJsonField(existingRow?.metadata, {}),
    ...(sector.metadata ?? {}),
  };

  db.prepare(
    `INSERT INTO sectors (sectorId, galaxyId, coordinates, densityClass, densityVariation, metadata)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(sectorId) DO UPDATE SET
       galaxyId = excluded.galaxyId,
       coordinates = excluded.coordinates,
       densityClass = excluded.densityClass,
       densityVariation = excluded.densityVariation,
       metadata = excluded.metadata,
       lastModified = CURRENT_TIMESTAMP`,
  ).run(
    sector.sectorId,
    sector.galaxyId,
    JSON.stringify(sector.coordinates),
    sector.densityClass,
    sector.densityVariation,
    JSON.stringify(mergedMetadata),
  );

  const row = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(sector.sectorId);
  return toSector(row);
}

function matchPath(pathname, pattern) {
  const pathParts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (pathParts.length !== patternParts.length) return null;

  const params = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }
    if (patternPart !== pathPart) return null;
  }
  return params;
}

const server = http.createServer(async (req, res) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: "Malformed request" });
    return;
  }

  if (req.method === "OPTIONS") {
    sendNoContent(res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const { pathname, searchParams } = url;

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        dbPath: DB_PATH,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    let params = matchPath(pathname, "/api/galaxies/:gid");
    if (req.method === "GET" && params) {
      const row = db.prepare("SELECT * FROM galaxies WHERE galaxyId = ?").get(params.gid);
      if (!row) {
        sendJson(res, 404, { error: `Galaxy not found: ${params.gid}` });
        return;
      }
      sendJson(res, 200, {
        galaxyId: row.galaxyId,
        name: row.name,
        type: row.type,
        morphology: parseJsonField(row.morphology, {}),
        metadata: parseJsonField(row.metadata, {}),
        importMetadata: parseJsonField(row.importMetadata, {}),
        createdAt: row.createdAt,
        lastModified: row.lastModified,
      });
      return;
    }

    params = matchPath(pathname, "/api/galaxies/:gid");
    if (req.method === "DELETE" && params) {
      const result = db.prepare("DELETE FROM galaxies WHERE galaxyId = ?").run(params.gid);
      if (result.changes === 0) {
        sendJson(res, 404, { error: `Galaxy not found: ${params.gid}` });
        return;
      }
      sendNoContent(res);
      return;
    }

    params = matchPath(pathname, "/api/galaxies/:gid/sectors");
    if (req.method === "GET" && params) {
      const hasWindowQuery = ["xMin", "xMax", "yMin", "yMax"].every((key) => searchParams.has(key));
      if (hasWindowQuery) {
        const xMin = Number(searchParams.get("xMin"));
        const xMax = Number(searchParams.get("xMax"));
        const yMin = Number(searchParams.get("yMin"));
        const yMax = Number(searchParams.get("yMax"));
        const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 2500), 10000);

        if (![xMin, xMax, yMin, yMax].every(Number.isFinite)) {
          sendJson(res, 400, { error: "xMin, xMax, yMin, and yMax must be finite numbers" });
          return;
        }

        const rows = db
          .prepare(
            `SELECT * FROM sectors
             WHERE galaxyId = ?
               AND CAST(json_extract(coordinates, '$.x') AS REAL) BETWEEN ? AND ?
               AND CAST(json_extract(coordinates, '$.y') AS REAL) BETWEEN ? AND ?
             ORDER BY CAST(json_extract(coordinates, '$.y') AS REAL) ASC,
                      CAST(json_extract(coordinates, '$.x') AS REAL) ASC
             LIMIT ?`,
          )
          .all(params.gid, xMin, xMax, yMin, yMax, limit);
        sendJson(res, 200, rows.map(toSector));
        return;
      }

      const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 5000), 10000);
      const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
      const rows = db
        .prepare("SELECT * FROM sectors WHERE galaxyId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?")
        .all(params.gid, limit, offset);
      sendJson(res, 200, rows.map(toSector));
      return;
    }

    params = matchPath(pathname, "/api/galaxies/:gid/sectors/stats");
    if (req.method === "GET" && params) {
      sendJson(res, 200, aggregateSectorStats(params.gid));
      return;
    }

    params = matchPath(pathname, "/api/galaxies/:gid/sectors/prune-defaults");
    if (req.method === "POST" && params) {
      const result = db
        .prepare(
          `DELETE FROM sectors
           WHERE galaxyId = ?
             AND COALESCE(json_extract(metadata, '$.explorationStatus'), '') = 'unexplored'
             AND json_type(metadata, '$.occupiedHexes') IS NULL
             AND CAST(COALESCE(json_extract(metadata, '$.systemCount'), 0) AS REAL) <= 0
             AND COALESCE(json_extract(metadata, '$.hexPresenceGenerated'), 0) != 1`,
        )
        .run(params.gid);
      sendJson(res, 200, { deleted: Number(result.changes) || 0 });
      return;
    }

    params = matchPath(pathname, "/api/sectors/:id");
    if (req.method === "GET" && params) {
      const row = db.prepare("SELECT * FROM sectors WHERE sectorId = ?").get(params.id);
      if (!row) {
        sendJson(res, 404, { error: `Sector not found: ${params.id}` });
        return;
      }
      sendJson(res, 200, toSector(row));
      return;
    }

    if (req.method === "POST" && pathname === "/api/sectors") {
      const payload = await readRequestBody(req);
      const created = upsertSector(payload);
      sendJson(res, 201, created);
      return;
    }

    if (req.method === "POST" && pathname === "/api/sectors/upsert") {
      const payload = await readRequestBody(req);
      const updated = upsertSector(payload);
      sendJson(res, 201, updated);
      return;
    }

    if (req.method === "POST" && pathname === "/api/sectors/batch") {
      const payload = await readRequestBody(req);
      if (!Array.isArray(payload) || payload.length === 0) {
        sendJson(res, 400, { error: "Request body must be a non-empty array of sectors" });
        return;
      }
      if (payload.length > 2000) {
        sendJson(res, 400, { error: "Batch size must not exceed 2000 sectors" });
        return;
      }

      const transaction = db.transaction((items) => {
        for (const item of items) {
          upsertSector(item);
        }
      });
      transaction(payload);
      sendJson(res, 201, { created: payload.length, total: payload.length });
      return;
    }

    params = matchPath(pathname, "/api/sectors/:id");
    if (req.method === "PUT" && params) {
      const payload = await readRequestBody(req);
      const updated = upsertSector({ ...payload, sectorId: params.id });
      sendJson(res, 200, updated);
      return;
    }

    params = matchPath(pathname, "/api/sectors/:id");
    if (req.method === "DELETE" && params) {
      const result = db.prepare("DELETE FROM sectors WHERE sectorId = ?").run(params.id);
      if (result.changes === 0) {
        sendJson(res, 404, { error: `Sector not found: ${params.id}` });
        return;
      }
      sendNoContent(res);
      return;
    }

    sendJson(res, 404, { error: `Route not found: ${req.method} ${pathname}` });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(PORT, () => {
  console.log(`Eclipsed Horizons API listening on http://localhost:${PORT}/api`);
  console.log(`Database path: ${DB_PATH}`);
});
