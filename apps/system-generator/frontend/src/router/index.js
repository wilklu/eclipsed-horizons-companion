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
  },
  {
    path: "/galaxy",
    alias: ["/galaxy-survey"],
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
    path: "/orbital/:galaxyId/:sectorId?",
    name: "OrbitalView",
    component: () => import("../pages/surveys/OrbitalView.vue"),
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
    component: () => import("../pages/surveys/SurveyUnavailable.vue"),
    meta: { title: "Sophont Generator" },
  },
  {
    path: "/creature-generator",
    name: "CreatureGenerator",
    component: () => import("../pages/surveys/SurveyUnavailable.vue"),
    meta: { title: "Creature Generator" },
  },
  {
    path: "/history-generator",
    name: "HistoryGenerator",
    component: () => import("../pages/surveys/SurveyUnavailable.vue"),
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
