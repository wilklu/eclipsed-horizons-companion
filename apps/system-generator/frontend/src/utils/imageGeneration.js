export const DEFAULT_ART_STYLE = "Field Guide";
export const ART_STYLE_PRESETS = [
  "Field Guide",
  "Concept Art",
  "Portrait",
  "Scientific Plate",
  "Anatomy Diagram",
  "Size Comparison",
  "March of Progress",
];
const MAX_PROMPT_CHARS = 700;

const STYLE_DESCRIPTORS = {
  "Field Guide":
    "clean field-guide presentation, specimen-focused composition, naturalistic detail, neutral background",
  "Concept Art": "cinematic sci-fi concept art, dramatic lighting, rich atmosphere, highly detailed rendering",
  Portrait: "hero portrait framing, expressive lighting, subject-forward composition, polished illustrative finish",
  "Scientific Plate":
    "museum-quality scientific plate, balanced studio lighting, taxonomy-friendly presentation, minimal background noise",
  "Anatomy Diagram":
    "technical anatomy diagram framing, cutaway and labeled-region friendly composition, high structural clarity, clean neutral background",
  "Size Comparison":
    "side-by-side scale comparison, include an average human (1.8 m) silhouette or scale bar for reference, clear perspective and neutral background, no text",
  "March of Progress":
    "museum poster style evolution sequence, left-to-right chronological panels showing progressive morphological change, consistent lighting and scale across panels, no text or captions",
};

function seededIntInRange(seed, min = 6, max = 10) {
  if (!seed) return Math.floor(Math.random() * (max - min + 1)) + min;
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  const v = Math.abs(h >>> 0);
  return min + (v % (max - min + 1));
}

function clampDimension(value, fallback = 768) {
  const parsed = Number(value);
  const resolved = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(1536, Math.max(512, Math.round(resolved)));
}

function clampPromptLength(prompt) {
  const normalized = String(prompt || "").trim();
  if (!normalized) {
    return "";
  }

  if (normalized.length <= MAX_PROMPT_CHARS) {
    return normalized;
  }

  const slice = normalized.slice(0, MAX_PROMPT_CHARS);
  const cut = slice.lastIndexOf(" ");
  const compact = (cut > 120 ? slice.slice(0, cut) : slice).trim();
  return `${compact}.`;
}

export function buildConceptArtPrompt(
  basePrompt,
  { entityType = "subject", style = DEFAULT_ART_STYLE, seed = "", sequenceLength } = {},
) {
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

  // Special cases for some styles
  if (normalizedStyle === "Size Comparison") {
    return clampPromptLength(
      `${normalizedPrompt} Create a ${normalizedType} size-comparison illustration showing the subject next to an average human (1.8 m) for scale, side-by-side composition with a clear scale marker and neutral background. No text, watermark, logos, borders, or captions.`,
    );
  }

  if (normalizedStyle === "March of Progress") {
    const count = typeof sequenceLength === "number" ? sequenceLength : seededIntInRange(String(seed || ""), 6, 10);
    return clampPromptLength(
      `${normalizedPrompt} Create a museum-style 'March of Progress' evolution poster showing ${count} sequential stages of evolution from a primitive ancestor to a modern sophont. Arrange figures left-to-right in distinct panels, maintain consistent scale and lighting across stages, ensure progressive morphological changes are clear. No text, captions, watermarks, or logos.`,
    );
  }

  return clampPromptLength(
    `${normalizedPrompt} Create a ${normalizedType} illustration in a ${normalizedStyle.toLowerCase()} style with ${descriptor}. No text, watermark, logos, borders, or captions.`,
  );
}

export function buildConceptArtUrl(
  basePrompt,
  { entityType = "subject", style = DEFAULT_ART_STYLE, seed = "", width = 1024, height = 1024, sequenceLength } = {},
) {
  const prompt = buildConceptArtPrompt(basePrompt, { entityType, style, seed, sequenceLength });
  if (!prompt) {
    return "";
  }

  // Adjust defaults for special styles
  let finalWidth = width;
  let finalHeight = height;
  if (style === "March of Progress") {
    finalWidth = Math.max(width, 1536);
    finalHeight = Math.max(height, 768);
  }

  const params = new URLSearchParams({
    width: String(clampDimension(finalWidth, 1024)),
    height: String(clampDimension(finalHeight, 1024)),
    model: "flux",
    nologo: "true",
  });

  const normalizedSeed = String(seed || "").trim();
  if (normalizedSeed) {
    params.set("seed", normalizedSeed);
  }

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}
