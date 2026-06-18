/** Design tokens: a calm, premium light/dark palette plus spacing & type scale. */

export interface Palette {
  mode: 'light' | 'dark';
  bg: string;
  bgElevated: string;
  card: string;
  cardPressed: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  onPrimary: string;
  success: string;
  danger: string;
  /** Low-alpha track color for the heatmap's empty cells. */
  track: string;
}

export const lightPalette: Palette = {
  mode: 'light',
  bg: '#F7F8FA',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardPressed: '#EFF1F5',
  border: '#E6E8EC',
  text: '#10131A',
  textMuted: '#5B6270',
  textFaint: '#9AA0AC',
  primary: '#4F8DFD',
  onPrimary: '#FFFFFF',
  success: '#34C759',
  danger: '#FF453A',
  track: '#ECEEF2',
};

export const darkPalette: Palette = {
  mode: 'dark',
  bg: '#0B0D12',
  bgElevated: '#14171F',
  card: '#161A23',
  cardPressed: '#1E222D',
  border: '#262B36',
  text: '#F2F4F8',
  textMuted: '#9AA2B1',
  textFaint: '#6B7280',
  primary: '#5A93FF',
  onPrimary: '#0B0D12',
  success: '#32D74B',
  danger: '#FF6961',
  track: '#1E222D',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  headline: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  callout: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '600' as const },
  tiny: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.4 },
};
