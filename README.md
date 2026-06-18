# Tally — Daily Habit & Streak Tracker

> Build better days, one tap at a time. **No account. No ads. 100% offline & private.**

Tally is a calm, beautiful habit tracker for everyday people. Pick a habit, check
it off with one tap, and watch your streak grow. Everything lives on your phone —
there are no servers, no sign-ups, no tracking, and no subscriptions.

<p align="center">
  <img src="assets/icon.png" width="120" alt="Tally icon" />
</p>

---

## Why Tally

The most-installed habit apps share the same top complaints: ads, forced accounts,
paywalls, bloat, and selling user data. Tally is the deliberate opposite:

- 🔒 **Private by design** — data never leaves the device. No analytics, no network calls.
- 🚫 **No account, no ads, no subscription** — open it and go.
- ⚡ **One-tap check-ins** with satisfying haptics and streak animations.
- 🔥 **Streaks & best-streak** tracking with a forgiving "today isn't over yet" rule.
- 📊 **GitHub-style heatmaps** and 30-day completion rates per habit.
- 🗓️ **Daily or specific-weekday** schedules.
- ⏰ **Optional local reminders** (on-device notifications).
- 🌗 **Light / dark / system** themes.

## Tech stack

- **Expo SDK 56** + **React Native 0.85** + **React 19**, **TypeScript** (strict).
- Offline storage via **AsyncStorage** (single JSON blob, defensive load).
- **react-native-svg** for the progress ring; built-in `Animated` for motion
  (no reanimated/gesture-handler — keeps the bundle lean and web/Jest friendly).
- Custom, dependency-free in-app navigation (`src/navigation`).
- **Jest + @testing-library/react-native** — 47 tests across 6 suites.

## Project layout

```
App.tsx                 Root providers (Theme, Habits, Nav) + status bar
src/
  models/habit.ts       Domain types, palettes, emoji set
  lib/
    date.ts             Local-time date keys & formatting (timezone-safe)
    streaks.ts          Pure streak / completion-rate math
    storage.ts          AsyncStorage repository (load/save/normalize)
    notifications.ts    On-device daily reminders
    id.ts
  state/HabitsContext   Habit + completion state, CRUD, persistence
  theme/                Palettes + ThemeProvider
  navigation/           NavContext + Navigator (tabs + animated modals)
  components/           Button, Tappable, ProgressRing, Heatmap, HabitRow, …
  screens/              Today, Stats, Settings, AddEditHabit, HabitDetail
__tests__/              Unit + integration tests
scripts/generate-assets.js   Brand icon / splash / store-asset generator
```

## Develop

```bash
npm install
npm start            # Expo dev server (press a / i / w)
npm test             # run the full test suite
npm run typecheck    # tsc --noEmit (strict)
npm run export:web   # static web build (sanity bundle)
```

## Verified in this build

- ✅ `tsc --noEmit` — clean (strict mode).
- ✅ `jest` — **47/47** tests passing (date math, streaks, storage, state, UI flow).
- ✅ `expo export --platform android` — Metro bundles **780 modules** with no errors.

## 🚀 Publishing to Google Play (the last mile)

The app is **submission-ready**. The remaining steps require *your* credentials and
Google's review queue, so they can't be done unattended — but each is one command.

> ℹ️ This repo's CI/sandbox has no Android SDK and `dl.google.com` is firewalled,
> so the release **binary** is produced by Expo's cloud builder (EAS), not locally.

**One-time setup**
1. Create a [Google Play Developer account](https://play.google.com/console/signup) ($25 once).
2. `npm i -g eas-cli && eas login`
3. `eas init` (links the project / creates the EAS project id).

**Build the release App Bundle (.aab)**
```bash
eas build --platform android --profile production
```
EAS generates and stores the upload keystore for you.

**Submit to Play**
1. In Play Console, create the app "Tally", then create a service account and
   download its JSON key to `./play-service-account.json` (git-ignored).
2. ```bash
   eas submit --platform android --profile production --latest
   ```
   This uploads the `.aab` to the **internal** track as a **draft**.

**Finish the listing** (see [`store/listing.md`](store/listing.md))
- Short & full description (provided).
- Feature graphic: `assets/store/feature-graphic-1024x500.png` (generated).
- Hi-res icon: `assets/store/play-icon-512.png` (generated).
- Phone screenshots: capture from a device/emulator.
- Privacy policy URL: host [`PRIVACY.md`](PRIVACY.md) (e.g. GitHub Pages) and paste the link.
- Complete the Data safety form → "No data collected / shared" (it's all on-device).

Then promote the release from **internal → production** and submit for review.

## License

MIT — see [LICENSE](LICENSE).
