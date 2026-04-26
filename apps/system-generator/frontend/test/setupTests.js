import { config } from "@vue/test-utils";
import { vi } from "vitest";

// Global component stubs for router elements
config.global = config.global || {};
config.global.components = {
  ...(config.global.components || {}),
  "router-link": { template: "<a><slot /></a>" },
  "router-view": { template: "<div><slot /></div>" },
};

// Mock vue-router composables and components used in components under test
vi.mock("vue-router", async () => {
  return {
    useRoute: () => ({ query: {}, params: {}, name: undefined }),
    useRouter: () => ({ push: () => {}, replace: () => {} }),
    onBeforeRouteLeave: (fn) => {
      // stub: do nothing; return noop
      return () => {};
    },
    RouterLink: { template: "<a><slot /></a>" },
    RouterView: { template: "<div><slot /></div>" },
  };
});
