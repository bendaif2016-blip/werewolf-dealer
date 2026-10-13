# Werewolf Dealer

Native iOS and Android card randomizer for Werewolf (Expo / React Native, TypeScript). English and Arabic (RTL), 5 themes, 3-step setup, hold-to-reveal cards.

## Run it
    npm install
    npx expo start        # scan the QR code with Expo Go (iOS App Store / Google Play)
Press `a` for an Android emulator, `i` for the iOS simulator (macOS only).

## Before publishing
1. In `app.json`, replace `com.yourname.werewolfdealer` (iOS `bundleIdentifier` and Android `package`) with your own unique ID.
2. Bump `version` (and `versionCode` / `buildNumber`) for each release.

## Android APK on GitHub Releases (free)
1. Create a GitHub repo, then:
       git init && git add . && git commit -m "Werewolf Dealer"
       git branch -M main
       git remote add origin https://github.com/<you>/werewolf-dealer.git
       git push -u origin main
2. Release: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Actions (`.github/workflows/android-release.yml`) builds the APK and attaches it to the Release page. Share that link; people download and install it (they must allow "install unknown apps").
Note: this APK is signed with the debug key. That is fine for sharing, but Google Play needs a proper signing key (use EAS, below).

## iOS
GitHub cannot distribute installable iPhone apps. Apple requires signing:
- Apple Developer Program ($99/year) is needed for TestFlight and the App Store.
- `npm i -g eas-cli && eas login && eas build --platform ios --profile production`, then `eas submit --platform ios`.
- Without a paid account you can only run it on your own phone through Xcode (7-day expiry) or Expo Go.
Optional: add an `EXPO_TOKEN` repo secret to use the manual workflow `eas-store-build.yml`.

## Google Play
`eas build --platform android --profile production` creates an AAB. Upload it in the Play Console (one-time $25 developer fee).
