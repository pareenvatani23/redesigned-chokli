import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/theme';
import {
  HABIT_COLORS,
  HABIT_EMOJIS,
  Schedule,
  Weekday,
} from '../models/habit';
import { useHabits, NewHabitInput } from '../state/HabitsContext';
import { Button } from '../components/Button';
import { Tappable } from '../components/Tappable';
import { TimeStepper } from '../components/TimeStepper';
import { WEEKDAY_LABELS } from '../lib/date';

interface Props {
  habitId?: string;
  onClose: () => void;
}

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export function AddEditHabitScreen({ habitId, onClose }: Props) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { allHabits, addHabit, updateHabit } = useHabits();
  const editing = useMemo(() => allHabits.find((h) => h.id === habitId), [allHabits, habitId]);

  const [name, setName] = useState(editing?.name ?? '');
  const [emoji, setEmoji] = useState(editing?.emoji ?? HABIT_EMOJIS[0]);
  const [color, setColor] = useState(editing?.color ?? HABIT_COLORS[0]);
  const [isDaily, setIsDaily] = useState(editing ? editing.schedule.type === 'daily' : true);
  const [days, setDays] = useState<Weekday[]>(
    editing && editing.schedule.type === 'weekly' ? editing.schedule.days : [1, 2, 3, 4, 5]
  );
  const [reminderOn, setReminderOn] = useState(!!editing?.reminderTime);
  const [reminderTime, setReminderTime] = useState(editing?.reminderTime ?? '08:00');

  const toggleDay = (d: Weekday) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const scheduleValid = isDaily || days.length > 0;
  const canSave = name.trim().length > 0 && scheduleValid;

  const save = () => {
    if (!canSave) return;
    const schedule: Schedule = isDaily ? { type: 'daily' } : { type: 'weekly', days };
    const input: NewHabitInput = {
      name,
      emoji,
      color,
      schedule,
      reminderTime: reminderOn ? reminderTime : null,
    };
    if (editing) updateHabit(editing.id, input);
    else addHabit(input);
    onClose();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={[styles.navbar, { paddingTop: insets.top + spacing.sm, borderColor: palette.border }]}>
        <Tappable onPress={onClose} haptic style={styles.navBtn} accessibilityLabel="Cancel">
          <Text style={[type.body, { color: palette.textMuted }]}>Cancel</Text>
        </Tappable>
        <Text style={[type.headline, { color: palette.text }]}>
          {editing ? 'Edit Habit' : 'New Habit'}
        </Text>
        <Tappable onPress={save} haptic style={styles.navBtn} accessibilityLabel="Save habit" testID="save-habit">
          <Text style={[type.headline, { color: canSave ? palette.primary : palette.textFaint }]}>
            Save
          </Text>
        </Tappable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Live preview */}
          <View style={[styles.preview, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={[styles.previewEmoji, { backgroundColor: color + '22' }]}>
              <Text style={{ fontSize: 30 }}>{emoji}</Text>
            </View>
            <Text style={[type.headline, { color: palette.text }]} numberOfLines={1}>
              {name.trim() || 'Your habit'}
            </Text>
          </View>

          <Text style={[styles.label, { color: palette.textMuted }]}>NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Drink water"
            placeholderTextColor={palette.textFaint}
            style={[styles.input, { color: palette.text, backgroundColor: palette.card, borderColor: palette.border }]}
            maxLength={40}
            testID="habit-name-input"
            returnKeyType="done"
          />

          <Text style={[styles.label, { color: palette.textMuted }]}>ICON</Text>
          <View style={styles.grid}>
            {HABIT_EMOJIS.map((e) => (
              <Tappable
                key={e}
                onPress={() => setEmoji(e)}
                style={[
                  styles.emojiCell,
                  { backgroundColor: palette.card, borderColor: emoji === e ? color : palette.border },
                  emoji === e && { borderWidth: 2 },
                ]}
                accessibilityLabel={`Icon ${e}`}
              >
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </Tappable>
            ))}
          </View>

          <Text style={[styles.label, { color: palette.textMuted }]}>COLOR</Text>
          <View style={styles.grid}>
            {HABIT_COLORS.map((c) => (
              <Tappable
                key={c}
                onPress={() => setColor(c)}
                style={[styles.colorCell, { backgroundColor: c, borderColor: palette.bg }]}
                accessibilityLabel={`Color ${c}`}
              >
                {color === c && <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>✓</Text>}
              </Tappable>
            ))}
          </View>

          <Text style={[styles.label, { color: palette.textMuted }]}>SCHEDULE</Text>
          <View style={[styles.rowCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[type.body, { color: palette.text }]}>Every day</Text>
            <Switch
              value={isDaily}
              onValueChange={setIsDaily}
              trackColor={{ true: palette.primary, false: palette.border }}
              testID="daily-switch"
            />
          </View>
          {!isDaily && (
            <View style={styles.weekRow}>
              {ALL_DAYS.map((d) => {
                const on = days.includes(d);
                return (
                  <Tappable
                    key={d}
                    onPress={() => toggleDay(d)}
                    style={[
                      styles.dayCell,
                      { borderColor: palette.border, backgroundColor: on ? color : palette.card },
                    ]}
                    accessibilityLabel={`Toggle ${WEEKDAY_LABELS[d]}`}
                  >
                    <Text style={[type.caption, { color: on ? '#fff' : palette.textMuted }]}>
                      {WEEKDAY_LABELS[d][0]}
                    </Text>
                  </Tappable>
                );
              })}
            </View>
          )}

          <Text style={[styles.label, { color: palette.textMuted }]}>REMINDER</Text>
          <View style={[styles.rowCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text style={[type.body, { color: palette.text }]}>Daily reminder</Text>
            <Switch
              value={reminderOn}
              onValueChange={setReminderOn}
              trackColor={{ true: palette.primary, false: palette.border }}
              testID="reminder-switch"
            />
          </View>
          {reminderOn && (
            <View style={[styles.timeCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <TimeStepper value={reminderTime} onChange={setReminderTime} />
            </View>
          )}

          <View style={{ height: spacing.xl }} />
          <Button title={editing ? 'Save changes' : 'Create habit'} onPress={save} disabled={!canSave} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  navBtn: { minWidth: 64, paddingVertical: spacing.xs },
  preview: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  previewEmoji: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...type.tiny,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  input: {
    ...type.body,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  emojiCell: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCell: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
});
