/**
 * Persistence layer. Wraps AsyncStorage with a single JSON blob.
 *
 * The whole dataset for a habit tracker is tiny (kilobytes), so a single
 * read/write of one key is simpler and faster than a relational store, and it
 * keeps everything offline and private on-device.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, DEFAULT_DATA, SCHEMA_VERSION } from '../models/habit';

const STORAGE_KEY = 'tally:data:v1';

/** Validate + normalize unknown parsed JSON into AppData (defensive). */
export function normalize(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_DATA };
  const obj = raw as Partial<AppData>;
  return {
    habits: Array.isArray(obj.habits) ? obj.habits : [],
    completions:
      obj.completions && typeof obj.completions === 'object' ? obj.completions : {},
    schemaVersion:
      typeof obj.schemaVersion === 'number' ? obj.schemaVersion : SCHEMA_VERSION,
  };
}

export async function loadData(): Promise<AppData> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return { ...DEFAULT_DATA };
    return normalize(JSON.parse(json));
  } catch {
    // Corrupt data should never crash the app — fall back to empty.
    return { ...DEFAULT_DATA };
  }
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function clearData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Export the raw dataset as a pretty JSON string (for backup / portability). */
export function serialize(data: AppData): string {
  return JSON.stringify(data, null, 2);
}
