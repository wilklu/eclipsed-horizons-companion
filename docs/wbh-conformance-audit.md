# WBH Conformance Audit

## Purpose

This document records the current state of world, star, and system generation against the intended World Builder's Handbook (WBH) ruleset target.

Current conclusion: the active generators now use WBH-backed helpers for primary stars, multi-star presence, Chapter 4 body counts and orbit placement, gas giant sizing, significant moon quantity/size, moon-aware mainworld selection, hierarchy-aware companion exclusion floors, recursive descendant-branch exclusion metrics, split-continuation propagation with branch-depth allocation signals, and provisional social/UWP generation, while Chapter 5 now includes explicit helper coverage for life, habitability, resource summaries, and baseline seismology calculations, but several later-chapter detail procedures are still incomplete.

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
- `apps/system-generator/frontend/src/pages/surveys/SystemSurvey.vue`
- `apps/system-generator/frontend/src/utils/stellarSurveySystemGenerator.js`

## Audit Summary

| Area                                            | Current implementation                                                         | WBH status      | Notes                                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| World physical characteristics                  | `worldProfileGenerator.js`                                                     | Partially wired | `worldProfileGenerator.js` now delegates size, atmosphere, hydrographics, temperature, moons, magnetosphere, and related physical fields to the WBH helper module.                                                                                                                                                       |
| Population / government / law / tech / starport | `worldProfileGenerator.js`                                                     | Partially wired | System and standalone worlds now receive provisional WBH-style PGL, starport, tech, trade-code, economics-style summaries, and remarks outputs, while Chapter 5 life-profile, habitability, and resource summaries now route through explicit shared WBH helper exports; later-chapter social detail remains incomplete. |
| Primary star generation                         | `primaryStarGenerator.js`                                                      | Partially wired | Shared generator now routes straight through WBH-backed star generation by default, including non-stellar results.                                                                                                                                                                                                       |
| Stellar multiplicity / companion stars          | `StarSystemBuilder.vue`                                                        | Partially wired | Builder generation now uses WBH presence and non-primary derivation helpers, including companion-parent metadata, companion-aware orbit-floor propagation, and recursive descendant-branch metrics for deeper hierarchy exclusion spans, but later multi-star edge cases remain incomplete.                                   |
| Planet/system body generation                   | `StarSystemBuilder.vue`, `SystemSurvey.vue`, `stellarSurveySystemGenerator.js` | Partially wired | Builder and survey persistence now share WBH count, allocation, baseline, spread, orbit-placement, gas giant sizing, significant-moon helper paths, moon-aware mainworld candidate selection, and persisted mainworld summary fields now surfaced through the routed System Survey page.                                 |
| Survey persistence model                        | `SectorSurvey.vue`, `systemStore.js`, `systemApi.js`                           | N/A             | Persistence path exists, but it stores outputs from heuristic generators.                                                                                                                                                                                                                                                |

## Source Chapters Now In Scope

| WBH chapter / section                     | Handbook source                              | Affected app modules                                                                  | Current status                                              |
| ----------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Chapter 3: Stars                          | `docs/reference/World Builder's Handbook.md` | `primaryStarGenerator.js`, `SectorSurvey.vue`, `GalaxySurvey.vue`, `TravellerMap.vue` | Partially integrated, including non-stellar display support |
| Chapter 4: System Worlds and Orbits       | `docs/reference/World Builder's Handbook.md` | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js`                            | Partially integrated in builder and survey flows            |
| Chapter 5: World Physical Characteristics | `docs/reference/World Builder's Handbook.md` | `worldProfileGenerator.js`, `WorldBuilder.vue`, `StarSystemBuilder.vue`               | Partially integrated through shared world helper            |

## Rule Matrix

### Chapter 3: Stars

| WBH section                 | Current module(s)         | Gap                                                                                                                                                            | Scaffold status                                             |
| --------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Primary Star Types          | `primaryStarGenerator.js` | Current generator uses a weighted distribution instead of WBH tables.                                                                                          | Added `src/utils/wbh/starGenerationWbh.js` checkpoint entry |
| Subtypes                    | `primaryStarGenerator.js` | Current generator uses random decimal digits, not the WBH subtype table.                                                                                       | Added checkpoint entry                                      |
| Star Mass and Temperature   | `primaryStarGenerator.js` | Current generator uses one fixed mass/temperature per spectral class.                                                                                          | Added checkpoint entry                                      |
| Star Diameter               | No dedicated module       | No WBH diameter lookup or interpolation exists.                                                                                                                | Added checkpoint entry                                      |
| Star Luminosity             | No dedicated module       | No WBH luminosity formula helper existed.                                                                                                                      | Added formula helper                                        |
| System Age                  | No dedicated module       | No WBH age formulas existed.                                                                                                                                   | Added lifespan helper formulas                              |
| Systems With Multiple Stars | `StarSystemBuilder.vue`   | WBH presence and non-primary derivation are now wired, including partial companion-of-secondary metadata, but advanced hierarchy edge cases remain incomplete. | Partial integration                                         |

### Chapter 4: System Worlds and Orbits

