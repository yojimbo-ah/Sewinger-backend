import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { getUserNotifications, getUnreadCount } from "../service/notificationService.js";

/**
 * Get all notifications for authenticated user with pagination
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unread === 'true';

    // Fetch user exists check
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Get paginated notifications
    const notificationData = await getUserNotifications(
      userId,
      page,
      limit,
      unreadOnly
    );

    return res.status(200).json({
      message: 'Notifications fetched successfully',
      data: notificationData
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get count of unread notifications for user
 */
const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Get unread count
    const unreadCount = await getUnreadCount(userId);

    return res.status(200).json({
      message: 'Unread count fetched',
      unreadCount: unreadCount
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get notifications by type
 */
const getNotificationsByType = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Valid notification types
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
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    const skip = (page - 1) * limit;

    // Fetch notifications of specific type
    const notifications = await Notification.find({
      recipientId: userId,
      type: type
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments({
      recipientId: userId,
      type: type
    });

    const pages = Math.ceil(total / limit);

    return res.status(200).json({
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        total,
        page,
        pages,
        hasMore: page < pages
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const notificationController = {
  getNotifications,
  getUnreadNotificationCount,
  getNotificationsByType
};

export default notificationController;