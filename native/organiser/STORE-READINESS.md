# Child Organiser: store readiness review

Written from reading the code in `passport-app/index.html`, `passport-app/privacy.html`, `sw.js`, `visit.js`, and the server code that answers `/api/diary/*` (repo `echp`, `netlify/lib/diary.mts`). I am not a lawyer; legal wording is flagged, not fixed. Nothing here has been tested on a real phone or submitted to a store.

## Blockers to clear before submitting (short list)

1. **No in-app account deletion** (Apple 5.1.1(v); Google Play also requires a deletion route plus a web URL). See (b).
2. **Android target SDK.** Capacitor 6 generates `targetSdkVersion 34`. Google Play has required newer targets for new apps and updates since August 2025 (API 35 then; I believe API 36 by now, but check Play Console, I cannot see it from here). A Capacitor 6 AAB will probably be refused. Plan on moving to the current Capacitor major (7 or later) before upload. Only `platforms;android-34` is installed here, so I built with 34. The same applies to the Xcode/iOS SDK minimum Apple currently enforces: check when you archive.
3. **Privacy policy does not describe the app or all processors.** See (a).
4. **Sign-in wall** may trigger Apple 5.1.1(v) pushback: the app keeps data on the device, yet you cannot open it without an account. See (f).
5. **Server CORS**: the AI scan, private copy, reminders will fail from the app until `https://localhost` and `capacitor://localhost` are allowed. Patch prepared in `server-changes/`, not deployed.
6. **"Print or save as PDF" does nothing in a webview** (`window.print()` is not supported). Hide or replace it before review, or reviewers will see a dead button.

## (a) Children's health and education data: policy versus code

Data entered about the child (name, DOB, diagnoses, medicines, allergies, school, EHCP, contacts, photos, documents) is special category data about a child.

**What the code does** (verified by reading):
- Stored on device in `localStorage` + IndexedDB. In the app that is the webview's sandbox: removed on uninstall, not encrypted by the app (relies on OS device encryption), no app PIN/lock.
- Sent off device only through: (1) **scan**: pages/PDF/text go to `advocate.includeme.uk/api/diary/scan`, then to Anthropic's API, after an in-app consent dialog; (2) **private copy** (opt-in): profile JSON and optionally documents, AES-GCM encrypted server-side with a key derived from a **server-held secret**; (3) **reminders** (opt-in): email, appointment id/date/category only; (4) **share links**: whole passport inside the URL fragment.
- Sign-up sends `{source:"organiser"}` metadata to Supabase, and a first-use date is stamped on the account (`markOrganiser`).
- The anonymous visit counter (`visit.js`) only fires on known web hostnames. Inside the app the hostname is `localhost`, so **the app sends no analytics at all**.

**Gaps Paul must fix or decide (wording is for him/his adviser):**
1. Policy says data is kept "in your browser's storage". It needs an app version of that sentence (app storage, deleted on uninstall).
2. Policy and UI say the private copy is encrypted so it is "unreadable", but the key is derived from a site secret the operator holds. It is encryption at rest, **not end-to-end**. Avoid wording that implies "we cannot read it" for the private copy.
3. **Netlify** (hosts the functions and Netlify Blobs where the private copy, documents and reminder records live) is not named as a processor. Supabase, Resend and Anthropic are. Add Netlify.
4. Missing: named data controller with postal address, ICO registration/fee status, retention periods (account, private copy, scan inputs), international transfers (Anthropic, Resend, Netlify, Supabase region: say where), right to complain to the ICO, how long Anthropic keeps API inputs (check your agreement; policy says "not stored" for your side only).
5. The scan consent dialog says "an AI service". Apple 5.1.2(i) expects you to say who receives the data. Name Anthropic in the dialog (code change in `askToRead`) as well as the policy.
6. **Label mismatch:** the button "Delete my reminder data" calls `DELETE /api/diary/data`, which (see `handleDiaryDelete`) also deletes the private copy and stored documents. The confirm text says "Your appointments on this phone are not touched" but does not mention the private copy being erased. Fix the wording or split the endpoint.
7. Deletion: policy says "email hello@includeme.uk". Apple and Google want it in the app. See (b).
8. A DPIA (UK GDPR Art. 35) is advisable: special-category child data plus AI. I have not seen one.
9. Policy "Last updated 29 October 2026" must be updated when changed; the app bundles a **copy** of `privacy.html` (stale until you re-sync). Store listings link the live URL.

