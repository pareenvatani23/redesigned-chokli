import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/theme';
import { Tappable } from './Tappable';
import type { Habit } from '../models/habit';

interface Props {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onOpen: () => void;
}

export function HabitRow({ habit, completed, streak, onToggle, onOpen }: Props) {
  const { palette } = useTheme();
  const pop = useRef(new Animated.Value(completed ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pop, {
      toValue: completed ? 1 : 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 12,
    }).start();
  }, [completed, pop]);

  const checkScale = pop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 1.15, 1] });

  const handleToggle = () => {
    if (!completed) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.selectionAsync().catch(() => {});
    onToggle();
  };

  return (
    <View style={[styles.row, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Tappable
        onPress={onOpen}
        haptic={false}
        style={styles.left}
        accessibilityRole="button"
        accessibilityLabel={`Open ${habit.name}`}
      >
        <View style={[styles.emojiWrap, { backgroundColor: habit.color + '22' }]}>
          <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[type.headline, { color: palette.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <Text style={[type.caption, { color: palette.textMuted }]}>
            {streak > 0 ? `🔥 ${streak} day${streak === 1 ? '' : 's'} streak` : 'Start your streak'}
          </Text>
        </View>
      </Tappable>

      <Tappable
        onPress={handleToggle}
        haptic={false}
        activeScale={0.85}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        accessibilityLabel={`Mark ${habit.name} ${completed ? 'not done' : 'done'}`}
        testID={`toggle-${habit.id}`}
      >
        <Animated.View
          style={[
            styles.check,
            {
              borderColor: completed ? habit.color : palette.border,
              backgroundColor: completed ? habit.color : 'transparent',
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          {completed && <Text style={styles.checkMark}>✓</Text>}
        </Animated.View>
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.md },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  checkMark: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
});
