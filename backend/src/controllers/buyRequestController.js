import * as buyRequestService from '../services/buyRequestService.js';

/**
 * POST /api/buy-requests
 * Create a new buy request
 */
export async function createBuyRequest(req, res) {
  try {
    const { listing_id } = req.body;
    const buyer_id = req.user.id;

    if (!listing_id) {
      return res.status(400).json({ error: 'listing_id is required' });
    }

    const buyRequest = await buyRequestService.createBuyRequestForStudent(
      parseInt(listing_id),
      buyer_id
    );
    res.status(201).json({ buyRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/buy-requests/incoming
 * Get pending buy requests for the current seller
 */
export async function getIncomingRequests(req, res) {
  try {
    const seller_id = req.user.id;
    const requests = await buyRequestService.getPendingRequestsForSeller(seller_id);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /api/buy-requests/my
 * Get all buy requests made by the current buyer
 */
export async function getMyRequests(req, res) {
  try {
    const buyer_id = req.user.id;
    const requests = await buyRequestService.getRequestsByBuyer(buyer_id);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /api/buy-requests/:id/accept
 * Seller accepts a buy request
 */
export async function acceptRequest(req, res) {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    const updatedRequest = await buyRequestService.acceptBuyRequest(
      parseInt(id),
      seller_id
    );
    res.json({ buyRequest: updatedRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * POST /api/buy-requests/:id/reject
 * Seller rejects a buy request
 */
export async function rejectRequest(req, res) {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    const updatedRequest = await buyRequestService.rejectBuyRequest(
      parseInt(id),
      seller_id
    );
    res.json({ buyRequest: updatedRequest });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
