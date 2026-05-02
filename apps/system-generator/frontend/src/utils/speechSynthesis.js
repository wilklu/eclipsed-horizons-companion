function resolveSpeechSynthesis() {
  if (typeof window === "undefined") {
    return null;
  }

  const synth = window.speechSynthesis;
  return synth && typeof synth.speak === "function" ? synth : null;
}

function clampVoiceSetting(value, fallback = 1) {
  const parsed = Number(value);
  const resolved = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(1.5, Math.max(0.5, resolved));
}

export function isSpeechSynthesisSupported() {
  return Boolean(resolveSpeechSynthesis() && typeof window.SpeechSynthesisUtterance === "function");
}

export function getSpeechSynthesisVoices() {
  const synth = resolveSpeechSynthesis();
  if (!synth || typeof synth.getVoices !== "function") {
    return [];
  }

  try {
    const voices = synth.getVoices();
    return Array.isArray(voices) ? voices : [];
  } catch {
    return [];
  }
}

export function stopSpeechSynthesis() {
  const synth = resolveSpeechSynthesis();
  if (!synth || typeof synth.cancel !== "function") {
    return false;
  }

  try {
    synth.cancel();
    return true;
  } catch {
    return false;
  }
}

export function speakTextWithPreferences(text, { rate = 1, pitch = 1, voiceURI = "", onEnd, onError } = {}) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) {
    return { ok: false, reason: "empty" };
  }

  if (!isSpeechSynthesisSupported()) {
    return { ok: false, reason: "unsupported" };
  }

  const synth = resolveSpeechSynthesis();
  if (!synth) {
    return { ok: false, reason: "unsupported" };
  }

  try {
    if (typeof synth.cancel === "function") {
      synth.cancel();
    }
    if (typeof synth.resume === "function") {
      synth.resume();
    }

    const utterance = new window.SpeechSynthesisUtterance(normalizedText);
    utterance.rate = clampVoiceSetting(rate, 1);
    utterance.pitch = clampVoiceSetting(pitch, 1);

    const preferredVoiceURI = String(voiceURI || "").trim();
    if (preferredVoiceURI) {
      const voice = getSpeechSynthesisVoices().find((entry) => entry.voiceURI === preferredVoiceURI);
      if (voice) {
        utterance.voice = voice;
        if (voice.lang) {
          utterance.lang = voice.lang;
        }
      }
    }

    utterance.onend = (event) => {
      onEnd?.(event);
    };
    utterance.onerror = (event) => {
      onError?.(event);
    };

    synth.speak(utterance);
    return { ok: true, utterance };
  } catch (error) {
    onError?.(error);
    return { ok: false, reason: "error", error };
  }
}
