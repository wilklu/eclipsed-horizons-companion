import { apiClient } from "./apiClient.js";

export function getSector(sectorId) {
  return apiClient.get(`/sectors/${sectorId}`);
}

export function getSectors(galaxyId) {
  return apiClient.get(`/galaxies/${galaxyId}/sectors`);
}

export function createSector(sector) {
  return apiClient.post("/sectors", sector);
}

export function updateSector(sectorId, sector) {
  return apiClient.put(`/sectors/${sectorId}`, sector);
}

export function deleteSector(sectorId) {
  return apiClient.delete(`/sectors/${sectorId}`);
}
