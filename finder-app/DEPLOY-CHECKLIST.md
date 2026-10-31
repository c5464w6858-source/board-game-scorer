# Deploy & Test Checklist

Work top to bottom. Each item is something to actually click/observe, since auth
and email can only be verified against your live Supabase project.

## A. Account creation (email + password)
- [ ] Open the app, choose **Create Account**, pick *Carer / Parent*.
- [ ] Enter name, email, password (6+ chars) → submit.
- [ ] **If "Confirm email" is OFF:** you're signed in immediately; your initial
      appears top-right. ✔
- [ ] **If "Confirm email" is ON:** you see *"check your email to confirm"*, and
      a verification email arrives. Click the link → return and sign in. ✔
- [ ] In Supabase → *Authentication → Users*, the new user is listed. ✔
- [ ] Create a second account as *Organisation* → confirm the **Add listing**
      button shows for that account type. ✔

## B. Login & session
- [ ] Sign out, then sign back in with the same credentials. ✔
- [ ] Refresh the page → you stay signed in (session persists). ✔
- [ ] Sign in on a second device/browser → same account, same favourites
      (proves it's server-side, not per-device). ✔

## C. Password reset email
- [ ] On the Sign In screen, type your email, click **Forgot password?**
- [ ] You see *"reset link sent"* and the email arrives. ✔
- [ ] The link opens the app; set a new password and sign in with it. ✔

## D. Sign in with Google
- [ ] Click **Continue with Google** → Google consent → back to the app, signed
      in. ✔
- [ ] New user appears in Supabase Users with provider = google. ✔

## E. Sign in with Apple  (needs paid Apple Developer membership)
- [ ] Provider enabled in Supabase. **Continue with Apple** → Apple sheet →
      signed in. ✔
- [ ] If the button errors with "provider not enabled", Apple isn't configured
      yet — that's expected until you finish the Apple setup.

## F. Favourites & profile persistence
- [ ] Heart a few activities → they appear under **Saved**. ✔
- [ ] Edit your name in the account menu → refresh → the change sticks. ✔

## G. Listings (organisation account)
- [ ] As an Organisation account, **Add listing** → fill in → publish.
- [ ] The new card appears in the list and persists after refresh. ✔
- [ ] Edit and delete it; both reflect immediately and after refresh. ✔

## H. Photos (only if GOOGLE_PLACES_API_KEY is set on the host)
- [ ] Cards show real venue photos. Where none is found, a clean branded cover
      shows instead (never a broken image). ✔
- [ ] Network tab: photo requests go to `/api/place-photo` (key not exposed). ✔

## I. Production hardening
- [ ] Confirm email ON.
- [ ] Custom SMTP configured (auth emails no longer rate-limited).
- [ ] Live origin added to Supabase redirect URLs.
- [ ] `kv` write policy reviewed.
