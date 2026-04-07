import { generatePrimaryStarHeuristic } from "./primaryStarGeneratorHeuristic.js";
import { generatePrimaryStarWbh } from "./wbh/starGenerationWbh.js";

function shouldUseHeuristicPrimaryStar(params = {}) {
  const requestedGenerator = String(params?.generator || params?.generatorModel || "")
    .trim()
    .toLowerCase();
  return requestedGenerator === "heuristic" || params?.useWbh === false;
}

/**
 * Generate a primary star object using the same shape expected by survey pages.
 * @param {object} params
 * @returns {object} star object
 */
export function generatePrimaryStar(params = {}) {
  if (shouldUseHeuristicPrimaryStar(params)) {
    return generatePrimaryStarHeuristic(params);
  }

  return generatePrimaryStarWbh(params);
}

export { generatePrimaryStarHeuristic };
