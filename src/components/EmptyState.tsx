import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, type } from '../theme/theme';

interface Props {
  emoji: string;
  title: string;
  subtitle: string;
}

export function EmptyState({ emoji, title, subtitle }: Props) {
  const { palette } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xxl }}>
      <Text style={{ fontSize: 56, marginBottom: spacing.md }}>{emoji}</Text>
      <Text style={[type.title, { color: palette.text, textAlign: 'center', marginBottom: spacing.sm }]}>
        {title}
      </Text>
      <Text style={[type.body, { color: palette.textMuted, textAlign: 'center', lineHeight: 22 }]}>
        {subtitle}
      </Text>
    </View>
  );
}
