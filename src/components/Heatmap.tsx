import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { type } from '../theme/theme';
import { addDays, fromKey, toKey, WEEKDAY_LABELS } from '../lib/date';
import { isScheduled, type CompletedMap } from '../lib/streaks';
import type { Schedule } from '../models/habit';

interface Props {
  color: string;
  schedule: Schedule;
  completed: CompletedMap;
  weeks?: number;
  today?: string;
}

const CELL = 14;
const GAP = 4;

/** GitHub-style contribution grid: columns = weeks, rows = Sun..Sat. */
export function Heatmap({ color, schedule, completed, weeks = 18, today = toKey() }: Props) {
  const { palette } = useTheme();

  const columns = useMemo(() => {
    const todayDate = fromKey(today);
    const startSunday = addDays(todayDate, -(todayDate.getDay() + (weeks - 1) * 7));
    const cols: { key: string; state: 'done' | 'scheduled' | 'off' | 'future' }[][] = [];
    for (let w = 0; w < weeks; w++) {
      const col: { key: string; state: 'done' | 'scheduled' | 'off' | 'future' }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = toKey(addDays(startSunday, w * 7 + d));
        let state: 'done' | 'scheduled' | 'off' | 'future';
        if (key > today) state = 'future';
        else if (completed[key]) state = 'done';
        else if (isScheduled(schedule, key)) state = 'scheduled';
        else state = 'off';
        col.push({ key, state });
      }
      cols.push(col);
    }
    return cols;
  }, [today, weeks, completed, schedule]);

  const cellColor = (state: 'done' | 'scheduled' | 'off' | 'future') => {
    switch (state) {
      case 'done':
        return color;
      case 'scheduled':
        return palette.track;
      case 'off':
        return palette.mode === 'dark' ? '#101319' : '#F1F3F6';
      case 'future':
        return 'transparent';
    }
  };

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        {/* weekday labels column */}
        <View style={{ marginRight: GAP }}>
          {WEEKDAY_LABELS.map((lbl, i) => (
            <View key={lbl} style={{ height: CELL + GAP, justifyContent: 'center' }}>
              <Text style={[type.tiny, { color: palette.textFaint, opacity: i % 2 ? 1 : 0 }]}>
                {lbl}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {columns.map((col, ci) => (
            <View key={ci} style={{ marginRight: GAP }}>
              {col.map((cell) => (
                <View
                  key={cell.key}
                  testID={cell.state === 'done' ? `heatcell-done-${cell.key}` : undefined}
                  style={[
                    styles.cell,
                    { backgroundColor: cellColor(cell.state) },
                    cell.state === 'future' && styles.future,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 3,
    marginBottom: GAP,
  },
  future: { opacity: 0 },
});
