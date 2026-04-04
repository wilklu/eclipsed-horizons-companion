const SECTOR_WIDTH_PC = 32;
const SECTOR_HEIGHT_PC = 40;

function estimateGalaxyDiameterParsecs(galaxy) {
  const direct = Number(galaxy?.galaxyDimensions?.diameterInParsecs ?? galaxy?.metadata?.diameterInParsecs);
  if (Number.isFinite(direct) && direct > 0) return direct;

  const bulgeRadius = Number(galaxy?.morphology?.bulgeRadius);
  if (Number.isFinite(bulgeRadius) && bulgeRadius > 0) {
    return Math.max(3000, Math.round(bulgeRadius * 6));
  }

  return 30000;
}

function resolveGrid(galaxy, options = {}) {
  const trueScale = options?.scale === "true" || options?.scale === true;
  const diameterParsecs = estimateGalaxyDiameterParsecs(galaxy);

  if (trueScale) {
    const width = Math.max(1, Math.ceil(diameterParsecs / SECTOR_WIDTH_PC));
    const height = Math.max(1, Math.ceil(diameterParsecs / SECTOR_HEIGHT_PC));
    return {
      width,
      height,
      gridRadius: Math.max(Math.floor(width / 2), Math.floor(height / 2)),
    };
  }

  const previewRadius = Math.max(3, Math.min(10, Math.round(diameterParsecs / 12000)));
  const size = previewRadius * 2 + 1;
  return {
    width: size,
    height: size,
    gridRadius: previewRadius,
  };
}

function densityClassFor(gridX, gridY, halfWidth, halfHeight) {
  const nx = halfWidth > 0 ? gridX / halfWidth : 0;
  const ny = halfHeight > 0 ? gridY / halfHeight : 0;
  const distance = Math.sqrt(nx * nx + ny * ny);

  if (distance < 0.12) return 5;
  if (distance < 0.28) return 4;
  if (distance < 0.48) return 3;
  if (distance < 0.72) return 2;
  if (distance < 0.96) return 1;
  return 0;
}

function buildSectorRecord(galaxy, gridX, gridY, width, height) {
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  const densityClass = densityClassFor(gridX, gridY, halfWidth, halfHeight);
  const galaxyId = String(galaxy?.galaxyId ?? "galaxy");

  return {
    galaxyId,
    sectorId: `${galaxyId}:${gridX},${gridY}`,
    sectorX: gridX,
    sectorY: gridY,
    x: gridX,
    y: gridY,
    densityClass,
    metadata: {
      galaxyId,
      gridX,
      gridY,
      gridRadius: Math.max(halfWidth, halfHeight),
      gridWidth: width,
      gridHeight: height,
      isGalacticCenterSector: gridX === 0 && gridY === 0,
    },
  };
}

export function estimateGalaxySectorLayoutCount(galaxy, options = {}) {
  const { width, height } = resolveGrid(galaxy, options);
  return width * height;
}

export function* iterateGalaxySectorLayout(galaxy, options = {}) {
  const { width, height } = resolveGrid(galaxy, options);
  const startX = -Math.floor(width / 2);
  const startY = -Math.floor(height / 2);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const gridX = startX + column;
      const gridY = startY + row;
      yield buildSectorRecord(galaxy, gridX, gridY, width, height);
    }
  }
}

export function generateGalaxySectorLayout(galaxy, options = {}) {
  return Array.from(iterateGalaxySectorLayout(galaxy, options));
}
