┌─────────────────────────────────────────────────────────────────┐
│ CLASS 0 SECTOR SURVEY (Long Range Scan)                         │
│ ├─ Sector or Subsector Selection                                │
│ ├─ Generate: Primary Star, Secondary, Companions                │
│ └─ [Next: Class I] ────────────────────────────────────────────→│
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLASS I STELLAR SURVEY (Star System Properties)                 │
│ ├─ Selected System Display                                      │
│ ├─ Generate: Stellar subtypes, Mass, Temp, Diameter             │
│ ├─ Generate: Gas Giant presence                                 │
│ ├─ [← Back: Class 0] [Next: Class II →]                         │
│ └─ Direct Jump: [Go to Class II System Survey]                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLASS II SYSTEM SURVEY (Planetary Catalog)                      │
│ ├─ System Overview + All Planets/Moons Listed                   │
│ ├─ Generate: Planetary orbits, Size codes                       │
│ ├─ Generate: Preliminary Atmosphere & Hydrographics             │
│ ├─ Mainworld Determination (preliminary)                        │
│ ├─ [← Back: Class I] [Next: Class III →]                        │
│ └─ [Select Planet → Class II Planetoid Survey]                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLASS II PLANETOID/WORLD SURVEY (Individual World)              │
│ ├─ Selected Body Focus                                          │
│ ├─ Generate: Detailed Size, Atmosphere, Hydrographics           │
│ ├─ Generate: Biosphere, Climate, Surface features               │
│ ├─ [← Back: Class II System] [Next: Class III →]                │
│ └─ [Advanced: Go to Class III Physical]                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLASS III WORLD PHYSICAL SURVEY                                 │
│ ├─ Detailed Planetary Profile                                   │
│ ├─ Generate: Taint codes, Cultural Data (preliminary)           │
│ ├─ Generate: Complete SAH data                                  │
│ ├─ [← Back: Class II] [Next: Class IV →]                        │
│ └─ Landing Party Data & Probe Deployment Info                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLASS IV WORLD CENSUS SURVEY                                    │
│ ├─ Population & Government Data                                 │
│ ├─ Generate: Tech Level, Trade Codes                            │
│ ├─ Generate: Allegiance, Base Locations                         │
│ ├─ [← Back: Class III]                                          │
│ └─ [Class IVa: Subunit Census] ──→ Detailed Region Data         │
└─────────────────────────────────────────────────────────────────┘

Survey Class	        Duration	Key Data	                    Generated
Class 01	            Remote	    Star type, subtype	            Primary/Secondary/Companions
Class I1	            1 day	    Stellar info, gas giants	    Subtype, mass, luminosity
Class II: System	    1 week	    Planets, moons, belts	        Orbits, sizes, preliminary atmosphere
Class II: Planetoid	      -	        World details	                SAH codes, climate
Class III               10 weeks	Physical characteristics	    Complete planetary profile
Class IV	            30 weeks	Census/social data	            Population, tech level, government

1. [ ] Create the remaining survey pages (I, II, III, IV) following the same pattern
2. [ ]Build surveyGenerator.js with logic for each class
3. [ ]Implement Pinia store for cross-component state
4. [ ]Add data persistence (localStorage/database)
5. [ ]Create export functionality (JSON/PDF formats)