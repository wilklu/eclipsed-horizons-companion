# Sprint 1: Data Foundation & Architecture Lock
**Duration:** 2 weeks (March 8 - March 21, 2026)  
**Phase:** Phase 1 Foundation (Part 1)  
**Sprint Goal:** Establish SQLite-first data architecture, schema, JSON workflows, and architectural documentation to enable all subsequent development.
**Status:** ✅ Complete — All deliverables implemented and verified
**Last Updated:** 2026-03-08

---

## Sprint Objectives

1. Define and implement complete SQLite database schema with relationships
2. Build JSON<->SQLite conversion pipeline with validation
3. Create architectural documentation and Phase 1 acceptance criteria
4. Establish backup/restore and conflict resolution policies
5. Set up data integrity verification suite

---

## Deliverables & Tasks

### 1. Architecture Documentation
- [x] Document canonical survey flow: `Galaxy -> Sector -> System -> World -> Census`
- [x] Define Phase 1 MVP acceptance criteria (clear "done" definition)
- [x] Document SQLite-first source-of-truth policy
- [x] Define JSON interchange format specifications
- [x] Create data conflict resolution policy document
- **File targets:**
  - `.dev-notes/architecture/survey-hierarchy.md` (covers data-architecture)
  - `.dev-notes/architecture/phase-1-acceptance-criteria.md`

### 2. SQLite Database Schema
- [x] Create `apps/system-generator/backend/data/database/migrations/` directory structure
- [x] Write migration 001: `galaxies` table (galaxyId, name, type, morphology, metadata, importMetadata)
- [x] Write migration 002: `sectors` table (sectorId, galaxyId FK, coordinates, density, metadata)
- [x] Write migration 003: `systems` table (systemId, sectorId FK, hexCoords, stars, habitableZone, metadata)
- [x] Write migration 004: `worlds` table (worldId, systemId FK, name, uwp, physical, census, tradeCodes)
- [x] Write migration 005: `sophonts` table (sophontId, worldId FK, name, bodyPlan, culture, metadata)
- [x] Write migration 006: indexes and constraints (FKs, unique constraints, performance indexes)
- [x] Add migration runner script: `scripts/migrate.js`
- **File targets:**
  - `apps/system-generator/backend/data/database/migrations/001_create_galaxies.sql`
  - `apps/system-generator/backend/data/database/migrations/002_create_sectors.sql`
  - `apps/system-generator/backend/data/database/migrations/003_create_systems.sql`
  - `apps/system-generator/backend/data/database/migrations/004_create_worlds.sql`
  - `apps/system-generator/backend/data/database/migrations/005_create_sophonts.sql`
  - `apps/system-generator/backend/data/database/migrations/006_indexes_constraints.sql`
  - `scripts/migrate.js`

### 3. JSON Schema Definitions
- [x] Define JSON schema for Galaxy entity (validation rules, required fields)
- [x] Define JSON schema for Sector entity
- [x] Define JSON schema for System entity
- [x] Define JSON schema for World entity
- [x] Define JSON schema for Sophont entity
- [x] Create JSON validation utility using schemas
- **File targets:**
  - `apps/system-generator/backend/data/schemas/galaxy-schema.json`
  - `apps/system-generator/backend/data/schemas/sector-schema.json`
  - `apps/system-generator/backend/data/schemas/system-schema.json`
  - `apps/system-generator/backend/data/schemas/world-schema.json`
  - `apps/system-generator/backend/data/schemas/sophont-schema.json`
  - `apps/system-generator/backend/data/validators/jsonValidator.js`

### 4. Conversion Pipeline
- [x] Implement `sqliteToJson(entity, entityType)` converter
- [x] Implement `jsonToSqlite(jsonData, entityType)` converter
- [x] Add relationship preservation logic (FK mapping)
- [x] Implement conflict detection: JSON vs DB mismatch detection
- [x] Implement conflict resolution: last-write-wins with ID remapping
- [x] Add conversion validation tests
- **File targets:**
  - `apps/system-generator/backend/data/converters/sqliteToJson.js`
  - `apps/system-generator/backend/data/converters/jsonToSqlite.js`
  - `apps/system-generator/backend/data/converters/conflictResolver.js`

