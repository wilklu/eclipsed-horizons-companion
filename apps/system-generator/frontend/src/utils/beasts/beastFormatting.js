export function formatReactionValue(value) {
  if (value === "No") return "No reaction roll";
  if (value === "P") return "Attack if possible";
  if (value === "S") return "Attack on surprise";
  if (value === "S+") return "Flee if surprised";
  return `Target ${value}+`;
}

export function formatBeastSummary(beast) {
  if (!beast || typeof beast !== "object") {
    return "No beast generated.";
  }

  const name = beast.name || "Unnamed beast";
  const speedLabel = beast?.speed?.speedC || "moving";
  const kph = beast?.speed?.kph ?? 0;
  const terrain = beast?.terrain || "unknown terrain";
  const locomotion = String(beast?.locomotion || "unknown locomotion").toLowerCase();
  const size = beast?.size?.label || "unknown size";
  const subniche = beast?.ecologicalNiche?.subniche || "unknown niche";
  const quantity = beast?.quantity?.label || "unknown numbers";
  const weapon = beast?.combat?.weapon?.weapon || "no weapon";
  const armor = beast?.combat?.armor?.primary || "No Armor";

  return `${name} is a ${speedLabel.toLowerCase()} (${kph} kph) ${terrain.toLowerCase()} ${locomotion}. It is a ${size.toLowerCase()} ${subniche.toLowerCase()} usually found as ${quantity.toLowerCase()}. It uses ${weapon.toLowerCase()} and is protected by ${armor.toLowerCase()}.`;
}
