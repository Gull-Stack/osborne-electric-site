// Vercel Serverless Function - Contact Form Handler
// Sends notification to Telegram, agent sends follow-up email

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003895576067';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, city, service, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    // Format Telegram message
    const siteName = process.env.SITE_NAME || 'Osborne Electric';
    const siteEmail = process.env.SITE_EMAIL || 'info@osborne-electric.com';
    
    const telegramMessage = `📬 **NEW LEAD: ${siteName}**

👤 **Name:** ${name}
📞 **Phone:** ${phone || 'Not provided'}
📧 **Email:** ${email || 'Not provided'}
📍 **City:** ${city || 'Not specified'}
🔧 **Service:** ${service || 'General inquiry'}

💬 **Message:**
${message}

---
_Reply to send follow-up email to ${siteEmail}_`;

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!telegramResponse.ok) {
      const error = await telegramResponse.text();
      console.error('Telegram error:', error);
      // Still return success to user - we'll handle notification failures separately
    }

    // Return success page or JSON based on Accept header
    const acceptsHtml = req.headers.accept?.includes('text/html');
    
    if (acceptsHtml) {
      // Redirect to thank you page or return HTML
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Message Sent | ${siteName}</title>
          <meta http-equiv="refresh" content="3;url=/" />
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: white; }
            .container { text-align: center; padding: 2rem; }
            h1 { color: #F4B223; }
            p { color: #ccc; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Message Sent!</h1>
            <p>Thank you, ${name}! We'll be in touch shortly.</p>
            <p><small>Redirecting to homepage...</small></p>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(200).json({ success: true, message: 'Form submitted successfully' });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
