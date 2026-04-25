import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: { name: "TravellerAtlas" },
  },
  {
    path: "/atlas",
    alias: ["/traveller-atlas", "/traveller-map"],
    name: "TravellerAtlas",
    component: () => import("../pages/surveys/TravellerMap.vue"),
    meta: { title: "Traveller Atlas" },
  },
  {
    path: "/galaxy",
    alias: ["/galaxy-survey"],
    name: "GalaxySurvey",
    component: () => import("../pages/surveys/GalaxySurvey.vue"),
    meta: { title: "Galaxy Survey" },
  },
  {
    path: "/sector/:galaxyId",
    name: "SectorSurvey",
    component: () => import("../pages/surveys/SectorSurvey.vue"),
    props: (route) => ({ ...route.params, viewMode: "sector" }),
    meta: { title: "Sector Survey" },
  },
  {
    path: "/subsector/:galaxyId",
    name: "SubsectorSurvey",
    component: () => import("../pages/surveys/SectorSurvey.vue"),
    props: (route) => ({ ...route.params, viewMode: "subsector" }),
    meta: { title: "Subsector Survey" },
  },
  {
    path: "/sector/:galaxyId/star-system/:sectorId?",
    name: "StarSystemBuilder",
    component: () => import("../pages/surveys/StarSystemBuilder.vue"),
    props: true,
    meta: { title: "System Survey" },
  },
  {
    path: "/orbital/:galaxyId/:sectorId?",
    name: "OrbitalView",
    component: () => import("../pages/surveys/OrbitalView.vue"),
    props: true,
    meta: { title: "Orbital View" },
  },
  {
    path: "/system-survey/:galaxyId?/:sectorId?/:systemId?",
    name: "SystemSurvey",
    component: () => import("../pages/surveys/SystemSurvey.vue"),
    props: true,
    meta: { title: "System Survey" },
  },
  {
    path: "/world-builder/:systemId?",
    name: "WorldBuilder",
    component: () => import("../pages/surveys/WorldBuilder.vue"),
    props: true,
    meta: { title: "World Survey" },
  },
  {
    path: "/world-physical-survey/:systemId?/:worldIndex?",
    name: "WorldPhysicalSurvey",
    component: () => import("../pages/surveys/WorldPhysicalSurvey.vue"),
    props: true,
    meta: { title: "World Physical Survey" },
  },
  {
    path: "/sophont-generator",
    name: "SophontGenerator",
    component: () => import("../pages/surveys/SophontGenerator.vue"),
    meta: { title: "Sophont Generator" },
  },
  {
    path: "/fauna-generator",
    alias: ["/creature-generator"],
    name: "CreatureGenerator",
    component: () => import("../pages/surveys/CreatureGenerator.vue"),
    meta: { title: "Fauna Generator" },
  },
  {
    path: "/flora-generator",
    name: "FloraGenerator",
    component: () => import("../pages/surveys/FloraGenerator.vue"),
    meta: { title: "Flora Generator" },
  },
  {
    path: "/history-generator",
    name: "HistoryGenerator",
    component: () => import("../pages/surveys/HistoryGenerator.vue"),
    meta: { title: "History Generator" },
  },
  {
    path: "/character-generator",
    name: "CharacterGenerator",
    component: () => import("../pages/surveys/SurveyUnavailable.vue"),
    meta: { title: "Character Generator" },
  },
  {
    path: "/session-planner",
    name: "SessionPlanner",
    component: () => import("../pages/surveys/SurveyUnavailable.vue"),
    meta: { title: "Session Planner" },
  },
  {
    path: "/preferences",
    name: "Preferences",
    component: () => import("../pages/surveys/PreferencesView.vue"),
    meta: { title: "Preferences" },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
