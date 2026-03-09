import { apiClient } from "./apiClient.js";

export function getSystem(systemId) {
  return apiClient.get(`/systems/${systemId}`);
}

export function getSystems(galaxyId, sectorId) {
  return apiClient.get(`/galaxies/${galaxyId}/sectors/${sectorId}/systems`);
}

export function createSystem(system) {
  return apiClient.post("/systems", system);
}

export function updateSystem(systemId, system) {
  return apiClient.put(`/systems/${systemId}`, system);
}

export function deleteSystem(systemId) {
  return apiClient.delete(`/systems/${systemId}`);
}
