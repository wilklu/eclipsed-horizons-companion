# Sprint 1 Implementation - Quick Start Guide

## What Was Built

✅ **Complete SQLite database foundation** with 5 core entities:
- Galaxies, Sectors, Systems, Worlds, Sophonts
- Automatic cascade deletes (deleting galaxy removes all children)
- Foreign key constraints enforced
- Performance indexes optimized

✅ **JSON Schemas** for all entities with AJV validation:
- Validates all data before database writes
- Detailed error messages with field paths
- Supports bulk validation and universe-wide checks

✅ **Data Converters** for SQLite ↔ JSON conversion:
- Export database to JSON with all relationships preserved
- Import JSON with automatic ID remapping
- Nested hierarchies maintained (Galaxy → Sector → System → World → Sophont)

✅ **Backup & Restore Services**:
- Full universe backups to JSON
- Selective galaxy backups with all children
- Restore with conflict detection and dry-run mode
- Verification and rollback support

✅ **Architecture Documentation**:
- Survey hierarchy and navigation rules
- Phase 1 MVP acceptance criteria
- Data flow diagrams and examples

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

This adds: `ajv`, `better-sqlite3`, `uuid`

### 2. Initialize Database
```bash
npm run db:migrate
```

Creates the SQLite database with all 6 migrations applied.

### 3. Verify Setup
```bash
npm run db:migrate
# Output: "✓ Database is up to date"
```

---

## Usage Examples

### Create Galaxy (via Node REPL or script)
```javascript
import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

const db = new Database('apps/system-generator/backend/data/universe.db');

const galaxyId = `gal-${uuid()}`;

db.prepare(`
  INSERT INTO galaxies (galaxyId, name, type, morphology, metadata, importMetadata)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(
  galaxyId,
  'Milky Way',
  'Spiral',
  JSON.stringify({
    bulgeRadius: 10000,
    armCount: 2,
    coreDensity: 0.8,
    diskThickness: 1000
  }),
  JSON.stringify({
    createdAt: new Date().toISOString(),
    status: 'active',
    version: 1
  }),
  JSON.stringify({ isImported: false })
);

console.log('✓ Galaxy created:', galaxyId);
```

### Export Galaxy to JSON
```javascript
import { galaxyToJson } from './apps/system-generator/backend/data/converters/sqliteToJson.js';

const galaxy = await galaxyToJson(db, galaxyId);
console.log(JSON.stringify(galaxy, null, 2));
// Output: Complete galaxy with all sectors, systems, worlds, sophonts
```

### Validate Entity Against Schema
```javascript
import { validateGalaxy } from './apps/system-generator/backend/data/validators/jsonValidator.js';

const galaxyData = {
  galaxyId: 'gal-001',
  name: 'Milky Way',
  type: 'Spiral',
  morphology: { /* ... */ },
  metadata: { /* ... */ }
};

const result = validateGalaxy(galaxyData);
if (result.valid) {
  console.log('✓ Valid galaxy');
} else {
  console.error('✗ Validation errors:', result.errorMessages);
}
```

### Backup Universe
```javascript
import { backupFullUniverse } from './apps/system-generator/backend/data/backup/backupService.js';
import fs from 'fs';

const backup = await backupFullUniverse(db);

// Save to file
const timestamp = new Date().toISOString().split('T')[0];
const filename = `backup-universe-${timestamp}.json`;
fs.writeFileSync(filename, JSON.stringify(backup, null, 2));

console.log(`✓ Backup saved: ${filename}`);
```

### Restore Universe
```javascript
import { restoreFromBackup } from './apps/system-generator/backend/data/backup/restoreService.js';

const backup = JSON.parse(fs.readFileSync('backup-universe-2026-03-08.json'));

const result = await restoreFromBackup(db, backup, {
  validateSchema: true,
  dryRun: false // Set to true to test without writing
});

if (result.success) {
  console.log('✓ Restore complete');
  console.log('ID mappings:', result.idMap);
} else {
  console.error('✗ Restore failed:', result.errors);
}
```

---

## File Structure

```
apps/system-generator/backend/data/
├── database/
│   └── migrations/
│       ├── 001_create_galaxies.sql
│       ├── 002_create_sectors.sql
│       ├── 003_create_systems.sql
│       ├── 004_create_worlds.sql
│       ├── 005_create_sophonts.sql
│       └── 006_indexes_constraints.sql
├── schemas/
│   ├── galaxy-schema.json
│   ├── sector-schema.json
│   ├── system-schema.json
│   ├── world-schema.json
│   └── sophont-schema.json
├── validators/
│   └── jsonValidator.js
├── converters/
│   ├── sqliteToJson.js
│   └── jsonToSqlite.js
└── backup/
    ├── backupService.js
    └── restoreService.js
```

---

## Database Structure

### Entity Hierarchy
```
Galaxies (1)
├── Sectors (many)
│   └── Systems (many)
│       └── Worlds (many)
│           └── Sophonts (many)
```

### Key Points
- Each sector must reference a galaxy (FK)
- Each system must reference a sector (FK)
- Each world must reference a system (FK)
- Each sophont must reference a world (FK)
- Deleting parent automatically deletes all children (CASCADE)
- No orphaned entities possible

---

## Commands

```bash
# Initialize database
npm run db:migrate

# Reset database to fresh state
npm run db:reset

# Backup universe (creates backup-*.json file)
npm run db:backup

# Restore from backup (interactive)
npm run db:restore

# Validate data
npm run validate:all
```

---

## Next Steps: Sprint 2

Sprint 2 will add the API layer:
- Express/Fastify server with CRUD endpoints
- Pinia store migration from localStorage to API
- Route guards for survey hierarchy
- Error handling and loading states

The database layer (Sprint 1) is complete and ready to support the API layer.

---

## Troubleshooting

### "Database is locked" error
- Close any other connections to `universe.db`
- Run migrations again

### "Migration already applied"
- Normal - migrations are idempotent
- Safe to run `npm run db:migrate` multiple times

### "No such table" error
- Run `npm run db:migrate` first
- Check that migrations directory exists: `apps/system-generator/backend/data/database/migrations/`

### Foreign key constraint violation
- Verify parent entity exists before creating child
- Example: verify galaxy exists before creating sector for it

---

## Resources

- [Phase 1 Acceptance Criteria](..\architecture\phase-1-acceptance-criteria.md)
- [Survey Hierarchy & Architecture](..\architecture\survey-hierarchy.md)
- [Sprint 1 Completion Report](SPRINT-1-COMPLETE.md)
- [Sprint 2 Planning](sprint-2.md)
