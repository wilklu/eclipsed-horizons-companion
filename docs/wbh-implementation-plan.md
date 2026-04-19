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
- `stellarSurveySystemGenerator.js` now uses the same WBH orbit/HZ and profiled planet-builder path as `StarSystemBuilder.vue`, and it preserves richer generated-star metadata when sector hex records carry WBH star arrays.

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

## Phase 4: Descriptive World Taxonomy and Orbit-Band Classification

Implement a non-breaking world-classification layer so generated planets retain their broad WBH group while gaining richer descriptive labels inspired by Astrometrics and related exoplanet references.

Priority order:

1. Introduce a shared classifier utility for orbit-band, chemistry, activity profile, and descriptive subtype resolution
2. Keep broad body grouping stable (`planet.type`) and add additive fields such as `worldFamily`, `worldClass`, `worldSubtype`, `worldDescriptor`, and `orbitBand`
3. Use orbit-number bands for classification only:
   - Epistellar: orbit numbers 0–2
   - Inner Zone: orbit numbers 3–5
   - Outer Zone: orbit numbers 6–20
4. Keep AU-based climate labeling (`hot`, `warm`, `habitable`, `cold`, `frozen`) separate from orbit-band taxonomy
5. First-pass subtype families should cover the highest-value descriptive upgrades:
   - Dwarf worlds: Rockball, Meltball, Hebean, Snowball, GeoCyclic, GeoTidal
   - Terrestrial worlds: JaniLithic, Vesperian, Telluric, Arid, Tectonic, Oceanic
   - Later expansion: Gaian/Amunian/Tartarian and other chemistry-driven variants
6. Feed the resolved subtype back into WBH physical generation only after the additive-label pass is regression-tested

Target integration points:

- `apps/system-generator/frontend/src/utils/systemWorldGeneration.js`
- `apps/system-generator/frontend/src/utils/worldProfileGenerator.js`
- `apps/system-generator/frontend/src/utils/stellarSurveySystemGenerator.js`
- `apps/system-generator/frontend/src/pages/surveys/StarSystemBuilder.vue`

Recommended delivery sequence:

1. Build a pure classification helper with deterministic unit coverage
2. Enrich generated planet records without breaking saved-system compatibility
3. Update Stellar Survey display labels to show broad type plus descriptive subtype
4. Add persistence/export compatibility checks for existing saved systems
5. Add subtype-sensitive weighting hooks for atmosphere, hydrographics, and native-life plausibility

Guardrails:

- Preserve dice-driven generation as the source of truth
- Prefer additive metadata over replacing existing fields
- Do not regress current saved-name, star-designation, or planetary-order behavior
- Keep harsh epistellar and frozen-world life outcomes rare unless specifically supported by chemistry and age

References:

- `docs/reference/World Builder's Handbook.md`
- `docs/reference/astrometrics-a-gms-guide-to-exoplanets1.html`

## Validation Strategy

1. Keep new WBH logic in separate modules until chapter-level parity is reached.
2. Add deterministic unit tests for every handbook formula and table resolver.
3. Add adapter-level tests before swapping any existing UI flow to WBH-backed generation.
4. Preserve heuristic fallbacks only for subsystems that still lack WBH table coverage, not for UI display of valid WBH outputs.

Current status:

- Focused WBH regression coverage now includes the extracted System Survey form model, covering generated-system autofill plus saved-survey round-trips for hierarchy-aware stars and moon mainworld summaries.
