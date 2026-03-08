-- Migration 004: Create worlds table
-- Timestamp: 2026-03-08
-- Phase: Phase 1 Sprint 1

CREATE TABLE IF NOT EXISTS worlds (
  worldId TEXT PRIMARY KEY NOT NULL,
  systemId TEXT NOT NULL,
  name TEXT NOT NULL,
  orbit INTEGER NOT NULL,
  -- orbit: distance from primary star in AU
  
  uwp TEXT NOT NULL,
  -- UWP: Universal World Profile code (e.g., "A877899-E")
  -- Format: Starport / Size / Atmosphere / Hydrographics / Population / Government / Law Level / Tech Level
  
  physical TEXT NOT NULL,
  -- physical stores JSON: {size, gravity, atmosphere, hydrographics, temperature}
  
  census TEXT NOT NULL,
  -- census stores JSON: {population, government, lawLevel, techLevel}
  
  tradeCodes TEXT,
  -- tradeCodes stores JSON array: ["Ag", "Wa", "In", etc.]
  
  starport TEXT,
  -- starport: A, B, C, D, E, or X (from UWP)
  
  metadata TEXT NOT NULL,
  -- metadata stores JSON: {createdAt, explored, habitability, notes}
  
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (systemId) REFERENCES systems(systemId) ON DELETE CASCADE,
  UNIQUE(systemId, name)
);

-- Indexes for world queries
CREATE INDEX IF NOT EXISTS idx_worlds_systemId ON worlds(systemId);
CREATE INDEX IF NOT EXISTS idx_worlds_uwp ON worlds(uwp);
CREATE INDEX IF NOT EXISTS idx_worlds_starport ON worlds(starport);
CREATE INDEX IF NOT EXISTS idx_worlds_created ON worlds(createdAt DESC);
