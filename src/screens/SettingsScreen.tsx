import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, ThemePref } from '../theme/ThemeContext';
import { spacing, radius, type } from '../theme/theme';
import { useHabits } from '../state/HabitsContext';
import { Tappable } from '../components/Tappable';

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { key: string; label: string }[];
  onChange: (k: string) => void;
}) {
  const { palette } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Tappable
            key={opt.key}
            haptic
            onPress={() => onChange(opt.key)}
            style={[styles.segment, active && { backgroundColor: palette.card }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[type.callout, { color: active ? palette.text : palette.textMuted }]}>
              {opt.label}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { palette } = useTheme();
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={[type.tiny, { color: palette.textFaint, marginBottom: spacing.sm, marginLeft: spacing.xs }]}>
        {title.toUpperCase()}
      </Text>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        {children}
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const { palette, pref, setPref } = useTheme();
  const insets = useSafeAreaInsets();
  const { reset, allHabits } = useHabits();

  const confirmReset = () => {
    const doReset = () => reset();
    if (Platform.OS === 'web') {
      // Alert has limited support on web.
      doReset();
      return;
    }
    Alert.alert(
      'Erase all data?',
      'This permanently deletes every habit and all history on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase everything', style: 'destructive', onPress: doReset },
      ]
    );
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

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
        <Text style={[type.display, { color: palette.text, marginBottom: spacing.lg }]}>Settings</Text>

        <Section title="Appearance">
          <View style={{ padding: spacing.md }}>
            <Segmented
              value={pref}
              onChange={(k) => setPref(k as ThemePref)}
              options={[
                { key: 'system', label: 'System' },
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
              ]}
            />
          </View>
        </Section>

        <Section title="Privacy">
          <View style={{ padding: spacing.lg }}>
            <Text style={[type.body, { color: palette.text, lineHeight: 22 }]}>
              🔒 Everything stays on your phone.
            </Text>
            <Text style={[type.callout, { color: palette.textMuted, marginTop: spacing.sm, lineHeight: 21 }]}>
              Tally has no account, no servers, no ads, and no analytics. Your habits never leave this
              device. {allHabits.length} habit{allHabits.length === 1 ? '' : 's'} stored locally.
            </Text>
          </View>
        </Section>

        <Section title="Data">
          <Tappable haptic onPress={confirmReset} style={{ padding: spacing.lg }} accessibilityRole="button">
            <Text style={[type.body, { color: palette.danger }]}>Erase all data</Text>
          </Tappable>
        </Section>

        <Text style={[type.caption, { color: palette.textFaint, textAlign: 'center', marginTop: spacing.md }]}>
          Tally v{version} · Made for everyday people
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' },
  segmented: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm - 2,
  },
});
