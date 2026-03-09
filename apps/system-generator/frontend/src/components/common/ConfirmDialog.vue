<template>
  <teleport to="body">
    <div v-if="isOpen" class="confirm-overlay">
      <div class="confirm-dialog">
        <div class="dialog-header">
          <h2>{{ title }}</h2>
          <button class="dialog-close" @click="onCancel">✕</button>
        </div>
        <div class="dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="onCancel">Cancel</button>
          <button class="btn btn-danger" @click="onConfirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Confirm Action",
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
});

defineEmits(["confirm", "cancel"]);
</script>

<script>
export function useConfirmDialog() {
  const isOpen = ref(false);
  const dialogConfig = ref({
    title: "Confirm Action",
    message: "",
    confirmText: "Confirm",
  });
  let resolvePromise;

  const confirm = (config) => {
    return new Promise((resolve) => {
      dialogConfig.value = { ...dialogConfig.value, ...config };
      isOpen.value = true;
      resolvePromise = resolve;
    });
  };

  const onConfirm = () => {
    isOpen.value = false;
    resolvePromise?.(true);
  };

  const onCancel = () => {
    isOpen.value = false;
    resolvePromise?.(false);
  };

  return {
    isOpen,
    dialogConfig,
    confirm,
    onConfirm,
    onCancel,
  };
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9997;
}

.confirm-dialog {
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #333;
}

.dialog-header h2 {
  margin: 0;
  color: #00d9ff;
  font-size: 1.25rem;
}

.dialog-close {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
  line-height: 1;
  transition: color 0.2s ease;
}

.dialog-close:hover {
  color: #fff;
}

.dialog-body {
  padding: 1.5rem;
  color: #e0e0e0;
}

.dialog-body p {
  margin: 0;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #333;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #444;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #555;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
}

.btn-danger:hover {
  background: #b91c1c;
}
</style>
