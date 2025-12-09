import * as buyRequestDao from '../dao/buyRequestDao.js';
import * as listingDao from '../dao/listingDao.js';

/**
 * Create a buy request (with validation)
 * @param {number} listing_id - ID of the listing
 * @param {number} buyer_id - ID of the student making the request
 * @returns {object} The created buy request
 * @throws {Error} if listing doesn't exist, buyer is seller, or request already exists
 */
export async function createBuyRequestForStudent(listing_id, buyer_id) {
  // Validate listing exists and is active
  const listing = await listingDao.findListingById(listing_id);
  if (!listing) {
    throw new Error('Listing not found');
  }
  if (listing.status !== 'active') {
    throw new Error('Listing is not available for purchase');
  }

  // Prevent buyer from requesting their own listing
  if (listing.seller_id === buyer_id) {
    throw new Error('Cannot request your own listing');
  }

  // Check if request already exists
  const existing = await buyRequestDao.findExistingRequest(listing_id, buyer_id);
  if (existing) {
    throw new Error('You already have a pending request for this listing');
  }

  // Create the request
  const buyRequest = await buyRequestDao.createBuyRequest(
    listing_id,
    buyer_id,
    listing.seller_id
  );
  return buyRequest;
}

/**
 * Get pending buy requests for a seller
 * @param {number} seller_id - ID of the seller
 * @returns {array} List of pending requests
 */
export async function getPendingRequestsForSeller(seller_id) {
  return await buyRequestDao.findPendingRequestsForSeller(seller_id);
}

/**
 * Get all buy requests made by a buyer
 * @param {number} buyer_id - ID of the buyer
 * @returns {array} List of requests (all statuses)
 */
export async function getRequestsByBuyer(buyer_id) {
  return await buyRequestDao.findRequestsByBuyer(buyer_id);
}

/**
 * Accept a buy request (seller action)
 * @param {number} request_id - ID of the buy request
 * @param {number} seller_id - ID of the seller (for authorization)
 * @returns {object} The updated buy request
 * @throws {Error} if request not found, not pending, or seller is not authorized
 */
export async function acceptBuyRequest(request_id, seller_id) {
  const buyRequest = await buyRequestDao.findBuyRequestById(request_id);
  if (!buyRequest) {
    throw new Error('Buy request not found');
  }
  if (buyRequest.status !== 'pending') {
    throw new Error('Only pending requests can be accepted');
  }
  if (buyRequest.seller_id !== seller_id) {
    throw new Error('Unauthorized: only the seller can accept this request');
  }

  return await buyRequestDao.updateBuyRequestStatus(request_id, 'accepted');
}

/**
 * Reject a buy request (seller action)
 * @param {number} request_id - ID of the buy request
 * @param {number} seller_id - ID of the seller (for authorization)
 * @returns {object} The updated buy request
 * @throws {Error} if request not found, not pending, or seller is not authorized
 */
export async function rejectBuyRequest(request_id, seller_id) {
  const buyRequest = await buyRequestDao.findBuyRequestById(request_id);
  if (!buyRequest) {
    throw new Error('Buy request not found');
  }
  if (buyRequest.status !== 'pending') {
    throw new Error('Only pending requests can be rejected');
  }
  if (buyRequest.seller_id !== seller_id) {
    throw new Error('Unauthorized: only the seller can reject this request');
  }

  return await buyRequestDao.updateBuyRequestStatus(request_id, 'rejected');
}
