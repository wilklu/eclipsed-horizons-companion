const SPECTRAL_TYPES = [
  { code: "O", mass: 40, luminosity: 100000, temperatureK: 40000, weight: 0.00003 },
  { code: "B", mass: 10, luminosity: 10000, temperatureK: 20000, weight: 0.0013 },
  { code: "A", mass: 2.0, luminosity: 25, temperatureK: 8500, weight: 0.006 },
  { code: "F", mass: 1.4, luminosity: 4, temperatureK: 6700, weight: 0.03 },
  { code: "G", mass: 1.0, luminosity: 1.0, temperatureK: 5800, weight: 0.076 },
  { code: "K", mass: 0.7, luminosity: 0.25, temperatureK: 4500, weight: 0.121 },
  { code: "M", mass: 0.3, luminosity: 0.04, temperatureK: 3200, weight: 0.765 },
];

function pickSpectralEntry(requestedType) {
  const normalized = String(requestedType || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  const exact = SPECTRAL_TYPES.find((entry) => entry.code === normalized);
  if (exact) {
    return exact;
  }

  const totalWeight = SPECTRAL_TYPES.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of SPECTRAL_TYPES) {
    roll -= entry.weight;
    if (roll <= 0) {
      return entry;
    }
  }

  return SPECTRAL_TYPES[SPECTRAL_TYPES.length - 1];
}

export function generatePrimaryStarHeuristic(params = {}) {
  const spectralEntry = pickSpectralEntry(params?.spectralType || params?.designation);
  const decimal = Math.max(
    0,
    Math.min(9, Number.parseInt(String(params?.decimal ?? ""), 10) || Math.floor(Math.random() * 10)),
  );
  const luminosityClass = String(params?.luminosityClass || "V").trim() || "V";
  const designation = `${spectralEntry.code}${decimal}${luminosityClass}`;

  return {
    id: Math.random().toString(36).slice(2, 11),
    designation,
    spectralType: designation,
    spectralClass: designation,
    persistedSpectralClass: designation,
    luminosityClass,
    luminosity: spectralEntry.luminosity,
    mass: spectralEntry.mass,
    massInSolarMasses: spectralEntry.mass,
    temperature: spectralEntry.temperatureK,
    temperatureK: spectralEntry.temperatureK,
    orbitType: null,
    isAnomaly: false,
  };
}
