const SECTOR_WIDTH_PC = 32;
const SECTOR_HEIGHT_PC = 40;
const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashString(value) {
  const input = String(value || "");
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seededUnit(galaxy, gridX, gridY, salt = "") {
  const galaxyId = String(galaxy?.galaxyId ?? galaxy?.name ?? "galaxy");
  return hashString(`${galaxyId}|${gridX}|${gridY}|${salt}`) / 0xffffffff;
}

function normalizeAngle(angle) {
  let normalized = angle;
  while (normalized <= -Math.PI) normalized += TAU;
  while (normalized > Math.PI) normalized -= TAU;
  return normalized;
}

function estimateGalaxyDiameterParsecs(galaxy) {
  const direct = Number(galaxy?.galaxyDimensions?.diameterInParsecs ?? galaxy?.metadata?.diameterInParsecs);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const bulgeRadius = Number(galaxy?.morphology?.bulgeRadius);
  if (Number.isFinite(bulgeRadius) && bulgeRadius > 0) {
    return Math.max(3000, Math.round(bulgeRadius * 6));
  }

  return 30000;
}

export function estimateGalaxySectorFootprint(galaxy) {
  const diameterParsecs = estimateGalaxyDiameterParsecs(galaxy);
  const width = Math.max(1, Math.ceil(diameterParsecs / SECTOR_WIDTH_PC));
  const height = Math.max(1, Math.ceil(diameterParsecs / SECTOR_HEIGHT_PC));

  return {
    diameterParsecs,
    width,
    height,
    footprintWidthPc: width * SECTOR_WIDTH_PC,
    footprintHeightPc: height * SECTOR_HEIGHT_PC,
    gridRadius: Math.max(Math.floor(width / 2), Math.floor(height / 2)),
  };
}

function resolvePreviewDimension(size, scaleFactor, maxSize) {
  const scaled = Math.max(3, Math.round(size * scaleFactor));
  return Math.min(maxSize, scaled);
}

function resolveGrid(galaxy, options = {}) {
  const trueScale = options?.scale === "true" || options?.scale === true;
  const footprint = estimateGalaxySectorFootprint(galaxy);

  if (trueScale) {
    return {
      width: footprint.width,
      height: footprint.height,
      gridRadius: footprint.gridRadius,
    };
  }

  const previewRadius = Math.max(3, Math.min(10, Math.round(footprint.diameterParsecs / 12000)));
  const maxPreviewSize = previewRadius * 2 + 1;
  const dominantDimension = Math.max(footprint.width, footprint.height);

  if (dominantDimension <= maxPreviewSize) {
    return {
      width: footprint.width,
      height: footprint.height,
      gridRadius: footprint.gridRadius,
    };
  }

  const scaleFactor = maxPreviewSize / dominantDimension;
  const width = resolvePreviewDimension(footprint.width, scaleFactor, maxPreviewSize);
  const height = resolvePreviewDimension(footprint.height, scaleFactor, maxPreviewSize);

  return {
    width,
    height,
    gridRadius: Math.max(Math.floor(width / 2), Math.floor(height / 2)),
  };
}

function densityClassFromScore(score) {
  if (score >= 0.86) return 5;
  if (score >= 0.64) return 4;
  if (score >= 0.42) return 3;
  if (score >= 0.24) return 2;
  if (score >= 0.1) return 1;
  return 0;
}

function resolveGalaxyDensityProfileMode(galaxy) {
  const mode = String(
    galaxy?.metadata?.densityProfileMode ?? galaxy?.metadata?.densityProfile ?? galaxy?.densityProfileMode ?? "",
  )
    .trim()
    .toLowerCase();

  return mode === "standard" ? "standard" : "morphology";
}

function computeSpiralDensityScore({ galaxy, nx, ny, radial, theta, bulgeRatio, coreDensity, armCount, barred }) {
  if (radial > 1.08) return 0;

  const bulgeScore = Math.exp(-Math.pow(radial / Math.max(0.05, bulgeRatio * 1.1), 2)) * (0.52 + coreDensity * 0.45);
  const diskScore = Math.pow(Math.max(0, 1 - radial), 0.72) * 0.48;
  const twist = 4.8 + armCount * 0.18;
  const armWidth = 0.28 - Math.min(0.08, armCount * 0.008);

  let nearestArmDelta = Math.PI;
  for (let index = 0; index < armCount; index += 1) {
    const armAngle = (index * TAU) / armCount + radial * twist;
    nearestArmDelta = Math.min(nearestArmDelta, Math.abs(normalizeAngle(theta - armAngle)));
  }

  const armBand = clamp(1 - nearestArmDelta / Math.max(0.08, armWidth), 0, 1);
  const armScore = armBand * Math.pow(Math.max(0, 1 - radial * 0.82), 0.9) * 0.44;

  let barScore = 0;
  if (barred) {
    const barAxis = Math.abs(nx) / 0.42 + Math.abs(ny) / 0.16;
    if (barAxis < 1) {
      barScore = (1 - barAxis) * 0.45 + 0.12;
    }
  }

  const haloFade = radial > 0.98 ? Math.max(0, 1 - (radial - 0.98) / 0.1) : 1;
  return clamp(Math.max(bulgeScore, diskScore + armScore, barScore) * haloFade, 0, 1);
}

function computeEllipticalDensityScore({ radial, coreDensity }) {
  if (radial > 1.02) return 0;
  const core = Math.exp(-Math.pow(radial / 0.34, 2)) * (0.48 + coreDensity * 0.5);
  const envelope = Math.pow(Math.max(0, 1 - radial), 1.1) * 0.62;
  return clamp(Math.max(core, envelope), 0, 1);
}

function computeLenticularDensityScore({ radial, bulgeRatio, coreDensity }) {
  if (radial > 1.04) return 0;
  const bulgeScore = Math.exp(-Math.pow(radial / Math.max(0.06, bulgeRatio), 2)) * (0.48 + coreDensity * 0.44);
  const diskScore = Math.pow(Math.max(0, 1 - radial), 1.35) * 0.38;
  return clamp(Math.max(bulgeScore, diskScore), 0, 1);
}

function computeIrregularDensityScore({ galaxy, nx, ny, radial }) {
  if (radial > 1.15) return 0;

  let clumpScore = 0;
  for (let index = 0; index < 3; index += 1) {
    const clumpX = seededUnit(galaxy, index, 0, "clump-x") * 1.1 - 0.55;
    const clumpY = seededUnit(galaxy, 0, index, "clump-y") * 1.1 - 0.55;
    const radius = 0.18 + seededUnit(galaxy, index, index, "clump-r") * 0.24;
    const strength = 0.28 + seededUnit(galaxy, index, index, "clump-s") * 0.46;
    const distance = Math.hypot(nx - clumpX, ny - clumpY);
    clumpScore = Math.max(clumpScore, clamp(1 - distance / radius, 0, 1) * strength);
  }

  const haze = Math.pow(Math.max(0, 1 - radial / 1.08), 1.7) * 0.16;
  return clamp(Math.max(clumpScore, haze), 0, 1);
}

function computeDwarfDensityScore({ galaxy, nx, ny, radial, coreDensity }) {
  if (radial > 0.82) return 0;
  const offsetX = seededUnit(galaxy, 1, 1, "dwarf-x") * 0.28 - 0.14;
  const offsetY = seededUnit(galaxy, 1, 1, "dwarf-y") * 0.28 - 0.14;
  const compact = Math.hypot(nx - offsetX, ny - offsetY);
  const compactScore = clamp(1 - compact / 0.34, 0, 1) * (0.52 + coreDensity * 0.32);
  const halo = Math.pow(Math.max(0, 1 - radial / 0.78), 1.9) * 0.14;
  return clamp(Math.max(compactScore, halo), 0, 1);
}

function densityProfileFor(galaxy, gridX, gridY, width, height) {
  if (resolveGalaxyDensityProfileMode(galaxy) === "standard") {
    return {
      densityScore: 0.5,
      densityClass: 3,
      include: true,
    };
  }

  const halfWidth = Math.max(1, Math.floor(width / 2));
  const halfHeight = Math.max(1, Math.floor(height / 2));
  const nx = gridX / halfWidth;
  const ny = gridY / halfHeight;
  const radial = Math.sqrt(nx * nx + ny * ny);
  const theta = Math.atan2(ny, nx);
  const diameterParsecs = estimateGalaxyDiameterParsecs(galaxy);
  const bulgeRadius = Number(galaxy?.morphology?.bulgeRadius) || 5000;
  const bulgeRatio = clamp(bulgeRadius / Math.max(1, diameterParsecs / 2), 0.08, 0.45);
  const coreDensity = clamp(Number(galaxy?.morphology?.coreDensity) || 0.7, 0.01, 1);
  const armCount = Math.max(2, Number(galaxy?.morphology?.armCount) || 2);
  const galaxyType = String(galaxy?.type || "Spiral").toLowerCase();

  let score;
  if (galaxyType.includes("barred spiral")) {
    score = computeSpiralDensityScore({
      galaxy,
      nx,
      ny,
      radial,
      theta,
      bulgeRatio,
      coreDensity,
      armCount,
      barred: true,
    });
  } else if (galaxyType.includes("spiral")) {
    score = computeSpiralDensityScore({
      galaxy,
      nx,
      ny,
      radial,
      theta,
      bulgeRatio,
      coreDensity,
      armCount,
      barred: false,
    });
  } else if (galaxyType.includes("lenticular")) {
    score = computeLenticularDensityScore({ radial, bulgeRatio, coreDensity });
  } else if (galaxyType.includes("elliptical")) {
    score = computeEllipticalDensityScore({ radial, coreDensity });
  } else if (galaxyType.includes("irregular")) {
    score = computeIrregularDensityScore({ galaxy, nx, ny, radial });
  } else if (galaxyType.includes("dwarf")) {
    score = computeDwarfDensityScore({ galaxy, nx, ny, radial, coreDensity });
  } else {
    score = computeEllipticalDensityScore({ radial, coreDensity });
  }

  const variation = (seededUnit(galaxy, gridX, gridY, "density-variation") - 0.5) * 0.08;
  const densityScore = clamp(score + variation, 0, 1);
  const densityClass = densityClassFromScore(densityScore);
  return {
    densityScore,
    densityClass,
    include: densityClass > 0 || (gridX === 0 && gridY === 0),
  };
}

function buildSectorRecord(galaxy, gridX, gridY, width, height) {
  const profile = densityProfileFor(galaxy, gridX, gridY, width, height);
  if (!profile.include) return null;

  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  const galaxyId = String(galaxy?.galaxyId ?? "galaxy");

  return {
    galaxyId,
    sectorId: `${galaxyId}:${gridX},${gridY}`,
    sectorX: gridX,
    sectorY: gridY,
    x: gridX,
    y: gridY,
    densityClass: profile.densityClass,
    metadata: {
      galaxyId,
      gridX,
      gridY,
      gridRadius: Math.max(halfWidth, halfHeight),
      gridWidth: width,
      gridHeight: height,
      densityScore: Number(profile.densityScore.toFixed(4)),
      isGalacticCenterSector: gridX === 0 && gridY === 0,
    },
  };
}

export function estimateGalaxySectorLayoutCount(galaxy, options = {}) {
  let count = 0;
  for (const _sector of iterateGalaxySectorLayout(galaxy, options)) {
    count += 1;
  }
  return count;
}

export function* iterateGalaxySectorLayout(galaxy, options = {}) {
  const { width, height } = resolveGrid(galaxy, options);
  const startX = -Math.floor(width / 2);
  const startY = -Math.floor(height / 2);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const gridX = startX + column;
      const gridY = startY + row;
      const sector = buildSectorRecord(galaxy, gridX, gridY, width, height);
      if (sector) {
        yield sector;
      }
    }
  }
}

