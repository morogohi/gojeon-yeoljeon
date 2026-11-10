export interface SrsCard {
  ease: number;
  interval: number;
  due: string; // YYYY-MM-DD
  reps: number;
  lapses: number;
}

export const INITIAL_EASE = 2.5;
export const MIN_EASE = 1.3;

export function addDays(day: string, n: number): string {
  const t = Date.parse(`${day}T00:00:00Z`) + n * 86400000;
  return new Date(t).toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

export function newCard(today: string): SrsCard {
  return { ease: INITIAL_EASE, interval: 0, due: today, reps: 0, lapses: 0 };
}

export function review(card: SrsCard | undefined, correct: boolean, today: string): SrsCard {
  const c = card ?? newCard(today);
  if (!correct) {
    return { ease: Math.max(MIN_EASE, Math.round((c.ease - 0.2) * 100) / 100), interval: 1, due: addDays(today, 1), reps: 0, lapses: c.lapses + 1 };
  }
  const interval = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.interval * c.ease);
  return { ease: c.ease, interval, due: addDays(today, interval), reps: c.reps + 1, lapses: c.lapses };
}

export function dueQueue(cards: Record<string, SrsCard>, today: string, limit = 10): string[] {
  return Object.entries(cards)
    .filter(([, c]) => c.due <= today)
    .sort((a, b) => (a[1].due < b[1].due ? -1 : a[1].due > b[1].due ? 1 : a[0] < b[0] ? -1 : 1))
    .slice(0, limit)
    .map(([k]) => k);
}
