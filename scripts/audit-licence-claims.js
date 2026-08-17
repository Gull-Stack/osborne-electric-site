#!/usr/bin/env node
//
// Fails the build if the site claims Trevor holds a Master Electrician licence.
//
// This is not a style rule. Google suspended the Business Profile in March for
// "deceptive content", and this exact claim is what it pointed at: Trevor is the
// B100 General Building Qualifier and a journeyman (9015139-5504); WES holds the
// Master Electrician licence (8528070-5502). The claim is checkable against the
// state register, which is precisely why it cost us the listing.
//
// Why this file exists at all: an audit like this was written on 2 August and
// never committed, so it ran once and never again. Two instances survived it and
// were live for nine more days — "Owner / Master Electrician" under Trevor's
// photo on the homepage and the about page. It is wired into `npm run build` so
// it cannot be forgotten a second time.
//
// The lesson from the ones that got through: the old check looked for the two
// phrases near each other IN THE SOURCE, where they sat in separate elements —
//     <h3>Trevor Osborne</h3>
//     <p class="team-role">Owner / Master Electrician</p>
// — and never matched. So this strips tags FIRST and searches the rendered text,
// which is what a reader (and Google) actually sees.
//
// Team-level phrasing is fine and deliberately allowed: "Master Electrician on
// every job", "owner Trevor Osborne and his team ... with Master Electrician
// credentials". Those are true. What is banned is Trevor personally holding it.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '_site');
const WINDOW = 120; // characters either side of the phrase to inspect

