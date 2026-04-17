import mongoose, { Schema, Types } from 'mongoose';

/**
 * Notification Schema
 * Individual notification documents for real-time delivery via Socket.io
 * Stored for persistence and historical retrieval
 * 
 * Each notification is a standalone document (not nested array)
 * This allows for easier querying, pagination, and real-time updates
 */

const notificationSchema = new Schema(
  {
    // User who receives this notification
    recipientId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Type of notification
    type: {
      type: String,
      required: true,
      enum: [
        'product_purchased',
        'friend_request',
        'friend_request_accepted',
        'friend_request_rejected',
        'seller_request_approved',
        'seller_request_rejected',
        'product_approved',
        'product_flagged',
        'product_deleted',
        'order_status_updated',
        'seller_request_pending',
        'workshop_created',
        'workshop_approved',
        'workshop_rejected'
      ],
      index: true
    },

    // Who/what triggered this notification
    actor: {
      userId: {
        type: Types.ObjectId,
        ref: 'User'
      },
      name: {
        type: String,
        required: true
      },
      avatar: {
        type: String // URL to avatar image
      }
    },

    // Type-specific data (flexible object)
    // Examples:
    // product_purchased: { orderId, productId, totalPrice, productName }
    // friend_request: { senderId, senderName }
    // seller_rejected: { reason }
    // product_flagged: { productId, productName, reason }
    data: {
      type: Schema.Types.Mixed,
      default: {}
    },

    // Read status and timestamp
    read: {
      type: Boolean,
      default: false,
      index: true
    },

    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Composite index for efficient notification queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;