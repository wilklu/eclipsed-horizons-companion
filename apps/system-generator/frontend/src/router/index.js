import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "GalaxySurvey",
    component: () => import("../pages/surveys/GalaxySurvey.vue"),
  },
  {
    path: "/sector/:galaxyId",
    name: "SectorSurvey",
    component: () => import("../pages/surveys/SectorSurvey.vue"),
    props: true,
  },
  {
    path: "/sector/:galaxyId/star-system/:sectorId?",
    name: "StarSystemBuilder",
    component: () => import("../pages/surveys/StarSystemBuilder.vue"),
    props: true,
  },
  {
    path: "/world-builder/:systemId?",
    name: "WorldBuilder",
    component: () => import("../pages/surveys/WorldBuilder.vue"),
    props: true,
  },
  {
    path: "/sophont-generator",
    name: "SophontGenerator",
    component: () => import("../pages/surveys/SophontGenerator.vue"),
  },
  {
    path: "/creature-generator",
    name: "CreatureGenerator",
    component: () => import("../pages/surveys/CreatureGenerator.vue"),
  },
  {
    path: "/history-generator",
    name: "HistoryGenerator",
    component: () => import("../pages/surveys/HistoryGenerator.vue"),
  },
  {
    path: "/character-generator",
    name: "CharacterGenerator",
    component: () => import("../pages/surveys/CharacterGenerator.vue"),
  },
  {
    path: "/session-planner",
    name: "SessionPlanner",
    component: () => import("../pages/surveys/SessionPlanner.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