/** Rendered text: drop script/style bodies, then all tags, then collapse space. */
function renderedText(html) {
  return html
    // Comments first. A developer comment is not visible copy, and leaving them
    // in produced ten false positives the first time this ran — the beacon
    // comment mentions Trevor and lands directly after a <title> containing
    // "Master Electrician", which reads like a claim and is not one.
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

// Added 2026-08-17. The first version of this audit reported "0 false claims"
// while THREE other classes of unverifiable claim were live on the homepage —
// including three invented 5-star testimonials that survived the whole 1–2 Aug
// cleanup. It only ever asked one question ("does Trevor personally hold it?"),
// so anything phrased differently walked straight past it. An audit that checks
// one sentence shape and prints a clean total is worse than no audit, because
// the clean total is what people quote. Each rule below is a claim Google can
// check against a public record, on a profile suspended for DECEPTIVE CONTENT
// with a denial already upheld.
const RULES = [
  {
    // 12644476-5501 is the COMPANY'S CONTRACTOR licence. Utah keeps entity
    // licences and individual credentials separate; the master electrician
    // credential is Wes's 8528070-5502. Pairing the contractor number with the
    // words "Master Electrician" is the exact mislabel we told a Product Expert
    // we had corrected on 2 Aug — and it was still in the homepage meta
    // description on 17 Aug.
    name: 'contractor licence mislabelled as a Master Electrician licence',
    re: /Master Electricians?[^.]{0,60}12644476-5501|12644476-5501[^.]{0,60}Master Electrician/gi,
    // Naming the contractor number and the words "Master Electrician" in one
    // breath is FINE when the sentence attributes the credential to Wes —
    // "contractor licence 12644476-5501, with electrical work qualified by
    // Master Electrician Wes Osborne (#8528070-5502)" is the accurate form and
    // must not be flagged, or the rule trains people to ignore it.
    exemptIf: /\bWes(ton)?\b|8528070/i,
  },
  {
    // The COMPANY holds a contractor licence. It does not hold, and cannot
    // hold, a master electrician licence — a person does.
    // The word gap has to be generous. A first version required "Master
    // Electrician licence" to follow the verb almost immediately, and
    // "Osborne Electric holds a UTAH Master Electrician license" — one extra
    // word — walked straight through it, in both the FAQPage schema and the
    // visible accordion on the commercial page.
    name: 'company claims to hold a Master Electrician licence',
    re: /(Osborne Electric|the company|we|our|their)\s+(holds?|carr(?:y|ies)|ha(?:s|ve))\b[^.]{0,40}?Master Electrician licen[cs]e|(Our|Their) Master Electrician licen[cs]e/gi,
    // Naming Wes and his own number is the accurate form, not a violation.
    exemptIf: /\bWes(ton)?\b|8528070/i,
  },
  {
    // DECIDED 2026-08-17 (Bryce): the site says "Master Electrician", singular.
    // The firm fields one — Wes, #8528070-5502. Trevor is a journeyman. 101
    // instances were made singular before the second appeal was filed, on the
    // reasoning that singular ranks the same and cannot be argued with by a
    // reviewer who has already upheld a deceptive-content finding.
    //
    // The exemption is not a loophole: generic education about the trade is not
    // a claim about this company, and the SLC comparison guide legitimately
    // explains what master electricians in general can do and charge. Those
    // sentences are lowercase-m mid-sentence; a claim about Osborne is not.
    name: 'plural "Master Electricians" — the firm fields one',
    re: /Master Electricians/g,
    exemptIf: /Master electricians can pull permits|Master electricians may charge|Licensed master electricians, family-owned vs big box/,
  },
  {
    // Self-authored reviews. The city pages get this right — they leave
    // [CITY]_TESTIMONIAL_PLACEHOLDER for a real one. The homepage shipped three
    // fully-written fakes with names, cities and five stars each, under the
    // heading "Real feedback from Utah homeowners".
    name: 'testimonial or review content with no verifiable source',
    re: /What Our Customers Say|Real feedback from Utah homeowners|testimonial-(card|text|author|stars)/gi,
  },
  {
    // A business marking up its own rating breaks Google's structured-data
    // policy outright, and advertising a review count Google cannot see while
    // the profile is suspended is the worst possible pairing. Removed 1 Aug;
    // this stops it coming back.
    name: 'self-serving rating or review-count markup',
    re: /aggregateRating|ratingValue|reviewCount|\d+\+?\s*Google Reviews/gi,
  },
];

const failures = [];

if (!fs.existsSync(ROOT)) {
  console.error('licence audit: no _site/ directory — run the build first.');
  process.exit(1);
}

let pages = 0;
for (const file of htmlFiles(ROOT)) {
  pages++;
  const raw = fs.readFileSync(file, 'utf8');
  const text = renderedText(raw);

  // The RULES run against RAW html, not rendered text: two of them look for
  // class names and JSON-LD keys, which renderedText deliberately strips. Run
  // them on rendered text and they can never fire.
  // Comments come out first, though — a note explaining why we DELETED a fake
  // testimonial is not a fake testimonial, and leaving comments in made this
  // audit flag its own paper trail.
  const scannable = raw.replace(/<!--[\s\S]*?-->/g, ' ');
  for (const rule of RULES) {
    let rm;
    rule.re.lastIndex = 0;
    while ((rm = rule.re.exec(scannable)) !== null) {
      const from = Math.max(0, rm.index - 80);
      const context = scannable
        .slice(from, rm.index + rm[0].length + 80)
        .replace(/\s+/g, ' ')
        .trim();
      if (rule.exemptIf && rule.exemptIf.test(context)) continue;
      failures.push({ file: path.relative(ROOT, file), rule: rule.name, context });
    }
  }


  const re = /Master Electrician/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const from = Math.max(0, m.index - WINDOW);
    const context = text.slice(from, m.index + WINDOW);
    const namesTrevor = /Trevor/i.test(context);
    const namesWes = /\bWes(ton)?\b/i.test(context);
    // Team-level phrasing is true and allowed: the company does field a master
    // electrician, it just isn't Trevor. "...and his team ... with Master
    // Electrician credentials" / "Master Electrician on every job" attach the
    // credential to the business, not to a person.
    const after = text.slice(m.index, m.index + 60);
    const teamLevel = /^Master Electrician (credentials|on every)/i.test(after);
    // Trevor nearby, Wes absent, not team-level -> reads as Trevor holding it.
    if (namesTrevor && !namesWes && !teamLevel) {
      failures.push({
        file: path.relative(ROOT, file),
        rule: 'Trevor personally claimed as a Master Electrician',
        context: context.trim(),
      });
    }
  }
}

if (failures.length) {
  console.error(`\n🔴 claims audit FAILED — ${failures.length} unverifiable claim(s) across ${pages} pages.\n`);
  const byRule = new Map();
  for (const f of failures) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule).push(f);
  }
  for (const [rule, list] of byRule) {
    console.error(`  ── ${rule} (${list.length})`);
    for (const f of list) {
      console.error(`     ${f.file}`);
      console.error(`       …${f.context.slice(0, 200)}…`);
    }
    console.error('');
  }
  console.error('Public record: the COMPANY holds Utah DOPL CONTRACTOR licence 12644476-5501');
  console.error('(E200 General Electrical, qualified by Weston Osborne; B100, qualified by Trevor).');
  console.error('Wes holds Master Electrician 8528070-5502. Trevor is journeyman 9015139-5504.');
  console.error('Team-level phrasing is fine. Naming Trevor, mislabelling the licence number,');
  console.error('and any review we wrote ourselves are not.\n');
  process.exit(1);
}

console.log(`claims audit: ${pages} pages checked, ${RULES.length + 1} rules, 0 failures.`);
