function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

const DEFAULT_BASE_ELEMENTS = {
  Fe: 28,
  O: 30,
  Si: 16,
  Mg: 14,
  S: 3,
  Ni: 2,
  Al: 1,
  Ca: 1,
  Na: 0.5,
  K: 0.2,
  C: 0.5,
  H: 0.1,
  N: 0.05,
  Others: 2.65,
};

const ATOMIC_WEIGHTS = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.085,
  P: 30.974,
  S: 32.06,
  K: 39.098,
  Ca: 40.078,
  Ti: 47.867,
  Fe: 55.845,
  Ni: 58.693,
};

function weightToAtomicPercent(bulk) {
  const atoms = {};
  Object.keys(bulk).forEach((el) => {
    const w = Number(bulk[el] || 0);
    const aw = ATOMIC_WEIGHTS[el] || 50; // fallback
    atoms[el] = w / aw;
  });
  const sum = Object.values(atoms).reduce((s, v) => s + v, 0) || 1;
  return Object.keys(atoms).map((el) => ({ element: el, atomicPercent: (atoms[el] / sum) * 100 }));
}

export function generatePlanetCompositionDetailed(opts = {}) {
  // Inputs: size (numeric), sizeCode, density, avgTempC, hydrographicsPercent, baseComposition string, starMetallicity
  const size = Number(opts.size || 5);
  const density = Number(opts.density || 1.0);
  const avgTempC = Number.isFinite(Number(opts.avgTempC)) ? Number(opts.avgTempC) : null;
  const hydrographicsPercent = Number(opts.hydrographicsPercent ?? 0);
  const baseComposition = String(opts.baseComposition || opts.composition || "").toLowerCase();
  const metallicity = Number.isFinite(Number(opts.starMetallicity)) ? Number(opts.starMetallicity) : 1.0;

  // Start from a chondritic-ish baseline
  const elems = { ...DEFAULT_BASE_ELEMENTS };

  // Adjust by broad composition hints
  if (baseComposition.includes("mostly metal") || baseComposition.includes("metal")) {
    elems.Fe += 10;
    elems.Ni += 2;
    elems.Si = Math.max(0.1, elems.Si - 4);
    elems.Mg = Math.max(0.1, elems.Mg - 3);
  } else if (baseComposition.includes("mostly ice") || baseComposition.includes("ice")) {
    // ice-rich bodies: bulk H/O heavy
    elems.H = 40;
    elems.O = 35;
    elems.Fe = 3;
    elems.Si = 4;
    elems.Mg = 3;
    elems.Others = 12;
  } else if (baseComposition.includes("exotic ice") || baseComposition.includes("exotic")) {
    elems.H = 45;
    elems.O = 40;
    elems.Fe = 2;
    elems.Si = 3;
    elems.Mg = 3;
    elems.Others = 7;
  } else if (baseComposition.includes("mostly rock")) {
    elems.Fe = Math.max(0.1, elems.Fe - 4);
    elems.Si += 2;
    elems.Mg += 1;
  }

  // Metal enrichment from stellar metallicity
  if (metallicity > 0 && metallicity !== 1) {
    const metalScale = clamp(metallicity, 0.2, 3);
    elems.Fe *= metalScale;
    elems.Ni *= metalScale;
    elems.Al *= metalScale;
    elems.Ca *= metalScale;
  }

  // Estimate a small volatile reservoir from hydrographics
  const volatiles = [];
  const waterBulk = clamp(hydrographicsPercent * 0.05, 0, 10); // crude: 71% -> ~3.55% bulk water
  if (waterBulk > 0.001) volatiles.push({ species: "H2O", weightPercent: Number(waterBulk.toFixed(3)) });

  // If very cold and ices dominate, add other volatiles
  if (avgTempC !== null && avgTempC < -150) {
    volatiles.push({ species: "CH4", weightPercent: 0.5 });
    volatiles.push({ species: "NH3", weightPercent: 0.2 });
  }

  // Reduce refractory pool to make room for volatiles
  const refractoryTotal = Object.values(elems).reduce((s, v) => s + v, 0);
  const volTotal = volatiles.reduce((s, v) => s + v.weightPercent, 0);
  const scale = (100 - volTotal) / refractoryTotal;
  Object.keys(elems).forEach((k) => {
    elems[k] = Number((elems[k] * scale).toFixed(6));
  });

  // Build bulk list and normalize rounding errors
  const bulk = Object.keys(elems).map((el) => ({ element: el, weightPercent: Number(elems[el].toFixed(4)) }));
  const bulkSum = bulk.reduce((s, e) => s + e.weightPercent, 0) + volTotal;
  // Normalize to 100
  const normFactor = 100 / bulkSum;
  bulk.forEach((e) => (e.weightPercent = Number((e.weightPercent * normFactor).toFixed(6))));
  volatiles.forEach((v) => (v.weightPercent = Number((v.weightPercent * normFactor).toFixed(6))));

  // Partition core fraction roughly from Fe+Ni
  const fe = bulk.find((b) => b.element === "Fe")?.weightPercent || 0;
  const ni = bulk.find((b) => b.element === "Ni")?.weightPercent || 0;
  const metalSum = fe + ni;
  const coreFraction = clamp((metalSum / 100) * 0.7, 0.05, 0.6);
  const core = [];
  if (metalSum > 0) {
    core.push({ element: "Fe", pct: Number((coreFraction * (fe / metalSum) * 100).toFixed(4)) });
    core.push({ element: "Ni", pct: Number((coreFraction * (ni / metalSum) * 100).toFixed(4)) });
  }

  // Mantle gets most of the silicates
  const mantle = [];
  ["Si", "Mg", "O", "S", "Al", "Ca"].forEach((el) => {
    const w = bulk.find((b) => b.element === el)?.weightPercent || 0;
    mantle.push({ element: el, pct: Number(((1 - coreFraction) * (w / 100) * 100).toFixed(4)) });
  });

  // Crust picks a small share of lithophile elements
  const crust = [];
  ["Al", "Ca", "Na", "K", "Si"].forEach((el) => {
    const w = bulk.find((b) => b.element === el)?.weightPercent || 0;
    crust.push({ element: el, pct: Number((w * 0.05).toFixed(4)) });
  });

  // oxidation state heuristic
  const oxygen = bulk.find((b) => b.element === "O")?.weightPercent || 0;
  const oxidation = oxygen / Math.max(1, metalSum) > 1.2 ? "oxidized" : "reduced";

  const atomic = weightToAtomicPercent(
    bulk.reduce((acc, cur) => {
      acc[cur.element] = cur.weightPercent;
      return acc;
    }, {}),
  );

  const top3 = bulk
    .slice()
    .sort((a, b) => b.weightPercent - a.weightPercent)
    .slice(0, 3)
    .map((e) => `${e.element} ${e.weightPercent.toFixed(2)}%`)
    .join(", ");

  return {
    code: null,
    description: `Bulk composition — ${top3}`,
    metallicity,
    oxidationState: oxidation,
    bulkElementAbundances: bulk,
    atomicComposition: atomic,
    majorReservoirs: { core, mantle, crust },
    volatiles,
    provenance: opts.provenance || "wbh",
  };
}

export function generatePlanetComposition(opts = {}) {
  const d = generatePlanetCompositionDetailed(opts);
  const brief = d.bulkElementAbundances
    .slice()
    .sort((a, b) => b.weightPercent - a.weightPercent)
    .slice(0, 4)
    .map((e) => `${e.element} ${e.weightPercent.toFixed(1)}%`)
    .join(", ");
  const vol = d.volatiles.map((v) => `${v.species} ${v.weightPercent.toFixed(2)}%`).join(", ");
  return `${brief}${vol ? ` · Volatiles: ${vol}` : ""}`;
}

export default {
  generatePlanetCompositionDetailed,
  generatePlanetComposition,
};
