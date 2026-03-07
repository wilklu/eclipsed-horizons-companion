# Eclipsed Horizons Companion

Integrated Traveller Tools and House Rules Documentation for the **Eclipsed Horizons** campaign.

## Overview

This repository serves two interconnected purposes:

### 1. House Rules Documentation System

A centralized, version-controlled wiki documenting all custom rules used at the Eclipsed Horizons table. Located in [`docs/house-rules/`](docs/house-rules/).

| Status | Description |
|---|---|
| **CANON** | Official Mongoose Traveller rules, included for quick reference |
| **APPROVED** | Agreed-upon house rules in active use |
| **OPTIONAL** | Player-selectable rules |
| **EXPERIMENTAL** | Under playtesting, subject to revision |

Rule categories: [Character Creation](docs/house-rules/character-creation.md) · [Combat](docs/house-rules/combat.md) · [Psionics](docs/house-rules/psionics.md) · [Trade & Commerce](docs/house-rules/trade-and-commerce.md) · [Space Travel](docs/house-rules/space-travel.md) · [World Building](docs/house-rules/world-building.md)

See [CHANGELOG.md](docs/house-rules/CHANGELOG.md) for full rule history.

### 2. Integrated Application Suite

A React web application housing multiple Traveller generation tools:

| Application | Status | Description |
|---|---|---|
| **Sophont Generator** | ✅ Available | Procedurally generate alien sophont species |
| **World Builder** | ✅ Available | Generate star systems with full UWP data |
| **Character Generator** | ✅ Available | Build characters using the life path system |
| **Ship Builder** | 🔜 Coming Soon | Design and outfit spacecraft |
| **Subsector Mapper** | 🔜 Coming Soon | Generate and visualise full subsectors |

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Contributing

### House Rules

All rule changes are managed through GitHub pull requests. Proposed rules start with status `EXPERIMENTAL`. After two sessions of playtesting they are put to a table vote — passing vote moves them to `APPROVED`.

### Application Code

1. Fork or branch from `main`
2. Make your changes
3. Run `npm run lint` and `npm run build` to verify
4. Open a pull request

## License

[CC0 1.0 Universal](LICENSE) — Public Domain
