#!/usr/bin/env node
import { execSync } from "node:child_process";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

try {
  run("git config core.hooksPath .githooks");
  console.log("Git hooks installed. core.hooksPath is now .githooks");
} catch (error) {
  console.error("Failed to install git hooks.");
  console.error(error?.message || String(error));
  process.exit(1);
}
