# Sprint 3: Generator Suite & Basic Visualization
**Duration:** 2 weeks (April 5 - April 18, 2026)  
**Phase:** Phase 2 Generators (Part 1)  
**Sprint Goal:** Complete sophont/creature/history generators with persistence, add galaxy density heatmap visualization

---

## Sprint Objectives

1. Enhance SophontGenerator with full CRUD and persistence
2. Build CreatureGenerator (fauna) with ecosystem integration
3. Build HistoryGenerator with timeline visualization
4. Create galaxy density heatmap visualization component
5. Integrate all generators with API backend

---

## Deliverables & Tasks

### 1. Sophont Generator Enhancement
- [ ] Integrate SophontGenerator.vue with `sophontStore`
- [ ] Add "Save Sophont" button → persist to API
- [ ] Add sophont list view showing all sophonts for a world
  - Display as cards or table with name, body plan, culture
- [ ] Add body plan generator with options:
  - Humanoid, Avian, Aquatic, Insectoid, Arachnoid, Serpentine, Amorphous
  - Roll random or user selection
- [ ] Add culture traits generator:
  - Values (honor, profit, knowledge, harmony, etc.)
  - Taboos (violence, deception, technology, etc.)
  - Social structure (tribal, feudal, democratic, hive mind)
- [ ] Add sophont family tree scaffolding:
  - Basic relationship tracking (parent, child, sibling)
  - Generation counter
- [ ] Add export sophont as JSON
- [ ] Add edit/delete workflows for saved sophonts
- **File targets:**
  - Update `apps/system-generator/frontend/src/pages/surveys/SophontGenerator.vue`
  - Create `apps/system-generator/backend/generators/sophontGenerator.js`
  - Add API routes for sophonts in Sprint 2 backend

### 2. Creature Generator (Fauna)
- [ ] Create fauna database table:
  - faunaId (PK), worldId (FK), name, bodyPlan, size, diet, habitat, threats, armor
- [ ] Add fauna migration to database schema
- [ ] Create `faunaStore.js` with API integration (CRUD actions)
- [ ] Build CreatureGenerator.vue UI with form fields:
  - Size (tiny, small, medium, large, huge, gargantuan)
  - Diet (herbivore, carnivore, omnivore, scavenger, filter feeder)
  - Habitat (land, water, air, underground, multi-environment)
  - Armor rating, Weapons (claws, teeth, venom, etc.)
- [ ] Add body plan generator:
  - Bilateral, Radial, Swarm, Incorporeal, Hybrid
  - Number of limbs, sensory organs
- [ ] Add ecosystem role generator:
  - Apex predator, Herbivore, Scavenger, Symbiont, Parasite
- [ ] Add creature-to-world environmental fit calculator:
  - Check world atmosphere vs creature respiration requirements
  - Check gravity vs creature size/structure
  - Flag incompatibilities with warnings
- [ ] Add persist/list/detail views for creatures
- [ ] Add export creature as JSON
- **File targets:**
  - Create `apps/system-generator/frontend/src/pages/surveys/CreatureGenerator.vue`
  - Create `apps/system-generator/frontend/src/stores/faunaStore.js`
  - Create `apps/system-generator/backend/generators/faunaGenerator.js`
  - Update backend API with fauna routes

### 3. History Generator
- [ ] Create history events database table:
  - eventId (PK), worldId (FK), sophontId (FK nullable), eventType, year, title, description, causedBy (eventId FK nullable)
- [ ] Add history events migration to database schema
- [ ] Create `historyStore.js` with API integration
- [ ] Build HistoryGenerator.vue UI:
  - Timeline view (vertical or horizontal)
  - Event creation form (type, year, title, description)
- [ ] Add event type generator with categories:
  - War, Discovery, Collapse, Migration, First Contact, Natural Disaster, Technological Breakthrough, Cultural Revolution
- [ ] Add timeline visualization component:
  - Simple vertical timeline with year markers
  - Color-coded events by type
  - Click event to edit/view details
- [ ] Add causal chain generator:
  - Link events (event A causes event B)
  - Visualize causal relationships on timeline
- [ ] Add automatic event suggestion based on world/sophont traits:
  - High tech world → suggest technological breakthrough
  - Desert world → suggest water crisis event
