import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkPalette, lightPalette, Palette } from './theme';

export type ThemePref = 'system' | 'light' | 'dark';

const PREF_KEY = 'tally:themePref';

interface ThemeContextValue {
  palette: Palette;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setPrefState(v);
    });
  }, []);

  const setPref = (p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem(PREF_KEY, p).catch(() => {});
  };

  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
  const palette = isDark ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({ palette, pref, setPref, isDark }),
    [palette, pref, isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
