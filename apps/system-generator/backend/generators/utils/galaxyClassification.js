// utils/galaxyClassification.js

export const GALAXY_TYPES = {
  ELLIPTICAL: {
    code: "E",
    variants: ["E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7"],
    description: "Elliptical galaxies",
    characteristics: {
      arms: 0,
      bulge: "dominant",
      disk: "minimal",
    },
  },
  LENTICULAR: {
    code: "S0",
    variants: ["S0", "S0-a", "S0-b"],
    description: "Lenticular (lens-shaped) galaxies",
    characteristics: {
      arms: 0,
      bulge: "prominent",
      disk: "strong",
    },
  },
  SPIRAL: {
    code: "S",
    variants: ["Sa", "Sb", "Sc", "Sd"],
    description: "Spiral galaxies",
    characteristics: {
      arms: 2,
      bulge: "moderate",
      disk: "dominant",
    },
  },
  BARRED_SPIRAL: {
    code: "SB",
    variants: ["SBa", "SBb", "SBc", "SBd"],
    description: "Barred spiral galaxies",
    characteristics: {
      arms: 2,
      bulge: "moderate",
      disk: "dominant",
      bar: true,
    },
  },
  IRREGULAR: {
    code: "Irr",
    variants: ["Irr I", "Irr II"],
    description: "Irregular galaxies",
    characteristics: {
      arms: 0,
      bulge: "minimal",
      disk: "disrupted",
    },
  },
};

export function generateGalaxyType() {
  const types = Object.keys(GALAXY_TYPES);
  const selectedType = types[Math.floor(Math.random() * types.length)];
  const typeData = GALAXY_TYPES[selectedType];
  const variantIndex = Math.floor(Math.random() * typeData.variants.length);

  return {
    classification: typeData.code,
    subtype: typeData.variants[variantIndex],
    description: typeData.description,
    morphology: typeData.characteristics,
  };
}
