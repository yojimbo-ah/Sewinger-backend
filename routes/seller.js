import express from 'express' ;
import seller from '../controllers/seller.js'; 
import { verifyJWT } from '../middleware/verifyJWT.js'

const sellerRouter = express.Router() ;

sellerRouter.get('/analytics/:productId', verifyJWT, seller.getProductAnalytics);
sellerRouter.get('/:productId' , verifyJWT , seller.getUsersWhoBoughtMyProduct) ;
sellerRouter.get('/details/:buyerId/:productId' , verifyJWT , seller.getUserWhoBoughtMyProduct) ;

export default sellerRouter ;