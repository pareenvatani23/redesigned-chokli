import { useMemo } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/theme';
import { useHabits } from '../state/HabitsContext';
import { useNav } from '../navigation/NavContext';
import { lastNKeys, toKey, formatTime, WEEKDAY_LABELS } from '../lib/date';
import { bestStreak, completionRate, currentStreak, totalCompletions } from '../lib/streaks';
import { Heatmap } from '../components/Heatmap';
import { Button } from '../components/Button';
import { Tappable } from '../components/Tappable';

interface Props {
  habitId: string;
  onClose: () => void;
}

function Stat({ value, label }: { value: string; label: string }) {
  const { palette } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[type.title, { color: palette.text }]}>{value}</Text>
      <Text style={[type.tiny, { color: palette.textFaint, marginTop: 2 }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function HabitDetailScreen({ habitId, onClose }: Props) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { allHabits, getCompleted, isCompleted, toggleCompletion, deleteHabit } = useHabits();
  const { push } = useNav();
  const habit = useMemo(() => allHabits.find((h) => h.id === habitId), [allHabits, habitId]);
  const today = toKey();

  if (!habit) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.bg, paddingTop: insets.top + spacing.xl }}>
        <Text style={[type.body, { color: palette.text, textAlign: 'center' }]}>Habit not found.</Text>
        <Button title="Close" variant="ghost" onPress={onClose} style={{ margin: spacing.lg }} />
      </View>
    );
  }

  const completed = getCompleted(habit.id);
  const cur = currentStreak(habit.schedule, completed, today);
  const best = bestStreak(habit.schedule, completed);
  const total = totalCompletions(completed);
  const rate = completionRate(habit.schedule, completed, lastNKeys(30, today));
  const doneToday = isCompleted(habit.id, today);

  const scheduleText =
    habit.schedule.type === 'daily'
      ? 'Every day'
      : habit.schedule.days.length === 7
        ? 'Every day'
        : habit.schedule.days.map((d) => WEEKDAY_LABELS[d]).join(', ');

  const confirmDelete = () => {
    const doDelete = () => {
      deleteHabit(habit.id);
      onClose();
    };
    if (Platform.OS === 'web') return doDelete();
    Alert.alert('Delete habit?', `"${habit.name}" and its history will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: doDelete },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={[styles.navbar, { paddingTop: insets.top + spacing.sm, borderColor: palette.border }]}>
        <Tappable onPress={onClose} haptic style={styles.navBtn} accessibilityLabel="Close">
          <Text style={[type.body, { color: palette.textMuted }]}>Close</Text>
        </Tappable>
        <Tappable
          onPress={() => push({ type: 'edit', habitId: habit.id })}
          haptic
          style={styles.navBtn}
          accessibilityLabel="Edit habit"
        >
          <Text style={[type.headline, { color: palette.primary }]}>Edit</Text>
        </Tappable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <View style={[styles.bigEmoji, { backgroundColor: habit.color + '22' }]}>
            <Text style={{ fontSize: 40 }}>{habit.emoji}</Text>
          </View>
          <Text style={[type.title, { color: palette.text, marginTop: spacing.md }]}>{habit.name}</Text>
          <Text style={[type.caption, { color: palette.textMuted, marginTop: 2 }]}>
            {scheduleText}
            {habit.reminderTime ? ` · ⏰ ${formatTime(habit.reminderTime)}` : ''}
          </Text>
        </View>

        <View style={[styles.stats, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Stat value={`${cur}🔥`} label="Current" />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <Stat value={`${best}`} label="Best" />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <Stat value={`${total}`} label="Total" />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <Stat value={`${Math.round(rate.rate * 100)}%`} label="30 days" />
        </View>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[type.headline, { color: palette.text, marginBottom: spacing.md }]}>History</Text>
          <Heatmap color={habit.color} schedule={habit.schedule} completed={completed} weeks={18} today={today} />
        </View>

        <Button
          title={doneToday ? "✓ Done today — tap to undo" : 'Mark done today'}
          variant={doneToday ? 'ghost' : 'primary'}
          onPress={() => toggleCompletion(habit.id, today)}
          style={{ marginTop: spacing.xl }}
        />
        <Button title="Delete habit" variant="danger" onPress={confirmDelete} style={{ marginTop: spacing.sm }} />
      </ScrollView>
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
  bigEmoji: {
    width: 84,
    height: 84,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  divider: { width: 1, height: 32 },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