- [ ] Add export timeline as markdown (chronological list)
- **File targets:**
  - Update `apps/system-generator/frontend/src/pages/surveys/HistoryGenerator.vue`
  - Create `apps/system-generator/frontend/src/stores/historyStore.js`
  - Create `apps/system-generator/backend/generators/historyGenerator.js`
  - Create `apps/system-generator/frontend/src/components/visualizations/Timeline.vue`

### 4. Galaxy Density Heatmap Visualization
- [ ] Create `GalaxyDensityHeatmap.vue` component using Canvas or SVG
- [ ] Integrate with existing `sectorDensityCalculator.js` for density data
- [ ] Implement color gradient mapping:
  - Blue = low density (0-20%)
  - Green = medium density (20-60%)
  - Yellow/Orange = high density (60-80%)
  - Red = very high density (80-100%)
- [ ] Add sector grid overlay with coordinates (hex or square grid)
- [ ] Add tooltip on hover:
  - Display sector coordinates
  - Show density percentage
  - Show system count
- [ ] Add zoom/pan controls:
  - Mouse wheel zoom
  - Click-drag pan
  - Reset view button
- [ ] Add click handler: click sector → navigate to SectorSurvey
- [ ] Integrate component into GalaxySurvey.vue page
- [ ] Add toggle to switch between heatmap and table view
- **File targets:**
  - Create `apps/system-generator/frontend/src/components/visualizations/GalaxyDensityHeatmap.vue`
  - Update `apps/system-generator/frontend/src/pages/surveys/GalaxySurvey.vue`

---

## Dependencies

**Depends on Sprint 2:**
- API backend with CRUD endpoints
- Pinia stores infrastructure
- Route guards and navigation

**External:**
- Canvas/SVG library (Konva.js, D3.js, or native Canvas API)
- Markdown export library (optional, can use string templates)

---

## Verification Criteria

### Sophont Generator Verification
1. Generate sophont with random traits → save → appears in list
2. Reload page → sophont persists (from API)
3. Edit sophont → update body plan → changes saved
4. Delete sophont → confirmation → removed from DB
5. Export sophont as JSON → valid schema

### Creature Generator Verification
1. Generate creature for desert world → check environmental fit warnings
2. Create 50 creatures for one world → list view shows all
3. Filter creatures by diet type → results match filter
4. Delete creature → cascade check (no orphaned references)

### History Generator Verification
1. Generate 20 events → timeline renders chronologically
2. Link events with causal chains → visualization shows connections
3. Export timeline as markdown → valid chronological format
4. Add event to wrong date → timeline re-sorts automatically

### Heatmap Verification
1. Open GalaxySurvey → heatmap loads with density gradient
2. Hover over sector → tooltip shows coordinates and density
3. Click sector → navigates to SectorSurvey with sectorId
4. Zoom in/out → rendering smooth, no performance lag
5. Large galaxy (100+ sectors) → heatmap renders in < 3s

### Performance Verification
1. Generate 100 sophonts → API response < 5s
2. Timeline with 200 events → render time < 2s
3. Heatmap with 500 sectors → pan/zoom responsive (60fps)

---

## Definition of Done

- [ ] SophontGenerator saves to API and persists across sessions
- [ ] CreatureGenerator functional with full CRUD and environmental fit checks
- [ ] HistoryGenerator functional with timeline visualization and causal chains
- [ ] Galaxy density heatmap integrated in GalaxySurvey with interactive controls
- [ ] All generators tested with edge cases (empty data, large datasets, invalid inputs)
- [ ] All verification criteria passing
- [ ] Generator documentation added to docs/ (user guides)
- [ ] Heatmap component documented with usage examples
- [ ] Code reviewed and merged to main branch

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex family tree logic blocks sophont generator | Medium | Ship basic version first, iterate in future sprint |
| Canvas heatmap performance issues with large galaxies | High | Add viewport culling, render only visible sectors |
| Timeline rendering slow with 1000+ events | Medium | Add virtualization, render visible events only |
| Environmental fit logic too complex | Low | Start with simple checks (atmosphere, gravity), expand later |

---

## Sprint Review Checklist

- [ ] Demo sophont generator: create → save → list → edit → delete
- [ ] Demo creature generator with environmental fit warnings
- [ ] Demo history generator with timeline and causal chains
- [ ] Demo interactive galaxy density heatmap
- [ ] Show performance with large datasets (100+ entities)
- [ ] Walk through user documentation for all generators
- [ ] Confirm all DoD items checked off

---

## Next Sprint Preview

Sprint 4 will complete advanced generators (vehicle, character), add sector/system map visualizations, and build the dashboard with universe overview.