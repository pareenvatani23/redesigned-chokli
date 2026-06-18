import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, type } from '../theme/theme';
import { Tappable } from './Tappable';

type Variant = 'primary' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, testID }: Props) {
  const { palette } = useTheme();

  const bg =
    variant === 'primary' ? palette.primary : variant === 'danger' ? 'transparent' : 'transparent';
  const fg =
    variant === 'primary'
      ? palette.onPrimary
      : variant === 'danger'
        ? palette.danger
        : palette.text;
  const borderColor = variant === 'ghost' ? palette.border : 'transparent';

  return (
    <Tappable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      style={[styles.base, { opacity: disabled ? 0.4 : 1 }, style as ViewStyle]}
    >
      <View
        style={[
          styles.inner,
          { backgroundColor: bg, borderColor, borderWidth: variant === 'ghost' ? 1 : 0 },
        ]}
      >
        <Text style={[type.headline, { color: fg }]}>{title}</Text>
      </View>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md },
  inner: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
