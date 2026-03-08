# Sprint 4: Advanced Generators & Visualization Polish
**Duration:** 2 weeks (April 19 - May 2, 2026)  
**Phase:** Phase 2 Generators (Part 2) + Dashboard  
**Sprint Goal:** Complete vehicle/character generators, add sector/system maps, build dashboard with universe overview

---

## Sprint Objectives

1. Build Vehicle Generator with tech level constraints
2. Enhance Character Generator with Traveller 5 rules
3. Create sector hex map and system orbital diagram visualizations
4. Build dashboard with universe overview and statistics
5. Enhance Session Planner with entity linking

---

## Deliverables & Tasks

### 1. Vehicle Generator
- [ ] Create vehicles database table:
  - vehicleId (PK), worldId (FK), name, vehicleType, techLevel, vehicleClass, performance (speed, cargo, crew, weapons), cost
- [ ] Add vehicles migration to database schema
- [ ] Create `vehicleStore.js` with API integration (CRUD actions)
- [ ] Build VehicleGenerator.vue UI with form fields:
  - Vehicle type (ground, air, space, water, submersible)
  - Vehicle class (civilian, military, commercial, exploration)
  - Tech level slider (constrained by world TL)
- [ ] Add tech level constraints validator:
  - Check world UWP tech level
  - Disable vehicle features above world TL
  - Show warnings for mismatched tech
- [ ] Add vehicle class generator with templates:
  - Civilian: Car, Truck, Bus, Motorcycle
  - Military: Tank, APC, Fighter, Bomber
  - Commercial: Cargo hauler, Passenger liner
  - Space: Shuttle, Freighter, Scout, Warship
- [ ] Add performance calculator:
  - Speed based on type + tech level
  - Cargo capacity based on size
  - Crew requirements based on class
  - Weapons based on class (military only)
- [ ] Add cost calculator based on TL and features
- [ ] Add persist/list/detail views for vehicles
- [ ] Add export vehicle as JSON
- **File targets:**
  - Create `apps/system-generator/frontend/src/pages/surveys/VehicleGenerator.vue`
  - Create `apps/system-generator/frontend/src/stores/vehicleStore.js`
  - Create `apps/system-generator/backend/generators/vehicleGenerator.js`

### 2. Character Generator Enhancement
- [ ] Create characters database table:
  - characterId (PK), worldId (FK nullable), name, species, attributes (UPP), careers, skills, equipment, background
- [ ] Add characters migration to database schema
- [ ] Create `characterStore.js` with API integration
- [ ] Integrate CharacterGenerator.vue with store
- [ ] Implement Traveller 5 character generation:
  - Attribute rolling (2D6 for STR, DEX, END, INT, EDU, SOC)
  - Career selection (Navy, Army, Scout, Merchant, etc.)
  - Term resolution (4-year terms with skill gains)
  - Mustering out benefits (credits, equipment, ship shares)
- [ ] Add equipment allocation based on career and world tech level:
  - Check world TL for available equipment
  - Auto-suggest equipment matching career
- [ ] Add character sheet export:
  - PDF generation (server-side or client-side library)
  - Printable HTML version
  - JSON export for backup
- [ ] Add character background generator:
  - Random events during career terms
  - Connections and contacts
  - Distinguishing features
- [ ] Add party roster view:
  - List all characters grouped by session/campaign
  - Summary stats (total skills, average UPP)
- [ ] Add edit/delete workflows for characters
- **File targets:**
  - Update `apps/system-generator/frontend/src/pages/surveys/CharacterGenerator.vue`
  - Create `apps/system-generator/frontend/src/stores/characterStore.js`
  - Create `apps/system-generator/backend/generators/characterGenerator.js`
  - Create `apps/system-generator/backend/generators/pdfExporter.js`

### 3. Sector & System Map Visualizations

#### Sector Hex Map
- [ ] Create `SectorHexMap.vue` component using Canvas or SVG
- [ ] Render hexagonal grid (standard Traveller sector: 32x40 hexes)
- [ ] Plot systems on sector grid at correct hex coordinates
- [ ] Add color coding for system status:
  - Gray = unexplored
  - Blue = surveyed (Class 0/1)
  - Green = inhabited worlds present
  - Red = restricted/hostile
