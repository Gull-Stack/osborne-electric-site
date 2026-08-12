// Vercel Serverless Function - Contact Form Handler
// Sends auto-reply email to lead + notification to business + posts to SuperTool

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SUPERTOOL_API = process.env.SUPERTOOL_API || 'https://backend-production-5ad2.up.railway.app';
const SUPERTOOL_TENANT_ID = process.env.SUPERTOOL_TENANT_ID;

// === SPAM PROTECTION ===
function isGibberish(text) {
  if (!text || text.length < 2) return false;
  const cleaned = text.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length < 2) return false;
  const vowels = cleaned.match(/[aeiou]/g);
  if (!vowels || vowels.length < cleaned.length * 0.15) return true;
  if (/[^aeiou]{5,}/i.test(cleaned)) return true;
  return false;
}

// The checks above stop crude bots. They did not stop what actually filled this
// form: 22 of the first 34 submissions were human-written sales pitches with
// plausible names — SEO agencies, proxy resellers, one casino. Reviewed 11 Aug.
//
// So these look at the MESSAGE rather than the sender. A homeowner writes about
// their own house; a pitch writes about Trevor's. That difference is the signal,
// and it is far more reliable than trying to spot a fake name.
const SOLICITATION = [
  /\byour (?:website|site|business|company|listing|brand|google)\b/i,
  /\b(?:seo|search engine optimi|keyword|backlink|rank(?:ing)? (?:on|in) google|google business profile)\b/i,
  /\b(?:digital marketing|lead gen|web design services|our (?:agency|team) (?:can|helps))\b/i,
  /\b(?:proxy service|casino|crypto|forex|guest post|link building)\b/i,
  /\b(?:i (?:just )?(?:visited|came across|found) your)\b/i,
  /\bunsubscribe\b/i,
];

// Same shop, five submissions, five different names. Cheap and exact.
const BAD_SENDER = /@(jmailservice\.com|outsideagent\.ai)$/i;

function looksLikeSpam(data) {
  const { name, email, message, fax_number, _timestamp } = data;
  if (fax_number) return 'honeypot';
  if (_timestamp) {
    const elapsed = Date.now() - parseInt(_timestamp, 10);
    if (elapsed < 3000) return 'too_fast';
  }
  if (isGibberish(name)) return 'gibberish_name';
  if (name && name.trim().length < 2) return 'short_name';
  if (email && BAD_SENDER.test(email)) return 'known_sender';

  // A bot tagging its own gmail with our domain — huella.digital544+osborne-
  // electric398@gmail.com. No human does this. Caught the night this shipped,
  // when one such message slipped through as a real lead.
  if (email && /\+[^@]*osborne/i.test(email)) return 'tagged_sender';

  const body = String(message || '');
  // Two or more links in an enquiry to an electrician is a pitch, not a job.
  if ((body.match(/https?:\/\//gi) || []).length >= 2) return 'links';
  // A bulleted digest of headlines is a content-spam blast, not somebody with a
  // panel problem. Three or more dashed lines and a link is conclusive.
  if ((body.match(/^\s*[-•]\s+\S/gm) || []).length >= 3 && /https?:\/\//i.test(body)) {
    return 'digest';
  }
  // One phrase could be a coincidence; two is a sales email.
  const hits = SOLICITATION.filter((re) => re.test(body)).length;
  if (hits >= 2) return 'solicitation';
  return false;
}
// === END SPAM PROTECTION ===

/** Record every submission on Trevor's Flight Deck, spam included.
 *
 *  Spam is stored with status 'spam' rather than dropped: the deck filters it out
 *  of his view but still counts it, which is the only way anyone can see that the
 *  form is taking two junk messages for every real one. Silently discarding it
 *  would hide the problem we are trying to fix.
 *
 *  Uses the REST endpoint directly rather than the supabase client so this file
 *  stays free of imports — it is ESM and api/hit.js is CommonJS, and mixing the
 *  two module systems in one directory is a trap not worth walking into.
 *
 *  Never throws. A lead must reach Trevor's inbox even if this store is down. */
async function recordSubmission(fields, status) {
  const url = process.env.PORTAL_SUPABASE_URL;
  const key = process.env.PORTAL_SUPABASE_SERVICE_KEY;
  if (!url || !key) return;

  const { name, email, phone, city, service, message } = fields;
  try {
    await fetch(`${url}/rest/v1/portal_submissions`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tenant: 'osborne',
        form: 'contact',
        name: name || null,
        email: email || null,
        phone: phone || null,
        subject: service || 'General inquiry',
        payload: {
          city: city || 'Not specified',
          service: service || 'General inquiry',
          message: message || '',
        },
        source_url: 'https://www.osborne-electric.com/contact/',
        status,
      }),
    });
  } catch (err) {
    console.error('deck record failed:', err && err.message);
  }
}

