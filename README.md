# Eclipsed Horizons Companion

A comprehensive, web-based **universe creation and management system** for tabletop RPG campaigns built around _Traveller 5_ mechanics, but independent of official canon. Users create their own universes from scratch — galaxies, star systems, worlds, sophonts, creatures, and procedural histories.

## Features

| Tool                                 | Description                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| 🌌 **Galaxy Survey**                 | Multi-galaxy management with density mapping and import/export               |
| 🗺️ **Sector Survey (Class 0)**       | Hexagonal sector generation with weighted star distribution                  |
| ⭐ **Star System Builder (Class I)** | Primary/secondary stars, habitable zones, and planetary catalogs             |
| 🌍 **World Builder (Class II–IV)**   | Full UWP generation — physical, system, and census surveys                   |
| 🧬 **Sophont Generator**             | Intelligent life with biology, characteristic modifiers, and cultural traits |
| 🦎 **Creature Generator**            | Fauna/flora with combat profiles and ecological notes                        |
| 📜 **History Generator**             | Procedural timelines, civilizations, and key historical events               |

## Quick Start

### Documentation Site

```bash
npm install
npm run docs:dev        # Preview at http://localhost:5173
npm run docs:build      # Build static site
```

### System Generator (Vue 3 Frontend)

```bash
cd apps/system-generator/frontend
npm install
npm run dev             # Dev server at http://localhost:5173
npm run build           # Production build → dist/
```

### Data Validation

```bash
npm run validate:all    # YAML lint + rules validation + data validation
```

### Git Safeguards

Install local git hooks once per clone:

```bash
npm run hooks:install
```

This pre-commit hook blocks:

- Database artifacts: `.db`, `.sqlite`, `.sqlite3`, `.wal`, `.shm`, `.db-wal`, `.db-shm`
- Files larger than 25 MB

## Project Structure

```
eclipsed-horizons-companion/
├── apps/
│   └── system-generator/
│       ├── frontend/          ← Vue 3 + Pinia + Vue Router SPA
│       │   ├── src/
│       │   │   ├── pages/surveys/   ← GalaxySurvey, SectorSurvey, StarSystemBuilder,
│       │   │   │                       WorldBuilder, SophontGenerator,
│       │   │   │                       CreatureGenerator, HistoryGenerator
│       │   │   ├── stores/          ← galaxyStore (Pinia, localStorage)
│       │   │   ├── components/      ← SurveyNavigation
│       │   │   ├── utils/           ← galaxySizeCalculator (re-exports backend)
│       │   │   ├── router/          ← Vue Router config
│       │   │   ├── App.vue
│       │   │   └── main.js
│       │   ├── package.json
│       │   ├── vite.config.js
│       │   └── index.html
│       └── backend/
│           └── generators/utils/   ← galaxyClassification, galaxyImporter, galaxySizeCalculator
├── data/
│   ├── rules_master.yaml
│   └── schema/
├── docs/                       ← VitePress documentation site
├── scripts/                    ← validate-rules, lint-yaml, test-data-validation
└── tests/
```

## Architecture

- **Frontend**: Vue 3 SPA with Pinia state (localStorage persistence) and Vue Router hash history
- **Backend utilities**: Pure ES module helpers shared between frontend and backend
- **Documentation**: VitePress static site

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

Creative Commons Zero v1.0 Universal
