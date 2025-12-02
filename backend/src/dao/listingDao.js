import { query } from '../config/db.js';

export async function createListing({ seller_id, category_id, title, description, price_cents, condition, quantity }) {
  const text = `INSERT INTO listing (seller_id, category_id, title, description, price_cents, condition, quantity, status)
               VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING *`;
  const values = [seller_id, category_id, title, description, price_cents, condition || 'unknown', quantity || 1];
  const { rows } = await query(text, values);
  return rows[0];
}

export async function findListingById(id) {
  const { rows } = await query('SELECT * FROM listing WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function findListingsByStatus(status) {
  const { rows } = await query('SELECT * FROM listing WHERE status = $1 ORDER BY created_at DESC', [status]);
  return rows;
}

export async function findActiveListings({ category_id, limit = 50, offset = 0 }) {
  let text = 'SELECT * FROM listing WHERE status = $1';
  const values = ['active'];
  if (category_id) {
    text += ' AND category_id = $2';
    values.push(category_id);
  }
  text += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
  values.push(limit, offset);
  const { rows } = await query(text, values);
  return rows;
}

export async function updateListingStatus(id, status) {
  const text = 'UPDATE listing SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
  const { rows } = await query(text, [status, id]);
  return rows[0] || null;
}

export async function findListingsBySeller(seller_id) {
  const { rows } = await query('SELECT * FROM listing WHERE seller_id = $1 ORDER BY created_at DESC', [seller_id]);
  return rows;
}
