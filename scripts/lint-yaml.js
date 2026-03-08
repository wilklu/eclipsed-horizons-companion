#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";
import { globSync } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function lintYamlFiles() {
  console.log("🔍 Linting YAML files...\n");

  const dataDir = path.join(__dirname, "../data");
  const yamlFiles = globSync(path.join(dataDir, "*.yaml"));

  const errors = [];

  yamlFiles.forEach((yamlFile) => {
    try {
      const content = fs.readFileSync(yamlFile, "utf8");
      yaml.load(content);
      console.log(`✓ ${path.relative(process.cwd(), yamlFile)}`);
    } catch (error) {
      const errorMsg = `${path.relative(process.cwd(), yamlFile)}: ${error.message}`;
      errors.push(errorMsg);
      console.log(`✗ ${errorMsg}`);
    }
  });

  console.log();

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} YAML error(s)`);
    process.exit(1);
  } else {
    console.log(`✅ All ${yamlFiles.length} YAML file(s) are valid`);
    process.exit(0);
  }
}

lintYamlFiles();
