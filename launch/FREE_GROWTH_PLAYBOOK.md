# Free growth playbook (no ad budget)

One story across all four: **free tools for families of children with SEND.**
Only use numbers you can show (for example, "20+ towns" is fine; visitor counts are not unless you have measured them).

---

## 1. Facebook groups

**How to do it (about 20 minutes a day):**
1. Search Facebook for: "SEND parents [your county]", "EHCP support", "autism parents [town]", "ADHD parents UK", "parent carer forum", "SENDIASS". Join 10–15.
2. Read each group's rules. Many ban links. If so, don't post links. Answer questions, then offer the link by message when someone asks.
3. For two weeks, mostly help: answer questions, share experience. Then post one of the posts below, no more than once a fortnight per group.
4. Always use the tagged link so we can see what works.

**Post A: the calculator (EHCP groups)**
> If it helps anyone: I came across a free calculator that works out your EHCP deadlines (6, 16 and 20 weeks) from the date the council received your request. No sign-in and nothing is stored. It's a guide, so check it against your letters. https://info.includeme.uk/ehcp-deadline-calculator/?utm_campaign=grp_calc

**Post B: the Finder (local groups)**
> Looking for something for the weekend or half term? There's a free finder with clubs, therapies and charities for children with SEND, searchable by town or postcode. If you know somewhere that isn't listed, you can add it. https://includeme.uk/activities/?utm_campaign=grp_finder

(Replace with your town's page, e.g. `https://includeme.uk/activities/guildford/?utm_campaign=grp_finder_guildford`.)

**Post C: the Organiser (general parent groups)**
> Does anyone else have a pile of hospital letters and school reports? There's a free app (Child Organiser) where you photograph a letter and it files it and puts the appointment in the diary. Everything stays on your phone unless you choose otherwise. https://info.includeme.uk/passport/?utm_campaign=grp_organiser

**Reply template** (when someone asks "what's the deadline for X?")
> The council has 6 weeks to decide whether to assess, and 20 weeks in total from when they receive the request to issue the final plan. This calculator works the dates out from your request date: [link]. IPSEA also has free advice if anything looks late.

**Don't:** post the same text in every group on the same day, post in groups that ban promotion, or reply to people in distress with a link.

---

## 2. Partners who already reach families

Email (or use the contact form for) each. Ask for one thing only: "would you consider listing it on your resources page or mentioning it in your newsletter?"

Who to approach:
- Your local **SENDIASS** service, and the **Local Offer** page of each council (they list useful tools).
- **Parent carer forums** (find yours via the National Network of Parent Carer Forums).
- **Special schools and PTAs**: ask for a mention in the newsletter.
- **Local autism, ADHD and Down's syndrome groups**.
- **Charities** with a resources page (Contact, Mencap local groups, NAS branches).
- **SEN solicitors and advocates**: a free calculator is a useful thing to hand to enquirers.
- **Providers listed in the Finder** (the weekly provider emails): ask them to share their listing.

**Partner email**
> Subject: A free EHCP deadline calculator for the families you support
>
> Hello,
>
> I run IncludeMe, a small UK project making free tools for families of children with SEND. One of them is an EHCP deadline calculator: parents enter the date the council received their request and it shows the 6, 16 and 20 week dates, plus appeal and review dates. It needs no sign-in and stores nothing.
>
> https://info.includeme.uk/ehcp-deadline-calculator/
>
> We also run a free activity finder (clubs, therapies and charities) at https://includeme.uk, and the Child Organiser, a free app that files letters and reports from a photo.
>
> If you think it would help the families you work with, would you consider linking to it from your resources page or mentioning it in a newsletter? I'm happy to send a short blurb or image.
>
> Thank you,
> Paul
> IncludeMe · hello@includeme.uk

**Provider email (existing listings)**
> Subject: Your listing on IncludeMe: please share it with your families
>
> Hello, your [activity] is listed on IncludeMe's free SEND activity finder: [link to the listing]. Families searching in [town] can find you there. If you share the link with the families you already know, more will find you. You can also update your details for free by claiming the listing.

---

## 3. Press release (local news, Facebook community pages, parent blogs)

> **Free tools help families of children with SEND keep track**
>
> [Town], [date]. A UK project, IncludeMe, has made three free tools for families of children with special educational needs and disabilities.
>
> - An **activity finder** listing clubs, therapies and charities for SEND children in [N] UK towns and cities.
> - A free **EHCP deadline calculator** that works out the legal timescales from the date a council receives a request.
> - **Child Organiser**, a free app that files letters and reports from a photograph and keeps appointments in one diary. Details stay on the family's phone unless they choose a private copy.
>
> "[One honest sentence in your own words about why you built it.]"
>
> The tools are free at includeme.uk, with no sign-in needed to try them. Contact: hello@includeme.uk.

Send to: local papers and their websites, hyperlocal sites, Facebook community pages, BBC local radio's community desks, parent blogs, SEN magazines and newsletters. Include one screenshot.

---

## 4. Search (Google)

Done in code, not by hand:
- Every town with 3+ listings has its own page at `includeme.uk/activities/<town>/`, plus a hub and a sitemap.
- Submit `https://includeme.uk/sitemap.xml` in **Google Search Console** (free): add the property, verify via DNS, submit the sitemap. Do the same for `info.includeme.uk`.
- Re-run `node finder-app/scripts/generate-town-pages.mjs` weekly after new listings are added, then deploy.

## 5. Make every user a sharer

Added in the apps: a "Share with another parent" button in the EHCP Tracker settings and the Child Organiser footer, and share buttons on the calculator results (WhatsApp, Facebook, native share). All links carry a `share_*` tag, so you can see them in admin.

## Weekly routine (about an hour)
1. Post once in 2–3 groups; reply to questions in the others.
2. Send 5–10 partner emails.
3. Check admin for which tagged links got clicks, and do more of those.
