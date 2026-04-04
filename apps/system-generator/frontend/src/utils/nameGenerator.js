/**
 * Name generation utilities
 * Placeholder for name generation logic
 */

/**
 * Generate a galaxy name
 * @returns {string} galaxy name
 */
export function generateGalaxyName() {
  // TODO: Implement galaxy naming
  const adjectives = ["Ancient", "Distant", "Whirling", "Spiral", "Grand"];
  const nouns = ["Galaxy", "Nebula", "Realm", "Domain", "Cosmos"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

/**
 * Generate a phonotactic name
 * @returns {string} phonotactic name
 */
export function generatePhonotacticName() {
  // TODO: Implement phonotactic naming
  const syllables = ["sol", "ter", "vex", "kesh", "zar", "mor", "vel", "dar"];
  const count = Math.floor(Math.random() * 3) + 2;
  let name = "";
  for (let i = 0; i < count; i++) {
    name += syllables[Math.floor(Math.random() * syllables.length)];
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}
