import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./pages/Dashboard.vue";
import GenerateSystem from "./pages/GenerateSystem.vue";
import SystemEditor from "./pages/SystemEditor.vue";
import StellarSurveyScanner from "./pages/StellarSurveyScanner.vue";

// Survey Pages
import SectorSurvey from "./pages/surveys/SectorSurvey.vue"; // Class 0
import StellarSurvey from "./pages/surveys/StellarSurvey.vue"; // Class I
import SystemSurvey from "./pages/surveys/SystemSurvey.vue"; // Class II System
import PlanetoidSurvey from "./pages/surveys/PlanetoidSurvey.vue"; // Class II World
import PhysicalSurvey from "./pages/surveys/PhysicalSurvey.vue"; // Class III
import CensusSurvey from "./pages/surveys/CensusSurvey.vue"; // Class IV

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
    meta: { title: "Eclipsed Horizon - Dashboard" },
  },
  {
    path: "/generate",
    name: "GenerateSystem",
    component: GenerateSystem,
    meta: { title: "Eclipsed Horizon - Generate System" },
  },
  {
    path: "/system/:id",
    name: "SystemEditor",
    component: SystemEditor,
    meta: { title: "Eclipsed Horizon - Edit System" },
  },
  {
    path: "/scanner",
    name: "StellarSurveyScanner",
    component: StellarSurveyScanner,
    meta: { title: "Eclipsed Horizon - Stellar Survey Scanner" },
  },

  // Survey Routes - Hierarchical Flow
  {
    path: "/survey/class-0",
    name: "SectorSurvey",
    component: SectorSurvey,
    meta: { title: "Class 0 - Sector Survey", surveyClass: 0 },
  },
  {
    path: "/survey/class-1/:systemId?",
    name: "StellarSurvey",
    component: StellarSurvey,
    meta: { title: "Class I - Stellar Survey", surveyClass: 1 },
  },
  {
    path: "/survey/class-2-system/:systemId",
    name: "SystemSurvey",
    component: SystemSurvey,
    meta: { title: "Class II - System Survey", surveyClass: 2 },
  },
  {
    path: "/survey/class-2-planetoid/:systemId/:planetId",
    name: "PlanetoidSurvey",
    component: PlanetoidSurvey,
    meta: { title: "Class II - Planetoid Survey", surveyClass: 2 },
  },
  {
    path: "/survey/class-3/:systemId/:planetId",
    name: "PhysicalSurvey",
    component: PhysicalSurvey,
    meta: { title: "Class III - Physical Survey", surveyClass: 3 },
  },
  {
    path: "/survey/class-4/:systemId/:planetId",
    name: "CensusSurvey",
    component: CensusSurvey,
    meta: { title: "Class IV - Census Survey", surveyClass: 4 },
  },

  // Catch all 404s (must be last)
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
