# 📱 Get Tally on your phone

Two ways, from fastest to most "real". Both run from **your computer** (the build
servers and Android SDK aren't reachable from the CI sandbox, so the build has to
happen on your machine or in Expo's cloud).

First, get the code onto your computer:

```bash
git clone -b claude/phone-app-full-cycle-sxc8iz https://github.com/pareenvatani23/redesigned-chokli.git
cd redesigned-chokli
npm install
```

> Requires **Node 18+** installed. That's it for Option A.

---

## ⚡ Option A — Run it now in Expo Go (≈2 min, no account, no build)

Best for: "I just want to see and feel the app right now."

1. On your **phone**, install **Expo Go** from the Play Store:
   https://play.google.com/store/apps/details?id=host.exp.exponent
2. On your **computer**, start the dev server:
   ```bash
   npm start
   ```
   A QR code appears in the terminal.
3. Make sure your phone and computer are on the **same Wi‑Fi**.
4. Open **Expo Go** → tap **"Scan QR code"** → point it at the terminal.
   Tally loads in a few seconds.
   - If the QR won't connect (corporate/locked Wi‑Fi), run a tunnel instead:
     ```bash
     npx expo start --tunnel
     ```
     then scan again.

What works in Expo Go: everything — check‑ins, streaks, heatmaps, themes,
add/edit/delete habits. **Local reminders are limited inside Expo Go** (Expo
removed some notification support from the Go sandbox); they work fully in the
real APK from Option B.

---

## 📦 Option B — Build a real installable APK (≈10–15 min, free Expo account)

Best for: "Give me an `.apk` I can install and share, no computer needed after."
This produces a normal Android APK you sideload. **No paid Google Play account is
required** for this — that's only for publishing to the public Store.

1. Install the EAS CLI and sign in (create a free account at https://expo.dev if needed):
   ```bash
   npm i -g eas-cli
   eas login
   ```
2. Link the project (creates an EAS project id, one time):
   ```bash
   eas init
   ```
3. Build the APK — there's a shortcut script:
   ```bash
   npm run apk
   ```
   (equivalent to `eas build --platform android --profile preview`)
4. The build runs in Expo's cloud. When it's done (~10–15 min) the terminal prints
   a **build details URL** and a **download link**. You'll also see it at
   https://expo.dev → your project → **Builds**.
5. On your **phone**, open that download link and tap the APK to install.
   Android will ask you to allow **"Install unknown apps"** for your browser —
   toggle it on, then tap **Install**.

Done — Tally is on your home screen. 🎉

### Prefer to build the APK on your own machine?
If you have **Android Studio / the Android SDK** installed locally, you can build
without the cloud:
```bash
npm run apk:local
```
This compiles the APK on your computer and drops the file in the project folder.

---

## 🏪 Later: publish to the Google Play Store

When you're ready for the public Store (this *does* need the $25 Google Play
Developer account), build the **App Bundle** and submit:
```bash
npm run aab        # eas build --platform android --profile production  → .aab
eas submit --platform android --profile production --latest
```
Full store walkthrough and listing copy: see [`README.md`](README.md) and
[`store/listing.md`](store/listing.md).

---

## 🛟 Troubleshooting

| Problem | Fix |
| --- | --- |
| `command not found: npm` | Install Node.js 18+ from https://nodejs.org |
| QR scan won't connect | Same Wi‑Fi? Otherwise `npx expo start --tunnel` |
| `eas: command not found` | `npm i -g eas-cli` |
| EAS asks to log in repeatedly | Run `eas whoami`; if empty, `eas login` again |
| Phone blocks the APK install | Settings → Apps → your browser → **Install unknown apps** → Allow |
| Build fails on a dependency | `rm -rf node_modules && npm install`, then retry |

Questions? The whole app is plain Expo + React Native — `npm start` and you're in.
