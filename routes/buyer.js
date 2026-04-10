import express from 'express';
import { getBuyerAnalytics, getBuyerOrders } from '../controllers/buyer.js';
import { verifyJWT } from '../middleware/verifyJWT.js';

const router = express.Router();

// Get buyer analytics
router.get('/analytics', verifyJWT, getBuyerAnalytics);

// Get buyer orders with pagination
router.get('/orders', verifyJWT, getBuyerOrders);

export default router;
