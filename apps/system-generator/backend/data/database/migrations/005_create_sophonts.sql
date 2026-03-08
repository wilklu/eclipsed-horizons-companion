-- Migration 005: Create sophonts table
-- Timestamp: 2026-03-08
-- Phase: Phase 1 Sprint 1

CREATE TABLE IF NOT EXISTS sophonts (
  sophontId TEXT PRIMARY KEY NOT NULL,
  worldId TEXT NOT NULL,
  name TEXT NOT NULL,
  
  bodyPlan TEXT NOT NULL CHECK(bodyPlan IN (
    'Humanoid',
    'Avian',
    'Aquatic',
    'Insectoid',
    'Arachnoid',
    'Serpentine',
    'Amorphous',
    'Radial',
    'Exotic'
  )),
  
  culture TEXT NOT NULL,
  -- culture stores JSON: {values, taboos, socialStructure, techLevel}
  
  population TEXT,
  -- population stores JSON: {current, density, growthRate}
  
  techLevel INTEGER NOT NULL CHECK(techLevel BETWEEN 0 AND 15),
  
  metadata TEXT NOT NULL,
  -- metadata stores JSON: {createdAt, origin, familyTreeId, notes}
  
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastModified TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (worldId) REFERENCES worlds(worldId) ON DELETE CASCADE,
  UNIQUE(worldId, name)
);

-- Indexes for sophont queries
CREATE INDEX IF NOT EXISTS idx_sophonts_worldId ON sophonts(worldId);
CREATE INDEX IF NOT EXISTS idx_sophonts_bodyPlan ON sophonts(bodyPlan);
CREATE INDEX IF NOT EXISTS idx_sophonts_techLevel ON sophonts(techLevel);
CREATE INDEX IF NOT EXISTS idx_sophonts_created ON sophonts(createdAt DESC);
