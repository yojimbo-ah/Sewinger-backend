import { Server } from 'socket.io';
import { addMessageToChat , addMessageToGroupChat, handleMarkAsRead, handleMarkAsReadGroup } from './socket/chat.js';
import { handleNotifications } from './socket/notifications.js';
import jwt from 'jsonwebtoken'
import User from './models/User.js';
import dotenv from 'dotenv'

// simillary to cloudinry the socket.io packages by default needs to be
// setup in the app.js (the entry point of the app) by if we did all the
// setup there that will cause loop import (means that package to be imported and
// and exported back to the same file that might cause problems) / to fix this 
// problem we create an intermediate file and we import a function that 
// would be called in the app.js file and the publisher functions will be 
// called in the controllers that need them

dotenv.config() ;
let io;
let activeUsers = new Set(); // Track unique user IDs instead of connection count

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // process.env.FRONTEND_URL
      origin:  process.env.FRONTEND_URL  ,
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

      // Add user to active users set
      activeUsers.add(userId);
      console.log('User connected. Active users:', activeUsers.size, 'User ID:', userId);

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

      // this is for marking messages as read
      handleMarkAsRead(io, socket);

      // this is for marking group messages as read
      handleMarkAsReadGroup(io, socket);

      // this is for notifications handling (real-time mark as read, delete, etc)
      handleNotifications(io, socket);

      // Broadcast active users count on connection only the adnins listen for this in the frontend
      io.emit('activeUsers', activeUsers.size);

      // might add more methods in the future // 
      socket.on('disconnect', () => {
        // Check if user has other active sockets
        const userSockets = io.sockets.sockets;
        let hasOtherConnections = false;
        
        for (let sock of userSockets.values()) {
          if (sock.userId === userId && sock.id !== socket.id) {
            hasOtherConnections = true;
            break;
          }
        }
        
        // Only remove user if they have no other connections
        if (!hasOtherConnections) {
          activeUsers.delete(userId);
        }
        
        console.log('Client disconnected:', socket.id, 'Active users:', activeUsers.size);
        // Broadcast updated active users count on disconnect
        io.emit('activeUsers', activeUsers.size);
      });

    } catch (error) {
      console.log(error) ;
    }

  });

  // Broadcast active users count periodically (every 30 seconds) so doesnt cause a lot of load on the backend server
  setInterval(() => {
    io.emit('activeUsers', activeUsers.size);
  }, 30000);

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
