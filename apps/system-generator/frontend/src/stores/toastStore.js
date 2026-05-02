import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);
  let nextId = 1;

  function addToast(message, type = "info", duration = 4000) {
    const id = nextId++;
    toasts.value.push({ id, message: String(message || ""), type });
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }

  function remove(id) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx >= 0) toasts.value.splice(idx, 1);
  }

  return { toasts, addToast, remove };
});
