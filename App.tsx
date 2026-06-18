import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { HabitsProvider, useHabits } from './src/state/HabitsContext';
import { NavProvider } from './src/navigation/NavContext';
import { Navigator } from './src/navigation/Navigator';

function Shell() {
  const { palette, isDark } = useTheme();
  const { ready } = useHabits();

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {ready ? <Navigator /> : <View style={{ flex: 1, backgroundColor: palette.bg }} />}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HabitsProvider>
          <NavProvider>
            <Shell />
          </NavProvider>
        </HabitsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
