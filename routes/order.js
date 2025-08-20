import express from 'express' ;
import order from '../controllers/order.js';
import { verifyJWT } from '../middleware/verifyJWT.js';
const orderRouter = express.Router() ;

orderRouter.put('/create' , verifyJWT , order.putOrder) ;
orderRouter.get('/' , verifyJWT , order.getOrders ) ;


export default orderRouter ;