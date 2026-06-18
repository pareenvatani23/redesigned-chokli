import React from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { HabitsProvider } from '../src/state/HabitsContext';
import { NavProvider } from '../src/navigation/NavContext';

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <ThemeProvider>
        <HabitsProvider>
          <NavProvider>{children}</NavProvider>
        </HabitsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(<AllProviders>{ui}</AllProviders>);
}
