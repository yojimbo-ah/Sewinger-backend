# Chat System - Complete Implementation

## Overview
This document outlines the complete chat system with unread message tracking, sorting by last message, and unified chat counts for both private and public (group) chats.

---

## Features Implemented

### 1. Private Chat System ✅
- **Unread Tracking**: Messages marked as read when user opens conversation
- **Last Message Display**: Shows last message preview with timestamp and sender
- **Auto-Sorting**: Conversations sorted by `lastMessageAt` (most recent first)
- **Unread Badge**: Red badge showing unread count per conversation
- **Real-time Updates**: Socket.io events for read receipts

**Database Models:**
- `Message`: Added `isRead: Boolean`, `readAt: Date`
- `Chat`: Added `lastMessage: ObjectId`, `lastMessageAt: Date`, `participants: [{ userId, unreadCount }]`

**API Endpoints:**
- `GET /chat/private/:friendId` - Fetch private chat, auto-mark as read
- `GET /friend` - Get friends with unread counts, last messages, sorted
- `GET /chat/unread-count` - Get total unread messages across all chats

**Socket Events:**
- `chat:mark-as-read` - Mark messages as read (with debounce to prevent loops)
- `chat:messages-read` - Notify friend messages were read

---

### 2. Group Chat System (Public Chats) 🟡 IN PROGRESS

#### What Needs to Be Done:

**Backend:**

1. **Update GroupChat Model** (`models/GroupChat.js`)
   - Add `lastMessage: ObjectId` (ref to MessageGroup)
   - Add `lastMessageAt: Date`
   - Add `participants: [{ userId, unreadCount }]`

2. **Update MessageGroup Model** (`models/MessageGroup.js`)
   - Add `isRead: Boolean, default: false`
   - Add `readBy: [{ userId, readAt: Date }]` (track which users read it)

3. **Create Endpoint: GET /chat/public/unread-count**
   - Returns total unread messages from ALL group chats
   - Query all groups user is in
   - Sum unread messages

4. **Modify GET /chat/public** (Get all group chats)
   - Include `unreadCount` for each group
   - Include `lastMessage` object (content, sender, timestamp)
   - Sort by `lastMessageAt` DESC (most recent first)
   - Include total unread across all groups

5. **Modify GET /chat/public/:chatId** (Open specific group chat)
   - Mark all unread messages as read for current user
   - Update `participants.unreadCount` to 0
   - Return chat data with read status

6. **Add Socket Handler: group:mark-as-read**
   - When user opens group chat
   - Mark all messages as read for that user
   - Broadcast read receipt to group

**Frontend:**

1. **Update UserChat Component** (for group chats list)
   - Show unread badge for each group
   - Show last message preview
   - Show last message timestamp
   - Show sender name ("John: Hello" vs "You: Hello")
   - Highlight if unread

2. **Update Chat Header Badge**
   - Show TOTAL unread count
   - Combine private chat unread + group chat unread
   - Single badge on Chat button in header
   - Updates real-time

3. **Update Chat Component**
   - Load both private friends AND group chats
   - Fetch group chats from `GET /chat/public`
   - Merge both lists, sort by lastMessageAt
   - Emit mark-as-read when opening either type

4. **Update Socket Listeners**
   - Listen for group chat read receipts
   - Update UI when others read messages in group

---

## File Structure

### Backend Files to Modify/Create:
```
sewinger-backend/
├── models/
│   ├── Chat.js ✅ (Updated)
│   ├── Message.js ✅ (Updated)
│   ├── GroupChat.js 🟡 (Needs update)
│   └── MessageGroup.js 🟡 (Needs update)
├── controllers/
│   └── chat.js 🟡 (Needs new endpoints)
├── routes/
│   └── chat.js 🟡 (Needs new routes)
└── socket/
    └── chat.js 🟡 (Needs group handler)
```

### Frontend Files to Modify/Create:
```
tailwind-learning/src/
├── components/
│   └── chat/
│       ├── Chat.jsx 🟡 (Add group chats)
│       └── FriendsSideBar.jsx ✅ (Updated)
├── UI/
│   └── Header.jsx ✅ (Chat button badge added)
└── utils/
    └── chathttp.js 🟡 (Add group chat functions)
```

---

## Implementation Steps (In Order)

### Phase 1: Backend Models
1. [ ] Update `GroupChat` model with lastMessage, lastMessageAt, participants
2. [ ] Update `MessageGroup` model with isRead, readBy tracking

### Phase 2: Backend Endpoints
3. [ ] Create `GET /chat/public/unread-count` endpoint
4. [ ] Modify `GET /chat/public` to include unread + lastMessage + sorting
5. [ ] Modify `GET /chat/public/:chatId` to mark messages as read

### Phase 3: Backend Socket
6. [ ] Add `group:mark-as-read` socket handler with debouncing

### Phase 4: Frontend HTTP Utils
7. [ ] Add `getGroupChatsQuery()` function
8. [ ] Add `getGroupChatUnreadCount()` function

