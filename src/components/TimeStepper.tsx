import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/theme';
import { formatTime } from '../lib/date';
import { Tappable } from './Tappable';

interface Props {
  value: string; // "HH:mm"
  onChange: (v: string) => void;
}

const clampWrap = (n: number, max: number) => ((n % max) + max) % max;

/** A dependency-free time picker: stepping hours/minutes. Works everywhere. */
export function TimeStepper({ value, onChange }: Props) {
  const { palette } = useTheme();
  const [h, m] = value.split(':').map((p) => parseInt(p, 10));

  const set = (nh: number, nm: number) =>
    onChange(`${`${clampWrap(nh, 24)}`.padStart(2, '0')}:${`${clampWrap(nm, 60)}`.padStart(2, '0')}`);

  const Stepper = ({
    onUp,
    onDown,
    label,
  }: {
    onUp: () => void;
    onDown: () => void;
    label: string;
  }) => (
    <View style={{ alignItems: 'center' }}>
      <Tappable onPress={onUp} style={[styles.btn, { borderColor: palette.border }]} accessibilityLabel={`Increase ${label}`}>
        <Text style={{ color: palette.text, fontSize: 18 }}>▲</Text>
      </Tappable>
      <Text style={[type.title, { color: palette.text, marginVertical: spacing.sm }]}>{label}</Text>
      <Tappable onPress={onDown} style={[styles.btn, { borderColor: palette.border }]} accessibilityLabel={`Decrease ${label}`}>
        <Text style={{ color: palette.text, fontSize: 18 }}>▼</Text>
      </Tappable>
    </View>
  );

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={[type.display, { color: palette.primary, marginBottom: spacing.md }]}>
        {formatTime(value)}
      </Text>
      <View style={styles.row}>
        <Stepper label={`${h}`.padStart(2, '0')} onUp={() => set(h + 1, m)} onDown={() => set(h - 1, m)} />
        <Text style={[type.display, { color: palette.text, marginHorizontal: spacing.md }]}>:</Text>
        <Stepper
          label={`${m}`.padStart(2, '0')}
          onUp={() => set(h, m + 5 - (m % 5))}
          onDown={() => set(h, m - (m % 5 === 0 ? 5 : m % 5))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    width: 56,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
