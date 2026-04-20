import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import MessageGroup from "../models/MessageGroup.js" ;
import GroupChat from "../models/GroupChat.js";
import cloudinary from "../cloudinary.js";
import extractPublicId from "../helperFunctions/cloudinaryImageId.js";
import { getIO } from "../socket.js";
import { ObjectId } from "mongodb";
import streamifier from 'streamifier' ;
import { response } from "express";

const getPrivateChat = async (req , res , next) => {
    const userId = req.user.id ;
    const friendId = new ObjectId(req.params.friendId)  ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'There is no user with matching informations'}) ;
        }
        const friend = await User.findById(friendId) ;
        if (!friend) {
            return res.status(400).json({message : 'Couldnt find freind'}) ;
        }

        const chat = await Chat.findOne({
            users: { $all: [user._id, friendId] },
            $expr: { $eq: [{ $size: "$users" }, 2] }
        }).populate("messages");

        // Mark all unread messages as read
        if (chat) {
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

            // Update unread count in participants
            const userParticipant = chat.participants?.find(p => p.userId.toString() === userId);
            if (userParticipant) {
                userParticipant.unreadCount = 0;
            }

            await chat.save();
        }

        // Get unread count for this conversation (should be 0 now, but just in case)
        const unreadCount = await Message.countDocuments({
            reciverId: userId,
            senderId: friendId,
            isRead: false
        });

        // we need both the chat and the friend data in the frontend
        // since we have to show the name and the pfp

        return res.status(200).json({
            chat : chat,
            friend : {
                profileImage : friend.bio.profileImage ,
                name : friend.name
            },
            unreadCount: unreadCount
        });

    } catch (error) {
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const putMessagePrivateChat = async (req , res , next) => {
    console.log(req.body) ;
    const userId = new ObjectId(req.body.userId );
    const friendId = new ObjectId(req.body.friendId) ;
    const message = req.body.message ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Coudlnt find user with similair informations'}) ;
        }
        const chat = await Chat.findOne({users : [userId , friendId]}) ;

        if (!chat) {
            return res.status(400).json({message : 'Couldnt find the chat with this person try again leter'}) ;
        }

        const newMessage = new Message({
            senderId : userId ,
            reciverId : friendId ,
            message : message
        })
        await newMessage.save() ;
        chat.messages.push(newMessage._id)
        await chat.save() ;

        return res.status(200).json({message : 'Message has been added successfully'}) ;
    } catch (error) {
        return response.status(500).json({message : 'Iternal server error'}) ;
    }
}

