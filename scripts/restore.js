#!/usr/bin/env node

import { readFileSync } from "fs";

import { db } from "../apps/system-generator/backend/api/db.js";
import { restoreFromBackup } from "../apps/system-generator/backend/data/backup/restoreService.js";

async function main() {
  const backupPath = process.argv[2];

  if (!backupPath) {
    console.error("Usage: npm run db:restore -- <backup-file.json>");
    process.exit(1);
  }

  const raw = readFileSync(backupPath, "utf-8");
  const backup = JSON.parse(raw);

  const result = await restoreFromBackup(db, backup, {
    validateSchema: true,
    dryRun: false,
  });

  if (!result.success) {
    console.error("Restore failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(result.message);
  console.log(JSON.stringify(result.idMap, null, 2));
}

main().catch((error) => {
  console.error(`Restore crashed: ${error.message}`);
  process.exit(1);
});
