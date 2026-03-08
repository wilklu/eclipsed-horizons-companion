# Sprint 1: Data Foundation & Architecture Lock
**Duration:** 2 weeks (March 8 - March 21, 2026)  
**Phase:** Phase 1 Foundation (Part 1)  
**Sprint Goal:** Establish SQLite-first data architecture, schema, JSON workflows, and architectural documentation to enable all subsequent development.

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
- [ ] Document canonical survey flow: `Galaxy -> Sector -> System -> World -> Census`
- [ ] Define Phase 1 MVP acceptance criteria (clear "done" definition)
- [ ] Document SQLite-first source-of-truth policy
- [ ] Define JSON interchange format specifications
- [ ] Create data conflict resolution policy document
- **File targets:**
  - `.dev-notes/architecture/data-architecture.md`
  - `.dev-notes/architecture/phase-1-acceptance-criteria.md`

### 2. SQLite Database Schema
- [ ] Create `apps/system-generator/backend/data/database/migrations/` directory structure
- [ ] Write migration 001: `galaxies` table (galaxyId, name, type, morphology, metadata, importMetadata)
- [ ] Write migration 002: `sectors` table (sectorId, galaxyId FK, coordinates, density, metadata)
- [ ] Write migration 003: `systems` table (systemId, sectorId FK, hexCoords, stars, habitableZone, metadata)
- [ ] Write migration 004: `worlds` table (worldId, systemId FK, name, uwp, physical, census, tradeCodes)
- [ ] Write migration 005: `sophonts` table (sophontId, worldId FK, name, bodyPlan, culture, metadata)
- [ ] Write migration 006: indexes and constraints (FKs, unique constraints, performance indexes)
- [ ] Add migration runner script: `scripts/migrate.js`
- **File targets:**
  - `apps/system-generator/backend/data/database/migrations/001_create_galaxies.sql`
  - `apps/system-generator/backend/data/database/migrations/002_create_sectors.sql`
  - `apps/system-generator/backend/data/database/migrations/003_create_systems.sql`
  - `apps/system-generator/backend/data/database/migrations/004_create_worlds.sql`
  - `apps/system-generator/backend/data/database/migrations/005_create_sophonts.sql`
  - `apps/system-generator/backend/data/database/migrations/006_indexes_constraints.sql`
  - `scripts/migrate.js`

### 3. JSON Schema Definitions
- [ ] Define JSON schema for Galaxy entity (validation rules, required fields)
- [ ] Define JSON schema for Sector entity
- [ ] Define JSON schema for System entity
- [ ] Define JSON schema for World entity
- [ ] Define JSON schema for Sophont entity
- [ ] Create JSON validation utility using schemas
- **File targets:**
  - `apps/system-generator/backend/data/schemas/galaxy-schema.json`
  - `apps/system-generator/backend/data/schemas/sector-schema.json`
  - `apps/system-generator/backend/data/schemas/system-schema.json`
  - `apps/system-generator/backend/data/schemas/world-schema.json`
  - `apps/system-generator/backend/data/schemas/sophont-schema.json`
  - `apps/system-generator/backend/data/validators/jsonValidator.js`

### 4. Conversion Pipeline
- [ ] Implement `sqliteToJson(entity, entityType)` converter
- [ ] Implement `jsonToSqlite(jsonData, entityType)` converter
- [ ] Add relationship preservation logic (FK mapping)
- [ ] Implement conflict detection: JSON vs DB mismatch detection
- [ ] Implement conflict resolution: last-write-wins or merge strategies
- [ ] Add conversion validation tests
- **File targets:**
  - `apps/system-generator/backend/data/converters/sqliteToJson.js`
  - `apps/system-generator/backend/data/converters/jsonToSqlite.js`
  - `apps/system-generator/backend/data/converters/conflictResolver.js`

### 5. Backup & Restore
- [ ] Implement full database export to JSON (all entities, relationships)
- [ ] Implement selective export (single galaxy with all children)
- [ ] Implement restore from JSON backup
- [ ] Add restore validation and rollback on failure
- [ ] Create backup script: `npm run backup:db`
- [ ] Create restore script: `npm run restore:db`
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

- [ ] All 6 database migrations written and tested
- [ ] Migration runner script executes successfully on empty database
- [ ] JSON schemas defined for all 5 core entities
- [ ] JSON validation utility passes test suite (valid/invalid cases)
- [ ] SQLite<->JSON converters tested with round-trip integrity checks
- [ ] Conflict resolution documented and implemented with test cases
- [ ] Backup/restore scripts added to package.json and tested
- [ ] Architectural documentation complete and reviewed
- [ ] Phase 1 acceptance criteria documented
- [ ] All verification criteria passing
- [ ] Code reviewed and merged to main branch

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

- [ ] Demo migration from scratch to full schema
- [ ] Demo JSON export/import with conflict resolution
- [ ] Demo backup/restore workflow
- [ ] Walk through architecture documentation
- [ ] Review Phase 1 acceptance criteria with team
- [ ] Confirm all DoD items checked off

---

## Next Sprint Preview

Sprint 2 will build the API layer on this foundation, add CRUD endpoints for all entities, and integrate frontend survey pages with the new persistence layer.