import { apiClient } from "./apiClient.js";

export function listGalaxies() {
  return apiClient.get("/galaxies");
}

export function getGalaxy(galaxyId) {
  return apiClient.get(`/galaxies/${galaxyId}`);
}

export function createGalaxy(galaxy) {
  return apiClient.post("/galaxies", galaxy);
}

export function updateGalaxy(galaxyId, galaxy) {
  return apiClient.put(`/galaxies/${galaxyId}`, galaxy);
}

export function deleteGalaxy(galaxyId) {
  return apiClient.delete(`/galaxies/${galaxyId}`);
}

export function importUniverse(universeOrPayload) {
  return apiClient.post("/import", universeOrPayload);
}

export function exportUniverse() {
  return apiClient.get("/export");
}

export function exportGalaxy(galaxyId) {
  return apiClient.get(`/export/${galaxyId}`);
}
