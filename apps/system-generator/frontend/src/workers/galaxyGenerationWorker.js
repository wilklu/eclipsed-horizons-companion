import { generateGalaxySectorBatch } from "../utils/galaxyGenerationBatch.js";

self.onmessage = (event) => {
  const { requestId, mode, galaxy, sectors } = event.data || {};

  try {
    const result = generateGalaxySectorBatch({
      mode,
      galaxy,
      sectors,
    });

    self.postMessage({
      requestId,
      ok: true,
      result,
    });
  } catch (error) {
    self.postMessage({
      requestId,
      ok: false,
      error: String(error?.message || error || "Galaxy generation worker failed."),
    });
  }
};
