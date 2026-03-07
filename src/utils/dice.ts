/**
 * Roll xDy + modifier and return the result.
 */
export function roll(dice: number, sides: number, modifier = 0): number {
  let total = modifier;
  for (let i = 0; i < dice; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

/** Roll 2d6 */
export function roll2d6(modifier = 0): number {
  return roll(2, 6, modifier);
}

/** Roll 1d6 */
export function roll1d6(modifier = 0): number {
  return roll(1, 6, modifier);
}

/** Pick a random element from an array */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick multiple unique elements from an array */
export function pickUnique<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr];
  // Fisher-Yates shuffle for unbiased random selection
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, arr.length));
}

/** Format an attribute score as hex digit (Traveller UWP notation) */
export function toHex(n: number): string {
  if (n < 10) return String(n);
  return String.fromCharCode(55 + n); // A=10, B=11, etc.
}

/** Convert DM (dice modifier) to signed string */
export function dmString(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
