import express from 'express' ;
import { verifyJWT } from '../middleware/verifyJWT.js'
import products from '../controllers/product.js';
import { upload } from '../middleware/upload.js';
import { cloudinaryErrorHandler } from '../controllers/errorHandlers.js';
import { productCreationLimiter } from '../middleware/rateLimiters.js';
const productRouter = express.Router() ;

const IMAGES_COUNT = 4 ;

productRouter.post('/create' , verifyJWT , productCreationLimiter , upload.array("images", IMAGES_COUNT) ,
    products.PostProduct , cloudinaryErrorHandler) ;
productRouter.get('/normal' , products.getProducts);
productRouter.get('/user/:valid' , verifyJWT , products.getUserProducts) ;
productRouter.patch('/edit/:productId' , verifyJWT , upload.array("images" , IMAGES_COUNT) ,
    products.updateUserProduct , cloudinaryErrorHandler) ;
productRouter.delete('/delete/:productId' , verifyJWT , products.productDelete) ;
productRouter.get('/details/:productId' , products.getProductDetails) ;
productRouter.post('/review/:productId' , verifyJWT , products.putComment) ;
productRouter.patch('/review/:productId' , verifyJWT , products.updateComment) ;
productRouter.delete('/review/:productId' , verifyJWT , products.deleteComment) ;


export default productRouter ;