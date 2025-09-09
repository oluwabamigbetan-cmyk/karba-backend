import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  service: { type: String, enum: ['life','education','family','retirement','motor','general','real_estate_future'], required: true },
  source: { type: String, default: 'website' },
  status: { type: String, enum: ['new','contacted','qualified','closed'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'leads' });

export default mongoose.model('Lead', LeadSchema);
