import ProductInquiry from '../models/ProductInquiry.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

// Create a new inquiry
export const createInquiry = async (req, res) => {
  try {
    const { productId, subject, initialMessage } = req.body;
    console.log('🔍 DEBUG - req.user:', req.user);
    console.log('🔍 DEBUG - req.body:', req.body);
    
    const buyerId = req.user?.id;
    
    if (!buyerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sellerId = product.creatorId;

    // Check if buyer already has an open inquiry for this product
    const existingInquiry = await ProductInquiry.findOne({
      productId,
      buyerId,
      status: { $ne: 'closed' }
    });

    if (existingInquiry) {
      return res.status(400).json({ message: 'You already have an open inquiry for this product' });
    }

    // Create new inquiry
    const inquiry = new ProductInquiry({
      productId,
      sellerId,
      buyerId,
      subject,
      messages: [
        {
          senderId: buyerId,
          senderRole: 'buyer',
          text: initialMessage,
          isPublic: false,
          timestamp: new Date()
        }
      ]
    });

    await inquiry.save();
    await inquiry.populate([
      { path: 'buyerId', select: 'name.firstName name.lastName bio.profileImage' },
      { path: 'sellerId', select: 'name.firstName name.lastName bio.profileImage' },
      { path: 'productId', select: 'name images.mainImage' }
    ]);

    // Notify seller via socket
    const io = getIO();
    io.to(`user:${sellerId}`).emit('newInquiry', {
      inquiryId: inquiry._id,
      productName: product.name,
      buyerName: `${inquiry.buyerId.name.firstName} ${inquiry.buyerId.name.lastName}`,
      subject
    });

    res.status(201).json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ message: 'Failed to create inquiry', error: error.message });
  }
};

// Get buyer's inquiries
export const getBuyerInquiries = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { page = 1, limit = 10, status = 'open' } = req.query;

    const skip = (page - 1) * limit;

    const query = { buyerId };
    if (status !== 'all') {
      query.status = status;
    }

    const inquiries = await ProductInquiry.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: 'sellerId', select: 'name.firstName name.lastName bio.profileImage' },
        { path: 'productId', select: 'name images.mainImage' }
      ]);

    const total = await ProductInquiry.countDocuments(query);

    res.json({
      success: true,
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching buyer inquiries:', error);
    res.status(500).json({ message: 'Failed to fetch inquiries', error: error.message });
  }
};

// Get seller's inquiries
export const getSellerInquiries = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { productId, page = 1, limit = 10, status = 'open' } = req.query;

    const skip = (page - 1) * limit;

    const query = { sellerId };
    if (status !== 'all') {
      query.status = status;
    }
    if (productId) {
      query.productId = productId;
    }

    const inquiries = await ProductInquiry.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: 'buyerId', select: 'name.firstName name.lastName bio.profileImage' },
        { path: 'productId', select: 'name images.mainImage' }
      ]);

    const total = await ProductInquiry.countDocuments(query);

    res.json({
      success: true,
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching seller inquiries:', error);
    res.status(500).json({ message: 'Failed to fetch inquiries', error: error.message });
  }
};

// Get single inquiry
export const getInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const userId = req.user.id;

    const inquiry = await ProductInquiry.findById(inquiryId).populate([
      { path: 'buyerId', select: 'name.firstName name.lastName bio.profileImage' },
      { path: 'sellerId', select: 'name.firstName name.lastName bio.profileImage' },
      { path: 'productId', select: 'name images.mainImage price' }
    ]);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Check if user is buyer or seller
    if (inquiry.buyerId._id.toString() !== userId && inquiry.sellerId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to view this inquiry' });
    }

    // Mark as read
    if (inquiry.buyerId._id.toString() === userId) {
      inquiry.buyerRead = true;
    } else {
      inquiry.sellerRead = true;
    }
    await inquiry.save();

    res.json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ message: 'Failed to fetch inquiry', error: error.message });
  }
};

// Add message to inquiry
export const addMessageToInquiry = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { text, isPublic = false } = req.body;
    const userId = req.user.id;

    const inquiry = await ProductInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Verify user is buyer or seller
    const isBuyer = inquiry.buyerId.toString() === userId;
    const isSeller = inquiry.sellerId.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Unauthorized to add message' });
    }

    // Add message
    inquiry.messages.push({
      senderId: userId,
      senderRole: isBuyer ? 'buyer' : 'seller',
      text,
      isPublic,
      timestamp: new Date()
    });

    inquiry.lastMessageAt = new Date();
    inquiry.sellerRead = false; // Mark unread for seller
    inquiry.buyerRead = false;  // Mark unread for buyer

    await inquiry.save();
    await inquiry.populate([
      { path: 'buyerId', select: 'name.firstName name.lastName bio.profileImage' },
      { path: 'sellerId', select: 'name.firstName name.lastName bio.profileImage' }
    ]);

    // Notify via socket
    const io = getIO();
    io.to(`user:${inquiry.buyerId}`).emit('inquiryMessage', {
      inquiryId,
      message: inquiry.messages[inquiry.messages.length - 1]
    });
    io.to(`user:${inquiry.sellerId}`).emit('inquiryMessage', {
      inquiryId,
      message: inquiry.messages[inquiry.messages.length - 1]
    });

    res.json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Failed to add message', error: error.message });
  }
};

// Update inquiry status
export const updateInquiryStatus = async (req, res) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['open', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const inquiry = await ProductInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    // Only seller or buyer can update status
    if (inquiry.sellerId.toString() !== userId && inquiry.buyerId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    inquiry.status = status;
    await inquiry.save();

    // Notify both parties
    const io = getIO();
    io.to(`user:${inquiry.buyerId}`).emit('inquiryStatusChanged', {
      inquiryId,
      status
    });
    io.to(`user:${inquiry.sellerId}`).emit('inquiryStatusChanged', {
      inquiryId,
      status
    });

    res.json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// Get product inquiries (public Q&A)
export const getProductInquiries = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Get only public messages from inquiries
    const inquiries = await ProductInquiry.find({
      productId,
      status: { $ne: 'closed' }
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate([
        { path: 'buyerId', select: 'name.firstName name.lastName bio.profileImage' },
        { path: 'sellerId', select: 'name.firstName name.lastName bio.profileImage' }
      ]);

    const total = await ProductInquiry.countDocuments({
      productId,
      status: { $ne: 'closed' }
    });

    res.json({
      success: true,
      inquiries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching product inquiries:', error);
    res.status(500).json({ message: 'Failed to fetch inquiries', error: error.message });
  }
};
