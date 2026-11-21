// A small seeded random source (mulberry32), so a seed always draws the same scene and the
// screenshot scenes are reproducible. Nothing here depends on Math.random.

/** Make a random function from a 32-bit seed. */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number in [min, max) from a random function. */
export function range(random, min, max) {
  return min + random() * (max - min);
}

/** An integer in [min, max] from a random function. */
export function rangeInt(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

/** One element of an array, picked by a random function. */
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}