## (b) Apple 5.1.1(v) in-app account deletion

**Not met.** There is no "Delete account" in the app. What exists:
- "Delete my reminder data" (`DELETE /api/diary/data`): erases reminder record, private copy and docs on the server. Does not delete the sign-in account.
- "Delete my private copy", per-child delete (device only).
- Sign out.

Missing:
1. A **"Delete my account"** button in the account menu with confirmation that calls a server endpoint that (a) runs the same wipe as `handleDiaryDelete`, (b) deletes the Supabase auth user (needs the service-role key, so a new Supabase Edge Function or Netlify function, e.g. `delete-account`, verifying the caller's access token), (c) signs out and clears local app data (optionally offering a backup first).
2. **Decision: the account is shared with the Activity Finder.** Deleting the Supabase user also removes their Finder login, favourites and any listings. Either warn clearly, or delete only Organiser data and "close" Organiser access (Apple will accept a clear full deletion; a partial one is risky). The existing `/api/account/delete` is for EHCP Tracker (Stripe + its own session) and does not touch Supabase.
3. For Google Play: a **public web page** where someone can request deletion (and the same URL entered in the Data safety form).
4. Apple requires deletion to be possible in-app without phone/email back-and-forth, so "email us" alone is not enough.

## (c) Data safety (Google Play) and App Privacy (Apple), based on the code

No ads, no tracking, no third-party SDKs, no analytics or crash reporting in the app. No location, contacts-book, microphone, or device IDs. No push token (web push is switched off in the app). Transit is HTTPS only.

| Data | Collected? | Purpose | Linked to user | Optional |
|---|---|---|---|---|
| Email address | Yes | Account, sign-in, reminder emails | Yes | No |
| Password | Held by Supabase (hashed); not listed as a type by Apple, covered by "credentials" in Play account flow | Account | Yes | No |
| Health info (child's diagnoses, medicines, allergies, appointment type) | Yes, only if private copy / scan / reminders used | App functionality | Yes | Yes |
| Photos and files (scanned letters, documents) | Sent for reading; stored only if private copy with documents on | App functionality | Yes | Yes |
| Other user content (names, contacts, school, portfolio) | Only in private copy / scan | App functionality | Yes | Yes |
| App interactions / diagnostics / identifiers | No | n/a | n/a | n/a |

Suggested answers:
- **Google Data safety:** Collects Personal info (email), Health info, Photos/files (all with "optional" except email). Shared with third parties: No for Play's definition, since Anthropic, Resend, Supabase and Netlify act as service providers on your behalf (check Google's current wording, and your own agreements). Encrypted in transit: Yes. Deletion request: Yes (after you build it, with the web URL). Not designed for children. Also complete Google's **Health apps declaration** (it stores health information; it is not a medical device and gives no diagnosis).
- **Apple App Privacy:** Data linked to you: Email address, Health (health and fitness), Photos or Videos, Other User Content, for App Functionality. Used for tracking: No. Add a link to the privacy URL. `ITSAppUsesNonExemptEncryption=false` is already set (HTTPS only; confirm).
- Apple 5.1.3 (health data): no ads or data mining, nothing stored in iCloud; satisfied.

## (d) Families / Kids Category

The app is for **parents and carers (adults)**, not children: sign-in with email and password, text addressed to "your child", no child-facing content, no play features.
- Google Play: Target audience = **18 and over** only. Do **not** tick any under-13 or "appeals to children" box (that would pull in the Families Policy and SDK restrictions). Do not opt in to Designed for Families.
- Apple: do **not** choose the Kids Category. Age rating questionnaire: answer truthfully. There is no violence, gambling, user-generated public content or unrestricted web access. "Medical or treatment information" is informational only; expect a low rating (4+ to 12+ depending on the current questionnaire). No age gate is needed beyond the terms. Mention "for parents and carers" in the description.
- Even though the app is not for children, the data is about children, so Apple 5.1.4 (kids data) and UK GDPR still matter in spirit. The consents above cover this.

## (e) Sign in with Apple (guideline 4.8)

Only required when a third-party/social login is offered. Verified: the sign-in screen offers **email + password** and **email a code** (Supabase) only; no Google, Facebook, Apple or other providers anywhere in `index.html`. Guideline 4.8 does not apply (own-account login is exempt). If a social login is added later, Sign in with Apple (or an equivalent privacy-preserving option) becomes mandatory.

## (f) Apple 4.2 minimum functionality

Risk: **medium**. The bundle is a PWA, which reviewers may see as a repackaged website. What makes it a real app, and what to say in review notes:
- Local-first data store (works offline once signed in); camera/photo capture of letters with AI extraction into a diary, contacts and an "abilities" portfolio; calendar export; emergency card and one-page passport; document vault with PDF, image, text and Word intake; optional encrypted private copy; email reminders; native share sheet and status bar integration.
- Weak points: (1) sign-in is needed even to use the local features (5.1.1(v), see above; consider allowing use without an account and asking for sign-in only for scan, private copy and reminders); (2) print/PDF button dead; (3) you need to provide **review demo credentials** (create a dedicated pre-confirmed test account yourself; I did not); (4) sign-up e-mail confirmation links open in the browser, not the app (the app rewrites the link to the live web app; the user then returns and signs in, or uses "email me a code" which stays in-app). Deep links (universal links) would be the proper fix.
- **Subscription upsell:** the page promotes EHCP Tracker (£3.99 a month, bought on the web). I hide that card in the native shim (`.upsell`). Showing an external purchase route for a digital subscription inside an iOS app risks 3.1.1/3.1.3 rejection, and Google Play payments policy is similar. Un-hide it only after checking the current rules and the "reader/multiplatform" exemptions.
- CLAUDE.md-style rule "no payments between users" is respected: the app takes no payments.

## (g) Notifications

- **Today (web):** two kinds. (1) E-mail reminders, sent by the server (`reminders-daily`/`diary-daily` through Resend). These work unchanged from the app. (2) Web push via service worker + VAPID. This does not work in a Capacitor webview (no service worker push on iOS WKWebView or Android WebView). The shim removes `serviceWorker`/`PushManager` and hides the "Notify this phone" checkbox.
- **Local notifications** (schedule on the device from appointment dates; nothing about the child leaves the phone) would need `@capacitor/local-notifications`, the Android 13+ `POST_NOTIFICATIONS` permission, a reschedule routine whenever appointments change, and awareness of iOS's cap of 64 pending notifications. Probably the best privacy fit.
- **Remote push** would need `@capacitor/push-notifications`, Firebase (FCM) for Android and an Apple APNs key, a device-token store on the server and changes to the daily job to send through FCM/APNs. More data held, so more policy work.
- Left out of this build, as asked.

## Other things worth knowing

- **Data loss risk:** uninstalling the app deletes everything not backed up or in the private copy. The in-app backup file is saved via the share sheet (see README for what was untested). Say so in the listing.
- **Android backup:** I set `allowBackup=false` and excluded everything in `data_extraction_rules.xml` so a child's data does not go into Google cloud backups.
- **External links** (Google Calendar, Outlook, WhatsApp, support) open outside the webview in the system browser on both platforms by default in Capacitor; not verified on a device.
- **`<input type=file>` capture:** see README, section "What I could not test".
