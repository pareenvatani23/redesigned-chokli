/**
 * Local daily reminder scheduling. All on-device — no push servers involved.
 *
 * We keep one scheduled notification per habit that has a reminderTime, keyed by
 * a deterministic identifier so we can cancel/replace cleanly on edits.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Habit } from '../models/habit';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL = 'reminders';

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function parseTime(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map((p) => parseInt(p, 10));
  return { hour: h, minute: m };
}

/** Cancel any existing reminder for a habit, then (re)schedule if it has a time. */
export async function syncHabitReminder(habit: Habit): Promise<void> {
  await cancelHabitReminder(habit.id);
  if (!habit.reminderTime || habit.archived) return;

  const granted = await requestPermission();
  if (!granted) return;

  await ensureAndroidChannel();
  const { hour, minute } = parseTime(habit.reminderTime);

  await Notifications.scheduleNotificationAsync({
    identifier: reminderId(habit.id),
    content: {
      title: `${habit.emoji} ${habit.name}`,
      body: "Keep your streak alive — tap to check it off.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL,
    },
  });
}

export async function cancelHabitReminder(habitId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId(habitId));
  } catch {
    // No-op if it wasn't scheduled.
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

function reminderId(habitId: string): string {
  return `tally-reminder-${habitId}`;
}
