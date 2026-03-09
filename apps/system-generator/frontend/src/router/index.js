import { createRouter, createWebHashHistory } from "vue-router";
import * as galaxyApi from "../api/galaxyApi.js";
import * as sectorApi from "../api/sectorApi.js";
import * as systemApi from "../api/systemApi.js";

const routes = [
  {
    path: "/",
    name: "GalaxySurvey",
    component: () => import("../pages/surveys/GalaxySurvey.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/sector/:galaxyId",
    name: "SectorSurvey",
    component: () => import("../pages/surveys/SectorSurvey.vue"),
    props: true,
    meta: { requires: ["galaxy"] },
  },
  {
    path: "/sector/:galaxyId/star-system/:sectorId?",
    name: "StarSystemBuilder",
    component: () => import("../pages/surveys/StarSystemBuilder.vue"),
    props: true,
    meta: { requires: ["galaxy", "sector"] },
  },
  {
    path: "/world-builder/:systemId?",
    name: "WorldBuilder",
    component: () => import("../pages/surveys/WorldBuilder.vue"),
    props: true,
    meta: { requires: ["system"] },
  },
  {
    path: "/sophont-generator",
    name: "SophontGenerator",
    component: () => import("../pages/surveys/SophontGenerator.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/creature-generator",
    name: "CreatureGenerator",
    component: () => import("../pages/surveys/CreatureGenerator.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/history-generator",
    name: "HistoryGenerator",
    component: () => import("../pages/surveys/HistoryGenerator.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/character-generator",
    name: "CharacterGenerator",
    component: () => import("../pages/surveys/CharacterGenerator.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/session-planner",
    name: "SessionPlanner",
    component: () => import("../pages/surveys/SessionPlanner.vue"),
    meta: { requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/**
 * Validate that a galaxy exists
 */
async function validateGalaxy(galaxyId) {
  if (!galaxyId) return false;
  try {
    await galaxyApi.getGalaxy(galaxyId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a sector exists
 */
async function validateSector(sectorId) {
  if (!sectorId) return false;
  try {
    await sectorApi.getSector(sectorId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a system exists
 */
async function validateSystem(systemId) {
  if (!systemId) return false;
  try {
    await systemApi.getSystem(systemId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Global route guard to enforce navigation hierarchy
 */
router.beforeEach(async (to, from, next) => {
  // Routes without requirements can proceed freely
  if (!to.meta.requires) {
    next();
    return;
  }

  const requirements = to.meta.requires;

  // Check galaxy requirement
  if (requirements.includes("galaxy")) {
    const galaxyId = to.params.galaxyId;
    const isValid = await validateGalaxy(galaxyId);
    if (!isValid) {
      // Redirect to GalaxySurvey with error
      next({ name: "GalaxySurvey", query: { error: "invalid-galaxy" } });
      return;
    }
  }

  // Check sector requirement
  if (requirements.includes("sector")) {
    const sectorId = to.params.sectorId;
    const isValid = await validateSector(sectorId);
    if (!isValid) {
      // Redirect back to SectorSurvey with error
      const galaxyId = to.params.galaxyId;
      next({
        name: "SectorSurvey",
        params: { galaxyId },
        query: { error: "invalid-sector" },
      });
      return;
    }
  }

  // Check system requirement
  if (requirements.includes("system")) {
    const systemId = to.params.systemId;
    const isValid = await validateSystem(systemId);
    if (!isValid) {
      // Redirect to GalaxySurvey with error
      next({ name: "GalaxySurvey", query: { error: "invalid-system" } });
      return;
    }
  }

  next();
});

export default router;
