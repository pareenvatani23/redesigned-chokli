import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  AppData,
  DEFAULT_DATA,
  Habit,
  HABIT_COLORS,
  HABIT_EMOJIS,
  Schedule,
} from '../models/habit';
import { loadData, saveData } from '../lib/storage';
import { uid } from '../lib/id';
import { toKey } from '../lib/date';
import { cancelHabitReminder, syncHabitReminder } from '../lib/notifications';
import type { CompletedMap } from '../lib/streaks';

export interface NewHabitInput {
  name: string;
  emoji: string;
  color: string;
  schedule: Schedule;
  reminderTime: string | null;
}

interface HabitsContextValue {
  ready: boolean;
  habits: Habit[]; // active (non-archived), sorted
  allHabits: Habit[];
  completions: AppData['completions'];
  getCompleted: (habitId: string) => CompletedMap;
  isCompleted: (habitId: string, dateKey: string) => boolean;
  toggleCompletion: (habitId: string, dateKey?: string) => void;
  addHabit: (input: NewHabitInput) => Habit;
  updateHabit: (id: string, patch: Partial<NewHabitInput>) => void;
  archiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;
  reset: () => void;
}

const HabitsContext = createContext<HabitsContextValue | undefined>(undefined);

const canSchedule = Platform.OS !== 'web';

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Load once on mount.
  useEffect(() => {
    loadData().then((d) => {
      setData(d);
      setReady(true);
      loaded.current = true;
    });
  }, []);

  // Persist on every change after the initial load.
  useEffect(() => {
    if (!loaded.current) return;
    saveData(data).catch(() => {});
  }, [data]);

  const getCompleted = useCallback(
    (habitId: string): CompletedMap => data.completions[habitId] ?? {},
    [data.completions]
  );

  const isCompleted = useCallback(
    (habitId: string, dateKey: string): boolean =>
      data.completions[habitId]?.[dateKey] === true,
    [data.completions]
  );

  const toggleCompletion = useCallback((habitId: string, dateKey: string = toKey()) => {
    setData((prev) => {
      const forHabit = { ...(prev.completions[habitId] ?? {}) };
      if (forHabit[dateKey]) delete forHabit[dateKey];
      else forHabit[dateKey] = true;
      return {
        ...prev,
        completions: { ...prev.completions, [habitId]: forHabit },
      };
    });
  }, []);

  const addHabit = useCallback((input: NewHabitInput): Habit => {
    const habit: Habit = {
      id: uid(),
      name: input.name.trim(),
      emoji: input.emoji || HABIT_EMOJIS[0],
      color: input.color || HABIT_COLORS[0],
      schedule: input.schedule,
      reminderTime: input.reminderTime,
      createdAt: new Date().toISOString(),
      archived: false,
      order: Date.now(),
    };
    setData((prev) => ({ ...prev, habits: [...prev.habits, habit] }));
    if (canSchedule) syncHabitReminder(habit).catch(() => {});
    return habit;
  }, []);

  const updateHabit = useCallback((id: string, patch: Partial<NewHabitInput>) => {
    setData((prev) => {
      const habits = prev.habits.map((h) =>
        h.id === id
          ? { ...h, ...patch, name: (patch.name ?? h.name).trim() }
          : h
      );
      const updated = habits.find((h) => h.id === id);
      if (updated && canSchedule) syncHabitReminder(updated).catch(() => {});
      return { ...prev, habits };
    });
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)),
    }));
    if (canSchedule) cancelHabitReminder(id).catch(() => {});
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData((prev) => {
      const completions = { ...prev.completions };
      delete completions[id];
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
        completions,
      };
    });
    if (canSchedule) cancelHabitReminder(id).catch(() => {});
  }, []);

  const reset = useCallback(() => {
    setData(DEFAULT_DATA);
  }, []);

  const habits = useMemo(
    () =>
      data.habits
        .filter((h) => !h.archived)
        .sort((a, b) => a.order - b.order),
    [data.habits]
  );

  const value: HabitsContextValue = {
    ready,
    habits,
    allHabits: data.habits,
    completions: data.completions,
    getCompleted,
    isCompleted,
    toggleCompletion,
    addHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    reset,
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
