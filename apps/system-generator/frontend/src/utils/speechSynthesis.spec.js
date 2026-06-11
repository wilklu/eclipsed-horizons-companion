/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSpeechSynthesisSupported, speakTextWithPreferences, stopSpeechSynthesis } from "./speechSynthesis.js";

describe("speech synthesis helpers", () => {
  let synth;

  beforeEach(() => {
    synth = {
      cancel: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn(() => [{ voiceURI: "voice-1", name: "Test Voice", lang: "en-US", default: true }]),
      speak: vi.fn(),
    };

    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      writable: true,
      value: synth,
    });
  });

  afterEach(() => {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  it("treats missing utterance support as unavailable", () => {
    expect(isSpeechSynthesisSupported()).toBe(false);

    const result = speakTextWithPreferences("Atlas voice check", {
      rate: 1,
      pitch: 1,
      voiceURI: "voice-1",
    });

    expect(result.ok).toBe(false);
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it("uses the browser utterance constructor and resumes speech playback", () => {
    window.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.rate = 1;
        this.pitch = 1;
        this.voice = null;
      }
    };

    const result = speakTextWithPreferences("Atlas voice check", {
      rate: 2,
      pitch: 0.1,
      voiceURI: "voice-1",
    });

    expect(result.ok).toBe(true);
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(synth.resume).toHaveBeenCalledTimes(1);
    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect(result.utterance.text).toBe("Atlas voice check");
    expect(result.utterance.rate).toBe(1.5);
    expect(result.utterance.pitch).toBe(0.5);
    expect(result.utterance.voice?.voiceURI).toBe("voice-1");
  });

  it("stops active playback safely", () => {
    stopSpeechSynthesis();
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });
});
