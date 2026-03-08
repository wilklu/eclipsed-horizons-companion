-- Migration 002: Create sectors table
-- Timestamp: 2026-03-08
-- Phase: Phase 1 Sprint 1

CREATE TABLE IF NOT EXISTS sectors (
  sectorId TEXT PRIMARY KEY NOT NULL,
  galaxyId TEXT NOT NULL,
  coordinates TEXT NOT NULL,
  -- coordinates stores JSON: {x, y} for hex positioning within galaxy
  
  densityClass INTEGER NOT NULL CHECK(densityClass BETWEEN 0 AND 5),
  densityVariation REAL,
  -- densityVariation: ±variation percentage from sector center to edge
  
  metadata TEXT NOT NULL,
  -- metadata stores JSON: {createdAt, explorationStatus, systemCount, notes}
  
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (galaxyId) REFERENCES galaxies(galaxyId) ON DELETE CASCADE,
  UNIQUE(galaxyId, coordinates)
);

-- Indexes for sector queries
CREATE INDEX IF NOT EXISTS idx_sectors_galaxyId ON sectors(galaxyId);
CREATE INDEX IF NOT EXISTS idx_sectors_densityClass ON sectors(densityClass);
CREATE INDEX IF NOT EXISTS idx_sectors_created ON sectors(createdAt DESC);
