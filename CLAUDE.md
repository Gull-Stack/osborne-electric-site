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
- **Phone is (801) 885-4521** everywhere. Confirmed by Trevor 2026-08-01; the
  BBB's 885-4195 is simply wrong and needs correcting at the BBB.
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