const createGroupChat = async (req , res , next) => {
    const userId = req.user.id ;
    const friendGroups = req.body.friendGroups ;
    const name = req.body.name ;

    if (friendGroups.length === 0) {
        return res.status(400).json({message : 'Cant create a group without any users , add more'}) ;
    }

    if (name.trim().length === 0) {
        return res.status(400).json({message : 'The name cant be empty'}) ;
    } 
    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }
        const friendsStrings = user.friends.map(friend => {
            return friend.friendId.toString() ;
        })

        const isIncludes = friendGroups.every(friendId => friendsStrings.includes(friendId.toString())) ;
        if (!isIncludes) {
            return res.status(400).json({message : 'You cant create a group with a non friend'}) ;
        }

        const response = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` ,
            {folder : 'group_chat_images' }
        ) ;


        const newGroup = new GroupChat({
            messages : [] ,
            users : [userId , ...friendGroups ] ,
            lastMessageAt: new Date(),
            options : {
                name : name ,
                image : response.secure_url ,
                admin : userId
            }
        })

        user.groupChats.push(newGroup._id) ;

        const friendPromises = friendGroups.map(async (friendId) => {
            const friend = await User.findById(friendId) ;
            if (friend) {
                friend.groupChats.push(newGroup._id) ;
                await friend.save() ;
            }
        })

        await Promise.all(friendPromises) ;
        await user.save() ;
        await newGroup.save() ;
        return res.status(200).json({message : 'Group had been created succefully'}) ;

    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : "iternal server error"}) ;
    }
}

const patchPublicChatDetails = async (req , res , next) => {
    const userId = req.user.id ;
    const chatId = req.body.chatId ;


    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }
        const chat = await GroupChat.findById(chatId) ;
        if (!chat) {
            return res.status(500).json({message : 'Couldnt find chat'}) ;
        }
    } catch (error) {
        console.log(error) ;
        return res.status(400).json({message : 'Iternal server error'}) ;
    }
}

const getPublicGroupChat = async (req , res , next) => {
    const userId = req.user.id ;
    const chatId = req.params.chatId ;


    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }
        const groupChat = await GroupChat.findById({_id : chatId })
        if (!groupChat) {
            return res.status(400).json({message : 'Couldnt find group chat with similair informations'}) ;
        }
        const groupsUserIds = groupChat.users ;

        let includes = false ;
        groupChat.users.forEach(participants => {
            if (participants.toString() === userId) {
                includes = true ;
                return true
            }
        })
        if (!includes) {
            return res.status(400).json({message : 'You are not included in this chat'}) ;
        }
        const groupUserPromises = groupsUserIds.map(async (groupUserId) => {
            const groupUser = await User.findById(groupUserId) ;
            return {
                _id : groupUser._id ,
                name : groupUser.name ,
                profileImage : groupUser.bio.profileImage
            }
        })

        const groupUsers = await Promise.all(groupUserPromises) ;
        console.log(groupUsers) ;

        await groupChat.populate('messages') ;
        console.log(groupChat) ;
        return res.status(200).json({groupChat :  {...groupChat._doc} , groupUsers : groupUsers}) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}

const getUserGroups = async (req , res , next) => {
    const userId = req.user.id ;

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }
        await user.populate('groupChats')
        console.log(user) ;
        const userChats = user.groupChats.map(chat => {
            return {
                chat : chat._id ,
                options : chat.options 
            }
        })

        return res.status(200).json({userChats}) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error'}) ;
    }
}


const addPersonToGroup = async (req , res , next) => {
    const userId = req.body.userId ;
    const friendId = req.body.friendId ;
    const chatId = req.body.chatId ;

    if (req.body.name.trim() === '') {
        return res.status(400).json({message : 'Cant leave the name empty'}) ;
    }

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Cant find user with similair informations'}) ;
        }
        const chat = await GroupChat.findById(chatId) ;

        let includes = false ;
        user.friends.forEach(friend => {
            if (friend.friendId.toString() === friendId) {
                includes = true ;
                return true ;
            }
        })

        if (!includes) {
            return res.status(400).json({message : 'The user that you tried adding to your group is not your friend'}) ;
        }
        const friendObjectId = new ObjectId(friendId) ;
        chat.users.push(friendObjectId) ;
        await chat.save() ;

        return res.status(200).json({message : 'user has been added to toe group chat'}) ;
    } catch (error) {
        return res.status(400).json({message : 'Iternal server error'}) ;
    }
}

const patchGroupDetails = async (req , res , next) => {
    const userId = req.user.id ;
    const chatId = req.body.chatId ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }

        const groupChat = await GroupChat.findById(chatId) ;
        if (groupChat) {
            return res.status(400).json({message : 'Couldnt find chat'}) ;
        }
        if (groupChat.options.admin.toString() !== userId.toString()) {
            return res.status(400).json({message : 'You are not the admin for this chat'}) ;
        }
        if (req.file) {
            // delete the old chat image
            if (groupChat.options.image) {
                const imageId = extractPublicId(groupChat.options.image) ;
                await cloudinary.uploader.destroy(imageId) ;
            }
            const response = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` ,
                {folder : 'group_chat_images'}
            )

            groupChat.options.image = response.secure_url ;            
        }
        groupChat.options.name = req.body.name ;

        await groupChat.save() ;
        return res.status(200).json({message : 'Group chat has been edited'}) ;
    } catch (error) {
        console.log(error) ;
        return res.status(500).json({message : 'Iternal server error' }) ;
    }
}


// this controller is for real time public chat updating just for the images 
// since you cant send images videos or files in general using sockets 
// so we use normal http request but we send the respond using socket from inside the request 
// there exist other approaches but this is great method and it works well with the multer 
// cloudinary api setup
// (same for the uploadImagePrivate)

