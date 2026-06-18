import {
  isScheduled,
  currentStreak,
  bestStreak,
  completionRate,
  totalCompletions,
  CompletedMap,
} from '../src/lib/streaks';
import { lastNKeys } from '../src/lib/date';
import type { Schedule } from '../src/models/habit';

const daily: Schedule = { type: 'daily' };

/** Build a CompletedMap from a list of keys. */
const done = (...keys: string[]): CompletedMap =>
  keys.reduce((acc, k) => ({ ...acc, [k]: true as const }), {} as CompletedMap);

describe('isScheduled', () => {
  test('daily is always scheduled', () => {
    expect(isScheduled(daily, '2026-06-18')).toBe(true);
  });

  test('weekly only on listed weekdays', () => {
    const weekdaysOnly: Schedule = { type: 'weekly', days: [1, 2, 3, 4, 5] };
    expect(isScheduled(weekdaysOnly, '2026-06-18')).toBe(true); // Thu
    expect(isScheduled(weekdaysOnly, '2026-06-20')).toBe(false); // Sat
  });

  test('weekly with no days is never scheduled', () => {
    expect(isScheduled({ type: 'weekly', days: [] }, '2026-06-18')).toBe(false);
  });
});

describe('currentStreak (daily)', () => {
  const today = '2026-06-18';

  test('no completions -> 0', () => {
    expect(currentStreak(daily, {}, today)).toBe(0);
  });

  test('counts consecutive days ending today', () => {
    const c = done('2026-06-16', '2026-06-17', '2026-06-18');
    expect(currentStreak(daily, c, today)).toBe(3);
  });

  test('today not done yet is forgiven (counts up to yesterday)', () => {
    const c = done('2026-06-16', '2026-06-17');
    expect(currentStreak(daily, c, today)).toBe(2);
  });

  test('a missed past day breaks the streak', () => {
    // missing 2026-06-17
    const c = done('2026-06-15', '2026-06-16', '2026-06-18');
    expect(currentStreak(daily, c, today)).toBe(1);
  });

  test('streak broken two days ago -> 0 (grace only covers today)', () => {
    // done long ago, nothing recent
    const c = done('2026-06-10', '2026-06-11');
    expect(currentStreak(daily, c, today)).toBe(0);
  });
});

describe('currentStreak (weekly schedule)', () => {
  // Mon/Wed/Fri only
  const mwf: Schedule = { type: 'weekly', days: [1, 3, 5] };

  test('non-scheduled gaps do not break the streak', () => {
    // Fri 6/12, Mon 6/15, Wed 6/17 done; today Thu 6/18 (not scheduled)
    const c = done('2026-06-12', '2026-06-15', '2026-06-17');
    expect(currentStreak(mwf, c, '2026-06-18')).toBe(3);
  });

  test('missing a scheduled day breaks it', () => {
    // missing Mon 6/15
    const c = done('2026-06-12', '2026-06-17');
    expect(currentStreak(mwf, c, '2026-06-18')).toBe(1);
  });
});

describe('bestStreak', () => {
  test('finds the longest historical run (daily)', () => {
    const c = done(
      '2026-06-01', '2026-06-02', '2026-06-03', // run of 3
      '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08' // run of 4
    );
    expect(bestStreak(daily, c)).toBe(4);
  });

  test('empty -> 0', () => {
    expect(bestStreak(daily, {})).toBe(0);
  });

  test('weekly ignores non-scheduled days when measuring runs', () => {
    const mwf: Schedule = { type: 'weekly', days: [1, 3, 5] };
    const c = done('2026-06-01', '2026-06-03', '2026-06-05', '2026-06-08');
    expect(bestStreak(mwf, c)).toBe(4);
  });
});

describe('completionRate', () => {
  test('daily over a clean window', () => {
    const window = lastNKeys(4, '2026-06-18'); // 15,16,17,18
    const c = done('2026-06-16', '2026-06-18');
    const r = completionRate(daily, c, window);
    expect(r.scheduled).toBe(4);
    expect(r.completed).toBe(2);
    expect(r.rate).toBeCloseTo(0.5);
  });

  test('weekly only counts scheduled days in denominator', () => {
    const mwf: Schedule = { type: 'weekly', days: [1, 3, 5] };
    const window = lastNKeys(7, '2026-06-18'); // a full week
    const c = done('2026-06-15', '2026-06-17'); // Mon, Wed (missed Fri 6/12)
    const r = completionRate(mwf, c, window);
    // scheduled in window: Fri12? window is 12..18 -> Fri12, Mon15, Wed17 = 3
    expect(r.scheduled).toBe(3);
    expect(r.completed).toBe(2);
  });

  test('no scheduled days -> rate 0, no divide-by-zero', () => {
    const none: Schedule = { type: 'weekly', days: [] };
    const r = completionRate(none, {}, lastNKeys(7));
    expect(r.rate).toBe(0);
    expect(r.scheduled).toBe(0);
  });
});

describe('totalCompletions', () => {
  test('counts entries', () => {
    expect(totalCompletions(done('a', 'b', 'c'))).toBe(3);
    expect(totalCompletions({})).toBe(0);
  });
});
