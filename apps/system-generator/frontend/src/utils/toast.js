import { getActivePinia } from "pinia";
import { useToastStore } from "../stores/toastStore.js";

function getStore() {
  try {
    const pinia = getActivePinia();
    if (!pinia) return null;
    return useToastStore(pinia);
  } catch {
    return null;
  }
}

export function info(message) {
  console.info("[INFO]", message);
  getStore()?.addToast(message, "info");
}

export function success(message) {
  console.log("[SUCCESS]", message);
  getStore()?.addToast(message, "success");
}

export function warning(message) {
  console.warn("[WARNING]", message);
  getStore()?.addToast(message, "warning");
}

export function error(message) {
  console.error("[ERROR]", message);
  getStore()?.addToast(message, "error", 6000);
}
