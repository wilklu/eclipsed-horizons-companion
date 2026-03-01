const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file location
const dbPath = path.join(__dirname, "eclipsed-horizon.db");

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
    process.exit(1);
  }
  console.log("✓ Connected to SQLite database");
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Create tables
db.serialize(() => {
  // star_systems table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS star_systems (
      system_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sector TEXT,
      subsector_name TEXT,
      subsector_postion TEXT,
      system_name TEXT NOT NULL,
      system_seed INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      hex TEXT,
      total_stars NUMERIC,
      total_orbits NUMERIC,
      total_worlds NUMERIC,
      total_moons NUMERIC,
      gas_giants NUMERIC,
      planetoid_belts NUMERIC,
      terrestrial_planets NUMERIC,
      empty_orbits NUMERIC,
      available_system_orbits NUMERIC,
      baseline NUMERIC,
      baseline_orbit NUMERIC,
      spread REAL
    )
  `,
    (err) => {
      if (err) console.error("Error creating star_systems table:", err);
      else console.log("✓ star_systems table ready");
    },
  );

  // stars table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS stars (
      star_id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER,
      name TEXT,
      object TEXT,
      position TEXT,
      component TEXT,
      category TEXT,
      designation TEXT,
      type TEXT,
      subtype INTEGER,
      class TEXT,
      mass REAL,
      diameter REAL,
      luminosity REAL,
      temperature REAL,
      age REAL,
      mao REAL,
      orbit_number NUMERIC,
      orbit_au NUMERIC,
      eccentricity REAL,
      separation_minimum REAL,
      separation_maximum REAL,
      orbit_minimum REAL,
      orbit_maximum REAL,
      available_orbits REAL,
      orbit_list TEXT,
      orbital_period REAL,
      hzco_au REAL,
      hzco_number REAL,
      hzco_deviation REAL,
      assigned_worlds REAL,
      maximum_spread REAL,
      FOREIGN KEY (system_id) REFERENCES star_systems(system_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating stars table:", err);
      else console.log("✓ stars table ready");
    },
  );

  // worlds table (renamed from planets)
  db.run(
    `
    CREATE TABLE IF NOT EXISTS worlds (
      world_id INTEGER PRIMARY KEY AUTOINCREMENT,
      star_id INTEGER,
      name TEXT,
      uwp_starport TEXT,
      uwp_size TEXT,
      uwp_atmosphere TEXT,
      uwp_hydrographics TEXT,
      uwp_population TEXT,
      uwp_government TEXT,
      uwp_law TEXT,
      uwp_technology TEXT,
      uwp_trade_codes TEXT,
      zone TEXT,
      orbit_number NUMERIC,
      orbit_au NUMERIC,
      order_number NUMERIC,
      designation TEXT,
      eccentricity REAL,
      orbital_period REAL,
      diameter REAL,
      mass REAL,
      significant_moons NUMERIC,
      significant_body_sizes TEXT,
      insignificant_moons NUMERIC,
      composition TEXT,
      density REAL,
      gravity REAL,
      escape_velocity REAL,
      orbital_velocity REAL,
      atmosphere_subcode TEXT,
      atmosphere_type TEXT,
      atmosphere_composition TEXT,
      runaway_greenhouse BOOLEAN,
      atmospheric_pressure REAL,
      oxygen_fraction REAL,
      oxygen_percent REAL,
      scale_height REAL,
      taint BOOLEAN,
      taint_profile TEXT,
      irritant BOOLEAN,
      irritant_profile TEXT,
      hazard BOOLEAN,
      hazard_profile TEXT,
      hydrographics_percent REAL,
      surface_distribution_code TEXT,
      surface_distribution_description TEXT,
      surface_distribution_effect TEXT,
      hydrographics_composition TEXT,
      sidereal_day REAL,
      sidereal_year REAL,
      solar_day REAL,
      axial_tilt REAL,
      axial_tilt_remarks TEXT,
      hill_sphere_au REAL,
      hill_sphere_pd REAL,
      hill_sphere_moon_limit REAL,
      moon_orbit_range REAL,
      tidal_lock_star BOOLEAN,
      tidal_lock_star_effect TEXT,
      tidal_lock_moon BOOLEAN,
      tidal_lock_moon_effect TEXT,
      star_tidal_effect REAL,
      moon_tidal_effect REAL,
      albedo REAL,
      greenhouse_factor REAL,
      mean_temperature REAL,
      low_temperature REAL,
      high_temperature REAL,
      axial_tilt_factor REAL,
      rotation_factor REAL,
      geographic_factor REAL,
      variance_factor REAL,
      atmospheric_factor REAL,
      luminosity_modifier REAL,
      luminosity_high REAL,
      luminosity_low REAL,
      au_near REAL,
      au_far REAL,
      residual_seismic_stress REAL,
      tidal_heating_factor REAL,
      total_seismic_stress REAL,
      major_tectonic_plates REAL,
      biomass_rating REAL,
      biocomplexity_rating REAL,
      biocomplexity_description TEXT,
      native_sophonts BOOLEAN,
      native_sophonts_extinct BOOLEAN,
      biodiversity_rating REAL,
      compatibility_rating REAL,
      resource_rating REAL,
      resource_rating_remarks REAL,
      habitability_rating REAL,
      habitability_rating_remarks TEXT,
      FOREIGN KEY (star_id) REFERENCES stars(star_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating worlds table:", err);
      else console.log("✓ worlds table ready");
    },
  );

  // gas_giants table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS gas_giants (
      gas_giant_id INTEGER PRIMARY KEY AUTOINCREMENT,
      star_id INTEGER,
      name TEXT,
      FOREIGN KEY (star_id) REFERENCES stars(star_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating gas_giants table:", err);
      else console.log("✓ gas_giants table ready");
    },
  );

  // planetoid_belts table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS planetoid_belts (
      planetoid_belt_id INTEGER PRIMARY KEY AUTOINCREMENT,
      star_id INTEGER,
      belt_span REAL,
      belt_bulk REAL,
      resource_rating REAL,
      FOREIGN KEY (star_id) REFERENCES stars(star_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating planetoid_belts table:", err);
      else console.log("✓ planetoid_belts table ready");
    },
  );

  // empty_orbit table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS empty_orbit (
      empty_orbit_id INTEGER PRIMARY KEY AUTOINCREMENT,
      star_id INTEGER,
      FOREIGN KEY (star_id) REFERENCES stars(star_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating empty_orbit table:", err);
      else console.log("✓ empty_orbit table ready");
    },
  );

  // moons table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS moons (
      moon_id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_id INTEGER,
      name TEXT,
      uwp_starport TEXT,
      uwp_size TEXT,
      uwp_atmosphere TEXT,
      uwp_hydrographics TEXT,
      uwp_population TEXT,
      uwp_government TEXT,
      uwp_law TEXT,
      uwp_technology TEXT,
      uwp_trade_codes TEXT,
      zone TEXT,
      orbit_range REAL,
      orbit_number NUMERIC,
      orbit_pd REAL,
      orbit_km NUMERIC,
      order_number NUMERIC,
      designation TEXT,
      eccentricity REAL,
      orbital_period REAL,
      diameter REAL,
      mass REAL,
      significant_moons NUMERIC,
      significant_body_sizes TEXT,
      insignificant_moons NUMERIC,
      composition TEXT,
      density REAL,
      gravity REAL,
      escape_velocity REAL,
      orbital_velocity REAL,
      atmosphere_subcode TEXT,
      atmosphere_type TEXT,
      atmosphere_composition TEXT,
      runaway_greenhouse BOOLEAN,
      atmospheric_pressure REAL,
      oxygen_fraction REAL,
      oxygen_percent REAL,
      scale_height REAL,
      taint BOOLEAN,
      taint_profile TEXT,
      irritant BOOLEAN,
      irritant_profile TEXT,
      hazard BOOLEAN,
      hazard_profile TEXT,
      hydrographics_percent REAL,
      surface_distribution_code TEXT,
      surface_distribution_description TEXT,
      surface_distribution_effect TEXT,
      hydrographics_composition TEXT,
      sidereal_day REAL,
      sidereal_year REAL,
      solar_day REAL,
      axial_tilt REAL,
      axial_tilt_remarks TEXT,
      tidal_lock BOOLEAN,
      tidal_lock_effect REAL,
      tidal_lock_moon BOOLEAN,
      star_tidal_effect REAL,
      planet_tidal_effect REAL,
      moon_tidal_effect REAL,
      albedo REAL,
      greenhouse_factor REAL,
      mean_temperature REAL,
      low_temperature REAL,
      high_temperature REAL,
      axial_tilt_factor REAL,
      rotation_factor REAL,
      geographic_factor REAL,
      variance_factor REAL,
      atmospheric_factor REAL,
      luminosity_modifier REAL,
      luminosity_high REAL,
      luminosity_low REAL,
      au_near REAL,
      au_far REAL,
      residual_seismic_stress REAL,
      tidal_heating_factor REAL,
      total_seismic_stress REAL,
      major_tectonic_plates REAL,
      biomass_rating REAL,
      biocomplexity_rating REAL,
      biocomplexity_description TEXT,
      native_sophonts BOOLEAN,
      native_sophonts_extinct BOOLEAN,
      biodiversity_rating REAL,
      compatibility_rating REAL,
      resource_rating REAL,
      resource_rating_remarks REAL,
      habitability_rating REAL,
      habitability_rating_remarks TEXT,
      FOREIGN KEY (world_id) REFERENCES worlds(world_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating moons table:", err);
      else console.log("✓ moons table ready");
    },
  );

  // moon_gas_giants table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS moon_gas_giants (
      moon_id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_id INTEGER,
      FOREIGN KEY (world_id) REFERENCES worlds(world_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating moon_gas_giants table:", err);
      else console.log("✓ moon_gas_giants table ready");
    },
  );

  // moon_rings table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS moon_rings (
      moon_ring_id INTEGER PRIMARY KEY AUTOINCREMENT,
      world_id INTEGER,
      ring_span REAL,
      ring_bulk REAL,
      resource_rating REAL,
      center_location REAL,
      FOREIGN KEY (world_id) REFERENCES worlds(world_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating moon_rings table:", err);
      else console.log("✓ moon_rings table ready");
    },
  );

  // system_history table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS system_history (
      system_history_id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_id INTEGER,
      action TEXT,
      data_snaphot TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      version_number INTEGER,
      FOREIGN KEY (system_id) REFERENCES star_systems(system_id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating system_history table:", err);
      else console.log("✓ system_history table ready");
    },
  );

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_system_id ON stars(system_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_star_id ON worlds(star_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_world_id ON moons(world_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_gas_giant_id ON gas_giants(star_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_planetoid_belt_id ON planetoid_belts(star_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_empty_orbit_id ON empty_orbit(star_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_moon_gas_giants_id ON moon_gas_giants(world_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_moon_rings_id ON moon_rings(world_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_history_system ON system_history(system_id)`);
});

// Close database
setTimeout(() => {
  db.close((err) => {
    if (err) console.error("Error closing database:", err);
    else console.log("✓ Database initialization complete!");
    process.exit(0);
  });
}, 1000);
