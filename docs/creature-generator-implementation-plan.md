# Creature Generator Implementation Plan

## Goal

Build a Traveller-style Creature Generator that starts from BeastMaker Simple for fast encounter generation and grows into BeastMaker Extended for a full creature dossier. The same rules engine should later feed the Sophont Generator.

## Reference Basis

Primary source: [docs/reference/Beasts and Sophonts.md](docs/reference/Beasts%20and%20Sophonts.md)

Key design takeaway:

- **Creature first** uses BeastMaker Simple and Extended.
- **Sophont later** extends the same biological foundation rather than replacing it.

## Current Repository State

What already exists:

- Navigation links for Creature and Sophont tools are already present in [apps/system-generator/frontend/src/App.vue](apps/system-generator/frontend/src/App.vue).
- Placeholder routes exist in [apps/system-generator/frontend/src/router/index.js](apps/system-generator/frontend/src/router/index.js).
- A prototype creature page already exists in [apps/system-generator/frontend/src/pages/surveys/CreatureGenerator.vue](apps/system-generator/frontend/src/pages/surveys/CreatureGenerator.vue), but it is not yet wired into the router and does not use the rulebook tables.

## Product Scope

### Phase 1: Creature MVP

Deliver a usable app that can:

1. Generate a single creature from a selected world or manual world profile.
2. Generate a 6-entry encounter table for a terrain type.
3. Show rule-derived outputs for:
   - terrain
   - locomotion
   - niche and subniche
   - quantity
   - size
   - speed
   - attack and flee values
   - weapon and armour
   - basic ecology notes
4. Export the generated result as JSON.

### Phase 2: Extended Creature Dossier

Add richer outputs from BeastMaker Extended:

- body symmetry and stance
- senses
- feeding model
- life cycle and reproduction
- social behavior
- combat profile
- notable adaptations and special traits
- referee notes and encounter hooks

### Phase 3: World-Integrated Creature Ecology

Add world-aware generation from existing survey data:

- use world size for gravity modifiers
- use atmosphere and hydrographics for habitat filtering
- use climate and terrain context from generated worlds
- support multiple terrains per world
- allow generating local fauna lists attached to a world record

## Architecture Plan

## 1. Shared Rules Engine

Create a reusable beast-generation module under the frontend utils area.

Suggested structure:

- `src/utils/beasts/beastTables.js`
- `src/utils/beasts/beastGenerator.js`
- `src/utils/beasts/beastFormatting.js`
- `src/utils/beasts/beastGenerator.spec.js`

Responsibilities:

- keep the rule tables in plain data form
- keep dice and flux logic deterministic and testable
- separate raw rule output from UI formatting
- produce a normalized creature record that Sophonts can later extend

## 2. Core Creature Record

Use a stable data shape like:

- identity: name, id, source world, terrain
- environment: native terrain, locomotion, gravity band
- ecology: niche, subniche, diet, social pattern, activity cycle
- physical: size class, measured scale, body plan, senses, covering
- encounter: quantity, reaction profile, attack and flee thresholds
- combat: hits, armour, weapons, speed bands
- metadata: generator version, seed, timestamp, source rules

This record should be exportable and later mappable to a schema and database table.

## 3. UI Plan

Upgrade [apps/system-generator/frontend/src/pages/surveys/CreatureGenerator.vue](apps/system-generator/frontend/src/pages/surveys/CreatureGenerator.vue) from prototype to production flow.

### Controls panel

- world selector or manual world inputs
- terrain selector
- niche mode: random or forced
- name randomizer
- seed field for reproducible output
- mode toggle: single creature or encounter table

### Results area

- creature summary card
- detailed stats sections
- encounter behavior panel
- ecological notes panel
- export button

### Later enhancement

- encounter-table grid by terrain
- save to archive or attach to world
- image/icon presets by locomotion and niche

## 4. Data and Persistence

For MVP, export-only is enough.

For persistent integration later:

- add a creature schema similar to the existing entity schemas
- optionally add a `creatures` table and link creatures to `worldId`
- include creatures in backup/import/export flows after the generator is stable

## Build Order

### Milestone A: Rules foundation

- extract BeastMaker Simple tables from the reference
- implement dice helpers and flux helpers
- implement terrain to locomotion resolution
- implement niche and subniche resolution
- implement quantity, size, speed, and reaction derivation

### Milestone B: Functional UI

- route `/creature-generator` to the actual page instead of the unavailable placeholder
- replace the current random flavor generator with rule-driven output
- support generate and regenerate
- support JSON export

### Milestone C: Tests and validation

- unit tests for all major table lookups
- fixed-seed regression tests for deterministic outputs
- UI smoke test for generation flow

### Milestone D: World integration

- preload from current world or system context
- terrain-aware encounter generation
- world-linked fauna export bundle

## Acceptance Criteria for MVP

The Creature Generator is ready when it can:

- generate a valid creature from BeastMaker Simple rules
- show clear terrain, locomotion, niche, size, speed, and reactions
- generate a repeatable result from the same seed
- export a structured creature JSON file
- support both fully random and partially guided generation

## Sophont Readiness

This plan intentionally prepares for Sophonts by sharing:

- body and movement foundations
- sense and adaptation rules
- environment compatibility logic
- life-cycle and social baselines

When Creature is complete, the Sophont Generator can build on the same engine instead of starting over.

## Recommended Next Implementation Step

Start with **Milestone A**:

1. encode the BeastMaker Simple tables
2. build the deterministic generator utility
3. write tests against the reference tables
4. then wire the UI page to that engine
