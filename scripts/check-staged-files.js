#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const BLOCKED_FILE_PATTERN = /(\.db$|\.sqlite$|\.sqlite3$|\.db-wal$|\.db-shm$|\.wal$|\.shm$)/i;

function getRepoRoot() {
  return execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
}

function getStagedFiles() {
  const output = execSync("git diff --cached --name-only --diff-filter=ACMR -z", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return output
    .split("\0")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function main() {
  const repoRoot = getRepoRoot();
  const stagedFiles = getStagedFiles();

  const blockedByPattern = [];
  const blockedBySize = [];

  for (const relativeFile of stagedFiles) {
    if (BLOCKED_FILE_PATTERN.test(relativeFile)) {
      blockedByPattern.push(relativeFile);
      continue;
    }

    const absoluteFile = path.join(repoRoot, relativeFile);
    if (!fs.existsSync(absoluteFile)) {
      continue;
    }

    const stats = fs.statSync(absoluteFile);
    if (!stats.isFile()) {
      continue;
    }

    if (stats.size > MAX_FILE_SIZE_BYTES) {
      blockedBySize.push({ file: relativeFile, size: stats.size });
    }
  }

  if (blockedByPattern.length === 0 && blockedBySize.length === 0) {
    process.exit(0);
  }

  console.error("\nCommit blocked by repository safeguards.\n");

  if (blockedByPattern.length > 0) {
    console.error("Blocked database artifacts detected:");
    for (const file of blockedByPattern) {
      console.error(`- ${file}`);
    }
    console.error("\nThese files must remain local and not be committed.\n");
  }

  if (blockedBySize.length > 0) {
    console.error(`Files over ${formatBytes(MAX_FILE_SIZE_BYTES)} detected:`);
    for (const entry of blockedBySize) {
      console.error(`- ${entry.file} (${formatBytes(entry.size)})`);
    }
    console.error("\nReduce file size or add proper ignore rules before committing.\n");
  }

  process.exit(1);
}

try {
  main();
} catch (error) {
  console.error("Pre-commit safeguard failed to execute.");
  console.error(error?.message || String(error));
  process.exit(1);
}