const uploadImagesPublic = async (req , res , next) => {
    const userId = req.user.id ;
    const chatId = req.body.chatId ;
    const io = getIO() ;
    req.memorystorage = [] ;
    if (req.files.length === 0) {
        return res.status(400).json({message : ''})
    }

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'There is no user with similair informations'}) ;
        }
        const groupChat = await GroupChat.findById(chatId) ;
        if (!groupChat) {
            return res.status(400).json({message : 'There is no group with similair informations'}) ;
        }

        let includes = false ;
        groupChat.users.forEach(user => {
            if (user.toString() === userId) {
                includes = true ;
                return true ;
            }
        })

        if (!includes) {
            return res.status(400).json({message : 'You are not allowed in this chat'}) ;
        }

        const imagesPromise = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}` ,
                {folder : `group_chats/chat_${chatId}`}
            )
            req.memorystorage.push(`group_chats/chat_${chatId}/${extractPublicId(response.secure_url)}`) ;
            return response.secure_url ;
        }) ;

        // the array that contains the images url from cloudinary

        const imagesArray = await Promise.all(imagesPromise) ;


        const imagesMessagesPromises = imagesArray.map(async(imageMessage) => {
            const newMessage = new MessageGroup({
                message : imageMessage ,
                senderId : userId ,
                type : 'image'
            }) ;

            await newMessage.save() ;
            groupChat.messages.push(newMessage._id) ;
            return newMessage._doc ;
        })

        const imagesMessages = await Promise.all(imagesMessagesPromises) ;
        await groupChat.save() ;

        imagesMessages.forEach(message => {
            io.to(`chat:${chatId}`).emit('receive_message_public', message) ;
        })
        
        return res.status(200).json({message : 'Pictures sent successfully'}) ;
    } catch (error) {
        next(error) ;
    }
}

const uploadImagePrivate = async (req , res , next) => {
    console.log('about to save the images') ;
    const userId = req.user.id ;
    const friendId = req.body.friendId ;
    const io = getIO() ;
    req.memorystorage = [] ;
    if (req.files.length === 0) {
        return res.status(400).json({message : 'There is no sent images'}) ;
    }

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'There is no user with similair inforamtions'}) ;
        }
        const chat = await Chat.findOne({
            users: { $all: [user._id, friendId] },
            $expr: { $eq: [{ $size: "$users" }, 2] }
        })

        if (!chat) {
            return res.status(400).json({message : 'There is no chat with similair informations'}) ;
        }

        const imagesPromise = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}` ,
                {folder : `private_chats/chat_${chat._id.toString()}`}
            )
            req.memorystorage.push(`private_chats/chat_${chat._id.toString()}/${extractPublicId(response.secure_url)}`) ;
            return response.secure_url ;
        }) ;

        const imagesArray = await Promise.all(imagesPromise) ;


        const imagesMessagesPromises = imagesArray.map(async(imageMessage) => {
            const newMessage = new Message({
                message : imageMessage ,
                senderId : userId ,
                reciverId : friendId ,
                type : 'image'
            }) ;

            await newMessage.save() ;
            chat.messages.push(newMessage._id) ;
            return newMessage._doc ;
        })

        const imagesMessages = await Promise.all(imagesMessagesPromises) ;
        await chat.save() ;

        imagesMessages.forEach(message => {

            //  here we sent to two rooms since in the private chat the logique of sending
            // messages is diffrent then public , because in public all the users join the same room ,
            // and we just broadcast it to all the users in the room , but in the private ,
            // the user just joins one room with his id , that id all his freinds send messages 
            // to the same room so that why we send two emits one with the userId and one with the friendId
            
            io.to(`user:${userId}`).emit('receive_message', message) ;
            io.to(`user:${friendId}`).emit('receive_message', message) ;
        })

        return res.status(200).json({message : 'Pictures has been sent'}) ;
    } catch (error) {
        next(error) ;
    }
}

// started working on the video handling section 

