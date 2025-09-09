import { Router } from 'express';
import fetch from 'node-fetch';
import Joi from 'joi';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import { fileStorageInit, fileStorageAdd } from '../utils/storage.js';
import { sendEmailAlert } from '../utils/mailer.js';
import { authMiddleware } from '../utils/auth.js';
import { sendWhatsAppAlert } from '../utils/whatsapp.js';

const router = Router();
fileStorageInit();

// connect to Mongo if URI provided
const { MONGO_URI } = process.env;
let mongoReady = false;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI).then(() => {
    mongoReady = true;
    console.log('MongoDB connected');
  }).catch(err => console.error('MongoDB error', err.message));
}

const schema = Joi.object({
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).max(30).required(),
  service: Joi.string().valid('life','education','family','retirement','motor','general','real_estate_future').required()
});


// reCAPTCHA v3 verification
async function verifyRecaptcha(token, ip) {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return { ok: true, skipped: true }; // allow if not configured
  if (!token) return { ok: false, reason: 'missing token' };
  const params = new URLSearchParams();
  params.append('secret', secret);
  params.append('response', token);
  if (ip) params.append('remoteip', ip);

  const resp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });
  const data = await resp.json();
  const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || 0.5);
  if (!data.success) return { ok:false, reason: JSON.stringify(data) };
  if (typeof data.score === 'number' && data.score < minScore) return { ok:false, reason: `low score ${data.score}` };
  return { ok:true, score: data.score };
}

router.post('/', async (req, res) => {
  const { recaptchaToken, ...payload } = req.body;
  const recap = await verifyRecaptcha(recaptchaToken, req.ip);
  if (!recap.ok) return res.status(400).json({ error: 'reCAPTCHA failed', details: recap.reason });
  const { error, value } = schema.validate(payload);
  if (error) return res.status(400).json({ error: error.message });

  const lead = { ...value, source:'website', status:'new', createdAt: new Date() };

  try {
    if (mongoReady) {
      await Lead.create(lead);
    } else {
      fileStorageAdd(lead);
    }
  } catch (e) {
    return res.status(500).json({ error: 'Failed to store lead', details: e.message });
  }

  // Alerts (best-effort)
  try { await sendEmailAlert(lead); } catch {}
  try { await sendWhatsAppAlert(lead); } catch {}

  res.json({ ok:true, lead });
});

export default router;

// List leads (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let out = [];
    if (mongoReady) {
      out = await Lead.find().sort({ createdAt: -1 }).lean();
    } else {
      const { readFileSync } = await import('fs');
      out = JSON.parse(readFileSync('./data/leads.json', 'utf-8')).reverse();
    }
    res.json({ ok:true, leads: out });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list leads' });
  }
});

// Update lead status (protected) - Mongo only; file storage skipped for simplicity
router.patch('/:id', authMiddleware, async (req, res) => {
  const { status } = req.body || {};
  if (!['new','contacted','qualified','closed'].includes(status || '')) return res.status(400).json({ error: 'Invalid status' });
  if (!mongoReady) return res.status(400).json({ error: 'Status updates require MongoDB (set MONGO_URI)' });
  try {
    const updated = await Lead.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json({ ok:true, lead: updated });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});
