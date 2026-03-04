/**
 * Dice rolling utilities for Traveller system generation
 * All rolls are seeded for reproducibility
 */

class DiceRoller {
  constructor(seed = null) {
    if (seed !== null) {
      this.seed = seed;
    } else {
      this.seed = Math.floor(Math.random() * 4294967295);
    }
    this.state = this.seed;
  }

  /**
   * Seeded random number generator (0-1)
   * Uses Mulberry32 algorithm for reproducibility
   */
  _random() {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Roll a single d6
   * @returns {number} 1-6
   */
  rollD6() {
    return Math.floor(this._random() * 6) + 1;
  }

  /**
   * Roll multiple d6 and sum
   * @param {number} numDice - Number of dice to roll
   * @returns {number} Sum of all dice
   */
  rollDice(numDice = 2) {
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += this.rollD6();
    }
    return total;
  }

  /**
   * Roll 2D (standard Traveller roll)
   * @param {number} modifier - Optional DM to add
   * @returns {number}
   */
  roll2D(modifier = 0) {
    return this.rollDice(2) + modifier;
  }

  /**
   * Roll 1D6 (single die)
   * @param {number} modifier - Optional DM to add
   * @returns {number}
   */
  roll1D(modifier = 0) {
    return this.rollD6() + modifier;
  }

  /**
   * Roll 3D6
   * @param {number} modifier - Optional DM to add
   * @returns {number}
   */
  roll3D(modifier = 0) {
    return this.rollDice(3) + modifier;
  }

  /**
   * Roll 4D6
   * @param {number} modifier - Optional DM to add
   * @returns {number}
   */
  roll4D(modifier = 0) {
    return this.rollDice(4) + modifier;
  }

  /**
   * Roll D3 (emulated: roll 1D6, divide by 2 rounded up)
   * @returns {number} 1-3
   */
  rollD3() {
    return Math.ceil(this.rollD6() / 2);
  }

  /**
   * Roll D10 (emulated from 2D6)
   * Follows World Builder's Handbook Table exactly
   * @returns {number} 0-9
   */
  rollD10() {
    const roll = this.rollDice(2);
    const mapping = {
      2: 1,
      3: 1, // Both 2-3 map to 1
      4: 2,
      5: 3,
      6: 4,
      7: 5,
      8: 6,
      9: 7,
      10: 8,
      11: 9,
      12: 0, // 12 is 0 or 10 in pseudo-hex
    };
    return mapping[roll] || 0;
  }

  /**
   * Roll D66 (two six-sided dice as tens and units)
   * Returns 11-66 (no 7s in any digit)
   * @returns {string} Two-digit string like "23" or "44"
   */
  rollD66() {
    const tens = this.rollD6(); // 1-6
    const units = this.rollD6(); // 1-6
    return `${tens}${units}`;
  }

  /**
   * Roll a characteristic (3D6)
   * @returns {number} 3-18
   */
  rollCharacteristic() {
    return this.rollDice(3);
  }

  /**
   * Apply a dice modifier to a roll
   * @param {number} roll - Base roll result
   * @param {number} modifier - DM value (can be negative)
   * @returns {number}
   */
  applyModifier(roll, modifier) {
    return roll + modifier;
  }

  /**
   * Check success against target number
   * @param {number} roll - Result of dice roll
   * @param {number} targetNumber - Number needed to succeed
   * @returns {boolean} True if roll >= target
   */
  isSuccess(roll, targetNumber) {
    return roll >= targetNumber;
  }

  /**
   * Calculate effect (margin of success/failure)
   * @param {number} roll - Result after all modifiers
   * @param {number} targetNumber - Target difficulty
   * @returns {number} Effect value
   */
  calculateEffect(roll, targetNumber) {
    return roll - targetNumber;
  }

  /**
   * Boon roll (roll extra die, discard lowest)
   * Standard 2D with Boon
   * @returns {number}
   */
  rollWithBoon() {
    const die1 = this.rollD6();
    const die2 = this.rollD6();
    const die3 = this.rollD6();
    return Math.max(die1 + die2, die1 + die3, die2 + die3);
  }

  /**
   * Bane roll (roll extra die, discard highest)
   * Standard 2D with Bane
   * @returns {number}
   */
  rollWithBane() {
    const die1 = this.rollD6();
    const die2 = this.rollD6();
    const die3 = this.rollD6();
    return Math.min(die1 + die2, die1 + die3, die2 + die3);
  }

  /**
   * Get current seed for reproduction
   * @returns {number}
   */
  getSeed() {
    return this.seed;
  }
}

// Export for use
module.exports = {
  DiceRoller,

  /**
   * Quick roll function without seeding
   */
  rollDice: (numDice = 2) => {
    const roller = new DiceRoller();
    return roller.rollDice(numDice);
  },

  /**
   * Quick 2D roll
   */
  roll2D: (modifier = 0) => {
    const roller = new DiceRoller();
    return roller.roll2D(modifier);
  },

  /**
   * Quick check
   */
  check: (roll, targetNumber) => {
    return roll >= targetNumber;
  },
};
