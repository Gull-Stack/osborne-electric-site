# osborne-electric-site

The live **osborne-electric.com** — Eleventy 2 static site, deployed to Vercel
(`gull-stack` scope, project `osborne-electric-site`). Repo
`Gull-Stack/osborne-electric-site`. `npm run build` → `_site/`, `npm run dev`
to serve.

Client context lives in `~/Documents/clients/osborne-electric/` (strategy,
takeoffs, GBP work). Trevor's Flight Deck is tenant `osborne` in
`~/Documents/internal/client-portal`.

## 🔴 His Google Business Profile is suspended — the site must corroborate it

Verified 2026-08-01: the profile (Osborne Electric and Contracting, LLC) reads
**Suspended**, originally for *deceptive content*. The violation — a public home
address on a service-area listing — was fixed the same day, and the profile now
carries **no address at all**. The appeal is still to file. Until it's reinstated,
every edit here has a second test: **does this contradict what we are about to
appeal with?** The evidence we appeal with is the LLC registration, which says
**Bluffdale**.

Rules that follow from that, and that a future session should not undo:

- **No `aggregateRating` markup anywhere.** A business marking up its own rating
  breaks Google's structured-data policy, and publishing a Google review count
  Google can't currently verify — while appealing a deceptive-content
  suspension — is the worst possible pairing. The 5.0 / 47 blocks were removed
  from `src/index.njk`, `src/brand-facts/index.njk` and the SLC guide on
  2026-08-01. `src/.well-known/brand-facts.json` still states "47 reviews" in
  prose; that's a customer claim rather than a Google one, left deliberately.
- **He is a service-area business: publish the city, never a street, never geo.**
  `PostalAddress` carries `addressLocality: "Bluffdale"` + region + country and
  nothing more; `areaServed` does the rest. Three different cities were previously
  asserted under one `@id` (Bluffdale on the homepage, Salt Lake City on
  brand-facts and the guide, Riverton on the profile) — that contradiction is
  exactly what Google's validation looks for. **One locality, everywhere.**
- **Never name his street.** `/areas/bluffdale-ut/` used to call out "the Deer
  Orchard Cove area" as the head office. That is his home, and a publicly
  identified residence *is* the SAB violation.
- **Name is "Osborne Electric & Contracting"** in prose, "Osborne Electric and
  Contracting, LLC" as the legal entity. The header once read "ELECTRIC **+**
  CONTRACTING"; the plus is the naming variant that triggered the original flag.
