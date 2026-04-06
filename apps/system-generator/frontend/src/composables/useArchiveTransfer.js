import { computed, ref, unref } from "vue";

function resolveValue(value) {
  return typeof value === "function" ? value() : unref(value);
}

function createInitialState(statusPrefix, noun) {
  return {
    active: false,
    tone: "sync",
    stateLabel: "ARCHIVE PACKAGING",
    statusCode: `${statusPrefix}-XFER`,
    message: `Preparing ${noun.toLowerCase()} archive...`,
    progress: 0,
  };
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useArchiveTransfer({
  context = "generic",
  noun = "Archive",
  title = `${noun} Export In Progress`,
  barLabel = `Packaging ${noun.toLowerCase()} archive for transfer`,
  statusPrefix = "ARCH",
  targetLabel,
} = {}) {
  const state = ref(createInitialState(statusPrefix, noun));

  const resolvedTargetLabel = computed(() => String(resolveValue(targetLabel) || "Archive target pending"));
  const progressMeta = computed(() => `${Math.round(Number(state.value.progress) || 0)}% packaged`);
  const diagnostics = computed(() => [
    { label: noun, value: resolvedTargetLabel.value },
    { label: "Stage", value: state.value.stateLabel || "ARCHIVE PACKAGING" },
    { label: "Progress", value: `${Math.round(Number(state.value.progress) || 0)}%` },
  ]);
  const ledger = computed(() => [`${noun} Export`, resolvedTargetLabel.value, state.value.message]);
  const overlayProps = computed(() => ({
    isVisible: state.value.active,
    context,
    tone: state.value.tone,
    kicker: "Archive Relay",
    stateLabel: state.value.stateLabel,
    title,
    message: state.value.message,
    barLabel,
    statusCode: state.value.statusCode,
    diagnostics: diagnostics.value,
    ledger: ledger.value,
    progressCurrent: state.value.progress,
    progressTotal: 100,
    progressPercent: state.value.progress,
    progressMeta: progressMeta.value,
  }));

  function reset() {
    state.value = createInitialState(statusPrefix, noun);
  }

  async function exportJson({
    data,
    filename,
    serializeMessage = `Serializing ${noun.toLowerCase()} manifest...`,
    encodeMessage = `Encoding ${noun.toLowerCase()} archive for transfer...`,
    readyMessage = `${noun} archive staged for local transfer.`,
    serializingProgress = 24,
    encodingProgress = 70,
  } = {}) {
    const resolvedData = resolveValue(data);
    const resolvedFilename = resolveValue(filename);

    if (!resolvedData || !resolvedFilename || state.value.active) {
      return false;
    }

    try {
      state.value = {
        active: true,
        tone: "sync",
        stateLabel: "ARCHIVE PACKAGING",
        statusCode: `${statusPrefix}-XFER`,
        message: serializeMessage,
        progress: serializingProgress,
      };
      await delay(120);

      const payload = JSON.stringify(resolvedData, null, 2);
      state.value = {
        ...state.value,
        message: encodeMessage,
        progress: encodingProgress,
      };
      await delay(120);

      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resolvedFilename;

      state.value = {
        active: true,
        tone: "ready",
        stateLabel: "TRANSFER READY",
        statusCode: `${statusPrefix}-READY`,
        message: readyMessage,
        progress: 100,
      };
      await delay(120);

      link.click();
      URL.revokeObjectURL(url);
      return true;
    } finally {
      await delay(180);
      reset();
    }
  }

  return {
    state,
    overlayProps,
    exportJson,
    reset,
  };
}
