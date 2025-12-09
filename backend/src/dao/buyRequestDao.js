import { query } from '../config/db.js';

/**
 * Create a new buy request
 * @param {number} listing_id - ID of the listing
 * @param {number} buyer_id - ID of the student making the request
 * @param {number} seller_id - ID of the listing owner
 * @returns {object} The created buy request
 */
export async function createBuyRequest(listing_id, buyer_id, seller_id) {
  const text = `
    INSERT INTO buy_request (listing_id, buyer_id, seller_id, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING *
  `;
  const values = [listing_id, buyer_id, seller_id];
  const { rows } = await query(text, values);
  return rows[0];
}

/**
 * Find a buy request by ID
 * @param {number} id - Buy request ID
 * @returns {object} The buy request or null
 */
export async function findBuyRequestById(id) {
  const text = 'SELECT * FROM buy_request WHERE id = $1';
  const { rows } = await query(text, [id]);
  return rows[0] || null;
}

/**
 * Get all pending buy requests for a seller (incoming requests)
 * @param {number} seller_id - ID of the seller
 * @returns {array} List of buy requests with buyer/listing details
 */
export async function findPendingRequestsForSeller(seller_id) {
  const text = `
    SELECT 
      br.*,
      l.title AS listing_title,
      l.price_cents,
      u.display_name AS buyer_name,
      u.university_email AS buyer_email
    FROM buy_request br
    LEFT JOIN listing l ON br.listing_id = l.id
    LEFT JOIN app_user u ON br.buyer_id = u.id
    WHERE br.seller_id = $1 AND br.status = 'pending'
    ORDER BY br.created_at DESC
  `;
  const { rows } = await query(text, [seller_id]);
  return rows;
}

/**
 * Get all buy requests made by a buyer
 * @param {number} buyer_id - ID of the buyer
 * @returns {array} List of buy requests with listing/seller details
 */
export async function findRequestsByBuyer(buyer_id) {
  const text = `
    SELECT 
      br.*,
      l.title AS listing_title,
      l.price_cents,
      u.display_name AS seller_name,
      u.university_email AS seller_email
    FROM buy_request br
    LEFT JOIN listing l ON br.listing_id = l.id
    LEFT JOIN app_user u ON br.seller_id = u.id
    WHERE br.buyer_id = $1
    ORDER BY br.created_at DESC
  `;
  const { rows } = await query(text, [buyer_id]);
  return rows;
}

/**
 * Check if a buy request already exists for a listing and buyer
 * @param {number} listing_id - ID of the listing
 * @param {number} buyer_id - ID of the buyer
 * @returns {object} The existing request or null
 */
export async function findExistingRequest(listing_id, buyer_id) {
  const text = `
    SELECT * FROM buy_request 
    WHERE listing_id = $1 AND buyer_id = $2 AND status = 'pending'
  `;
  const { rows } = await query(text, [listing_id, buyer_id]);
  return rows[0] || null;
}

/**
 * Update buy request status
 * @param {number} id - Buy request ID
 * @param {string} status - New status ('accepted', 'rejected')
 * @returns {object} The updated buy request
 */
export async function updateBuyRequestStatus(id, status) {
  const text = `
    UPDATE buy_request 
    SET status = $1, updated_at = NOW() 
    WHERE id = $2 
    RETURNING *
  `;
  const { rows } = await query(text, [status, id]);
  return rows[0] || null;
}
