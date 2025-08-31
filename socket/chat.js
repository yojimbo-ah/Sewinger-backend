import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import MessageGroup from "../models/MessageGroup.js";
import GroupChat from "../models/GroupChat.js";


const addMessageToChat = (io , socket) => {
    socket.on('send_message' , async (data) => {
        const userId = socket.userId ;
        const friendId = data.friendId ;
        const message = data.message ;

        try {
            const newMessage = new Message({
                senderId : userId ,
                reciverId : friendId ,
                message : message
            })
            io.to(`user:${friendId}`).emit('receive_message', newMessage._doc)

            const chat = await Chat.findOne({
                users: { $all: [userId, friendId] },
                $expr: { $eq: [{ $size: "$users" }, 2] }
            })

            if (!chat) {
                console.log('Couldnt find chat') ;
            }

            await newMessage.save() ;
            chat.messages.push(newMessage._id)
            await chat.save() ;
        } catch (error) {
           console.log(error) ;
        }
    })
}

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
            await chat.save() ;
        } catch (error) {
            console.log(error) ;
        }
    })
}

export {addMessageToChat , addMessageToGroupChat} ;