import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeHexId } from "../src/utils/worldMapHexTopology.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mapsDir = path.resolve(__dirname, "../src/assets/maps");

const fileNames = fs.readdirSync(mapsDir).filter((name) => name.toLowerCase().endsWith(".svg"));

function getAttr(attrs, key) {
  const match = attrs.match(new RegExp(`\\b${key}="([^"]*)"`, "i"));
  return match ? String(match[1] || "").trim() : "";
}

function setAttr(attrs, key, value) {
  if (new RegExp(`\\b${key}="[^"]*"`, "i").test(attrs)) {
    return attrs.replace(new RegExp(`\\b${key}="[^"]*"`, "i"), `${key}="${value}"`);
  }
  return `${attrs} ${key}="${value}"`;
}

function removeAttr(attrs, key) {
  return attrs.replace(new RegExp(`\\s*\\b${key}="[^"]*"`, "ig"), "");
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
  if (!coords.length) return { x: 0, y: 0 };
  let sumX = 0;
  let sumY = 0;
  for (const [x, y] of coords) {
    sumX += x;
    sumY += y;
  }
  return { x: sumX / coords.length, y: sumY / coords.length };
}

function seamDirection(cx, cy, centerX, centerY) {
  const dx = cx - centerX;
  const dy = cy - centerY;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "east" : "west";
  }
  return dy >= 0 ? "south" : "north";
}

function seamPoleLabel(group, centerY) {
  if (!Array.isArray(group) || group.length < 5) return "";
  const avgY = group.reduce((sum, item) => sum + item.cy, 0) / group.length;
  return avgY < centerY ? "north" : "south";
}

for (const fileName of fileNames) {
  const filePath = path.join(mapsDir, fileName);
  const original = fs.readFileSync(filePath, "utf8");

  const polygonMatches = [...original.matchAll(/<polygon\b([^>]*?)>/g)];
  if (!polygonMatches.length) {
    continue;
  }

  const items = polygonMatches.map((match) => {
    const attrs = String(match[1] || "");
    const rawHexId = getAttr(attrs, "hex-id");
    const logicalHexId = canonicalizeHexId(rawHexId);
    const points = getAttr(attrs, "points");
    const c = centroid(points);
    return {
      attrs,
      rawHexId,
      logicalHexId,
      cx: c.x,
      cy: c.y,
    };
  });

  const viewBoxMatch = original.match(/\bviewBox="([^"]+)"/i);
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
  if (!Number.isFinite(centerX) || !Number.isFinite(centerY) || (centerX === 0 && centerY === 0)) {
    centerX = items.reduce((sum, item) => sum + item.cx, 0) / items.length;
    centerY = items.reduce((sum, item) => sum + item.cy, 0) / items.length;
  }

  const byLogical = new Map();
  for (const item of items) {
    if (!item.logicalHexId) continue;
    if (!byLogical.has(item.logicalHexId)) byLogical.set(item.logicalHexId, []);
    byLogical.get(item.logicalHexId).push(item);
  }

  const groupMeta = new Map();
  for (const [logicalHexId, group] of byLogical.entries()) {
    if (group.length < 2) continue;
    groupMeta.set(logicalHexId, {
      pole: seamPoleLabel(group, centerY),
      members: group.map((entry) => entry.rawHexId).filter(Boolean),
    });
  }

  let idx = 0;
  const updated = original.replace(/<polygon\b([^>]*?)>/g, (full, attrs) => {
    const item = items[idx++];
    const rawHexId = item?.rawHexId || getAttr(attrs, "hex-id");
    if (!rawHexId) {
      return full;
    }

    let nextAttrs = String(attrs || "");
    const logicalHexId = item?.logicalHexId || canonicalizeHexId(rawHexId);
    nextAttrs = setAttr(nextAttrs, "data-logical-hex-id", logicalHexId);

    // Remove old seam tags first so regenerated metadata stays clean.
    for (const key of ["data-seam", "data-seam-group", "data-seam-partners", "data-seam-direction", "data-pole"]) {
      nextAttrs = removeAttr(nextAttrs, key);
    }

    const seam = groupMeta.get(logicalHexId);
    if (seam) {
      const partners = seam.members.filter((id) => id !== rawHexId);
      nextAttrs = setAttr(nextAttrs, "data-seam", "true");
      nextAttrs = setAttr(nextAttrs, "data-seam-group", logicalHexId);
      nextAttrs = setAttr(nextAttrs, "data-seam-direction", seamDirection(item.cx, item.cy, centerX, centerY));
      if (partners.length) {
        nextAttrs = setAttr(nextAttrs, "data-seam-partners", partners.join(","));
      }
      if (seam.pole) {
        nextAttrs = setAttr(nextAttrs, "data-pole", seam.pole);
      }
    }

    return `<polygon${nextAttrs}>`;
  });

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`updated ${fileName}`);
  }
}
