import { query } from '../config/db.js';

export async function createListing({ seller_id, category_id, title, description, price_cents, condition, quantity, image_url }) {
  const text = `INSERT INTO listing (seller_id, category_id, title, description, price_cents, condition, quantity, image_url, status)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`;
  const values = [seller_id, category_id, title, description, price_cents, condition || 'unknown', quantity || 1, image_url || null];
  const { rows } = await query(text, values);
  return rows[0];
}

export async function findListingById(id) {
  const { rows } = await query('SELECT * FROM listing WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function findListingsByStatus(status) {
  const text = `SELECT 
    l.*,
    u.display_name AS seller_name,
    c.name AS category_name
  FROM listing l
  LEFT JOIN app_user u ON l.seller_id = u.id
  LEFT JOIN category c ON l.category_id = c.id
  WHERE l.status = $1 
  ORDER BY l.created_at DESC`;
  const { rows } = await query(text, [status]);
  return rows;
}

export async function findActiveListings({ search, category_id, price_min_cents, price_max_cents, condition, limit = 50, offset = 0 }) {
  let text = `SELECT 
    l.*,
    u.display_name AS seller_name,
    c.name AS category_name
  FROM listing l
  LEFT JOIN app_user u ON l.seller_id = u.id
  LEFT JOIN category c ON l.category_id = c.id
  WHERE l.status = $1`;
  const values = ['active'];

  // Search by title or description (case-insensitive)
  if (search) {
    text += ' AND (LOWER(l.title) LIKE LOWER($' + (values.length + 1) + ') OR LOWER(l.description) LIKE LOWER($' + (values.length + 1) + '))';
    values.push('%' + search + '%');
  }

  // Filter by category
  if (category_id) {
    text += ' AND l.category_id = $' + (values.length + 1);
    values.push(category_id);
  }

  // Filter by minimum price
  if (price_min_cents !== undefined && price_min_cents !== null) {
    text += ' AND l.price_cents >= $' + (values.length + 1);
    values.push(price_min_cents);
  }

  // Filter by maximum price
  if (price_max_cents !== undefined && price_max_cents !== null) {
    text += ' AND l.price_cents <= $' + (values.length + 1);
    values.push(price_max_cents);
  }

  // Filter by condition
  if (condition) {
    text += ' AND l.condition = $' + (values.length + 1);
    values.push(condition);
  }

  text += ' ORDER BY l.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
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
  const text = `SELECT 
    l.*,
    c.name AS category_name
  FROM listing l
  LEFT JOIN category c ON l.category_id = c.id
  WHERE l.seller_id = $1 
  ORDER BY l.created_at DESC`;
  const { rows } = await query(text, [seller_id]);
  return rows;
}
