import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

const addMessageToChat = (io , socket) => {
    socket.on('send_message' , async (data) => {
        const userId = data.userId ;
        const friendId = data.friendId ;
        const message = data.message ;
        console.log(message) ;
        console.log(userId) ;
        console.log(friendId) ;

        try {
            const newMessage = new Message({
                senderId : userId ,
                reciverId : friendId ,
                message : message
            })
            console.log(newMessage) ;
            socket.broadcast.emit('receive_message' , newMessage._doc )

            const chat = await Chat.findOne({
                users: { $all: [userId, friendId] },
                type: "private",
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

export {addMessageToChat}