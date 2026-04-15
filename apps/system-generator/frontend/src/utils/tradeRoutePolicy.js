import { calculateSpaceTier } from "./spaceClassification.js";

export function resolveTradeRouteSpaceTier(leftStar, rightStar, surveyedCoordKeySet = new Set()) {
  const leftTier = calculateSpaceTier(Number(leftStar?.sectorX), Number(leftStar?.sectorY), surveyedCoordKeySet);
  const rightTier = calculateSpaceTier(Number(rightStar?.sectorX), Number(rightStar?.sectorY), surveyedCoordKeySet);

  if (leftTier === "void" || rightTier === "void") {
    return null;
  }

  return leftTier === "surveyed" && rightTier === "surveyed" ? "surveyed" : "frontier";
}

export function resolveTradeRouteLegendKey({
  routeTier = "surveyed",
  hazardous = false,
  highestImportance = -99,
  pressured = false,
} = {}) {
  if (routeTier === "frontier") return "frontier";
  if (hazardous) return "hazard";
  if (highestImportance >= 3) return "major";
  if (pressured) return "pressure";
  return "standard";
}
