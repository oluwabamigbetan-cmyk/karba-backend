import jwt from 'jsonwebtoken';

export function signToken(payload) {
  const key = process.env.JWT_SECRET || 'dev-secret-change-me';
  return jwt.sign(payload, key, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const key = process.env.JWT_SECRET || 'dev-secret-change-me';
    const decoded = jwt.verify(token, key);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
