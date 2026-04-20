import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import MessageGroup from "../models/MessageGroup.js";
import GroupChat from "../models/GroupChat.js" ;

// Track recently processed mark-as-read events to prevent duplicates
const recentlyProcessed = new Map(); // { "userId:friendId": timestamp }
const DEBOUNCE_TIME = 5000; // 5 seconds - don't process same pair twice within this time
const CLEANUP_INTERVAL = 60000; // Clean up old entries every 60 seconds

// Periodically clean up old entries to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentlyProcessed.entries()) {
        if (now - timestamp > DEBOUNCE_TIME * 2) {
            recentlyProcessed.delete(key);
        }
    }
}, CLEANUP_INTERVAL);



const addMessageToChat = (io , socket) => {
    // on send_messages would work as listener it will listen for calls
    // from the fronted server
    socket.on('send_message' , async (data) => {
        const userId = socket.userId ;
        const friendId = data.friendId ;
        const message = data.message ;

        console.log('[Backend Socket] send_message received')
        console.log('[Backend Socket] From:', userId, 'To:', friendId)
        console.log('[Backend Socket] Message:', message)

        try {
            const newMessage = new Message({
                senderId : userId ,
                reciverId : friendId ,
                message : message
            })
            
            console.log('[Backend Socket] ✅ New message created:', newMessage._id)
            console.log('[Backend Socket] 🔊 Emitting to room: user:' + friendId)
            
            // this section here will emit the newMessage that we created
            io.to(`user:${friendId}`).emit('receive_message', newMessage._doc)
            console.log('[Backend Socket] ✅ Event emitted to user:' + friendId)
            
            // we dont wait to save the message then we publish , we publish
            // back then we save since we dont want to wait the database response
            // because it might take a lot of time to response (yes it may cause error)
            // the message is show for both the users in there browser but the message doesnt 
            // get saved in the database but it is extremly unlikely to happen
            const chat = await Chat.findOne({
                users: { $all: [userId, friendId] } ,
                $expr: { $eq: [{ $size: "$users" }, 2] }
            })

            if (!chat) {
                console.log('[Backend Socket] ⚠️ Couldnt find chat') ;
            }

            await newMessage.save() ;
            chat.messages.push(newMessage._id)
            chat.lastMessage = newMessage._id
            chat.lastMessageAt = new Date()
            await chat.save() ;
            console.log('[Backend Socket] ✅ Message saved to database')
        } catch (error) {
           console.log('[Backend Socket] ❌ ERROR:', error) ;
        }
    })
}

// it works similarly for the groupChat function but the only diffrence 
// is in place of private room joined by only the user and it has 
// refrence to the user id , we use the group chat , wish will be joined
// by the users when they login into there accounts in the client side

const addMessageToGroupChat = (io , socket) => {
    socket.on('send_message_public' , async (data) => {
        const userId = socket.userId ;
        const chatId = data.chatId ;
        const message = data.message ;

        try {
            const newMessage = new MessageGroup({
                message : message ,
                senderId : userId ,
            })

            io.to(`chat:${chatId}`).emit('receive_message_public', newMessage._doc)

            const chat = await GroupChat.findById(chatId) ;
            if (!chat) {
                console.log('Error happened') ;
            }
            await newMessage.save() ;
            chat.messages.push(newMessage._id) ;
            chat.lastMessage = newMessage._id
            chat.lastMessageAt = new Date()
            await chat.save() ;
        } catch (error) {
            console.log(error) ;
        }
    })
}

const handleMarkAsRead = (io, socket) => {
    socket.on('chat:mark-as-read', async (data) => {
        const userId = socket.userId;
        const friendId = data?.friendId;

        // Validate that we have both userId and friendId
        if (!userId || !friendId) {
            return;
        }

        // Create a key for this user-friend pair
        const key = `${userId}:${friendId}`;
        const now = Date.now();
        const lastProcessed = recentlyProcessed.get(key);

        // If we've processed this pair recently, skip it
        if (lastProcessed && (now - lastProcessed) < DEBOUNCE_TIME) {
            return;
        }

        // Update the last processed time
        recentlyProcessed.set(key, now);

        try {
            // Mark messages as read in the database
            await Message.updateMany(
                {
                    reciverId: userId,
                    senderId: friendId,
                    isRead: false
                },
                {
                    isRead: true,
                    readAt: new Date()
                }
            );

            // Notify the friend that messages have been read
            io.to(`user:${friendId}`).emit('chat:messages-read', {
                readBy: userId,
                friendId: friendId,
                readAt: new Date()
            });
        } catch (error) {
            console.error('Error marking private messages as read:', error);
        }
    });
}

const handleMarkAsReadGroup = (io, socket) => {
    socket.on('group:mark-as-read', async (data) => {
        const userId = socket.userId;
        const chatId = data?.chatId;

        // Validate that we have both userId and chatId
        if (!userId || !chatId) {
            return;
        }

        // Create a key for this user-chat pair
        const key = `${userId}:${chatId}`;
        const now = Date.now();
        const lastProcessed = recentlyProcessed.get(key);

        // If we've processed this pair recently, skip it
        if (lastProcessed && (now - lastProcessed) < DEBOUNCE_TIME) {
            return;
        }

        // Update the last processed time
        recentlyProcessed.set(key, now);

        try {
            // Get the group chat to find its messages
            const groupChat = await GroupChat.findById(chatId);
            if (!groupChat) {
                return;
            }

            // Mark all unread messages in this group chat as read for this user
            await MessageGroup.updateMany(
                {
                    _id: { $in: groupChat.messages },
                    readBy: { $not: { $elemMatch: { userId: userId } } }
                },
                {
                    $push: {
                        readBy: {
                            userId: userId,
                            readAt: new Date()
                        }
                    }
                }
            );

            // Update participant unreadCount in GroupChat
            const participant = groupChat.participants?.find(p => p.userId.toString() === userId);
            if (participant) {
                participant.unreadCount = 0;
                await groupChat.save();
            }

            // Notify all users in the group that messages have been read
            io.to(`chat:${chatId}`).emit('group:messages-read', {
                readBy: userId,
                chatId: chatId,
                readAt: new Date()
            });
        } catch (error) {
            console.error('Error marking group messages as read:', error);
        }
    });
}

export {addMessageToChat , addMessageToGroupChat, handleMarkAsRead, handleMarkAsReadGroup} ;