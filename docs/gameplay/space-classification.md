# Space Classification System

## Overview

The **Space Classification System** divides your explored universe into three tiers based on survey completion and exploration distance. This hierarchical model gives players clear feedback about which regions are known, which are emerging, and which remain unexplored void.

### The Three Tiers

#### 🫒 **Surveyed Tier**

- **Definition**: Sectors where systems have been generated and surveyed
- **Visual**: Solid color on the Traveller Atlas
- **Generation Policy**: Full system generation (stars, worlds, NPCs, trade codes)
- **Gameplay**: These are your established regions—safe, charted space

#### 🌊 **Frontier Tier**

- **Definition**: Sectors adjacent (one ring) to any Surveyed sector
- **Visual**: Dashed border overlay on the Traveller Atlas
- **Generation Policy**: Presence-only (stars detected but not surveyed) + optional user-initiated generation
- **Gameplay**: The edge of known space—dangerous, unexplored but adjacent to civilization
- **Dynamic Promotion**: Automatically transitions to Frontier when a neighboring Surveyed sector is generated

#### 🌑 **Void Tier**

- **Definition**: All sectors beyond one ring of Surveyed sectors
- **Visual**: No overlay on the Traveller Atlas
- **Generation Policy**: Presence-only stub data (star positions but no survey)
- **Gameplay**: The deep unknown—exploration requires player initiative

## Collision Avoidance: Generation Boundaries

One of the core design goals is to prevent **hard caps** that feel arbitrary. Instead, the Space Classification System provides **soft boundaries** that align with exploration state:

### How It Works

1. **Default**: New campaigns start with a 10×10 planning region (121 sectors max)
2. **Exploring**: When you survey sector **[0,0]**, the surrounding 8 sectors automatically become Frontier
3. **Expanding**: Keep surveying outward. Each newly Surveyed sector expands your Frontier ring
4. **Your Choice**: You control when to expand—survey is player-driven, not AI-driven

### Without Hard Caps

Old systems used rigid boundaries like "you can generate a max of 2047 systems." This caused:

