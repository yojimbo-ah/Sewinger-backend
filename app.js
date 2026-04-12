import express from "express" ;
import cors from 'cors'
// app works like import for other files (index.js and setup.js)
// why do like this so we dont have looped imported might cause problems
// in runtime (not interpreting time)

// all the data is handled by external cloud storage 
// cloudinary for files (for now just pictures , in the future vids) 
// mongodb cloud storage (api handles the storage format)
// they work together so evrything would be hosted in the cloud storage 

// routes 
import accountRouter from "./routes/account.js";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/order.js";
import adminRouter from "./routes/admin.js";
import chatRouter from "./routes/chat.js";
import friendRouter from "./routes/friend.js";
import detailRouter from "./routes/detailManagement.js";
import notificationRouter from "./routes/notification.js";
import sellerRouter from "./routes/seller.js";
import workshopRouter from "./routes/workshop.js";
import inquiryRouter from "./routes/inquiry.js";
import buyerRouter from "./routes/buyer.js";

// Create and configure the Express app
export const createApp = () => {
  const app = express();

  app.use(express.json());

  // CORS setup with proper options
  const corsOptions = {
    origin: function (origin, callback) {
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://handlyy.tech', 'http://localhost:5000'];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
    preflightContinue: false
  };

  app.use(cors(corsOptions));

  // the routes of the app they are well seperated and you can check evry route
  // individually 
  app.use('/product', productRouter);
  app.use('/account', accountRouter);
  app.use('/cart', cartRouter);
  app.use('/order', orderRouter);
  app.use('/admin', adminRouter);
  app.use('/chat', chatRouter);
  app.use('/friend', friendRouter);
  app.use('/detail', detailRouter);
  app.use('/notification', notificationRouter);
  app.use('/seller', sellerRouter);
  app.use('/buyer', buyerRouter);
  app.use('/workshop', workshopRouter);
  app.use('/inquiry', inquiryRouter);

  return app;
};

export default createApp();