#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RuleValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.rulesFile = path.join(__dirname, "../data/rules_master.yaml");
    this.data = null;
  }

  validateAll() {
    console.log("🔍 Validating house rules...\n");

    // Check file exists
    if (!fs.existsSync(this.rulesFile)) {
      this.errors.push(`Rules master file not found: ${this.rulesFile}`);
      return this.report();
    }

    // Load and parse YAML
    try {
      const fileContent = fs.readFileSync(this.rulesFile, "utf8");
      this.data = yaml.load(fileContent);
    } catch (error) {
      this.errors.push(`YAML parsing error: ${error.message}`);
      return this.report();
    }

    // Run validation checks
    this.validateStructure();
    this.validateRuleIds();
    this.validateApplications();
    this.validateStatuses();
    this.validateCitations();

    // Report results
    return this.report();
  }

  validateStructure() {
    console.log("  Checking structure...");

    if (!this.data.rules) {
      this.errors.push("Missing 'rules' key in YAML");
      return;
    }

    const requiredFields = ["rule_id", "name", "category", "source", "status", "description"];

    this.data.rules.forEach((rule, index) => {
      requiredFields.forEach((field) => {
        if (!(field in rule)) {
          this.errors.push(`Rule ${rule.rule_id || index} missing field: ${field}`);
        }
      });
    });
  }

  validateRuleIds() {
    console.log("  Checking rule IDs...");

    const ruleIds = [];

    this.data.rules.forEach((rule) => {
      const ruleId = rule.rule_id || "";

      if (!ruleId.startsWith("HR-")) {
        this.errors.push(`Invalid rule ID format: ${ruleId}`);
      }

      if (ruleIds.includes(ruleId)) {
        this.errors.push(`Duplicate rule ID: ${ruleId}`);
      } else {
        ruleIds.push(ruleId);
      }
    });
  }

  validateApplications() {
    console.log("  Checking applications...");

    const validApps = ["sophont-generator", "world-builder", "character-generator"];

    this.data.rules.forEach((rule) => {
      const apps = rule.applications || [];
      apps.forEach((app) => {
        if (!validApps.includes(app)) {
          this.warnings.push(`Unknown application in ${rule.rule_id}: ${app}`);
        }
      });
    });
  }

  validateStatuses() {
    console.log("  Checking statuses...");

    const validStatuses = ["CANON", "APPROVED", "OPTIONAL", "EXPERIMENTAL", "ARCHIVED"];

    this.data.rules.forEach((rule) => {
      const status = rule.status || "";
      if (!validStatuses.includes(status)) {
        this.errors.push(`Invalid status in ${rule.rule_id}: ${status}`);
      }
    });
  }

  validateCitations() {
    console.log("  Checking citations...");

    this.data.rules.forEach((rule) => {
      const sourceCitation = rule.source_citation || "";
      if (sourceCitation && !sourceCitation.startsWith("[^")) {
        this.warnings.push(`Non-standard citation format in ${rule.rule_id}`);
      }
    });
  }

  report() {
    console.log("\n" + "=".repeat(60));
    console.log("VALIDATION REPORT");
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

    const totalRules = this.data.rules?.length || 0;
    console.log(`\n✓ Total rules validated: ${totalRules}`);

    if (this.errors.length === 0) {
      console.log("\n✅ All validations passed!");
      return true;
    } else {
      console.log("\n❌ Validation failed!");
      return false;
    }
  }
}

// Run validator
const validator = new RuleValidator();
const success = validator.validateAll();
process.exit(success ? 0 : 1);
