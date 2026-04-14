import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './socket.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_NAME', 'MONGO_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
initSocket(server);

// Connect to MongoDB and start the server
const connectDBAndStartServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.echqncm.mongodb.net/sewinger?retryWrites=true&w=majority&appName=Cluster0`
    );
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Connected to MongoDB and server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Start the application
connectDBAndStartServer().catch(error => {
  
  console.error('Fatal error starting application:', error);
  process.exit(1);
});

export { server, app };
