import { Server } from 'socket.io';
import { addMessageToChat , addMessageToGroupChat } from './socket/chat.js';
import jwt from 'jsonwebtoken'
import User from './models/User.js';
import dotenv from 'dotenv'


dotenv.config() ;
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ,
      methods: ['GET', 'POST' , 'PUT' , 'PATCH' , 'DELETE'] 
    }
  });
  
  // middleware for verifying the JWT token in chat section (it runs on evry sent) 

  io.use((socket , next) => {
    const token = socket.handshake.auth.token ;
    console.log('token :' + token) ;
    try {
      const verToken = jwt.verify(token , process.env.BCRYPT_CODE) ;
      console.log(verToken.userId) ;
      socket.userId = verToken.userId ;
      next()
    } catch (error) {
      return console.log(error) ;
    }
  })

  io.on('connection', async (socket) => {
    try {

      const userId = socket.userId ;
      const user = await User.findById(userId) ;
      if (!user) {
        throw new Error('Couldnt find user with similair data') ;
      }
      // connecting the user to his private chat so he can get private messages directly to his id
      // and might use it in the future for notification systems and stuff like that since it would be great
      // and it the best and easiest method for real time updating for rest api app
      socket.join(`user:${userId}`)

      // joining every group chat on login so the user can get messages from all the groups he has joined
      // this will make it easier to send messages and i dont need to join when the user access the chat 
      // since the user will be already in the room with all the other active users
      user.groupChats.map(group => {
        socket.join(`chat:${group}`) ;
      })


      // this is for private chats handleling :
      addMessageToChat(io , socket) ;

      //this is for public chats handlelling :
      addMessageToGroupChat(io , socket) ;

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

    } catch (error) {
      console.log(error) ;
    }

  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
