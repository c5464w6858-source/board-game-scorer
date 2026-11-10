# Child Organiser: native app (Capacitor 6)

Wraps the live web app (`../../passport-app`) as an Android and iOS app, `uk.includeme.organiser`, **without changing the web source**. `scripts/sync-web.sh` copies the web files into `www/` and injects `native/native-shim.js` into the copy only.

```
capacitor.config.ts     appId, name, plum #3B1F63, webDir www
scripts/sync-web.sh     copy web app to www/, inject shim  (npm run sync = this + npx cap sync)
scripts/make-icons.mjs  builds assets/*.png from the app logo; then `npx capacitor-assets generate`
native/native-shim.js   native-only behaviour (see below)
android/  ios/          generated native projects
server-changes/         PREPARED, NOT DEPLOYED, CORS patch for the server
test/                   Playwright tests and screenshot scripts
store-assets/           screenshots, Play icon, feature graphic
STORE-READINESS.md  STORE-LISTING.md
```

## What the shim does (only when `Capacitor.isNativePlatform()`)
1. Rewrites `fetch('/api/...')` and `/.netlify/...` to the live servers (`/api` goes to `https://advocate.includeme.uk`, which is where the real API lives; the passport site itself has no `/api`). **The page currently makes no relative server calls** (it uses absolute URLs), so this is a safety net.
2. Removes service worker and web push (not usable in a webview), hides the "Notify this phone" row.
3. Rewrites Supabase `redirect_to=https://localhost/` to the live web app so confirm/reset e-mail links work.
4. Safe-area padding, status bar colours, Android back button closes open dialogs, picker limited to images/PDF/text.
5. Downloads (backup file, calendar `.ics`, documents) go through Filesystem + Share (system share sheet).
6. Share links and the copy-link button use the live web address; share sheet through the Share plugin.
7. Hides the "Save to your phone" prompts and the EHCP Tracker paid upsell (see STORE-READINESS.md f).

## (a) Rebuild
Prerequisites: Node 22, JDK 17+ (21 used here), Android SDK with `platforms;android-34`, `build-tools;34.0.0`, `ANDROID_HOME` set; `android/local.properties` with `sdk.dir=...` (git-ignored; create it).
```
npm install
npm run sync                    # copy web app, inject shim, npx cap sync
cd android && ./gradlew assembleDebug       # android/app/build/outputs/apk/debug/app-debug.apk
cd android && ./gradlew bundleRelease       # android/app/build/outputs/bundle/release/app-release.aab (UNSIGNED)
npm run test:shim                # needs global Playwright; uses a mocked Capacitor
npm run screenshots              # rebuilds store-assets/*
```
Re-run `npm run sync` whenever `passport-app` changes. Bump `versionCode`/`versionName` in `android/app/build.gradle` for each upload.

