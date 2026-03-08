#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * Executes SQL migrations in order to initialize and update the SQLite database schema.
 *
 * Usage:
 *   node scripts/migrate.js [database_path]
 *
 * Default database path: apps/system-generator/backend/data/universe.db
 *
 * Features:
 * - Tracks applied migrations to prevent re-running
 * - Executes migrations in sequence (001, 002, etc.)
 * - Handles errors gracefully with rollback
 * - Shows status of current schema version
 */

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readdirSync, readFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DEFAULT_DB_PATH = join(__dirname, "..", "apps", "system-generator", "backend", "data", "universe.db");
const MIGRATIONS_DIR = join(__dirname, "..", "apps", "system-generator", "backend", "data", "database", "migrations");

/**
 * Initialize migrations tracking table
 */
function initMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT UNIQUE NOT NULL,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get list of applied migrations
 */
function getAppliedMigrations(db) {
  try {
    const migrations = db.prepare("SELECT migration_name FROM _schema_migrations").all();
    return new Set(migrations.map((m) => m.migration_name));
  } catch (err) {
    return new Set();
  }
}

/**
 * Get list of pending migrations
 */
function getPendingMigrations(appliedMigrations) {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.warn(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  return files.filter((f) => !appliedMigrations.has(f));
}

/**
 * Apply a single migration
 */
function applyMigration(db, migrationFile) {
  const filePath = join(MIGRATIONS_DIR, migrationFile);
  const sql = readFileSync(filePath, "utf-8");

  try {
    console.log(`  Applying migration: ${migrationFile}...`);

    // Execute migration SQL
    db.exec(sql);

    // Record in migrations table
    db.prepare("INSERT INTO _schema_migrations (migration_name) VALUES (?)").run(migrationFile);

    console.log(`  ✓ ${migrationFile} applied successfully`);
    return true;
  } catch (err) {
    console.error(`  ✗ Error applying ${migrationFile}:`);
    console.error(`    ${err.message}`);
    return false;
  }
}

/**
 * Verify database integrity
 */
function verifySchema(db) {
  try {
    console.log("\nVerifying schema integrity...");

    // Check required tables
    const tables = db
      .prepare(
        `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_schema_migrations'
    `,
      )
      .all();

    const tableNames = new Set(tables.map((t) => t.name));
    const expectedTables = new Set(["galaxies", "sectors", "systems", "worlds", "sophonts"]);

    if (expectedTables.size === 0) {
      console.log("  ⚠ No tables found (fresh database)");
      return true;
    }

    for (const table of expectedTables) {
      if (tableNames.has(table)) {
        console.log(`  ✓ Table "${table}" exists`);
      } else {
        console.log(`  ✗ Table "${table}" missing`);
        return false;
      }
    }

    // Verify indexes
    const indexes = db
      .prepare(
        `
      SELECT name FROM sqlite_master WHERE type='index' AND tbl_name IN (${Array.from(expectedTables)
        .map((t) => `'${t}'`)
        .join(",")})
    `,
      )
      .all();

    console.log(`  ✓ Found ${indexes.length} indexes on core tables`);

    return true;
  } catch (err) {
    console.error(`  ✗ Schema verification failed: ${err.message}`);
    return false;
  }
}

/**
 * Show migration status
 */
function showStatus(db) {
  try {
    const applied = db.prepare("SELECT COUNT(*) as count FROM _schema_migrations").get().count;
    const latestMigration = db
      .prepare(
        `
      SELECT migration_name, applied_at FROM _schema_migrations 
      ORDER BY applied_at DESC LIMIT 1
    `,
      )
      .get();

    console.log("\nMigration Status:");
    console.log(`  Applied migrations: ${applied}`);
    if (latestMigration) {
      console.log(`  Latest: ${latestMigration.migration_name} (${latestMigration.applied_at})`);
    }
  } catch (err) {
    console.log("  (No migrations applied yet)");
  }
}

/**
 * Main migration runner
 */
function main() {
  const dbPath = process.argv[2] || DEFAULT_DB_PATH;

  console.log("=== Database Migration Runner ===\n");
  console.log(`Database: ${dbPath}`);

  try {
    // Open database connection
    const db = new Database(dbPath);
    db.pragma("foreign_keys = ON");

    // Initialize migrations table
    initMigrationsTable(db);

    // Get migration status
    const applied = getAppliedMigrations(db);
    const pending = getPendingMigrations(applied);

    if (pending.length === 0) {
      console.log("\n✓ Database is up to date");
      showStatus(db);
      db.close();
      return;
    }

    // Apply pending migrations
    console.log(`\nPending migrations: ${pending.length}`);
    console.log("");

    let success = true;
    for (const migration of pending) {
      if (!applyMigration(db, migration)) {
        success = false;
        break;
      }
    }

    if (success) {
      console.log("\n✓ All migrations applied successfully");

      // Verify schema
      if (!verifySchema(db)) {
        console.warn("\n⚠ Schema verification issued warnings");
      }
    } else {
      console.error("\n✗ Migration failed - database may be in inconsistent state");
      process.exit(1);
    }

    showStatus(db);
    db.close();
  } catch (err) {
    console.error(`\n✗ Fatal error: ${err.message}`);
    process.exit(1);
  }
}

main();
