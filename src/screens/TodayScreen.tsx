import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, type } from '../theme/theme';
import { useHabits } from '../state/HabitsContext';
import { useNav } from '../navigation/NavContext';
import { relativeLabel, formatHuman, toKey } from '../lib/date';
import { currentStreak, isScheduled } from '../lib/streaks';
import { HabitRow } from '../components/HabitRow';
import { ProgressRing } from '../components/ProgressRing';
import { EmptyState } from '../components/EmptyState';
import { Tappable } from '../components/Tappable';

export function TodayScreen() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, getCompleted, isCompleted, toggleCompletion } = useHabits();
  const { push } = useNav();
  const today = toKey();

  const scheduledToday = useMemo(
    () => habits.filter((h) => isScheduled(h.schedule, today)),
    [habits, today]
  );
  const restingToday = habits.length - scheduledToday.length;

  const doneCount = scheduledToday.filter((h) => isCompleted(h.id, today)).length;
  const progress = scheduledToday.length === 0 ? 0 : doneCount / scheduledToday.length;
  const allDone = scheduledToday.length > 0 && doneCount === scheduledToday.length;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xxl * 3,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[type.tiny, { color: palette.primary }]}>
              {relativeLabel(today).toUpperCase()}
            </Text>
            <Text style={[type.display, { color: palette.text }]}>{formatHuman(today)}</Text>
          </View>
          <Tappable
            onPress={() => push({ type: 'add' })}
            accessibilityRole="button"
            accessibilityLabel="Add habit"
            testID="add-habit-button"
            style={[styles.addBtn, { backgroundColor: palette.primary }]}
          >
            <Text style={{ color: palette.onPrimary, fontSize: 28, lineHeight: 30, fontWeight: '700' }}>
              +
            </Text>
          </Tappable>
        </View>

        {habits.length === 0 ? (
          <View style={{ marginTop: spacing.xxl }}>
            <EmptyState
              emoji="🌱"
              title="Build your first habit"
              subtitle="Tap the + button to add a habit. One tap a day keeps your streak alive — no account, no ads, ever."
            />
          </View>
        ) : (
          <>
            <View style={[styles.summary, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <ProgressRing
                progress={progress}
                label={`${doneCount}/${scheduledToday.length}`}
                sublabel={allDone ? 'All done! 🎉' : 'completed'}
              />
              <Text style={[type.callout, { color: palette.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
                {allDone
                  ? 'Perfect day. Come back tomorrow.'
                  : scheduledToday.length === 0
                    ? 'Nothing scheduled today — enjoy your rest.'
                    : `${scheduledToday.length - doneCount} to go. You've got this.`}
              </Text>
            </View>

            {scheduledToday.map((habit) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                completed={isCompleted(habit.id, today)}
                streak={currentStreak(habit.schedule, getCompleted(habit.id), today)}
                onToggle={() => toggleCompletion(habit.id, today)}
                onOpen={() => push({ type: 'detail', habitId: habit.id })}
              />
            ))}

            {restingToday > 0 && (
              <Text style={[type.caption, { color: palette.textFaint, textAlign: 'center', marginTop: spacing.md }]}>
                {restingToday} habit{restingToday === 1 ? '' : 's'} resting today
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
});
