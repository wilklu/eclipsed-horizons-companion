# Sprint 2: API Layer & Frontend Integration
**Duration:** 2 weeks (March 22 - April 4, 2026)  
**Phase:** Phase 1 Foundation (Part 2)  
**Sprint Goal:** Build RESTful API over SQLite, migrate Pinia stores from localStorage to API, add route guards

---

## Sprint Objectives

1. Build Express/Fastify RESTful API with CRUD endpoints for all entities
2. Migrate all Pinia stores from localStorage to API backend
3. Implement route guards to enforce survey hierarchy
4. Add import/export API endpoints
5. Ensure data persistence across page refreshes

---

## Deliverables & Tasks

### 1. Backend API Layer
- [ ] Create Express/Fastify server setup in `backend/api/`
- [ ] Add CORS middleware for frontend access
- [ ] Add request logging middleware
- [ ] CRUD endpoints: `POST /api/galaxies`, `GET /api/galaxies/:id`, `PUT /api/galaxies/:id`, `DELETE /api/galaxies/:id`
- [ ] CRUD endpoints: `POST /api/sectors`, `GET /api/sectors/:id`, `GET /api/galaxies/:gid/sectors`
- [ ] CRUD endpoints: `POST /api/systems`, `GET /api/systems/:id`, `GET /api/galaxies/:gid/sectors/:sid/systems`
- [ ] CRUD endpoints: `POST /api/worlds`, `GET /api/worlds/:id`, `GET /api/systems/:sid/worlds`
- [ ] CRUD endpoints: `POST /api/sophonts`, `GET /api/sophonts/:id`, `GET /api/worlds/:wid/sophonts`
- [ ] Add validation middleware using JSON schemas from Sprint 1
- [ ] Add error handling middleware with standard error responses (400, 404, 500)
- [ ] Implement import endpoint: `POST /api/import` (accepts JSON universe)
- [ ] Implement export endpoint: `GET /api/export/:galaxyId` (returns JSON)
- [ ] Add API server start script: `npm run api:dev`
- **File targets:**
  - `apps/system-generator/backend/api/server.js`
  - `apps/system-generator/backend/api/routes/galaxies.js`
  - `apps/system-generator/backend/api/routes/sectors.js`
  - `apps/system-generator/backend/api/routes/systems.js`
  - `apps/system-generator/backend/api/routes/worlds.js`
  - `apps/system-generator/backend/api/routes/sophonts.js`
  - `apps/system-generator/backend/api/middleware/validator.js`
  - `apps/system-generator/backend/api/middleware/errorHandler.js`

### 2. Frontend API Client
- [ ] Create `frontend/src/api/apiClient.js` with Axios/Fetch wrapper
- [ ] Add base URL configuration (env variable support)
- [ ] Add request interceptor for auth headers (future-proof)
- [ ] Add response interceptor for error handling
- [ ] Add API methods: `createGalaxy()`, `getGalaxy()`, `updateGalaxy()`, `deleteGalaxy()`, `listGalaxies()`
- [ ] Add API methods: `createSector()`, `getSectors(galaxyId)`, `updateSector()`, `deleteSector()`
- [ ] Add API methods for systems, worlds, sophonts (full CRUD each)
- [ ] Add API methods: `importUniverse(jsonData)`, `exportGalaxy(galaxyId)`
- [ ] Add error handling with user-friendly messages
- [ ] Add retry logic for transient failures (exponential backoff)
- **File targets:**
  - `apps/system-generator/frontend/src/api/apiClient.js`
  - `apps/system-generator/frontend/src/api/galaxyApi.js`
  - `apps/system-generator/frontend/src/api/sectorApi.js`
  - `apps/system-generator/frontend/src/api/systemApi.js`
  - `apps/system-generator/frontend/src/api/worldApi.js`
  - `apps/system-generator/frontend/src/api/sophontApi.js`

### 3. Pinia Store Migration
- [ ] Migrate `galaxyStore.js` from localStorage to API backend
  - Replace localStorage calls with API client methods
  - Add loading states (`isLoading`, `error`)
  - Keep reactive state structure
- [ ] Create `sectorStore.js` with API integration
  - Actions: `createSector()`, `loadSectors(galaxyId)`, `updateSector()`, `deleteSector()`
  - State: `sectors[]`, `currentSector`, `isLoading`, `error`
