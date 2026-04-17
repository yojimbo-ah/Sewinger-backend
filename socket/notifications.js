import Notification from '../models/Notification.js';

/**
 * Notification Socket Handler
 * Manages real-time notification updates like marking as read
 */

export const handleNotifications = (io, socket) => {
  const userId = socket.userId;

  // Listen for mark as read event
  socket.on('notification:mark_read', async (data) => {
    try {
      const { notificationId } = data;

      if (!notificationId) {
        return socket.emit('notification:error', {
          error: 'notificationId required'
        });
      }

      // Update notification in database
      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        {
          read: true,
          readAt: new Date()
        },
        { new: true }
      );

      if (!updatedNotification) {
        return socket.emit('notification:error', {
          error: 'Notification not found'
        });
      }

      // Verify it belongs to this user (security check)
      if (updatedNotification.recipientId.toString() !== userId) {
        return socket.emit('notification:error', {
          error: 'Unauthorized'
        });
      }

      // Emit confirmation back to client
      socket.emit('notification:read:confirmed', {
        notificationId: notificationId,
        readAt: updatedNotification.readAt,
        status: 'marked_read'
      });

    } catch (error) {
      socket.emit('notification:error', {
        error: error.message
      });
    }
  });

  // Listen for mark all as read event
  socket.on('notification:mark_all_read', async (data) => {
    try {
      // Update all unread notifications for this user
      const result = await Notification.updateMany(
        {
          recipientId: userId,
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );

      // Emit confirmation with count
      socket.emit('notification:all_read:confirmed', {
        modifiedCount: result.modifiedCount,
        status: 'all_marked_read'
      });

    } catch (error) {
      socket.emit('notification:error', {
        error: error.message
      });
    }
  });

  // Listen for delete notification event
  socket.on('notification:delete', async (data) => {
    try {
      const { notificationId } = data;

      if (!notificationId) {
        return socket.emit('notification:error', {
          error: 'notificationId required'
        });
      }

      // Find and verify ownership
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return socket.emit('notification:error', {
          error: 'Notification not found'
        });
      }

      if (notification.recipientId.toString() !== userId) {
        return socket.emit('notification:error', {
          error: 'Unauthorized'
        });
      }

      // Delete notification
      await Notification.findByIdAndDelete(notificationId);

      // Emit confirmation
      socket.emit('notification:delete:confirmed', {
        notificationId: notificationId,
        status: 'deleted'
      });

    } catch (error) {
      socket.emit('notification:error', {
        error: error.message
      });
    }
  });
};

export default handleNotifications;
