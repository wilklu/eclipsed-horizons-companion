-- Migration 003: Create systems table
-- Timestamp: 2026-03-08
-- Phase: Phase 1 Sprint 1

CREATE TABLE IF NOT EXISTS systems (
  systemId TEXT PRIMARY KEY NOT NULL,
  sectorId TEXT NOT NULL,
  hexCoordinates TEXT NOT NULL,
  -- hexCoordinates stores JSON: {x, y} for position within sector grid
  
  starCount INTEGER NOT NULL CHECK(starCount BETWEEN 1 AND 4),
  primaryStar TEXT NOT NULL,
  -- primaryStar stores JSON: {spectralClass, magnitude, luminosity}
  
  companionStars TEXT,
  -- companionStars stores JSON array of companion star objects (nullable if single star)
  
  habitable_zone REAL,
  -- habitable_zone: AU distance from primary star where water-bearing worlds can exist
  
  metadata TEXT NOT NULL,
  -- metadata stores JSON: {createdAt, systemClass, notes, surveyed}
  
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sectorId) REFERENCES sectors(sectorId) ON DELETE CASCADE,
  UNIQUE(sectorId, hexCoordinates)
);

-- Indexes for system queries
CREATE INDEX IF NOT EXISTS idx_systems_sectorId ON systems(sectorId);
CREATE INDEX IF NOT EXISTS idx_systems_starCount ON systems(starCount);
CREATE INDEX IF NOT EXISTS idx_systems_created ON systems(createdAt DESC);