## (b) Google Play upload key and signing the AAB
Accounts: Google Play Console developer account (one-off US$25, identity verification; organisation accounts need a D-U-N-S number).
1. Create the upload key **outside the repo** and back it up (password manager + offline copy). If you lose it you must ask Google to reset it.
   ```
   keytool -genkeypair -v -storetype PKCS12 -keystore ~/keys/organiser-upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Build `./gradlew bundleRelease`, then sign:
   ```
   jarsigner -keystore ~/keys/organiser-upload.jks -sigalg SHA256withRSA -digestalg SHA-256 android/app/build/outputs/bundle/release/app-release.aab upload
   ```
3. Play Console: create app, enrol in **Play App Signing** (recommended), upload the AAB to Internal testing first. Complete Data safety, Target audience (18+), Content rating, Health apps declaration and the account-deletion URL (see STORE-READINESS.md). Personal accounts created after Nov 2023 must run a closed test with 12+ testers for 14 days before production: check the current rule.
4. **Before uploading, read blocker 2 in STORE-READINESS.md (target SDK).** Never commit `*.jks`, `*.keystore` (already git-ignored).

## (c) iOS: open on a Mac and archive
Accounts and cost: Apple Developer Program (about £79 a year), a Mac with current Xcode, CocoaPods (`sudo gem install cocoapods` or Homebrew).
1. `npm install && npm run sync` (this runs `pod install`; it was skipped here because there is no Mac). If needed `cd ios/App && pod install`.
2. `npx cap open ios`. In Xcode: target App, Signing & Capabilities, choose your Team; bundle id `uk.includeme.organiser` (register it in the Developer portal). Set Version/Build.
3. Check the icon (`Assets.xcassets`, 1024 no alpha, already generated) and the Info.plist camera/photo strings.
4. Product, Destination "Any iOS Device", Product > Archive, then Distribute App > App Store Connect (TestFlight first).
5. App Store Connect: App Privacy answers, age rating, review notes with a demo account, screenshots from `store-assets/`. Read STORE-READINESS.md first (account deletion is required).

## Results of what was built and tested here
- `app-debug.apk` 4.6 MB (built); unsigned `app-release.aab` 3.4 MB (built; `jarsigner -verify` reports no signature). Manifest permissions in the built APK: `INTERNET` only. targetSdk 34, minSdk 22.
- Shim: 25 Playwright checks pass in headless Chromium with a mocked Capacitor global (rewriting, no service worker, share and download handlers, status bar, plain-browser no-op). Sign-in screenshot: `test-output/native-signin.png`.
- Supabase auth CORS: allowed from any origin (checked `https://localhost`, `capacitor://localhost`, `http://localhost`).
- Live check of `advocate.includeme.uk/api/diary/*`: **preflight returns no `Access-Control-Allow-Origin` for any native origin**; only the passport web origins are allowed. Patch in `server-changes/echp-diary-cors-native-origins.patch` (adds `https://localhost`, `capacitor://localhost` to `ALLOWED_ORIGINS` in `echp/netlify/lib/diary.mts`; `git apply --check` passes). Not applied and not deployed: that repo has other uncommitted changes. `api/hit` (analytics) is not called by the app, so needs no change.

## What I could not test
- Anything on a real device or emulator: there is none here. All behaviour of the installed app (launch, splash, status bar colour, safe areas on notches, back button, share sheet, file writes) is unverified.
- **Camera / photo picker:** the page's letter input is `<input type=file multiple>` with no `capture` attribute. In Capacitor's Android webview this opens the system file/photo chooser (choose a photo, PDF or document); it does not go straight to the camera, and on Android the chooser may not offer a camera option. On iOS the chooser offers Take Photo, Photo Library and Files (hence the camera and photo usage strings). The shim limits `accept` to images, PDF and text. For one-tap camera capture, add `@capacitor/camera` and a small page change. Without a device I could not confirm Android's behaviour. No Android camera permission is declared; add `CAMERA` only if you add the camera plugin or `capture`.
- The live API calls themselves (blocked by CORS until the patch is deployed), sign-up/confirm e-mails, AI reading, private copy and reminders from inside the app.
- Downloads/Share (Filesystem + FileProvider) on a device; `window.print()` does not work in a webview and has no replacement.
- iOS: the project is generated and configured but never opened in Xcode; no `pod install`, no build.
- Release builds were not signed or installed.

---

## Update, 10 Nov 2026

- **Capacitor 8** (was 6). Android now targets **API 36** (Android 16) with minSdk 24, so it meets Google Play's current target requirement. Rebuilt and tested: `./gradlew assembleDebug bundleRelease` from `android/`.
- **iOS:** Capacitor 8 needs **Xcode 26 or newer** on the Mac and an iOS 15 deployment target, and adopts UIScene. The iOS project was migrated, but has still never been opened or built (no Mac here). Run `npm run sync`, then `cd ios/App && pod install` (or let Xcode resolve packages), then open it in Xcode.
- **Downloads and printing:** the native layer now sends backups, calendar files and documents (blob downloads) through the system share sheet, and `navigator.canShare` no longer claims it can share files. `window.print()` shows a plain message ("Printing is not available in the app yet") instead of doing nothing. Real printing from inside the apps is still not built.
- The Android SDK on this machine is at `/home/user/android-sdk` (platform 36, build-tools 36.0.0).
