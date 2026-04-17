# Real-time Notification System Implementation Guide

## 📋 System Overview

A real-time notification system using Socket.io for instant delivery and MongoDB for persistence. Notifications are emitted immediately when triggered and stored for historical retrieval.

## 🏗️ Architecture

### High-Level Flow
```
Event (Order/Friend Request/etc) 
  ↓
Controller processes action
  ↓
Notification Service triggered
  ↓
Simultaneously:
  ├─ Save to MongoDB (Notification collection)
  └─ Emit Socket event to recipient's private room (user:recipientId)
  ↓
Frontend receives real-time update via Socket
  ↓
User can mark as read (Socket emit back to backend)
  ↓
Backend updates DB and broadcasts confirmation
```

## 🔔 Notification Types

| Type | Triggered By | Actor | Recipient | Example Data |
|------|--------------|-------|-----------|--------------|
| `product_purchased` | Order placed | Buyer | Seller | orderId, productId, totalPrice |
| `friend_request` | Friend invite sent | Sender | Receiver | senderId, senderName |
| `friend_request_accepted` | Friend accepts invite | Accepter | Original sender | accepterId, accepterName |
| `friend_request_rejected` | Friend rejects invite | Rejecter | Original sender | - |
| `seller_request_approved` | Admin approves seller req | Admin | Seller | - |
| `seller_request_rejected` | Admin rejects seller req | Admin | Seller | reason |
| `product_approved` | Admin approves product | Admin | Product creator | productId, productName |
| `product_flagged` | AI validation flags product | AI System | Product creator | productId, reason |
| `product_deleted` | Admin deletes product | Admin | Product creator | productId, productName |
| `order_status_updated` | Order status changes | System | Order owner | orderId, newStatus |
| `seller_request_pending` | Seller request submitted | User | User | (confirmation) |
| `workshop_created` | Workshop created by user | User | User | workshopId, workshopTitle |
| `workshop_approved` | Admin approves workshop | Admin | Workshop creator | workshopId, workshopTitle |
| `workshop_rejected` | Admin rejects workshop | Admin | Workshop creator | workshopId, reason |

## 📊 Improved Notification Model Schema

```javascript
{
  recipientId: ObjectId (User who receives notification),
  type: String (enum of types above),
  
  actor: {
    userId: ObjectId,
    name: String,
    avatar: String (optional)
  },
  
  data: {
    // Type-specific fields, e.g.:
    // product_purchased: { orderId, productId, totalPrice, productName }
    // friend_request: { senderId, senderName }
    // seller_rejected: { reason }
  },
  
  read: Boolean (default: false),
  readAt: Date (null until marked read),
  
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🔌 Socket.io Implementation

### Private Room Usage
- Already implemented: `user:${userId}` private room per connected user
- Perfect for notifications - only user receives their own notifications
- Reuse existing Socket.io setup, add notification handlers

### Socket Events

**Backend → Frontend:**
```javascript
socket.emit('notification:new', {
  id: notificationId,
  type: 'product_purchased',
  actor: { name: 'John Doe' },
  data: { orderId, productName, price },
  createdAt: timestamp
})

socket.emit('notification:read:confirmed', {
  notificationId: id,
  status: 'marked_read'
})
```

**Frontend → Backend:**
```javascript
socket.emit('notification:mark_read', {
  notificationId: id
})

socket.emit('notification:mark_all_read', {})
```

## 🛠️ Implementation Steps

### Step 1: Improve Notification Model
- Add `recipientId` field for querying
- Add `actor` object with userId and name
- Add flexible `data` object for type-specific info
- Add `readAt` timestamp field
- Add `updatedAt` field

### Step 2: Create Socket Handler (`socket/notifications.js`)
- Listen for `notification:mark_read` events
- Update DB when marked read
- Emit confirmation back to client
- Handle batch mark-all-read operations

### Step 3: Create Notification Service (`service/notificationService.js`)
- Function: `createNotification(recipientId, type, actor, data)`
- Saves to DB
- Emits Socket event to recipient's room
- Returns created notification

### Step 4: Integrate with Controllers
- `order.js` → After order creation, call createNotification for seller ✅
- `friendInvite.js` → Friend request sent/accepted/rejected ✅
- `admin.js` → When approving/rejecting seller requests ✅, product approved/deleted ✅
- `account.js` → When seller request submitted ✅
- `product.js` → When product flagged by AI ✅
- `workshop.js` → When workshop created ✅, approved ✅, rejected ✅

### Step 5: Update Notification Controller
- `getNotifications()` - Fetch all notifications for user (paginated)
- `getUnreadCount()` - Count unread notifications
- Add endpoint to get notifications by type

## 🧪 Testing Flow

1. User A sends friend request to User B
   - Backend creates notification for User B
   - Backend emits `notification:new` to `user:B_id` room
   - Frontend receives and displays instantly

2. User B marks notification as read
   - Frontend emits `notification:mark_read`
   - Backend updates DB, emits confirmation
   - Frontend updates UI

3. User B refreshes page
   - Fetches all notifications via REST (including read/unread status)
   - Maintains notification state

4. User B places order
   - Backend creates notification for product seller
   - Seller sees it in real-time if connected
   - If offline, seller fetches on next login

## 🔐 Security & Best Practices

- ✅ Verify user authentication via JWT in Socket.io middleware (already done)
- ✅ Only emit to user's private room (user:userId)
- ✅ Verify recipient matches authenticated user before updating
- ✅ Pagination on getNotifications to avoid loading all history
- ✅ Soft-delete notifications instead of hard delete (optional)
- ✅ Index on `recipientId` and `createdAt` for fast queries

## 📝 Database Indexes Needed

```javascript
// Notification collection indexes:
- { recipientId: 1, createdAt: -1 } // For fetching user's notifications
- { recipientId: 1, read: 1 } // For unread count queries
- { createdAt: -1 } // For admin and analytics
```

## 🎯 Future Enhancements

- Notification preferences (user can mute notification types)
- Email notifications for important events
- Push notifications through service worker
- Notification expiration (auto-delete after 30 days)
- Notification groups (batch similar notifications)
- Notification templates for standardized content
