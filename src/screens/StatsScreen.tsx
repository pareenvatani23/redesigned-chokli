import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, radius, type } from '../theme/theme';
import { useHabits } from '../state/HabitsContext';
import { useNav } from '../navigation/NavContext';
import { lastNKeys, toKey } from '../lib/date';
import {
  bestStreak,
  completionRate,
  currentStreak,
  totalCompletions,
} from '../lib/streaks';
import { Heatmap } from '../components/Heatmap';
import { EmptyState } from '../components/EmptyState';
import { Tappable } from '../components/Tappable';

function StatBox({ value, label }: { value: string; label: string }) {
  const { palette } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[type.title, { color: palette.text }]}>{value}</Text>
      <Text style={[type.tiny, { color: palette.textFaint }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function StatsScreen() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { habits, getCompleted } = useHabits();
  const { push } = useNav();
  const today = toKey();
  const window30 = useMemo(() => lastNKeys(30, today), [today]);

  const totals = useMemo(() => {
    let completions = 0;
    let best = 0;
    for (const h of habits) {
      const c = getCompleted(h.id);
      completions += totalCompletions(c);
      best = Math.max(best, bestStreak(h.schedule, c));
    }
    return { completions, best };
  }, [habits, getCompleted]);

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
        <Text style={[type.display, { color: palette.text, marginBottom: spacing.lg }]}>Progress</Text>

        {habits.length === 0 ? (
          <EmptyState
            emoji="📊"
            title="No stats yet"
            subtitle="Add a habit and start checking it off — your streaks and heatmaps will appear here."
          />
        ) : (
          <>
            <View style={[styles.totals, { backgroundColor: palette.card, borderColor: palette.border }]}>
              <StatBox value={`${habits.length}`} label="Habits" />
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <StatBox value={`${totals.completions}`} label="Check-ins" />
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <StatBox value={`${totals.best}🔥`} label="Best streak" />
            </View>

            {habits.map((habit) => {
              const c = getCompleted(habit.id);
              const rate = completionRate(habit.schedule, c, window30);
              return (
                <Tappable
                  key={habit.id}
                  haptic={false}
                  onPress={() => push({ type: 'detail', habitId: habit.id })}
                  style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={{ fontSize: 20, marginRight: spacing.sm }}>{habit.emoji}</Text>
                    <Text style={[type.headline, { color: palette.text, flex: 1 }]} numberOfLines={1}>
                      {habit.name}
                    </Text>
                    <Text style={[type.caption, { color: palette.textMuted }]}>
                      🔥 {currentStreak(habit.schedule, c, today)}
                    </Text>
                  </View>
                  <View style={{ marginTop: spacing.md }}>
                    <Heatmap color={habit.color} schedule={habit.schedule} completed={c} today={today} />
                  </View>
                  <Text style={[type.caption, { color: palette.textFaint, marginTop: spacing.md }]}>
                    {Math.round(rate.rate * 100)}% last 30 days · {rate.completed}/{rate.scheduled} days
                  </Text>
                </Tappable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  totals: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  divider: { width: 1, height: 34 },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
});