async function sendEmail({ to, from, subject, html, replyTo, cc }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}) }],
      from: { email: from },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return response.ok;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, city, service, message, fax_number, _timestamp } = req.body;

    // === SPAM CHECK ===
    const spamReason = looksLikeSpam({ name, email, message, fax_number, _timestamp });
    if (spamReason) {
      console.log(`[SPAM BLOCKED] reason=${spamReason} name="${name}" email="${email}"`);
      // Counted on the deck, never shown to him, and no email sent.
      await recordSubmission({ name, email, phone, city, service, message }, 'spam');
      const acceptsHtml = req.headers.accept?.includes('text/html');
      if (acceptsHtml) {
        return res.status(200).send(`<!DOCTYPE html><html><head><title>Message Sent</title><meta http-equiv="refresh" content="3;url=/"/><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a1a;color:white;}.container{text-align:center;padding:2rem;}h1{color:#F4B223;}</style></head><body><div class="container"><h1>✓ Message Sent!</h1><p>Thank you! We'll be in touch soon.</p></div></body></html>`);
      }
      return res.status(200).json({ success: true, message: 'Form submitted successfully' });
    }
    // === END SPAM CHECK ===

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const siteName = process.env.SITE_NAME || 'Osborne Electric';
    const siteEmail = process.env.SITE_EMAIL || 'Osborne-electric@outlook.com';
    const fromEmail = process.env.FROM_EMAIL || 'leads@gullstack.com';

    // Onto the deck first, before the emails. The store is the permanent record;
    // email is the alert. If SendGrid has a bad minute the enquiry still survives.
    await recordSubmission({ name, email, phone, city, service, message }, 'new');

    if (email && SENDGRID_API_KEY) {
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; padding: 30px; text-align: center;">
            <h1 style="color: #F4B223; margin: 0;">Thank You, ${name}!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">We've received your message and will get back to you within 24 hours.</p>
            <p style="font-size: 16px; color: #333;"><strong>Here's what you sent us:</strong></p>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
              <p style="margin: 5px 0;"><strong>Service:</strong> ${service || 'General inquiry'}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${city || 'Not specified'}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong> ${message}</p>
            </div>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">Need immediate assistance? Call us at <strong>(801) 885-4521</strong></p>
          </div>
          <div style="background: #1a1a1a; padding: 20px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 14px;">${siteName} — Licensed Master Electricians Serving Utah</p>
          </div>
        </div>
      `;

      await sendEmail({ to: email, from: fromEmail, subject: `Thanks for contacting ${siteName}!`, html: confirmationHtml });
    }

    if (SENDGRID_API_KEY) {
      const notificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #F4B223; padding: 20px; text-align: center;">
            <h1 style="color: #1a1a1a; margin: 0;">🔔 New Lead!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${email || 'Not provided'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>City:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${city || 'Not specified'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${service || 'General inquiry'}</td></tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd;"><strong>Message:</strong><br/><p style="margin: 10px 0 0 0;">${message}</p></div>
          </div>
          <div style="background: #1a1a1a; padding: 15px; text-align: center;"><p style="color: #888; margin: 0; font-size: 12px;">Lead from ${siteName} website</p></div>
        </div>
      `;

      await sendEmail({ to: siteEmail, from: fromEmail, subject: `🔔 New Lead: ${name} - ${service || 'General inquiry'}`, html: notificationHtml, replyTo: email || undefined, cc: 'bryce@gullstack.com' });
    }

    if (SUPERTOOL_TENANT_ID) {
      try {
        await fetch(`${SUPERTOOL_API}/api/public/leads/${SUPERTOOL_TENANT_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: email || null, phone: phone || null, city: city || null, service: service || null, message, source: 'website', metadata: { form: 'contact', site: siteName } }),
        });
      } catch (e) { console.error('SuperTool error:', e); }
    }

    const acceptsHtml = req.headers.accept?.includes('text/html');
    if (acceptsHtml) {
      return res.status(200).send(`<!DOCTYPE html><html><head><title>Message Sent | ${siteName}</title><meta http-equiv="refresh" content="3;url=/"/><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a1a;color:white;}.container{text-align:center;padding:2rem;}h1{color:#F4B223;}p{color:#ccc;}</style></head><body><div class="container"><h1>✓ Message Sent!</h1><p>Thank you, ${name}! Check your email for confirmation.</p><p><small>Redirecting to homepage...</small></p></div></body></html>`);
    }
    return res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
