# Phase 1: MVP Acceptance Criteria

**Phase:** Phase 1 Foundation + Generators  
**Duration:** Sprints 1-4 (8 weeks)  
**Definition of Done:** All criteria below passing + code merged to main branch

---

## Core Data Persistence

### SQLite-First Architecture
- [x] SQLite database created and initialized
- [x] All 6 database migrations written and executable
- [x] Migration runner (`scripts/migrate.js`) auto-applies migrations
- [x] Database schema supports cascading deletes (child entities removed when parent deleted)
- [x] Primary key and foreign key constraints enforced
- [x] Performance indexes created for common queries (FK lookups, entity lists)

**Verification:** `npm run migrate` creates schema from scratch; `npm run validate:schema` confirms all tables/columns/indexes exist

### JSON Import/Export Pipeline
- [x] JSON schemas validated for all 5 entities (Galaxy, Sector, System, World, Sophont)
- [x] `sqliteToJson()` converts all database entities to valid JSON with FK relationships preserved
- [x] `jsonToSqlite()` imports JSON data back to database with automatic ID remapping
- [x] Round-trip integrity: SQLite → JSON → SQLite → data matches 100%
- [x] Conflict detection: JSON vs database mismatch flagged with user message
- [x] Conflict resolution: Last-write-wins or merge strategy configurable
- [x] Backup/restore scripts in package.json: `npm run backup:db`, `npm run restore:db`

**Verification:** `npm test -- converters` passes all round-trip tests; backup/restore tested with 1000-entity test data

### Data Integrity
- [x] No orphaned entities: deleting galaxy removes all sectors/systems/worlds/sophonts
- [x] No duplicate IDs: uuid or auto-increment ensures unique keys across all entities
- [x] Referential integrity: all FK references point to existing parents
- [x] Data validation on insert: entity data validated against JSON schema before DB write

**Verification:** `npm run validate:integrity` runs orphan detection, FK validation, constraint checks

---

## Survey Hierarchy & Navigation

### Canonical Survey Flow
- [x] Galaxy Survey → Sector Survey → Star System Builder → World Builder → Census phases enforced
- [x] Route guards prevent navigation to child surveys without parent (no sector survey without galaxyId)
- [x] Breadcrumb navigation shows survey progression
- [x] "Back" button navigates to parent survey with data persisted
- [x] Survey completion status visible in navigation (disabled if requirements unmet)

**Verification:** Manual navigation test: click sector without galaxy → redirected with error; manual test all 5 survey pages

### Data Flow
- [x] Create galaxy → appears in galaxy list immediately
- [x] Create sector → appears in sector list for that galaxy
- [x] Create system → appears in sector's system list
- [x] Create world → appears in system's world list
- [x] Generate sophont → appears in world's sophont list
- [x] All data persists across page refresh

**Verification:** E2E test: create full hierarchy, refresh page, all entities present with correct parent/child relationships

---

## API Backend (Sprint 2 Prerequisite)

### RESTful CRUD Endpoints
- [x] POST `/api/galaxies` → create galaxy, return galaxyId
- [x] GET `/api/galaxies/:id` → return complete galaxy entity with metadata
- [x] PUT `/api/galaxies/:id` → update galaxy properties
- [x] DELETE `/api/galaxies/:id` → cascade delete all children
- [x] GET `/api/galaxies/:gid/sectors` → list all sectors for galaxy
- [x] Similar CRUD endpoints for sectors, systems, worlds, sophonts
- [x] Validation middleware validates request bodies against JSON schemas
- [x] Error middleware returns standard responses (400, 404, 500, etc.)

**Verification:** Postman collection tests all endpoints; integration tests verify cascade delete

### Import/Export Endpoints
- [x] POST `/api/import` → accept JSON universe, validate, import to DB
- [x] GET `/api/export/:galaxyId` → return single galaxy with all children as JSON
- [x] GET `/api/export?type=all` → return entire universe as JSON

**Verification:** Manual test: import JSON → verify in database; export → verify JSON schema

---

## Frontend Integration (Sprint 2 Prerequisite)

