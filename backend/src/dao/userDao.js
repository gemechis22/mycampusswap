import { query } from '../config/db.js';

export async function createUser({ university_email, display_name, password_hash, role = 'student' }) {
  const text = `INSERT INTO app_user (university_email, display_name, password_hash, role)
               VALUES ($1,$2,$3,$4) RETURNING id, university_email, display_name, role, created_at`;
  const values = [university_email.toLowerCase(), display_name, password_hash, role];
  const { rows } = await query(text, values);
  return rows[0];
}

export async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM app_user WHERE university_email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

export async function findById(id) {
  const { rows } = await query('SELECT id, university_email, display_name, role, created_at FROM app_user WHERE id = $1', [id]);
  return rows[0] || null;
}
