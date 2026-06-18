import {
  toKey,
  fromKey,
  addDays,
  addDaysToKey,
  weekdayOfKey,
  lastNKeys,
  daysBetween,
  relativeLabel,
  formatHuman,
  formatTime,
} from '../src/lib/date';

describe('date utilities', () => {
  test('toKey produces local YYYY-MM-DD with zero padding', () => {
    expect(toKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  test('toKey is local-time (not UTC) — no off-by-one near midnight', () => {
    // 11:30pm local should still be "today" in the local key.
    const lateNight = new Date(2026, 5, 18, 23, 30, 0);
    expect(toKey(lateNight)).toBe('2026-06-18');
  });

  test('fromKey round-trips', () => {
    expect(toKey(fromKey('2026-06-18'))).toBe('2026-06-18');
  });

  test('addDays handles month/year rollover', () => {
    expect(toKey(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01');
    expect(toKey(addDays(new Date(2026, 11, 31), 1))).toBe('2027-01-01');
    expect(toKey(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28');
  });

  test('addDaysToKey', () => {
    expect(addDaysToKey('2026-06-18', -1)).toBe('2026-06-17');
    expect(addDaysToKey('2026-06-18', 7)).toBe('2026-06-25');
  });

  test('weekdayOfKey (0=Sun)', () => {
    expect(weekdayOfKey('2026-06-18')).toBe(4); // Thursday
    expect(weekdayOfKey('2026-06-21')).toBe(0); // Sunday
  });

  test('lastNKeys returns ascending inclusive window', () => {
    expect(lastNKeys(3, '2026-06-18')).toEqual([
      '2026-06-16',
      '2026-06-17',
      '2026-06-18',
    ]);
  });

  test('daysBetween', () => {
    expect(daysBetween('2026-06-16', '2026-06-18')).toBe(2);
    expect(daysBetween('2026-06-18', '2026-06-16')).toBe(-2);
  });

  test('relativeLabel', () => {
    expect(relativeLabel('2026-06-18', '2026-06-18')).toBe('Today');
    expect(relativeLabel('2026-06-17', '2026-06-18')).toBe('Yesterday');
    expect(relativeLabel('2026-06-19', '2026-06-18')).toBe('Tomorrow');
    expect(relativeLabel('2026-06-10', '2026-06-18')).toContain('June');
  });

  test('formatHuman', () => {
    expect(formatHuman('2026-06-18')).toBe('Thursday, June 18');
  });

  test('formatTime 12h conversion', () => {
    expect(formatTime('08:30')).toBe('8:30 AM');
    expect(formatTime('00:05')).toBe('12:05 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
    expect(formatTime('21:09')).toBe('9:09 PM');
  });
});
