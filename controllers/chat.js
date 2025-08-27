import User from "../models/User.js";
import Chat from "../models/GroupChat.js";

const getChat = async (req , res , next) => {
    const userId = req.user.id ;
    const chatId = req.body.chatId ;


    try {
        const user = await User.findById(userId) ;
        if (!user) {
            return res.status(400).json({message : 'Couldnt find user'}) ;
        }

        const chat = Chat.findById(chatId) ;
        if (!chat) {
            return res.status(400).json({message : 'Couldnt get chat try again later'}) ;
        }
        if (chat.type === 'private') {
            chat.populate('users') ;
            console.log(chat) ;
        }

    } catch (error) {

    }
}

const chat = {} ;

export default chat ;