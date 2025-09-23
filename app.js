import express from "express" ;
import path from 'path' ;
import { fileURLToPath } from 'url';
import { dirname} from 'path';
import mongoose from "mongoose";
import http from "http" ;
import { initSocket } from "./socket.js";
import dotenv from 'dotenv'

dotenv.config() ;

// all the data is handled by external cloud storage 
// cloudinary for files (for now just pictures , in the future vids) 
// mongodb handles the json storage format 

// routes 
import accountRouter from "./routes/account.js";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/order.js";
import adminRouter from "./routes/admin.js";
import chatRouter from "./routes/chat.js";
import friendRouter from "./routes/friend.js";
import detailRouter from "./routes/detailManagement.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express() ;

const server = http.createServer(app) ;
initSocket(server)

app.use(express.json()) ;



// CORS setup 
app.use((req , res , next) => {
    res.setHeader('Access-Control-Allow-Origin' , '*')
    res.setHeader('Access-Control-Allow-Methods' , 'GET,POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers' , 'Content-Type , Authorization')
    next()
})

app.use('/product' , productRouter) ;
app.use('/account' , accountRouter);
app.use('/cart' , cartRouter) ;
app.use('/order' , orderRouter) ;
app.use('/admin' , adminRouter) ;
app.use('/chat' , chatRouter) ;
app.use('/friend' , friendRouter) ;
app.use('/detail' , detailRouter) ;


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