// utils/galaxyDensityCalculator.js

export function calculateSectorDensity(galaxyData, sectorCoordinates) {
  const {
    galaxyType,
    sectorGridX,
    sectorGridY,
    galaxyCenter = { x: sectorGridX / 2, y: sectorGridY / 2 },
  } = galaxyData;

  // Route to appropriate density calculator
  switch (galaxyType.classification) {
    case "Spiral":
      return calculateSpiralArmDensity(galaxyData, sectorCoordinates);

    case "Barred Spiral":
      return calculateBarredSpiralDensity(galaxyData, sectorCoordinates);

    case "Elliptical":
      return calculateEllipticalDensity(galaxyData, sectorCoordinates);

    case "Lenticular":
      return calculateLenticularDensity(galaxyData, sectorCoordinates);

    case "Irregular":
      return calculateIrregularDensity(galaxyData, sectorCoordinates);

    default:
      return "Standard"; // Default fallback
  }
}

export function calculateSpiralArmDensity(galaxyData, sectorCoords) {
  const {
    sectorGridX = 3834,
    sectorGridY = 3068,
    morphology = {
      arms: 2,
      armWidth: 0.15, // 15% of radius
      pitchAngle: 20, // Degrees
      centralBulgeRadius: 0.2, // 20% of galaxy radius
    },
  } = galaxyData.galaxyType;

  // Calculate distance from galactic center
  const centerX = sectorGridX / 2;
  const centerY = sectorGridY / 2;

  const dx = sectorCoords.x - centerX;
  const dy = sectorCoords.y - centerY;

  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  const normalizedDistance = distanceFromCenter / maxDistance; // 0 to 1

  // Get angle from center (0 to 2π)
  const angle = Math.atan2(dy, dx);

  // ===== ZONE 1: GALACTIC BULGE/CORE =====
  const bulgeRadius = maxDistance * morphology.centralBulgeRadius;
  if (distanceFromCenter < bulgeRadius) {
    // Core density increases toward center
    const bulgeNormalized = distanceFromCenter / bulgeRadius;
    // Density gradient from Dense to Core
    if (bulgeNormalized < 0.5) {
      return "Core"; // 91%
    } else if (bulgeNormalized < 0.75) {
      return "Cluster"; // 83%
    } else {
      return "Dense"; // 66%
    }
  }

  // ===== ZONE 2: SPIRAL ARMS =====
  // Create spiral arm pattern using logarithmic spiral equation
  const armWidth = maxDistance * morphology.armWidth;
  const spiralPhase = getLogSpiralPhase(angle, morphology.pitchAngle, morphology.arms);

  // Distance from nearest arm
  const distanceFromArm = Math.abs(spiralPhase);
  const normalizedArmDistance = distanceFromArm / armWidth;

  // Determine if in arm or between arms
  if (normalizedArmDistance < 0.5) {
    // WITHIN ARM: Denser regions
    const armIntensity = 1 - normalizedArmDistance; // 0.5 to 1.0

    if (normalizedDistance < 0.3) {
      // Inner arm (near bulge)
      return armIntensity > 0.8 ? "Dense" : "Standard";
    } else if (normalizedDistance < 0.6) {
      // Mid arm (widest part)
      return "Dense";
    } else if (normalizedDistance < 0.85) {
      // Outer arm
      return armIntensity > 0.7 ? "Dense" : "Standard";
    } else {
      // Galactic edge
      return "Scattered";
    }
  } else {
    // BETWEEN ARMS: Sparser regions
    const spaceIntensity = Math.max(0, 1 - normalizedArmDistance * 2);

    if (normalizedDistance < 0.3) {
      return "Standard";
    } else if (normalizedDistance < 0.6) {
      return spaceIntensity > 0.5 ? "Scattered" : "Sparse";
    } else if (normalizedDistance < 0.85) {
      return "Sparse";
    } else {
      return "Sparse"; // Outer reaches
    }
  }
}

