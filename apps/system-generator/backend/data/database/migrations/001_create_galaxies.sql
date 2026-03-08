-- Migration 001: Create galaxies table
-- Timestamp: 2026-03-08
-- Phase: Phase 1 Sprint 1

CREATE TABLE IF NOT EXISTS galaxies (
  galaxyId TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'Spiral',
    'Elliptical', 
    'Barred Spiral',
    'Irregular',
    'Dwarf',
    'Lenticular'
  )),
  morphology TEXT NOT NULL,
  -- morphology stores JSON: {bulgeRadius, armCount, coreDensity, diskThickness}
  
  metadata TEXT NOT NULL,
  -- metadata stores JSON: {createdAt, lastModified, status, version}
  
  importMetadata TEXT NOT NULL,
  -- importMetadata stores JSON: {isImported, sourceGalaxy, originalGalaxyId}
  
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(name)
);

-- Index for name lookups and list queries
CREATE INDEX IF NOT EXISTS idx_galaxies_name ON galaxies(name);
CREATE INDEX IF NOT EXISTS idx_galaxies_type ON galaxies(type);
CREATE INDEX IF NOT EXISTS idx_galaxies_created ON galaxies(createdAt DESC);
