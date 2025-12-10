import * as listingDao from '../dao/listingDao.js';

export async function createListingForStudent({ seller_id, category_id, title, description, price_cents, condition, quantity, image_url }) {
  if (!title || price_cents == null || price_cents < 0) {
    throw new Error('Invalid listing data');
  }
  const listing = await listingDao.createListing({ seller_id, category_id, title, description, price_cents, condition, quantity, image_url });
  return listing;
}

export async function getListingById(id) {
  return await listingDao.findListingById(id);
}

export async function getActiveListings({ search, category_id, price_min_cents, price_max_cents, condition, limit, offset }) {
  return await listingDao.findActiveListings({ search, category_id, price_min_cents, price_max_cents, condition, limit, offset });
}

export async function getPendingListings() {
  return await listingDao.findListingsByStatus('pending');
}

export async function approveListingById(id) {
  const listing = await listingDao.findListingById(id);
  if (!listing) throw new Error('Listing not found');
  if (listing.status !== 'pending') throw new Error('Only pending listings can be approved');
  return await listingDao.updateListingStatus(id, 'active');
}

export async function rejectListingById(id) {
  const listing = await listingDao.findListingById(id);
  if (!listing) throw new Error('Listing not found');
  if (listing.status !== 'pending') throw new Error('Only pending listings can be rejected');
  return await listingDao.updateListingStatus(id, 'rejected');
}

export async function getMyListings(seller_id) {
  return await listingDao.findListingsBySeller(seller_id);
}
