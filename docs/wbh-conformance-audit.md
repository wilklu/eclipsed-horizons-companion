# WBH Conformance Audit

## Purpose

This document records the current state of world, star, and system generation against the intended World Builder's Handbook (WBH) ruleset target.

Current conclusion: the active generators are Traveller-flavored heuristic generators, not verified WBH implementations.

The WBH source of truth is now present in the repository at `docs/reference/World Builder's Handbook.md`.

## Current Entry Points

### World generation

- `apps/system-generator/frontend/src/pages/surveys/WorldBuilder.vue`
- Calls `generateWorldProfile()` from `apps/system-generator/frontend/src/utils/worldProfileGenerator.js`

### Star generation

- `apps/system-generator/frontend/src/utils/primaryStarGenerator.js`
- Used by `GalaxySurvey.vue`, `SectorSurvey.vue`, and `TravellerMap.vue`

### System generation

- `apps/system-generator/frontend/src/pages/surveys/StarSystemBuilder.vue`
- `apps/system-generator/frontend/src/utils/stellarSurveySystemGenerator.js`

## Audit Summary

| Area                                            | Current implementation                                     | WBH status       | Notes                                                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| World physical characteristics                  | `worldProfileGenerator.js`                                 | Not verified     | Uses simplified rolls and heuristics for size, atmosphere, hydrographics, temperature, moons, magnetosphere, and trade codes. |
| Population / government / law / tech / starport | `worldProfileGenerator.js`                                 | Not WBH-complete | Currently hard-coded to uninhabited defaults in the world builder flow.                                                       |
| Primary star generation                         | `primaryStarGenerator.js`                                  | Not verified     | Uses a weighted spectral table and default luminosity class logic.                                                            |
| Stellar multiplicity / companion stars          | `StarSystemBuilder.vue`                                    | Not verified     | Uses simple random odds and lightweight companion generation.                                                                 |
| Planet/system body generation                   | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Not verified     | Uses simplified body counts, orbit spacing, and habitable-zone logic.                                                         |
| Survey persistence model                        | `SectorSurvey.vue`, `systemStore.js`, `systemApi.js`       | N/A              | Persistence path exists, but it stores outputs from heuristic generators.                                                     |

## Source Chapters Now In Scope

| WBH chapter / section                     | Handbook source                              | Affected app modules                                                                  | Current status                           |
| ----------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| Chapter 3: Stars                          | `docs/reference/World Builder's Handbook.md` | `primaryStarGenerator.js`, `SectorSurvey.vue`, `GalaxySurvey.vue`, `TravellerMap.vue` | Source available, implementation pending |
| Chapter 4: System Worlds and Orbits       | `docs/reference/World Builder's Handbook.md` | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js`                            | Source available, implementation pending |
| Chapter 5: World Physical Characteristics | `docs/reference/World Builder's Handbook.md` | `worldProfileGenerator.js`, `WorldBuilder.vue`, `StarSystemBuilder.vue`               | Source available, implementation pending |

## Rule Matrix

### Chapter 3: Stars

| WBH section                 | Current module(s)         | Gap                                                                      | Scaffold status                                             |
| --------------------------- | ------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Primary Star Types          | `primaryStarGenerator.js` | Current generator uses a weighted distribution instead of WBH tables.    | Added `src/utils/wbh/starGenerationWbh.js` checkpoint entry |
| Subtypes                    | `primaryStarGenerator.js` | Current generator uses random decimal digits, not the WBH subtype table. | Added checkpoint entry                                      |
| Star Mass and Temperature   | `primaryStarGenerator.js` | Current generator uses one fixed mass/temperature per spectral class.    | Added checkpoint entry                                      |
| Star Diameter               | No dedicated module       | No WBH diameter lookup or interpolation exists.                          | Added checkpoint entry                                      |
| Star Luminosity             | No dedicated module       | No WBH luminosity formula helper existed.                                | Added formula helper                                        |
| System Age                  | No dedicated module       | No WBH age formulas existed.                                             | Added lifespan helper formulas                              |
| Systems With Multiple Stars | `StarSystemBuilder.vue`   | Current multiplicity/orbit generation is heuristic.                      | Added checkpoint entry                                      |

### Chapter 4: System Worlds and Orbits

| WBH section                   | Current module(s)                                          | Gap                                                              | Scaffold status                                               |
| ----------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| World Types and Quantities    | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Body types are now named correctly, but counts remain heuristic. | Added `src/utils/wbh/systemGenerationWbh.js` checkpoint entry |
| Available Orbits              | `StarSystemBuilder.vue`                                    | No Orbit# table implementation exists.                           | Added checkpoint entry                                        |
| HZCO / Habitable Zone Breadth | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Current habitable-zone logic is simplified.                      | Added checkpoint entry                                        |
| Placement of Worlds           | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | No stepwise WBH orbit placement logic exists.                    | Added checkpoint entry                                        |
| Basic World Sizing            | `StarSystemBuilder.vue`                                    | No WBH terrestrial size table or gas giant sizing table exists.  | Added checkpoint entry                                        |
| Significant Moons / Moon Size | `StarSystemBuilder.vue`                                    | Moon generation is simplified and not table-driven.              | Added checkpoint entry                                        |
| Mainworld Candidate           | `StarSystemBuilder.vue`, `WorldBuilder.vue`                | No WBH mainworld-candidate selection flow exists.                | Added checkpoint entry                                        |

