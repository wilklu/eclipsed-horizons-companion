import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./pages/Dashboard.vue";
import GenerateSystem from "./pages/GenerateSystem.vue";
import SystemEditor from "./pages/SystemEditor.vue";

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
