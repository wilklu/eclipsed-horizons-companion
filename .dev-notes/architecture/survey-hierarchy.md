# Survey Hierarchy & Class Levels

## Canonical Survey Flow

The Traveller 5 universe creation follows a strict hierarchical progression:

```
Galaxy Survey (Class 0)
    └── Sector Survey (Class 1)
        └── Star System Builder (Class II)
            └── World Builder (Class II-IV)
                └── Census / Sophont Generator (Class V)
```

### Why This Order Matters

1. **Galaxy Survey** - Define the universe's macro properties
   - Galaxy type (spiral, elliptical, barred spiral, etc.)
   - Density distribution (core, arms, disk)
   - Size and morphology
   - Creates foundation for all sectors

2. **Sector Survey** - Define regional density and characteristics
   - Sector coordinates within galaxy
   - Local density variation (spiral arm, core, halo)
   - System count and distribution
   - Cannot exist without parent galaxy

3. **Star System Builder** - Define stellar configurations
   - Star count and spectral classes
   - Orbital mechanics and habitable zones
   - Cannot exist without parent sector

4. **World Builder** - Define planetary and atmospheric characteristics
   - UWP (Universal World Profile) code generation
   - Physical properties (size, gravity, atmosphere)
   - Trade codes and starport quality
   - Cannot exist without parent system

5. **Census / Sophont Generator** - Define intelligent life
   - Sophont species (body plan, culture, technology)
   - Population and tech level by world
   - Cannot assign to worlds without existing worlds

---

## Data Model Relationships

### Entity Hierarchy

```
Galaxies (1)
    ├─ created_at: timestamp
    ├─ name: string
    ├─ type: enum (Spiral, Elliptical, Barred Spiral, Irregular)
    ├─ morphology: object (bulge radius, arm count, core density)
    └─ Sectors (many)
        ├─ coordinates: [x, y] (hex coordinates)
        ├─ density_class: enum (0, 1, 2, 3, 4, 5) 
        └─ Systems (many)
            ├─ hex_coordinates: [x, y] (within sector)
            ├─ stellar_count: integer (1-4 stars typically)
            └─ Worlds (many)
                ├─ orbit: integer (distance from primary star in AU)
                ├─ uwp: string (e.g., "A877899-E")
                └─ Sophonts (many)
                    ├─ name: string
                    ├─ body_plan: enum
                    └─ tech_level: integer (TL 0-15)
```

### Foreign Key Constraints

- Sector.galaxyId → Galaxies.galaxyId (CASCADE DELETE)
- System.sectorId → Sectors.sectorId (CASCADE DELETE)
- World.systemId → Systems.systemId (CASCADE DELETE)
- Sophont.worldId → Worlds.worldId (CASCADE DELETE)

When a parent entity is deleted, all child entities are automatically removed.

---

## Navigation Rules

### Route Guard Logic

**SectorSurvey Route:** `/survey/sector/:sectorId`
```
if (no currentGalaxy) {
  redirect to /survey/galaxy with error "Select a galaxy first"
}
if (sectorId not in currentGalaxy.sectors) {
  redirect to /survey/sector with error "Sector not found"
}
allow navigation
```

**StarSystemBuilder Route:** `/survey/system/:systemId`
```
if (no currentGalaxy) {
  redirect to /survey/galaxy with error "Select a galaxy first"
}
if (no currentSector) {
  redirect to /survey/sector with error "Select a sector first"
}
if (systemId not in currentSector.systems) {
  redirect to /survey/system with error "System not found"
}
allow navigation
```

**WorldBuilder Route:** `/survey/world/:worldId`
```
if (no currentGalaxy || no currentSector || no currentSystem) {
  redirect to appropriate parent survey with error
}
if (worldId not in currentSystem.worlds) {
  redirect to /survey/world with error "World not found"
}
allow navigation
```

**SophontGenerator Route:** `/survey/sophont/:worldId`
```
if (no currentGalaxy || no currentSector || no currentSystem || no currentWorld) {
  redirect to appropriate parent survey with error
}
if (worldId not in currentSystem.worlds) {
  redirect to /survey/sophont with error "World not found"
}
allow navigation
```

### Breadcrumb Navigation

Display hierarchy showing current position:
```
Galaxy: Milky Way > Sector: 0101 > System: 0101A > World: 0101A-I > Sophonts
```

- Each link is clickable and navigates to that level
- Disabled if not accessible (e.g., Sector link disabled if no galaxy selected)
- Shows current level in bold

---

## Data Persistence Flow

### Create Flow
```
User creates Galaxy
  ↓
Frontend: {name, type, morphology} → POST /api/galaxies
  ↓
Backend: Validate JSON schema → Insert to SQLite → Return galaxyId + metadata
  ↓
Frontend: Pinia store updates → UI refreshes galaxy list → User sees new galaxy
  ↓
User clicks "Create Sector" for this galaxy
  ↓
Frontend: {coordinates, sectorData} → POST /api/galaxies/:gid/sectors
  ↓
Backend: Validate FK (galaxy exists) → Insert to SQLite → Return sectorId
  ↓
Frontend: Pinia store updates → Sector appears in list for this galaxy
```

