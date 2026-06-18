import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { type } from '../theme/theme';

interface Props {
  /** 0..1 */
  progress: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({ progress, size = 120, stroke = 12, label, sublabel }: Props) {
  const { palette } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={palette.track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={clamped >= 1 ? palette.success : palette.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label !== undefined && (
        <View style={{ alignItems: 'center' }}>
          <Text style={[type.display, { color: palette.text }]}>{label}</Text>
          {sublabel !== undefined && (
            <Text style={[type.caption, { color: palette.textMuted }]}>{sublabel}</Text>
          )}
        </View>
      )}
    </View>
  );
}
