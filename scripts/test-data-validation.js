#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.dataDir = path.join(__dirname, "../data");
  }

  validateAll() {
    console.log("🔍 Validating data files...\n");

    this.validateCharacteristics();
    this.validateSpecialAbilities();
    this.validateRules();

    return this.report();
  }

  validateCharacteristics() {
    console.log("  Validating characteristics...");

    const charFile = path.join(this.dataDir, "characteristics.yaml");

    if (!fs.existsSync(charFile)) {
      this.warnings.push("Characteristics file not found (optional)");
      return;
    }

    try {
      const content = fs.readFileSync(charFile, "utf8");
      const data = yaml.load(content);

      if (!data.characteristics || !Array.isArray(data.characteristics)) {
        this.errors.push("Characteristics must be an array");
        return;
      }

      data.characteristics.forEach((char, index) => {
        if (!char.id) {
          this.errors.push(`Characteristic ${index} missing 'id' field`);
        }
        if (!char.name) {
          this.errors.push(`Characteristic ${char.id || index} missing 'name'`);
        }
      });
    } catch (error) {
      this.errors.push(`Error parsing characteristics: ${error.message}`);
    }
  }

  validateSpecialAbilities() {
    console.log("  Validating special abilities...");

    const abilitiesFile = path.join(this.dataDir, "special-abilities.yaml");

    if (!fs.existsSync(abilitiesFile)) {
      this.warnings.push("Special abilities file not found (optional)");
      return;
    }

    try {
      const content = fs.readFileSync(abilitiesFile, "utf8");
      yaml.load(content);
      console.log("    ✓ Special abilities valid");
    } catch (error) {
      this.errors.push(`Error parsing special abilities: ${error.message}`);
    }
  }

  validateRules() {
    console.log("  Validating rules...");

    const rulesFile = path.join(this.dataDir, "rules_master.yaml");

    if (!fs.existsSync(rulesFile)) {
      this.errors.push("Rules master file not found");
      return;
    }

    try {
      const content = fs.readFileSync(rulesFile, "utf8");
      yaml.load(content);
      console.log("    ✓ Rules valid");
    } catch (error) {
      this.errors.push(`Error parsing rules: ${error.message}`);
    }
  }

  report() {
    console.log("\n" + "=".repeat(60));
    console.log("DATA VALIDATION REPORT");
    console.log("=".repeat(60));

    if (this.errors.length > 0) {
      console.log(`\n❌ ERRORS (${this.errors.length}):`);
      this.errors.forEach((error) => {
        console.log(`  • ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${this.warnings.length}):`);
      this.warnings.forEach((warning) => {
        console.log(`  • ${warning}`);
      });
    }

    if (this.errors.length === 0) {
      console.log("\n✅ All data validations passed!");
      return true;
    } else {
      console.log("\n❌ Validation failed!");
      return false;
    }
  }
}

// Run validator
const validator = new DataValidator();
const success = validator.validateAll();
process.exit(success ? 0 : 1);
