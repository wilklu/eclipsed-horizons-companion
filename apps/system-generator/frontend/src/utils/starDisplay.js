export function normalizeStarDescriptor(value, fallback = "G2V") {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallback;
  }

  const lowered = normalized.toLowerCase();
  if (lowered === "undefined" || lowered === "null" || lowered === "nan") {
    return fallback;
  }

  return normalized;
}

export function resolveStarDescriptorToken(value, fallback = "G") {
  const normalized = normalizeStarDescriptor(value, fallback);
  const upper = normalized.toUpperCase();
  const spectralClassMatch = upper.match(/SPECTRAL-([OBAFGKM])/);

  if (spectralClassMatch) return spectralClassMatch[1];
  if (/BLACK\s+HOLE/.test(upper) || /^BH\b/.test(upper)) return "BH";
  if (/PULSAR/.test(upper) || /^PSR\b/.test(upper)) return "PSR";
  if (/NEUTRON/.test(upper) || /^NS\b/.test(upper)) return "NS";
  if (/NEBULA/.test(upper) || /^NB\b/.test(upper)) return "NB";
  if (/PROTOSTAR/.test(upper) || /^PROTO\b/.test(upper)) return "PROTO";
  if (/STAR\s+CLUSTER/.test(upper) || /DENSE\s+CLUSTER/.test(upper) || /^CLUSTER\b/.test(upper)) return "CLUSTER";
  if (/ANOMALY/.test(upper)) return "ANOMALY";
  if (/BROWN\s+DWARF/.test(upper) || /^BD\b/.test(upper)) return "BD";
  if (/WHITE\s+DWARF/.test(upper) || /^D\b/.test(upper)) return "D";
  if (/^L\b/.test(upper)) return "L";
  if (/^T\b/.test(upper)) return "T";
  if (/^Y\b/.test(upper)) return "Y";

  const first = upper.charAt(0);
  return ["O", "B", "A", "F", "G", "K", "M"].includes(first) ? first : String(fallback || "G").toUpperCase();
}

export function isAnomalyLikeStarDescriptor(value) {
  return ["BH", "PSR", "NS", "NB", "PROTO", "CLUSTER", "ANOMALY"].includes(resolveStarDescriptorToken(value));
}

export function starDescriptorToCssClass(value, fallback = "spectral-g") {
  switch (resolveStarDescriptorToken(value)) {
    case "O":
      return "spectral-o";
    case "B":
      return "spectral-b";
    case "A":
      return "spectral-a";
    case "F":
      return "spectral-f";
    case "G":
      return "spectral-g";
    case "K":
      return "spectral-k";
    case "M":
      return "spectral-m";
    case "D":
      return "spectral-a";
    case "BD":
    case "L":
    case "T":
    case "Y":
      return "spectral-m";
    case "PROTO":
      return "spectral-k";
    case "BH":
    case "PSR":
    case "NS":
    case "NB":
    case "CLUSTER":
    case "ANOMALY":
      return "anomaly-core";
    default:
      return fallback;
  }
}

export function starDescriptorToColor(value, fallback = "#8fe9ff") {
  switch (resolveStarDescriptorToken(value)) {
    case "O":
      return "#9bb0ff";
    case "B":
      return "#aabfff";
    case "A":
      return "#cad7ff";
    case "F":
      return "#f8f7ff";
    case "G":
      return "#fff4ea";
    case "K":
      return "#ffd2a1";
    case "M":
      return "#ff8c69";
    case "D":
      return "#d8e6ff";
    case "BD":
      return "#b85c2e";
    case "L":
      return "#8a3d1c";
    case "T":
      return "#5a2410";
    case "Y":
      return "#3a180b";
    case "PROTO":
      return "#f3bc7d";
    case "BH":
    case "PSR":
    case "NS":
    case "NB":
    case "CLUSTER":
    case "ANOMALY":
      return "#c77dff";
    default:
      return fallback;
  }
}
