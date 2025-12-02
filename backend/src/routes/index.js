import { Router } from 'express';
import health from './health.js';
import auth from './auth.js';
import listings from './listings.js';

const router = Router();

router.use('/health', health);
router.use('/auth', auth);
router.use('/listings', listings);

export default router;
