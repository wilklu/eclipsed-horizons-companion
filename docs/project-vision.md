# Project Vision

## Purpose

Eclipsed Horizons Companion is not a collection of unrelated generators. It is a connected universe-building and simulation project where multiple apps contribute to the same persistent setting.

The long-term goal is to let a referee or players:

- generate one or more galaxies
- populate those galaxies with sectors, stars, systems, and worlds
- determine which worlds can support life
- generate flora and fauna where biospheres are viable
- identify worlds where native sophont life can emerge
- create, assign, and evolve sophonts over time
- generate histories for sophonts, worlds, systems, and interstellar societies
- continue developing that universe through play, referee intervention, and later simulation tools

## Core Model

Each app should be treated as one layer in a shared universe pipeline.

1. Galaxy Layer
   Generate galactic structure, morphology, density, and large-scale layout.

2. Sector Layer
   Translate galaxy structure into sectors, subsectors, stellar density, and exploration state.

3. System Layer
   Generate stars, orbital architecture, major worlds, and local system conditions.

4. World Layer
   Generate world physical properties and environmental viability.

5. Biosphere Layer
   Determine whether a world can support life, then generate flora and fauna only when conditions support it.

6. Sophont Layer
   Determine whether native sophont life can emerge. Sophonts should be created and assigned deliberately rather than implied automatically by every habitable world.

7. Civilization Layer
   Only when sophonts exist should social, governmental, legal, economic, cultural, and historical systems be generated.

8. Campaign Layer
   Players and referees should be able to influence, develop, and progress sophonts and civilizations across the galaxy over time.

## Shared State Principles

To keep all apps aligned, the project should maintain a clear distinction between the following states:

- world supports life
- world has non-sophont biosphere
- world has native sophont life
- world has imported or colonizing sophonts
- world has active civilization
- world has historical records or interstellar significance

These states must not be collapsed into a single “inhabited” concept.

## Design Principles

- Every generator should produce structured state that later apps can consume.
- Later layers should only unlock when earlier prerequisites are satisfied.
- UI shortcuts must not silently bypass world-state rules.
- Cross-app navigation should preserve context, but domain state matters more than page state.
- The system generator is only the current focus, not the full scope of the project.

## Current Development Implications

While work is focused on the System Generator, changes should be evaluated against the larger project direction.

- Galaxy, sector, system, and world outputs should be usable by future flora, fauna, sophont, and history tools.
- Social and civilization properties should not be generated unless sophont prerequisites are met.
- Metadata should remain explicit enough that later apps do not need to infer intent from display text.
- Survey tools should be treated as producers and editors of shared universe state, not isolated standalone utilities.

## Living Document

This document is intended to be updated as the project evolves.

When new generators or simulation apps are added, update this file so implementation work stays aligned with the same end goal across the repository.
