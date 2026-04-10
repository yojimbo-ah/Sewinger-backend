import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import MessageGroup from "../models/MessageGroup.js";
import GroupChat from "../models/GroupChat.js" ;



const addMessageToChat = (io , socket) => {
    // on send_messages would work as listener it will listen for calls
    // from the fronted server
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
            // this section here will emit the newMessage that we created
            // 
            io.to(`user:${friendId}`).emit('receive_message', newMessage._doc)
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
            await chat.save() ;
        } catch (error) {
            console.log(error) ;
        }
    })
}

export {addMessageToChat , addMessageToGroupChat} ;