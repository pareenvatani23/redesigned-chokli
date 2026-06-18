import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadData, saveData, clearData, normalize, serialize } from '../src/lib/storage';
import { DEFAULT_DATA, SCHEMA_VERSION, type AppData } from '../src/models/habit';

beforeEach(async () => {
  await AsyncStorage.clear();
});

const sample: AppData = {
  habits: [
    {
      id: 'h1',
      name: 'Drink water',
      emoji: '💧',
      color: '#4F8DFD',
      schedule: { type: 'daily' },
      reminderTime: '08:00',
      createdAt: '2026-06-01T00:00:00.000Z',
      archived: false,
      order: 0,
    },
  ],
  completions: { h1: { '2026-06-17': true, '2026-06-18': true } },
  schemaVersion: SCHEMA_VERSION,
};

describe('storage', () => {
  test('loadData returns defaults when empty', async () => {
    expect(await loadData()).toEqual(DEFAULT_DATA);
  });

  test('save then load round-trips', async () => {
    await saveData(sample);
    expect(await loadData()).toEqual(sample);
  });

  test('clearData removes everything', async () => {
    await saveData(sample);
    await clearData();
    expect(await loadData()).toEqual(DEFAULT_DATA);
  });

  test('corrupt JSON falls back to defaults instead of throwing', async () => {
    await AsyncStorage.setItem('tally:data:v1', '{not valid json');
    expect(await loadData()).toEqual(DEFAULT_DATA);
  });

  test('normalize repairs partial / malformed shapes', () => {
    expect(normalize(null)).toEqual(DEFAULT_DATA);
    expect(normalize({ habits: 'nope' })).toEqual(DEFAULT_DATA);
    expect(normalize({ habits: [], completions: { h1: {} } })).toEqual({
      habits: [],
      completions: { h1: {} },
      schemaVersion: SCHEMA_VERSION,
    });
  });

  test('serialize produces valid JSON', () => {
    expect(JSON.parse(serialize(sample))).toEqual(sample);
  });
});
