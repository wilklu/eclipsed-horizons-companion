export const DEFAULT_ART_STYLE = "Field Guide";
export const ART_STYLE_PRESETS = ["Field Guide", "Concept Art", "Portrait", "Scientific Plate"];

const STYLE_DESCRIPTORS = {
  "Field Guide":
    "clean field-guide presentation, specimen-focused composition, naturalistic detail, neutral background",
  "Concept Art": "cinematic sci-fi concept art, dramatic lighting, rich atmosphere, highly detailed rendering",
  Portrait: "hero portrait framing, expressive lighting, subject-forward composition, polished illustrative finish",
  "Scientific Plate":
    "museum-quality scientific plate, balanced studio lighting, taxonomy-friendly presentation, minimal background noise",
};

function clampDimension(value, fallback = 768) {
  const parsed = Number(value);
  const resolved = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(1536, Math.max(512, Math.round(resolved)));
}

export function buildConceptArtPrompt(basePrompt, { entityType = "subject", style = DEFAULT_ART_STYLE } = {}) {
  const normalizedPrompt = String(basePrompt || "").trim();
  const normalizedType =
    String(entityType || "subject")
      .trim()
      .toLowerCase() || "subject";
  const normalizedStyle = ART_STYLE_PRESETS.includes(style) ? style : DEFAULT_ART_STYLE;
  const descriptor = STYLE_DESCRIPTORS[normalizedStyle] || STYLE_DESCRIPTORS[DEFAULT_ART_STYLE];

  if (!normalizedPrompt) {
    return "";
  }

  return `${normalizedPrompt} Create a ${normalizedType} illustration in a ${normalizedStyle.toLowerCase()} style with ${descriptor}. No text, watermark, logos, borders, or captions.`;
}

export function buildConceptArtUrl(
  basePrompt,
  { entityType = "subject", style = DEFAULT_ART_STYLE, seed = "", width = 1024, height = 1024 } = {},
) {
  const prompt = buildConceptArtPrompt(basePrompt, { entityType, style });
  if (!prompt) {
    return "";
  }

  const params = new URLSearchParams({
    width: String(clampDimension(width, 1024)),
    height: String(clampDimension(height, 1024)),
    model: "flux",
    nologo: "true",
  });

  const normalizedSeed = String(seed || "").trim();
  if (normalizedSeed) {
    params.set("seed", normalizedSeed);
  }

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}
