<template>
  <Teleport to="body" v-if="isOpen">
    <div class="confirm-dialog-overlay" @click="handleBackdropClick">
      <div class="confirm-dialog-box">
        <div class="confirm-dialog-header">
          <h2>{{ title }}</h2>
        </div>
        <div class="confirm-dialog-body">
          <p>{{ message }}</p>
        </div>
        <div class="confirm-dialog-footer">
          <button class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
          <button class="btn btn-primary" @click="$emit('confirm')">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Confirm",
  },
  message: {
    type: String,
    default: "Are you sure?",
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
});

const emit = defineEmits(["confirm", "cancel"]);

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    emit("cancel");
  }
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8000;
}

.confirm-dialog-box {
  background: #0f172f;
  border: 1px solid #2c4a78;
  border-radius: 12px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.confirm-dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #1e3a5f;
}

.confirm-dialog-header h2 {
  margin: 0;
  color: #e5e7eb;
  font-size: 1.25rem;
}

.confirm-dialog-body {
  padding: 1.5rem;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.confirm-dialog-body p {
  margin: 0;
}

.confirm-dialog-footer {
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  border-top: 1px solid #1e3a5f;
}

.btn {
  border: none;
  border-radius: 6px;
  padding: 0.625rem 1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background: #2f8fd0;
  color: #f0f7ff;
}

.btn-primary:hover {
  background: #2074b0;
}

.btn-secondary {
  background: #1e3a5f;
  color: #cbd5e1;
}

.btn-secondary:hover {
  background: #2a4a70;
}
</style>
