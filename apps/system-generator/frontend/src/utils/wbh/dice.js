export function createSequenceRoller(sequence = []) {
  let index = 0;

  return function rollDie(sides = 6) {
    const nextValue = sequence[index] ?? 1;
    index += 1;

    const coercedValue = Number(nextValue);
    if (!Number.isInteger(coercedValue) || coercedValue < 1 || coercedValue > sides) {
      throw new RangeError(`Roll value ${nextValue} is invalid for d${sides}`);
    }

    return coercedValue;
  };
}

export function createRandomRoller(random = Math.random) {
  return function rollDie(sides = 6) {
    return Math.floor(random() * sides) + 1;
  };
}

export function rollDice(rollDie, count, sides = 6) {
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    total += rollDie(sides);
  }
  return total;
}
