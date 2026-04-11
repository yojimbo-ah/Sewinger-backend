import express from "express" ;
import mongoose from "mongoose";
import http from "http" ;
import { initSocket } from "./socket.js";
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config() ;

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


const app = express() ;

const server = http.createServer(app) ;
initSocket(server)

app.use(express.json()) ;

// CORS setup with proper options
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000' , 'https://handlyy.tech'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// the routes of the app they are well seperated and you can check evry route
// individually 

app.use('/product' , productRouter) ;
app.use('/account' , accountRouter);
app.use('/cart' , cartRouter) ;
app.use('/order' , orderRouter) ;
app.use('/admin' , adminRouter) ;
app.use('/chat' , chatRouter) ;
app.use('/friend' , friendRouter) ;
app.use('/detail' , detailRouter) ;
app.use('/notification' , notificationRouter) ;
app.use('/seller' , sellerRouter) ;
app.use('/buyer' , buyerRouter) ;
app.use('/workshop' , workshopRouter) ;
app.use('/inquiry' , inquiryRouter) ;

// connect to the database with mongoose
// mongoose by default does the setup of importing iteself 
// to other files inside the import names "moongose"
// no need to create a files like cloudinary.js and socket.js 
mongoose.connect(`mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@cluster0.echqncm.mongodb.net/sewinger?retryWrites=true&w=majority&appName=Cluster0`)
    .then(result => {
        server.listen(process.env.LISTEN_AT || 3000 , () => {
            console.log('conneceted the server')
        }) ;
    })
    .catch(error => {
        console.log(error);
        console.log('cant connect')
    })