- [ ] Add system click handler → navigate to StarSystemBuilder
- [ ] Add hover tooltip showing system name and quick stats
- [ ] Add zoom/pan controls
- [ ] Add coordinate labels on axes
- [ ] Integrate into SectorSurvey.vue page
- **File targets:**
  - Create `apps/system-generator/frontend/src/components/visualizations/SectorHexMap.vue`
  - Update `apps/system-generator/frontend/src/pages/surveys/SectorSurvey.vue`

#### System Orbital Diagram
- [ ] Create `SystemOrbitalDiagram.vue` component using Canvas or SVG
- [ ] Plot central star(s) at origin
- [ ] Plot worlds at orbital distances (AU scale)
- [ ] Add orbital paths (circles/ellipses)
- [ ] Add habitable zone overlay (green band)
- [ ] Add color coding for worlds:
  - Brown = rocky/barren
  - Blue = water world
  - Red = hot world
  - Cyan = ice world
  - Green = habitable
- [ ] Add world click handler → navigate to WorldBuilder
- [ ] Add hover tooltip showing world name, orbit, and UWP
- [ ] Add scale indicator (AU or planetary diameters)
- [ ] Integrate into StarSystemBuilder.vue page
- **File targets:**
  - Create `apps/system-generator/frontend/src/components/visualizations/SystemOrbitalDiagram.vue`
  - Update `apps/system-generator/frontend/src/pages/surveys/StarSystemBuilder.vue`

### 4. Dashboard & Universe Overview
- [ ] Create Dashboard.vue page component
- [ ] Add route at root `/` or `/dashboard`
- [ ] Build statistics summary section:
  - Total galaxies, sectors, systems, worlds, sophonts
  - Total characters, vehicles, creatures, history events
  - Database size and last backup date
- [ ] Build recent activity timeline:
  - Last 10 created entities (any type)
  - Show timestamp, entity type, entity name
  - Click to navigate to entity detail
- [ ] Build quick actions section:
  - "Create New Galaxy" button → navigate to GalaxySurvey
  - "Import Universe from JSON" → file picker → import workflow
  - "Export All Data" → download full universe as JSON
  - "Backup Database" → trigger backup script
- [ ] Build galaxy list with preview cards:
  - Card layout showing galaxy name, type, sector count
  - Click card → navigate to GalaxySurvey with galaxyId
  - Edit/delete buttons on hover
- [ ] Add search/filter functionality:
  - Search by entity name or type
  - Filter by entity type (galaxy, sector, system, world, etc.)
  - Show results in table or list
- [ ] Add data health indicators:
  - Orphaned entities (sectors without galaxy, etc.)
  - Missing required fields
  - Integrity check status (green/yellow/red)
- [ ] Add data visualization widgets:
  - Chart: Systems by spectral class
  - Chart: Worlds by tech level distribution
  - Chart: Sophonts by body plan
- **File targets:**
  - Create `apps/system-generator/frontend/src/pages/Dashboard.vue`
  - Update `apps/system-generator/frontend/src/router/index.js` with dashboard route
  - Create `apps/system-generator/frontend/src/components/dashboard/StatsSummary.vue`
  - Create `apps/system-generator/frontend/src/components/dashboard/RecentActivity.vue`
  - Create `apps/system-generator/frontend/src/components/dashboard/GalaxyCards.vue`

### 5. Session Planner Enhancement
- [ ] Create sessions database table:
  - sessionId (PK), name, date, participants, location, notes (markdown), linkedEntities (JSON array of entity IDs)
- [ ] Add sessions migration to database schema
- [ ] Create `sessionStore.js` with API integration
- [ ] Integrate SessionPlanner.vue with store
- [ ] Build session creation form:
  - Name, date picker, participants (text list)
  - Location (physical or virtual)
- [ ] Add entity linking interface:
  - Search and attach characters to session
  - Attach worlds, systems, sophonts
  - Drag-and-drop or multi-select UI
- [ ] Add session notes editor:
  - Markdown editor with preview
  - Auto-save on edit
  - Syntax highlighting
- [ ] Build session history view:
  - List all past sessions chronologically
  - Click to view session details
  - Show linked entities as chips/tags
