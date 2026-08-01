# osborne-electric-site

The live **osborne-electric.com** — Eleventy 2 static site, deployed to Vercel
(`gull-stack` scope, project `osborne-electric-site`). Repo
`Gull-Stack/osborne-electric-site`. `npm run build` → `_site/`, `npm run dev`
to serve.

Client context lives in `~/Documents/clients/osborne-electric/` (strategy,
takeoffs, GBP work). Trevor's Flight Deck is tenant `osborne` in
`~/Documents/internal/client-portal`.

## 🔴 His Google Business Profile is suspended — the site must corroborate it

Verified 2026-08-01: the profile (Osborne Electric and Contracting, LLC —
14087 S Deer Orch Cv, Riverton UT 84065) reads **Suspended**, originally for
*deceptive content*. Until it's reinstated, every edit here has a second test:
**does this contradict what we are about to appeal with?**

Rules that follow from that, and that a future session should not undo:

- **No `aggregateRating` markup anywhere.** A business marking up its own rating
  breaks Google's structured-data policy, and publishing a Google review count
  Google can't currently verify — while appealing a deceptive-content
  suspension — is the worst possible pairing. The 5.0 / 47 blocks were removed
  from `src/index.njk`, `src/brand-facts/index.njk` and the SLC guide on
  2026-08-01. `src/.well-known/brand-facts.json` still states "47 reviews" in
  prose; that's a customer claim rather than a Google one, left deliberately.
- **He is a service-area business, so publish no locality and no geo.**
  `PostalAddress` carries `addressRegion` + `addressCountry` only; `areaServed`
  does the real work. Three different cities were previously asserted under one
  `@id` (Bluffdale on the homepage, Salt Lake City on brand-facts and the guide,
  Riverton on the profile) — that contradiction is exactly what Google's
  validation looks for.
- **Never name his street.** `/areas/bluffdale-ut/` used to call out "the Deer
  Orchard Cove area" as the head office. That is his home, and a publicly
  identified residence *is* the SAB violation.
- **Name is "Osborne Electric & Contracting"** in prose, "Osborne Electric and
  Contracting, LLC" as the legal entity. The header once read "ELECTRIC **+**
  CONTRACTING"; the plus is the naming variant that triggered the original flag.
- **Phone is (801) 885-4521** everywhere. His BBB listing carries 885-4195 —
  unconfirmed, and on his Flight Deck's asks list.
- ⚠️ **Bluffdale vs Riverton is unresolved.** The profile, BBB and Yelp say
  Riverton; this site said Bluffdale, and ~10 area pages still say "from our
  Bluffdale home base" as a proximity claim. Deer Orchard Cove sits in ZIP 84065
  which both cities share, so it may be a genuine boundary question. **Do not
  guess it** — Trevor has been asked.

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

**Next:** get the Bluffdale/Riverton answer and make every page agree · build the
generator cluster pages · add a Park City page.
