/**
 * Simple toast notification management
 * Using a simple event-based system without external dependencies
 */

const toastStack = [];
const listeners = new Set();

class Toast {
  constructor(message, type = "info", duration = 3000) {
    this.id = Date.now() + Math.random();
    this.message = message;
    this.type = type; // 'success', 'error', 'info', 'warning'
    this.duration = duration;
    this.progress = 100;
  }

  remove() {
    const index = toastStack.indexOf(this);
    if (index !== -1) {
      toastStack.splice(index, 1);
      this.notifyListeners();
    }
  }

  notifyListeners() {
    listeners.forEach((listener) => listener(toastStack));
  }
}

function addToast(message, type = "info", duration = 3000) {
  const toast = new Toast(message, type, duration);
  toastStack.push(toast);
  listeners.forEach((listener) => listener(toastStack));

  if (duration > 0) {
    setTimeout(() => {
      toast.remove();
    }, duration);
  }

  return toast;
}

function success(message, duration = 3000) {
  return addToast(message, "success", duration);
}

function error(message, duration = 4000) {
  return addToast(message, "error", duration);
}

function info(message, duration = 3000) {
  return addToast(message, "info", duration);
}

function warning(message, duration = 3000) {
  return addToast(message, "warning", duration);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export { addToast, success, error, info, warning, subscribe };
