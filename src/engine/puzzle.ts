import type { Story } from '../content/types';
import { type Rng, shuffle } from './rng';

export const PUZZLE_SECONDS = 60;
export const IDIOM_SCORE = 100;
export const TIME_BONUS = 5;

export interface Tile { id: number; char: string; gone: boolean }

export interface PuzzleState {
  tiles: Tile[];
  idioms: { idiom: string; reading: string; done: boolean }[];
  selection: number[]; // tile id
  score: number;
  done: boolean;
}

export type TapEvent = 'keep' | 'reset' | 'complete' | 'done' | 'ignored';

export type PuzzleScope = 'learned' | 'all';

/** learned: 복원한 고사에서만(4편 미만이면 전체로), all: 12편 전체에서 4개 */
export function puzzlePool(rng: Rng, scope: PuzzleScope, learned: Story[], all: Story[]): Story[] {
  const pool = scope === 'learned' && learned.length >= 4 ? learned : all;
  return shuffle(rng, pool).slice(0, 4);
}

export function pickPuzzleStories(rng: Rng, unlocked: Story[], all: Story[]): Story[] {
  const pool = unlocked.length >= 4 ? unlocked : all.slice(0, 4);
  return shuffle(rng, pool).slice(0, 4);
}

export function createPuzzle(rng: Rng, stories: Story[]): PuzzleState {
  const chars = stories.flatMap((s) => [...s.idiom]);
  const tiles = shuffle(rng, chars).map((char, id) => ({ id, char, gone: false }));
  return { tiles, idioms: stories.map((s) => ({ idiom: s.idiom, reading: s.reading, done: false })), selection: [], score: 0, done: false };
}

export function tap(s: PuzzleState, tileId: number, secondsLeft = 0): { state: PuzzleState; event: TapEvent; idiom?: string } {
  const tile = s.tiles.find((t) => t.id === tileId);
  if (s.done || !tile || tile.gone || s.selection.includes(tileId)) return { state: s, event: 'ignored' };
  const selection = [...s.selection, tileId];
  const word = selection.map((id) => s.tiles.find((t) => t.id === id)!.char).join('');
  const open = s.idioms.filter((i) => !i.done);
  const match = open.find((i) => i.idiom === word);
  if (match) {
    const idioms = s.idioms.map((i) => (i === match ? { ...i, done: true } : i));
    const tiles = s.tiles.map((t) => (selection.includes(t.id) ? { ...t, gone: true } : t));
    const done = idioms.every((i) => i.done);
    const score = s.score + IDIOM_SCORE + (done ? secondsLeft * TIME_BONUS : 0);
    return { state: { tiles, idioms, selection: [], score, done }, event: done ? 'done' : 'complete', idiom: match.idiom };
  }
  if (open.some((i) => i.idiom.startsWith(word))) return { state: { ...s, selection }, event: 'keep' };
  return { state: { ...s, selection: [] }, event: 'reset' };
}

export function timeUp(s: PuzzleState): PuzzleState {
  return { ...s, done: true, selection: [] };
}
