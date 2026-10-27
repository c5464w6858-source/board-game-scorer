# Advocate launch kit

Do not publish anything below until the go-live checklist is done and the live purchase test has passed.

## Go-live checklist
1. Stripe: activate the account, add business details, set the statement descriptor (e.g. INCLUDEME ADVOCATE), turn on customer receipt emails.
2. Stripe: create a LIVE restricted key with only Customers: Write, Checkout Sessions: Write and Subscriptions: Write. Add it in Netlify (advocate site, production) as the secret `STRIPE_SECRET_KEY`. (Also give the key Subscriptions: Write, so people can cancel in the app.) Do not paste it in chat.
3. Subscribe once at £3.99 a month with a real card, confirm the app unlocks, the receipt arrives and Cancel subscription works, then refund it in Stripe.
4. Add the trader's name and address to terms.html and privacy.html. Check ICO registration.
5. Deploy branch `claude/info-site-go-live` (removes "Coming soon", links to the app).
6. Post the announcements below.

## Where to find parents
- SENDIASS services (local authority, free advice for parents): email the local service manager with the short note below.
- Parent carer forums, and Facebook groups for EHCP / SEND parents (read each group's rules on promotion, ask admins first).
- SEND charities and support groups (IPSEA, Contact, Square Peg, local autism and ADHD groups).
- Reddit r/UKParenting, r/autismUK, r/ADHD_UK (follow each subreddit's self-promotion rules).
- The free deadline calculator is the easiest thing to share: https://info.includeme.uk/ehcp-deadline-calculator/

## Short announcement (groups, messages)
> Going through an EHCP and losing track of dates? I've built a free calculator that shows the 6, 16 and 20 week deadlines, your appeal window and annual review from the date your request was received: https://info.includeme.uk/ehcp-deadline-calculator/
> There is also Advocate, an organiser that reminds you before each deadline, gives you template letters and prints a case pack. 3-day free trial, then £3.99 a month for the whole family, cancel any time. Your child's details stay on your device. https://info.includeme.uk/advocate/

## Note to a SENDIASS or charity
Subject: A tool for parents going through the EHCP process

Hello, I'm writing about Advocate (https://info.includeme.uk/advocate/), a low-cost monthly organiser for parents going through an EHCP. It tracks the statutory deadlines, sends reminders before each one, gives template letters based on the Children and Families Act 2014 and SEND Regulations 2014, and produces a printable case pack. There is also a free deadline calculator at https://info.includeme.uk/ehcp-deadline-calculator/ that you are welcome to share. It is not legal advice and does not replace your service. I would be glad to hear feedback, and can give your service a free code if useful. Thank you.

## Support replies (hello@includeme.uk)
- Can't sign in: "Enter your email on the sign-in screen and we send a 6-digit code. It lasts 10 minutes. Check spam. If it still doesn't arrive, reply and we will look."
- Paid but not unlocked: "Sign in with the same email you paid with. If it still shows the trial, reply with the receipt email and we will check."
- Refund: "You can cancel any time in Settings and keep access until the end of the month you have paid for. You can cancel within 14 days of subscribing and pay only for the time used. If something is wrong, tell us and we will put it right." (Check against the terms before use.)
- Delete my data: "Account menu, Delete account. This removes your account and reminders from our servers. Case details live on your device only."
- Lost data / new phone: "Use Backup in the app to save a file, then Restore on the new device."
