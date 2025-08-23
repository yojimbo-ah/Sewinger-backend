import express from "express";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname} from 'path';
import mongoose from "mongoose";

// routes 
import accountRouter from "./routes/account.js";
import productRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import orderRouter from "./routes/order.js";
import adminRouter from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express() ;

app.use(express.json()) ;
app.use('/images', express.static(path.join(__dirname, 'images')));
// CORS
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



mongoose.connect('mongodb+srv://abbadahmed:kKAls1NszXsiKXVR@cluster0.echqncm.mongodb.net/sewinger?retryWrites=true&w=majority&appName=Cluster0')
    .then(result => {
        console.log('connected to the dataBase') ;
        app.listen(3000) ;
    })
    .catch(error => {
        console.log(error);
        console.log('cant connect')
    })