- [ ] Create `systemStore.js` with API integration
- [ ] Create `worldStore.js` with API integration
- [ ] Create `sophontStore.js` with API integration
- [ ] Add optimistic updates with rollback on error (for create/update actions)
- [ ] Add store hydration from API on app load (load current galaxy from URL param)
- [ ] Add error toast notifications on API failures
- **File targets:**
  - Update `apps/system-generator/frontend/src/stores/galaxyStore.js`
  - Create `apps/system-generator/frontend/src/stores/sectorStore.js`
  - Create `apps/system-generator/frontend/src/stores/systemStore.js`
  - Create `apps/system-generator/frontend/src/stores/worldStore.js`
  - Create `apps/system-generator/frontend/src/stores/sophontStore.js`

### 4. Route Guards & Navigation
- [ ] Add global navigation guard in router
- [ ] Route guard: prevent SectorSurvey access without valid galaxyId
  - Check if galaxy exists via API before allowing navigation
  - Redirect to GalaxySurvey with error message if missing
- [ ] Route guard: prevent StarSystemBuilder access without valid sectorId
- [ ] Route guard: prevent WorldBuilder access without valid systemId
- [ ] Add loading states during API calls (skeleton screens in components)
- [ ] Add error boundaries for API failures (display user-friendly error pages)
- [ ] Update SurveyNavigation component to show disabled states for unavailable surveys
  - Disable "Sector Survey" button if no galaxy selected
  - Disable "Star System Builder" if no sector selected
- **File targets:**
  - Update `apps/system-generator/frontend/src/router/index.js`
  - Update `apps/system-generator/frontend/src/components/common/SurveyNavigation.vue`

### 5. UI Polish for API Integration
- [ ] Add loading spinners to all survey pages during data fetch
- [ ] Add "Save" buttons to survey pages that trigger API persist
- [ ] Add confirmation dialogs for delete actions
- [ ] Add success toast notifications on save/create/delete
- [ ] Add data refresh buttons to manually reload from API
- [ ] Update page titles to reflect current entity (e.g., "Galaxy: Milky Way")

---

## Dependencies

**Depends on Sprint 1:**
- SQLite schema and migrations
- JSON schemas for validation
- Database CRUD utilities

**External:**
- Express or Fastify (API framework)
- Axios or Fetch API (HTTP client)
- Vue Toastification or similar (toast notifications)

---

## Verification Criteria

### API Endpoint Verification
1. Create galaxy via POST → returns 201 with galaxyId
2. GET galaxy by ID → returns full galaxy object
3. Update galaxy → returns 200 with updated data
4. Delete galaxy → returns 204, galaxy removed from DB
5. GET /galaxies/:gid/sectors → returns all sectors for galaxy

### Frontend Integration Verification
1. Open GalaxySurvey → create galaxy → appears in list immediately
2. Refresh page → galaxy persists (loaded from API)
3. Click "Sector Survey" without galaxy → redirected with error message
4. Create sector → navigate to StarSystemBuilder → sector data available
5. Delete galaxy → confirmation dialog → galaxy removed, redirected to home

### Performance Verification
1. Load 100 systems → API response < 3s
2. Create system → optimistic UI update instant → API confirms within 1s
3. Concurrent updates to same galaxy → last-write-wins or conflict resolution works

### Data Integrity Verification
1. Export galaxy as JSON → download successful
2. Import JSON → all entities restored with correct FKs
3. Orphaned entity check: delete sector → all child systems removed

---

## Definition of Done

- [ ] All CRUD endpoints implemented and tested (Postman/Insomnia collection)
- [ ] 5 Pinia stores migrated with API integration
- [ ] Route guards prevent orphaned navigation (tested manually)
- [ ] Import/export workflows functional end-to-end
- [ ] All verification criteria passing
- [ ] API documentation generated (Swagger/OpenAPI spec)
- [ ] Frontend tests updated for stores with API mocking
- [ ] Loading states and error handling implemented across all pages
- [ ] Code reviewed and merged to main branch

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API latency causes UI lag | High | Add optimistic updates, loading skeletons, and caching |
| Concurrent edits cause data loss | Medium | Implement optimistic locking or conflict detection UI |
| CORS issues in development | Low | Configure CORS middleware properly in Express/Fastify |
| Large exports timeout | Medium | Add streaming export for large datasets |

---

## Sprint Review Checklist

- [ ] Demo full survey flow: Create galaxy → sector → system → world
- [ ] Demo data persistence across page refresh
- [ ] Demo route guards preventing invalid navigation
- [ ] Demo import/export workflow
- [ ] Show API documentation (Swagger UI)
- [ ] Walk through error handling scenarios
- [ ] Confirm all DoD items checked off

---

## Next Sprint Preview

Sprint 3 will complete the generator suite (sophont, creature, history generators) and add the galaxy density heatmap visualization.