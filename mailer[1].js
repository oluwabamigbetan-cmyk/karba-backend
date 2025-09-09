import nodemailer from 'nodemailer';

export async function sendEmailAlert(lead) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ALERT_EMAIL_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ALERT_EMAIL_TO) return { sent:false, reason:'SMTP not configured' };

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  const html = `
    <h2>New Lead - KARBA</h2>
    <p><strong>Name:</strong> ${lead.fullName}</p>
    <p><strong>Phone:</strong> ${lead.phone}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Service:</strong> ${lead.service}</p>
    <p>Created: ${new Date(lead.createdAt).toLocaleString()}</p>
  `;

  const info = await transporter.sendMail({
    from: `"KARBA Leads" <${SMTP_USER}>`,
    to: ALERT_EMAIL_TO,
    subject: "New Lead - KARBA",
    html
  });

  return { sent:true, messageId: info.messageId };
}