- 🔴 **Trevor is a JOURNEYMAN electrician, not a Master — Weston is the Master.**
  DOPL register: Trevor Steven Osborne holds **9015139-5504 (Journeyman
  Electrician, ACTIVE)** and **9015139-B100 (B100 General Building Qualifier)**.
  Journeyman is the level directly *below* Master. Weston Deloy Osborne is the
  **E200 General Electrical** qualifier and so the master electrician of record.
  The site used to call Trevor a Master Electrician, "the highest electrical
  certification in Utah", while its own FAQ explained that a journeyman works
  *under* a master's licence — it contradicted itself on the same page.
  And **12644476-5501
  is the company's CONTRACTOR licence**, not anyone's master electrician licence —
  Utah keeps individual credentials and entity licences separate. Never write that
  Trevor holds a Master Electrician licence, and never label 12644476-5501 as one.
  Team-level phrasing ("Master Electrician on every job", "qualified by a licensed
  Master Electrician") is accurate and is what the site now uses.
- **Phone is (801) 885-4521** everywhere on the site — that is Trevor's, and it is
  the main business line. Confirmed by Trevor 2026-08-01.
  ⚠️ **Corrected 2026-08-17: 885-4195 is WES's number, not an error.** Both handles
  are in the "Osborne Again" iMessage group, and Trevor addressed Wes there from
  4521 while 4195 answered. Earlier notes called 4195 "simply wrong"; acting on that
  would have meant telling the BBB a real number does not exist. The BBB still needs
  correcting for its **wrong address** and for listing a number that is not the main
  business line.
- ✅ **Bluffdale is confirmed and is the only locality this site publishes.** Trevor
  confirmed 2026-08-01 that the LLC is registered at 14087 Deer Orchard Cove,
  **Bluffdale**, UT 84065. **USPS assigns "Riverton" as the mailing city for ZIP
  84065**, which is why the Google profile, Yelp, the BBB and Procore all said
  Riverton — a real boundary artefact, not an error. The ~10 area pages saying
  "from our Bluffdale home base" were right. Keep them.

Full write-up: `~/Documents/clients/osborne-electric/16-gmb-reinstatement.md`.
Dashboard steps: `06-gbp-suspension-recovery.md`.

## What search says about this site

Measured 2026-08-01 (Semrush, US): AS 6, **125 keywords, 3 visits/month**,
343 backlinks / 100 referring domains. 17 URLs rank; only the homepage earns a
visit. The service and area pages work — they're just stranded between 16th and
95th. **Position, not page count, is the problem.**

- 🔴 **Generators are the opening.** ~960 searches/month across the standby /
  whole-home / transfer-switch / Generac cluster, difficulty 0–3, no advertisers
  bidding, and `/services/generator-installation/` already ranks 16th–21st across
  all of it off one page. Splitting it into separate pages is the highest-value
  content work available.
- **Park City has no page** and should: 480/mo, $30 CPC, difficulty 21, paid
  competition 0.08. **Tooele is not the opening we said in May** — effectively
  zero search volume.
- Detail in memory `project-osborne-seo-baseline`.

## Session Log

### 2026-08-17 — the homepage was still publishing three invented five-star reviews

- 🔴 **The find: `src/index.njk` was serving three testimonials nobody sourced from a
  customer** — "Mike R." (Salt Lake City), "Sarah T." (Draper), "James & Linda P."
  (Provo), five gold stars each, under the heading **"Reviews / What Our Customers Say
  / Real feedback from Utah homeowners."** Live on a profile suspended for *deceptive
  content* whose appeal was already denied.
- **Our own docs prove they were placeholders.** `clients/osborne-electric/04-city-landing-pages.md`
  leaves `[CITY]_TESTIMONIAL_PLACEHOLDER` on every city page with "Trevor to fill with
  real review", and `01-trevor-action-packet.md` lists customer testimonials as an open
  ask to Trevor. **That ask was never answered** — the homepage shipped the placeholder
  fully written instead, in the 5 March rebuild, two weeks before the suspension. They
  outlived the entire 1–2 Aug cleanup that removed `aggregateRating` and "47+ Google
  Reviews" for exactly this reason, and they were live underneath both community posts.
  Removed, with the now-dead `.testimonial-*` CSS.
- 🔴 **And the licence mislabel we told a Product Expert was fixed on 2 Aug was still in
  the homepage meta description**: "Master Electrician license #12644476-5501". That
  number is the **company's CONTRACTOR licence**. Also corrected: **26** area-page
  sentences claiming "Osborne Electric holds a Master Electrician license", **five**
  `/areas` cards heading a "Master Electrician" block with the contractor number (the
  pairing this file already warned about, fixed only for Bluffdale on 11 Aug), and
  **eight** "Our/Their Master Electrician license…" claims across the commercial,
  industrial and county pages.
- 🔴 **ROOT CAUSE: `scripts/audit-licence-claims.js` printed "52 pages checked, 0 false
  claims" through all of it.** It asked exactly one question — does a sentence name
  Trevor near "Master Electrician"? — so anything phrased differently walked past, and
  the clean total is what everyone quoted. **An audit that checks one sentence shape and
  reports a clean total is worse than no audit.** It now runs **five rules over the RAW
  HTML** (class names and JSON-LD keys are invisible to `renderedText`): licence-number
  mislabel, company-level master claims, self-authored testimonials, and
  aggregateRating/review-count markup. Comments are stripped first so it stops flagging
  its own paper trail, and correct attribution ("…qualified by Master Electrician Wes
  Osborne #8528070-5502") is explicitly exempt so the rule doesn't train people to
  ignore it.
- **The audit was proven, not assumed.** Reintroduced one real historical violation per
  rule into the built output: all five fire, exit code 1, `npm run build` blocks; exit 0
  when clean. Two of the fixes above were found BY the new rules after the first pass —
  and the first version of two rules produced false positives on my own corrections,
  which is why `exemptIf` exists.
- **Deleted `src/index.njk.backup`** — a stale May copy carrying the original "Trevor
  Osborne holds a Master Electrician license, the highest electrical certification in
  Utah." Unbuilt and 404 on prod, but a loaded gun for a future session. In git history.
- Verified live on all 51 pages after deploy: **0 testimonial/review markup, 0
  aggregateRating, 0 licence mislabels**, 143 JSON-LD blocks still parse, homepage flows
  cleanly from the comparison table into the 3-step process (screenshotted, not just
  measured).
- ⚠️ **NOT changed, and it is Bryce's call: 123 instances of the PLURAL "Master
  Electricians".** The firm fields one. An overstatement, not a checkable falsehood, and
  123 grammar edits carry their own risk. **The audit prints the count on every build**
  so it stays a decision rather than an oversight. My recommendation is to go singular.

**Next:** the second appeal is **filable** — see
`~/Documents/clients/osborne-electric/24-second-appeal-runbook.md`. A Product Expert
handed us the route on 8 Aug and it sat unactioned for nine days.


### 2026-08-01 (later) — Bluffdale confirmed; the Google violation itself is fixed

- Trevor confirmed the registered address and phone. Bluffdale restored to the footer
  and to `addressLocality` on the homepage, brand-facts and the SLC guide — the latter
  two had been claiming Salt Lake City. One locality published site-wide now.
- On the profile itself: the address is off it entirely ("No location; deliveries and
  home services only") and the description no longer claims a 5-star rating. What's
  left there is the documents and the appeal.

### 2026-08-01 — NAP and schema cleaned up so the site stops contradicting the profile

- Header `+` → `&`; self-serving `aggregateRating` (5.0 / 47) stripped from three
  page schemas plus the hero's "5.0 Stars · 47+ Google Reviews" line; locality and
  geo removed from the organisation schema; the Deer Orchard Cove reference gone
  from the Bluffdale page; footer no longer claims a home city.
- 143 JSON-LD blocks re-validated after the edits, all parse. Built, deployed to
  production, and confirmed live on osborne-electric.com.
- Left alone on purpose: the ~10 area pages saying "from our Bluffdale home base",
  pending Trevor's answer, and the prose review claims on `/brand-facts/` and the
  SLC guide.

**Next:** build the generator cluster pages · add a Park City page · both go *behind*
the reinstatement, since generator searches return a map pack he isn't in yet.

<!-- gs-notes-convention -->
## Notes convention (read this first)

This repo is the system of record for everything we know about osborne-electric-site.
Anyone working here — Bryce, Josh, or a Claude session — saves to these files:

- `CLAUDE.md` (this file) — **Session Log**. Append a dated entry at the TOP
  of the Session Log section when a session or discrete task ends: what
  shipped, current state, what's next. 3–8 tight bullets.
- `docs/roadmap.md` — what we're trying to do here, and what comes next.
- `docs/notes.md` — durable facts: decisions, gotchas, links, who asked for what.

Rules:

1. Read the newest Session Log entry before starting work.
2. Write notes as you go, not from memory at the end.
3. **Commit before the session ends.** An uncommitted note may as well not exist.
4. No secrets in any of these files — no passwords, keys, or tokens.
5. Write for someone who wasn't in the room.