export function* iterateGalaxySectorLayoutByRing(galaxy, options = {}) {
  const { width, height } = resolveGrid(galaxy, options);
  const minGridX = -Math.floor(width / 2);
  const minGridY = -Math.floor(height / 2);
  const maxGridX = minGridX + width - 1;
  const maxGridY = minGridY + height - 1;
  const maxRing = Math.max(Math.abs(minGridX), Math.abs(maxGridX), Math.abs(minGridY), Math.abs(maxGridY));

  for (let ring = 0; ring <= maxRing; ring += 1) {
    for (let gridX = Math.max(-ring, minGridX); gridX <= Math.min(ring, maxGridX); gridX += 1) {
      for (let gridY = Math.max(-ring, minGridY); gridY <= Math.min(ring, maxGridY); gridY += 1) {
        if (Math.max(Math.abs(gridX), Math.abs(gridY)) !== ring) {
          continue;
        }

        const sector = buildSectorRecord(galaxy, gridX, gridY, width, height);
        if (sector) {
          yield sector;
        }
      }
    }
  }
}

export function generateGalaxySectorLayoutWindow(galaxy, options = {}) {
  const { width, height } = resolveGrid(galaxy, options);
  const startX = -Math.floor(width / 2);
  const startY = -Math.floor(height / 2);
  const endX = startX + width - 1;
  const endY = startY + height - 1;
  const xMin = Math.max(startX, Math.trunc(Number(options?.xMin ?? startX)));
  const xMax = Math.min(endX, Math.trunc(Number(options?.xMax ?? endX)));
  const yMin = Math.max(startY, Math.trunc(Number(options?.yMin ?? startY)));
  const yMax = Math.min(endY, Math.trunc(Number(options?.yMax ?? endY)));

  const sectors = [];
  for (let gridY = yMin; gridY <= yMax; gridY += 1) {
    for (let gridX = xMin; gridX <= xMax; gridX += 1) {
      const sector = buildSectorRecord(galaxy, gridX, gridY, width, height);
      if (sector) {
        sectors.push(sector);
      }
    }
  }

  return sectors;
}

export function generateGalaxySectorLayout(galaxy, options = {}) {
  return Array.from(iterateGalaxySectorLayout(galaxy, options));
}
