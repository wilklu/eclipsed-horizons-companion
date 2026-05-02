const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(angle) {
  let normalized = angle;
  while (normalized <= -Math.PI) normalized += TAU;
  while (normalized > Math.PI) normalized -= TAU;
  return normalized;
}

function fractionalNoise(value) {
  const s = Math.sin(value * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function localMorphologyFactor({ col, row, cols, rows, galaxyType, morphology, morphologyScale }) {
  const nx = cols > 1 ? (col - 1) / (cols - 1) - 0.5 : 0;
  const ny = rows > 1 ? (row - 1) / (rows - 1) - 0.5 : 0;
  const radial = Math.min(1, Math.sqrt(nx * nx + ny * ny) / Math.SQRT1_2);
  const theta = Math.atan2(ny, nx);
  const armCount = Math.max(2, Number(morphology?.armCount) || 2);
  const coreDensity = clamp(Number(morphology?.coreDensity) || 0.7, 0.1, 1);
  const scale = clamp(Number(morphologyScale) || 0, 0, 0.5);
  const kind = String(galaxyType || "spiral").toLowerCase();
  const noise = fractionalNoise(col * 17.13 + row * 9.71 + armCount * 3.1) - 0.5;

  let modifier = 0;
  if (kind.includes("barred spiral") || kind.includes("spiral")) {
    const twist = 3.4 + armCount * 0.2;
    let nearestArmDelta = Math.PI;
    for (let index = 0; index < armCount; index += 1) {
      const armAngle = (index * TAU) / armCount + radial * twist;
      nearestArmDelta = Math.min(nearestArmDelta, Math.abs(normalizeAngle(theta - armAngle)));
    }
    const armBand = clamp(1 - nearestArmDelta / 0.75, 0, 1);
    const bulge = (1 - radial) * (0.3 + coreDensity * 0.4);
    modifier = bulge * 0.45 + armBand * 0.55 + noise * 0.25;
  } else if (kind.includes("elliptical") || kind.includes("lenticular")) {
    const bulge = Math.pow(Math.max(0, 1 - radial), kind.includes("elliptical") ? 0.8 : 1.1);
    modifier = bulge * (0.7 + coreDensity * 0.25) + noise * 0.15;
  } else if (kind.includes("irregular")) {
    const clumpA = clamp(1 - Math.hypot(nx + 0.18, ny - 0.1) / 0.38, 0, 1);
    const clumpB = clamp(1 - Math.hypot(nx - 0.16, ny + 0.2) / 0.32, 0, 1);
    modifier = Math.max(clumpA * 0.8, clumpB * 0.65) + noise * 0.5;
  } else if (kind.includes("dwarf")) {
    const compact = clamp(1 - Math.hypot(nx - 0.08, ny + 0.06) / 0.34, 0, 1);
    modifier = compact * (0.55 + coreDensity * 0.2) + noise * 0.2;
  } else {
    modifier = (1 - radial) * 0.55 + noise * 0.2;
  }

  return 1 + clamp(modifier, -1, 1) * scale;
}

/**
 * Calculate hex occupancy probability for a sector
 * @param {object} params
 * @returns {number} probability (0-1)
 */
export function calculateHexOccupancyProbability(params = {}) {
  const baseRate = clamp(Number(params.baseRate) || 0.04, 0, 0.98);
  const realismScale = clamp(Number(params.realismScale) || 1, 0, 2);
  const realismFactor = realismScale;
  const morphologyFactor = localMorphologyFactor({
    col: Number(params.col) || 1,
    row: Number(params.row) || 1,
    cols: Math.max(1, Number(params.cols) || 1),
    rows: Math.max(1, Number(params.rows) || 1),
    galaxyType: params.galaxyType,
    morphology: params.morphology,
    morphologyScale: params.morphologyScale,
  });

  return clamp(baseRate * realismFactor * morphologyFactor, 0, 0.98);
}

/**
 * Pick a central anomaly type
 * @param {object} params
 * @returns {string} anomaly type
 */
export function pickCentralAnomalyType(params = {}) {
  // TODO: Implement anomaly type selection
  const types = ["Black Hole", "Pulsar", "Neutron Star", "Quasar Remnant", "Dense Cluster"];
  return types[Math.floor(Math.random() * types.length)];
}
