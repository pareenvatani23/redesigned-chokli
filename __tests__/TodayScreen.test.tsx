import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithProviders } from './test-utils';
import { Navigator } from '../src/navigation/Navigator';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Today screen flow', () => {
  test('shows empty state, then create-habit flow adds a habit and updates progress', async () => {
    renderWithProviders(<Navigator />);

    // Empty state visible
    expect(await screen.findByText('Build your first habit')).toBeTruthy();

    // Open the add-habit modal
    fireEvent.press(screen.getByTestId('add-habit-button'));

    // Fill the form and save
    fireEvent.changeText(screen.getByTestId('habit-name-input'), 'Drink water');
    fireEvent.press(screen.getByTestId('save-habit'));

    // The habit now appears on Today
    expect(await screen.findByText('Drink water')).toBeTruthy();
    expect(screen.getByText('0/1')).toBeTruthy();

    // Check it off — progress flips to 1/1 and celebration copy shows
    const habitToggle = screen.getAllByTestId(/^toggle-/)[0];
    fireEvent.press(habitToggle);

    await waitFor(() => expect(screen.getByText('1/1')).toBeTruthy());
    expect(screen.getByText('All done! 🎉')).toBeTruthy();
  });

  test('blank name cannot be saved (Save is a no-op)', async () => {
    renderWithProviders(<Navigator />);
    fireEvent.press(await screen.findByTestId('add-habit-button'));

    // Don't type a name; press save
    fireEvent.press(screen.getByTestId('save-habit'));

    // Modal stays open: the name input is still present
    expect(screen.getByTestId('habit-name-input')).toBeTruthy();
  });
});
