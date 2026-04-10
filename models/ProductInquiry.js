import mongoose from 'mongoose';

const productInquirySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      senderRole: {
        type: String,
        enum: ['buyer', 'seller'],
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      },
      isPublic: {
        type: Boolean,
        default: false
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['open', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  sellerRead: {
    type: Boolean,
    default: false
  },
  buyerRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
productInquirySchema.index({ productId: 1, sellerId: 1 });
productInquirySchema.index({ buyerId: 1, createdAt: -1 });
productInquirySchema.index({ sellerId: 1, createdAt: -1 });

export default mongoose.model('ProductInquiry', productInquirySchema);
