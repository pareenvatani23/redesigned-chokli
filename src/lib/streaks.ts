/**
 * Pure streak / statistics math. No I/O, no React — fully unit tested.
 *
 * A "completed" map is Record<dateKey, true>. Date keys are local "YYYY-MM-DD"
 * strings, which are lexicographically ordered, so we can compare them directly.
 */

import type { Schedule } from '../models/habit';
import { addDaysToKey, toKey, weekdayOfKey } from './date';

export type CompletedMap = Record<string, true>;

/** Is the given date key a day this habit is expected to be done? */
export function isScheduled(schedule: Schedule, key: string): boolean {
  if (schedule.type === 'daily') return true;
  if (schedule.days.length === 0) return false;
  return schedule.days.includes(weekdayOfKey(key));
}

const isDone = (completed: CompletedMap, key: string): boolean => completed[key] === true;

function earliestKey(completed: CompletedMap): string | null {
  let min: string | null = null;
  for (const k of Object.keys(completed)) {
    if (min === null || k < min) min = k;
  }
  return min;
}

function latestKey(completed: CompletedMap): string | null {
  let max: string | null = null;
  for (const k of Object.keys(completed)) {
    if (max === null || k > max) max = k;
  }
  return max;
}

/**
 * Current streak = consecutive *scheduled* days completed, ending today.
 *
 * Forgiving rule: if today is scheduled but not yet done, the streak is not
 * broken — we simply count up to yesterday (the day isn't over yet). The moment
 * a scheduled day in the past is missed, the streak ends.
 */
export function currentStreak(
  schedule: Schedule,
  completed: CompletedMap,
  today: string = toKey()
): number {
  const earliest = earliestKey(completed);
  if (earliest === null) return 0;

  let cursor = today;
  // Grace for an as-yet-incomplete today.
  if (isScheduled(schedule, today) && !isDone(completed, today)) {
    cursor = addDaysToKey(today, -1);
  }

  let streak = 0;
  while (cursor >= earliest) {
    if (isScheduled(schedule, cursor)) {
      if (isDone(completed, cursor)) streak++;
      else break;
    }
    cursor = addDaysToKey(cursor, -1);
  }
  return streak;
}

/** Longest run of consecutive scheduled days ever completed. */
export function bestStreak(schedule: Schedule, completed: CompletedMap): number {
  const earliest = earliestKey(completed);
  const latest = latestKey(completed);
  if (earliest === null || latest === null) return 0;

  let best = 0;
  let run = 0;
  let cursor = earliest;
  while (cursor <= latest) {
    if (isScheduled(schedule, cursor)) {
      if (isDone(completed, cursor)) {
        run++;
        if (run > best) best = run;
      } else {
        run = 0;
      }
    }
    cursor = addDaysToKey(cursor, 1);
  }
  return best;
}

export interface RateResult {
  completed: number;
  scheduled: number;
  rate: number; // 0..1
}

/** Completion rate over an explicit list of date keys (e.g. last 30 days). */
export function completionRate(
  schedule: Schedule,
  completed: CompletedMap,
  windowKeys: string[]
): RateResult {
  let scheduled = 0;
  let done = 0;
  for (const key of windowKeys) {
    if (isScheduled(schedule, key)) {
      scheduled++;
      if (isDone(completed, key)) done++;
    }
  }
  return { completed: done, scheduled, rate: scheduled === 0 ? 0 : done / scheduled };
}

/** Total number of completed days recorded for a habit. */
export function totalCompletions(completed: CompletedMap): number {
  return Object.keys(completed).length;
}