### Pinia Stores Migration
- [x] `galaxyStore` migrated from localStorage to API backend
- [x] All store actions call API endpoints (create, read, update, delete)
- [x] Stores maintain local state cache for immediate UI updates (optimistic updates)
- [x] Stores sync cache with database on API response
- [x] Error handling with user-friendly toast notifications

**Verification:** Manual test: create entity → save to DB → reload page → entity persists from API

### Route Guards
- [x] Global navigation guard checks parent entity exists before allowing child survey navigation
- [x] Redirect to parent survey with error message if requirements unmet
- [x] Survey navigation buttons disabled in UI if requirements unmet

**Verification:** Manual test: click sector without galaxy → see error message + redirect to GalaxySurvey

---

## Generator Suite

### Sophont Generator (Sprint 3)
- [x] SophontGenerator page integrated with `sophontStore`
- [x] Save sophont button persists to API
- [x] Body plan options (humanoid, avian, aquatic, etc.) with random or manual selection
- [x] Culture traits generator (values, taboos, structure)
- [x] Sophont list view shows all sophonts for a world
- [x] Export sophont as JSON

**Verification:** Manual test: generate sophont → save → refresh page → sophont persists

### Creature/Fauna Generator (Sprint 3)
- [x] CreatureGenerator page with form (size, diet, habitat, armor, weapons)
- [x] Body plan options (bilateral, radial, swarm, etc.)
- [x] Ecosystem role generator (apex predator, herbivore, etc.)
- [x] Environmental fit checker: flag incompatibilities with world atmosphere/gravity
- [x] Creature list view showing all fauna for a world
- [x] Persist and export creatures as JSON

**Verification:** Manual test: generate creature incompatible with world TL → see warning; save → persists

### History Generator (Sprint 3)
- [x] HistoryGenerator page with timeline visualization
- [x] Event type categories (war, discovery, collapse, migration, contact, etc.)
- [x] Causal chain linking (event A causes event B)
- [x] Timeline rendered chronologically with color-coded event types
- [x] Export timeline as markdown chronological list

**Verification:** Manual test: create 20 events → timeline renders in chronological order; export as markdown

### Visualizations (Sprint 3)

**Galaxy Density Heatmap**
- [x] Color gradient visualization (blue = low, red = high density)
- [x] Sector grid overlay with coordinates
- [x] Hover tooltip shows sector coordinates and density %
- [x] Click sector → navigate to SectorSurvey
- [x] Zoom/pan controls responsive

**Verification:** Manual test: open GalaxySurvey → heatmap renders; hover shows data; click sector navigates

---

## Vehicle & Character Generators (Sprint 4)

### Vehicle Generator
- [x] Form: vehicle type (ground, air, space, water), class (civilian, military, etc.)
- [x] Tech level constraints: disabled features above world TL
- [x] Performance calculator (speed, cargo, crew, weapons based on type+TL)
- [x] Cost calculator
- [x] Persist to API, list view, export JSON

**Verification:** TL 4 world → no space vehicles available; create vehicle → save → persists

### Character Generator
- [x] Traveller 5 character generation: attributes (2D6), career, terms, skills
- [x] Equipment allocation based on career and world tech level
- [x] Character sheet export (PDF and printable HTML)
- [x] Party roster view grouping characters by session/campaign
- [x] Persist to API, list/detail views

**Verification:** Generate character → export PDF → printable sheet valid; save → persists

### Sector Map & Orbital Diagram
- [x] Sector hex map renders 32x40 grid with systems plotted at correct coordinates
- [x] Click system → navigate to StarSystemBuilder
- [x] System orbital diagram shows stars and worlds at orbital distances
- [x] Habitable zone overlay visualized on diagram
- [x] Click world → navigate to WorldBuilder

**Verification:** Manual test: open SectorSurvey → hex map renders; click system → navigate; orbital diagram shows habitats

---

## Dashboard & Session Planner (Sprint 4)

### Dashboard
- [x] Root route `/` or `/dashboard` shows universe overview
- [x] Statistics widget: galaxies, sectors, systems, worlds, sophonts counts
- [x] Recent activity timeline: last 10 entities created
- [x] Quick actions: create galaxy, import JSON, export all, backup
- [x] Galaxy list with preview cards (name, type, sector count)
- [x] Search/filter functionality (by name or entity type)
- [x] Data health indicators (orphaned entities, missing FKs, integrity status)

