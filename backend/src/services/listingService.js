import * as listingDao from '../dao/listingDao.js';

export async function createListingForStudent({ seller_id, category_id, title, description, price_cents, condition, quantity, image_url, images }) {
  if (!title || price_cents == null || price_cents < 0) {
    throw new Error('Invalid listing data');
  }
  const listing = await listingDao.createListing({ seller_id, category_id, title, description, price_cents, condition, quantity, image_url });
  
  // Add additional images if provided (up to 5 total)
  if (images && images.length > 0) {
    const imagesToAdd = images.slice(0, 5).map((img, idx) => ({
      data_url: img,
      display_order: idx + 1
    }));
    await listingDao.addListingImages(listing.id, imagesToAdd);
  }
  
  // Fetch images and attach to listing
  const listingImages = await listingDao.getListingImages(listing.id);
  return { ...listing, images: listingImages };
}

export async function getListingById(id) {
  const listing = await listingDao.findListingById(id);
  if (listing) {
    const images = await listingDao.getListingImages(id);
    return { ...listing, images };
  }
  return listing;
}

export async function getActiveListings({ search, category_id, price_min_cents, price_max_cents, condition, limit, offset }) {
  const listings = await listingDao.findActiveListings({ search, category_id, price_min_cents, price_max_cents, condition, limit, offset });
  
  // Fetch images for each listing
  const listingsWithImages = await Promise.all(
    listings.map(async (listing) => {
      const images = await listingDao.getListingImages(listing.id);
      return { ...listing, images };
    })
  );
  
  return listingsWithImages;
}

export async function getPendingListings() {
  const listings = await listingDao.findListingsByStatus('pending');
  
  // Fetch images for each listing
  const listingsWithImages = await Promise.all(
    listings.map(async (listing) => {
      const images = await listingDao.getListingImages(listing.id);
      return { ...listing, images };
    })
  );
  
  return listingsWithImages;
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
