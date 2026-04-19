import { rollDice as baseRollDice } from "./dice.js";

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function rollSingleDie(rollDie, sides = 6) {
  const coerced = Number(rollDie(sides));
  const rounded = Math.round(coerced) || 1;
  return clamp(rounded, 1, sides);
}

export function rollD3(rollDie) {
  return Math.ceil(rollSingleDie(rollDie, 6) / 2);
}

export function roll2d(rollDie) {
  return baseRollDice(rollDie, 2, 6);
}

export function rollNd(rollDie, count = 1, sides = 6) {
  return baseRollDice(rollDie, count, sides);
}

export function roll2dWithDm(rollDie, dm = 0) {
  return roll2d(rollDie) + Number(dm || 0);
}

export function roll2dMinus7(rollDie) {
  return roll2d(rollDie) - 7;
}
