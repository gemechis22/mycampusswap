import jwt from 'jsonwebtoken';

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-insecure-secret-change-in-prod';
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}