// Logarithmic spiral equation
function getLogSpiralPhase(angle, pitchAngle, armCount) {
  // Convert pitch angle to radians
  const pitchRad = (pitchAngle * Math.PI) / 180;

  // Angular spacing between arms
  const armSpacing = (2 * Math.PI) / armCount;

  // Find nearest arm angle
  let nearestArmAngle = 0;
  let minDiff = Math.PI;

  for (let i = 0; i < armCount; i++) {
    const armAngle = (i * armSpacing) % (2 * Math.PI);
    let diff = Math.abs(angle - armAngle);

    // Handle wrap-around
    if (diff > Math.PI) diff = 2 * Math.PI - diff;

    if (diff < minDiff) {
      minDiff = diff;
      nearestArmAngle = armAngle;
    }
  }

  return minDiff;
}

export function calculateBarredSpiralDensity(galaxyData, sectorCoords) {
  const {
    sectorGridX = 3834,
    sectorGridY = 3068,
    morphology = {
      arms: 2,
      armWidth: 0.12,
      pitchAngle: 25,
      barLength: 0.4, // 40% of radius
      barWidth: 0.08, // 8% of radius
      centralBulgeRadius: 0.15,
    },
  } = galaxyData.galaxyType;

  const centerX = sectorGridX / 2;
  const centerY = sectorGridY / 2;

  const dx = sectorCoords.x - centerX;
  const dy = sectorCoords.y - centerY;

  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  const normalizedDistance = distanceFromCenter / maxDistance;
  const angle = Math.atan2(dy, dx);

  // ===== ZONE 1: GALACTIC BULGE =====
  const bulgeRadius = maxDistance * morphology.centralBulgeRadius;
  if (distanceFromCenter < bulgeRadius) {
    const bulgeNormalized = distanceFromCenter / bulgeRadius;
    if (bulgeNormalized < 0.3) return "Core"; // 91%
    if (bulgeNormalized < 0.7) return "Cluster"; // 83%
    return "Dense"; // 66%
  }

  // ===== ZONE 2: BAR STRUCTURE =====
  const barRadius = maxDistance * morphology.barLength;
  const barHalfWidth = maxDistance * morphology.barWidth;

  // Check if sector is within bar region (bars aligned 0°/180°)
  const barAngleThreshold = Math.atan(barHalfWidth / (distanceFromCenter + 1));
  const isInBar = Math.abs(angle) < barAngleThreshold || Math.abs(angle - Math.PI) < barAngleThreshold;

  if (isInBar && distanceFromCenter < barRadius) {
    // WITHIN BAR: Very dense
    return "Cluster"; // 83%
  }

  // ===== ZONE 3: SPIRAL ARMS (from bar ends) =====
  const armWidth = maxDistance * morphology.armWidth;
  const spiralPhase = getLogSpiralPhase(angle, morphology.pitchAngle, morphology.arms);
  const distanceFromArm = Math.abs(spiralPhase);
  const normalizedArmDistance = distanceFromArm / armWidth;

  if (normalizedArmDistance < 0.5) {
    if (normalizedDistance < 0.4) return "Dense"; // 66%
    if (normalizedDistance < 0.7) return "Standard"; // 50%
    return "Scattered"; // 33%
  } else {
    if (normalizedDistance < 0.4) return "Standard";
    if (normalizedDistance < 0.7) return "Scattered";
    return "Sparse"; // 17%
  }
}

export function calculateEllipticalDensity(galaxyData, sectorCoords) {
  const {
    sectorGridX = 3834,
    sectorGridY = 3068,
    morphology = {
      eccentricity: 0.7, // 0 = sphere, 1 = flat disk
      axisRatio: 0.6, // Minor axis / Major axis
    },
  } = galaxyData.galaxyType;

  const centerX = sectorGridX / 2;
  const centerY = sectorGridY / 2;

  const dx = sectorCoords.x - centerX;
  const dy = sectorCoords.y - centerY;

  // Elliptical distance (normalized to 0-1 from center to edge)
  const ellipticalDistance = Math.sqrt(
    (dx / (sectorGridX / 2)) ** 2 + (dy / ((sectorGridY / 2) * morphology.axisRatio)) ** 2,
  );

  // Density follows Sersic profile (realistic for elliptical galaxies)
  // More concentrated toward center

  if (ellipticalDistance < 0.15) {
    return "Core"; // 91%
  } else if (ellipticalDistance < 0.35) {
    return "Cluster"; // 83%
  } else if (ellipticalDistance < 0.55) {
    return "Dense"; // 66%
  } else if (ellipticalDistance < 0.75) {
    return "Standard"; // 50%
  } else if (ellipticalDistance < 0.9) {
    return "Scattered"; // 33%
  } else {
    return "Sparse"; // 17%
  }
}

