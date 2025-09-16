import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import MessageGroup from "../models/MessageGroup.js" ;
import GroupChat from "../models/GroupChat.js";
import { ObjectId } from "mongodb";
import cloudinary from "../cloudinary.js";

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

        // we need both the chat and the friend data in the frontend
        // since we have to show the name and the pfp

        return res.status(200).json({chat : chat , friend : {
            profileImage : friend.bio.profileImage ,
            name : friend.name
        }});

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
    console.log(req.body) ;
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
            options : {
                name : name ,
                image : response.secure_url 
            }
        })

        user.groupChats.push(newGroup._id) ;

        friendGroups.forEach(async (friendId) => {
            const friend = await User.findById(friendId) ;
            friend.groupChats.push(newGroup._id) ;
            await friend.save()
        })

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

    console.log(chatId) ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user with similair informations'}) ;
        }
        const groupChat = await GroupChat.findById({_id : chatId })
        if (!groupChat) {
            return res.status(400).json({message : 'Couldnt find group chat with similair informations'}) ;
        }

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

        await groupChat.populate('messages') ;
        console.log(groupChat) ;
        return res.status(200).json({...groupChat._doc}) ;
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



const chat = {getPrivateChat , putMessagePrivateChat , createGroupChat , getPublicGroupChat 
                , addPersonToGroup , getUserGroups } ;

export default chat ;