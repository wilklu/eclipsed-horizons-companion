import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mapsDir = path.resolve(__dirname, "../src/assets/maps");

const allowedDirections = new Set(["north", "south", "east", "west"]);
const fileNames = fs.readdirSync(mapsDir).filter((name) => name.toLowerCase().endsWith(".svg"));

function getAttr(attrs, key) {
  const match = attrs.match(new RegExp(`\\b${key}="([^"]*)"`, "i"));
  return match ? String(match[1] || "").trim() : "";
}

function parsePartners(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function findProblemsForFile(filePath) {
  const problems = [];
  const content = fs.readFileSync(filePath, "utf8");
  const polygonMatches = [...content.matchAll(/<polygon\b([^>]*?)>/g)];

  const polygons = polygonMatches
    .map((match) => String(match[1] || ""))
    .map((attrs) => {
      const hexId = getAttr(attrs, "hex-id");
      const seamRaw = getAttr(attrs, "data-seam").toLowerCase();
      const seamGroup = getAttr(attrs, "data-seam-group");
      const seamDirection = getAttr(attrs, "data-seam-direction").toLowerCase();
      const seamPartners = parsePartners(getAttr(attrs, "data-seam-partners"));
      return {
        hexId,
        seamRaw,
        seamGroup,
        seamDirection,
        seamPartners,
      };
    })
    .filter((entry) => entry.hexId);

  const byHexId = new Map(polygons.map((entry) => [entry.hexId, entry]));
  const seamPolygons = polygons.filter(
    (entry) => entry.seamRaw === "true" || entry.seamGroup || entry.seamDirection || entry.seamPartners.length,
  );

  const seamGroupMembers = new Map();
  for (const seam of seamPolygons) {
    if (!seam.seamGroup) continue;
    if (!seamGroupMembers.has(seam.seamGroup)) seamGroupMembers.set(seam.seamGroup, []);
    seamGroupMembers.get(seam.seamGroup).push(seam.hexId);
  }

  for (const seam of seamPolygons) {
    if (seam.seamRaw !== "true") {
      problems.push(`${seam.hexId}: missing data-seam=\"true\"`);
    }
    if (!seam.seamGroup) {
      problems.push(`${seam.hexId}: missing data-seam-group`);
    }
    if (!allowedDirections.has(seam.seamDirection)) {
      problems.push(`${seam.hexId}: invalid data-seam-direction \"${seam.seamDirection || "<missing>"}\"`);
    }
    if (seam.seamPartners.length === 0) {
      problems.push(`${seam.hexId}: missing data-seam-partners`);
      continue;
    }

    if (new Set(seam.seamPartners).size !== seam.seamPartners.length) {
      problems.push(`${seam.hexId}: duplicate IDs in data-seam-partners`);
    }

    for (const partnerHexId of seam.seamPartners) {
      if (partnerHexId === seam.hexId) {
        problems.push(`${seam.hexId}: data-seam-partners includes itself`);
        continue;
      }

      const partner = byHexId.get(partnerHexId);
      if (!partner) {
        problems.push(`${seam.hexId}: partner ${partnerHexId} not found`);
        continue;
      }
      if (partner.seamRaw !== "true") {
        problems.push(`${seam.hexId}: partner ${partnerHexId} is not marked data-seam=\"true\"`);
      }
      if (!seam.seamGroup || partner.seamGroup !== seam.seamGroup) {
        problems.push(`${seam.hexId}: partner ${partnerHexId} has mismatched data-seam-group`);
      }
      if (!partner.seamPartners.includes(seam.hexId)) {
        problems.push(`${seam.hexId}: partner ${partnerHexId} is missing reverse partner link`);
      }
    }

    if (seam.seamGroup) {
      const groupIds = seamGroupMembers.get(seam.seamGroup) || [];
      const expectedPartners = groupIds.filter((id) => id !== seam.hexId).sort();
      const actualPartners = [...seam.seamPartners].sort();
      if (expectedPartners.length > 0) {
        const expectedJoined = expectedPartners.join(",");
        const actualJoined = actualPartners.join(",");
        if (expectedJoined !== actualJoined) {
          problems.push(
            `${seam.hexId}: partner set mismatch (expected: ${expectedJoined || "<none>"}, actual: ${actualJoined || "<none>"})`,
          );
        }
      }
    }
  }

  return problems;
}

let totalProblems = 0;

for (const fileName of fileNames) {
  const filePath = path.join(mapsDir, fileName);
  const problems = findProblemsForFile(filePath);
  if (problems.length === 0) {
    console.log(`ok ${fileName}`);
    continue;
  }

  totalProblems += problems.length;
  console.error(`\n${fileName}: ${problems.length} seam metadata problem(s)`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
}

if (totalProblems > 0) {
  console.error(`\nseam metadata validation failed with ${totalProblems} problem(s)`);
  process.exit(1);
}

console.log(`\nseam metadata validation passed for ${fileNames.length} map file(s)`);
