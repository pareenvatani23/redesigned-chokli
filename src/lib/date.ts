/**
 * Local-time date utilities.
 *
 * Everything in Tally keys off a "date key" string in the form "YYYY-MM-DD"
 * computed in the device's LOCAL timezone. This avoids the classic off-by-one
 * streak bugs you get from naively using toISOString() (which is UTC).
 */

import type { Weekday } from '../models/habit';

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/** Local "YYYY-MM-DD" for a Date (defaults to now). */
export function toKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a "YYYY-MM-DD" key into a local Date at midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map((p) => parseInt(p, 10));
  return new Date(y, m - 1, d);
}

/** Return a new Date offset by `days` (can be negative), at local midnight. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** Add days to a date key, returning a new key. */
export function addDaysToKey(key: string, days: number): string {
  return toKey(addDays(fromKey(key), days));
}

export function weekdayOfKey(key: string): Weekday {
  return fromKey(key).getDay() as Weekday;
}

export function isSameKey(a: string, b: string): boolean {
  return a === b;
}

/**
 * Ascending list of the last `n` date keys ending at `endKey` (inclusive).
 * e.g. lastNKeys(3, "2026-06-18") -> ["2026-06-16","2026-06-17","2026-06-18"]
 */
export function lastNKeys(n: number, endKey: string = toKey()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDaysToKey(endKey, -i));
  return out;
}

/** Number of whole days between two keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = fromKey(b).getTime() - fromKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WEEKDAY_LABELS = WEEKDAYS_SHORT;

/** Friendly heading, e.g. "Thursday, June 18". */
export function formatHuman(key: string): string {
  const d = fromKey(key);
  return `${WEEKDAYS_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** Relative label for the Today header: Today / Yesterday / weekday name. */
export function relativeLabel(key: string, today: string = toKey()): string {
  const diff = daysBetween(key, today);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  return formatHuman(key);
}

/** Format "HH:mm" (24h) into a friendly 12h label, e.g. "8:30 AM". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map((p) => parseInt(p, 10));
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(m)} ${period}`;
}
