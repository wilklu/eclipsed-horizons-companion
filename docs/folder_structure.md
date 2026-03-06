eclipsed-horizon/  
├── .vscode/
│   └── settings.json
├── backend/
│   ├── database/
│   │   ├── init.js (CREATE TABLES)
│   │   └── eclipsed-horizon.db (DATABASE FILE)  
│   ├── generators/
│   │   ├── data/
│   │   │   ├── starSubtypeDetermination.json
│   │   │   └── starTypeDetermination.json
│   │   ├── tests/
│   │   │   └── primaryStar.test.js
│   │   ├── utils/
│   │   │   └── dice.js
│   │   ├── StarGenerator.js
│   │   ├── test-stars.js
│   │   └── WorldGenerator.js
│   ├── node_modules/
│   │   └── [ .../ ]
│   ├── routes/  
│   │   └── systems.js (API ENDPOINTS)
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── dev-notes/  
│   ├── ruleset-summary.md  
│   ├── database-schema.md (NEW)  
│   └── api-reference.md (NEW)
├── frontend/
│   ├── .vscode/
│   │   └── settings.json
│   ├── dist/
│   │   └── index.html
│   ├── node_modules/
│   ├── public/
│   │   └── vite.svg
│   ├── src
│   │   ├── api/
│   │   │   └── systemApi.js
│   │   ├── assets/
│   │   │   └── vue.svg
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.vue
│   │   │   │   └── Sidebar.vue
│   │   │   ├── forms/
│   │   │   │   ├── CensusSubunitProfileForm.vue
│   │   │   │   ├── GasGiantPhysicalSurveyForm.vue
│   │   │   │   ├── PlanetarySurveyForm.vue
│   │   │   │   ├── SectorSurveyForm.vue
│   │   │   │   ├── StellarSurveyForm.vue
│   │   │   │   ├── SystemSurveyForm.vue
│   │   │   │   ├── WorldCensusSurveyForm.vue
│   │   │   │   ├── WorldHexMapForm.vue
│   │   │   │   ├── WorldHexMapFormAdvanced.vue
│   │   │   │   ├── WorldHexMapFormInteractive.vue
│   │   │   │   └── WorldPhysicalSurveyForm.vue
│   │   │   ├── scanner/
│   │   │   │   ├── ScannerDisplay.vue
│   │   │   │   ├── ScanLog.vue
│   │   │   │   ├── ProgressBar.vue
│   │   │   │   ├── StarEntry.vue
│   │   │   │   ├── StatusBar.vue
│   │   │   │   └── scanner.css
│   │   │   └── HelloWorld.vue
│   │   ├── pages/
│   │   │   ├── Dashboard.vue
│   │   │   ├── GenerateSystem.vue
│ │ │ ├── ScannerDisplay.vue
│   │   │   └── SystemEditor.vue
│   │   ├── stores/
│   │   │   └── systemStore.js
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── router.js
│   │   └── sytle.css
│   └── .gitignore
├── node_modules/
│   └── [ .../ ]
├── index.html
├── package-lock.json
├── package.json
└── README.md
