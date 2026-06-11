import { describe, expect, it } from "vitest";
import { ART_STYLE_PRESETS, buildConceptArtPrompt, buildConceptArtUrl } from "./imageGeneration.js";

describe("imageGeneration", () => {
  it("builds a styled concept-art prompt from the base prompt", () => {
    const prompt = buildConceptArtPrompt("Detailed botanical concept art of Ionan Bloom", {
      entityType: "flora",
      style: "Field Guide",
    });

    expect(ART_STYLE_PRESETS).toContain("Field Guide");
    expect(prompt).toContain("Detailed botanical concept art of Ionan Bloom");
    expect(prompt.toLowerCase()).toContain("field guide");
  });

  it("builds a remote preview url using the prompt and seed", () => {
    const url = buildConceptArtUrl("Detailed sci-fi flora portrait", {
      seed: "flora-1234",
      width: 768,
      height: 768,
    });

    expect(url).toContain("https://image.pollinations.ai/prompt/");
    expect(url).toContain("seed=flora-1234");
    expect(decodeURIComponent(url)).toContain("Detailed sci-fi flora portrait");
  });
});