### Phase 5: Frontend Components
9. [ ] Create/Update group chat display component
10. [ ] Merge private + group chats in Chat component
11. [ ] Update Chat header badge for combined unread count
12. [ ] Update Chat component to handle both types

### Phase 6: Frontend Socket Integration
13. [ ] Listen for group read receipts
14. [ ] Update UI in real-time

---

## Data Structure Examples

### Private Chat (Already Done)
```javascript
{
  friendId: "user_id",
  name: { firstName: "John", lastName: "Doe" },
  profileImage: "url",
  unreadCount: 3,
  lastMessage: {
    senderId: "user_id",
    content: "Hello there!",
    timestamp: "2026-04-18T10:30:00Z",
    isRead: false
  },
  lastMessageAt: "2026-04-18T10:30:00Z"
}
```

### Group Chat (To be implemented)
```javascript
{
  chatId: "group_id",
  name: "Project Team",
  image: "url",
  unreadCount: 5,
  lastMessage: {
    senderId: "user_id",
    senderName: "John",
    content: "Ready for the meeting?",
    timestamp: "2026-04-18T10:35:00Z",
    isRead: false
  },
  lastMessageAt: "2026-04-18T10:35:00Z",
  participantCount: 4
}
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/chat/unread-count` | Total unread (private only) | ✅ |
| GET | `/chat/public/unread-count` | Total unread (groups only) | 🟡 TODO |
| GET | `/chat/private/:friendId` | Open private chat | ✅ |
| GET | `/chat/public/:chatId` | Open group chat + mark read | 🟡 TODO |
| GET | `/chat/public` | List all groups with metadata | 🟡 TODO |
| GET | `/friend` | List all friends with metadata | ✅ |

---

## Socket Events

### Private Chat (Already Done)
- `chat:mark-as-read` → Mark private messages as read
- `chat:messages-read` ← Get read receipt

### Group Chat (To be implemented)
- `group:mark-as-read` → Mark group messages as read
- `group:messages-read` ← Get read receipts
- `group:new-message` ← Receive new messages in group

---

## Frontend Components

### Chat Page Flow
1. Load friends list with unread counts ✅
2. Load group chats list (NEW)
3. Merge and sort by lastMessageAt
4. Display combined chat list
5. Emit mark-as-read when opening any chat
6. Update badge on Header

### Header Badge Logic
```javascript
totalUnread = privateChatsUnread + groupChatsUnread

Badge shows:
- Number if > 0
- "9+" if > 9
- Nothing if 0
```

---

## Real-time Updates

### When Message Arrives:
1. Socket emits `receive_message` or `receive_message_public`
2. Update lastMessage for that chat
3. Increment unreadCount if not viewing that chat
4. Re-sort chats list
5. Update Header badge

### When User Opens Chat:
1. Emit `chat:mark-as-read` (private) or `group:mark-as-read` (group)
2. Backend marks messages as read
3. Frontend clears unreadCount for that chat
4. Update Header badge
5. Notify other user with read receipt

---

## Testing Checklist

### Private Chats
- [ ] Unread badge appears on new message
- [ ] Message marked as read when opening chat
- [ ] Badge disappears after opening
- [ ] Conversations sorted by most recent
- [ ] Header badge shows correct count
- [ ] Works with multiple conversations

### Group Chats
- [ ] Unread badge appears on new group message
- [ ] Message marked as read when opening group
- [ ] Badge disappears after opening
- [ ] Group chats sorted by most recent
- [ ] Header badge includes group unread
- [ ] Works with multiple groups

### Combined
- [ ] Header badge shows private + group total
- [ ] Private and group chats sorted together
- [ ] All real-time updates work
- [ ] No infinite loops
- [ ] Performance acceptable with many chats

---

## Performance Considerations

- **Debouncing**: Prevent duplicate mark-as-read processing (5s window)
- **Query Optimization**: Index on `(reciverId, isRead)` for fast unread counts
- **Caching**: Frontend caches chat list for 30 seconds
- **Pagination**: Load 50 chats max initially

---

## Database Indexes Needed

```javascript
// Message model
db.messages.createIndex({ reciverId: 1, isRead: 1 })
db.messages.createIndex({ senderId: 1, reciverId: 1 })

// MessageGroup model  
db.messagegroups.createIndex({ senderId: 1, createdAt: -1 })

// Chat model
db.chats.createIndex({ users: 1, lastMessageAt: -1 })

// GroupChat model
db.groupchats.createIndex({ users: 1, lastMessageAt: -1 })
```

---

## Known Limitations & Future Improvements

### Current Limitations:
- Read receipts don't show timestamp (can add later)
- No "typing..." indicator (future feature)
- No message search (future feature)
- No chat pinning (future feature)

### Future Enhancements:
- Archive conversations
- Mute notifications for specific chats
- Message reactions
- File sharing in group chats
- Video/audio calls

---

## Created Date: April 18, 2026
**Status**: In Progress (50% complete)
**Completed**: Private chat system
**Remaining**: Group chat system implementation
