# EHCP Tracker: Capacitor 6 native app

Wraps the live web app (`/home/user/echp`) as an Android and iOS app. App id `uk.includeme.advocate`, name "EHCP Tracker". The web code is not forked: `scripts/sync-web.sh` copies the site into `www/` and adds one native-only script to the COPY of `index.html`.

Read `STORE-READINESS.md` first. The current build must not go to the stores until the payments question there is decided.

## What is here

- `capacitor.config.ts`, `package.json`: project config (Capacitor ^6, plugins: app, splash-screen, status-bar).
- `scripts/sync-web.sh`: copies web assets (excludes `test/`, `admin/`, `netlify/`, `node_modules`, package files, `README.md`, `sw.js`) into `www/`, copies `shim/native-shim.js`, and injects it into `www/index.html` via `scripts/inject-shim.mjs`. `npm run sync` runs it and then `npx cap sync`.
- `shim/native-shim.js`: does nothing in a normal browser. In the app it rewrites `fetch('/api/...')` to `https://advocate.includeme.uk/api/...` (method, headers, body kept), skips service-worker registration, removes `PushManager`, makes privacy and terms links open in the system browser, adds side safe-area padding, sets the status bar, and handles the Android back button.
- `scripts/make-assets.mjs` (icons, splash), `scripts/make-screenshots.cjs`, `scripts/make-play-graphics.mjs`: regenerate artwork.
- `test/shim-check.cjs`: headless Chromium check of the shim (see "Tested" below).
- `android/`, `ios/`: generated native projects, edited for permissions, icons and splash.
- `store-assets/`, `STORE-LISTING.md`, `STORE-READINESS.md`.

## Before anything works: deploy the CORS change (only you can do this)

The app's origin is `https://localhost` (Android) or `capacitor://localhost` (iOS), so the live API must allow them. The change is prepared but NOT deployed, in `/home/user/echp` (uncommitted): new `netlify/lib/cors.mts`, new `test/cors.test.mjs`, and 15 of the `netlify/functions/api-*.mts` files wrapped with `withNativeCors` and given `OPTIONS` in their method list. Review the diff (`git diff`), run `npm test` (128 pass), commit and deploy it yourself. Without it, sign-in and every API call fail in the app.

Notes: the allowlist is exactly `https://localhost`, `capacitor://localhost`, `http://localhost`; never `*`; credentials are never allowed (the API uses a bearer header, not cookies). Preflight requests count towards the rate limits on `/api/auth/request` (5 a minute per IP) and `/api/auth/verify` (10 a minute); browsers cache preflights, so it is usually fine, but watch for it.

## (a) Rebuild

Needs Node 22, JDK 17+ (21 is installed here) and the Android SDK (here: `/home/user/android-sdk`, platform 34, build-tools 34.0.0).

```bash
cd /home/user/board-game-scorer/native/advocate
npm install
export ANDROID_HOME=/home/user/android-sdk ANDROID_SDK_ROOT=/home/user/android-sdk
echo "sdk.dir=$ANDROID_HOME" > android/local.properties     # ignored by git
npm run sync                      # copy web app, inject shim, cap sync
cd android && ./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
./gradlew bundleRelease                   # app/build/outputs/bundle/release/app-release.aab (UNSIGNED)
```

Set a different web source with `ADVOCATE_WEB=/path/to/echp npm run sync`. Raise `versionCode` in `android/app/build.gradle` for every upload to Play (and `CURRENT_PROJECT_VERSION` in Xcode for iOS).

## (b) Create the Google Play upload key and sign the bundle

Accounts and cost: Google Play Console developer account, one-off USD 25 (identity verification required; new personal accounts must also run a closed test with testers for 14 days before production, check the current rule).

1. Make the upload keystore OUTSIDE the repo and back it up in two places (a password manager and an encrypted drive). Losing it is recoverable through Play support only if you use Play App Signing (do):
   ```bash
   keytool -genkeypair -v -keystore ~/keys/advocate-upload.jks -alias advocate-upload \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Sign the AAB:
   ```bash
   jarsigner -keystore ~/keys/advocate-upload.jks -sigalg SHA256withRSA -digestalg SHA-256 \
     android/app/build/outputs/bundle/release/app-release.aab advocate-upload
   jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
   ```
   (or add a signing config to `android/app/build.gradle` that reads the path and passwords from `~/.gradle/gradle.properties`, never from the repo; `*.jks` and `*.keystore` are in `.gitignore`).
3. Play Console: create app, enrol in Play App Signing, upload the signed AAB to an Internal or Closed test track first. Fill in: store listing (`STORE-LISTING.md`, `store-assets/`), Data safety, content rating, target audience 18+, privacy policy URL, account deletion URL (a web page you still need, see STORE-READINESS.md (b)).
4. Target SDK: Capacitor 6 builds for API 34. If the Console rejects it as too old, upgrade to a newer Capacitor major.

## (c) iOS: open on a Mac and archive

Accounts and cost: Apple Developer Program, GBP 79 / USD 99 a year. Needs a Mac with current Xcode, Node and CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`).

