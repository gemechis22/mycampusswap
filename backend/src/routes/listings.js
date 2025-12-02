import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as listingController from '../controllers/listingController.js';

const router = Router();

router.post('/', requireAuth, listingController.createListing);
router.get('/', listingController.getActiveListings);
router.get('/my', requireAuth, listingController.getMyListings);
router.get('/pending', requireAuth, requireAdmin, listingController.getPendingListings);
router.post('/:id/approve', requireAuth, requireAdmin, listingController.approveListing);
router.post('/:id/reject', requireAuth, requireAdmin, listingController.rejectListing);

export default router;
