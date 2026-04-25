export const SUBSECTOR_LETTERS = Object.freeze([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
]);

export function normalizeSubsectorLetter(value, fallback = "A") {
  const normalized = String(value || "")
    .trim()
    .charAt(0)
    .toUpperCase();
  return SUBSECTOR_LETTERS.includes(normalized) ? normalized : fallback;
}

export function getSubsectorViewportBounds(letter) {
  const safeLetter = normalizeSubsectorLetter(letter);
  const index = Math.max(0, SUBSECTOR_LETTERS.indexOf(safeLetter));
  const gridColumn = index % 4;
  const gridRow = Math.floor(index / 4);

  return {
    colStart: gridColumn * 8 + 1,
    colEnd: gridColumn * 8 + 8,
    rowStart: gridRow * 10 + 1,
    rowEnd: gridRow * 10 + 10,
  };
}

export function getSubsectorLetterForHex(x, y) {
  const safeX = Math.min(32, Math.max(1, Math.trunc(Number(x) || 1)));
  const safeY = Math.min(40, Math.max(1, Math.trunc(Number(y) || 1)));
  const gridColumn = Math.min(3, Math.max(0, Math.floor((safeX - 1) / 8)));
  const gridRow = Math.min(3, Math.max(0, Math.floor((safeY - 1) / 10)));
  return SUBSECTOR_LETTERS[gridRow * 4 + gridColumn] || "A";
}
