# WBH Implementation Plan

## Phase 1: Star Rules

Implement Chapter 3 in `apps/system-generator/frontend/src/utils/wbh/starGenerationWbh.js`.

Priority order:

1. Primary star type table resolution
2. Subtype resolution
3. Mass, temperature, and diameter lookup/interpolation
4. Luminosity and age calculation
5. Multi-star presence, sibling/twin logic, and orbit placement

Target integration points:

- `apps/system-generator/frontend/src/utils/primaryStarGenerator.js`
- `apps/system-generator/frontend/src/pages/surveys/SectorSurvey.vue`
- `apps/system-generator/frontend/src/pages/surveys/GalaxySurvey.vue`

## Phase 2: System Rules

Implement Chapter 4 in `apps/system-generator/frontend/src/utils/wbh/systemGenerationWbh.js`.

Priority order:

1. Body counts by WBH type
2. Orbit# and AU conversion helpers
3. HZCO and habitable-zone breadth
4. Stepwise world placement and empty orbit handling
5. Basic world sizing, gas giant sizing, and moon generation
6. Mainworld-candidate selection

Target integration points:

- `apps/system-generator/frontend/src/pages/surveys/StarSystemBuilder.vue`
- `apps/system-generator/frontend/src/utils/stellarSurveySystemGenerator.js`

Current status:

- `StarSystemBuilder.vue` now consumes WBH orbit/HZ helpers and applies WBH world-physics enrichment for non-gas-giant bodies.
- `stellarSurveySystemGenerator.js` now uses the same WBH orbit/HZ helper path as `StarSystemBuilder.vue` while still keeping heuristic body-count and placement rules.

## Phase 3: World Physical Characteristics

Implement Chapter 5 in `apps/system-generator/frontend/src/utils/wbh/worldPhysicalCharacteristicsWbh.js`.

Priority order:

1. Size, diameter, composition, density, gravity, and mass
2. Atmosphere and hydrographics
3. Rotation, axial tilt, tidal effects, and temperature
4. Seismology and native lifeforms
5. Resource rating, habitability, and mainworld determination

Target integration points:

- `apps/system-generator/frontend/src/utils/worldProfileGenerator.js`
- `apps/system-generator/frontend/src/pages/surveys/WorldBuilder.vue`
- `apps/system-generator/frontend/src/pages/surveys/StarSystemBuilder.vue`

Current status:

- `WorldBuilder.vue` now enriches generated non-gas-giant worlds with WBH size/density/gravity/mass calculations when bound system context is available.
- `StarSystemBuilder.vue` now applies the same WBH physical-characteristics enrichment when generating planetary catalog entries.
- `worldProfileGenerator.js` now delegates atmosphere, hydrographics, temperature, moons, magnetosphere, and related physical fields to the WBH module while still keeping heuristic social/default data.

## Validation Strategy

1. Keep new WBH logic in separate modules until chapter-level parity is reached.
2. Add deterministic unit tests for every handbook formula and table resolver.
3. Add adapter-level tests before swapping any existing UI flow to WBH-backed generation.
4. Preserve heuristic fallbacks only for subsystems that still lack WBH table coverage, not for UI display of valid WBH outputs.