### Chapter 5: World Physical Characteristics

| WBH section                           | Current module(s)          | Gap                                                                                           | Scaffold status                                                                             |
| ------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Size / Diameter                       | `worldProfileGenerator.js` | Current size is `2d6 - 2` without WBH extended-size handling.                                 | Added `expandWbhSizeBeyondA()` helper in `src/utils/wbh/worldPhysicalCharacteristicsWbh.js` |
| Composition and Density               | `worldProfileGenerator.js` | No WBH density/composition model exists.                                                      | Added checkpoint entry                                                                      |
| Gravity and Mass                      | `worldProfileGenerator.js` | Gravity is simplified and not derived from WBH density/diameter steps.                        | Added checkpoint entry                                                                      |
| Atmosphere                            | `worldProfileGenerator.js` | Current atmosphere roll is simplified and omits WBH subtypes and gas-mix procedures.          | Added checkpoint entry                                                                      |
| Hydrographics                         | `worldProfileGenerator.js` | Current hydrographics roll is simplified and omits WBH surface distribution and liquid logic. | Added checkpoint entry                                                                      |
| Rotation / Tilt / Tides / Temperature | `worldProfileGenerator.js` | Day length, tilt, tidal effects, and temperature are currently heuristic.                     | Added checkpoint entry                                                                      |
| Seismology / Life / Mainworld         | `worldProfileGenerator.js` | Current life and mainworld suitability logic is much lighter than WBH.                        | Added checkpoint entry                                                                      |

## Verified Gaps

### World builder

- `generateWorldProfile()` rolls size as `2d6 - 2` and atmosphere as `2d6 - 7 + size`.
- Temperature, moons, day length, orbital period, and magnetosphere are generated from simplified formulas and random ranges.
- Population, government, law level, tech level, and starport are currently fixed to uninhabited defaults in this path.

### Star generator

- `generatePrimaryStar()` uses a hard-coded weighted spectral distribution.
- Luminosity class defaults to `V` unless explicitly provided.
- No visible WBH-specific companion, orbital, or evolutionary rule tables are applied here.

### System generator

- System multiplicity is random rather than table-driven from a verified rules source.
- Body count, orbit spacing, habitable zone, and composition are heuristic.
- Persisted survey systems in `stellarSurveySystemGenerator.js` inherit the same heuristic world generator.

## House Rules Source In Repo

The repository contains `docs/house-rules/world-building.md`, but this is a house-rules document, not a WBH rules implementation source. It is not sufficient by itself to claim WBH conformance.

## Implementation Track

### Option 1: Audit matrix

- Upgraded from a baseline summary to a chapter and section matrix tied to the in-repo WBH source.
- Next step: replace scaffold checkpoint entries with exact table implementations and test cases.

### Option 2: Dedicated WBH modules

Recommended target split:

- `apps/system-generator/frontend/src/utils/wbh/worldPhysicalCharacteristicsWbh.js`
- `apps/system-generator/frontend/src/utils/wbh/starGenerationWbh.js`
- `apps/system-generator/frontend/src/utils/wbh/systemGenerationWbh.js`

Current scaffold status:

- Module entry points created.
- Handbook coverage checkpoints defined in each module.
- Direct WBH formula helpers added where the handbook gives stable formulas without additional table dependencies.
- Existing heuristic generators are still used as temporary fallbacks to preserve app behavior while implementations are filled in.

Recommended migration path:

1. Implement WBH modules beside current heuristic modules.
2. Add adapter functions so existing pages can opt into WBH generators one surface at a time.
3. Swap `WorldBuilder.vue`, `StarSystemBuilder.vue`, and survey persistence paths to the WBH modules after parity checks.

### Option 3: Regression and conformance tests

Recommended validation layers:

1. Generator shape tests: output schemas and invariants.
2. Rule tests: fixed-seed or deterministic roll-path checks for WBH cases.
3. Integration tests: `WorldBuilder`, `StarSystemBuilder`, and survey persistence use the WBH modules instead of heuristic helpers.

Current scaffold status:

- Vitest added to the frontend package.
- A frontend `npm test` path is now defined.
- Initial unit tests created for formula helpers, size expansion logic, body classifications, and scaffold coverage checkpoints.

## Blockers

Full WBH implementation and validation cannot be completed from the current repository alone because the exact WBH rule tables and procedures are not present in source form.

To proceed cleanly, the implementation phase needs one of these:

- a user-provided WBH rule summary by subsystem
- an internal design spec derived from WBH
- explicit decisions on which WBH procedures are mandatory versus intentionally house-ruled

## Recommended Next Work

1. Build the WBH world generator first, because both `WorldBuilder` and the system generators depend on it.
2. Replace shared star generation next, because sector, galaxy, and map flows all depend on it.
3. Replace system/orbit generation last, then wire persistence and UI to the WBH modules.
