export function validateCompositionDetailed(obj) {
  const errors = [];
  if (!obj || typeof obj !== "object") {
    errors.push("composition must be an object");
    return { valid: false, errors };
  }

  if (!Array.isArray(obj.bulkElementAbundances)) {
    errors.push("bulkElementAbundances must be an array");
  } else {
    obj.bulkElementAbundances.forEach((entry, idx) => {
      if (!entry || typeof entry !== "object") errors.push(`bulkElementAbundances[${idx}] invalid`);
      if (typeof entry.element !== "string") errors.push(`bulkElementAbundances[${idx}].element missing or not string`);
      if (typeof entry.weightPercent !== "number")
        errors.push(`bulkElementAbundances[${idx}].weightPercent missing or not number`);
    });
  }

  if (!obj.majorReservoirs || typeof obj.majorReservoirs !== "object") {
    errors.push("majorReservoirs must be an object");
  } else {
    ["core", "mantle", "crust"].forEach((r) => {
      if (!Array.isArray(obj.majorReservoirs[r])) errors.push(`majorReservoirs.${r} must be an array`);
    });
  }

  return { valid: errors.length === 0, errors };
}

export function normalizeCompositionDetailed(obj = {}) {
  return {
    code: obj.code ?? null,
    description: String(obj.description ?? ""),
    metallicity: typeof obj.metallicity === "number" ? obj.metallicity : null,
    oxidationState: obj.oxidationState ?? null,
    bulkElementAbundances: Array.isArray(obj.bulkElementAbundances) ? obj.bulkElementAbundances : [],
    atomicComposition: Array.isArray(obj.atomicComposition) ? obj.atomicComposition : [],
    majorReservoirs:
      obj.majorReservoirs && typeof obj.majorReservoirs === "object"
        ? {
            core: Array.isArray(obj.majorReservoirs.core) ? obj.majorReservoirs.core : [],
            mantle: Array.isArray(obj.majorReservoirs.mantle) ? obj.majorReservoirs.mantle : [],
            crust: Array.isArray(obj.majorReservoirs.crust) ? obj.majorReservoirs.crust : [],
          }
        : { core: [], mantle: [], crust: [] },
    volatiles: Array.isArray(obj.volatiles) ? obj.volatiles : [],
    provenance: obj.provenance ?? null,
  };
}

export function summarizeCompositionDetailed(obj = {}, topN = 4) {
  if (!obj || !Array.isArray(obj.bulkElementAbundances)) return "";
  return obj.bulkElementAbundances
    .slice()
    .sort((a, b) => b.weightPercent - a.weightPercent)
    .slice(0, topN)
    .map((e) => `${e.element} ${Number(e.weightPercent).toFixed(2)}%`)
    .join(", ");
}

export default { validateCompositionDetailed, normalizeCompositionDetailed, summarizeCompositionDetailed };
