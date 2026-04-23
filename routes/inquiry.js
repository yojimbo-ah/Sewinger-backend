import express from 'express';
import {
  createInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  getInquiry,
  addMessageToInquiry,
  updateInquiryStatus,
  getProductInquiries
} from '../controllers/inquiry.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
import { inquiryCreationLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

// Create new inquiry (buyer)
router.post('/', verifyJWT, inquiryCreationLimiter, createInquiry);

// Get buyer's inquiries
router.get('/buyer/list', verifyJWT, getBuyerInquiries);

// Get seller's inquiries
router.get('/seller/list', verifyJWT, getSellerInquiries);

// Get single inquiry
router.get('/:inquiryId', verifyJWT, getInquiry);

// Add message to inquiry
router.post('/:inquiryId/message', verifyJWT, addMessageToInquiry);

// Update inquiry status
router.patch('/:inquiryId/status', verifyJWT, updateInquiryStatus);

// Get product inquiries (public Q&A)
router.get('/product/:productId', getProductInquiries);

export default router;
