import * as listingService from '../services/listingService.js';

export async function createListing(req, res) {
  try {
    const { category_id, title, description, price_cents, condition, quantity } = req.body;
    const seller_id = req.user.id;
    
    // Handle image uploads if provided (up to 5)
    let image_url = null;
    let images = [];
    
    if (req.files && req.files.length > 0) {
      // Convert files to base64
      images = req.files.slice(0, 5).map((file) => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
      
      // First image is the primary image_url
      if (images.length > 0) {
        image_url = images[0];
      }
    }
    
    const listing = await listingService.createListingForStudent({ 
      seller_id, 
      category_id, 
      title, 
      description, 
      price_cents, 
      condition, 
      quantity,
      image_url,
      images
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