| WBH section                   | Current module(s)                                          | Gap                                                                                                                                                                                         | Scaffold status                        |
| ----------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| World Types and Quantities    | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | WBH quantity tables now drive gas giant, belt, and terrestrial counts.                                                                                                                      | Integrated in builder and survey flows |
| Available Orbits              | `StarSystemBuilder.vue`                                    | WBH MAO, exclusion-zone, sibling-exclusion, companion-floor, and split-continuation branch-depth helpers now shape orbit placement, but advanced split-system hierarchy cases still remain. | Integrated shared helper path          |
| HZCO / Habitable Zone Breadth | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | Builder and survey generation now both consume the shared HZCO/orbit helper path.                                                                                                           | Integrated in builder and survey flows |
| Placement of Worlds           | `StarSystemBuilder.vue`, `stellarSurveySystemGenerator.js` | WBH baseline number, baseline orbit, spread, empty/anomalous-orbit, and slot placement helpers now drive orbit layout.                                                                      | Integrated shared helper path          |
| Basic World Sizing            | `StarSystemBuilder.vue`                                    | WBH terrestrial and gas giant sizing now route through the shared physical-characteristics helper, but downstream use of gas giant mass/gravity remains limited.                            | Integrated through shared helper       |
| Significant Moons / Moon Size | `StarSystemBuilder.vue`                                    | Significant moon quantity and size now route through WBH-inspired shared helpers, and significant moons now enter the generated system roster.                                              | Partial integration                    |
| Mainworld Candidate           | `StarSystemBuilder.vue`, `WorldBuilder.vue`                | System-level scoring can now promote significant moons to mainworld candidates, but full later-chapter refinement is incomplete.                                                            | Partial integration                    |

### Chapter 5: World Physical Characteristics

| WBH section                           | Current module(s)          | Gap                                                                                                                                                                                                                                                                         | Scaffold status                                                |
| ------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Size / Diameter                       | `worldProfileGenerator.js` | Base size roll is still heuristic, but WBH diameter and size-profile calculations are now applied through the shared helper.                                                                                                                                                | Integrated through `generateWorldPhysicalCharacteristicsWbh()` |
| Composition and Density               | `worldProfileGenerator.js` | WBH composition and density calculations are now applied through the shared helper.                                                                                                                                                                                         | Integrated through shared helper                               |
| Gravity and Mass                      | `worldProfileGenerator.js` | WBH gravity and mass calculations are now applied through the shared helper.                                                                                                                                                                                                | Integrated through shared helper                               |
| Atmosphere                            | `worldProfileGenerator.js` | Atmosphere generation now routes through the WBH helper, but exact WBH atmosphere sub-procedures are still incomplete.                                                                                                                                                      | Integrated through shared helper                               |
| Hydrographics                         | `worldProfileGenerator.js` | Hydrographics generation now routes through the WBH helper, but exact WBH surface/liquid rules are still incomplete.                                                                                                                                                        | Integrated through shared helper                               |
| Rotation / Tilt / Tides / Temperature | `worldProfileGenerator.js` | Temperature, day length, axial tilt, and orbital period now route through the WBH helper; tidal-effect rules remain incomplete.                                                                                                                                             | Integrated through shared helper                               |
| Seismology / Life / Mainworld         | `worldProfileGenerator.js` | Native-life handling plus Chapter 5 life-profile, habitability, resource-summary, seismology, tectonic-plate, and explicit final-mainworld-selection helpers now live in the shared WBH modules, and generated worlds expose economics-style summary fields and remarks, but deeper later-chapter physical refinement is still lighter than WBH. | Partial integration                                            |

## Verified Gaps

### World builder

- `generateWorldProfile()` still begins from a heuristic base size roll, but it now applies provisional WBH-style social/UWP generation instead of hard-coded barren defaults.
- Atmosphere, hydrographics, temperature, moons, magnetosphere, and physical calculations now route through `worldPhysicalCharacteristicsWbh.js`.
- Population, government, law level, tech level, starport, and trade/economic downstream rules are now generated in this path, and Chapter 5 life-profile, habitability, resource, seismology, and final-mainworld-selection summaries now route through shared WBH helpers, but later WBH social-detail chapters are not yet implemented.

### Star generator

- `generatePrimaryStar()` now returns WBH outputs directly, including non-stellar primaries.
- UI display helpers now normalize non-stellar descriptors such as white dwarfs, brown dwarfs, protostars, and peculiar objects.
- WBH multiple-star presence and non-primary derivation now exist, including partial continuation metadata for companion stars and recursive descendant-branch metrics, but more advanced hierarchical handling remains incomplete.

### System generator

- System multiplicity is now table-driven in the builder flow through the WBH multiple-star helper.
- Orbit spacing, body counts, baseline/spread logic, and habitable-zone calculations now share the WBH Chapter 4 helper path between builder and survey persistence.
- Gas giant sizing and significant moon quantity/size now route through shared WBH helpers, and significant moons can now become generated mainworlds, but several later world-detail procedures remain simplified.

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

The handbook source is now present in-repo, so the remaining blockers are no longer access to the text but implementation breadth and explicit decisions about which later-chapter procedures should remain simplified.

## Recommended Next Work

1. Tighten multiple-star handling further for split-system continuation and deeper hierarchy edge cases beyond the new descendant-branch exclusion propagation.
2. Extend moon-aware mainworld selection beyond the current map, persisted summaries, auto-hydrating survey form, and shared final-mainworld helper to any remaining world-detail editors or reports that still only surface top-level planets.
3. Extend social/mainworld work beyond the current provisional UWP, importance, economics-summary, and remarks overlays into later-chapter WBH detail or explicitly documented house rules.
