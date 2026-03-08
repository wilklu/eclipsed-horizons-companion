-- Migration 006: Database integrity indexes and constraints
-- Timestamp: 2026-03-08
-- Phase: Phase 1 Sprint 1

-- Composite indexes for common queries

-- Query: Get all sectors and systems for a galaxy (nested query)
CREATE INDEX IF NOT EXISTS idx_galaxy_sectors_systems 
  ON sectors(galaxyId);

-- Query: Get all systems in a sector and their worlds
CREATE INDEX IF NOT EXISTS idx_sector_systems_worlds 
  ON systems(sectorId);

-- Query: Get all worlds in a system and their sophonts
CREATE INDEX IF NOT EXISTS idx_system_worlds_sophonts 
  ON worlds(systemId);

-- Query: Get all sophonts on a world
CREATE INDEX IF NOT EXISTS idx_world_sophonts 
  ON sophonts(worldId);

-- Query: Search worlds by tech level across galaxy
CREATE INDEX IF NOT EXISTS idx_worlds_by_techLevel 
  ON worlds(starport);

-- Query: Recent activity timeline
CREATE INDEX IF NOT EXISTS idx_galaxies_recent 
  ON galaxies(createdAt DESC, lastModified DESC);
  
CREATE INDEX IF NOT EXISTS idx_sectors_recent 
  ON sectors(createdAt DESC, lastModified DESC);
  
CREATE INDEX IF NOT EXISTS idx_systems_recent 
  ON systems(createdAt DESC, lastModified DESC);
  
CREATE INDEX IF NOT EXISTS idx_worlds_recent 
  ON worlds(createdAt DESC, lastModified DESC);
  
CREATE INDEX IF NOT EXISTS idx_sophonts_recent 
  ON sophonts(createdAt DESC, lastModified DESC);

-- Verification Queries
-- These can be run to verify data integrity

-- Check for orphaned sectors (should be empty)
-- SELECT * FROM sectors WHERE galaxyId NOT IN (SELECT galaxyId FROM galaxies);

-- Check for orphaned systems (should be empty)
-- SELECT * FROM systems WHERE sectorId NOT IN (SELECT sectorId FROM sectors);

-- Check for orphaned worlds (should be empty)
-- SELECT * FROM worlds WHERE systemId NOT IN (SELECT systemId FROM systems);

-- Check for orphaned sophonts (should be empty)
-- SELECT * FROM sophonts WHERE worldId NOT IN (SELECT worldId FROM worlds);

-- Count entities by type
-- SELECT 
--   'galaxies' as type, COUNT(*) as count FROM galaxies UNION ALL
--   SELECT 'sectors', COUNT(*) FROM sectors UNION ALL
--   SELECT 'systems', COUNT(*) FROM systems UNION ALL
--   SELECT 'worlds', COUNT(*) FROM worlds UNION ALL
--   SELECT 'sophonts', COUNT(*) FROM sophonts;
