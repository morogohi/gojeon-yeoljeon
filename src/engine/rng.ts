export type Rng = () => number;

/** mulberry32: 같은 시드 → 같은 수열, 값은 [0, 1). */
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

export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** pool에서 exclude에 없는 서로 다른 값 n개를 고른다. */
export function pickDistinct<T>(rng: Rng, pool: readonly T[], n: number, exclude: (x: T) => boolean): T[] {
  const out: T[] = [];
  for (const x of shuffle(rng, pool)) {
    if (out.length >= n) break;
    if (!exclude(x) && !out.includes(x)) out.push(x);
  }
  if (out.length < n) throw new Error('보기를 만들 후보가 부족합니다');
  return out;
}
