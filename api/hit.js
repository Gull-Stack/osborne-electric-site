// First-party pageview beacon.
//
// Feeds the traffic panel on Trevor's Flight Deck (flight.osborne-electric.com).
// GA4 stays on the site for deep analysis — this exists because the deck needs to
// answer "which page brought in the enquiry" from the same store the enquiries
// live in, in one query. Nothing here is a replacement for GA4; it is the half a
// contractor will actually look at.
//
// Privacy, and these are load-bearing rather than nice-to-haves:
//   - no cookie is set or read
//   - the raw IP and user agent are never stored, only used to build a digest
//   - that digest is salted AND includes the UTC day, so it cannot be joined
//     across days even by us — it counts a visitor within a day and nothing more
//   - Do Not Track is honoured client-side, and obvious bots are dropped here
//
// Failure is silent by design. A visitor must never see an error, and the page
// must never wait on this, because it is a counter and not a feature.

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const TENANT = 'osborne';

const BOT = /bot|crawl|spider|slurp|bingpreview|headless|lighthouse|pagespeed|monitor|preview|curl|wget|python-requests|axios|node-fetch/i;

function supabase() {
  const url = process.env.PORTAL_SUPABASE_URL;
  const key = process.env.PORTAL_SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Salted, day-scoped digest. Not reversible, not stable across days. */
function visitorHash(ip, ua) {
  const salt = process.env.PAGEVIEW_SALT || '';
  if (!salt) return null; // no salt configured -> don't pretend to anonymise
  const day = new Date().toISOString().slice(0, 10);
  return crypto
    .createHash('sha256')
    .update(`${day}|${ip}|${ua}|${salt}`)
    .digest('hex')
    .slice(0, 24);
}

/** Referrer host only — never the full URL, which can carry search terms. */
function referrerHost(referrer, selfHost) {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (selfHost && host === String(selfHost).replace(/^www\./, '')) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

/** Keep the path recognisable and bounded; drop query strings entirely. */
function cleanPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return null;
  return path.split('?')[0].split('#')[0].slice(0, 200) || '/';
}

module.exports = async (req, res) => {
  // Always answer immediately and identically, whatever happens below.
  const done = () => {
    res.setHeader('Cache-Control', 'no-store');
    res.status(204).end();
  };

  if (req.method !== 'POST') return done();

  try {
    const ua = String(req.headers['user-agent'] || '');
    if (!ua || BOT.test(ua)) return done();

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const path = cleanPath(body.p);
    if (!path) return done();

    const client = supabase();
    if (!client) return done();

    const ip = String(
      req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || ''
    ).split(',')[0].trim();

    await client.from('portal_pageviews').insert({
      tenant: TENANT,
      path,
      referrer_host: referrerHost(body.r, req.headers.host),
      device: body.m === true ? 'mobile' : 'desktop',
      visitor_hash: visitorHash(ip, ua),
    });
  } catch (err) {
    console.error('hit error:', err && err.message);
  }

  return done();
};
