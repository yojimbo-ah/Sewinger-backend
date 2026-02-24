import express from 'express' ;
import { verifyJWT } from '../middleware/verifyJWT.js'
import products from '../controllers/product.js';
import { upload } from '../middleware/upload.js';

const productRouter = express.Router() ;

const IMAGES_COUNT = 4 ;

productRouter.post('/create' , verifyJWT , upload.array("images", IMAGES_COUNT) , products.PostProduct ) ;
productRouter.get('/normal' , products.getProducts);
productRouter.get('/user/:valid' , verifyJWT , products.getUserProducts) ;
productRouter.patch('/edit/:productId' , verifyJWT , upload.array("images" , IMAGES_COUNT) , products.updateUserProduct) ;
productRouter.delete('/delete/:productId' , verifyJWT , products.productDelete) ;
productRouter.get('/details/:productId' , products.getProductDetails) ;
productRouter.put('/details/cooment/:productId' , products.putComment) ;


export default productRouter ;