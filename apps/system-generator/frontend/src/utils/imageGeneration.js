export const DEFAULT_ART_STYLE = "Field Guide";
export const ART_STYLE_PRESETS = [
  // Standard
  "Field Guide",
  "Concept Art",
  "Portrait",
  "Scientific Plate",
  "Anatomy Diagram",
  "Size Comparison",

  // VTT & Tabletop
  "Top-Down Token",
  "Isometric VTT Token",
  "Pixel Art Token",

  // Reference & Publishing
  "Reference Manual",
  "Archival Scan",
  "Textbook Figure",
  "Color Study Swatch",

  // Specialty & Flavor
  "Herbarium Plate",
  "X-Ray Radiograph",
  "Cross-Section Cutaway",
  "Tarot Oracle Card",
  "Vintage Woodcut Print",
  "Glowing Aura Ethereal",
  "Blueprint Schematic",
  "Staged Habitat Diorama",
  "Specimen Field Sketch",
  "Landscape Vignette",
  "Environment Study",
  "Habitat Cross-Section",
  "Book Cover",
  "March of Progress",
];

const MAX_PROMPT_CHARS = 1200;

const STYLE_DESCRIPTORS = {
  "Field Guide":
    "clean field-guide presentation, specimen-focused composition centered in frame, naturalistic fine detail on texture and form, neutral muted background (off-white or pale beige), even diffused lighting with soft shadows to highlight surface features, shallow depth of field, high-resolution botanical specimen photography style",
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
  "Top-Down Token":
    "top-down orthographic view, subject positioned on a transparent or grid-friendly dark circular base, clear silhouette readability at small scale (100–200 px), consistent orientation with front facing upward, flat even lighting with subtle directional shadow, polished for VTT token circular frame overlay, no text",
  "Isometric VTT Token":
    "isometric ¾ view perspective, subject occupying 60–70% of a square frame with rounded corners, strong silhouette contrast against transparent background, subtle ground shadow beneath feet for positioning clarity, consistent camera angle across all subjects, premium virtual tabletop token presentation",
  "Pixel Art Token":
    "pixel art style at 64×64 base resolution, clean readable silhouette with minimal anti-aliasing, distinct color zones for quick identification at tabletop scale, subject centered on transparent background with subtle drop shadow, retro RPG token aesthetic, crisp pixel-edge rendering with no blur",
  "Herbarium Plate":
    "pressed specimen herbarium plate, subject mounted on archival cream paper with visible fiber texture and museum accession label corner, flattened orthographic presentation preserving full structural detail, specimen tape or pin marks visible, soft raking light revealing surface topography, botanical archive photography",
  "X-Ray / Radiograph":
    "medical radiograph style, specimen floating on deep blue-black field with cyan or cold-white glow revealing internal structure, semi-transparent layered skeletal and tissue rendering, clinical radiology lighting, grayscale with subtle cool color cast, diagnostic imaging aesthetic",
  "Cross-Section Cutaway":
    "technical cutaway view revealing internal anatomical structure, one-quarter to one-half of exterior shell or skin removed, clean surgical separation plane with visible layer boundaries, label-ready guide lines, specimen on neutral light table surface, exploded technical diagram quality",
  "Tarot / Oracle Card":
    "tarot-card framing, vertical 5:7 aspect ratio, subject centrally positioned within ornate bordered frame, rich jewel-tone color palette, stylized symbolic background elements integrated behind subject, decorative but legible, premium oracle card illustration style",
  "Vintage Woodcut Print":
    "antique woodcut engraving style, bold black linework with crosshatch texture, subject isolated on aged parchment-toned paper with deckle edge, high-contrast monochrome, historical naturalist field sketch aesthetic, 18th-century zoological print reproduction",
  "Glowing Aura / Ethereal":
    "ethereal otherworldly presentation, subject silhouetted against dark background with ambient colored glow emanating from within or around edges, soft bioluminescent light scattering, translucent aura extending slightly beyond silhouette, high contrast between dark surround and luminous subject, mystical specimen photography",
  "Blueprint Schematic":
    "blueprint diagram style, specimen rendered in cyan lines on dark blue field, orthogonal views (front, side, top) arranged on grid, measurement callouts and structural annotations, technical drafting aesthetic, clean vector-line rendering with no fill",
  "Reference Manual":
    "clean reference manual illustration, specimen isolated on white or off-white page with generous margins, crisp edge-to-edge clarity with no background noise, even flat lighting optimized for print reproduction, consistent scale and orientation across all manual entries, natural history encyclopedia illustration quality, plate-style presentation suited for inset text wrapping or full-page format",

  "Color Study Swatch":
    "color reference study, specimen presented on a neutral gray (18%) card alongside a calibrated color swatch strip and subtle scale reference, clinical even lighting with color-checker accuracy, documentation photography style optimized for color grading reference, gray-balanced background",

  "Staged Habitat Diorama":
    "natural history diorama presentation, specimen integrated into a minimalist habitat setting occupying lower third of frame, soft natural daylight from upper left, realistic environmental context with muted natural palette, museum habitat diorama photography, shallow field with atmospheric background blur suggesting natural environment without distracting",

  "Specimen Field Sketch":
    "field researcher ink-and-wash sketch, hand-drawn quality with visible brush strokes and ink linework, specimen rendered in earthy monochrome or sepia tones on cream paper texture, looser than scientific plate but structurally accurate, annotated-study aesthetic, naturalist's field journal style",

  "Archival Scan":
    "high-resolution archival flatbed scan, specimen pressed directly on scanner glass producing crisp detail with subtle light bleed at edges, no depth-of-field, perfectly even focus across entire specimen, digital curation standard, raw-documentation aesthetic",

  TextbookFigure:
    "textbook diagram figure, subject clearly delineated with subtle key-line border, color-coded regions or structures for callout reference, clean white background with figure number placeholder space in lower-right, consistent styling for multi-figure plate layout, educational publishing quality",
  "Landscape Vignette":
    "horizontal landscape vignette, specimen or subject integrated into natural environment at roughly 16:9 aspect ratio, soft atmospheric backdrop with subject occupying lower-center third, warm ambient environmental lighting, environmental storytelling composition suitable for chapter header or encounter backdrop, premium field guide photography style",

  "Environment Study":
    "environment concept study, wide horizontal composition emphasizing habitat and atmosphere, subject present but secondary to setting, cinematic lighting with depth-of-field layering (foreground/midground/background), rich color grading, immersive worldbuilding illustration quality",

  "Habitat Cross-Section":
    "cross-section habitat diagram, vertical slice through terrain showing above-ground and below-ground or underwater layers, stratified environment with labeled zones, flora and fauna positioned within appropriate layers, clean scientific diagram style on light background, educational natural science illustration",

  "Book Cover":
    "book cover framing, vertical or horizontal 2:3 ratio, specimen as hero subject silhouetted against atmospheric textured background, dramatic single-source lighting, embossed-title negative space on upper or lower third, premium natural history publication cover style, high-contrast focal composition",
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
