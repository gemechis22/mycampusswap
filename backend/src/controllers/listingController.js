import * as listingService from '../services/listingService.js';

export async function createListing(req, res) {
  try {
    const { category_id, title, description, price_cents, condition, quantity } = req.body;
    const seller_id = req.user.id;
    
    // Handle image upload if provided
    let image_url = null;
    if (req.file) {
      // Convert buffer to base64 and create data URL for now
      // In production, use cloud storage like S3, Cloudinary, etc.
      const base64 = req.file.buffer.toString('base64');
      image_url = `data:${req.file.mimetype};base64,${base64}`;
    }
    
    const listing = await listingService.createListingForStudent({ 
      seller_id, 
      category_id, 
      title, 
      description, 
      price_cents, 
      condition, 
      quantity,
      image_url
    });
    res.status(201).json({ listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getActiveListings(req, res) {
  try {
    const { search, category_id, price_min, price_max, condition, limit, offset } = req.query;
    const listings = await listingService.getActiveListings({ 
      search: search || null,
      category_id: category_id ? parseInt(category_id) : null,
      price_min_cents: price_min ? parseInt(price_min) : null,
      price_max_cents: price_max ? parseInt(price_max) : null,
      condition: condition || null,
      limit: limit ? parseInt(limit) : 50, 
      offset: offset ? parseInt(offset) : 0 
    });
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getMyListings(req, res) {
  try {
    const seller_id = req.user.id;
    const listings = await listingService.getMyListings(seller_id);
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPendingListings(req, res) {
  try {
    const listings = await listingService.getPendingListings();
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function approveListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await listingService.approveListingById(parseInt(id));
    res.json({ listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function rejectListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await listingService.rejectListingById(parseInt(id));
    res.json({ listing });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
