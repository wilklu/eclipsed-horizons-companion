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

| Area                                            | Current implementation                                     | WBH status       | Notes                                                                                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World physical characteristics                  | `worldProfileGenerator.js`                                 | Partially wired  | `worldProfileGenerator.js` now delegates size, atmosphere, hydrographics, temperature, moons, magnetosphere, and related physical fields to the WBH helper module. |
| Population / government / law / tech / starport | `worldProfileGenerator.js`                                 | Not WBH-complete | Currently hard-coded to uninhabited defaults in the world builder flow.                                                                                            |
| Primary star generation                         | `primaryStarGenerator.js`                                  | Partially wired  | Shared generator now routes straight through WBH-backed star generation by default, including non-stellar results.                                                 |
| Stellar multiplicity / companion stars          | `StarSystemBuilder.vue`                                    | Not verified     | Uses simple random odds and lightweight companion generation.                                                                                                      |
| Planet/system body generation                   | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Partially wired  | Both builder and survey persistence paths now use the same WBH orbit/HZ helpers; world counts, placement, and moon sizing are still simplified.                    |
| Survey persistence model                        | `SectorSurvey.vue`, `systemStore.js`, `systemApi.js`       | N/A              | Persistence path exists, but it stores outputs from heuristic generators.                                                                                          |

## Source Chapters Now In Scope

| WBH chapter / section                     | Handbook source                              | Affected app modules                                                                  | Current status                                              |
| ----------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Chapter 3: Stars                          | `docs/reference/World Builder's Handbook.md` | `primaryStarGenerator.js`, `SectorSurvey.vue`, `GalaxySurvey.vue`, `TravellerMap.vue` | Partially integrated, including non-stellar display support |
| Chapter 4: System Worlds and Orbits       | `docs/reference/World Builder's Handbook.md` | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js`                            | Partially integrated in builder and survey flows            |
| Chapter 5: World Physical Characteristics | `docs/reference/World Builder's Handbook.md` | `worldProfileGenerator.js`, `WorldBuilder.vue`, `StarSystemBuilder.vue`               | Partially integrated through shared world helper            |

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

| WBH section                   | Current module(s)                                          | Gap                                                                                                               | Scaffold status                                   |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| World Types and Quantities    | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Body types are now named correctly and generated through the same helper set, but counts remain heuristic.        | Integrated in builder and survey flows            |
| Available Orbits              | `StarSystemBuilder.vue`                                    | Orbit# to AU conversion now uses WBH helpers, but full placement tables are incomplete.                           | Integrated into `StarSystemBuilder.vue`           |
| HZCO / Habitable Zone Breadth | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | `StarSystemBuilder.vue` now derives HZCO from WBH helpers; survey generator still uses simplified logic.          | Integrated in builder flow, pending survey parity |
| Placement of Worlds           | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Orbit spacing now uses the shared Orbit#/AU helper path, but full stepwise WBH placement rules are still pending. | Integrated shared helper path                     |
| Basic World Sizing            | `StarSystemBuilder.vue`                                    | Non-gas-giant entries now use WBH physical-characteristics sizing, but gas giant sizing is still heuristic.       | Integrated for non-gas-giant bodies               |
| Significant Moons / Moon Size | `StarSystemBuilder.vue`                                    | Moon generation is simplified and not table-driven.                                                               | Added checkpoint entry                            |
| Mainworld Candidate           | `StarSystemBuilder.vue`, `WorldBuilder.vue`                | No WBH mainworld-candidate selection flow exists.                                                                 | Added checkpoint entry                            |

### Chapter 5: World Physical Characteristics

| WBH section                           | Current module(s)          | Gap                                                                                                                                           | Scaffold status                                                |
| ------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Size / Diameter                       | `worldProfileGenerator.js` | Base size roll is still heuristic, but WBH diameter and size-profile calculations are now applied through the shared helper.                  | Integrated through `generateWorldPhysicalCharacteristicsWbh()` |
| Composition and Density               | `worldProfileGenerator.js` | WBH composition and density calculations are now applied through the shared helper.                                                           | Integrated through shared helper                               |
| Gravity and Mass                      | `worldProfileGenerator.js` | WBH gravity and mass calculations are now applied through the shared helper.                                                                  | Integrated through shared helper                               |
| Atmosphere                            | `worldProfileGenerator.js` | Atmosphere generation now routes through the WBH helper, but exact WBH atmosphere sub-procedures are still incomplete.                        | Integrated through shared helper                               |
| Hydrographics                         | `worldProfileGenerator.js` | Hydrographics generation now routes through the WBH helper, but exact WBH surface/liquid rules are still incomplete.                          | Integrated through shared helper                               |
| Rotation / Tilt / Tides / Temperature | `worldProfileGenerator.js` | Temperature, day length, axial tilt, and orbital period now route through the WBH helper; tidal-effect rules remain incomplete.               | Integrated through shared helper                               |
| Seismology / Life / Mainworld         | `worldProfileGenerator.js` | Native-life handling now lives in the WBH helper, but seismology, resource rating, and final mainworld procedures are still lighter than WBH. | Partial integration                                            |

## Verified Gaps

### World builder

- `generateWorldProfile()` still begins from a heuristic base size roll and uninhabited social defaults.
- Atmosphere, hydrographics, temperature, moons, magnetosphere, and physical calculations now route through `worldPhysicalCharacteristicsWbh.js`.
- Population, government, law level, tech level, starport, and trade/economic downstream rules are still simplified in this path.

### Star generator

- `generatePrimaryStar()` now returns WBH outputs directly, including non-stellar primaries.
- UI display helpers now normalize non-stellar descriptors such as white dwarfs, brown dwarfs, protostars, and peculiar objects.
- Companion and multiplicity handling outside the primary-star helper remains heuristic.

### System generator

- System multiplicity is still random rather than table-driven from a verified rules source.
- Orbit spacing and habitable-zone calculations now share the WBH Chapter 4 helper path between builder and survey persistence.
- Body counts, placement order, gas giant sizing, and significant moon procedures remain simplified.

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
3. Finish replacing remaining heuristic paths in `worldProfileGenerator.js`, `stellarSurveySystemGenerator.js`, and survey persistence after parity checks.

### Option 3: Regression and conformance tests

Recommended validation layers:

1. Generator shape tests: output schemas and invariants.
2. Rule tests: fixed-seed or deterministic roll-path checks for WBH cases.
3. Integration tests: verify `WorldBuilder` and `StarSystemBuilder` use the WBH helper modules, then extend the same checks to survey persistence.

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

1. Replace the remaining heuristic size/count/placement rules in system generation with exact WBH tables.
2. Implement WBH multiple-star procedures so companion generation and system multiplicity stop using lightweight random odds.
3. Move population, government, law, tech, starport, and final mainworld determination onto explicit WBH or documented house-rule paths.