- ❌ **Mystery Cap Frustration**: Players hit invisible walls
- ❌ **Broken Exploration**: "Why can't I explore here?" (because you're outside an arbitrary circle)
- ❌ **No Natural Pacing**: Expansion felt gated by rules, not by gameplay

### With Space Tiers

New exploration feels natural:

- ✅ **Visible Frontier**: Know exactly where you are relative to surveyed space
- ✅ **Organic Expansion**: Each survey extends your known world outward
- ✅ **Soft Guidance**: Legend shows you how many sectors are in each tier
- ✅ **Player Control**: You decide how far to push into the void

## Legend Display

At the bottom of the **Traveller Atlas**, you'll see the **Space Tiers** legend:

```
Space Tiers: [S] Surveyed: 1 | [F] Frontier: 8 | [∞] Void: Beyond
```

- **S Badge**: Blue, solid background — Surveyed sectors count
- **F Badge**: Green, solid background — Frontier sectors count
- **∞ Badge**: Purple, solid background — Void (infinite)

### What the Counts Mean

| Tier            | Meaning                                      | Action                                         |
| --------------- | -------------------------------------------- | ---------------------------------------------- |
| **Surveyed: N** | You have N sectors fully surveyed and placed | Safe zone; trade and travel routes established |
| **Frontier: N** | N sectors adjacent to your surveyed space    | Ready for next wave of exploration             |
| **Void: ∞**     | Infinite unexplored space awaits             | Survey a frontier sector to push the boundary  |

### Example Progression

```
Turn 1: Survey Core Sector [0,0]
  Space Tiers: [S] Surveyed: 1 | [F] Frontier: 8 | [∞] Void: ∞

Turn 2–9: Survey 8 surrounding sectors
  Space Tiers: [S] Surveyed: 9 | [F] Frontier: 16 | [∞] Void: ∞

Turn 10+: Continue surveying outward
  Space Tiers: [S] Surveyed: 25 | [F] Frontier: 40 | [∞] Void: ∞
```

## Exploration Planning: 10×10 Grid

The system supports a **Planning Region** concept: a 10×10 grid (121 sectors) that represents your "current theater of operations."

### How Planning Works

1. **Scope**: At any time, you focus on a 10×10 grid of immediate interest
2. **Strategy**: Survey from center outward to build a contiguous block of Surveyed sectors
3. **Shifting**: When a frontier becomes saturated, shift your planning grid to a new hot point

### Example: Core + Expansion Pattern

```
Planning Grid [Sector 0,0 ± 5 parsecs]:

     -5   -4   -3   -2   -1    0   +1   +2   +3   +4   +5
 -5  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 -4  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 -3  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 -2  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 -1  [ ]  [ ]  [ ]  [F]  [F]  [S]  [F]  [F]  [ ]  [ ]  [ ]
  0  [ ]  [ ]  [ ]  [F]  [S]  [S]  [S]  [F]  [ ]  [ ]  [ ]
 +1  [ ]  [ ]  [ ]  [F]  [F]  [S]  [F]  [F]  [ ]  [ ]  [ ]
 +2  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 +3  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 +4  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]
 +5  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]  [ ]

Legend: [S] = Surveyed, [F] = Frontier, [ ] = Void

→ After planning grid 1: 9 Surveyed + 8 Frontier
→ Shift planning grid to [0,10] for next phase
```

## API & System Integration

### Utility Functions

The Space Classification system is implemented in `src/utils/spaceClassification.js` and provides:

#### Core Classification

```javascript
// Calculate which tier a coordinate belongs to
calculateSpaceTier(sx, sy, surveyedCoordKeySet)
  → "surveyed" | "frontier" | "void"

// Check if a sector is surveyed (has systems)
isSurveyedSector(sector)
  → boolean

// Check if adjacent to any surveyed sector
isAdjacentToSurveyed(sx, sy, surveyedCoordKeySet)
  → boolean
```

#### Set Builders

```javascript
// Build surveyed set from sector array
buildSurveyedCoordKeySet(sectors)
  → Set<string>

// Build frontier set (adjacent rings)
buildFrontierCoordKeySet(surveyedCoordKeySet)
  → Set<string>

// Build combined known space (surveyed + frontier)
buildKnownSpaceCoordKeySet(surveyedCoordKeySet)
  → Set<string>

// Count sectors in each tier
countSpaceTiers(surveyedCoordKeySet)
  → { surveyed: N, frontier: N, void: null }
```

#### Planning Region

```javascript
// Calculate planning window capacity
calculatePlanningRegionCapacity(options)
  → { totalCapacity, centerX, centerY, planningRadius }

// Check if coordinates fall within planning window
isInPlanningWindow(sx, sy, centerX, centerY, planningRadius)
  → boolean
```

### Integration Points

#### Traveller Atlas (`TravellerMap.vue`)

- **Display**: Space tier counts in status bar legend
- **Overlay**: Known Space layer shows Surveyed (solid) + Frontier (dashed)
- **Toggle**: "Known Space" button hides/shows overlay
- **Filter**: "Known Only" button restricts view to known space

#### Generation Guards (Future)

```javascript
// Pseudo-code: policy enforcement
function canGenerateInSector(sector, spaceTier) {
  switch (spaceTier) {
    case "surveyed":
      return true; // Full generation
    case "frontier":
      return userInitiated; // Optional
    case "void":
      return false; // Stub only
  }
}
```

#### Survey Completion Hook (Future)

```javascript
// When survey completes, promote neighbors
onSectorSurveyComplete(sector) {
  const neighbors = getAdjacentSectors(sector);
  for (const neighbor of neighbors) {
    promote(neighbor, "void" → "frontier");
  }
}
```

## Design Rationale

### Why This Approach?

1. **Organic Exploration**: The frontier expands naturally as you explore; no arbitrary caps
2. **Clear Feedback**: Legend shows exactly where boundaries are
3. **Encouraging Outward Growth**: Each sector surveyed extends the frontier—invites further exploration
4. **Player Autonomy**: No forced generation caps; you control speed
5. **Performance Optimization**: Tiers can guide LOD culling and generation prioritization

### Prevents Common Issues

| Problem                         | Solution                                               |
| ------------------------------- | ------------------------------------------------------ |
| **Hard cap mystery**            | Soft boundaries tied to survey state                   |
| **Arbitrary generation limits** | Tiers guide but don't rigidly cap                      |
| **Poor exploration feedback**   | Live tier counts in legend                             |
| **Disconnected space**          | Only adjacent sectors can be surveyed; no random jumps |
| **Infinite sprawl**             | Planning grid + tier visibility discourages chaos      |

## Future Enhancements

### Phase 2: Dynamic Promotion

- [ ] Implement survey completion hook
- [ ] Auto-promote Void→Frontier on neighboring sector survey
- [ ] Animate frontier transitions in atlas

### Phase 3: Generation Enforcement

- [ ] Implement generation guards by tier
- [ ] Enforce Surveyed = full, Frontier = optional, Void = presence-only
- [ ] Show tier-based generation UI in inspector

### Phase 4: Planning Window UI

- [ ] Show 10×10 planning grid as overlay
- [ ] Display capacity meter: "9/121 sectors surveyed in plan"
- [ ] Allow manual planning-grid repositioning

### Phase 5: Trade & Commerce Integration

- [ ] Route generation limited to Surveyed + Frontier
- [ ] Trade clusters attract expansion toward frontier edge
- [ ] Route risk increases in frontier / void sectors

## Quick Reference

### Keyboard & Mouse

- **"Known Space" toggle** in layer toolbar → show/hide overlay
- **"Known Only" toggle** → restrict view to known space
- **Click sector tile** → inspector shows space tier

### Status Bar Legend

```
Space Tiers: [S] Surveyed: N | [F] Frontier: M | [∞] Void: Beyond
```

Left-click chip to filter by tier (future enhancement).

### Star System Survey Flow

1. Navigate to frontier sector on Traveller Atlas
2. Click "🧭 Sector Survey" button in inspector
3. Survey subsector(s) → generates systems
4. Neighboring sectors auto-promote to Frontier
5. Legend updates in real-time

## See Also

- [Traveller Atlas Guide](../reference/World%20Builder's%20Handbook.md)
- [System Generator Getting Started](getting-started/quick-start.md)
- [House Rules: World Building](house-rules/world-building.md)
