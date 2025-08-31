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
      origin: 'http://localhost:5173',
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
      console.log('New client connected:', socket.id);
      const user = await User.findById(userId) ;
      socket.join(`user:${userId}`)

      user.groupChats.map(group => {
        socket.join(`chat:${group}`) ;
        console.log('joined chat : ' + group) ;
      })

      console.log(userId + ' has joined his room') ;

      // this is for private chats :
      addMessageToChat(io , socket) ;

      //this is for public chats :
      addMessageToGroupChat(io , socket) ;

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

    } catch (error) {

    }

  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
