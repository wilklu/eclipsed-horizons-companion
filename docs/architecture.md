# System Architecture

## Data Flow

Vue 3 Frontend (localhost:5173)
↓ (axios API call)
Express Backend (localhost:3000)
↓ (SQL query)
SQLite Database (database/eclipsed-horizon.db)

## Key Components

### Frontend (Vue 3)

- `StarSystemForm.vue` - Main form for generating systems
- `StarForm.vue` - Individual star configuration
- `PlanetForm.vue` - Individual planet configuration
- API calls via axios

### Backend (Express)

- `/api/systems` - CRUD operations
- `/api/generate` - Generation algorithms
- Database queries via sqlite3

### Database (SQLite)

- `star_systems` - Main system records
- `stars` - Stellar data
- `planets` - Planetary data
- `system_history` - Undo/version tracking

## Generation Workflow

1. User inputs parameters in Vue form
2. Clicks "Generate"
3. Frontend sends POST to `/api/systems/generate`
4. Backend runs algorithm (World Builders rules)
5. Returns generated data to Vue
6. Vue displays in "Preview" mode
7. User clicks "Save"
8. Data commits to SQLite with history entry
9. User can "Undo" to previous version

## Seeding for Reproducibility

- All generators accept optional seed parameter
- Same seed = same output every time
- Useful for sharing universes with players