- [ ] Add session export as markdown (formatted notes)
- [ ] Add calendar view for sessions (optional enhancement)
- **File targets:**
  - Update `apps/system-generator/frontend/src/pages/surveys/SessionPlanner.vue`
  - Create `apps/system-generator/frontend/src/stores/sessionStore.js`
  - Create `apps/system-generator/backend/generators/sessionGenerator.js`

---

## Dependencies

**Depends on Sprint 3:**
- All stores and API infrastructure
- Generator base patterns

**External:**
- PDF generation library (jsPDF, Puppeteer, or server-side)
- Markdown editor library (SimpleMDE, Toast UI Editor)
- Chart library (Chart.js, D3.js)

---

## Verification Criteria

### Vehicle Generator Verification
1. Generate vehicle for TL 8 world → TL 12 features disabled
2. Create military starship → weapons array populated
3. Save 20 vehicles → list view shows all

### Character Generator Verification
1. Generate Traveller 5 character → attributes rolled, career completed
2. Export character as PDF → printable sheet generated
3. Create party roster with 5 characters → summary stats calculated

### Sector Map Verification
1. Open SectorSurvey → hex map renders with plotted systems
2. Click system on map → navigates to StarSystemBuilder
3. Hover system → tooltip shows name and stats

### Orbital Diagram Verification
1. Open StarSystemBuilder → orbital diagram shows stars and worlds
2. Habitable zone overlay visible
3. Click world → navigates to WorldBuilder

### Dashboard Verification
1. Open dashboard → statistics load (galaxies, systems, etc.)
2. Recent activity shows last 10 entities
3. Search for entity by name → results displayed
4. Data health check runs → shows green status
5. Click "Export All" → JSON download starts

### Session Planner Verification
1. Create session → attach 3 characters → save → persists
2. Add markdown notes → reload page → notes preserved
3. View session history → past sessions listed chronologically

### Performance Verification
1. Dashboard loads with 1000+ entities → page load < 3s
2. Sector map with 100 systems → render time < 2s
3. Orbital diagram with 12 worlds → smooth interaction (60fps)

---

## Definition of Done

- [ ] Vehicle generator functional with full CRUD and TL constraints
- [ ] Character generator uses Traveller 5 rules and exports PDF
- [ ] Sector hex map and system orbital diagram integrated
- [ ] Dashboard deployed at root route with universe stats
- [ ] Session planner persists to API with entity linking
- [ ] All visualization components tested on large datasets (100+ entities)
- [ ] All verification criteria passing
- [ ] User documentation complete for all generators and dashboard
- [ ] Code reviewed and merged to main branch

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| PDF export library increases bundle size | Medium | Use server-side PDF generation or lazy-load library |
| Complex orbital mechanics slow diagram | Medium | Pre-calculate positions, cache rendered diagrams |
| Dashboard stats queries slow with large data | High | Add database indexes, cache stats with invalidation strategy |
| Traveller 5 rules complex to implement | High | Focus on core mechanics first, add advanced rules later |

---

## Sprint Review Checklist

- [ ] Demo vehicle generator with tech level constraints
- [ ] Demo character generator with PDF export
- [ ] Demo sector hex map with system navigation
- [ ] Demo system orbital diagram with habitable zone
- [ ] Demo dashboard with universe overview and search
- [ ] Demo session planner with entity linking
- [ ] Show performance with large datasets
- [ ] Walk through user documentation
- [ ] Confirm all DoD items checked off

---

## Sprint 4 Completion = Phase 1 MVP Complete! 🎉

After Sprint 4, you have achieved Phase 1 MVP with:
- ✅ Full SQLite persistence with import/export
- ✅ Complete survey chain: Galaxy → Sector → System → World → Census
- ✅ All 7 generators functional: Sophont, Creature, History, Vehicle, Character, Session Planner
- ✅ 3 major visualizations: Density heatmap, Sector map, Orbital diagram
- ✅ Dashboard with universe overview, statistics, and search

---

## Next Phase Preview

**Phase 2: Advanced Systems** (Sprints 5-8)
- Trade route generation and economics
- Name generation system (procedural names for all entities)
- Advanced visualization (3D galaxy rendering)
- Random encounter tables
- Flora generator integration
- Detailed documentation and tutorials
- Unit testing and E2E testing
- Deployment automation (CI/CD pipeline)

Congratulations on completing the foundation! 🚀