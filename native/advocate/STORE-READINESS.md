# EHCP Tracker: store readiness review

Written from reading the code in `/home/user/echp` (branch `claude/website-only-deployment-3f598c`, `index.html` line numbers as of this review) and the Capacitor project in this folder. I am not a lawyer and store rules change: check the current text of each guideline before you submit. Where I am inferring how a reviewer will behave, I say so.

**Short version.** The app is technically ready to build and runs on Android. It is NOT ready to submit to the App Store as it stands, for two reasons: it sells a digital subscription through Stripe inside the app (guideline 3.1.1), and printing, file export and backup downloads probably do not work inside a native webview (section 3, "Known functional gaps"). Account deletion exists (good).

---

## (a) Payments: Stripe subscription inside a store app

### What the app does today

- Server: `netlify/lib/advocate.mts` `handleCheckout` (line 385) creates a Stripe Checkout session, GBP 3.99 a month (`MONTHLY_PENCE = 399`, line 16), with an optional 3-day trial that needs a card (`TRIAL_DAYS = 3`).
- Client, where a purchase or trial starts: `startCheckout()` (`index.html` line 3425) posts to `/api/checkout` then does `window.location.href = out.url` to Stripe. It is reached from:
  - `openTrialSheet()` (3477), via `startTrial()` (3476), from the "choose" screen and after sign-in with trial intent (3553-3556).
  - `openUnlock(reason)` (3385), via `needFeature()` (3145), `canAddChild()` (3151), `blockedEdit()` (3157), the pay bar button, Settings, and the "choose" screen.
  - `pickIntent('trial' | 'pay')` (3298) from the landing page.
- Screens that mention price or the trial (all would be seen by an iOS reviewer):
  - Landing page, lines 580-581 (hero button and "GBP 0 today, then GBP 3.99 a month"), 624-633 (price box, two buttons), 641-642 (FAQ), 648-653 (bottom call to action and sticky bar).
  - Choose screen, lines 657-690 (two price cards, "I have an access code").
  - Sign-in step text, lines 3300-3315.
  - Pay bar, `renderPayBar()` 3168-3181.
  - Settings account card, `renderAccount()` 3182-3210 (subscribe, cancel, access code).
  - Unlock sheet 3385-3410 and trial sheet 3477-3486 (mention Stripe).
  - Demo banner `demoBar()` 1023-1028 ("Start my free trial").
  - Data note and About text mentioning Stripe, 1034 and 3493-3501; `privacy.html` and `terms.html` also describe Stripe billing.
- Lock-out behaviour that makes the paywall central: `isLocked()` and `maxChildren()` (3119-3130). A new account with no trial and no subscription has `maxChildren() = 0`, so it cannot add a child at all. In effect the app is unusable without starting a Stripe trial or subscription, except:
  - Demo mode (`?demo=1`), which is in-memory only.
  - If `/api/config` says payments are off (`enabled: false`), `boot()` (3522-3530) skips accounts and everything is free. The same happens on a first launch while offline (`PAYON_KEY` is not yet "1").
  - Free access codes (`openRedeem`, 3438; `handleRedeem`, `advocate.mts` 465).

### Why this matters

- **Apple, guideline 3.1.1:** digital features and subscriptions unlocked inside an iOS app must use in-app purchase. Apps may not use their own mechanisms to unlock functionality (the guideline names license keys, QR codes and similar), and in storefronts outside the US they may not include buttons, links or calls to action steering people to other purchase methods. This app does all of that. The "multiplatform service" exception (3.1.3(b)) lets people use something they bought elsewhere, but only if the same thing is also sold by in-app purchase in the app. The "reader app" exception (3.1.3(a)) covers media (books, music, video and so on), which this is not. My expectation: the current build will be rejected under 3.1.1 (and probably 3.1.3).
- The access-code box is a second risk under 3.1.1 ("own mechanisms to unlock"). Codes are free comps, not sales, so you may be able to argue for them, but expect the question.
- **Google Play:** the Payments policy requires Google Play Billing for digital goods and features unlocked in an app distributed on Play, with limited exceptions that I do not believe apply to a UK app like this (alternative billing programmes are region-limited: check the current list). Same conclusion: Stripe Checkout inside the Play build is a policy risk.

### Options for Paul (nothing is implemented)

