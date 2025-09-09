import fetch from 'node-fetch';

/**
 * Sends a WhatsApp message via Meta Cloud API if configured.
 * ENV required: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, ADMIN_WHATSAPP
 */
export async function sendWhatsAppAlert(lead) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, ADMIN_WHATSAPP } = process.env;
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID || !ADMIN_WHATSAPP) return { sent:false, reason:'WhatsApp not configured' };

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;
  const msg = `New Lead - KARBA\nName: ${lead.fullName}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nService: ${lead.service}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: ADMIN_WHATSAPP,
      type: "text",
      text: { body: msg }
    })
  });

  const data = await resp.json();
  if (!resp.ok) return { sent:false, reason: JSON.stringify(data) };
  return { sent:true, id:data.messages?.[0]?.id };
}
