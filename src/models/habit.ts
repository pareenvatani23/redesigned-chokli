/**
 * Core domain types for Tally.
 *
 * Design goals:
 *  - 100% local / offline. No server, no account, no PII.
 *  - Completions are stored as a set of local date keys ("YYYY-MM-DD") per habit,
 *    which keeps streak math timezone-stable and trivial to reason about.
 */

/** Days of the week, 0 = Sunday … 6 = Saturday (matches JS Date.getDay()). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A habit's schedule.
 *  - "daily": every day counts.
 *  - "weekly": only the listed weekdays count toward streaks / completion.
 */
export type Schedule =
  | { type: 'daily' }
  | { type: 'weekly'; days: Weekday[] };

export interface Habit {
  id: string;
  name: string;
  /** Single emoji used as the habit's icon. */
  emoji: string;
  /** Accent color (hex). */
  color: string;
  schedule: Schedule;
  /** Local reminder time "HH:mm" (24h), or null for no reminder. */
  reminderTime: string | null;
  /** ISO timestamp of creation. */
  createdAt: string;
  /** Soft-archive instead of delete so history is preserved. */
  archived: boolean;
  /** Manual sort order (lower = higher in list). */
  order: number;
}

/** Map of habitId -> set of completed date keys. */
export type Completions = Record<string, Record<string, true>>;

export interface AppData {
  habits: Habit[];
  completions: Completions;
  /** Schema version for safe future migrations. */
  schemaVersion: number;
}

export const SCHEMA_VERSION = 1;

export const DEFAULT_DATA: AppData = {
  habits: [],
  completions: {},
  schemaVersion: SCHEMA_VERSION,
};

/** A curated, friendly palette (works in light & dark). */
export const HABIT_COLORS = [
  '#4F8DFD', // blue
  '#34C759', // green
  '#FF9F0A', // amber
  '#FF6482', // pink
  '#AF52DE', // purple
  '#FF453A', // red
  '#5AC8FA', // cyan
  '#FFD60A', // yellow
] as const;

export const HABIT_EMOJIS = [
  '💧', '🏃', '📚', '🧘', '💪', '🥗', '😴', '🧹',
  '✍️', '🎯', '🚭', '🦷', '💊', '🌱', '☀️', '🙏',
] as const;