1. Copy this folder to the Mac (without `node_modules`), then `npm install && npm run sync`. On a Mac `cap sync` also runs `pod install`; it was skipped here because CocoaPods is missing.
2. `npx cap open ios`. In Xcode: select the App target, Signing and Capabilities, choose your Team; bundle id `uk.includeme.advocate`; set Version and Build.
3. Add a `PrivacyInfo.xcprivacy` to the App target (see STORE-READINESS.md (d)).
4. Check the icon (1024x1024, no alpha, already set in `Assets.xcassets/AppIcon`) and the splash.
5. Run on the simulator and a real iPhone. Test the things I could not: sign-in, camera and photo picker, plan reading, backup/export, printing (expected to fail, see readiness doc), safe areas and rotation.
6. Product, Destination "Any iOS Device", Product > Archive, then Distribute App > App Store Connect > Upload. Then in App Store Connect: create the app record, fill in listing, App Privacy, age rating, review notes, attach the build, submit for review. Use TestFlight first.

## Tested here

- Installed the Android command-line tools and SDK (platform 34, build-tools 34.0.0) and accepted licences.
- `npx cap sync`, then `./gradlew assembleDebug`: success. APK `android/app/build/outputs/apk/debug/app-debug.apk`, 4,962,482 bytes (about 4.7 MB). Package `uk.includeme.advocate`, minSdk 22, targetSdk 34, permissions INTERNET and CAMERA; the APK contains `assets/public/index.html` with the shim.
- `./gradlew bundleRelease`: success, `android/app/build/outputs/bundle/release/app-release.aab`, 3,760,414 bytes, unsigned (`jarsigner -verify` reports "no manifest"). It must be signed with your upload key. No keystore was created.
- Headless Chromium with a mocked `Capacitor` global (`NODE_PATH=$(npm root -g) node test/shim-check.cjs`): PASS. The app boots to the landing page with no page errors; `/api/entitlement` (POST with bearer header and JSON body), `/api/config`, and `/api/redeem?x=1` (via a Request object) all go to `https://advocate.includeme.uk/api/...` with method, headers and body intact; service-worker registration is a no-op; `PushManager` is gone; without the mock the same page sends calls to localhost, proving the shim is what changes it. Screenshot: `test/shim-check.png` (Google Fonts were blocked in that run, hence fallback fonts).
- `/home/user/echp` `npm test`: 119 tests before, 128 after (9 new CORS tests), all passing. Each changed function file also imports cleanly.
- Store screenshots (24) and Play graphics checked by eye.

## Not tested, and known gaps

- No Android emulator or device here, so the APK was never run. Camera chooser, back button, status bar colours, splash, and external links are untested on a real WebView.
- iOS was only generated and configured. It has never been built or opened in Xcode; no CocoaPods run.
- The live backend was not called (CORS is not deployed), so real sign-in, Stripe and plan reading were not exercised through the app.
- Printing, Blob file downloads (backup fallback, calendar export) and possibly file sharing do not work in native webviews and are not fixed (STORE-READINESS.md).
- Icons: the only source is a 512 pixel PNG, so the 1024 pixel iOS icon is upscaled (flat shapes, looks fine at a glance, but ask for the original artwork if you have it).
- Store screenshots come from the website demo in a headless browser, not from a device.
- Payments compliance is a decision for you, and is not implemented.

## What only you can do

1. Decide the payments route (A or B) and the review-access plan; see `STORE-READINESS.md`.
2. Review, commit and deploy the CORS change in `/home/user/echp`.
3. Create the Apple Developer (GBP 79 a year) and Google Play (USD 25) accounts; complete identity and, for Play, testing requirements.
4. Create and back up the upload keystore; sign the AAB.
5. Archive and upload on a Mac; test on real devices.
6. Add a web page for requesting account deletion, update the privacy policy and terms for the apps, and answer the store forms.
7. Provide the reviewer access (demo, or a reviewer mailbox).

---

## Update, 10 Nov 2026

- **Capacitor 8** (was 6). Android now targets **API 36** (Android 16) with minSdk 24, so it meets Google Play's current target requirement. Rebuilt and tested: `./gradlew assembleDebug bundleRelease` from `android/`.
- **iOS:** Capacitor 8 needs **Xcode 26 or newer** on the Mac and an iOS 15 deployment target, and adopts UIScene. The iOS project was migrated, but has still never been opened or built (no Mac here). Run `npm run sync`, then `cd ios/App && pod install` (or let Xcode resolve packages), then open it in Xcode.
- **Downloads and printing:** the native layer now sends backups, calendar files and documents (blob downloads) through the system share sheet, and `navigator.canShare` no longer claims it can share files. `window.print()` shows a plain message ("Printing is not available in the app yet") instead of doing nothing. Real printing from inside the apps is still not built.
- The Android SDK on this machine is at `/home/user/android-sdk` (platform 36, build-tools 36.0.0).