**Option A: the store apps are free to use, purchases happen only on the web, and the app says nothing about it.**
- What it means: in the native build, hide every price, trial, subscribe, Stripe and "access code" mention and every link to the website's purchase flow. The app must then be fully usable without paying, or usable only for people who bought on the web, which is the risky half (see below).
- Honest assessment: this works cleanly only if the native build is genuinely free with no paywall, for example the full app with no limits (revenue then comes only from web users). If the native build still locks features behind a web-bought subscription and has no in-app purchase, I expect Apple to reject it under 3.1.1/3.1.3(b), because the app has to sell the same thing by IAP to use the multiplatform exception. A "log in to see what you bought on the web" flow with no sign-up link is commonly attempted but is not safe to rely on.
- Code locations to change (decide per platform using the shim's `Capacitor.getPlatform()` or an `is-native` class, which `native-shim.js` already puts on `<html>`):
  1. `index.html` 573-690 (landing and choose views): replace with a plain "Sign in / Try the demo" start, or go straight to the app.
  2. `index.html` 3119-3130 (`isLocked`, `maxChildren`, `limitFor`): return "not locked" on native, so nothing triggers `openUnlock`.
  3. `index.html` 3168-3210 (`renderPayBar`, `renderAccount`): hide the pay bar, subscribe and access-code buttons. Keep sign out, sign out everywhere, and Delete my account.
  4. `index.html` 3385-3486 and 3425 (`openUnlock`, `openTrialSheet`, `startCheckout`): unreachable once 2 is done; guard them anyway.
  5. `index.html` 1023-1028 (demo banner), 1034 and 3493-3501 (text mentioning Stripe and the trial).
  6. Server: `handleCheckout` (`advocate.mts` 385) can stay for the web.
  7. Because the website and the app are one codebase, do this behind a flag set by the shim so the website is unchanged, rather than editing the live page for everyone.

**Option B: sell the subscription in the app with in-app purchase, using RevenueCat (my recommendation if you want native revenue).**
- What it means: Apple IAP auto-renewing subscription and Google Play Billing subscription, one product each at about GBP 3.99 a month, with a 3-day free introductory offer (both stores support free trials, and this replaces the Stripe trial in the native apps). RevenueCat (SDK `@revenuecat/purchases-capacitor`) handles receipts and gives you one "entitlement" to read.
- Costs: Apple takes 15% if you join the Small Business Program (under USD 1M a year), otherwise 30%. Google takes 15% on subscriptions. RevenueCat is free until your tracked monthly revenue passes about USD 2,500, then roughly 1% (check their current pricing). Web (Stripe) customers still pay no store fee.
- Code locations:
  1. New plugin plus a small `native-iap.js` loaded by the shim: configure RevenueCat, fetch offerings, `purchasePackage`, `restorePurchases` (Apple requires a visible Restore Purchases button).
  2. `index.html` 3385-3486 (`openUnlock`, `openTrialSheet`) and 3425 (`startCheckout`): on native, call the IAP flow instead of `/api/checkout`.
  3. Server: `getEntitlement` (`advocate.mts` 175-206) must also accept a RevenueCat entitlement (a webhook from RevenueCat that records the subscription against the email, or a server call to RevenueCat's API). `handleSubscription` (425) cancel/resume does not apply to store subscriptions: on native, Settings should send people to the store's subscription page.
  4. `renderAccount()` 3182-3210: show store subscription state, "Manage subscription" and "Restore purchases".
  5. `handleDeleteAccount` (361): deleting the account does not cancel an Apple or Google subscription; the in-app text must say so and point to the store settings.
  6. Terms, privacy and the listing copy need updating (store billing, store receipts).
  7. The access-code redeem stays web-only or is hidden on iOS.
- Effort: a few days of work plus testing in Apple sandbox and Play licence testers. You will need App Store Connect and Play Console products created first.

**My recommendation:** B if you want revenue from store users; otherwise A, but only in its honest form (the native build fully free, no purchase mention) and decide that knowingly. Do not ship the current build with Stripe screens to either store. I could not test either store's review, so treat all of the above as a risk assessment, not a prediction.

---

## (b) Account deletion (Apple 5.1.1(v), also Google Play)

- It exists in the app: Settings, account card, "Delete my account" (`index.html` 3209, `openDeleteAccount` 3231, `confirmDeleteAccount` 3243). It needs a confirmation tick, then calls `POST /api/account/delete` (`advocate.mts` `handleDeleteAccount`, 361): deletes the Stripe customer record(s), the reminders record, any unused sign-in code, ends all sessions, then erases this device's data. That satisfies Apple's in-app requirement.
- It only appears when payments/accounts are on and the person is signed in, which is when an account can exist. Good.
- Gaps and to-dos:
  - Google Play also wants a web URL where people can request deletion without installing the app, entered in the Data safety form. I did not find a web page for that. Options: a short page on info.includeme.uk (for example `/delete-account/`) that explains the in-app route and a hello@includeme.uk fallback.
  - If you build Option B, deletion must also tell people to cancel the store subscription.
  - Stripe keeps payment records it must keep by law; the in-app text says so. That is acceptable but mention it in the review notes.

## (c) Apple 4.2 (minimum functionality) and wrapped websites

- Risk: Apple rejects apps that are "just a website in a wrapper" or a repackaged site. This app loads a bundled copy of the site in a webview, so a careless reviewer could classify it that way.
- What helps (all true today): it works offline from the bundle; all case data is stored on the device and the app is useful without a network (deadline clock, evidence log, contacts, provision tracker, letters from templates); it uses native camera and photo access to attach photos of letters and to read a plan from photos; it has its own icon, splash and status bar behaviour; it does something specific and useful (EHCP statutory deadline tracking) that is not simply a marketing site.
- What would help more, not built: native local notifications for deadlines (`@capacitor/local-notifications`), native share and file saving for backups and exports (`@capacitor/share`, `@capacitor/filesystem`), haptics. A local-notifications feature in particular is a clear "this is a real app" signal and also removes the iOS web-push gap.
- Reviewer notes to write: explain offline use, on-device storage, camera/photo use, and give a way in (see Review access below).
- Review access problem: sign-in is an emailed 6-digit code, so a reviewer cannot get in. Offer the built-in demo (landing page link "Or look around a demo first") and, ideally, a dedicated reviewer mailbox you control with the code supplied in the review notes at the time of review. Decide this before submission (it is Paul's job, see README).

## Known functional gaps in a native webview (not fixed, not tested on a device)

These would be noticed by reviewers and by users. I could not test any of them: there is no Android emulator or device here and no Mac.
- `window.print()` is used for Print chronology, Case pack and printing letters (`index.html` 1696, 2291, 2666, 3150). Printing does not work in Android WebView or iOS WKWebView. Needs a native share/PDF route.
- Calendar export and backup fall back to a Blob `<a download>` (`index.html` 2768, 2949). Blob downloads do not work in iOS WKWebView and need a download handler on Android. Backup is the only recovery path for case data, so this one matters.
- `navigator.share` with files (2947) works in iOS WKWebView but is not reliable in Android WebView.
- Stripe Checkout returns to `https://advocate.includeme.uk/?paid=1` (`advocate.mts` 406), which opens the website, not the app, because the server builds the URL from the request origin.
- Fonts load from Google Fonts at run time (index.html line 15-16), so offline the app uses fallback fonts. Bundling the fonts would fix this and also removes the Google IP disclosure.
- Web push does not exist in a store webview; the shim removes `PushManager` so the app offers its email reminders only (see (e)).

## (d) Privacy policy URL, data-safety (Google) and App Privacy (Apple), age rating

**Privacy policy URL:** `https://advocate.includeme.uk/privacy.html` (exists, last updated 31 October 2026). It must also be reachable from inside the app: the bundled links open it in the system browser (shim). Terms: `https://advocate.includeme.uk/terms.html`. The policy should be updated to mention the mobile apps (for example, that the apps do not use the analytics tallies; see below) and, for Option B, store billing.

**What the code actually collects** (from `privacy.html`, `advocate.mts`, `reminders.mts`, `planread.mts` and `visit.js`):
- Email address: sign-in, linked to the Stripe customer record. Linked to the person.
- Sign-in codes (hashed, 10 minutes), session timestamps (hashed email key, 31 days).
- Trial and subscription status, free access code record (Stripe metadata).
- Payment: handled entirely by Stripe Checkout in a browser page; the app never sees card details.
- Deadline reminders (optional, paid): push endpoint (web only, not in the store apps), email preference, deadline titles and dates, child first name only if ticked.
- Plan reading (optional, consent first): photos or PDF pages of the EHC plan are sent through our server to Anthropic's API and not stored. This is special-category data about a child, sent to a third party processor.
- Everything else (child details, evidence, photos, notes, letters, contact logs) stays in the device's local storage and is never uploaded.
- Server logs (IP address, time) at Netlify.
- Google Fonts request: Google sees the device IP address.
- Visit tallies: `visit.js` only counts on the real website hostnames. In the native app the hostname is `localhost`, so it sends nothing (verified by reading the code; the headless test used the bundled page). No analytics SDKs, no ads, no tracking.

**Google Play Data safety (suggested answers, check against the form as it stands):**
- Collects data: Yes. Shares data: the AI plan reading shares photo/document content with a service provider (processor acting on your behalf); Google's form treats processors differently from "sharing", so read their definitions before answering.
- Personal info, Email address: collected, required for account, not shared, purpose Account management and App functionality.
- Photos and videos: collected only if the person uses plan reading (sent off device, processed ephemerally, not stored). Mark as collected, optional, purpose App functionality, ephemeral processing.
- Files and docs: same as photos for PDFs.
- Financial info: none collected by the app (Stripe handles it outside the app). If Option B: purchase history via Google Play, not collected by you directly.
- App activity / Web browsing / Location / Contacts / Health: none.
- Device or other IDs: none by the app. (IP addresses appear in host logs, disclose in the policy.)
- Data encrypted in transit: yes (HTTPS). Users can request deletion: yes, in-app and by email; you also need the web deletion URL (see (b)).
- Target audience: 18+ (parents and carers), not for children. Do not opt into the Families programme.

**Apple App Privacy (nutrition labels), suggested:**
- Contact Info, Email Address: collected, linked to identity, used for App Functionality (not tracking).
- User Content, Photos or Videos and Other User Content: only for plan reading, linked to the user is arguable; data is processed ephemerally and not stored, so many developers answer "not collected" under Apple's rule for data processed only on request and not retained. Be cautious: because the pages go to a third party, I suggest declaring it (Other User Content or Photos, App Functionality, not linked, not tracking) and accept being over-inclusive.
- Purchases: none by you for Option A. Option B: Apple holds purchase data; RevenueCat receives an app user ID and receipt, so declare Purchases and Identifiers.
- Tracking: No. No data is used to track people across other companies' apps and sites. Therefore no App Tracking Transparency prompt is needed.
- Also needed: a PrivacyInfo.xcprivacy file. The Capacitor framework ships its own privacy manifest, but the app target (`ios/App/App`) has none after `cap add ios`, so add one in Xcode (declare no tracking, and the required-reason API usage for UserDefaults and similar that Capacitor and WKWebView use).

**Age rating (both stores):**
- Apple: all content questions "None" (no violence, sexual content, gambling, horror, drugs, alcohol, profanity, unrestricted web access, user-generated content shared with others). Medical or treatment information: the app tracks education and health provisions but gives no medical advice; answer "None" but be ready to say it records information the parent types. Expected rating 4+. Make sure it is not put in the Kids category.
- Google (IARC questionnaire): no violence, sexuality, language, controlled substances, gambling, no user interaction between users, no location sharing, no digital purchases beyond a subscription (Option B) or none (Option A). Expected rating PEGI 3 / Everyone. Target audience 18+.
- Note: the content is legal information about the English SEND system. The app says it is not legal advice; keep that statement in the store descriptions.

## (e) Push notifications

- Today reminders use web push: `index.html` 2831-2917 (`remPushSupported`, `remEndpoint`, subscribe via `PushManager` and a VAPID key), server `netlify/lib/reminders.mts` using the `web-push` package, plus daily emails via Resend. Both are optional, paid features.
- In a store webview, web push does not work (Android WebView has no Push API; iOS WKWebView does not support it for apps). `native-shim.js` deletes `PushManager` so the app falls back to its email reminders. I tested that the shim does this in headless Chromium; I did not see the Settings screen change on a device.
- What Capacitor push would need (left out, as asked): `@capacitor/push-notifications`; Firebase project and `google-services.json` for Android (FCM); an Apple Developer push key (APNs) and the Push Notifications capability in Xcode; a server endpoint to store device tokens (new, alongside `api-reminders-subscribe`), and `reminders.mts` extended to send via FCM/APNs; account deletion to remove tokens; privacy policy and data-safety updates (device token). Simpler alternative that needs no server: `@capacitor/local-notifications` scheduled on the device from the deadline dates the app already holds. This keeps the "data stays on device" promise and I would pick it first.

## Other checks

- Permissions (Android): INTERNET and CAMERA only (camera marked not required). Gallery pick uses the system picker, no storage permission. `allowBackup` is off so case data is not copied to Google cloud backups; this matches the "stays on your device" promise but means data is lost when moving phones unless the person uses the app's backup.
- iOS Info.plist: NSCameraUsageDescription, NSPhotoLibraryUsageDescription, ITSAppUsesNonExemptEncryption = false (HTTPS only). No microphone, location or tracking keys.
- Android target SDK is 34 (Capacitor 6 default). Google Play requires new apps and updates to target a recent API level (35 or higher at the time of my knowledge, and the requirement moves each year; check the current Play Console message). If Play rejects 34, upgrade to Capacitor 7 or later, which targets a newer API.
- CORS is prepared in the website repo but NOT deployed. The app cannot sign in or load its config until it is deployed (see README).
