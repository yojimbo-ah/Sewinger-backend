import { Server } from 'socket.io';
import { addMessageToChat } from './socket/chat.js';
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST' , 'PUT' , 'PATCH' , 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    addMessageToChat(io , socket) ;

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

/*
    socket.on('send_message' , (data) => {
      console.log(data) ;
      socket.broadcast.emit('receive_message' , data) ;
    })
  */