# IncludeMe — App Store Deployment Guide

## Prerequisites
- Node.js installed
- `.env` file with your Supabase credentials
- Android Studio (for Android)
- Xcode on a Mac (for iOS)

---

## First time setup

```bash
npm install
npx cap add android
npx cap add ios        # Mac only
```

---

## Every time you update the app

```bash
npm run build          # builds the web assets
npx cap sync           # copies them into Android/iOS projects
```

---

## Android (Google Play Store)

### Build & test locally
1. Install Android Studio (free): https://developer.android.com/studio
2. Run: `npx cap open android`
3. Android Studio opens — click the green ▶ Run button to test on your phone or emulator

### Publish to Google Play
1. Sign up for a Google Play Developer account: https://play.google.com/console (£20 one-off)
2. In Android Studio: **Build → Generate Signed Bundle/APK → Android App Bundle**
3. Create a keystore (save this file safely — you need it for every update)
4. Upload the `.aab` file to Google Play Console
5. Fill in store listing details (description, screenshots, category: Education)
6. Submit for review — usually approved within a few days

---

## iOS (Apple App Store)

### Requirements
- A Mac (or rent one at MacInCloud.com for ~£1/hr)
- Apple Developer account: https://developer.apple.com (£79/year)
- Xcode (free, Mac only)

### Build & publish
1. On a Mac, open Terminal in the project folder
2. Run: `npm install && npm run build && npx cap sync ios`
3. Run: `npx cap open ios`
4. Xcode opens — sign in with your Apple Developer account
5. Select your app target → Signing & Capabilities → set your Team
6. **Product → Archive** to create a release build
7. **Distribute App → App Store Connect → Upload**
8. Go to https://appstoreconnect.apple.com and submit for review
9. Apple reviews in 1–2 weeks

### App Store listing details to prepare
**See [`APP-STORE-LISTING-COPY.md`](APP-STORE-LISTING-COPY.md) for ready-to-paste
name, subtitle, keywords, description, and age-rating guidance for both
stores** — written to fit each store's actual character limits. The age
rating system changed significantly in 2025 (new 13+/16+/18+ tiers replaced
12+/17+, plus new mandatory questions on in-app messaging and content) so
don't rely on an old "4+" assumption — answer the live questionnaire
honestly based on what's actually in the app (notably, the reviews and
direct messaging between families and providers).

---

## App ID
`uk.includeme.app`

---

## Updating the app after launch
1. Make your code changes
2. `npm run build`
3. `npx cap sync`
4. For Android: build new signed AAB, upload to Play Console as new release
5. For iOS: Archive in Xcode, upload to App Store Connect

---

## Troubleshooting

**White screen in the app?**
- Make sure `vite.config.js` has `base: "./"` (already set)
- Run `npx cap sync` after every `npm run build`

**Supabase not connecting?**
- Make sure your `.env` is set and you ran `npm run build` with it in place
- The app uses your Supabase URL/key baked in at build time

**Maps not working?**
- Leaflet works in Capacitor — no changes needed