### Refresh Flow
```
User refreshes page (F5)
  ↓
Frontend: App initializes Pinia stores
  ↓
Store hydration: GET /api/galaxies → Fetch all galaxies from DB
  ↓
Frontend: Display all galaxies in list
  ↓
If currentGalaxyId in localStorage:
  GET /api/galaxies/:gid/sectors → Fetch sectors for this galaxy
  ↓
Current galaxy + sectors restored to exact state before refresh
```

---

## Import/Export Flow

### Export Galaxy to JSON
```
User clicks "Export" for Galaxy: Milky Way
  ↓
Frontend: GET /api/export/milky-way-id
  ↓
Backend: 
  1. Query galaxies table WHERE id=milky-way-id
  2. Query sectors table WHERE galaxyId=milky-way-id
  3. Query systems table WHERE sectorId IN (all sectors)
  4. Query worlds table WHERE systemId IN (all systems)
  5. Query sophonts table WHERE worldId IN (all worlds)
  ↓
Backend: Convert all entities to JSON with nested relationships
  ↓
Backend: Validate against JSON schema
  ↓
Frontend: Download as "milky-way.json"
```

### Import JSON to DB
```
User selects "Import Universe" and chooses "milky-way.json"
  ↓
Frontend: Read file → Validate JSON schema
  ↓
Frontend: POST /api/import {universe: {...}}
  ↓
Backend: 
  1. Start transaction
  2. For each galaxy: INSERT with new ID (remap)
  3. For each sector: INSERT with new ID + remapped galaxyId
  4. For each system: INSERT with new ID + remapped sectorId
  5. For each world: INSERT with new ID + remapped systemId
  6. For each sophont: INSERT with new ID + remapped worldId
  7. Commit transaction
  ↓
Backend: Return success with imported galaxyId
  ↓
Frontend: Navigate to new galaxy → Show all imported entities
```

---

## Validation Rules

### Galaxy Level
- Name: 1-100 characters, non-empty
- Type: must be valid enum (Spiral, Elliptical, etc.)
- Morphology: valid range for bulge radius, arm count, core density

### Sector Level
- Must have parent galaxy
- Coordinates: [0-31, 0-39] for standard Traveller sector (32x40 hex)
- Density: 0-5 (standard Traveller density classification)
- Sector cannot be created if parent galaxy doesn't exist

### System Level
- Must have parent sector
- Hex coordinates: [0-31, 0-39] within sector
- Star count: 1-4 (most common, but game allows more)
- Each star must have valid spectral class (A-M, or WD, etc.)

### World Level
- Must have parent system
- UWP code: must match Traveller 5 format (e.g., "A877899-E")
- Orbit: valid AU distance from star
- Size, atmosphere, hydrographics: 0-A or X
- Government, law level, tech level: valid ranges per Traveller rules

### Sophont Level
- Must have parent world
- Name: 1-100 characters, non-empty
- Body plan: valid enum (humanoid, avian, aquatic, etc.)
- Tech level: 0-15
- Population: 0-12 digits

---

## Performance Expectations

### Query Performance Targets

| Query | Target | Notes |
|-------|--------|-------|
| List all galaxies (100) | < 50ms | Simple select, indexed |
| Get galaxy + sectors (10 sectors) | < 100ms | Single FK join |
| Get sector + all systems (100 systems) | < 200ms | Single FK join, may need index |
| Export galaxy (10 sectors, 1000 systems, 5000 worlds) | < 2s | Multiple FK joins, convert to JSON |
| Import same data | < 3s | Large transaction, ID remapping |
| Search worlds by tech level (across 10K worlds) | < 500ms | Needs indexed tech_level column |

### Caching Strategy

- Galaxies list: Cache in Pinia store, invalidate on create/update/delete
- Current galaxy sectors: Cache in Pinia store, load on galaxy change
- System details: Cache after fetch, invalidate on edit
- Never cache: Exports (always fresh from DB), backups (always current state)

---

## Error Handling

### User-Facing Errors

```
403 (Forbidden)
  "Cannot create sector: Galaxy not found"
  → User navigates to galaxy first

400 (Bad Request)
  "Invalid UWP code 'ZZZ999-ZZ': Must match Traveller format"
  → User corrects input

404 (Not Found)
  "World ID 'world-123' not found in this system"
  → Navigate to parent survey, reload data

500 (Server Error)
  "Database error: FK constraint violation"
  → Retry or contact admin
```

### Debug Mode

Enable debug logging for:
- All database queries (timing, row count)
- All JSON schema validations (pass/fail reason)
- All FK cascade deletes (entities deleted count)
- All API requests/responses (latency, size)

---

## Future Extensions

### Parallel Generators (Phase 2)

Once core survey hierarchy solid, can add generators that don't break hierarchy:
- Flora generator → adds to world without affecting sophonts
- Trade route generator → cross-references existing systems/worlds
- History generator → adds timeline events to any entity
- Random encounter table → standalone generator

### Multi-User Support (Phase 3)

Potential for collaborative editing:
- Add user_id FK to all tables
- Add created_by, last_modified_by audit fields
- Implement optimistic locking for concurrent edits
- Conflict resolution UI for merge conflicts

---
