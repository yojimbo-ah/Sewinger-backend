import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import { ObjectId } from "mongodb";

const getPrivateChat = async (req , res , next) => {
    const userId = req.body.userId ;
    const friendId = new ObjectId(req.body.friendId)  ;

    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'There is no user with matching informations'}) ;
        }

        const chat = await Chat.findOne({users : [userId , friendId] , type : 'private'}).populate('messages') ;

        return res.status(200).json({chat : chat}) ;

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
        const chat = await Chat.findOne({users : [userId , friendId] , type : 'private'}) ;

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
    const userId = req.body.userId ;
    const friendGroups = req.body.friendsId ;

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

        const newGroup = new Chat({
            type : 'group' ,
            messages : [] ,
            users : [user._id , friendGroups.map(friend => {
                return new ObjectId(friend) ;
            }) ]
        })

        await newGroup.save() ;
        return res.status(200).json({message : 'Group had been created succefully'}) ;

    } catch (error) {
        return res.status(500).json({message : "iternal server error"}) ;
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
        const chat = await Chat.findById(chatId) ;

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

const chat = {getPrivateChat , putMessagePrivateChat , createGroupChat , addPersonToGroup} ;

export default chat ;