export function calculateIrregularDensity(galaxyData, sectorCoords) {
  // Irregular galaxies have chaotic structure
  // Use Perlin noise or similar for realistic variation

  const {
    sectorGridX = 3834,
    sectorGridY = 3068,
    morphology = {
      chaoticness: 0.8, // 0 = somewhat organized, 1 = completely random
    },
    seed = "default",
  } = galaxyData.galaxyType;

  const centerX = sectorGridX / 2;
  const centerY = sectorGridY / 2;

  const dx = sectorCoords.x - centerX;
  const dy = sectorCoords.y - centerY;

  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  const normalizedDistance = distanceFromCenter / maxDistance;

  // Base density decreases from center outward
  let baseDensity = 1 - normalizedDistance;

  // Add seeded randomness for chaotic structure
  const noiseValue = seededNoise(sectorCoords.x, sectorCoords.y, seed) * morphology.chaoticness;

  const finalDensity = baseDensity + noiseValue * 0.3;

  // Map to Traveller densities
  if (finalDensity > 0.85) return "Cluster"; // 83%
  if (finalDensity > 0.7) return "Dense"; // 66%
  if (finalDensity > 0.55) return "Standard"; // 50%
  if (finalDensity > 0.4) return "Scattered"; // 33%
  if (finalDensity > 0.25) return "Sparse"; // 17%
  return "Sparse"; // 17%
}

// Simple seeded noise function
function seededNoise(x, y, seed = "default") {
  const hash = Math.sin(x * 12.9898 + y * 78.233 + hashString(seed)) * 43758.5453;
  return hash - Math.floor(hash);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

export function generateDensityHeatmap(galaxyData, resolution = 50) {
  /**
   * resolution: number of points per axis for the heatmap
   * Lower resolution = faster, less detailed
   * Higher resolution = slower, more detailed
   */

  const { sectorGridX, sectorGridY } = galaxyData.galaxyDimensions;
  const heatmap = [];

  // Step size for sampling
  const stepX = Math.floor(sectorGridX / resolution);
  const stepY = Math.floor(sectorGridY / resolution);

  for (let y = 0; y < sectorGridY; y += stepY) {
    const row = [];

    for (let x = 0; x < sectorGridX; x += stepX) {
      const density = calculateSectorDensity(galaxyData, { x, y });
      const percentValue = TRAVELLER_DENSITIES[density].percentage;

      row.push({
        x,
        y,
        density,
        percentage: percentValue,
      });
    }

    heatmap.push(row);
  }

  return heatmap;
}

export function renderDensityHeatmap(galaxyData, canvasElement) {
  const ctx = canvasElement.getContext("2d");
  const heatmap = generateDensityHeatmap(galaxyData, 100);

  const cellWidth = canvasElement.width / heatmap[0].length;
  const cellHeight = canvasElement.height / heatmap.length;

  const densityColors = {
    "Extra Galactic": "#000033",
    Rift: "#330000",
    Sparse: "#003300",
    Scattered: "#003333",
    Standard: "#333333",
    Dense: "#CCCC00",
    Cluster: "#FFFF00",
    Core: "#FF0000",
  };

  for (let row of heatmap) {
    for (let cell of row) {
      ctx.fillStyle = densityColors[cell.density];
      ctx.fillRect(
        (cell.x / galaxyData.galaxyDimensions.sectorGridX) * canvasElement.width,
        (cell.y / galaxyData.galaxyDimensions.sectorGridY) * canvasElement.height,
        cellWidth,
        cellHeight,
      );
    }
  }

  // Draw grid
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvasElement.width; x += cellWidth) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasElement.height);
    ctx.stroke();
  }
}
