import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, type } from '../theme/theme';
import { useNav, Modal, Tab } from './NavContext';
import { Tappable } from '../components/Tappable';
import { TodayScreen } from '../screens/TodayScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddEditHabitScreen } from '../screens/AddEditHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: '☑️' },
  { key: 'stats', label: 'Progress', icon: '📈' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

function TabBar() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const { tab, setTab } = useNav();
  return (
    <View
      style={[
        styles.tabbar,
        {
          backgroundColor: palette.bgElevated,
          borderColor: palette.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {TABS.map((t) => {
        const active = tab === t.key;
        return (
          <Tappable
            key={t.key}
            haptic
            activeScale={0.9}
            onPress={() => setTab(t.key)}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            testID={`tab-${t.key}`}
          >
            <Text style={{ fontSize: 22, opacity: active ? 1 : 0.5 }}>{t.icon}</Text>
            <Text style={[type.tiny, { color: active ? palette.primary : palette.textFaint, marginTop: 2 }]}>
              {t.label.toUpperCase()}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

function ModalHost({ modal, onClose }: { modal: Modal; onClose: () => void }) {
  const { palette } = useTheme();
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 16,
      bounciness: 2,
    }).start();
  }, [translateY]);

  let content: React.ReactNode = null;
  if (modal.type === 'add') content = <AddEditHabitScreen onClose={onClose} />;
  else if (modal.type === 'edit') content = <AddEditHabitScreen habitId={modal.habitId} onClose={onClose} />;
  else if (modal.type === 'detail') content = <HabitDetailScreen habitId={modal.habitId} onClose={onClose} />;

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: palette.bg, transform: [{ translateY }] },
      ]}
    >
      {content}
    </Animated.View>
  );
}

export function Navigator() {
  const { palette } = useTheme();
  const { tab, stack, pop } = useNav();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <View style={{ flex: 1 }}>
        {tab === 'today' && <TodayScreen />}
        {tab === 'stats' && <StatsScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </View>
      <TabBar />

      {/* Modal stack — each layer sits above the previous. */}
      {stack.map((modal, i) => (
        <ModalHost key={i} modal={modal} onClose={pop} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs },
});
