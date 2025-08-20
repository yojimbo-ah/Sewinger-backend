import express from 'express' ;
import { verifyJWT } from '../middleware/verifyJWT.js'
import products from '../controllers/product.js';
import { upload } from '../middleware/upload.js';

const productRouter = express.Router() ;

productRouter.post('/create' , verifyJWT , upload.array("images", 4) , products.PostProduct ) ;
productRouter.get('/normal' , products.getProducts);
productRouter.get('/user/:valid' , verifyJWT , products.getUserProducts) ;
productRouter.patch('/edit/:productId' , verifyJWT , upload.array("images" , 4) , products.updateUserProduct) ;
productRouter.delete('/delete/:productId' , verifyJWT , products.productDelete) ;
productRouter.get('/details/:productId' , products.getProductDetails) ;


export default productRouter ;