import { Router } from 'express';
import * as buyRequestController from '../controllers/buyRequestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All buy request routes require authentication
router.use(requireAuth);

/**
 * POST /api/buy-requests
 * Create a new buy request for a listing
 * Body: { listing_id: number }
 */
router.post('/', buyRequestController.createBuyRequest);

/**
 * GET /api/buy-requests/incoming
 * Get pending buy requests received by the current user (as seller)
 */
router.get('/incoming', buyRequestController.getIncomingRequests);

/**
 * GET /api/buy-requests/my
 * Get all buy requests made by the current user (as buyer)
 */
router.get('/my', buyRequestController.getMyRequests);

/**
 * POST /api/buy-requests/:id/accept
 * Seller accepts a buy request
 */
router.post('/:id/accept', buyRequestController.acceptRequest);

/**
 * POST /api/buy-requests/:id/reject
 * Seller rejects a buy request
 */
router.post('/:id/reject', buyRequestController.rejectRequest);

export default router;