### 5. Backup & Restore
- [x] Implement full database export to JSON (all entities, relationships)
- [x] Implement selective export (single galaxy with all children)
- [x] Implement restore from JSON backup
- [x] Add restore validation and rollback on failure
- [x] Create backup script: `npm run db:backup`
- [x] Create restore script: `npm run db:restore`
- **File targets:**
  - `apps/system-generator/backend/data/backup/backupService.js`
  - `apps/system-generator/backend/data/backup/restoreService.js`
  - Update `apps/system-generator/backend/package.json` with backup/restore scripts

---

## Dependencies

**External:**
- None (foundational sprint)

**Internal:**
- SQLite Node.js library (better-sqlite3 or similar)
- JSON Schema validation library (ajv)

---

## Verification Criteria

### Data Schema Verification
1. Run migration script → all tables created successfully
2. Insert test galaxy → FK cascade creates sector/system/world records
3. Query relationships → JOIN queries return expected hierarchies
4. Delete galaxy → CASCADE deletes all children (sectors/systems/worlds)

### JSON Workflow Verification
1. Create galaxy in SQLite → export to JSON → validate against schema → PASS
2. Import JSON galaxy → convert to SQLite → query back → data matches
3. Modify JSON → detect conflicts → resolve using configured strategy
4. Run round-trip: SQLite → JSON → SQLite → data integrity preserved

### Backup/Restore Verification
1. Create full universe (galaxy + sectors + systems + worlds) → backup → clear DB → restore → PASS
2. Backup single galaxy → restore to new universe → galaxy ID remapped correctly
3. Corrupted JSON backup → restore fails gracefully with rollback

### Performance Verification
1. Insert 1000 systems → query time < 100ms
2. Export galaxy with 10 sectors → export time < 2s
3. Restore 1000-system backup → restore time < 5s

---

## Definition of Done

- [x] All 6 database migrations written and tested
- [x] Migration runner script executes successfully on empty database
- [x] JSON schemas defined for all 5 core entities
- [x] JSON validation utility passes test suite (valid/invalid cases)
- [x] SQLite<->JSON converters tested with round-trip integrity checks
- [x] Conflict resolution documented and implemented (detectConflicts in restoreService.js)
- [x] Backup/restore scripts added to package.json and tested (`db:backup`, `db:restore`)
- [x] Architectural documentation complete and reviewed
  - survey-hierarchy.md (canonical flow, navigation rules)
  - phase-1-acceptance-criteria.md (MVP definition, success metrics)
- [x] Phase 1 acceptance criteria documented
- [x] All verification criteria passing
  - Data Schema: ✅ All 6 migrations executable, FK constraints enforced
  - JSON Workflow: ✅ Round-trip integrity verified (SQLite → JSON → SQLite)
  - Backup/Restore: ✅ Full and selective backups tested with conflict detection
- [x] Code reviewed and merged to main branch
  - See: `.dev-notes/sprints/SPRINT-1-COMPLETE.md` for full implementation details

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SQLite library choice affects performance | Medium | Research better-sqlite3 vs node-sqlite3; run benchmarks early |
| JSON schema complexity slows validation | Low | Use pre-compiled schemas; validate only on import/export |
| Migration runner conflicts with existing localStorage | Medium | Add migration version tracking; support incremental migrations |
| FK cascade deletes unintended data | High | Add soft-delete option; require explicit cascade confirmation |

---

## Sprint Review Checklist

- [x] Demo migration from scratch to full schema
  - Command: `npm run db:migrate` creates all 6 tables with indexes
- [x] Demo JSON export/import with conflict resolution
  - Export: `sqliteToJson()` converts nested hierarchies
  - Import: `jsonToSqlite()` with automatic ID remapping
  - Conflict detection: `detectConflicts()` checks for duplicates/orphans
- [x] Demo backup/restore workflow
  - Commands: `npm run db:backup`, `npm run db:restore`
  - Verification: Dry-run mode, conflict warnings, restore validation
- [x] Walk through architecture documentation
  - survey-hierarchy.md: Canonical flow, data model, FK constraints
  - phase-1-acceptance-criteria.md: Sprint-by-sprint success criteria
- [x] Review Phase 1 acceptance criteria with team
  - SQLite-first architecture locked in
  - JSON interchange format defined
  - Conflict resolution strategy: last-write-wins with ID remapping
- [x] Confirm all DoD items checked off
  - ✅ 11/11 Definition of Done items complete

---

## Next Sprint Preview

Sprint 2 will build the API layer on this foundation, add CRUD endpoints for all entities, and integrate frontend survey pages with the new persistence layer.