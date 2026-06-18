import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { Button } from '../src/components/Button';
import { ProgressRing } from '../src/components/ProgressRing';
import { Heatmap } from '../src/components/Heatmap';
import { HabitRow } from '../src/components/HabitRow';
import type { Habit } from '../src/models/habit';

const wrap = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>
  );

const habit: Habit = {
  id: 'h1',
  name: 'Drink water',
  emoji: '💧',
  color: '#4F8DFD',
  schedule: { type: 'daily' },
  reminderTime: null,
  createdAt: '2026-06-01T00:00:00.000Z',
  archived: false,
  order: 0,
};

describe('Button', () => {
  test('fires onPress when enabled', () => {
    const onPress = jest.fn();
    wrap(<Button title="Tap me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not fire when disabled', () => {
    const onPress = jest.fn();
    wrap(<Button title="Nope" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Nope'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('ProgressRing', () => {
  test('renders its label', () => {
    wrap(<ProgressRing progress={0.5} label="3/6" sublabel="completed" />);
    expect(screen.getByText('3/6')).toBeTruthy();
    expect(screen.getByText('completed')).toBeTruthy();
  });
});

describe('Heatmap', () => {
  test('marks completed days with a testID cell', () => {
    wrap(
      <Heatmap
        color="#4F8DFD"
        schedule={{ type: 'daily' }}
        completed={{ '2026-06-17': true }}
        today="2026-06-18"
      />
    );
    expect(screen.getByTestId('heatcell-done-2026-06-17')).toBeTruthy();
  });
});

describe('HabitRow', () => {
  test('shows streak text and toggles', () => {
    const onToggle = jest.fn();
    wrap(
      <HabitRow habit={habit} completed={false} streak={5} onToggle={onToggle} onOpen={() => {}} />
    );
    expect(screen.getByText('🔥 5 days streak')).toBeTruthy();
    fireEvent.press(screen.getByTestId('toggle-h1'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('shows start-your-streak prompt when streak is 0', () => {
    wrap(
      <HabitRow habit={habit} completed={false} streak={0} onToggle={() => {}} onOpen={() => {}} />
    );
    expect(screen.getByText('Start your streak')).toBeTruthy();
  });
});
