import { apiClient } from "./apiClient.js";

export function getWorld(worldId) {
  return apiClient.get(`/worlds/${worldId}`);
}

export function getWorlds(systemId) {
  return apiClient.get(`/systems/${systemId}/worlds`);
}

export function createWorld(world) {
  return apiClient.post("/worlds", world);
}

export function updateWorld(worldId, world) {
  return apiClient.put(`/worlds/${worldId}`, world);
}

export function deleteWorld(worldId) {
  return apiClient.delete(`/worlds/${worldId}`);
}
