#!/usr/bin/env node

import { writeFileSync } from "fs";

import { db } from "../apps/system-generator/backend/api/db.js";
import {
  backupFullUniverse,
  backupGalaxy,
  createBackupFilename,
  getBackupMetadata,
} from "../apps/system-generator/backend/data/backup/backupService.js";

async function main() {
  const galaxyId = process.argv[2];

  const backup = galaxyId ? await backupGalaxy(db, galaxyId) : await backupFullUniverse(db);
  const filename = createBackupFilename(backup);

  writeFileSync(filename, JSON.stringify(backup, null, 2), "utf-8");

  const metadata = getBackupMetadata(backup);
  console.log(`Backup written: ${filename}`);
  console.log(JSON.stringify(metadata, null, 2));
}

main().catch((error) => {
  console.error(`Backup failed: ${error.message}`);
  process.exit(1);
});
