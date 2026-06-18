import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AllProviders } from './test-utils';
import { useHabits } from '../src/state/HabitsContext';
import { loadData } from '../src/lib/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const newHabit = {
  name: '  Drink water  ',
  emoji: '💧',
  color: '#4F8DFD',
  schedule: { type: 'daily' as const },
  reminderTime: null,
};

describe('HabitsContext', () => {
  test('loads ready and starts empty', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper: AllProviders });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.habits).toEqual([]);
  });

  test('adds a habit (trimming name) and persists it', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper: AllProviders });
    await waitFor(() => expect(result.current.ready).toBe(true));

    let id = '';
    act(() => {
      id = result.current.addHabit(newHabit).id;
    });

    expect(result.current.habits).toHaveLength(1);
    expect(result.current.habits[0].name).toBe('Drink water');

    await waitFor(async () => {
      const saved = await loadData();
      expect(saved.habits.find((h) => h.id === id)?.name).toBe('Drink water');
    });
  });

  test('toggles completion on and off', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper: AllProviders });
    await waitFor(() => expect(result.current.ready).toBe(true));

    let id = '';
    act(() => {
      id = result.current.addHabit(newHabit).id;
    });

    act(() => result.current.toggleCompletion(id, '2026-06-18'));
    expect(result.current.isCompleted(id, '2026-06-18')).toBe(true);

    act(() => result.current.toggleCompletion(id, '2026-06-18'));
    expect(result.current.isCompleted(id, '2026-06-18')).toBe(false);
  });

  test('archive hides from active list; delete removes data', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper: AllProviders });
    await waitFor(() => expect(result.current.ready).toBe(true));

    let id = '';
    act(() => {
      id = result.current.addHabit(newHabit).id;
    });
    act(() => result.current.toggleCompletion(id, '2026-06-18'));

    act(() => result.current.archiveHabit(id));
    expect(result.current.habits).toHaveLength(0);
    expect(result.current.allHabits).toHaveLength(1);

    act(() => result.current.deleteHabit(id));
    expect(result.current.allHabits).toHaveLength(0);

    await waitFor(async () => {
      const saved = await loadData();
      expect(saved.habits).toHaveLength(0);
      expect(saved.completions[id]).toBeUndefined();
    });
  });

  test('updateHabit edits fields', async () => {
    const { result } = renderHook(() => useHabits(), { wrapper: AllProviders });
    await waitFor(() => expect(result.current.ready).toBe(true));

    let id = '';
    act(() => {
      id = result.current.addHabit(newHabit).id;
    });
    act(() => result.current.updateHabit(id, { name: 'Read', emoji: '📚' }));

    const h = result.current.allHabits.find((x) => x.id === id)!;
    expect(h.name).toBe('Read');
    expect(h.emoji).toBe('📚');
  });
});
