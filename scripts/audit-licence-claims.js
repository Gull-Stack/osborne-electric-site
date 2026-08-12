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

const failures = [];

if (!fs.existsSync(ROOT)) {
  console.error('licence audit: no _site/ directory — run the build first.');
  process.exit(1);
}

let pages = 0;
for (const file of htmlFiles(ROOT)) {
  pages++;
  const text = renderedText(fs.readFileSync(file, 'utf8'));
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
        context: context.trim(),
      });
    }
  }
}

if (failures.length) {
  console.error(`\n🔴 licence audit FAILED — ${failures.length} claim(s) read as Trevor holding a Master Electrician licence.\n`);
  for (const f of failures) {
    console.error(`  ${f.file}`);
    console.error(`    …${f.context}…\n`);
  }
  console.error('Wes holds 8528070-5502. Trevor is B100 #9015139-B100 and journeyman #9015139-5504.');
  console.error('Team-level phrasing is fine; naming Trevor personally is not.\n');
  process.exit(1);
}

console.log(`licence audit: ${pages} pages checked, 0 false claims.`);
