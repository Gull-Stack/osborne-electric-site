# Osborne Electric - Full Site Rebuild on Unikorns Framework

## Design Reference
Template: https://unikorns.work
Design Standard: "Editorial Light" (Design Standard v3)

## Design Principles (from Unikorns template)
- 80% light/white backgrounds, dark sections used sparingly for contrast
- Full-bleed hero with confident big typography
- Clean sans-serif font (Inter)
- "Trusted by" social proof strip near the top
- 3-column feature/service cards with clean SVG icons (NO emojis anywhere)
- Comparison table section (us vs alternatives)
- Project/work gallery grid with subtle hover effects
- Team section with photos
- FAQ accordion with native <details> elements
- Contact form on homepage with full-bleed background image
- Generous whitespace (6rem section padding desktop, 4rem mobile)
- Subtle animations on scroll (translateY, opacity)
- Max-width 1200px containers

## Brand
- **Colors:** Black (#1a1a1a), Yellow/Gold (#F4B223), White, Light Gray (#f5f6fa)
- **Font:** Inter (already loaded)
- **Logo:** src/images/logo.png
- **Phone:** 801-885-4521
- **Email:** Osborne-electric@outlook.com
- **Service Area:** Salt Lake, Utah, Davis, Tooele, Summit Counties

## Pages to Build/Rebuild

### Homepage (src/index.njk) — COMPLETE REWRITE
1. **Hero** — full-bleed work photo background, big headline "Utah's Trusted Master Electricians", subtitle, two CTAs (Get Free Estimate + Our Services)
2. **Trusted By strip** — show county names or "Serving 5 Counties" badges
3. **Services overview** — 5 service cards with SVG icons linking to service pages
4. **Work gallery** — photo grid showing best project photos (use existing project-01 through project-16 plus new photos)
5. **Why Choose Us** — comparison table: Osborne Electric vs Big Box Contractors vs Handyman vs DIY
6. **Team section** — grid of 6 team members with photos from src/images/team/
7. **Testimonials/Social proof** — review quotes
8. **How It Works** — 3-step process (Call → Assess → Complete)
9. **FAQ accordion** — 6+ questions with FAQPage schema
10. **Contact form** — full-bleed background + floating white card
11. **ElectricalContractor schema** in head (already exists, keep it)

### Service Pages (5 pages) — REDESIGN to match new style
- src/services/index.njk (services hub)
- src/services/lighting-installation.njk
- src/services/panel-upgrades.njk
- src/services/power-restoration.njk
- src/services/remodels-new-construction.njk
- src/services/residential-electrical.njk
Each should have: hero, detailed content, relevant work photos, FAQ, CTA, internal links

### Area Pages (18 pages) — REDESIGN templates
Keep all area pages but update their template/layout to match new design
These extend base.njk — update the base template and area page layout

### Existing Pages to Keep & Restyle
- src/about.njk
- src/contact.njk
- src/brand-facts/index.njk (keep as-is, it's AEO)
- src/guides/* (keep as-is, they're AEO)

### CSS — COMPLETE REWRITE (src/css/styles.css)
Build from scratch matching Unikorns editorial light aesthetic
- CSS custom properties for all colors, spacing, typography
- Mobile-first responsive
- Smooth scroll, subtle transitions
- No heavy frameworks, clean vanilla CSS

### Templates
- src/_includes/base.njk — update with new font loading, CSS
- src/_includes/header.njk — clean, minimal nav (logo left, links + CTA right)
- src/_includes/footer.njk — redesign, include GullStack credit

## Available Images
- src/images/work/ — 56 total work/project photos
- src/images/team/ — 6 team member PNGs (cole, jeremy-gates, payne, reel, sparks, trevor-osborne)
- src/images/logo.png — company logo
- src/images/gullstack-logo.png — GullStack logo for footer

## CRITICAL RULES
1. NO emojis anywhere on any page — use SVG icons or CSS-only icons
2. Keep ALL existing pages (services, areas, guides, brand-facts)
3. Keep all existing schema markup
4. Keep the .eleventy.js config working (passthrough copies, etc.)
5. Keep /api/ endpoints (contact form handler)
6. GullStack footer credit on every page
7. All pages must have proper SEO meta titles and descriptions
8. Internal links between pages
9. Dynamic sitemap using collections.all

After building: git add -A && git commit -m "Bot Melvin: Full site rebuild on Unikorns/Editorial Light framework" && git push origin main

When completely finished, run: openclaw system event --text "Done: Osborne Electric full site rebuild on Unikorns framework complete" --mode now
