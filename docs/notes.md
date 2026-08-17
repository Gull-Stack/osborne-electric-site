# osborne-electric-site — notes

Durable facts a future session or teammate needs. Not a diary — the dated
narrative belongs in the CLAUDE.md Session Log.

Write for someone who was not in the room: no "as discussed", no bare pronouns.
Never put passwords, API keys, or tokens in this file.

## Who

- (client contacts, who asks for what, who approves)

## Decisions

- (what we chose, and why — the why is the part that ages well)

## Gotchas

- (things that broke, and what actually fixed them)

## Links

- (dashboards, live URLs, Notion pages, ticket queues)

## 2026-08-17 — claims discipline: what the audit must catch, and why

Three classes of unverifiable claim were live for months while
`scripts/audit-licence-claims.js` reported "0 false claims". Keep all five rules;
do not narrow them.

1. **Never publish a review, testimonial, star rating or review count.** Not one we
   wrote, not one paraphrased, not `aggregateRating` markup. The city pages hold the
   correct pattern: `[CITY]_TESTIMONIAL_PLACEHOLDER`, filled only from something a real
   customer actually said. On 17 Aug the homepage was serving three invented five-star
   testimonials with names and cities. Trevor has been asked for real ones since the
   spring and has not sent them; the answer to that is an empty slot, never a written
   one.
2. **12644476-5501 is the COMPANY'S CONTRACTOR licence.** Utah keeps entity licences and
   individual credentials separate. Its **E200 General Electrical** classification is
   qualified by **Weston (Wes) Osborne, Master Electrician #8528070-5502**; its **B100
   General Building** by **Trevor**, who is a **journeyman** (#9015139-5504). Never label
   12644476-5501 a Master Electrician licence. Never say the company "holds" one — a
   person holds one. Accurate form: "Utah DOPL contractor license #12644476-5501, with
   all electrical work qualified by Master Electrician Wes Osborne (#8528070-5502)".
3. **Team-level phrasing is fine** ("Master Electrician on every job"). Naming Trevor
   personally is not.

**The plural is unresolved.** "Licensed Master Electricians" appears 123 times and the
firm fields one master electrician. Reported by the audit on every build, deliberately
not failed — it is a positioning call for Bryce, not a bug. If nobody has decided, it is
still open.

**Why this is stricter here than on other sites:** the Business Profile is suspended for
DECEPTIVE CONTENT, moderated 19 Mar 2026, and the appeal was reviewed and **Not
approved** on 15 May. A human reviewer upheld a finding that something on this business
was not truthful. Every claim has to survive being checked against a public record —
the DOPL register at https://secure.utah.gov/llv/search/ is the authority, and it is
CAPTCHA-gated, so a person runs the lookup.

## 🔴 Verifying a deploy: never grep a Vercel deployment URL

On 2026-08-17 the singular sweep was confirmed "live" and was not. The trap, in
order:

1. `vercel deploy --prod` reported success, and a poll of the domain returned 0
   plural hits — but that poll ran while the edge still held a cached copy, so it
   measured nothing.
2. A later check found 4 plural hits on the homepage. Both recent **deployment
   URLs** were then grepped and both returned 0, which read as "the deployments are
   fine, it must be cache".
3. **They returned 0 because they 302 to a Vercel auth wall and serve 15 bytes.**
   A grep for anything against 15 bytes of redirect returns 0. Every absence looked
   like a pass.

The domain was in fact serving a build from *between* two commits — testimonials
removed, singular sweep missing — because a git-triggered deploy landed after the
CLI one and took production.

**The rule:**

- **Verify on the real domain, not a `*.vercel.app` deployment URL.** Those are
  protected on this team; they answer 302 to everything.
- **Check the status code and byte count before believing a grep.** `%{http_code}`
  and `wc -c` first, content second. A 0 from a 302 is indistinguishable from a 0
  from a clean page.
- **Cache-bust** (`?z=$RANDOM`) — `x-vercel-cache: HIT` with an `age` header means
  you are reading the edge, not the deployment.
- **Assert a positive control, not only the absence of the bad string.** Grepping
  for something that should be PRESENT in the new build (here, the comment left
  where the fake reviews were removed) is what finally distinguished "fixed" from
  "stale build". An absence-only check cannot tell you which build you are looking at.
- CLI deploys and git-triggered deploys race. After a CLI `--prod`, re-check the
  domain a few minutes later — the last build to finish wins.