const uploadVideosPublic = async (req , res , next) => {
    const userId = req.user.id ;
    const chatId = req.body.chatId ;
    const io = getIO() ;
    req.memorystorage = [] ;
    if (req.files.length === 0) {
        return res.status(400).json({message : 'Error happened'}) ;
    }

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find the user'}) ;
        }
        const chat = await GroupChat.findById(chatId) ;
        if (!chat) {
            return res.status(400).json({message : 'Couldnt find chat with similair id'}) ;
        }
        let includes = false ;
        chat.users.forEach(userChatId => {
            if (userChatId.toString() === userId.toString()) {
                includes = true ;
                return true ;
            }
        })
        if (!includes) {
            return res.status(400).json({message : 'You are not allowed into this group chat'}) ;
        }

        const promiseArray = req.files.map(async(file) => {
            const response = await new Promise ((resolve , reject) => {
                const stream = cloudinary.uploader.upload_stream({
                        resource_type : 'video' ,
                        folder : `public_chats/chat_${chat._id.toString()}`
                    } ,
                    (error , result) => {
                        if (error) reject(error) ;
                        if (result) resolve(result)
                    }
                ) ;
                streamifier.createReadStream(file.buffer).pipe(stream) ;

            }) ;
            
            const newMessage = new MessageGroup({
                senderId : userId ,
                type : 'video' ,
                message : response.secure_url
            })
            req.memorystorage.push(`public_chats/chat_${chat._id.toString()}/${extractPublicId(response.secure_url)}`) ;
            await newMessage.save() ;
            chat.messages.push(newMessage._id) ;
            return newMessage._doc ;
        })

        const videosArray = await Promise.all(promiseArray) ;
        await chat.save() ;

        videosArray.forEach(videoMessage => {
            io.to(`chat:${chatId}`).emit('receive_message_public', videoMessage) ;
        })
        // the response would contain are secure_url to save it into our databse later 
        return res.status(200).json({message : 'Videos uploaded succefully'}) ;

    } catch (error) {
        next(error) ;
    }
}

const uploadVideosPrivate = async (req , res , next) => {
    const userId = req.user.id ;
    const friendId = req.body.friendId ;
    const io = getIO() ;
    req.memorystorage = [] ;

    if (req.files.length === 0) {
        return res.status(400).json({message : 'Error happened'}) ;
    }
    try {
        const user = await User.findById(userId) ;
        if(!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }
        const chat = await Chat.findOne({
            users: { $all: [user._id, friendId] },
            $expr: { $eq: [{ $size: "$users" }, 2] }
        })
        if (!chat) {
            return res.status(400).json({message : 'You are not friend with this user'}) ;
        }

        // what happenening here is that cloudinary cant upload the video directly to there servers
        // and the videos are currently saved in the buffer as bytes , so what we need to do is to seperate
        // them into chunks because that what the cloudinary api expect , these chunks would be send on stream
        // and that why we use the stremifier libariry 

        const promiseArray = req.files.map(async(file) => {
            const response = await new Promise ((resolve , reject) => {

                // we create the stream here (still not sending the chunks)
                // (just created the stream)

                const stream = cloudinary.uploader.upload_stream({
                        resource_type : 'video' ,
                        folder : `private_chats/chat_${chat._id.toString()}`
                    } ,
                    (error , result) => {
                        // in case of error happening
                        if (error) reject(error) ;
                        // resolving at the end
                        if (result) resolve(result)
                    }
                ) ;
                // sending the chunks here from out stream and creating them from out buffer
                streamifier.createReadStream(file.buffer).pipe(stream) ;

            }) ;
            //


            const newMessage = new Message({
                senderId : userId ,
                reciverId : friendId ,
                type : 'video' ,
                message : response.secure_url
            }) ;

            // we save the path to the file we want to delete from the database
            req.memorystorage.push(`public_chats/chat_${user._id.toString()}/${extractPublicId(response.secure_url)}`) ;
            await newMessage.save() ;
            chat.messages.push(newMessage._id) ;
            await chat.save() ;
            return newMessage._doc ;
        })


        const videosArray = await Promise.all(promiseArray) ;
        videosArray.forEach(videoMessage => {
            io.to(`user:${userId}`).emit('receive_message', videoMessage) ;
            io.to(`user:${friendId}`).emit('receive_message', videoMessage) ;     
        })
        // the response would contain are secure_url to save it into our databse later 
        return res.status(200).json({message : 'Videos uploaded succefully'}) ;
    } catch (error) {
        
        next(error) ;
    }
}

