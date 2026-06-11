import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mapsDir = path.resolve(__dirname, "../src/assets/maps");
const outputPath = path.resolve(__dirname, "../docs/seam-metadata-update-list.csv");
const groupedOutputPath = path.resolve(__dirname, "../docs/seam-metadata-update-list-by-map.md");

const fileNames = fs
  .readdirSync(mapsDir)
  .filter((name) => name.toLowerCase().endsWith(".svg"))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

function getAttr(attrs, key) {
  const match = attrs.match(new RegExp(`\\b${key}="([^"]*)"`, "i"));
  return match ? String(match[1] || "").trim() : "";
}

function parsePoints(points) {
  return String(points || "")
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map((n) => Number(n)))
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
}

function centroid(points) {
  const coords = parsePoints(points);
  if (!coords.length) {
    return { x: 0, y: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of coords) {
    sumX += x;
    sumY += y;
  }

  return {
    x: sumX / coords.length,
    y: sumY / coords.length,
  };
}

function seamDirection(cx, cy, centerX, centerY) {
  const dx = cx - centerX;
  const dy = cy - centerY;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "east" : "west";
  }
  return dy >= 0 ? "south" : "north";
}

function parseHexIdParts(hexId) {
  const normalized = String(hexId || "").trim();
  if (!/^\d{6}$/.test(normalized)) {
    return null;
  }

  const col = Number.parseInt(normalized.slice(0, 3), 10);
  const row = Number.parseInt(normalized.slice(3, 6), 10);
  if (!Number.isFinite(col) || !Number.isFinite(row)) {
    return null;
  }

  return {
    id: normalized,
    col,
    row,
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[,"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const rows = [
  [
    "mapFile",
    "hexId",
    "expected.data-logical-hex-id",
    "expected.data-seam",
    "expected.data-seam-group",
    "expected.data-seam-direction",
    "expected.data-seam-partners",
    "expected.data-pole",
    "current.data-logical-hex-id",
    "current.data-seam",
    "current.data-seam-group",
    "current.data-seam-direction",
    "current.data-seam-partners",
    "current.data-pole",
    "status",
  ],
];
const groupedRows = new Map();

for (const fileName of fileNames) {
  const filePath = path.join(mapsDir, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const polygonMatches = [...source.matchAll(/<polygon\b([^>]*?)>/g)];
  if (!polygonMatches.length) {
    continue;
  }

  const viewBoxMatch = source.match(/\bviewBox="([^"]+)"/i);
  let centerX = 0;
  let centerY = 0;
  if (viewBoxMatch) {
    const [x, y, w, h] = String(viewBoxMatch[1] || "")
      .trim()
      .split(/\s+/)
      .map((n) => Number(n));
    if ([x, y, w, h].every((n) => Number.isFinite(n))) {
      centerX = x + w / 2;
      centerY = y + h / 2;
    }
  }

  const polygons = polygonMatches
    .map((match) => {
      const attrs = String(match[1] || "");
      const hexId = getAttr(attrs, "hex-id") || getAttr(attrs, "data-hex-id");
      const points = getAttr(attrs, "points");
      const parsed = parseHexIdParts(hexId);
      if (!hexId || !parsed || !points) {
        return null;
      }
      const c = centroid(points);
      return {
        attrs,
        hexId,
        col: parsed.col,
        row: parsed.row,
        cx: c.x,
        cy: c.y,
        current: {
          logical: getAttr(attrs, "data-logical-hex-id"),
          seam: getAttr(attrs, "data-seam"),
          group: getAttr(attrs, "data-seam-group"),
          direction: getAttr(attrs, "data-seam-direction"),
          partners: getAttr(attrs, "data-seam-partners"),
          pole: getAttr(attrs, "data-pole"),
        },
      };
    })
    .filter(Boolean);

  if (!polygons.length) {
    continue;
  }

  if (!Number.isFinite(centerX) || !Number.isFinite(centerY) || (centerX === 0 && centerY === 0)) {
    centerX = polygons.reduce((sum, p) => sum + p.cx, 0) / polygons.length;
    centerY = polygons.reduce((sum, p) => sum + p.cy, 0) / polygons.length;
  }

  const byRow = new Map();
  for (const poly of polygons) {
    if (!byRow.has(poly.row)) {
      byRow.set(poly.row, []);
    }
    byRow.get(poly.row).push(poly);
  }

  const seamGroupsByCanonical = new Map();

  for (const [row, entries] of byRow.entries()) {
    if (!Array.isArray(entries) || entries.length < 2) {
      continue;
    }

    entries.sort((a, b) => a.col - b.col);

    if (row === 1) {
      const canonical = entries[0].hexId;
      seamGroupsByCanonical.set(
        canonical,
        entries.map((e) => e.hexId),
      );
      continue;
    }

    const first = entries[0];
    const last = entries[entries.length - 1];
    if (first?.hexId && last?.hexId && first.hexId !== last.hexId) {
      seamGroupsByCanonical.set(first.hexId, [first.hexId, last.hexId]);
    }
  }

  const seamHexToGroup = new Map();
  for (const [canonical, members] of seamGroupsByCanonical.entries()) {
    for (const hexId of members) {
      seamHexToGroup.set(hexId, {
        canonical,
        members,
      });
    }
  }

  for (const poly of polygons) {
    const seam = seamHexToGroup.get(poly.hexId);
    const expectedLogical = seam?.canonical || poly.hexId;
    const expectedSeam = seam ? "true" : "";
    const expectedGroup = seam?.canonical || "";
    const expectedDirection = seam ? seamDirection(poly.cx, poly.cy, centerX, centerY) : "";
    const expectedPartners = seam ? seam.members.filter((id) => id !== poly.hexId).join(",") : "";
    const expectedPole = seam && poly.row === 1 ? "north" : "";

    const current = poly.current;
    const isMatch =
      current.logical === expectedLogical &&
      current.seam === expectedSeam &&
      current.group === expectedGroup &&
      current.direction === expectedDirection &&
      current.partners === expectedPartners &&
      current.pole === expectedPole;

    if (isMatch) {
      continue;
    }

    rows.push([
      fileName,
      poly.hexId,
      expectedLogical,
      expectedSeam,
      expectedGroup,
      expectedDirection,
      expectedPartners,
      expectedPole,
      current.logical,
      current.seam,
      current.group,
      current.direction,
      current.partners,
      current.pole,
      "needs-update",
    ]);

    if (!groupedRows.has(fileName)) {
      groupedRows.set(fileName, []);
    }
    groupedRows.get(fileName).push({
      hexId: poly.hexId,
      expectedLogical,
      expectedSeam,
      expectedGroup,
      expectedDirection,
      expectedPartners,
      expectedPole,
      currentLogical: current.logical,
      currentSeam: current.seam,
      currentGroup: current.group,
      currentDirection: current.direction,
      currentPartners: current.partners,
      currentPole: current.pole,
    });
  }
}

const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, csv, "utf8");

let groupedReport = "# Seam Metadata Update List By Map\n\n";
for (const fileName of [...groupedRows.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
  const entries = groupedRows.get(fileName) || [];
  groupedReport += `## ${fileName}\n\n`;
  groupedReport +=
    "| hex-id | expected data-logical-hex-id | expected data-seam | expected data-seam-group | expected data-seam-direction | expected data-seam-partners | expected data-pole |\n";
  groupedReport += "| --- | --- | --- | --- | --- | --- | --- |\n";
  for (const entry of entries) {
    groupedReport += `| ${entry.hexId} | ${entry.expectedLogical} | ${entry.expectedSeam} | ${entry.expectedGroup} | ${entry.expectedDirection} | ${entry.expectedPartners} | ${entry.expectedPole} |\n`;
  }
  groupedReport += "\n";
}

fs.writeFileSync(groupedOutputPath, groupedReport, "utf8");

console.log(`wrote ${rows.length - 1} entries to ${outputPath}`);
console.log(`wrote grouped report to ${groupedOutputPath}`);
