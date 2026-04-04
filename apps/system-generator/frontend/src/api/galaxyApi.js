const STORAGE_KEY = "eclipsed-horizons-galaxies";

function loadGalaxies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGalaxies(galaxies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(galaxies));
}

export async function getGalaxy(galaxyId) {
  return loadGalaxies().find((galaxy) => String(galaxy.galaxyId) === String(galaxyId)) ?? null;
}

export async function getAllGalaxies() {
  return loadGalaxies();
}

export async function createGalaxy(galaxyData) {
  const galaxies = loadGalaxies();
  galaxies.push(galaxyData);
  saveGalaxies(galaxies);
  return galaxyData;
}

export async function updateGalaxy(galaxyId, updates) {
  const galaxies = loadGalaxies();
  const index = galaxies.findIndex((galaxy) => String(galaxy.galaxyId) === String(galaxyId));
  if (index < 0) {
    throw new Error(`Galaxy not found: ${galaxyId}`);
  }
  galaxies[index] = {
    ...galaxies[index],
    ...updates,
  };
  saveGalaxies(galaxies);
  return galaxies[index];
}

export async function deleteGalaxy(galaxyId) {
  const galaxies = loadGalaxies().filter((galaxy) => String(galaxy.galaxyId) !== String(galaxyId));
  saveGalaxies(galaxies);
}
