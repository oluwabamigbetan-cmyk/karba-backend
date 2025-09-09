# KARBA Backend Starter (Node.js + Express)

Leads API with optional MongoDB storage, email alerts (Nodemailer), and WhatsApp Cloud API admin alerts.

## Quick start
```bash
# 1) Unzip and cd
npm install
cp .env.example .env  # fill values

# 2) Run
npm run dev
# Server: http://localhost:4000/api/health
```

## Frontend integration
In your landing page, change the lead form submit to:
```js
await fetch('https://YOUR-BACKEND-DOMAIN/api/leads', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ fullName, email, phone, service })
});
```

## Environment variables
- If `MONGO_URI` is set, leads are saved in MongoDB. Otherwise they go to `data/leads.json`.
- Set SMTP_* and ALERT_EMAIL_TO to receive email alerts.
- Set WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, ADMIN_WHATSAPP for WhatsApp alerts.

## Security
- Keep `.env` secret.
- Configure `CORS_ORIGIN` to your domain(s) in production.
- Use HTTPS in production.