const getUnreadCount = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const unreadCount = await Message.countDocuments({
            reciverId: userId,
            isRead: false
        });

        console.log('[Backend] getUnreadCount for user', userId, ':', unreadCount);

        return res.status(200).json({ 
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error('Error in getUnreadCount:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getGroupChatUnreadCount = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Get all group chats for this user
        const groupChats = await GroupChat.find({ users: userId });
        
        let totalUnread = 0;
        
        // Count unread messages from all group chats
        for (const chat of groupChats) {
            const unreadCount = await MessageGroup.countDocuments({
                _id: { $in: chat.messages },
                readBy: { $not: { $elemMatch: { userId: userId } } }
            });
            totalUnread += unreadCount;
        }

        console.log('[Backend] getGroupChatUnreadCount for user', userId, ':', totalUnread);

        return res.status(200).json({
            unreadCount: totalUnread
        });
    } catch (error) {
        console.error('Error in getGroupChatUnreadCount:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getGroupChatsWithMetadata = async (req, res, next) => {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Get all group chats for this user
        // Sort by lastMessageAt DESC (newest first), but use createdAt as fallback for groups with no messages
        const groupChats = await GroupChat.find({ users: userId })
            .populate('lastMessage')
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get metadata for each group chat
        const groupChatsWithMetadata = await Promise.all(
            groupChats.map(async (chat) => {
                // Count unread messages for this user
                const unreadCount = await MessageGroup.countDocuments({
                    _id: { $in: chat.messages },
                    readBy: { $not: { $elemMatch: { userId: userId } } }
                });

                const lastMessage = chat.lastMessage;
                
                return {
                    chatId: chat._id,
                    name: chat.options.name,
                    image: chat.options.image,
                    unreadCount: unreadCount,
                    lastMessage: lastMessage ? {
                        senderId: lastMessage.senderId.toString(),
                        content: lastMessage.message,
                        timestamp: lastMessage.createdAt,
                        type: lastMessage.type
                    } : null,
                    lastMessageAt: chat.lastMessageAt,
                    participantCount: chat.users.length
                };
            })
        );

        const totalChats = await GroupChat.countDocuments({ users: userId });
        const totalPages = Math.ceil(totalChats / limit);

        return res.status(200).json({
            total: totalChats,
            data: groupChatsWithMetadata,
            page: page,
            limit: limit,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Error fetching group chats:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const openGroupChatAndMarkRead = async (req, res, next) => {
    const userId = req.user.id;
    const chatId = req.params.chatId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const groupChat = await GroupChat.findById(chatId).populate('messages');
        if (!groupChat) {
            return res.status(400).json({ message: 'Group chat not found' });
        }

        // Check if user is in this chat
        if (!groupChat.users.includes(userId)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Mark all unread messages as read for this user
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

        // Update participant unread count
        const participant = groupChat.participants?.find(p => p.userId.toString() === userId);
        if (participant) {
            participant.unreadCount = 0;
            await groupChat.save();
        }

        // Get unread count (should be 0 now)
        const unreadCount = await MessageGroup.countDocuments({
            _id: { $in: groupChat.messages },
            readBy: { $not: { $elemMatch: { userId: userId } } }
        });

        return res.status(200).json({
            groupChat: groupChat,
            groupUsers: groupChat.users,
            unreadCount: unreadCount
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const chat = {getPrivateChat , putMessagePrivateChat , createGroupChat , getPublicGroupChat 
        , addPersonToGroup , getUserGroups , patchGroupDetails , uploadImagesPublic , uploadImagePrivate 
        , uploadVideosPublic , uploadVideosPrivate , getUnreadCount , getGroupChatUnreadCount,
        getGroupChatsWithMetadata, openGroupChatAndMarkRead
    } ;

export default chat ;