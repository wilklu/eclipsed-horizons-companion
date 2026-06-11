const FLAT_MAP_HEX_ALIAS_GROUPS = Object.freeze([
  ["001001", "006001", "011001", "016001", "021001", "026001"],
  ["002002", "006002"],
]);

const FLAT_MAP_HEX_ALIAS_LOOKUP = (() => {
  const lookup = new Map();
  for (const group of FLAT_MAP_HEX_ALIAS_GROUPS) {
    if (!Array.isArray(group) || group.length === 0) continue;
    const canonical = String(group[0] || "").trim();
    if (!canonical) continue;
    for (const entry of group) {
      const normalized = String(entry || "").trim();
      if (!normalized) continue;
      lookup.set(normalized, canonical);
    }
  }
  return lookup;
})();

export function canonicalizeHexId(hexId) {
  const normalized = String(hexId || "").trim();
  if (!normalized) {
    return "";
  }
  return FLAT_MAP_HEX_ALIAS_LOOKUP.get(normalized) || normalized;
}

export { FLAT_MAP_HEX_ALIAS_GROUPS };
