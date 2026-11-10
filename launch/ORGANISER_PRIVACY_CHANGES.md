# Child Organiser privacy policy: what has to change before the app goes in the stores

I'm not a lawyer. This lists what the code actually does versus what `privacy.html` says, and the facts only you can supply. Please have the final wording checked.

## Facts only you can provide
- Your legal name or company name, and a postal address, as the data controller.
- Whether you are registered with the ICO (and the fee tier), and your contact for data protection.
- How long you keep: account data, the private copy, documents, reminder records, and server logs.
- Where Supabase (the account provider) stores data, and any other regions.

## Wording that is wrong or out of date now
1. "Stays in your browser": in the apps it is stored in the app on the phone, not the browser. Say "on your device".
2. The private copy is described as unreadable to us. It is encrypted at rest with a key derived from a secret held on our server. It is **not** end-to-end encrypted. Say "encrypted when stored", not "we cannot read it".
3. The scan consent dialog now names Anthropic (done in the app). The policy should name Anthropic as the AI provider, and say how long they keep the input (check your agreement with them).
4. Add **Netlify** (hosts the functions and holds the private copy, documents and reminders), alongside Supabase (accounts), Resend (emails) and Anthropic (reading letters).
5. "Delete my reminder data" also deletes the private copy and documents. Say so, or split it.
6. Add the in-app **Delete my account** (new): what it deletes, and that the account is shared with the Activity Finder.
7. Add the right to complain to the ICO, international transfers, and retention periods.
8. The "last updated" date, and re-copy the policy into the app bundle whenever it changes.

## Store answers that follow from this
- Google Play Data safety and Apple App Privacy answers are in `native/organiser/STORE-READINESS.md` section (c).
- Both stores need the live policy URL, and Google needs the deletion page: `https://includeme.uk/delete-account.html` (updated, not yet deployed).
