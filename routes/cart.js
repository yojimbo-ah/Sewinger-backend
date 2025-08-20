import express from 'express' ;
import {cart} from '../controllers/cart.js' ;
import { verifyJWT } from '../middleware/verifyJWT.js';
const cartRouter = express.Router() ;

cartRouter.put('/buy/:productId' , verifyJWT ,cart.buyProduct) ;
cartRouter.delete('/delete/:productId', verifyJWT , cart.deleteProductFromCart) ;
cartRouter.delete('/delete' , verifyJWT , cart.deleteCart) ;
cartRouter.patch('/update/:productId' , verifyJWT , cart.updateItemQuantity) ;
cartRouter.get('/' , verifyJWT , cart.getCart) ;

export default cartRouter ;