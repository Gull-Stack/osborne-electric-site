// Vercel Serverless Function - Event Tracking
// Logs phone clicks and other events to SuperTool

const SUPERTOOL_API = process.env.SUPERTOOL_API || 'https://backend-production-5ad2.up.railway.app';
const SUPERTOOL_TENANT_ID = process.env.SUPERTOOL_TENANT_ID;

export default async function handler(req, res) {
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
    const { event, phone, page, timestamp } = req.body;
    const siteName = process.env.SITE_NAME || 'Osborne Electric';

    // Log to SuperTool using formName to categorize event type
    if (SUPERTOOL_TENANT_ID) {
      await fetch(`${SUPERTOOL_API}/api/public/leads/${SUPERTOOL_TENANT_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Phone',
          lastName: 'Click',
          phone: phone,
          formName: 'phone_click',
          sourceSite: siteName,
          sourceUrl: page,
          message: `Phone number ${phone} clicked on ${page} at ${timestamp}`,
        }),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
