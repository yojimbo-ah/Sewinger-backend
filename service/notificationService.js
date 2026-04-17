import Notification from '../models/Notification.js';

/**
 * Notification Service
 * Centralized utility for creating notifications and emitting via Socket.io
 * 
 * Usage in controllers:
 * import { createNotification } from '../service/notificationService.js';
 * await createNotification(io, recipientId, type, actor, data);
 */

/**
 * Create a notification and emit it in real-time via Socket.io
 * 
 * @param {Socket.io instance} io - Socket.io server instance
 * @param {ObjectId} recipientId - User receiving the notification
 * @param {String} type - Notification type (must be valid enum value)
 * @param {Object} actor - Who triggered it { userId, name, avatar? }
 * @param {Object} data - Type-specific data object
 * @returns {Promise<Object>} Created notification document
 */
export const createNotification = async (
  io,
  recipientId,
  type,
  actor,
  data = {}
) => {
  try {
    // Validate type
    const validTypes = [
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
    ];

    if (!validTypes.includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Create notification in database
    const notification = new Notification({
      recipientId,
      type,
      actor: {
        userId: actor.userId,
        name: actor.name,
        avatar: actor.avatar || null
      },
      data,
      read: false
    });

    const savedNotification = await notification.save();

    // Emit real-time notification to recipient's private room
    // User might not be connected, so Socket.io will just queue it if not
    io.to(`user:${recipientId.toString()}`).emit('notification:new', {
      id: savedNotification._id,
      type: savedNotification.type,
      actor: savedNotification.actor,
      data: savedNotification.data,
      read: savedNotification.read,
      createdAt: savedNotification.createdAt
    });

    return savedNotification;

  } catch (error) {
    console.error('Error creating notification:', error.message);
    // Don't throw - notifications shouldn't break the main flow
    // Log and continue
    return null;
  }
};

/**
 * Get notifications for a user with pagination
 * 
 * @param {ObjectId} userId - User ID to fetch notifications for
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Results per page (default: 20)
 * @param {Boolean} unreadOnly - Only fetch unread (default: false)
 * @returns {Promise<Object>} { notifications, total, page, pages }
 */
export const getUserNotifications = async (
  userId,
  page = 1,
  limit = 20,
  unreadOnly = false
) => {
  try {
    const skip = (page - 1) * limit;

    // Build query
    const query = { recipientId: userId };
    if (unreadOnly) {
      query.read = false;
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for read-only performance

    // Get total count for pagination
    const total = await Notification.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      page,
      pages,
      hasMore: page < pages
    };

  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    return {
      notifications: [],
      total: 0,
      page,
      pages: 0,
      hasMore: false
    };
  }
};

/**
 * Get unread notification count for user
 * 
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Number>} Count of unread notifications
 */
export const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: userId,
      read: false
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error.message);
    return 0;
  }
};

/**
 * Delete old notifications (cleanup)
 * Optional: call periodically to keep DB clean
 * 
 * @param {Number} daysOld - Delete notifications older than this many days
 * @returns {Promise<Object>} { deletedCount }
 */
export const deleteOldNotifications = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true // Only delete read ones
    });

    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error deleting old notifications:', error.message);
    return { deletedCount: 0 };
  }
};

export default {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  deleteOldNotifications
};