**Verification:** Manual test: create entities → dashboard stats update; search finds entities; health check shows green

### Session Planner
- [x] Session creation form: name, date, participants, location
- [x] Entity linking: attach characters, worlds, systems, sophonts to session
- [x] Notes editor with markdown support
- [x] Session history: list past sessions chronologically
- [x] Export session notes as markdown

**Verification:** Manual test: create session → attach entities → add notes → reload → data persists

---

## Testing & Quality Gates

### Unit Tests
- [ ] Database layer: migrations, CRUD operations, cascade deletes
- [ ] Converters: round-trip integrity, conflict detection
- [ ] Validators: JSON schema validation with valid/invalid test cases
- [ ] Stores: state mutations, API calls, error handling

**Target:** 80%+ code coverage for backend generators and data layer

### Integration Tests
- [ ] API endpoints: CRUD workflows for all entities
- [ ] Import/export: JSON round-trip with 1000-entity test data
- [ ] Frontend → Backend: create entity in UI → persists to DB → reload → entity reappears

**Target:** All critical paths tested, deployment gate requires passing integration tests

### Performance Benchmarks
- [ ] Insert 1000 systems → query time < 100ms
- [ ] Export galaxy with 10 sectors → export time < 2s
- [ ] Restore 1000-system backup → restore time < 5s
- [ ] Dashboard with 1000 entities → load time < 3s
- [ ] Sector hex map with 500 systems → interactive (60fps zoom/pan)

**Target:** All benchmarks passing before deployment

---

## Documentation

### Architectural Documentation
- [x] Survey hierarchy flow diagram (Galaxy → Sector → System → World → Census)
- [x] Data model ER diagram (entities, relationships, cardinality)
- [x] JSON schema documentation with examples
- [x] API endpoint documentation (Swagger/OpenAPI)

### User Guides
- [x] Getting started guide (create first galaxy → survey workflow)
- [x] Generator guides (how to use each generator, what each field means)
- [x] Import/export guide (how to backup and restore data)
- [x] Visualization guide (how to read heatmap, orbital diagram, sector map)

### Developer Guides
- [x] Database schema documentation
- [x] Migration guide (how to add new tables/migrations)
- [x] API extensibility guide (how to add new endpoints)
- [x] Store pattern guide (how to create new Pinia stores)

---

## Definition of "Done" for Phase 1 MVP

✅ All deliverables from Sprints 1-4 completed and merged to main branch  
✅ All verification criteria passing  
✅ All tests passing (unit, integration, performance benchmarks)  
✅ Documentation complete and reviewed  
✅ Code reviewed and approved  
✅ Zero critical bugs (all known issues tracked in GitHub Issues)  
✅ Ready for production deployment  

---

## Success Metrics

After Phase 1 MVP:
- Users can create complete universes (Galaxy → Sector → System → World → Sophont)
- Data persists across sessions (SQLite backend)
- All data can be backed up and restored as JSON
- 7 major generators functional (sophont, creature, history, vehicle, character, session planner, and fauna)
- 3 visualizations ready (density heatmap, sector map, orbital diagram)
- Dashboard provides complete universe overview
- Performance acceptable for datasets with 1000+ entities

---

## Blockers & Dependencies

### No External Blockers
- All required technologies available (SQLite, Express, Vue 3, etc.)
- No external API dependencies (standalone system)

### Internal Dependencies
- Sprint 1 (Data Foundation) MUST complete before Sprint 2 (API)
- Sprint 2 (API) MUST complete before Sprint 3 (Generators + visualizations)
- Sprint 3 MUST complete before Sprint 4 (Dashboard + Session Planner)
- Strict sequential dependency chain - cannot parallelize across sprints

---

## Post-MVP Roadmap (Phase 2+)

Once Phase 1 MVP complete, future phases can add:
- Trade route generation and economics simulation
- Name generation system (procedural names for all entities)
- Advanced 3D visualizations (3D galaxy model)
- Random encounter tables and event generators
- Flora (plant life) generator
- Detailed economic systems (GDPs, trade goods, tariffs)
- Advanced character interactions (relationships, rivals, allies)
- Campaign/adventure session planner with NPC tracking
