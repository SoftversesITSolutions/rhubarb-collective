/**
 * Deterministic pseudo-random source for the organic network.
 *
 * The whole visual system must be reproducible: the same seed has to yield the
 * exact same composition on every render, on every machine, forever. Math.random
 * is therefore never used anywhere in the generator.
 */

export type Rng = () => number;

/** mulberry32 — small, fast, well-distributed 32-bit PRNG. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform value in [min, max). */
export function range(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/**
 * Bell-ish distribution in [min, max) — averaging two samples pulls values
 * toward the middle, which reads as "natural variation" rather than noise.
 */
export function bell(rng: Rng, min: number, max: number): number {
  const t = (rng() + rng()) / 2;
  return min + t * (max - min);
}

/** Randomly returns -1 or 1. */
export function sign(rng: Rng): number {
  return rng() < 0.5 ? -1 : 1;
}

/** True with probability p. */
export function chance(rng: Rng, p: number): boolean {
  return rng() < p;
}

/** Picks one item deterministically. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}
