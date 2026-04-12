import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './socket.js';

dotenv.config();

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
initSocket(server);

// Connect to MongoDB and start the server
const connectDBAndStartServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.echqncm.mongodb.net/sewinger?retryWrites=true&w=majority&appName=Cluster0`
    );
    
    const PORT = process.env.LISTEN_AT || 3000;
    server.listen(PORT, () => {
      console.log(`Connected to MongoDB and server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Start the application
connectDBAndStartServer();

export { server, app };
