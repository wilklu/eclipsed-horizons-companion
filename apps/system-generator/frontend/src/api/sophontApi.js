import { apiClient } from "./apiClient.js";

export function getSophont(sophontId) {
  return apiClient.get(`/sophonts/${sophontId}`);
}

export function getSophonts(worldId) {
  return apiClient.get(`/worlds/${worldId}/sophonts`);
}

export function createSophont(sophont) {
  return apiClient.post("/sophonts", sophont);
}

export function updateSophont(sophontId, sophont) {
  return apiClient.put(`/sophonts/${sophontId}`, sophont);
}

export function deleteSophont(sophontId) {
  return apiClient.delete(`/sophonts/${sophontId}`);
}
