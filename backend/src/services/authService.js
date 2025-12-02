import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findByEmail } from '../dao/userDao.js';

const SALT_ROUNDS = 10;

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-insecure-secret-change-in-prod';
}

export async function register({ email, displayName, password }) {
  // Basic validation
  if (!email || !displayName || !password) {
    throw new Error('Missing required fields');
  }
  const existing = await findByEmail(email);
  if (existing) {
    throw new Error('Email already registered');
  }
  // (Optional) enforce York domain later: email.endsWith('@yorku.ca')
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ university_email: email, display_name: displayName, password_hash });
  return user;
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Missing credentials');
  }
  const user = await findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ sub: user.id, role: user.role }, getJwtSecret(), { expiresIn: '2h' });
  return { token, user: { id: user.id, email: user.university_email, displayName: user.display_name, role: user.role } };
}
