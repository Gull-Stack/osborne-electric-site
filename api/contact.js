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

function looksLikeSpam(data) {
  const { name, fax_number, _timestamp } = data;
  if (fax_number) return 'honeypot';
  if (_timestamp) {
    const elapsed = Date.now() - parseInt(_timestamp, 10);
    if (elapsed < 3000) return 'too_fast';
  }
  if (isGibberish(name)) return 'gibberish_name';
  if (name && name.trim().length < 2) return 'short_name';
  return false;
}
// === END SPAM PROTECTION ===

async function sendEmail({ to, from, subject, html, replyTo }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
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
    const spamReason = looksLikeSpam({ name, fax_number, _timestamp });
    if (spamReason) {
      console.log(`[SPAM BLOCKED] reason=${spamReason} name="${name}" email="${email}"`);
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
    const siteEmail = process.env.SITE_EMAIL || 'info@osborne-electric.com';
    const fromEmail = process.env.FROM_EMAIL || 'leads@gullstack.com';

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

      await sendEmail({ to: siteEmail, from: fromEmail, subject: `🔔 New Lead: ${name} - ${service || 'General inquiry'}`, html: notificationHtml, replyTo: email || undefined });
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
